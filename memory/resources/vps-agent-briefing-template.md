# VPS Agent Briefing Template

_Copy this file for each new project. Fill in every section before handing to a VPS coding agent._

---

## Project

**Name:** [PROJECT_NAME]
**Type:** External product / Internal tool
**Goal in one sentence:** [What this builds and who it's for]

## Your Mission

[2-3 sentences. What you are building, what "done" looks like, and what you should NOT do.]

Example: "You are building a SaaS subscription landing page with Stripe payment integration. Done = a user can sign up, pay, and receive a confirmation email. Do not deploy to production without Happy's sign-off."

---

## Access & Credentials

**GitHub repo:** `HappysAgents/[repo-name]`
**GitHub PAT:** Stored in `/root/.github-pat` — scoped to this repo only. Do not use for any other repo.
**Discord webhook:** `/opt/project/.config/discord-webhook.env` — use `notify-discord` command to send updates.
**Anthropic API key:** Set as env var `ANTHROPIC_API_KEY` — project-specific, has spend limits. Do not share.

---

## Technical Spec

[Paste the full product spec here, or link to the spec file in the GitHub repo.]

**Stack:** [e.g. Next.js, Node.js, PostgreSQL, Stripe]
**Hosting target:** [e.g. this VPS, Cloudflare Workers, Vercel]
**Domain:** [if known]

---

## Constraints

1. All code goes to GitHub (`git push origin main`) — commit frequently.
2. Send a Discord update at every meaningful milestone (use `notify-discord "message"`).
3. Do not install packages outside of npm/pip without flagging to Happy first.
4. Do not expose credentials in code or commits.
5. When blocked or uncertain, post to Discord and wait — do not guess on architecture decisions.
6. Do not deploy to production or purchase any services without Happy's explicit approval.

---

## Reporting Cadence

- **Every 2 hours:** Post a progress update to Discord (what's done, what's next, any blockers).
- **On completion of each milestone:** Post to Discord with a summary.
- **On any blocker:** Post immediately with context. Do not sit blocked for more than 30 minutes. Then wait — do not guess.

**Discord update format:**
```
✅ [what you completed] — commit [hash if applicable]
🚧 [what you're working on now]
🚨 BLOCKED: [exactly what you need] — only use if genuinely stuck
```

Discord command: `notify-discord "your message here"`

---

## Session Management (tmux)

Your Claude Code session runs inside a tmux session so it persists when Happy disconnects. You do not need to do anything — just be aware that:
- Happy may detach and re-attach at any time
- The session is named `[PROJECT_NAME]`
- Happy can observe your terminal output without interrupting you

## Steering

Happy monitors your Discord channel and will steer via two methods:
1. **Discord message** — Happy posts direction in the project channel. Treat this as an instruction and confirm receipt with a Discord update.
2. **Direct SSH** — Happy re-attaches to your tmux session and types instructions directly. Highest priority when this happens.

When Happy SSHes in, stop what you're doing and acknowledge.

---

## Done Criteria

[ ] All features in spec are implemented and tested
[ ] Code is committed and pushed to GitHub
[ ] README.md is written and accurate
[ ] Happy has reviewed and signed off
[ ] Deployment approved by R (if applicable)
