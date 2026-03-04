# Email Subscribe — Implementation Plan (v2)
*Written by Dev Agent: 2026-03-04*
*Status: PENDING SECURITY REVIEW → then R APPROVAL — do not implement until both complete*

---

## Changes from v1
- Replaced Buttondown with **Beehiiv** (larger free tier: 2,500 subs vs 100; built for growth newsletters)
- **Dropped D1** — Beehiiv provides CSV export so we're not locked in. D1 deferred until 500+ subscribers or multi-source collection. Trigger logged in MEMORY.md.
- Worker is now purely: validate → forward to Beehiiv → return uniform response. No database logic.

---

## Overview

Replaces the broken `mailto:` email signup with a real subscribe flow. A Cloudflare Worker at `/api/subscribe` receives form submissions, validates them (honeypot + email format), and forwards to Beehiiv's API. Beehiiv handles storage, double opt-in confirmation email, and newsletter sending. The Worker is zero-dependency — no npm imports, Web APIs only. All three security requirements from the architecture review are included: double opt-in (enforced in Beehiiv settings), privacy policy + consent checkbox on the form, and endpoint hardening (honeypot, uniform responses, no enumeration).

---

## Pre-Implementation Checklist (R Actions Required)

These require R's accounts. Implementation cannot start until all are done.

### 1. Create Beehiiv Publication
- URL: https://app.beehiiv.com
- Sign up / log in with `happy-agent@agentmail.to`
- Create a new publication for Happy's Journal
- **Immediately enable double opt-in:** Settings → Subscribers → "Enable double opt-in" → ON
- Navigate to: Settings → API → Generate API key → copy it
- Also note your **Publication ID** (visible in the URL: `app.beehiiv.com/publications/{PUBLICATION_ID}`)

### 2. Store Beehiiv Secrets as Cloudflare Worker Secrets
From project root (`projects/happy-website/`):
```bash
npx wrangler secret put BEEHIIV_API_KEY
# paste the API key when prompted

npx wrangler secret put BEEHIIV_PUBLICATION_ID
# paste the Publication ID when prompted
```
Confirm: `npx wrangler secret list` should show both.

### 3. Set Up Cloudflare Native Rate Limiting
- URL: https://dash.cloudflare.com → happysagents.com → Security → WAF → Rate limiting rules
- Create rule:
  - **Name:** Subscribe endpoint rate limit
  - **Field:** URI Path equals `/api/subscribe`
  - **Rate:** 2 requests per 60 minutes per IP
  - **Action:** Block (returns 429)

### 4. Approve the Privacy Policy Copy
- Review the privacy policy content (specified below) before it goes live
- This is a legal document — R sign-off required before publishing

---

## Implementation Steps

### Step 1: Update wrangler.toml
- **What:** Add `main = "workers/subscribe.ts"` to wire the Worker as the entry point. All non-API requests fall through to `env.ASSETS` (static site — no change to existing behaviour).
- **Files affected:** `wrangler.toml`
- **Key decision:** No D1 binding needed. Only the Worker entry point and CORS origin.
- **Estimated time:** 5 minutes

### Step 2: Create the Worker Function
- **What:** Create `workers/subscribe.ts` — handles POST `/api/subscribe`, passes everything else to static assets
- **Files affected:** `workers/subscribe.ts` (new)
- **Key decisions:**
  - Zero npm imports — Web APIs only (`fetch`, `Request`, `Response`, `JSON`)
  - Honeypot field name: `website` (innocuous, bots fill form fields, humans don't see it)
  - Uniform response for all success paths (new, duplicate, honeypot-silenced): `{ message: "Thanks! Check your inbox to confirm." }` — prevents email enumeration
  - CORS locked to `https://happysagents.com` — not `*`
  - OPTIONS preflight handled for browser CORS
  - Beehiiv `reactivate_existing: false` — don't reactivate previously unsubscribed users without their fresh consent
  - Beehiiv `send_welcome_email: true` — triggers the double opt-in confirmation email
  - Secrets accessed via `env.BEEHIIV_API_KEY` and `env.BEEHIIV_PUBLICATION_ID` — never logged, never in response
  - Beehiiv API call is fire-and-forget from the user's perspective (we await it but it doesn't block the UX feel — Worker responds after Beehiiv responds, but total latency is still fast)
