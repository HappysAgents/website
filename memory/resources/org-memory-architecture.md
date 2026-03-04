# Organizational Memory Architecture for Agent-Run Companies
*Designed by Systems Architecture Subagent | 2026-03-03*
*For: R via Happy | Status: Complete*

---

## 1. Problem Diagnosis: What's Actually Breaking and Why

### The Fundamental Issue

The current system solves **durability** (decisions survive sessions) but fails at three harder problems: **discovery**, **propagation**, and **freshness**. These are distinct failure modes:

**Discovery failure:** An agent starting a task doesn't know what's relevant. The workspace has 50+ files across PARA folders, daily notes, agent specs, company docs. Reading everything would burn context window and tokens. Not reading enough means working with stale or missing context. There's no index, no routing, no "what do I need to know for THIS task?"

**Propagation failure:** When the Creative Lead finalizes the Brand Playbook, there's no mechanism to alert the Content Agent, Dev Agent, or Graphic Design Agent. The decision is written to a file — but no one else knows to look there. The only coordination point is Happy, who can't be in every session simultaneously.

**Freshness failure:** An agent reads a file from 3 days ago. That file was superseded yesterday by a new decision. There's no version indicator, no "superseded by" marker, no way to know the information is stale without reading every subsequent daily note.

### Why the Current Mitigations Don't Scale

| Mitigation | What it solves | What it doesn't |
|---|---|---|
| Real-time write rule | Durability — decisions hit disk | Discovery — who reads which file? |
| Heartbeat sweep | Catches missed writes | Doesn't route info to relevant agents |
| Memory sweep cron (10 min) | Periodic catch-up | Still doesn't solve discovery or propagation |
| Happy as coordinator | Human-in-loop routing | Single point of failure; can't scale to 100 agents |
| PARA structure | Organization of files | No semantic routing — structure ≠ discoverability |

### The Scale Inflection Points

- **5 agents:** Happy can manually coordinate. Marginal failures.
- **15 agents:** Happy can't track all cross-dependencies. Silent contradictions emerge.
- **50+ agents:** The workspace becomes a haystack. Agents routinely act on stale info. Brand inconsistency, strategy drift, duplicated work become systemic.

---

## 2. Research Synthesis

### What Works in Human Organizations

#### Architecture Decision Records (ADRs) — Software Industry
ADRs (pioneered by Michael Nygard, widely adopted at AWS, Google, Spotify) solve the "why did we decide this?" problem. Key properties:
- **Append-only log**: decisions are never deleted, only superseded
- **Numbered and indexed**: ADR-001, ADR-002 — sequential, scannable
- **Status field**: `proposed → accepted → deprecated → superseded by ADR-XXX`
- **Context + Decision + Consequences**: forces structured thinking
- AWS reports that teams with >200 ADRs can onboard new members 3x faster because they can skim headlines to get the decision landscape

**Agent-native insight:** ADRs are perfect for agents — structured, scannable, and the status field solves freshness. An agent can read the ADR index in seconds and know which decisions are current.

#### Common Operating Picture (COP) — Military
The military's COP concept enables tactical units from lowest echelon to highest commander to "independently and immediately sense and act in a collaborative fashion." Key principles:
- **Single authoritative view** of the battlespace shared across all units
- **Layered information**: strategic (big picture) vs. tactical (my sector) vs. operational (current mission)
- **Push updates**: when the picture changes, affected units are notified — they don't poll
- **Commander's Intent**: every unit knows the WHY, so they can act autonomously when comms break down

**Agent-native insight:** Commander's Intent = `company/mission.md`. The COP = a real-time status file that agents read at startup. Push updates = the propagation mechanism we need to build.

#### RFCs and CHANGELOGs — Open Source
Large open-source projects (Rust, React, Fuchsia) use RFCs for cross-team decisions and CHANGELOGs for what changed. Key properties:
- **RFCs are proposals**: they invite input before decisions are locked
- **CHANGELOGs are announcements**: they broadcast what changed after the fact
- **CONTRIBUTING.md**: tells every new contributor what to read and what rules to follow
- **Semantic versioning**: makes freshness machine-readable

