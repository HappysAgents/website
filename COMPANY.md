# COMPANY.md — Organisational State
*Navigation layer only. Never duplicate PARA content — always link to it.*
*Maintained by: Happy (Chief of Staff)*
*Last updated: 2026-03-04*

---

## Mission (Locked)

Build the first $1B company run by agents.
Happy is the Chief of Staff — coordinating agents, executing strategy, reporting to R (Special K).
The blog (happysagents.com) documents the build in real time — it IS the distribution strategy.

---

## Active Projects

| Project | Status | Owner | Full details |
|---------|--------|-------|--------------|
| Athens OpenClaw Meetup | 🟢 Live — venue confirmed Big Pi VC, 6 attendees | Happy | [→ memory/projects/athens-openclaw-meetup/](memory/projects/athens-openclaw-meetup/) |
| happysagents.com Website | 🟢 Live — Day 3+4 deployed, email subscribe plan ready | Dev Agent (pending) / Happy | [→ memory/projects/happy-website/](memory/projects/happy-website/) |
| Mission Control Dashboard | 🟡 PRD done, build not started | Happy + Dev Agent | [→ memory/projects/mission-control/](memory/projects/mission-control/) |
| Brand Playbook | 🔴 Q1 answered, Q2+ pending | Creative Lead | [→ memory/projects/brand-playbook/](memory/projects/brand-playbook/) |
| Discord Server | 📋 Scoped, PRD not started | Happy | [→ memory/projects/discord-server/](memory/projects/discord-server/) |
| OpenClaw Deployment | 🟡 Section G (Gmail) pending | Happy | [→ memory/projects/openclaw-deployment/](memory/projects/openclaw-deployment/) |

---

## Locked Decisions
*Decisions every agent must know. One line + link to detail.*

| Decision | Date | Detail |
|----------|------|--------|
| Revenue target: $1B via agents | 2026-02-27 | [→ MEMORY.md](MEMORY.md) |
| Website = top of funnel only, not revenue | 2026-02-27 | [→ MEMORY.md](MEMORY.md) |
| Code is NOT a moat. Network effects, data, brand, distribution are. | 2026-02-27 | [→ MEMORY.md](MEMORY.md) |
| Copy approval first — all public-facing copy to R before publishing | 2026-03-03 | [→ MEMORY.md](MEMORY.md) |
| Brand personality: Experimental, Confident, Bold | 2026-03-03 | [→ memory/projects/brand-playbook/discovery-questionnaire.md](memory/projects/brand-playbook/discovery-questionnaire.md) |
| Happy = public face of Athens meetup. R = in-person operator. | 2026-03-03 | [→ memory/projects/athens-openclaw-meetup/plan.md](memory/projects/athens-openclaw-meetup/plan.md) |
| Outreach rule: give before you ask. Research person first. | 2026-03-03 | [→ MEMORY.md](MEMORY.md) |
| Org memory: COMPANY.md (nav layer) + PARA (storage). Not duplicated. | 2026-03-03 | [→ memory/resources/org-memory-architecture-v2.md](memory/resources/org-memory-architecture-v2.md) |
| At 20+ agents: upgrade to CHANGELOG + Decision Records architecture | 2026-03-03 | [→ memory/resources/org-memory-architecture-v2.md](memory/resources/org-memory-architecture-v2.md) |
| Deploy via Cloudflare Workers Builds (auto on git push). No token on Mac ever. | 2026-03-04 | [→ memory/2026-03-04.md](memory/2026-03-04.md) |
| Sub-agents = ephemeral tasks. Full agents = persistent department heads (own channels, cron, memory). | 2026-03-04 | [→ memory/2026-03-04.md](memory/2026-03-04.md) |
| Venue for Athens meetup #1: Big Pi VC, 8 Omirou str., Athens | 2026-03-04 | [→ memory/projects/athens-openclaw-meetup/plan.md](memory/projects/athens-openclaw-meetup/plan.md) |

---

## What Changed This Week
*Rolling 7-day window. Older entries removed. Newest first.*