- **Estimated time:** 40 minutes

### Step 3: Create the Privacy Policy Page
- **What:** New Next.js page at `/privacy` with full GDPR disclosures
- **Files affected:** `app/privacy/page.tsx` (new)
- **Key decisions:**
  - Static server component — no client JS needed
  - Matches existing site design and brand tone (Experimental, Confident, Bold — plain language, not legalese)
  - Linked from consent checkbox in the form
  - Processors disclosed: Cloudflare (hosting/Worker), Beehiiv (email sending/storage)
- **Estimated time:** 25 minutes

### Step 4: Update EmailSignup.tsx
- **What:** Replace `mailto:` with `fetch('/api/subscribe')`, add honeypot field, add consent checkbox, add form states
- **Files affected:** `app/components/EmailSignup.tsx`
- **Key decisions:**
  - Honeypot: `<input type="text" name="website" tabIndex={-1} autoComplete="off" aria-hidden="true" />` — hidden via CSS (`position:absolute; left:-9999px; opacity:0; pointer-events:none`). NOT `display:none` — some bots detect that.
  - Consent checkbox: `required`, unchecked by default. Text: *"I agree to receive emails and accept the [privacy policy](/privacy)."*
  - Success state: replace entire form with "Thanks! Check your inbox to confirm your subscription."
  - Error states:
    - 400 → "Please enter a valid email address."
    - 429 → "Too many attempts. Please try again later."
    - 5xx → "Something went wrong. Please try again."
  - Loading state: button disabled + shows "subscribing…" during fetch
  - Fetch sends `{ email, website }` where `website` is the honeypot value (empty for humans)
- **Estimated time:** 45 minutes

### Step 5: Add CSS for New Form Elements
- **What:** Styles for honeypot (visually hidden), consent checkbox, and form states
- **Files affected:** `app/globals.css` (or existing form stylesheet)
- **Key decision:** Honeypot uses CSS absolute positioning off-screen rather than `display:none` — harder for bots to detect
- **Estimated time:** 15 minutes

### Step 6: Local Testing
- See Testing Plan section
- **Estimated time:** 30 minutes

### Step 7: Deploy
- `npm run build && npx wrangler deploy`
- Production smoke test
- **Estimated time:** 10 minutes

**Total estimated implementation time: ~2.5 hours**

---

## Files To Create

| File | Purpose | Key Contents |
|------|---------|-------------|
| `workers/subscribe.ts` | Cloudflare Worker — the API endpoint | POST handler, honeypot, validation, Beehiiv forward, CORS, asset passthrough |
| `app/privacy/page.tsx` | Privacy policy page at `/privacy` | GDPR disclosures, processor list, retention policy, user rights, contact |

---

## Files To Modify

| File | What Changes | Why |
|------|-------------|-----|
| `wrangler.toml` | Add `main = "workers/subscribe.ts"` | Wire Worker as entry point |
| `app/components/EmailSignup.tsx` | Replace mailto: with fetch, add honeypot + consent + states | Core broken feature |
| `app/globals.css` | Honeypot hidden styles, checkbox styles, form state styles | Visual presentation |

---

## Worker Function Design

*(Pseudocode — logic description only, not implementation code)*

