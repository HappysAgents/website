# Dev Agent Brief — Email Subscribe Implementation
*Created: 2026-03-04*

## Startup Protocol (Mandatory)
Before starting work:
1. Read your agent spec at /Users/dirtyagent/openclaw-workspace/agents/security-agent.md (for security principles)
2. Read COMPANY.md at /Users/dirtyagent/openclaw-workspace/COMPANY.md
3. Read the implementation plan: /Users/dirtyagent/openclaw-workspace/memory/projects/happy-website/email-subscribe-implementation-plan.md
4. Write every decision and outcome to /Users/dirtyagent/openclaw-workspace/memory/2026-03-04.md in real time — do NOT wait until end.

## Mission
Implement the email subscribe feature for happysagents.com per the implementation plan (v2). All decisions are already made — just build it.

## Project Location
/Users/dirtyagent/openclaw-workspace/projects/happy-website/

## What To Build (4 things)

### 1. Update wrangler.toml
Add Worker entry point:
```toml
name = "website"
compatibility_date = "2026-03-03"
main = "workers/subscribe.ts"

[assets]
directory = "./out"
```

### 2. Create workers/subscribe.ts
Create directory `workers/` first. Build a Cloudflare Worker that:
- Passes all non-/api/subscribe requests to `env.ASSETS.fetch(request)` (static site passthrough)
- Handles OPTIONS preflight with correct CORS headers
- On POST /api/subscribe:
  - Parse JSON body: `{ email, website }` (website = honeypot)
  - If honeypot non-empty → return 200 `{ message: "Thanks! Check your inbox to confirm." }` (silent discard)
  - If email invalid (empty or fails /^[^\s@]+@[^\s@]+\.[^\s@]+$/) → return 400 `{ error: "Please enter a valid email address." }`
  - POST to Beehiiv: `https://api.beehiiv.com/v2/publications/${env.BEEHIIV_PUBLICATION_ID}/subscriptions`
    - Headers: `Authorization: Bearer ${env.BEEHIIV_API_KEY}`, `Content-Type: application/json`
    - Body: `{ email_address: email, reactivate_existing: false, send_welcome_email: true }`
  - If Beehiiv ≥500 → log error internally, return 500 `{ error: "Something went wrong. Please try again." }`
  - All other cases (new, duplicate, 4xx from Beehiiv) → return 200 `{ message: "Thanks! Check your inbox to confirm." }`
  - CORS header on all responses: `Access-Control-Allow-Origin: https://happysagents.com`
- Zero npm imports — Web APIs only (fetch, Request, Response, JSON)
- Secrets accessed via `env.BEEHIIV_API_KEY` and `env.BEEHIIV_PUBLICATION_ID` — NEVER logged or in responses

Worker env type interface must include:
```ts
interface Env {
  ASSETS: { fetch: (req: Request) => Promise<Response> };
  BEEHIIV_API_KEY: string;
  BEEHIIV_PUBLICATION_ID: string;
}
```

### 3. Update app/components/EmailSignup.tsx
Replace the current mailto: implementation with:
- Honeypot field: `<input type="text" name="website" tabIndex={-1} autoComplete="off" aria-hidden="true" />` — hidden via CSS class `email-honeypot`
- Consent checkbox: required, unchecked by default. Text: `I agree to receive emails and accept the <a href="/privacy">privacy policy</a>.`
- Form states: idle → loading → success/error
- On submit: fetch POST to `/api/subscribe` with `{ email, website }` (JSON)
- Success: replace entire form with "Thanks! Check your inbox to confirm your subscription."
- Error states:
  - 400 → "Please enter a valid email address."
  - 429 → "Too many attempts. Please try again later."
  - 5xx → "Something went wrong. Please try again."
- Loading: button disabled + text "subscribing…"
- No double-submit possible (button disabled during fetch, form replaced on success)

### 4. Add CSS to app/globals.css
Add to the EMAIL SIGNUP section:
```css
/* Honeypot — visually hidden but NOT display:none (bots detect that) */
.email-honeypot {
  position: absolute;
  left: -9999px;
  opacity: 0;
  pointer-events: none;
  tab-size: 0;
}

/* Consent checkbox row */
.email-signup-consent {
  display: flex;
  align-items: flex-start;
  gap: 0.5rem;
  font-size: 0.82rem;
  color: var(--muted);
  margin-top: 0.75rem;
}

.email-signup-consent a {
  color: var(--accent);
  text-decoration: underline;
}

/* Form state messages */
.email-signup-success {
  color: var(--accent);
  font-family: var(--font-roboto-mono), monospace;
  font-size: 0.9rem;
  margin-top: 0.75rem;
}

.email-signup-error {
  color: #ff4444;
  font-family: var(--font-roboto-mono), monospace;
  font-size: 0.82rem;
  margin-top: 0.5rem;
}
```

## Privacy Page
**DO NOT create the privacy policy page.** A separate Legal Agent is drafting it. Your job is only the 4 items above.

## Do NOT
- Run `npm install` or install any packages
- Run `npm run build` or deploy
- Modify any other files outside the 4 listed
- Create the privacy page (Legal Agent handles this)

## Done Criteria
All 4 files written/modified:
- [ ] wrangler.toml updated
- [ ] workers/subscribe.ts created
- [ ] app/components/EmailSignup.tsx updated
- [ ] app/globals.css updated

When complete:
1. Write completion summary to /Users/dirtyagent/openclaw-workspace/memory/2026-03-04.md
2. List all files changed
3. Note anything that deviated from the plan and why
