# Security Architecture — Actionable Checklist

**Status:** v2 — decisions confirmed by R on 2026-03-06
**Date:** 2026-03-06
**Companion doc:** [plan-narrative.md](plan-narrative.md)

---

## TL;DR

Three phases: immediate foundations, internal tools track, external products track. 19 items total. R has 6 decisions/actions. Happy handles the rest (with approval gates where marked).

---

## Phase 0: Immediate Setup (Before Any Building)

These are prerequisites. Do these first.

| # | Task | Who | Approval Gate | Status |
|---|------|-----|---------------|--------|
| 0.1 | Resolve credential exposure audit findings (2 CRITICAL + 2 HIGH from 2026-03-05) | R approves remediations → Happy executes | R approves each remediation | ⬜ Pending |
| 0.2 | ~~**DECISION:** Confirm Hetzner as cloud provider~~ | ✅ **Hetzner confirmed** | — | ✅ Done |
| 0.3 | ~~**DECISION:** Pick VPS provisioning model~~  | ✅ **Hybrid (Option 3)** — manual first, API key later | — | ✅ Done |
| 0.4 | ~~**DECISION:** Source code on dedicated Mac?~~ | ✅ **No repos** — dedicated Mac stays clean | — | ✅ Done |
| 0.5 | ~~Create GitHub org~~ | ✅ **Already exists** — Happy's dedicated account + org in place | — | ✅ Done |
| 0.6 | Set up dedicated Mac SSH key pair for VPS access (if not existing) | Happy generates, R reviews | R approves key placement | ⬜ Pending |

---

## Phase 1: Internal Tools Track

For Mission Control and future internal tools.

| # | Task | Who | Approval Gate | Status |
|---|------|-----|---------------|--------|
| 1.1 | Configure Syncthing bridge-outbox on dedicated Mac (one-way push to R's Mac) | Happy configures, R approves Syncthing setup | R approves config | ⬜ Pending |
| 1.2 | Create LuLu firewall rules for Syncthing (outbound only to R's Mac Tailscale IP) | Happy proposes rules → R applies | R approves + applies | ⬜ Pending |
| 1.3 | Create GitHub private repo for Mission Control | Happy creates (needs R approval per Rule 2) | R approves | ⬜ Pending |
| 1.4 | Build Mission Control Phase 1 (local): Happy generates dashboard data → bridge-outbox → R reads locally | Happy builds | R approves spec before build | ⬜ Pending |
| 1.5 | Document Mission Control VPS migration procedure (for when R travels) | Happy writes | None (documentation only) | ⬜ Pending |
| 1.6 | **FUTURE:** When R needs remote access — provision Mission Control VPS (Hetzner CX22, ~€4/mo) + Tailscale | R provisions VPS → Happy deploys | R provisions + approves | ⬜ Future |

---

## Phase 2: External Products Track

For when we're ready to build the first external product.

| # | Task | Who | Approval Gate | Status |
|---|------|-----|---------------|--------|
| 2.1 | Create VPS base image setup script (Node.js, Python, Git, GitHub CLI, Tailscale, Discord webhook) — **must include fine-grained PAT setup scoped to single repo only** | Happy writes script | R reviews before first use | ⬜ Pending |
| 2.2 | Create VPS agent briefing template (what gets handed to a VPS coding agent: spec, repo access, Discord webhook URL, constraints) | Happy writes | None (template only) | ⬜ Pending |
| 2.3 | Set up Discord channel structure: one channel per project (e.g., #project-alpha-dev) | Happy creates channels | R approves channel structure | ⬜ Pending |
| 2.4 | Create VPS teardown checklist (how to safely destroy a project VPS: backup code to GitHub, revoke API keys, delete server) | Happy writes | None (documentation only) | ⬜ Pending |
| 2.5 | **PER PROJECT:** R + Happy agree on project → Happy writes spec → R provisions VPS → Happy sets up VPS agent → VPS agent builds → Happy steers → product ships | Both | R approves: project, VPS provisioning, final deploy | ⬜ Repeatable |
| 2.6 | **FUTURE (if needed):** Set up Hetzner API key with spend limits for autonomous provisioning | R creates restricted API key → Happy stores on dedicated Mac | R creates + sets limits | ⬜ Future |

---

## Quick Reference: What Lives Where

| Thing | Where it lives | NOT here |
|-------|---------------|----------|
| Happy's workspace (PARA, agents, configs) | Dedicated Mac | — |
| Internal tool source code | GitHub private repos | ~~Dedicated Mac~~ |
| Internal tool runtime | Dev VPS | ~~Dedicated Mac~~ |
| External product source code | GitHub private repos | ~~Dedicated Mac~~ |
| External product runtime | Project VPS (one per project) | ~~Dedicated Mac~~ |
| Customer data | Project VPS only | ~~Dedicated Mac, GitHub~~ |
| Cloud provider credentials | With R only (Phase 0) | ~~Dedicated Mac~~ |
| VPS SSH keys | Dedicated Mac | — |
| Dashboard outputs | bridge-outbox → R's Mac | — |

---

## Decision Log

| Decision | R's Answer | Date |
|----------|-----------|------|
| Cloud provider | ✅ Hetzner (€4-8/mo per VPS) | 2026-03-06 |
| Provisioning model | ✅ Hybrid — manual first, API key later | 2026-03-06 |
| Source code on dedicated Mac | ✅ No repos — dedicated Mac stays clean | 2026-03-06 |
| GitHub org | ✅ Already exists | 2026-03-06 |
| Bridge-inbox | ✅ One-way only. VPS file exchange via SCP over Tailscale | 2026-03-06 |
| GitHub push policy — internal tools | ✅ Rule 2 applies — R approval before push | 2026-03-06 |
| GitHub push policy — external products | ✅ VPS agents push freely, Happy reviews PRs | 2026-03-06 |
| GitHub repo segregation | ✅ Each VPS gets fine-grained PAT scoped to single repo only | 2026-03-06 |

## Unresolved (Next Conversation)

| Item | Notes |
|------|-------|
| Credential exposure audit (2 CRITICAL + 2 HIGH from 2026-03-05) | Phase 0 prerequisite — resolve before any new infra |
| VPS agent Anthropic API keys | Separate per-project key (recommended) vs shared key — R hasn't confirmed |