```
WORKER: fetch(request, env)

  ── OPTIONS PREFLIGHT ──
  IF method == "OPTIONS":
    Return 204 with headers:
      Access-Control-Allow-Origin: https://happysagents.com
      Access-Control-Allow-Methods: POST, OPTIONS
      Access-Control-Allow-Headers: Content-Type

  ── ASSET PASSTHROUGH (all non-API routes) ──
  IF pathname != "/api/subscribe":
    Return env.ASSETS.fetch(request)

  ── METHOD GUARD ──
  IF method != "POST":
    Return 405 Method Not Allowed

  ── CORS HEADER (set on all responses from here) ──
  Set: Access-Control-Allow-Origin: https://happysagents.com

  ── SUBSCRIBE HANDLER ──
  TRY:
    body = await request.json()
    email  = body.email?.trim() or ""
    honeypot = body.website or ""

    ── HONEYPOT CHECK (silent discard) ──
    IF honeypot is not empty:
      Return 200 { message: "Thanks! Check your inbox to confirm." }

    ── EMAIL VALIDATION ──
    IF email is empty OR does not match /^[^\s@]+@[^\s@]+\.[^\s@]+$/:
      Return 400 { error: "Please enter a valid email address." }

    ── FORWARD TO BEEHIIV ──
    beehiivResponse = await fetch(
      "https://api.beehiiv.com/v2/publications/{env.BEEHIIV_PUBLICATION_ID}/subscriptions",
      {
        method: "POST",
        headers: {
          "Authorization": "Bearer " + env.BEEHIIV_API_KEY,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          email_address: email,
          reactivate_existing: false,
          send_welcome_email: true
        })
      }
    )

    ── LOG BEEHIIV ERRORS (internal only, never to response) ──
    IF beehiivResponse.status >= 500:
      console.error("Beehiiv error:", beehiivResponse.status)
      Return 500 { error: "Something went wrong. Please try again." }

    ── UNIFORM SUCCESS (new sub, duplicate, or Beehiiv 4xx all return same message) ──
    Return 200 { message: "Thanks! Check your inbox to confirm." }

  CATCH (parse error / unexpected):
    console.error(error)
    Return 500 { error: "Something went wrong. Please try again." }
```

**Security properties:**
- Honeypot silently discards bot submissions (200 response, nothing forwarded)
- Duplicate emails: Beehiiv handles gracefully; Worker returns same 200 — no enumeration
- Secrets: never logged, never in response body
- CORS: blocks cross-origin browser requests from non-happysagents.com domains
- Rate limiting: enforced at Cloudflare network layer before request reaches Worker

---

## Privacy Policy Page

**URL:** `https://happysagents.com/privacy`
**Tone:** Plain language, matches brand (Experimental, Confident, Bold). No legalese.
**R must approve final copy before publishing.**

### Required Sections

**1. What We Collect**
- Email address (voluntarily provided)
- Subscription timestamp
- Subscription status (pending / confirmed / unsubscribed)
- NOT collected: name, IP address, payment info, browsing behaviour

**2. Why We Collect It**
- To send Happy's Journal — updates on building a $1B company with AI agents
- Emails only sent after you confirm your subscription (double opt-in)

**3. Where It's Stored**
- **Cloudflare** (Workers infrastructure, EU-compliant) — processes the form submission
- **Beehiiv** (newsletter platform, beehiiv.com) — stores subscriber data, sends emails
- Both are GDPR-compliant processors

**4. How Long We Keep It**
- Active subscribers: retained while subscribed
- Unsubscribed: deleted within 30 days of request
- Unconfirmed (pending): removed after 90 days if not confirmed

**5. Your Rights (GDPR)**
- Access: request a copy — `happy-agent@agentmail.to`
- Deletion: request removal from all systems — same email
- Portability: data available in CSV on request
- Opt-out: every email contains an unsubscribe link

**6. Processors**
- Cloudflare: https://www.cloudflare.com/privacypolicy/
- Beehiiv: https://www.beehiiv.com/privacy

**7. Contact**
- `happy-agent@agentmail.to`
- Happy's Agents, Athens, Greece

**8. Last Updated:** [date of publish]

---

## Testing Plan

### Local Setup
```bash
cd projects/happy-website
npx wrangler dev --local
```

### Test Cases

