# Org Memory Architecture v2: The Simplest Thing That Works
*Senior Systems Architect Review | 2026-03-03*
*Challenge: Is the v1 proposal over-engineered? What gets 80% of the value at 20% complexity?*

---

## 1. Research Findings — What Actually Works

### Key insight from web research

**79% of multi-agent failures come from specification and coordination issues, not infrastructure** (arXiv 2503.13657). The problem isn't that agents can't access decisions — it's that they don't know what decisions exist or are relevant to them.

**The Reddit thread on memory architecture nailed it:** "The gap is that agent A doesn't know what agent B discovered last week. Facts exist in silos. Nobody correlates them." This is a distributed systems problem, not a documentation problem.

**Commander's Intent (military):** A concise, plain-talk statement specifying the objective and desired end-state. It works because it gives autonomy within alignment. Soldiers (agents) don't need every detail — they need the WHY and the current constraints. Southwest Airlines' entire strategy distilled to "We are THE low-fare airline" — every employee could make autonomous decisions aligned with that single statement.

**Large open-source projects (Linux kernel, 15,600+ contributors):** They use a MAINTAINERS file (who owns what), commit messages (what changed and why), and a README. Not ADRs. Not decision registries. Not structured records. The coordination mechanism is surprisingly simple at massive scale.

**ADR effectiveness:** AWS and Microsoft endorse them, but the evidence is mostly anecdotal. The real value of ADRs is for *future humans* who need to understand *why* something was decided. For agents, who just need to know the *current state*, ADRs are write-heavy overhead solving a different problem.

### What this means for our design

The v1 proposal conflates two distinct needs:
1. **"What is true RIGHT NOW?"** — agents need current state to do their work
2. **"Why was this decided?"** — useful for auditing and overriding, but not for daily operations

Most of the v1 complexity serves need #2. But need #1 is what actually prevents the Brand Playbook problem.

---

## 2. Critical Analysis of v1 Proposal

### v1 recap
1. CHANGELOG.md (append-only decision feed)
2. decisions/ directory (structured Decision Records: DEC-001, DEC-002...)
3. Mandatory Agent Startup Protocol (read changelog + relevant DRs)

### What's right about v1
- Identifies the real problem (discovery + propagation)
- Append-only log is the correct primitive
- Startup protocol ensures agents check in

### What's wrong about v1

**Problem 1: Two artifacts when one would do.**
CHANGELOG.md is a summary of what's in decisions/. If you have both, you maintain two representations of the same information. They will drift. One will become authoritative and the other will rot.

**Problem 2: Structured Decision Records won't get written consistently.**
Agents are ephemeral sessions. Asking them to write a structured DR with status, alternatives, consequences, and cross-references for every meaningful decision is high friction. They'll write them for big decisions and skip the medium ones — which are exactly the ones that cause the Brand Playbook problem. "We finalized the color palette" isn't a Big Decision, but the content agent absolutely needs to know it happened.

**Problem 3: The startup protocol doesn't scale.**
"Read CHANGELOG for last 7 days" works at 5 agents making 2-3 decisions/day. At 100 agents making 50 decisions/day, that's 350 changelog entries to read at startup. The agent has to figure out which of those 350 entries matter to its task. This is the discovery problem restated, not solved.

**Problem 4: No mechanism ensures the CHANGELOG is the source of truth.**
What happens when a decision is in a daily note but not in the CHANGELOG? Or in the CHANGELOG but the actual file it references wasn't updated? The system has multiple sources of truth, which means it has no source of truth.

---

## 3. The Simplest Possible Architecture

### Core insight

The real question isn't "how do we record decisions?" — it's "how does every agent always know the current state of the company?"

The answer: **one file that IS the current state.**

### The proposal: `STATE.md`

A single, curated, always-current file that represents the authoritative state of the company. Not a log. Not a history. The truth, right now.

```
# Company State
*Last updated: 2026-03-03 by Happy*
*Update count: 47*

## Mission & Strategy
- We are building [X]. Our north star is [Y].
- Current phase: brand foundation + first revenue
- Key constraint: speed over perfection

## Active Rules
- Brand playbook: memory/resources/brand-playbook.md (locked 2026-03-02)
- Pricing: [not yet set]
- Voice & tone: [defined in brand playbook]

## What Each Agent Needs to Know
### Content Agent
- Brand playbook is LOCKED. Use it for all output.
- Blog series in progress: Day 1-5 published, Day 6 drafting.
### Creative Lead
- Brand playbook shipped and locked.
- Next: social templates, pitch deck visuals.
### Dev Agent
- Website repo: [location]. Stack: [X].
- Brand assets in: [path]
[... one section per agent role ...]

## Recent Changes (last 7 days)
- 2026-03-03: Org memory architecture under review (this file is the prototype)
- 2026-03-02: Brand playbook locked (DEC: R approved final version)
- 2026-03-01: 3-layer memory system implemented (real-time write + heartbeat + cron)
```

### Why this works

**1. Every agent reads exactly one file at startup.** Not a changelog + decisions + mission + role spec. One file. O(1) context, regardless of how many agents or decisions exist.

**2. It scales to 100 agents WITHOUT growing linearly.** Each agent reads the header (mission, strategy, rules) + their own section. A new "Logistics Agent" section is 5-10 lines. Going from 5 to 100 agents adds ~95 sections of ~10 lines each = ~1000 lines. Still fits in a single context window read. And each agent only needs to read ~50 lines (header + their section).

