# Project: Mission Control Dashboard

**Status:** Queued — build after dev infrastructure setup complete
**Prerequisite:** Security architecture Phase 1 (plan-checklist.md) must be done first. Runs on its own VPS or locally — separate from architecture setup.
**Goal:** Build a visual dashboard for R to track all active projects, running agents, blockers, and pending decisions in one place.
**Started:** 2026-03-01

## Key Findings

- **Canvas = full HTML/JS surface.** It's a WKWebView that can serve bundled React or navigate to a gateway HTTP route. Best architecture: serve Mission Control as `/mission-control` on the Gateway, then Canvas navigates there for live WS data access.
- **No one has built this yet.** AgentOps/LangSmith/Lunary are dev debuggers (traces, tokens, latency). Linear is the closest (AI+human workflow board) but it's project-focused. The "operator dashboard for running AI agents as a business" is an open gap.
- **Three data sources needed that don't exist yet:** `blocker.json` (structured blocker format), `activity-log.jsonl` (cross-agent event stream), and `projects-index.json` (parsed PARA summary). Happy needs to write these. That's the real work — the UI is straightforward once the data contract is defined.

## Progress
- [x] Research complete
- [ ] PRD drafted
- [ ] PRD approved by R
- [ ] Build
- [ ] Ship

## Links
- Research: memory/projects/mission-control/research-report.md
