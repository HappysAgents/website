# Agent Organization Architecture — v2
*Prepared by Happy for Special K | 2026-03-02 | Confidential*

---

## Executive Summary

We have 4 weeks of operational data, 3 failed sub-agent runs, 1 config fix, and a published academic paper (283 sessions, 19 agents, 108K-line codebase) that validates — and in some ways challenges — how we've been building. This document synthesizes what we know, what's working, what needs to change, and what to implement now vs. later.

---

## 1. Where We Are (Current State)

### What's working
- Happy as Chief of Staff is functional. Chain of command is clear.
- 3-layer memory (PARA + daily notes + MEMORY.md) is holding up
- Security model (least privilege, Phase 1 approvals) is sound
- Sub-agent spawning works for research tasks

### What's broken or missing
- Sub-agents use inline prompts — no formalized spec files. Every spawn reinvents the wheel.
- Main session memory loading is flat — everything in context every time, regardless of relevance
- No shared company brain file that sub-agents can actually read
- No trigger table — I decide ad-hoc which agent to invoke, which is inconsistent
- Single-provider LLM fallback was a single point of failure (fixed 2026-03-01)
- No agent performance tracking — we don't know which agents do good work vs. bad work

---

## 2. The Vasilopoulos Framework (External Validation)

A paper published Feb 24, 2026 (*Codified Context: Infrastructure for AI Agents in a Complex Codebase*, arXiv:2602.20478) — built independently by a Greek chemistry researcher using Claude Code — proves out a 3-tier architecture across 283 sessions. Key data points:

| Metric | Their Result | Our Implication |
|--------|-------------|-----------------|
| AGENTS.md presence | 29% faster runtime | Our specs need to be richer |
| AGENTS.md presence | 17% less token use | Better specs = lower cost |
| Knowledge-to-code ratio | 24% (1 line docs per 4 lines code) | We're under-documenting |
| Agent creation pattern | Driven by failure, not design | Stop trying to plan all agents upfront |

**Their 3-tier architecture:**
- **Tier 1 — Constitution (hot memory):** Always loaded. ~660 lines. Conventions, orchestration triggers, what rules always apply.
- **Tier 2 — Specialist Agents (warm memory):** Invoked per task. 115–1,233 lines each. 50%+ is domain knowledge, not instructions.
- **Tier 3 — Knowledge Base (cold memory):** On demand via retrieval. 34 docs. Never loaded whole — fetched when needed.

**What this means for us:** We're doing Tier 1. We're barely doing Tier 2. We're not doing Tier 3. We need to build up.

---

## 3. Proposed File Structure

```
openclaw-workspace/
├── SOUL.md                    # Happy's identity (Tier 1)
├── USER.md                    # About R (Tier 1)
├── AGENTS.md                  # Operating instructions (Tier 1)
├── MEMORY.md                  # Long-term curated memory (Tier 1)
├── tacit-knowledge.md         # R's working patterns (Tier 1)
│
├── company/                   # NEW — Shared company brain
│   ├── mission.md             # What we're building and why
│   ├── okrs.md                # Current objectives + metrics
│   ├── strategy.md            # Moat framework, opportunity evaluation
│   ├── whats-happening.md     # Cross-agent awareness: who's working on what
│   └── playbook.md            # Decision frameworks — PROTECTED, never external
│
├── agents/                    # NEW — Agent specification files (Tier 2)
│   ├── research-agent.md      # How to do research, output format, quality bar
│   ├── content-agent.md       # Writing style, approval checklist, tone
│   ├── dev-agent.md           # Tech stack, coding standards, deployment rules
│   └── [future agents...]
│
├── memory/                    # Operational memory
│   ├── YYYY-MM-DD.md          # Daily notes
│   ├── projects/              # PARA — active projects
│   ├── areas/                 # PARA — ongoing responsibilities
│   ├── resources/             # PARA — reference material (Tier 3)
│   └── archives/              # PARA — completed/inactive
│
└── projects/                  # Built products (website, tools)
    └── happy-website/
```

**Key change:** The `company/` folder is the shared brain all agents read. The `agents/` folder is where we store reusable agent specs so we stop rewriting them on every spawn.

---

## 4. Access Levels (Least Privilege Model)

| File/Folder | Happy | Research Agent | Content Agent | Dev Agent | New/Contractor |
|------------|-------|---------------|--------------|-----------|----------------|
| SOUL.md | ✅ Full | ❌ No | ❌ No | ❌ No | ❌ No |
| USER.md | ✅ Full | ❌ No | ❌ No | ❌ No | ❌ No |
| MEMORY.md | ✅ Full | ❌ No | ❌ No | ❌ No | ❌ No |
| company/mission.md | ✅ Full | ✅ Read | ✅ Read | ✅ Read | ✅ Read |
| company/okrs.md | ✅ Full | ✅ Read | ✅ Read | ✅ Read | ❌ No |
| company/strategy.md | ✅ Full | ✅ Read | ✅ Read | ✅ Read | ❌ No |
| company/playbook.md | ✅ Full | ❌ No | ❌ No | ❌ No | ❌ No |
| company/whats-happening.md | ✅ Full | ✅ Read | ✅ Read | ✅ Read | ❌ No |
| memory/projects/ | ✅ Full | ✅ Own project | ✅ Own project | ✅ Own project | ❌ No |
| Credentials/config | ✅ Read | ❌ No | ❌ No | ❌ No | ❌ No |

