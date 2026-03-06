# Security Architecture — Clarifying Questions

**Status:** Waiting for R's answers before building the plan.
**Date:** 2026-03-06

---

## TL;DR
6 questions. I need these answered to build a plan that's executable, not theoretical. Each one changes the architecture significantly.

---

## Questions

### 1. Where does Mission Control run?

This determines the entire Part A architecture. Options I see:
- **R's personal Mac** → Syncthing bridge delivers data, Mission Control reads locally. Simplest. But it means R's Mac has a sync relationship with the dedicated Mac (even if one-way).
- **A VPS** → bridge-outbox syncs to a VPS instead. More isolation from R's personal Mac, but adds a server to maintain.
- **Something else** (e.g., Cloudflare Workers reading from a data source, a hosted dashboard)?

My instinct: R's personal Mac is simplest and you're already comfortable with Tailscale + Syncthing. But I want to confirm, not assume.

### 2. VPS provisioning — do I get cloud API access, or does R provision manually?

If I get API credentials for a cloud provider (Hetzner, DO, etc.) on the dedicated Mac, I can spin up VPS instances autonomously (with approval gates). But that's a new credential class sitting on my runtime.

If R provisions manually, it's slower but keeps cloud credentials off the dedicated Mac entirely.

**My instinct:** R provisions the first few manually. Once the pattern is proven, we evaluate giving me API access with spend limits. But this is a trust/speed tradeoff R should decide.

### 3. Cloud provider preference + budget per project?

Need this to right-size recommendations. Are we thinking:
- Hetzner (cheapest, EU-based, good for privacy)?
- DigitalOcean (familiar, slightly more expensive)?
- Something else?

And roughly: €5-10/mo per project VPS? More? This affects whether I recommend one-VPS-per-project vs. containers on a shared box.

### 4. What flows through bridge-inbox (back to me)?

bridge-outbox → my outputs going out. Clear.
bridge-inbox → what comes back? Options:
- **Nothing** — strictly one-way outbound. I get steering via Discord/Telegram only.
- **Approval files** — R drops approved configs, signed-off plans, etc.
- **Mission Control commands** — steering instructions from the dashboard.

My instinct: keep it one-way outbound for now. Inbound commands via Discord/Telegram are already working and auditable. Adding a file-based inbound channel creates a second command surface to secure. But if R has a specific use case for bridge-inbox, I'll design for it.

### 5. Can source code repos live on the dedicated Mac?

"No product code runs on it" — does this mean:
- **(a)** No source code at all — I generate code, push to GitHub from VPS, never touch it locally?
- **(b)** Source code repos can live here for authoring/pushing, but nothing executes as a running service?

My instinct: (b) is more practical. I write code locally, push to GitHub. VPS pulls from GitHub and runs it. The dedicated Mac never runs product services. But I want to confirm because (a) is more conservative.

### 6. What tooling do development agents on VPS need?

You mentioned Claude Code. What's the full picture?
- Claude Code (given) — needs Anthropic API key on the VPS
- OpenClaw instance on each VPS? Or just Claude Code + GitHub?
- Node.js / Python / other runtimes?
- Do VPS agents need to communicate with me on the dedicated Mac, or are they fully independent once spun up?

This determines the VPS base image template.

---

## What I'm NOT asking (because I can answer these myself)

- Syncthing configuration details → I'll handle this
- Security agent vetting process for packages → already exists, I'll extend it
- LuLu rules for Syncthing → I'll propose specific rules
- Git workflow for code → I'll design this based on your answers above
- VPS hardening checklist → standard practice, I'll include it