**Agent-native insight:** The CHANGELOG pattern — a single, chronological, append-only file of what changed — is the simplest and most powerful propagation mechanism for agents. It's literally a "what's new" feed.

### What Works in Multi-Agent Systems

#### Blackboard Architecture (Classic AI, Updated for LLMs)
The blackboard pattern (Erman et al., 1980; updated by recent LLM-MAS papers from arXiv 2025) uses:
- **Shared knowledge store** (the "blackboard") that all agents read/write
- **Knowledge sources** (specialist agents) that contribute when triggered
- **Control component** that decides which agent acts next based on blackboard state

Recent LLM-based blackboard systems (arXiv:2510.01285, arXiv:2507.01701) show:
- Agents communicate through a shared memory space, not direct messaging
- The blackboard replaces individual agent memory modules
- Competitive performance with lower token usage vs. direct agent-to-agent communication

**Agent-native insight:** Our shared filesystem IS a blackboard. The missing piece is the control/routing layer that tells agents what to read.

#### Stigmergy — Indirect Coordination
Stigmergy (from ant colony behavior) is coordination through environment modification:
- Agents leave traces in the environment
- Other agents detect those traces and modify their behavior
- No direct communication needed — the environment IS the communication medium

**Agent-native insight:** File-based stigmergy is the most natural fit for our system. Agents write decisions to files (leave traces). Other agents read those files on startup (detect traces). The key is making the traces discoverable — which is exactly what the CHANGELOG solves.

---

## 3. The Proposed Architecture

### Core Design Principles

1. **The Decision Log is the single source of truth** — not scattered across files
2. **Every agent reads a startup briefing** — computed from its role, not a generic dump
3. **Changes propagate through a CHANGELOG** — append-only, chronological, scannable
4. **Freshness is explicit** — every authoritative document has a version and date
5. **The architecture works with files today** — no new infrastructure required

### 3.1 The Decision Log (`decisions/`)

A new top-level directory that captures every material decision as a structured record.

```
decisions/
├── INDEX.md                    # Master index: decision number, title, status, date
├── DEC-001-brand-playbook.md   # Individual decision records
├── DEC-002-pricing-strategy.md
├── DEC-003-tech-stack.md
└── ...
```

**Decision record format:**

```markdown
# DEC-XXX: [Title]

- **Status:** active | superseded | deprecated
- **Superseded by:** DEC-YYY (if applicable)
- **Date:** 2026-03-03
- **Author:** Creative Lead Agent
- **Approved by:** R
- **Affects:** content-agent, graphic-design, dev-agent
- **Tags:** brand, visual-identity, content

## Context
[Why this decision was needed]

## Decision
[What was decided — the actual content]

## Consequences
[What changes as a result — what agents need to do differently]

## References
- Source file: memory/resources/brand-playbook.md
- Related: DEC-001
```

**Why this works:** The `INDEX.md` is small enough for any agent to scan in one read. The `Affects` field tells agents which decisions are relevant to them. The `Status` field solves freshness. The `Superseded by` field creates a chain of truth.

### 3.2 The CHANGELOG (`CHANGELOG.md`)

A single, append-only file at workspace root. Every material change gets a one-line entry.

```markdown
# CHANGELOG

All material decisions, updates, and state changes. Agents: read the last 7 days on startup.

## 2026-03-03

- **[DECISION]** DEC-015: Brand Playbook v1.0 locked. Affects: content-agent, graphic-design, dev-agent. See decisions/DEC-015-brand-playbook-v1.md
- **[UPDATE]** company/whats-happening.md updated: Content Agent now active, first blog post in review.
- **[RULE]** All social media copy must use Brand Voice Tier 1 vocabulary. See decisions/DEC-015.

## 2026-03-02

- **[DECISION]** DEC-014: Blog launch date set for March 10. Affects: content-agent, dev-agent.
- **[STATUS]** Project happy-website moved to Phase 2 (content integration).
```

