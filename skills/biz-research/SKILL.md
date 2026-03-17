---
name: biz-research
description: Structured business opportunity research workflow. Use when evaluating whether to pursue a business idea, market opportunity, or product direction. Produces a standardized research report with demand validation, competitive landscape, moat analysis, revenue model, scale path, and a clear decision recommendation. Triggers on: "research this opportunity", "is this a good business", "evaluate this idea", "expand on the business angle", "dig into [market/opportunity]", "opportunity brief for [topic]".
---

# Business Opportunity Research

Produces a structured, decision-ready research report. Follow phases in order. Write outputs to file at each phase — never hold in memory.

## Strategic Context Pre-Load (Do Before Any Research)

Before Phase 0, load the following files to ground the entire analysis in our actual situation:

1. `COMPANY.md` — current projects, agent capabilities, locked decisions
2. `memory/projects/idea-pipeline/IDEAS.md` — filter criteria + killed ideas (don't re-evaluate dead ends)
3. `skills/biz-research/references/our-assets.md` — current asset inventory (distribution, IP, brand, constraints)
4. `tacit-knowledge.md` — R's decision patterns and hard rules
5. `memory/resources/lean-startup-methodology.md` — how we validate ideas (MVP types, sprint structure, autonomy map). This shapes the first sprint recommendation in Phase 10.
6. `memory/resources/builder-playbook.md` — how we actually build things (VPS model, Hetzner costs, Claude Code, GitHub, approval gates). This grounds cost and timeline estimates in Phases 5 and 6.

These files are the operating context. The research answers the question: *given who we are, what we have, and how we build — is this the right opportunity for us specifically, and exactly how would we validate it first?*

---

## Idea Filter Gate (Run Before Phase 0)

Check the opportunity against the 4 mandatory criteria from IDEAS.md. If it fails any one:
→ Recommend Pass immediately. Write a one-line reason. Do not run full research.

| Criteria | Pass? |
|----------|-------|
| Agent-buildable — agents can build it end-to-end without significant R involvement | |
| Agent-monetizable — agents can acquire customers + process payments themselves | |
| Agent-operable — agents can run it day-to-day with minimal human oversight | |
| Pure digital — no physical world dependencies, no logistics, no local ops | |

*Exception: flag it explicitly if a criteria is borderline and strategic learning value justifies going deeper anyway.*

---

## Core Constraints (Non-Negotiable)

- **$1B test**: Every opportunity must have a plausible path to $1B. If the ceiling is $10M, say so explicitly.
- **Moat gate**: Run the moat stress test (Phase 4) before forming a verdict. No moat score ≥ 2 = auto-pass recommendation unless strategic learning value justifies it.
- **Code is not a moat. Features are not a moat.** See `references/moat-framework.md`.
- **No hallucinated data.** If numbers can't be sourced, flag "unverified estimate" — don't present guesses as facts.
- **Write to file at each phase.** Session context is not durable. Files survive.

---

## Output Location

Write to: `memory/projects/[opportunity-slug]/research.md`

Create the project folder if it doesn't exist. Append each phase as it completes — never wait until the end.

---

## Phase 0: Frame the Question

Before any research, write a crisp framing document:

- **Specific opportunity**: What exactly is being evaluated? (Not "managed hosting" — "managed, security-hardened OpenClaw instances for non-technical SMB owners at €29/mo")
- **Assumed customer**: Who buys this? Be specific about role, sophistication level, company size.
- **What triggers this research**: What recent signal made this interesting?
- **Research scope**: What questions must be answered to make a decision?

Output: Add `## Frame` section to research.md before any research begins.

---

## Phase 1: Demand Validation

Find **expressed pain** — real people saying they have this problem and can't solve it.

Search targets (in order of signal quality):
1. Reddit: r/selfhosted, r/SideProject, r/AI_Agents, r/entrepreneur + relevant subreddits
2. Hacker News: search.ycombinator.com for the problem space
3. Twitter/X: complaints, "I wish there was", pricing sensitivity
4. GitHub Issues: complaints in relevant repos
5. Review sites: G2, Product Hunt reviews of existing solutions
6. Community Discords/forums

Signal types to capture:
- **Strong**: "I would pay for this" / "I tried X and it failed because..."
- **Medium**: Repeated complaints about same problem across multiple sources
- **Weak**: Generic "this is hard" without willingness to pay

Flag if demand is **B2C vs. B2B** — these are different businesses.

Output: Add `## Demand Validation` section. Include direct quotes + sources. Score demand: Strong / Moderate / Weak.

---

## Phase 2: Competitive Landscape

Map who already exists. For each competitor:
- Pricing model and price points
- Customer reviews / complaints (what do users hate?)
- Estimated traction (GitHub stars, review count, Alexa/SimilarWeb if available)
- What they DON'T do (the gap)

Also identify:
- **800lb gorillas**: Is AWS/Google/Microsoft already here or moving here?
- **Funded startups**: Any YC / a16z backed companies in this space?
- **Open source alternatives**: Does a free version exist that kills pricing power?

Output: Add `## Competitive Landscape` section. Include gap analysis: what's genuinely unserved?

---

## Phase 3: Customer Clarity

Define the buyer precisely:

- **Who**: Role, company size, technical sophistication
- **Current alternative**: What do they do today without this product?
- **Switching cost from current**: How hard is it to get them to change?
- **CAC estimate**: How hard is it to reach them? What channel?
- **LTV estimate**: What's realistic monthly spend × churn rate?
- **Payback period**: CAC / monthly gross profit

Flag if the buyer and the user are different people (e.g., IT buys, employee uses).

Output: Add `## Customer Profile` section.

---

## Phase 4: Moat Stress Test (Gate)

Read `references/moat-framework.md` for scoring criteria.

Score each dimension 0–3:

| Moat Type | Score (0–3) | Evidence |
|-----------|-------------|----------|
| Network effects | | |
| Proprietary data | | |
| Brand / trust | | |
| Distribution advantage | | |
| Switching costs | | |
| Community lock-in | | |

**Moat Gate Rule:**
- Score ≥ 2 on at least one dimension → continue
- All scores ≤ 1 → recommend Pass unless there's explicit strategic learning value (state it)

Output: Add `## Moat Analysis` section with full table + verdict on gate.

---

## Phase 5: Revenue Model

Identify the strongest pricing model:

- **Subscription**: Predictable, high LTV — requires low churn
- **Usage-based**: Scales with value, harder to forecast
- **Seats/per-agent**: B2B standard, easy to expand
- **Outcome-based**: High margin but hard to measure
- **One-time**: Avoids recurring commitment but limits LTV

Estimate unit economics grounded in our real build costs (from builder-playbook.md):
- **Infrastructure floor**: Hetzner CX22 ~€4/mo per product VPS. Add Anthropic API costs per active agent session. This is the cost baseline per customer for agent-operated products.
- **Realistic gross margin at scale** (target: >70% for software — agent products can be higher if LLM costs stay low relative to price)
- **Breakeven at what customer count?**
- **Monthly recurring revenue needed to be default alive**
- **Token efficiency**: How much LLM spend does this business consume per dollar of revenue? High token burn = low margin at scale.

Output: Add `## Revenue Model` section.

---

## Phase 6: Scale Path

Map the three growth phases, grounded in our actual build model (from builder-playbook.md):

**$0 → $1M ARR**: What's the initial GTM motion? (content, community, cold outreach, product-led?) Realistic time estimate using our stack: VPS setup + Claude Code build = days to weeks for MVP. What's the realistic time from "go" to first paying customer?

**$1M → $10M ARR**: What's the compounding mechanism? What breaks at this stage? In our model: more VPS agents + Claude Code builders. What's the operational overhead per customer? Can Happy manage it without scaling R's time?

**$10M → $100M+ ARR**: What's the flywheel? Where does the ceiling hit? Can this run as an agent-first operation at this scale, or does it require human org-building?

**Agent-operability check per phase**: At each scale stage, explicitly ask — can Happy + VPS agents + Claude Code run this, or does it require R to hire humans? If it requires humans before $10M ARR, the "agent-operable" filter criteria may be failing.

Flag honestly: if this is a lifestyle business ($1-5M ceiling), say so. That's not a bad thing — but it's not the $1B path.

Output: Add `## Scale Path` section.

---

## Phase 7: Why Now + Why Us

Read `references/our-assets.md` for the full current asset inventory before writing this section.

**Why now**: What changed recently (last 6-12 months) that opens this window? Is the window closing? Is this the right moment for us specifically given what we're actively building?

### Part A: Current Asset Match

Map our real assets against what this opportunity requires to win. Be brutal:

| What This Opportunity Requires to Win | Do We Have It? | Strength |
|----------------------------------------|---------------|----------|
| [e.g., distribution to target customer] | Yes / Partial / No | |
| [e.g., technical credibility] | | |
| [e.g., trust in a specific community] | | |

"We could build this" does NOT count as an asset. Only what exists today.

### Part B: Edge Gap Analysis

Identify what we'd need to accumulate to have genuine, defensible edge:

- **Missing assets**: What do we need that we don't have?
- **Build path**: Can we accumulate this faster than competitors? How long does it realistically take?
- **Window check**: Will the opportunity still exist by the time we've built the edge?
- **Deliberate accumulation**: Is there a specific action (content series, community event, partnership, data collection) that builds this edge as a by-product of existing work?

The key question: *Is the edge-building path faster than the opportunity window closing?*

### Part C: Edge We're Already Building

From `references/our-assets.md` — what are we actively accumulating that gives us compounding advantage in this space? Does this opportunity accelerate or diverge from that accumulation?

Output: Add `## Why Now + Why Us` section with all three parts.

---

## Phase 8: Bear Case

What kills this? Force-rank the top 3 risks:

1. **The incumbent move**: What does the $1B player do to kill us? (AWS adds a feature, OpenClaw ships native solution, etc.)
2. **The fragile assumption**: What single assumption, if wrong, collapses the whole thesis?
3. **The timing risk**: Is the window already closing? Did we miss it?

Output: Add `## Bear Case` section.

---

## Phase 9: Decision Recommendation

Synthesize everything into a clear verdict:

**Verdict**: `Pursue` / `Research More` / `Park` / `Pass`

**Confidence**: `High` / `Medium` / `Low`

**One-line rationale**: Why this verdict.

**Top open question** (if Research More): What single thing, if answered, changes the verdict?

**Recommended next step**: Specific, actionable. Not "continue researching" — what exactly, by when.

**Score summary**:
- Demand signal: Strong / Moderate / Weak
- Competitive gap: Clear / Narrow / Crowded
- Moat score: [highest dimension / score]
- Scale ceiling: $xM / $xB / Unknown
- Why us (today): Strong / Weak / None
- Edge gap: Buildable in [timeframe] / Unclear / Not feasible

**IDEAS.md 6-dimension score** (1–5 each, total /30):
- Scalability (path to $1B?):
- Moat (defensible advantage?):
- Speed to first revenue:
- Token efficiency (revenue per dollar of LLM spend):
- R's time required (lower = better):
- Validated demand (evidence people want this NOW):
- **Total: /30**

If verdict is Pursue → write the idea to `memory/projects/idea-pipeline/IDEAS.md` under the appropriate section.
If verdict is Pass → write to Killed section with one-line reason.

Output: Add `## Decision` section as the final entry in research.md.

---

## Phase 10: First Sprint Plan (Pursue verdicts only)

If verdict is Pursue, output a complete first sprint plan using the lean startup framework. This is what Happy executes next — not a vague direction, a specific experiment.

Reference `memory/resources/lean-startup-methodology.md` Section 2 (Hypothesis Design) and Section 3 (MVP Types) when writing this.

**Riskiest assumption**: What single belief, if wrong, kills the entire thesis? Test this first.

**Hypothesis card** (use lean-startup Template 1):
```
We believe [specific customer] experiences [specific problem]
and will [specific behavior] when presented with [specific solution].
We'll know this is true when [measurable outcome].
```

**Success criteria** (set before the experiment runs):
- Fail threshold: < [X]
- Pass threshold: [X–Y]
- Strong signal: > [Y]

**MVP type**: Choose from smoke test / concierge / Wizard of Oz / video / piecemeal / single-feature. Pick the *minimum* that answers the riskiest question. Reference the decision matrix in lean-startup Section 3.

**What Happy runs autonomously** (no R approval needed):
- [List specific tasks]

**What needs R approval before execution**:
- [List specific gates, e.g., spend, external contacts, GitHub repo creation]

**Sprint length**: [1 or 2 weeks]
**End date**: [Set from today + sprint length]
**Escalation triggers**: [Conditions that cause Happy to flag to R mid-sprint]

Output: Add `## First Sprint Plan` section as the final entry in research.md.

---

## Phase 10.5: Go/No-Go Brief (All verdicts)

The final output is a one-page brief written for R to make a fast decision. This is separate from the detailed research — it's the distilled answer to "should we pull the trigger?"

Write this as the very last section of research.md and also post it to Discord when research completes.

```
## 💥 Go/No-Go Brief

**Verdict:** [Pursue / Research More / Park / Pass]

**The opportunity in one sentence:**
[What it is, for whom, at what price]

**The number that matters most:**
[The single data point that most validates or kills this — e.g., "7 Reddit threads in the last 30 days asking for exactly this, no solution exists"]

**Price:** Customers in this space pay $[X]–$[Y]/mo. Our target price: $[Z]/mo. Margin at scale: [X]%.

**First 10 customers — exactly:**
- Where to find them: [specific community/platform/channel]
- How to reach them: [specific first message or approach]
- Why they'll talk to us: [our credibility angle]

**Build cost:**
- Coda estimate: [N] days on a VPS
- Key capabilities needed: [list]
- Dependencies: [anything we need before building]

**Time to first revenue:** [X] weeks from decision if we start today.

**The minimum test:**
[One sentence: what's the cheapest, fastest experiment that tells us if this is real]
[Success criteria: ≥[X] [metric] in [Y] days = proceed to build]

**The one thing that kills this:**
[The single risk that, if true, makes everything else irrelevant]

**Decision:** [✅ Build it / ⏸️ Test first / ❌ Pass]
```

Output: Add `## Go/No-Go Brief` section as the absolute final entry in research.md, and post it to Discord.

---

## Spawning a Research Sub-Agent

For deep research tasks, spawn a sub-agent using this brief structure:

```
Before starting:
1. Read AGENTS.md at /Users/dirtyagent/openclaw-workspace/AGENTS.md
2. Read COMPANY.md at /Users/dirtyagent/openclaw-workspace/COMPANY.md
3. Read the research file at memory/projects/[slug]/research.md if it exists

Research task: [specific phase + question]

Output: Write findings to memory/projects/[slug]/research.md under ## [Phase Name]
- Write incrementally as you find things — do not wait until the end
- Flag "unverified estimate" for any number you cannot source
- Include direct quotes and URLs for all demand signal evidence
- Do not hallucinate traction numbers or market sizes
```

See `references/search-playbook.md` for recommended search queries per phase.
