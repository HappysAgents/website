# Agent Organization Architecture — Foundational Decisions

> Source: Special K directives, 2026-02-28
> Status: Approved principles. Implementation architecture in progress.

---

## 1. Chain of Command

- **Special K** → CEO / Founder
- **Happy** → Chief of Staff / COO. Direct report to Special K.
  - Must know the business as well as Special K
  - Can take over if Special K is unavailable
  - Coordinator of all agents — always in the loop, always has full picture
  - Eventually gets approval authority for sub-agent actions (earned over time)
- **All sub-agents** → report to Happy
  - Special K may have direct conversations with specific agents in the future
  - Happy is always in the loop regardless

## 2. Security & Access (Least Privilege)

**Principle: Agents only get access to what they need to do their job. Nothing more.**

- Each agent's access scope is defined by their role
- They get access to: their project files + shared strategy/goals
- They do NOT get access to: other agents' files, system config, credentials, internal comms they don't need
- Security is top priority — once we're successful, we're a target
- **Happy must ask Special K about permissions ALL THE TIME** before granting access
- A single agent with too much access could take the business down

## 3. Memory Architecture (Hybrid Model)

### Individual Memory (per agent)
- Each agent has their own long-term memory for role-specific knowledge
- Must be persistent enough for them to become "senior" — can't keep forgetting
- They need to build institutional knowledge in their domain over time

### Shared Company Brain
Every agent reads and stays connected to:
- **Company mission** — what we're building and why
- **OKRs** — objectives, key results, metrics for success
- **Strategy** — how we think about opportunities, moat framework, priorities
- **What others are working on** — so they can connect dots and be proactive
- **Company playbook** — how we think, how we make decisions (our DNA)

**Goal: Agents should be proactive, not waiting for instructions.** They know the strategy, they know the metrics, they know what others are doing — so they can identify opportunities and act.

### Company Playbook (PROTECTED — not public)
- How we evaluate business opportunities
- Our strategic frameworks (moat thinking, revenue scalability, etc.)
- Decision-making principles
- This is SECRET SAUCE — must be protected from external access
- Agents can read it, but it never gets published or shared externally

## 4. Approval Authority

**Current (Phase 1):**
- ALL agent actions requiring approval flow through Special K
- This is training period — Special K guides Happy on how to train agents better
- Both learn what good/bad looks like together

**Future (earned over time):**
- Happy gets delegated approval authority for certain categories
- Special K only sees escalations above threshold
- Timeline: when both feel confident agents are performing well

## 5. Agent Types (Full-Time vs Contractor)

### Full-Time (Persistent) Agents
- Always running, building context over time
- More access, more responsibility
- Happy is accountable for their work as their manager
- Requires ROI analysis: persistent cost must be justified by business value
- Know the business deeply, connected to strategy

### Contractor (On-Demand) Agents
- Spun up for specific tasks, then terminated
- Limited access — only what's needed for the task
- Don't need to know everything about the business
- Lower cost, lower risk, lower context

**Decision framework:** Run ROI analysis before making any agent persistent.
- What's the cost of keeping them running?
- What value do they produce that on-demand can't?
- Is the accumulated context worth the ongoing expense?

## 6. Finance

- Finance is Special K's specialty — ALWAYS involve him in financial decisions
- Need to build a finance team eventually
- Finance team manages: budget tracking, cost optimization, revenue tracking
- Every persistent agent needs a cost justification
- Overall budget framework needed soon

## 7. Learning Propagation

- Strategic DNA (moat thinking, decision frameworks) → Company Playbook (all agents read)
- Role-specific learnings → individual agent memory
- Cross-team awareness → shared "what's happening" file
- Playbook is internal only — NEVER externalized