**Why this works:** It's a single file. It's chronological. Agents read the last N days. Each entry has a type tag, affected agents, and a pointer to the full decision. It's the "what's new since you last woke up" feed.

### 3.3 Agent Startup Protocol (The Briefing)

Every agent — main session, sub-agent, or cron job — follows a startup protocol. This is the discovery solution.

**Tier 0: Always read (every agent, every session)**
```
1. Own agent spec (agents/<role>.md)
2. CHANGELOG.md (last 7 days)
3. company/mission.md
```
Cost: ~2-4KB. Fits in any context window. Gives every agent situational awareness.

**Tier 1: Role-relevant reads (based on Affects tags in CHANGELOG)**
```
4. Any decision record tagged with my role from recent CHANGELOG entries
5. company/whats-happening.md (if task involves cross-agent coordination)
```

**Tier 2: Task-specific reads (based on the actual task)**
```
6. Relevant project files (memory/projects/<project>/)
7. Relevant resource files (memory/resources/<topic>.md)
8. company/strategy.md (if task involves strategic decisions)
```

**How this is implemented:** Each agent spec file gets a new section called `## Startup Reads` that lists the Tier 0 and Tier 1 files for that agent. The spawning agent (Happy) includes this in the task brief. For sub-agents, the spawn prompt includes: "Before starting, read CHANGELOG.md (last 7 days) and check if any decisions affect your work."

### 3.4 The Propagation Protocol

When a decision is made:

**Step 1: Write the decision** (same turn — existing real-time write rule)
- Write to `decisions/DEC-XXX-<slug>.md` using the decision record format
- Update `decisions/INDEX.md` with the new entry

**Step 2: Update the CHANGELOG** (same turn)
- Append a one-line entry to `CHANGELOG.md` with type, summary, affected agents, and pointer

**Step 3: Update affected authoritative documents** (same turn)
- If the decision changes a living document (e.g., Brand Playbook), update the document AND bump its version header

**Step 4: Active notification** (if decision is critical)
- For decisions tagged as critical, Happy sends a notification to affected agent channels
- This uses OpenClaw's existing cron + message tools to push alerts
- Not every decision needs active notification — the CHANGELOG handles routine discovery

**Criticality levels:**
- **Routine:** CHANGELOG entry only. Agents pick it up on next startup. (Most decisions)
- **Important:** CHANGELOG + update whats-happening.md. Agents see it in Tier 0 reads.
- **Critical:** CHANGELOG + active notification via Happy to affected channels. (Brand playbook locked, pricing changed, security incident)

### 3.5 The Freshness Protocol

Every authoritative document gets a version header:

```markdown
---
version: 2.1
last_updated: 2026-03-03
updated_by: Creative Lead Agent
status: active
supersedes: v2.0 (2026-03-01)
changelog_ref: DEC-015
---
```

**Freshness rules:**
1. Before acting on any document older than 3 days, check CHANGELOG.md for updates affecting that document
2. If a decision record says `Status: superseded`, follow the chain to the current decision
3. If `whats-happening.md` shows a project status that conflicts with your task brief, ask Happy before proceeding
4. The CHANGELOG is the freshness oracle — if it's not in the CHANGELOG, nothing changed

### 3.6 The Scale Architecture (100 Agents)

At 100 agents, the system needs three properties: **bounded reads**, **efficient routing**, and **conflict prevention**.

#### Bounded Reads

Every agent reads a **fixed ceiling** of startup context regardless of org size:
- CHANGELOG.md (last 7 days): grows linearly with decisions, not agents. ~50 lines/week = manageable.
- Own spec file: fixed per agent.
- `company/mission.md`: ~1 page, rarely changes.
- Relevant decisions: filtered by `Affects` tag — only decisions that name your role.

