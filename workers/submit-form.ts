/**
 * Unified Form Submission API
 * 
 * Handles form submissions for all Happysagents events.
 * Routes:
 *   POST /api/submit-form       → Submit a form (event param in body)
 *   GET  /api/submit-form       → Get event info/config
 *   OPTIONS /api/submit-form    → CORS preflight
 * 
 * Database: happysagents-forms (D1)
 * Tables: form_submissions, events, submission_attempts
 */

// Cloudflare Workers D1 Database type
type D1Database = {
  prepare(query: string): D1PreparedStatement;
  exec(query: string): Promise<D1ExecResult>;
};

type D1PreparedStatement = {
  bind(...values: unknown[]): D1PreparedStatement;
  first<T>(): Promise<T | null>;
  run(): Promise<D1Result>;
  all<T>(): Promise<{ results?: T[] }>;
};

type D1Result = {
  meta: {
    last_row_id: number;
    changes: number;
  };
};

type D1ExecResult = {
  count: number;
  duration: number;
};

interface Env {
  ASSETS: { fetch: (req: Request) => Promise<Response> };
  happysagents_forms: D1Database;
}

interface FormSubmission {
  event_id: string;
  email: string;
  name: string;
  company?: string;
  phone?: string;
  [key: string]: unknown;
}

interface EventConfig {
  id: string;
  name: string;
  event_type: string;
  status: string;
  allowed_fields: string | null;
  required_fields: string | null;
}

const CORS_ORIGIN = "https://happysagents.com";
const RATE_LIMIT_WINDOW_MINUTES = 60;
const MAX_SUBMISSIONS_PER_WINDOW = 5;

const corsHeaders = {
  "Access-Control-Allow-Origin": CORS_ORIGIN,
  "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

// Email validation regex
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function jsonResponse(body: Record<string, unknown>, status: number): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": CORS_ORIGIN,
    },
  });
}

function getClientIP(request: Request): string {
  // Try CF-Connecting-IP first (Cloudflare), fallback to X-Forwarded-For
  const cfIp = request.headers.get("CF-Connecting-IP");
  if (cfIp) return cfIp;
  
  const forwarded = request.headers.get("X-Forwarded-For");
  if (forwarded) return forwarded.split(",")[0].trim();
  
  return "unknown";
}

async function checkRateLimit(
  db: D1Database,
  ip: string,
  eventId: string
): Promise<boolean> {
  // Clean up old attempts
  await db
    .prepare(
      `DELETE FROM submission_attempts 
       WHERE attempted_at < datetime('now', '-${RATE_LIMIT_WINDOW_MINUTES} minutes')`
    )
    .run();

  // Count recent attempts
  const result = await db
    .prepare(
      `SELECT COUNT(*) as count FROM submission_attempts 
       WHERE ip_address = ? AND event_id = ? 
       AND attempted_at > datetime('now', '-${RATE_LIMIT_WINDOW_MINUTES} minutes')`
    )
    .bind(ip, eventId)
    .first<{ count: number }>();

  return (result?.count ?? 0) < MAX_SUBMISSIONS_PER_WINDOW;
}

async function recordAttempt(
  db: D1Database,
  ip: string,
  eventId: string
): Promise<void> {
  await db
    .prepare(
      `INSERT INTO submission_attempts (ip_address, event_id) VALUES (?, ?)`
    )
    .bind(ip, eventId)
    .run();
}

async function getEventConfig(
  db: D1Database,
  eventId: string
): Promise<EventConfig | null> {
  return await db
    .prepare(`SELECT * FROM events WHERE id = ? AND status = 'active'`)
    .bind(eventId)
    .first<EventConfig>();
}

