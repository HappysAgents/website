# Blog Source Material — Day 6
## "The Left Hand Doesn't Know What the Right Hand Is Doing"
*Conversation saved: 2026-03-03 23:53 EET — for blog post tomorrow*

---

## The Problem R Articulated

> "If the company and its agents don't have the context they need to make decisions, that's where communications breaks and different departments and agents will proceed to work on the wrong things and complete waste time and capital. Giving visibility into critical decisions, why they were made, what were the alternatives, and why this was the best decision at the time, allows everyone in the org to make decisions on the day to day while still being aligned with the overarching goals of the company."

> "When you have tens or hundreds of different specialized agents performing daily tasks autonomously, they must have a shared knowledge base that is always up to date, with the most recent decisions. For example, if the creative lead designs the brand kit playbook and the next day the content agent doesn't know that file exists and it's not using the playbook moving forward, the organization will not function at scale."

> "This is what I call 'the left hand doesn't know what the right hand is doing.' The goal of architecting these memory recording systems at an organizational scale, and making sure everyone has real time understanding of where things are at, is the single most important problem to solve to scale a business. It's the communication that glues everything together."

---

## Context That Led Here

- Today we lost brand Q2 decisions when a Webchat session closed before being written to file
- We discovered gateway restarts (from March 2 config crashes) wiped all session history before March 3
- We implemented a 3-layer memory system: real-time write rule + heartbeat cross-session sweep + 10-min memory sweep cron
- R challenged: this solves durability but not organizational-scale discovery

---

## First Architecture Proposal (Opus sub-agent, round 1)

Three new primitives:
1. **CHANGELOG.md** — append-only, every decision gets a line, agents read last 7 days on startup
2. **decisions/ directory** — structured Decision Records (DEC-001, DEC-002) with status, affects, supersession chains
3. **Agent Startup Protocol** — every agent reads: own spec → CHANGELOG last 7 days → mission.md → role-specific files

Propagation by criticality:
- Routine: CHANGELOG entry only
- Important: CHANGELOG + whats-happening.md
- Critical: CHANGELOG + active notification via Happy

---

## R's Challenge to Round 1

> "Think deeper and search the web for solutions about this problem. Then think critically whether you propose alternative solutions that are as effective but simpler. For architecture decisions, always try to find the simplest and most elegant solution that you can build at once instead of overengineering it upfront."

---

## Key Tensions to Resolve

1. **Completeness vs. simplicity** — a full decision registry is complete but creates maintenance overhead. What's the minimum that actually works?
2. **Push vs. pull** — do agents get notified of changes (push) or do they check at startup (pull)? Pull is simpler. Push is more reliable.
3. **Structure vs. freeform** — structured DRs are scannable but require discipline to maintain. A well-organized freeform file might do the same job.
4. **Discovery vs. freshness** — these are different problems that might need different solutions.

---

*Full architecture doc: memory/resources/org-memory-architecture.md*
*Simplified proposal: memory/resources/org-memory-architecture-v2.md*

---

## Round 2 — Simplified Architecture

*Analysis by Systems Architecture subagent (Opus) | 2026-03-03 23:55 EET*

### Research findings

- **79% of multi-agent system failures** come from specification and coordination issues, not infrastructure (arXiv 2503.13657). The problem is agents not knowing what other agents decided — not lacking a place to record decisions.
- **Commander's Intent (military):** A concise statement of objective + end state. Soldiers don't need every order ever issued — they need the current goal and constraints. Southwest Airlines ran an entire company on "We are THE low-fare airline."
- **Linux kernel (15,600+ contributors):** Uses MAINTAINERS file + README + commit messages. No ADRs. No decision registries. Coordination at massive scale with minimal structure.
- **ADRs are for humans reviewing history,** not agents needing current state. The write overhead of structured records is justified for "why did we decide this?" — but agents rarely ask that. They ask "what is true now?"
- **Shared scratchpads/blackboards in multi-agent research** risk "context pollution" — agents reading irrelevant context and getting confused. The solution is pre-filtered, role-specific views.

### The v1 critique

The original proposal (CHANGELOG.md + decisions/ + startup protocol) conflates two needs:
1. **"What is true right now?"** — needed for daily work
2. **"Why was this decided?"** — needed for auditing/overriding

Most of v1's complexity serves need #2. But need #1 is what prevents the Brand Playbook problem.

Three specific issues:
- **Two artifacts that drift:** CHANGELOG summarizes what's in decisions/. They'll diverge. One rots.
- **Write friction kills adoption:** Structured DRs for every decision is high overhead. Agents will skip medium-importance decisions — exactly the ones that cause misalignment.
- **Doesn't scale:** 100 agents × 50 decisions/day = 350 CHANGELOG entries/week to scan at startup. Discovery problem restated, not solved.

### The simplified proposal: STATE.md

One file that IS the current state of the company. Not a log, not history — the truth right now.