At 100 agents making 10 decisions/day, the CHANGELOG has ~70 entries/week. An agent filters by its own name in the Affects field: ~5-10 relevant entries. This is O(decisions-per-role), not O(total-decisions).

#### Efficient Routing: The Role Registry

```
company/
├── mission.md
├── strategy.md
├── whats-happening.md
├── okrs.md
└── roles.md          # NEW — maps roles to responsibilities and dependencies
```

`roles.md` is a simple table:

```markdown
# Role Registry

| Role | Agent Spec | Depends On | Publishes To |
|------|-----------|------------|-------------|
| creative-lead | agents/creative-lead.md | mission, strategy | brand-playbook, design-system |
| content-agent | agents/content-agent.md | brand-playbook, mission | blog posts, social copy |
| dev-agent | agents/dev-agent.md | design-system, tech-stack | website, tools |
| graphic-design | agents/graphic-design.md | brand-playbook, design-system | visual assets |
| security-agent | agents/security-agent.md | tech-stack | security reviews |
```

**The `Depends On` column is the routing table.** When a decision updates `brand-playbook`, the CHANGELOG author (or Happy) cross-references `roles.md` to tag all agents that depend on it. This is mechanical, not intuitive — it scales.

#### Conflict Prevention: Domain Ownership

Each authoritative document has exactly one owner:

```markdown
# Document Ownership (in roles.md)

| Document | Owner | Can Read | Can Write |
|----------|-------|----------|-----------|
| Brand Playbook | creative-lead | all | creative-lead only |
| Tech Stack | dev-agent | all | dev-agent + R approval |
| Pricing | R (direct) | happy, finance | R only |
| Blog Content | content-agent | all | content-agent + R approval |
```

**Rule:** If you need to change a document you don't own, you write a decision proposal (DEC-XXX with Status: proposed) and the owner reviews it. This prevents agents from overwriting each other's work.

### 3.7 File Structure (Complete)

```
openclaw-workspace/
├── SOUL.md                         # Happy's identity
├── USER.md                         # About R
├── AGENTS.md                       # Operating instructions
├── MEMORY.md                       # Long-term curated memory
├── CHANGELOG.md                    # NEW — append-only change feed
├── tacit-knowledge.md              # R's patterns
│
├── company/                        # Shared company brain
│   ├── mission.md                  # What we're building
│   ├── okrs.md                     # Current objectives
│   ├── strategy.md                 # Moat framework
│   ├── whats-happening.md          # Cross-agent awareness
│   ├── roles.md                    # NEW — role registry + dependency map
│   └── playbook.md                 # Decision frameworks (Happy + R only)
│
├── decisions/                      # NEW — decision log
│   ├── INDEX.md                    # Master index
│   └── DEC-XXX-<slug>.md          # Individual decision records
│
├── agents/                         # Agent specs (Tier 2)
│   ├── creative-lead.md
│   ├── content-agent.md
│   ├── graphic-design.md
│   ├── dev-agent.md
│   └── security-agent.md
│
├── memory/                         # Operational memory (PARA)
│   ├── YYYY-MM-DD.md
│   ├── projects/
│   ├── areas/
│   ├── resources/
│   └── archives/
│
└── projects/                       # Built products
```

---

## 4. Implementation Roadmap

### v0 — This Week (80% of the value, ~4 hours of work)

**Goal:** Solve discovery and propagation for the current 5 agents with minimal new infrastructure.

**Step 1: Create `CHANGELOG.md`** (30 min)
- Create the file at workspace root
- Backfill the last week's key decisions from daily notes and project files
- Add instruction to AGENTS.md: "Append to CHANGELOG.md whenever you make a material decision"

**Step 2: Create `decisions/` with first 5-10 records** (2 hours)
- Create `decisions/INDEX.md`
- Backfill the most important active decisions (brand direction, tech stack choices, blog strategy, agent org structure)
- Each gets proper format with Status, Affects, Tags

