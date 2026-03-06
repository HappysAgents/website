# Security Architecture — R's Decisions & Addenda

**Date:** 2026-03-06
**Context:** R reviewed Happy's three documents (clarifying-questions.md, plan-narrative.md, plan-checklist.md) and made decisions with additional context.

---

## Decision Log

| # | Decision | R's Answer | Notes |
|---|----------|-----------|-------|
| 1 | Cloud provider | **Hetzner** | Per Happy's recommendation. €4-8/mo per VPS. |
| 2 | Provisioning model | **Option 3: Hybrid** | Manual first. Revisit API access once pattern is proven. |
| 3 | Source code on dedicated Mac | **No repos** | Happy's recommendation accepted. Dedicated Mac stays clean. |
| 4 | GitHub org | **Already exists** | Happy's dedicated account + org are in place. No action needed. |

---

## Additional Context from Review (Addenda to Plan)

### A. Bridge-inbox: Confirmed Empty — But Note VPS File Exchange

Bridge-inbox stays disconnected from R's personal Mac. If R needs to send files to Happy, SCP over Tailscale is the method.

However, R flagged a future need: **file exchange with VPS instances** (sending files to them, receiving from them). For now, SCP over Tailscale covers this. If it becomes frequent, Happy can propose per-VPS Syncthing folders — scoped so VPS instances cannot see each other.

### B. GitHub Push Rules: Split Policy

R wants a **different policy for internal vs external**:

- **Internal tools** (Mission Control, automations, anything touching operational workflows): **Rule 2 applies.** Happy needs R's approval before pushing to GitHub from the dedicated Mac.
- **External products** (isolated project VPS agents): **Push freely.** VPS agents can commit and push to their own repo without per-push approval. Happy reviews PRs as quality control.

### C. GitHub Repo Segregation: Required

VPS agents must have **repo-scoped access only**. Each project VPS gets a fine-grained PAT scoped to its single repo. No cross-project repo access. This should be part of the standard VPS setup script (checklist item 2.1).

If a VPS is compromised, the attacker gets access to one repo and nothing else.

### D. Mission Control Location (Q1): Not Explicitly Decided

R did not make a final call on Q1 (where Mission Control runs). Happy's plan already covers both phases (local on R's Mac → VPS when traveling), and the phased approach doesn't require a decision now. Phase 1 (local) is the default starting point.

### E. VPS Tooling (Q6): Not Explicitly Decided

R did not specify additional tooling requirements beyond what Happy proposed (Claude Code, Node.js, Python, Git, GitHub CLI, Tailscale, Discord webhook). Happy's proposed base image is approved as the starting point. Adjustments can be made per-project as needed.

---

## Unresolved Items

- **Credential exposure audit findings** (2 CRITICAL + 2 HIGH from 2026-03-05): These are listed as Phase 0 prerequisite. Details and timeline not discussed in this session. Should be the next conversation.
- **VPS agent Anthropic API keys**: Need to decide whether each VPS gets a separate API key with per-project spend limits, or a shared key. Happy's plan recommends separate — R hasn't confirmed.
