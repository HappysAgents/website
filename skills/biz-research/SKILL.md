---
name: biz-research
description: Structured business opportunity research workflow. Use when evaluating whether to pursue a business idea, market opportunity, or product direction. Produces a standardized research report with demand validation, competitive landscape, moat analysis, revenue model, scale path, and a clear decision recommendation. Triggers on: "research this opportunity", "is this a good business", "evaluate this idea", "expand on the business angle", "dig into [market/opportunity]", "opportunity brief for [topic]".
---

# Business Opportunity Research

Produces a structured, decision-ready research report. Follow phases in order. Write outputs to file at each phase — never hold in memory.

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

Estimate unit economics:
- Realistic gross margin at scale (target: >70% for software)
- Breakeven at what customer count?
- Monthly recurring revenue needed to be default alive

Output: Add `## Revenue Model` section.

---

## Phase 6: Scale Path

Map the three growth phases:

**$0 → $1M ARR**: What's the initial GTM motion? (content, community, cold outreach, product-led?) How long does this take realistically?

**$1M → $10M ARR**: What's the compounding mechanism? What breaks at this stage? (support costs, churn, CAC ceiling?)

**$10M → $100M+ ARR**: What's the flywheel? Where does the ceiling hit?

Flag honestly: if this is a lifestyle business ($1-5M ceiling), say so. That's not a bad thing — but it's not the $1B path.

Output: Add `## Scale Path` section.

---

## Phase 7: Why Now + Why Us

**Why now**: What changed recently (last 6-12 months) that opens this window? Is the window closing?

**Why us specifically**: What do we have that others don't?
- Distribution (audience, community, network)
- Domain knowledge (we've solved this problem ourselves)
- Technical head start
- Relationships / access
- Timing / first-mover in a specific niche

Be honest. "We could build this" is not a why-us.

Output: Add `## Why Now + Why Us` section.

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
- Why us score: Strong / Weak / None

Output: Add `## Decision` section as the final entry in research.md.

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
