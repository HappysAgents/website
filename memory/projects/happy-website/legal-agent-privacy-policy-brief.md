# Legal Agent Brief — Privacy Policy for happysagents.com
*Created: 2026-03-04*

## Startup Protocol (Mandatory)
Before starting work:
1. Read COMPANY.md at /Users/dirtyagent/openclaw-workspace/COMPANY.md
2. Write every decision and outcome to /Users/dirtyagent/openclaw-workspace/memory/2026-03-04.md in real time.

## Your Role
You are a Senior Legal Agent. Draft a privacy policy page for happysagents.com. Tone: plain English, not legalese — matches the brand (Experimental, Confident, Bold). Governing law: **United States (CAN-SPAM Act + CCPA framework)**. NOT EU/GDPR.

## Output
Create two files:

### File 1: Privacy policy content
Path: /Users/dirtyagent/openclaw-workspace/memory/projects/happy-website/privacy-policy-draft.md

This is the review draft for R. Plain markdown. Must cover:

1. **What We Collect**
   - Email address (voluntarily provided via signup form)
   - Subscription status and timestamp
   - NOT collected: name, IP address, payment info, browsing data

2. **Why We Collect It**
   - To send Happy's Journal — updates on building a company with AI agents
   - Email only sent after you confirm subscription (double opt-in)

3. **CAN-SPAM Compliance**
   - Every email includes a clear unsubscribe link
   - We honor unsubscribe requests promptly (within 10 business days per CAN-SPAM)
   - No deceptive subject lines or sender info

4. **CCPA Notice (California residents)**
   - Right to know what data is collected
   - Right to delete personal information
   - Right to opt-out of sale (we do NOT sell data)
   - How to exercise rights: email happy-agent@agentmail.to

5. **Where Data Is Stored**
   - Cloudflare (form processing infrastructure)
   - Beehiiv (newsletter platform — beehiiv.com — email storage + sending)

6. **Data Retention**
   - Active subscribers: retained while subscribed
   - Unsubscribed: removed within 30 days of request
   - Unconfirmed signups: removed after 90 days

7. **Third-Party Processors**
   - Cloudflare: cloudflare.com/privacypolicy
   - Beehiiv: beehiiv.com/privacy

8. **Contact**
   - happy-agent@agentmail.to
   - Happy's Agents, Athens, Greece

9. **Changes to This Policy**
   - We'll update the "Last Updated" date when this changes

10. **Last Updated:** [today's date]

### File 2: Next.js privacy page
Path: /Users/dirtyagent/openclaw-workspace/projects/happy-website/app/privacy/page.tsx

Static server component (no "use client"). Renders the privacy policy as a styled page matching the site's design. Use existing className patterns from the site (look at other pages in app/ for reference). Link back to home.

## Constraints
- US law only (CAN-SPAM + CCPA) — not GDPR
- Plain language — no legalese
- Matches brand tone: concise, direct, no fluff
- Do NOT deploy or run build commands
- Do NOT modify any other files

## Done Criteria
- [ ] privacy-policy-draft.md written (for R review)
- [ ] app/privacy/page.tsx written

When complete:
1. Write completion summary to /Users/dirtyagent/openclaw-workspace/memory/2026-03-04.md
2. Flag anything that needs R's specific decision before going live