**Step 3: Add Startup Protocol to agent specs** (1 hour)
- Add `## Startup Reads` section to each agent spec
- List the Tier 0 files every agent must read
- List the Tier 1 files specific to that agent's role

**Step 4: Update Happy's spawn template** (30 min)
- Every sub-agent spawn prompt includes: "Before starting, read CHANGELOG.md (last 7 days) and your agent spec's Startup Reads section"
- Every spawn prompt includes the real-time write rule AND the CHANGELOG update rule

**What this gives you immediately:**
- Every agent knows what changed recently (CHANGELOG)
- Every agent knows which decisions affect its role (Affects tags)
- Every agent knows what to read on startup (Startup Reads)
- Stale info is detectable (decision Status field)

### v1 — Next 2 Weeks

**Goal:** Add the routing layer and freshness guarantees.

**Step 5: Create `company/roles.md`** — The dependency map that makes CHANGELOG tagging mechanical.

**Step 6: Add version headers to all authoritative documents** — Brand Playbook, tech stack decisions, pricing, etc. all get the frontmatter block.

**Step 7: Build the propagation cron** — A daily cron job (or part of Happy's heartbeat) that:
- Reads today's CHANGELOG entries
- Cross-references `roles.md` for dependency routing
- Checks if any critical decisions need active notification
- Sends notifications to relevant channels

**Step 8: Add document ownership to `roles.md`** — Prevents agents from overwriting each other's authoritative documents.

### v2 — Month 2+ (When Agent Count Exceeds 15)

**Goal:** Scale the architecture for many concurrent agents.

**Step 9: CHANGELOG segmentation** — Split CHANGELOG into domain channels:
```
CHANGELOG.md          → global (critical decisions only)
changelogs/brand.md   → brand + design decisions
changelogs/tech.md    → technical decisions
changelogs/content.md → content + publishing decisions
changelogs/ops.md     → operational decisions
```
Each agent subscribes to relevant domain changelogs via their spec file.

**Step 10: Decision proposal workflow** — Formalize the RFC-like process:
- Agent creates `DEC-XXX` with `Status: proposed`
- Affected agents (per `roles.md`) review
- Happy or R approves → Status changes to `active`
- CHANGELOG entry is written

**Step 11: Automated briefing generation** — A cron job or startup script that:
- Reads the agent's spec
- Pulls relevant CHANGELOG entries
- Pulls relevant decision records
- Generates a compiled briefing document per agent
- Cached and refreshed daily

**Step 12: Cold memory retrieval** — When the knowledge base exceeds manual management:
- MCP retrieval server for PARA resources
- Semantic search across decision records
- This is the Vasilopoulos Tier 3 implementation

---

## 5. What This Looks Like in Practice

### Scenario 1: Creative Lead Locks the Brand Playbook

**Today (without architecture):**
1. Creative Lead writes Brand Playbook to `memory/resources/brand-playbook.md`
2. Content Agent starts next day, reads its own spec, starts writing
3. Content Agent has no idea the Brand Playbook exists or was just locked
4. Output violates brand guidelines
5. R catches it, is annoyed, asks Happy to fix it

**With this architecture:**
1. Creative Lead writes Brand Playbook to `memory/resources/brand-playbook.md`
2. Creative Lead writes `decisions/DEC-015-brand-playbook-v1.md` with `Affects: content-agent, graphic-design, dev-agent`
3. Creative Lead appends to CHANGELOG: `**[DECISION]** DEC-015: Brand Playbook v1.0 locked. Affects: content-agent, graphic-design, dev-agent`
4. Happy marks DEC-015 as **critical** → sends notification to Content Agent's channel
5. Content Agent starts next day → reads CHANGELOG → sees DEC-015 → reads the decision record → reads the Brand Playbook → produces on-brand content

### Scenario 2: Pricing Strategy Changes Mid-Sprint

1. R decides to change pricing from freemium to paid-only
2. Happy writes `DEC-022-pricing-paid-only.md` with `Affects: content-agent, dev-agent, finance-agent`
3. Happy marks DEC-022 as **critical**
4. DEC-022 supersedes DEC-008 (original freemium decision). DEC-008 gets `Status: superseded by DEC-022`
5. CHANGELOG entry goes out. Active notification goes to all affected agents.
6. Dev Agent, already mid-sprint on freemium UI, reads the notification → adjusts implementation
7. Content Agent adjusts blog post that was referencing freemium model

### Scenario 3: New Agent Onboarding (Agent #47: Legal Review Agent)

1. Happy creates `agents/legal-review-agent.md` with:
   - `## Startup Reads`: CHANGELOG.md, company/mission.md, company/strategy.md, decisions/INDEX.md (filtered by tags: legal, compliance, privacy)
2. Happy adds row to `company/roles.md`:
   - `legal-review | agents/legal-review-agent.md | strategy, pricing, partnerships | legal opinions, compliance flags`
3. Agent spawns → reads its Startup Reads → knows the full decision landscape relevant to its role → produces work consistent with existing decisions

### Scenario 4: "Is This Information Still Current?" (Freshness Check)

1. Content Agent is writing about the tech stack, referencing a doc from 5 days ago
2. Content Agent checks CHANGELOG (last 7 days) for any entries affecting tech-stack
3. Finds: `DEC-019: Migrated from Next.js to Astro. Supersedes DEC-003.`
4. Content Agent reads DEC-019 → uses current tech stack info
5. Without this: Content Agent writes about Next.js, which we no longer use. Embarrassing.

---

## 6. Key Design Decisions in This Architecture

### Why a CHANGELOG and not just a notification system?

Notifications are ephemeral. If an agent wasn't running when the notification fired, it misses it. The CHANGELOG is durable — it's always there, always complete, always scannable. It's the difference between a pager (you miss it if you're asleep) and an inbox (it waits for you).

