# How to Run the Business Opportunity Pipeline

## Architecture

The pipeline has three independent stages. Each can be triggered standalone.

```
[Any Intel Cron]  ──→  Stage 2: biz-research  ──→  Stage 3: Sprint Execution
     ↑                       (10 phases)                  (lean startup)
     └── OpenClaw intel
     └── SaaS intel
     └── Any industry
     └── Manual input from R
```

Stage 2 and Stage 3 don't care where the opportunity came from.
They only care about the input format.

---

## Running Stage 2 Standalone (biz-research)

### Option A: Direct message to Happy

Just say it:
> "Research this opportunity: [one-line description]"
> or
> "Run biz-research on [topic]"

Happy loads the skill, runs all 10 phases, writes output to
`memory/projects/[slug]/research.md`, routes verdict to IDEAS.md.

### Option B: Cron / sub-agent trigger

Spawn an isolated agent with this minimum brief:

```
Run a full biz-research evaluation on this opportunity:

Opportunity: [one-line description]
Why now: [what recent signal made this interesting]
Assumed customer: [who you think buys this]

Follow the skill at:
/Users/dirtyagent/openclaw-workspace/skills/biz-research/SKILL.md

Write output to:
/Users/dirtyagent/openclaw-workspace/memory/projects/[slug]/research.md

Announce summary to Discord when complete.
```

That's it. The skill handles everything else.

### Option C: From an intel cron output

Any intel cron just needs to write to a standardized handoff format
(see "Intel Cron Output Standard" below). Happy or a trigger cron
reads that file and spawns Stage 2 for each unscored opportunity.

---

## Running Stage 3 Standalone (Sprint Execution)

Stage 3 requires:
1. A research.md file with a **Pursue** verdict and a **First Sprint Plan** (Phase 10)
2. R's explicit approval to execute

To trigger Stage 3:
> "Run the sprint for [opportunity slug]"

Happy reads `memory/projects/[slug]/research.md`, extracts the
First Sprint Plan from Phase 10, confirms what needs R approval
before starting, then executes the autonomous parts.

---

## Building a New Intel Cron for Any Topic/Industry

Any intel cron feeds Stage 2 if it outputs in this standard format.

### Step 1: Define the scan scope

What does your intel cron monitor?
- GitHub repos (issues, PRs, releases, discussions)
- Reddit communities
- Tech press / newsletters
- Discord servers
- Product Hunt / Indie Hackers
- Twitter/X accounts
- Industry-specific sources

### Step 2: Define the output structure

Every intel cron MUST end with this standardized section:

```markdown
## Opportunities to Evaluate

| Slug | One-line framing | Why now | Customer guess |
|------|-----------------|---------|----------------|
| [slug] | [what the opportunity is] | [recent signal] | [assumed buyer] |

## Deduplication Check
Opportunities already in IDEAS.md (skip these):
- [list any matching killed/scored ideas]
```

The slug becomes the folder name:
`memory/projects/[slug]/research.md`

### Step 3: Add the Stage 2 trigger

At the end of the intel cron, for each row in the Opportunities table:
1. Check IDEAS.md — if already there, skip
2. Spawn a biz-research sub-agent using Option B above

### Step 4: Create the cron job

```
Schedule: weekly (or whatever cadence fits the industry)
Payload: agentTurn
Session: isolated
Delivery: announce to Discord
```

Point it at your scan sources. End output must follow the standard above.

---

## Reference: Existing Intel Crons

| Cron | Topic | Schedule | Output file |
|------|-------|----------|-------------|
| OpenClaw Weekly Intel | OpenClaw ecosystem | Weekly (TBD) | memory/resources/openclaw-intelligence-YYYY-MM-DD.md |

Add new crons here as they're created.

---

## Quick Trigger Reference

| What you want | How to do it |
|---------------|-------------|
| Research a specific opportunity now | "Run biz-research on [topic]" |
| Run a sprint on an approved idea | "Run the sprint for [slug]" |
| Add a new industry intel cron | Build cron with standardized output → auto-feeds Stage 2 |
| Re-evaluate a parked idea | "Re-run biz-research on [slug]" — Happy checks if anything changed |
| Check what's in the pipeline | "Show me the idea pipeline" → Happy reads IDEAS.md |