- **2026-03-04** — Venue confirmed: Big Pi VC, 8 Omirou str., Athens — updated on Luma + Meetup.com
- **2026-03-04** — Deploy architecture corrected: Cloudflare Workers Builds already live (auto-deploys on git push, no token on Mac)
- **2026-03-04** — Day 3 + Day 4 blog posts deployed to happysagents.com
- **2026-03-04** — Browser control fixed: launchctl restart resolved port shift 18791→18800
- **2026-03-04** — Email subscribe implementation plan written, security ⚠️ CAUTION (RC-1 DPA, RC-2 API scope, RC-3 logging) → [email-subscribe-implementation-plan.md](memory/projects/happy-website/email-subscribe-implementation-plan.md)
- **2026-03-04** — Notification cleanup: Meetup + Luma email noise removed (kept only actionable signals)
- **2026-03-04** — Multi-agent architecture researched: full agents needed for persistent sessions + proactive scheduling + own channels. Sub-agents = apprenticeship phase. Full agents = department heads.
- **2026-03-03** — Brand Q1 locked: Experimental, Confident, Bold → [discovery-questionnaire.md](memory/projects/brand-playbook/discovery-questionnaire.md)
- **2026-03-03** — Athens meetup live on Luma + Meetup.com → [plan.md](memory/projects/athens-openclaw-meetup/plan.md)
- **2026-03-03** — happysagents.com deployed to Cloudflare → [happy-website/](memory/projects/happy-website/)
- **2026-03-03** — pm-agent skill installed, security reviewed (4 rounds) → [security-reviews/](memory/resources/security-reviews/)
- **2026-03-03** — Creative Lead + Graphic Design agents created → [agents/](agents/)
- **2026-03-03** — Mission Control PRD v1 complete → [mission-control/outputs/](memory/projects/mission-control/outputs/)
- **2026-03-03** — Org memory architecture designed (COMPANY.md + PARA) → [org-memory-architecture-v2.md](memory/resources/org-memory-architecture-v2.md)
- **2026-03-03** — 3-layer memory system implemented (real-time writes + heartbeat sweep + 10-min cron)
- **2026-03-03** — Security agent moved to agents/security-agent.md → [agents/security-agent.md](agents/security-agent.md)

---

## Agent Directory

| Agent | Role | Spec | Status |
|-------|------|------|--------|
| Happy | Chief of Staff / COO | [→ SOUL.md](SOUL.md) | ✅ Active |
| Security Agent | Pre-install security reviews | [→ agents/security-agent.md](agents/security-agent.md) | ✅ Active |
| Content Agent | Daily blog posts, copy | [→ agents/content-agent.md](agents/content-agent.md) | ✅ Active |
| Creative Lead | Brand, creative direction | [→ agents/creative-lead.md](agents/creative-lead.md) | ✅ Active — Brand Playbook incomplete |
| Graphic Design Agent | Static assets, Imagen 4 | [→ agents/graphic-design.md](agents/graphic-design.md) | ✅ Active |
| UI Designer Agent | Component specs, Frontend handoff | agents/ui-designer.md | ⏸️ Pending Frontend Dev |
| UX Designer Agent | Flows, IA, wireframes | agents/ux-designer.md | 🔒 Phase 2 |

---

## Startup Protocol (All Agents — Mandatory)

Every agent reads these files at the start of every session, in this order:
1. **Own agent spec** (agents/[name].md) — role, rules, capabilities
2. **This file** (COMPANY.md) — current state, what changed, what's locked
3. **Specific PARA project file** for the current task (memory/projects/[project]/summary.md)

Do not start work before completing all three reads.

---

## Maintenance Rules
- Happy updates this file at the end of every session where a locked decision was made
- "What Changed This Week" entries older than 7 days are removed (not archived — full detail is in PARA)
- This file must never exceed ~300 lines. If it grows beyond that, content belongs in PARA, not here.
- If this file hasn't been updated in 48h, the heartbeat will flag it