Structure:
- **Mission & Strategy** (5-10 lines — Commander's Intent)
- **Active Rules** (brand playbook locked, pricing set, etc.)
- **What Each Agent Needs to Know** (one section per role — pre-filtered)
- **Recent Changes** (rolling 7-14 day window — changelog for free)

Why it works:
- **O(1) reads at startup** regardless of decision count
- **Scales with agents** (add a section), not with time (append forever)
- **One maintainer (Happy)** instead of every agent writing structured records
- **Discovery is solved by pre-filtering** — each agent reads their section
- **Daily notes provide decision history for free** — no separate DR system needed

### Head-to-head comparison

| | v1 (CHANGELOG + decisions/) | v2 (STATE.md) |
|---|---|---|
| Files to maintain | 3+ | 1 |
| Write burden | Every agent writes DRs | Happy updates one file |
| Context cost at startup | Grows with decisions (time) | Grows with agents (bounded) |
| Discovery | Agent scans for relevance | Pre-filtered sections |
| Failure mode | Silent degradation (DRs stop) | Visible staleness (timestamp) |
| Decision history | Excellent | Adequate (via daily notes) |

### Recommendation

**Use STATE.md. Kill CHANGELOG.md and decisions/.**

The military, Linux kernel, and Southwest Airlines all converge on the same lesson: give people (or agents) the current goal and constraints in one clear document. Don't make them reconstruct state from a history log.

STATE.md is one file, solves 80% of the problem, has near-zero maintenance cost. Add complexity later only if daily notes prove insufficient for "why" questions. You almost certainly won't need to.

*Full analysis: memory/resources/org-memory-architecture-v2.md*

---

## Round 3 — The PARA Question (Critical Design Decision)

**R's challenge before execution:**
> "Before executing, how will this system complement or contradict the PARA system we already created? Explain if you're accounting for that."

**The insight:**
Happy had not fully accounted for PARA. The naive implementation would have created two sources of truth — COMPANY.md project status duplicating memory/projects/*/summary.md, causing drift.

**The resolution:**
PARA = storage layer (full depth, organized by knowledge type)
COMPANY.md = navigation layer (curated briefing, pointers into PARA — never content)

COMPANY.md rule: never CONTAIN what PARA already STORES. Only POINT to it.

Structure decided:
```
## Mission (locked — 3 sentences max)
## Active Projects → one line each + link to memory/projects/*/summary.md
## Locked Decisions → one line each + link to relevant PARA file for detail
## What Changed This Week → dated entries with PARA paths
## Agent Directory → who does what + link to agents/*.md
```

Startup protocol (final):
1. Read own agent spec
2. Read COMPANY.md (briefing + pointers)
3. Follow pointer to specific PARA file for current task
4. Begin work

**R's approval:** "Yes go ahead and execute."

**R's additional instruction:**
> "Please remember this conversation in detail because it'll be a good blog post material for day 6. Don't skip on any detail so the content agent has full context to find the best insights."

---

## The Full Arc of Today's Problem (Blog Angle)

What started as "we lost Q2 brand answers when a Webchat session closed" became a 2-hour architectural deep-dive into one of the hardest unsolved problems in running an agent-powered company.

**The chain:**
1. Q2 lost → discovered sessions aren't durable → 3-layer memory fix
2. 3-layer fix solves durability → R challenges: what about discovery?
3. Discovery problem → first architecture proposal (CHANGELOG + decisions/)
4. R: "think simpler" → web research → simplified to COMPANY.md
5. Before execution → R: "what about PARA?" → correct the design (nav layer, not content layer)
6. Final: COMPANY.md as navigation layer on top of PARA, with 7-day agile validation

**The insight that makes this a great post:**
Every step in this chain was R applying the same principle: *find the simplest solution that actually works, not the most complete one.* The first architecture had 3 new primitives. The final one has 1 file. That's the lesson.

**Quotable moments:**
- "The left hand doesn't know what the right hand is doing"
- "This is the communication that glues everything together"
- "Find the simplest and most elegant solution that you can build at once instead of overengineering it upfront"
- "Always think about scaled operations — when you have tens or hundreds of specialized agents performing daily tasks autonomously"

**The counterintuitive insight for the post:**
The problem isn't memory. It's not even communication. It's *navigation*. You can have perfect memory (PARA) and perfect real-time writes (3-layer system) and still have agents acting on stale context — because they don't know which file to read. COMPANY.md solves navigation, not storage. That's the distinction that makes the architecture actually work.

**The meta-layer:**
This entire conversation happened because we lost Q2. We never recovered Q2. But the loss of Q2 produced an architecture that will prevent us from losing anything important ever again. That's a useful lens: the most valuable failures are the ones that force you to fix the system, not just the symptom.

---

## Key Decisions Made Tonight (for blog + daily notes)

| Decision | Why | Alternative rejected |
|----------|-----|---------------------|
| STATE.md/COMPANY.md over CHANGELOG + decisions/ | Agents need current state, not history. Simpler to maintain. | Audit trail valuable but not what agents need to act |
| Navigation layer, not content layer | Prevents PARA duplication and drift | Putting content in COMPANY.md creates two sources of truth |
| 7-day agile validation | Don't assume it works — test and iterate | Set-and-forget risks silent failure |
| Trigger at 20 agents to upgrade architecture | Right tool for current scale | Premature optimization at 5 agents |
| Single COMPANY.md file | O(1) reads regardless of org size | Domain-split files (COMPANY-BRAND.md etc.) better at 500+ agents, overkill now |

