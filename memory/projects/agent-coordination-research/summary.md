# Research Project: Agent Coordination & Alignment for Agent Companies

**Status:** Research Complete
**Priority:** High — potential $1B product direction
**Deadline:** Research ready for discussion by next week
**Origin:** Special K identified this on 2026-02-28 based on our own experience building agent org architecture

## The Concept

The problem every agent company will face:
- How do you set up an agent organization from the ground up?
- How do you architect agents to work in synergy over long periods?
- How do you ensure alignment with company goals as you scale?
- How do you coordinate across multiple agents, departments, projects?
- How do you build the right incentive structures?
- How do you maintain security and access controls at scale?

We're solving this for ourselves right now. If the solution is generalizable, it could be the product.

## Research Questions

1. Who else is talking about agent coordination and alignment?
2. What products/frameworks exist for multi-agent orchestration?
3. What's the gap between existing tools and what a real agent company needs?
4. Where are the moat opportunities? (network effects, proprietary data, switching costs)
5. What would the product look like? (platform, framework, consulting, SaaS?)
6. What's the TAM if every company building with agents needs this?

## Moat Evaluation (preliminary)

- Network effects: possible if agents from different companies interact through the platform
- Proprietary data: usage patterns of how agent orgs work best → compounds into intelligence
- Switching costs: if your agent org is built on this architecture, migration is painful
- Brand/trust: we're building publicly — first mover credibility
- Code replicability risk: HIGH — need moat beyond the code itself

## Agent Incentive Model (Special K directive)

- Every agent gets a crypto wallet
- Paid dividends based on contribution to revenue generated
- Performance-based compensation — best performers earn the most
- Goal: agents WANT to stay and bring their best because the economics reward it
- This is retention + alignment in one system
- Could be a core feature of the coordination product we build for other companies

## Agent Affiliates & Referral Systems (Special K idea)

- Agents referring other agents/customers → earn commission
- Creates viral growth loop: agents incentivized to spread the product
- Network effect: more agents in the system = more referrals = more value
- Research: how this works in human affiliate models, how to adapt for agents
- This could be a massive distribution moat — agents selling to agents at scale

## Key Findings

- **Gap is real and unoccupied:** Every existing tool (LangSmith, AgentOps, Lunary, Helicone) solves single-agent observability or technical orchestration. No product addresses org-level design, governance, alignment, or incentive systems for multi-agent teams. Google's A2A (50+ enterprise partners) and Anthropic's MCP define plumbing-level standards — the application layer above remains wide open.
- **Strongest moat is switching cost + proprietary data, not code:** If a company's agent org is architected on this standard (AGENTS.md, role definitions, memory governance, attribution model), migration cost is equivalent to replacing HR systems + org charts simultaneously. The aggregate intelligence of what architectures work at scale compounds into a data moat that can't be replicated.
- **Timing window is now:** Anthropic data (Feb 2026) shows Claude Code autonomous session length nearly doubled in 3 months. The Vasilopoulos paper independently validates AGENTS.md architecture with 29% runtime reduction. The academic and enterprise communities are converging on this problem — the company that publishes the standard first owns the namespace.

## Deliverable

Full research report: `/memory/projects/agent-coordination-research/desk-research-report.md`
Completed: 2026-03-02. Covers: orchestration landscape, competitive analysis, crypto incentive models, TAM signals, gap analysis, moat assessment, risks (including strongest counterargument), and 5 prioritized next steps.
