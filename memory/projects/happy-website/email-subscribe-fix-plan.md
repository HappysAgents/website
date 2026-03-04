# Email Subscribe Fix — Plan
*Written: 2026-03-04. Pending R approval before any implementation.*

---

## What's Broken

The current `EmailSignup.tsx` component opens a `mailto:` link when the user clicks subscribe. This:
- Fails silently for users without a default email client configured
- Requires the user to manually send an email — most won't
- Never actually captures the email in any database
- Is noted as a TODO in the code: `// Replace with Buttondown/Beehiiv API endpoint`

**Result: 0 subscribers captured from the site.**

---

## Recommended Architecture

### Two-layer approach: Own the data + newsletter sending capability

**Layer 1 — Cloudflare D1 (our database, our data)**
- Every submitted email is stored in a Cloudflare D1 database (SQLite, runs on Cloudflare's edge)
- We own the data. Full export any time. No third party has exclusive access to our subscriber list.
- Even if we change newsletter providers, we never lose our list.

**Layer 2 — Buttondown (newsletter sending)**
- Free tier: up to 100 subscribers, no credit card required
- Handles email sending, unsubscribe management, double opt-in
- We forward each new submission to Buttondown *in addition* to storing in D1
- If Buttondown ever fails or we switch providers, D1 is our source of truth

**The glue — Cloudflare Worker function**
- A Worker endpoint at `/api/subscribe` handles all form submissions
- Validates email format + sanitizes input
- Checks D1 for duplicates before storing
- Rate limits by IP (max 3 attempts per hour — prevents abuse)
- Forwards to Buttondown API
- API keys stored as Cloudflare Worker secrets (never in browser, never in code)
- CORS locked to `happysagents.com` only — no other domain can call this endpoint

---

## Architecture Diagram

```
User fills in form on happysagents.com
        ↓
POST /api/subscribe (Cloudflare Worker)
        ↓
┌───────────────────────────────┐
│  1. Validate email format     │
│  2. Check rate limit (by IP)  │
│  3. Check D1 for duplicate    │
│  4. Store in D1               │
│  5. Forward to Buttondown API │
│  6. Return success/error JSON │
└───────────────────────────────┘
        ↓
EmailSignup.tsx shows success message
```

---

## Implementation Steps

### Step 1 — Cloudflare D1 setup (requires Cloudflare token — after R sets it up)
```sql
CREATE TABLE subscribers (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT UNIQUE NOT NULL,
  subscribed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  source TEXT DEFAULT 'website',
  status TEXT DEFAULT 'active'
);
```

### Step 2 — Buttondown account
- Sign up at buttondown.email with happy-agent@agentmail.to
- Get API key
- Store as Cloudflare Worker secret: `BUTTONDOWN_API_KEY`

### Step 3 — Worker function
Create `workers/subscribe.ts`:
```typescript
export async function onRequestPost({ request, env }) {
  // Parse body
  const { email } = await request.json();
  
  // Validate
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return Response.json({ error: 'Invalid email' }, { status: 400 });
  }

  // Rate limit check (KV or D1)
  // Store in D1
  // Forward to Buttondown
  // Return success
}
```

### Step 4 — Update wrangler.toml
Add D1 binding and Worker entry point to existing config.

### Step 5 — Update EmailSignup.tsx
Replace `mailto:` with `fetch('/api/subscribe', { method: 'POST', body: JSON.stringify({ email }) })`.
Add loading state + success/error message UI.

### Step 6 — Deploy
Same deploy process: `npm run build` → `npx wrangler deploy`

---

## What Needs R Approval

1. **Buttondown account** — sign up with happy-agent@agentmail.to (new external service)
2. **Cloudflare D1 database** — create on existing Cloudflare account (same account as website)
3. **Buttondown API key** stored as a Cloudflare secret (never in code)

---

## What This Costs

| Item | Cost |
|------|------|
| Cloudflare D1 | Free (5GB included in Workers free tier) |
| Buttondown | Free up to 100 subscribers, then $9/mo |
| Dev time | ~2 hours to implement + test |

**Total for first 100 subscribers: $0**

---

## Security Audit Scope (for Security Agent)

Review this plan for:
1. Is D1 + Worker the right data storage pattern for email addresses (PII)?
2. Are there any data exfiltration risks in the Worker architecture?
3. Is CORS-only-from-happysagents.com sufficient protection for the endpoint?
4. Any concerns with Buttondown as a third-party processor?
5. Should double opt-in be mandatory?
6. Rate limiting — is 3/hour per IP sufficient, or too loose?
7. Any SQL injection risks in D1 queries?
8. Should emails be encrypted at rest in D1?

---

## Files to Create/Modify

| File | Action |
|------|--------|
| `workers/subscribe.ts` | Create (new Worker function) |
| `wrangler.toml` | Update (add D1 binding + Worker entry) |
| `app/components/EmailSignup.tsx` | Update (replace mailto: with fetch) |
| Cloudflare D1 | Create database + table |
| Cloudflare Secrets | Add BUTTONDOWN_API_KEY |