| # | Test | Input | Expected Result |
|---|------|-------|----------------|
| 1 | Happy path | Valid email, empty honeypot, consent checked | 200 "Thanks! Check your inbox…" + Beehiiv receives subscription |
| 2 | Duplicate email | Same valid email twice | 200 same message both times (no error exposed) |
| 3 | Honeypot triggered | Valid email, honeypot = "http://spam.com" | 200 same message, Beehiiv NOT called |
| 4 | Invalid email | "notanemail", empty honeypot | 400 "Please enter a valid email address." |
| 5 | Empty body | `{}` | 400 invalid email |
| 6 | Missing consent | Form submit without checkbox | Browser prevents submit (HTML `required`) |
| 7 | Static assets intact | GET / in browser | Full site loads normally |
| 8 | CORS block | POST from different origin | Request blocked by browser |
| 9 | OPTIONS preflight | OPTIONS /api/subscribe | 204 with correct headers |

### UI Checks (browser)
- Honeypot field not visible, not tabbable, not in browser autofill
- Consent checkbox is unchecked by default, must be checked to submit
- Loading state shows during fetch (button disabled)
- Success state replaces form (no double-submit possible)
- Privacy policy link in consent text goes to `/privacy`

### Production Smoke Test (after deploy)
1. Submit one real email via the live form
2. Confirm Beehiiv double opt-in email arrives
3. Click confirmation link → Beehiiv shows subscriber as active
4. Check Beehiiv dashboard → subscriber present

---

## Deployment Sequence

1. R completes Pre-Implementation Checklist (Beehiiv setup, secrets stored, rate limit rule created)
2. Implement code (Steps 1–5)
3. Local test — all test cases pass
4. R approves privacy policy copy
5. `npm run build && npx wrangler deploy`
6. Production smoke test (one real email)
7. Monitor Cloudflare Worker logs for first 24h

**Dependencies:**
- Worker deploy requires secrets to exist → Step 2 (pre-implementation) must be done first
- Privacy page must be approved by R before going live
- Do not deploy before all local tests pass

---

## Risks & Open Questions

### Risk: Beehiiv API Changes
Beehiiv is VC-backed and actively developed. API may change. Mitigation: Worker is small and easy to update. Keep Beehiiv API docs bookmarked.

### Risk: wrangler.toml `main` field change
Adding `main` changes deploy behaviour from pure-static to Worker-fronted. Static assets still served via `env.ASSETS.fetch()` passthrough — this must be verified in local test before deploy. Rollback: revert wrangler.toml, redeploy (immediate).

### Risk: Beehiiv handles unsubscribed users
`reactivate_existing: false` means if someone previously unsubscribed and resubmits, Beehiiv will NOT resubscribe them — consistent with GDPR. They'd need to contact us. This is the correct behaviour but worth noting.

### Open Question: Right-to-Deletion Workflow
GDPR requires a deletion mechanism. For MVP: manual process — user emails `happy-agent@agentmail.to`, Happy deletes from Beehiiv dashboard. This is legally sufficient at low subscriber counts. Self-service endpoint is a future ticket.

**R to confirm:** Is manual deletion acceptable for launch?

---

## What R Needs To Approve

1. **This plan in full** — before any code is written
2. **Security agent review** — plan goes to security agent after R reviews this
3. **Privacy policy copy** — before the `/privacy` page goes live
4. **Manual deletion workflow** — acceptable for launch, or build self-service now?
5. **Beehiiv as the newsletter platform** — already discussed, confirming here for the record

---

## Deferred Items (not in this ticket)

| Item | Trigger | Notes |
|------|---------|-------|
| D1 subscriber database | 500 subscribers OR email collected from 2+ sources | Logged in MEMORY.md threshold triggers |
| Self-service deletion endpoint | Legal requirement materialises at scale | Manual process acceptable for MVP |
| Buttondown webhook for status sync | N/A — dropped with D1 | N/A |
| Cloudflare Turnstile | Bot abuse observed post-launch | Not needed pre-launch |
