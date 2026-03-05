/**
 * Cloudflare Worker — Email Subscribe Endpoint
 *
 * Routes:
 *   POST /api/subscribe  → validate → forward to Beehiiv
 *   OPTIONS /api/subscribe → CORS preflight
 *   * (everything else)  → static asset passthrough
 *
 * Zero npm dependencies — Web APIs only.
 */

interface Env {
  ASSETS: { fetch: (req: Request) => Promise<Response> };
  BEEHIIV_API_KEY: string;
  BEEHIIV_PUBLICATION_ID: string;
}

const CORS_ORIGIN = "https://happysagents.com";
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const corsHeaders = {
  "Access-Control-Allow-Origin": CORS_ORIGIN,
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

function jsonResponse(
  body: Record<string, string>,
  status: number
): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": CORS_ORIGIN,
    },
  });
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    // ── OPTIONS PREFLIGHT ──────────────────────────────────────────────────
    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: corsHeaders });
    }

    // ── STATIC ASSET PASSTHROUGH (all non-API routes) ─────────────────────
    if (url.pathname !== "/api/subscribe") {
      return env.ASSETS.fetch(request);
    }

    // ── METHOD GUARD ───────────────────────────────────────────────────────
    if (request.method !== "POST") {
      return new Response("Method Not Allowed", { status: 405 });
    }

    // ── SUBSCRIBE HANDLER ──────────────────────────────────────────────────
    try {
      const body = await request.json() as Record<string, unknown>;
      const email = (typeof body.email === "string" ? body.email.trim() : "");
      const honeypot = (typeof body.website === "string" ? body.website : "");

      // ── HONEYPOT CHECK (silent discard) ───────────────────────────────
      if (honeypot !== "") {
        return jsonResponse(
          { message: "Thanks! Check your inbox to confirm." },
          200
        );
      }

      // ── EMAIL VALIDATION ──────────────────────────────────────────────
      if (!email || !EMAIL_REGEX.test(email)) {
        return jsonResponse(
          { error: "Please enter a valid email address." },
          400
        );
      }

      // ── FORWARD TO BEEHIIV ────────────────────────────────────────────
      const beehiivResponse = await fetch(
        `https://api.beehiiv.com/v2/publications/${env.BEEHIIV_PUBLICATION_ID}/subscriptions`,
        {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${env.BEEHIIV_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: email,
            reactivate_existing: false,
            send_welcome_email: true,
            double_opt_override: "on",
          }),
        }
      );

      if (beehiivResponse.status >= 500) {
        console.error("Beehiiv upstream error:", beehiivResponse.status);
        return jsonResponse(
          { error: "Something went wrong. Please try again." },
          500
        );
      }

      // ── UNIFORM SUCCESS (new sub, duplicate, or Beehiiv 4xx) ─────────
      return jsonResponse(
        { message: "Thanks! Check your inbox to confirm." },
        200
      );
    } catch (err) {
      console.error("Subscribe handler error:", err);
      return jsonResponse(
        { error: "Something went wrong. Please try again." },
        500
      );
    }
  },
};