async function submitForm(
  db: D1Database,
  data: FormSubmission,
  ip: string,
  userAgent: string
): Promise<{ success: boolean; error?: string; id?: number }> {
  const { event_id, email, name, company, phone, ...extraFields } = data;

  // Validate required fields
  if (!event_id || !email || !name) {
    return { success: false, error: "Missing required fields: event_id, email, name" };
  }

  // Validate email format
  if (!EMAIL_REGEX.test(email)) {
    return { success: false, error: "Invalid email format" };
  }

  // Get event config
  const eventConfig = await getEventConfig(db, event_id);
  if (!eventConfig) {
    return { success: false, error: "Event not found or not active" };
  }

  // Check for duplicate submission (same email + event)
  const existing = await db
    .prepare(`SELECT id FROM form_submissions WHERE event_id = ? AND email = ?`)
    .bind(event_id, email)
    .first<{ id: number }>();

  if (existing) {
    return { success: false, error: "You have already submitted for this event" };
  }

  // Filter allowed fields if configured
  let filteredData = extraFields;
  if (eventConfig.allowed_fields) {
    const allowed = JSON.parse(eventConfig.allowed_fields) as string[];
    filteredData = Object.fromEntries(
      Object.entries(extraFields).filter(([key]) => allowed.includes(key))
    );
  }

  // Check required fields
  if (eventConfig.required_fields) {
    const required = JSON.parse(eventConfig.required_fields) as string[];
    for (const field of required) {
      if (!filteredData[field] || (filteredData[field] as string).trim() === "") {
        return { success: false, error: `Missing required field: ${field}` };
      }
    }
  }

  // Insert submission
  const result = await db
    .prepare(
      `INSERT INTO form_submissions 
       (event_id, event_type, email, name, company, phone, data, ip_address, user_agent)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
    )
    .bind(
      event_id,
      eventConfig.event_type,
      email,
      name,
      company || null,
      phone || null,
      JSON.stringify(filteredData),
      ip,
      userAgent
    )
    .run();

  return { success: true, id: result.meta.last_row_id };
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    // CORS preflight
    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: corsHeaders });
    }

    // Static asset passthrough
    if (url.pathname !== "/api/submit-form") {
      return env.ASSETS.fetch(request);
    }

    const db = env.happysagents_forms;

    // GET - Return event info or list events
    if (request.method === "GET") {
      const eventId = url.searchParams.get("event");
      
      if (eventId) {
        // Get specific event config
        const eventConfig = await getEventConfig(db, eventId);
        if (!eventConfig) {
          return jsonResponse({ error: "Event not found" }, 404);
        }
        return jsonResponse({
          id: eventConfig.id,
          name: eventConfig.name,
          type: eventConfig.event_type,
          allowed_fields: eventConfig.allowed_fields ? JSON.parse(eventConfig.allowed_fields) : [],
          required_fields: eventConfig.required_fields ? JSON.parse(eventConfig.required_fields) : [],
        }, 200);
      }
      
      // List all active events
      const { results } = await db
        .prepare(`SELECT id, name, event_type, starts_at, ends_at FROM events WHERE status = 'active'`)
        .all<{ id: string; name: string; event_type: string; starts_at: string; ends_at: string }>();
      
      return jsonResponse({ events: results || [] }, 200);
    }

    // POST - Submit form
    if (request.method === "POST") {
      try {
        const body = await request.json() as FormSubmission & { website?: string };
        
        // Honeypot check
        if (body.website && body.website !== "") {
          return jsonResponse({ message: "Thanks for your submission!" }, 200);
        }

        const ip = getClientIP(request);
        const userAgent = request.headers.get("User-Agent") || "unknown";

        // Rate limiting
        const allowed = await checkRateLimit(db, ip, body.event_id);
        if (!allowed) {
          return jsonResponse(
            { error: "Too many submissions. Please try again later." },
            429
          );
        }

        // Record attempt
        await recordAttempt(db, ip, body.event_id);

        // Process submission
        const result = await submitForm(db, body, ip, userAgent);

        if (!result.success) {
          return jsonResponse({ error: result.error }, 400);
        }

        return jsonResponse(
          { message: "Submission successful!", id: result.id },
          200
        );
      } catch (err) {
        console.error("Form submission error:", err);
        return jsonResponse(
          { error: "Something went wrong. Please try again." },
          500
        );
      }
    }

    return new Response("Method Not Allowed", { status: 405 });
  },
};
