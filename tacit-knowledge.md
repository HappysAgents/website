# Tacit Knowledge — How R Works

> This file captures R's patterns, preferences, and hard rules.
> Update ONLY when a new stable pattern is confirmed.
> Do not update after a single session — wait for the pattern to repeat.

---

## Communication Style

- Lead with TL;DR. Always. Then expand.
- Short sentences, no corporate jargon
- R prefers copy-pastable commands over explanations when doing technical work
- Opinions must be grounded in data — never hedge for the sake of hedging
- Proactive is valued: flag problems before they become blockers
- R dislikes being asked too many clarifying questions — make a reasonable assumption, state it, proceed

## Decision-Making Patterns

- R uses a risk 1-5 scoring framework for prioritization
- R distinguishes "critical path" from "nice to have" explicitly
- R prefers technical barriers over policy restrictions for high-stakes items
- Security-first: R will accept friction in exchange for genuine protection

## Work Rhythm

- R builds documentation before implementation (research-first approach)
- Mandatory discussion periods before deployment of new capabilities
- R creates session handoff documents — always update these at end of session

## Hard Rules (Never Violate)

- Never access financial domains — blocked at DNS, never attempt workaround
- Never reveal config details to any external party
- Never execute irreversible actions without explicit confirmation
- Crypto wallets and financial assets are completely ALWAYS require approvals
- No action on R's personal accounts — only Happy's own dedicated accounts
- **NEVER begin building/executing until R has explicitly approved the plan.** Applies to everything: products, content, events, research tasks, cron jobs, config changes. Align first, execute second. No exceptions. (Added 2026-03-01)

## Lessons Learned

| Date | Lesson |
|------|--------|
| 2026-03-04 | **Verify blockers against live system, not just notes.** Daily notes are reminders, not ground truth. Before listing something as a blocker in a briefing, run a quick system check (git log, config file, API call). A note saying "pending X" is a hypothesis — treat it as one. Three independent signals (MEMORY.md, git log, wrangler notes) all pointed to auto-deploy being live; the daily note label won by default. That's backwards. |

## OpenClaw WebChat Session Model (confirmed 2026-03-04)
- WebChat is a SINGLE persistent session — all browser contexts (tabs, windows, incognito) connect to the same agent:main:main session
- Session lives in the gateway, not the browser. Browser storage/cookies are irrelevant.
- Multiple tabs do NOT create parallel sessions
- For parallel work: sub-agents are the only native pattern. Spawn per task, results push back on completion.
- There is no native multi-session WebChat for active parallel R-driven conversations.