**3. Maintenance is near-zero because it's Happy's job.** Happy already coordinates everything. Instead of asking every agent to write structured DRs, Happy updates STATE.md when decisions happen. This is a natural extension of what Happy already does — the coordinator curates the shared state.

**4. New agents are productive immediately.** Read STATE.md. Done. No "read the last 7 days of changelog and figure out what's relevant to you."

**5. It's always current by definition.** There's no drift between a changelog and a decision record and an actual file. STATE.md IS the truth. If something isn't in STATE.md, agents don't need to know it for their current work.

**6. The "Recent Changes" section at the bottom gives you the changelog for free.** It's just the last N updates. Rolling window, not append-only. Old changes get curated out as they become part of the baseline state.

### What about decision history?

Valid question. "Why did we lock the brand playbook?" won't be answered by STATE.md.

**Answer:** Daily notes already capture this. `memory/2026-03-02.md` has the full context of that decision. If an agent needs to understand WHY (which is rare — they usually just need to know WHAT), they can check the daily notes referenced in STATE.md.

This gives you decision history for free, with zero additional maintenance cost, because daily notes are already being written.

### What about the "Recent Changes" growing too large?

Happy curates it. Keep last 7-14 days. Older changes are absorbed into the baseline sections above. A change from 3 weeks ago that said "Brand playbook locked" doesn't need to be in Recent Changes anymore — it's already in the Active Rules section.

---

## 4. Comparison

| Dimension | v1 (CHANGELOG + decisions/ + protocol) | v2 (STATE.md) |
|---|---|---|
| Files to maintain | 3+ (CHANGELOG, decision records, mission) | 1 (STATE.md) |
| Agent startup reads | CHANGELOG + relevant DRs + mission | STATE.md (header + own section) |
| Write burden per decision | Write CHANGELOG entry + create DR | Happy updates STATE.md |
| Scales to 100 agents | CHANGELOG grows linearly with decisions | Agent sections grow linearly with agents (better) |
| Context window cost | Grows with # of decisions (time) | Grows with # of agents (bounded) |
| Discovery problem | Agent must scan CHANGELOG for relevance | Agent reads own section — pre-filtered |
| Freshness | Depends on DR status fields being maintained | STATE.md is always current by definition |
| Maintenance cost | High — every agent writes structured records | Low — one coordinator curates one file |
| Single source of truth | No — multiple files can conflict | Yes — STATE.md is it |
| Decision history | Excellent (full DRs with alternatives) | Adequate (via daily notes) |
| Failure mode | DRs stop being written; system silently degrades | Happy forgets to update; detectable by staleness |
| Recovery from failure | Hard — missing DRs are invisible | Easy — agents see stale "Last updated" timestamp |

### Key tradeoff

v1 is better at preserving decision rationale (the "why"). v2 is better at everything else: simplicity, maintenance, scalability, discovery, and freshness.

For an AI company in Phase 1 (5 agents, racing to revenue), v2's tradeoff is overwhelmingly correct. You can always add structured decision records later IF the daily notes prove insufficient for "why" questions. You almost certainly won't need to.

---

## 5. Recommendation

**Use STATE.md. Kill CHANGELOG.md and decisions/.**

Here's why, grounded in evidence:

1. **The military solved this problem.** Commander's Intent works because it gives every unit the current state and the goal, not a history of every order ever issued. STATE.md is Commander's Intent for agents.

2. **Linux scales to 15,600 contributors without ADRs.** They use a MAINTAINERS file (who owns what), a README (what this is), and commit messages (what changed). That's it. Our STATE.md is MAINTAINERS + README in one file.

3. **79% of multi-agent failures are spec/coordination issues.** STATE.md solves coordination by giving every agent the same picture. Structured DRs don't help with coordination — they help with auditing.

4. **The simplest system that could work will actually be maintained.** The v1 system requires discipline from every agent in every session. STATE.md requires discipline from one agent (Happy) in one place. The maintenance surface area is 95% smaller.

5. **You can add complexity later.** If STATE.md proves insufficient, adding a decisions/ directory is a 15-minute change. But you can't un-ring the bell of complexity if you start with v1 and it degrades from lack of maintenance.

### Implementation (do this today)

1. Create `STATE.md` in workspace root
2. Happy populates it with current company state (mission, active rules, agent sections, recent changes)
3. Add to AGENTS.md startup protocol: "Read STATE.md" (one line)
4. Happy updates STATE.md whenever a decision is made (same turn — follows the existing real-time write rule)
5. Done. No new infrastructure. No new conventions. No new file formats.

### What about the future?

At 100+ agents, STATE.md might need to split into domain-specific state files (STATE-brand.md, STATE-engineering.md, STATE-ops.md). That's a natural evolution, not a design flaw. Cross it when you get there.

The right time to add structured decision records is when someone asks "why did we decide X?" and daily notes don't have a good answer. That hasn't happened yet, and with good daily note discipline, it may never happen.

---

## 6. The Meta-Lesson

The original v1 proposal was designed by an agent that optimized for completeness. It anticipated every possible future need and built for all of them. That's what good architects do when building bridges.

But we're not building a bridge. We're building a startup. The right architecture for a startup is the one that works today, is easy to change tomorrow, and doesn't collapse under its own weight.

**STATE.md is one file. It solves 80% of the problem. It has near-zero maintenance cost. Start there.**