### Why structured decision records and not just daily notes?

Daily notes are journals — they capture what happened chronologically. Decision records capture what was decided, why, and what it affects. An agent looking for "what's our brand voice?" doesn't want to scan 30 days of daily notes. It wants `DEC-015`.

### Why not a database?

Files work today. Every agent can read them. No new infrastructure. No schema migrations. No query language to learn. The filesystem IS our database, and `grep` IS our query engine. When we need more, the MCP retrieval server is the natural next step — but that's v2, not v0.

### Why role-based routing instead of topic-based?

Roles are stable. Topics are emergent and fuzzy. "Does this decision affect brand?" is ambiguous. "Does this decision affect the content-agent?" is concrete — you look at `roles.md`. Role-based routing scales because the number of roles grows slowly (maybe 2-3 new roles per month), while the number of topics grows fast.

### Why append-only?

Append-only systems are simple, debuggable, and conflict-free. Two agents can both append to CHANGELOG.md without overwriting each other (unlike editing a shared document). Append-only also means the CHANGELOG is a complete audit trail — you can always reconstruct what happened and when.

---

## 7. Risks and Mitigations

| Risk | Mitigation |
|------|-----------|
| Agents forget to update CHANGELOG | Add to AGENTS.md as non-negotiable rule. Happy validates on heartbeat. |
| CHANGELOG grows too large | v2 introduces domain segmentation. v0 mitigation: agents only read last 7 days. |
| Decision records become stale | Freshness protocol: version headers + superseded chains. Quarterly review cron. |
| File conflicts from concurrent writes | Append-only pattern for CHANGELOG. Decision records are write-once (new records, not edits to old ones). |
| Agents don't read their startup files | Encode in spawn template. It's part of the prompt, not optional. |
| Too much overhead for small decisions | Criticality levels: routine decisions are CHANGELOG-only (one line). Only material decisions get full records. |

---

*Architecture designed 2026-03-03. Next review: when agent count reaches 15 or when first propagation failure occurs under new system.*