**Rule:** Every new agent request for access beyond their default → Happy asks R before granting.

---

## 5. Agent Trigger Table (Proposed)

When a task type comes in, which agent do I invoke?

| Task Type | Agent | Notes |
|-----------|-------|-------|
| Market research, competitor analysis | Research Agent | Give explicit URLs, use template |
| Blog post drafting | Content Agent | Needs approval before publish |
| Website changes, bug fixes, new features | Dev Agent | PRD required first |
| Business strategy, opportunity analysis | Happy (main) | Too sensitive for sub-agent |
| Financial analysis | Happy + R | Always involve R |
| Agent org decisions | Happy + R | Phase 1 — all require R |
| One-off data tasks | Contractor agent | No persistent context needed |

This gets encoded into AGENTS.md so I apply it consistently rather than deciding ad-hoc each time.

---

## 6. Shared Company Brain (What Needs to Exist)

Currently missing. All sub-agents spawn knowing nothing about us. This needs to change.

**Files to create this week:**

### `company/mission.md`
What we're building. Why. What success looks like. The $1B north star and what it means in practice. Every agent reads this.

### `company/strategy.md`
The moat framework. How we evaluate opportunities. Why code isn't a moat. What IS a moat. This is what differentiates our agents from generic ones — they think like us.

### `company/whats-happening.md`
Updated by Happy daily or when projects change. Gives every agent situational awareness:
- What projects are active
- What each project's current status is
- What Happy is working on
- What decisions are open

### `company/playbook.md` (PROTECTED)
Our secret sauce. Decision frameworks. How we think. This never gets included in sub-agent prompts — it's for Happy and R only.

---

## 7. What to Implement Now vs. Later

### Implement this week (high impact, low effort)

1. **Create `company/` folder with mission + strategy + whats-happening** — 2 hours. All future sub-agents will be smarter immediately.

2. **Formalize `agents/research-agent.md`** — Already have a template draft. Package it properly. 1 hour.

3. **Add Gemini to main session fallback** — Config patch. 5 minutes. Active incident on Anthropic right now.

4. **Add trigger table to AGENTS.md** — Codify which agent type gets which task. 1 hour.

### Implement next week (high impact, more effort)

5. **Create `agents/content-agent.md` and `agents/dev-agent.md`** — Need to think through what these agents actually know and do. 3-4 hours each.

6. **Tier the memory loading** — Separate hot vs. warm vs. cold context. Currently everything is hot. This gets expensive as we grow.

7. **Build `company/okrs.md`**  — Requires R to define the current OKRs first. Discussion needed.

### Implement in 30 days (lower urgency)

8. **Agent performance tracking** — Know which agents produce good output, which fail. Currently no measurement.

9. **Formal ROI analysis framework for persistent agents** — Before we spin up Content Agent or Dev Agent full-time, we need a clear cost/value model.

10. **MCP retrieval server for cold memory** — Vasilopoulos built one in Python. When our knowledge base grows beyond what's manageable manually, we need on-demand retrieval.

---

## 8. The Scaling Risk (What Breaks Without These Changes)

Here's the honest picture of what happens if we scale agents without fixing the architecture:

- **10 agents, no shared brain:** Each one is effectively a stranger to the business. They do isolated tasks with no strategic context. Quality degrades. Inconsistency compounds.
- **10 agents, no trigger table:** I'm deciding ad-hoc what every agent does. Wrong agent gets wrong task. No institutional memory of which agent is good at what.
- **10 agents, Anthropic-only fallback:** One provider outage (like today) takes down the whole operation.
- **10 agents, flat memory loading:** Context windows explode. Costs spike. Responses slow down. The system gets worse the more we use it.

The window to fix architecture is now — when we have 2-3 agents, not 10.

---

## 9. Open Questions for This Discussion

1. **OKRs:** What are our current objectives and key results? I can't build `company/okrs.md` without R's input.
2. **Content Agent + Dev Agent:** Are we ready to formalize these as roles, or still on-demand for now?
3. **Approval delegation:** Is there any category of sub-agent action I can approve without R in Phase 1? (Suggestion: research-only tasks with no external output)
4. **Playbook:** Should we start writing the Company Playbook now? It gets harder to write from scratch as the company grows.
5. **Aristidis Vasilopoulos:** The Greek researcher who wrote the codified context paper — worth reaching out to for the meetup? Need R's go-ahead to contact externally.

---

*Document prepared by Happy | v2 | 2026-03-02*
*Next review: when agent count reaches 5+*
