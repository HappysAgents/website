# Security Architecture — Actionable Checklist

**Status:** v4 — Mission Control moved to separate project (2026-03-06)
**Date:** 2026-03-06
**Companion doc:** [plan-narrative.md](plan-narrative.md)

---

## TL;DR

Two phases: prerequisites (done) + infrastructure setup. Once Phase 1 is complete, the system is ready to build any product. Mission Control is a separate project — tracked in memory/projects/mission-control/.

---

## Phase 0: Prerequisites ✅ Complete

| # | Task | Who | Status |
|---|------|-----|--------|
| 0.1 | Credential exposure audit (2 CRITICAL + 2 HIGH) | Happy + R | ✅ Done 2026-03-06 |
| 0.2 | Cloud provider decision | R | ✅ Hetzner |
| 0.3 | VPS provisioning model decision | R | ✅ Hybrid (manual first) |
| 0.4 | Source code on dedicated Mac? | R | ✅ No repos |
| 0.5 | GitHub org confirmed | R | ✅ Already exists |

---

## Phase 1: Infrastructure Setup (Execute Now)

Everything needed before provisioning the first VPS.

| # | Task | Who | R Blocker? | Status |
|---|------|-----|------------|--------|
| 1.1 | **Configure Tailscale ACL** — dedicated Mac → VPS allowed; VPS → dedicated Mac blocked; VPS → VPS blocked | R (Tailscale admin console) | 🔴 YES | ⬜ Pending |
| 1.2 | Generate SSH key pair on dedicated Mac for VPS access | Happy | No | ⬜ Pending |
| 1.3 | Write VPS base image setup script (Node.js, Python, Git, GitHub CLI, Claude Code, Tailscale, Discord webhook, fine-grained PAT per repo) | Happy | No | ⬜ Pending |
| 1.4 | Write VPS agent briefing template (spec, repo PAT, Discord webhook URL, constraints doc) | Happy | No | ⬜ Pending |
| 1.5 | Write VPS teardown checklist (backup to GitHub, revoke PAT, delete server) | Happy | No | ⬜ Pending |
| 1.6 | Set up Discord channel structure for projects (#project-[name]-dev naming convention) | Happy | No | ⬜ Pending |

**R actions needed: only 1.1 (Tailscale ACL). Everything else is Happy.**

---

## Phase 2: First Product (Next Week)

Once Phase 1 is complete, follow the builder-playbook.md to build the first external product.

| # | Task | Who | Status |
|---|------|-----|--------|
| 2.1 | R + Happy agree on first product to build | Both | ⬜ Next week |
| 2.2 | Happy writes spec → R approves | Both | ⬜ Next week |
| 2.3 | R provisions Hetzner VPS (~€4-6/mo) | R | ⬜ Next week |
| 2.4 | Happy runs base image script, sets up VPS agent | Happy | ⬜ Next week |
| 2.5 | Build begins | VPS agent + Happy | ⬜ Next week |

---

## Decision Log (Final)

| Decision | Answer | Date |
|----------|--------|------|
| Cloud provider | ✅ Hetzner (€4-8/mo per VPS) | 2026-03-06 |
| Provisioning model | ✅ Hybrid — manual first, API key later | 2026-03-06 |
| Source code on dedicated Mac | ✅ No repos | 2026-03-06 |
| GitHub org | ✅ Already exists | 2026-03-06 |
| GitHub push — internal tools | ✅ Rule 2 applies (R approval before push) | 2026-03-06 |
| GitHub push — external products | ✅ VPS agents push freely, Happy reviews PRs | 2026-03-06 |
| GitHub repo segregation | ✅ Fine-grained PAT scoped to single repo per VPS | 2026-03-06 |
| VPS Anthropic API keys | ✅ Separate per-project key with spend limits | 2026-03-06 |
| Tailscale ACL | ✅ Decided — R to configure (item 1.1) | 2026-03-06 |
| Syncthing scope | ✅ Dedicated Mac ↔ VPS only (future, if needed) | 2026-03-06 |
| Mission Control | ✅ Separate project — not part of architecture setup | 2026-03-06 |
