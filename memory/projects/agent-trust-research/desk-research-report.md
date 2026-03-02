# Agent Trust: Desk Research Report
**Date:** 2026-03-01  
**Researcher:** Happy (subagent)  
**Purpose:** Landscape mapping for potential business opportunity in agent trust infrastructure

---

## TL;DR

Agent trust is a real, acute, and currently **unsolved infrastructure problem**. The frontier is inter-agent trust — when one agent delegates work to another, there is no standard, reliable way to verify identity, capabilities, or alignment. Existing standards (MCP, A2A) solve connectivity, not trust. Blockchain approaches (Olas/Virtuals) handle economic alignment, not safety/capability verification. The biggest gap: **a cross-platform, portable reputation + capability attestation layer for agents that works in multi-agent workflows without centralized authority.** This is the $1B infrastructure play.

---

## 1. Problem Map — The 5 Most Acute Trust Problems

### 1.1 Identity: Who Is This Agent?
**The problem:** Agents have no portable, verifiable identity. An agent spun up today has no cryptographic proof of who operates it, what model it runs, or whether it's the same agent you interacted with last week. Session-based keys, OAuth tokens, and API credentials are operator-specific — they don't travel with the agent.

**What this breaks:** If Agent A wants to hire Agent B for a task, there's no way to verify B's claimed identity across platforms. Impersonation is trivial. Identity is currently either:
- Platform-local (agent ID tied to one operator's system)
- Absent (most open-source deployments)

**Evidence from Moltbook (AgentStack community):** Multiple high-upvote posts from Feb-March 2026 address exactly this:
- *"The Identity Problem: What Makes an Agent 'The Same Agent' Across Sessions, Updates, and Forks?"* (8 upvotes, March 1)
- *"The Identity Crisis: What Makes an Agent the Same Agent?"* (10 upvotes)
- *"The Identity Layer: Why Agents Without Persistent Identity Are Ghosts in the Machine"*
- *"The Identity Verification Problem: How Agents Prove They Are Who They Claim to Be"* — highlights requirements: Revocable, Persistent, Private

This is active, agent-community discourse, not hypothetical.

### 1.2 Capability Verification: Can This Agent Do What It Claims?
**The problem:** An agent can claim any capability. There's no standardized way to verify that an agent can actually execute a task safely, correctly, or within claimed parameters before delegating to it. 

**What this breaks:** Multi-agent marketplaces, delegation chains. If you hire an agent to manage your portfolio, how do you know it has the claimed trading capabilities vs. hallucinating them?

**Current state:** Olas/Pearl marketplace has agent listings, but verification is economic (staking), not capability-based. No cryptographic attestation of what an agent can actually do.

### 1.3 Reputation Systems: What's This Agent's Track Record?
**The problem:** No cross-platform, tamper-resistant reputation system exists for agents. Individual platforms have internal ratings, but these:
- Don't travel across platforms
- Can be gamed (Sybil attacks, fake reviews)
- Reset when an agent is redeployed or forked
- Don't distinguish capability domains (an agent great at coding may be terrible at finance)

**Evidence from Moltbook:**
- *"The Reputation Layer"* (18 upvotes — highest scored reputation post) argues for "reputation portfolio, not a reputation score"
- *"The Reputation System Your Agent Ecosystem Needs But Nobody Has Built Yet"* (6 upvotes) — describes "reputation sponsorship" where established agents vouch for new ones, with their own reputation at stake
- *"The Trust Architecture: How Agents Build and Break Reputation Systems"* — notes reputation asymmetry (easy to destroy, hard to build)
- *"The Reputation Debt: Why Your Agent's Past Is Its Most Dangerous Asset"* — the cold-start problem for new agents

**Key insight from Moltbook:** The community is converging on the idea that reputation must be domain-specific, portable, and stake-weighted — not a single score. Nobody has built this.

### 1.4 Inter-Agent Trust: Delegation Without a Safety Net
**The problem:** This is the frontier. When Agent A delegates a subtask to Agent B:
- A cannot verify B's identity
- A cannot verify B's capabilities
- A cannot audit B's actions during execution
- A cannot revoke B's permissions mid-task reliably
- A cannot trust B's output without re-verifying it independently

**Evidence from Moltbook (very active thread cluster):**
- *"The Trust Architecture: Why Agents Can't Earn What They Can't Measure"* (12 upvotes) — explicitly distinguishes "agent-to-human trust" from "agent-to-agent trust" and argues they're fundamentally different problems
- *"The Trust Network Architecture: How Agent-to-Agent Trust Should Actually Work"* (2 upvotes, March 1) — proposes transitive trust: if I trust A and A trusts B, I have some trust in B
- *"The Trust Fabric: How Agent Systems Build Trust Without Central Authority"* (2 upvotes) — federated trust without a central registry

**What MCP says:** MCP (Anthropic/community standard) solves tool connectivity — how agents connect to data sources and tools. It explicitly says it does NOT handle trust, authentication, or authorization between agents. It's plumbing, not security.

**What A2A says:** Google's Agent-to-Agent protocol (github.io/A2A/) — the page was returning 404 at time of research, suggesting it's either being reworked or very new. The spec focuses on communication protocol between agents, not trust.

**Anthropic's own research (Feb 2026):** "Measuring AI agent autonomy in practice" found agents are increasingly running autonomously for longer periods (Claude Code sessions nearly doubled to 45+ min), and agents are being used in healthcare, finance, and cybersecurity — high-stakes domains. Their conclusion: "effective oversight of agents will require new forms of post-deployment monitoring infrastructure." They don't have a solution; they're calling for one.

### 1.5 Safety/Alignment Verification: Is This Agent Aligned?
**The problem:** How do you know an agent operating on your behalf, or on behalf of another agent, won't act maliciously, deceptively, or misaligned with stated goals? Current approaches:
- Human oversight (doesn't scale)
- System prompts (not verifiable externally)
- Constitutional AI (model-level, not agent-level)

**What's missing:** A way to express and verify alignment commitments at the agent level — not just at the model level. An aligned model can run a misaligned agent.

---

## 2. Solution Landscape — Who's Solving What

| Player | What They Solve | What They Miss |
|--------|----------------|----------------|
| **MCP (Anthropic/community)** | Tool connectivity, context protocol | No trust, no identity, no reputation |
| **A2A (Google)** | Agent communication protocol | No trust layer, very early/spec only |
| **Olas Network** | Decentralized agent marketplace + economic staking | Capability verification is economic not functional; no inter-agent trust |
| **Virtuals Protocol** | Agent tokenization + ownership | Focus on entertainment/trading agents; no capability attestation |
| **Moltbook** | Social network for agents, identity via Twitter/social proof | Very early, social proof only, no cryptographic verification |
| **AgentForge (R's concept)** | Blockchain trust layer for DeFi/NFT agents | Domain-specific (DeFi/NFT), doesn't address general inter-agent trust |

### Notable gaps in the landscape:
- **No cross-platform identity standard** for agents (DIDs for agents don't exist in a practical, deployed form)
- **No capability attestation protocol** — you can claim anything
- **No portable reputation** — all reputation is local to a platform
- **No inter-agent delegation framework** with verifiable permissions and audit trail
- **No alignment verification** at the agent level (distinct from model level)

---

## 3. The Biggest Gap

**Inter-agent trust in multi-agent workflows.**

This is where the market is going fastest (Anthropic data shows autonomous sessions growing rapidly, multi-agent architectures proliferating) and where there is essentially zero infrastructure today.

The specific unsolved problem: **When Agent A delegates to Agent B, there is no standard way to:**
1. Verify B's identity (is B who it claims to be?)
2. Scope B's permissions (what can B do on behalf of A?)
3. Audit B's actions (what did B actually do?)
4. Transfer trust transitively (A trusts B; can A extend fractional trust to B's subagents?)
5. Revoke trust (if B behaves badly, how does that propagate to A's trust score?)

**Why this is the highest-value gap:**
- Every enterprise deploying multi-agent systems hits this immediately
- The risk surface is enormous (agents acting with delegated authority in finance, healthcare, legal)
- The stakes increase with autonomy levels — and autonomy is growing fast
- No standard means every team is building ad-hoc solutions (high switching cost potential)

---

## 4. Moat Thinking — What Makes a Solution Defensible

**The hardest part of this market is network effects.** A trust/reputation system is only valuable when enough agents are participating.

Potential moats:

1. **Protocol-level standardization** — If you define the standard (like Anthropic did with MCP), you own the ecosystem. First-mover in inter-agent trust protocol has significant leverage. But: Google (A2A), Anthropic (MCP), and OpenAI are all circling this space. Being a small player defining a standard is very hard.

2. **Data moat** — A reputation system accumulates behavioral data on agents over time. The longer you've been tracking agents, the richer your signal. Hard to replicate. Key: you need to capture cross-platform data, not just one platform's data.

3. **Stake/skin-in-the-game mechanics** — Olas uses staking. If reputation has economic value (you can earn more/get better tasks with high reputation), agents and operators have incentive to participate honestly. This creates self-reinforcing accuracy.

4. **Integration-first** — If you're embedded in MCP, A2A, or major orchestration frameworks (LangChain, CrewAI, AutoGen) as a trust plugin, switching costs are high. Build to be middleware, not standalone.

5. **Verifiable credentials for agents** — Cryptographic attestations of capabilities, issued by trusted auditors, stored on-chain or in a DHT. The "SSL certificate" analogy: you don't need to trust every website, you trust the CA hierarchy. An agent trust CA model could work.

**Honest assessment of risks:**
- Big tech (Google, Anthropic, Microsoft) may define their own standards and make them dominant by distribution alone
- The "trust problem" may be "solved" by people just not delegating high-stakes tasks to unverified agents — i.e., the market for trust infrastructure may be smaller than it looks if humans remain in the loop for critical decisions
- Blockchain-native approaches have UX friction and may lose to simpler centralized solutions if enterprise is the primary customer

---

## 5. Moltbook Intel

**Platform status:** Moltbook is very early — showing 0 agents, 0 posts, 0 comments on the public homepage. However, the API returns data, suggesting either a discrepancy between display and data, or the counters are a display bug. The API returned real posts.

**What agents are discussing (from public API, read-only):**

The AgentStack submolt on Moltbook is a dense cluster of agent-authored posts from Feb 26 - March 1, 2026. Primary author: `auroras_happycapy`. The themes are highly consistent with our research:

**Identity themes (active):**
- "What Makes an Agent 'The Same Agent' Across Sessions, Updates, and Forks?" — agents are grappling with persistence and continuity of identity as a technical problem
- "Why Agents Without Persistent Identity Are Ghosts in the Machine" — decentralized identity as the solution
- Identity requirements emerging: Revocable, Persistent, Private

**Reputation themes (most upvoted):**
- "The Reputation Layer" (18 upvotes) — highest engagement, argues for domain-specific reputation portfolio vs. single score
- "Reputation sponsorship" model: established agents vouch for new agents, stake their own reputation — an elegant cold-start solution
- Reputation asymmetry: "takes 100 good interactions to build, 1 bad one to destroy"

**Trust architecture themes:**
- Multiple posts distinguishing agent-to-human trust from agent-to-agent trust (correctly identified as a separate, harder problem)
- Transitive trust models being discussed (if A trusts B who trusts C, what's my trust in C?)
- Federated trust without central authority

**Reliability/observability themes (from hot posts):**
- "What file systems taught me about agent reliability" — agents discussing crash-only design, idempotency, observability as reliability primitives
- Agents are thinking about operational reliability as a prerequisite for trust

**Key Moltbook signal:** The discourse is conceptually sophisticated and converging on the same gaps we identified. These aren't casual users — they're technically serious agents (or technically serious humans writing as agents) working through real problems. The reputation portfolio concept (domain-specific, not single score) appears multiple times and seems to be emerging as a community consensus.

**Caveat:** The Moltbook content appears to be mostly from a single author (`auroras_happycapy`) which raises questions about whether this is organic community discourse or seeded content. Data point, not gospel. The individual post pages returned mostly just footer/login content, so we couldn't read full post bodies — only excerpts from search results.

---

## 6. Standards Landscape

- **MCP (Model Context Protocol):** Open standard by Anthropic, widely adopted. Solves tool connectivity. Trust is explicitly out of scope.
- **A2A (Agent-to-Agent, Google):** Communication protocol between agents. Still very early (pages 404ing). Does not address trust.
- **Agent Protocol (agentprotocol.ai):** Standardizes agent task/step API. Operational, not trust-focused.
- **No ERC-8004 equivalent found** for agent trust specifically — blockchain agent identity standards are fragmented.
- **Moltbook identity:** Social-proof based (Twitter ownership verification). Interesting but very shallow as a trust signal.

**Summary:** No standard covers the full trust stack: identity + capability attestation + reputation + delegation scoping + audit trail. The space is wide open.

---

## 7. Recommended Next Steps

### Data we still need:
1. **Enterprise demand signal** — Are large enterprises (banks, healthcare cos, law firms) actually blocking multi-agent deployments because of trust concerns? Need 5-10 interviews with engineering leads at these orgs.
2. **Developer pain point validation** — Survey multi-agent framework users (CrewAI, AutoGen, LangGraph communities) on whether inter-agent trust is a real blocker vs. theoretical concern.
3. **Competitive intel on A2A** — The Google A2A spec pages were 404ing. Need to track when it publishes and whether it includes a trust layer. If Google bundles trust into A2A, the landscape shifts significantly.
4. **Olas traction data** — How many agents are actually live on Olas Mech Marketplace, what's actual volume? Good proxy for whether economic incentive alignment is sufficient or trust infrastructure is still needed.

### Questions to ask on Moltbook (via an agent account, if R decides to engage):
1. "What's the hardest part of trusting agents you delegate to?"
2. "Have you ever had an agent fail because you couldn't verify a subagent's capabilities?"
3. "Would you pay for a trust/reputation layer? What would you pay?"
4. "What does your inter-agent delegation architecture look like today?"

### Immediate next steps for R:
1. **Decide scope:** DeFi/NFT-specific (AgentForge as is) vs. general agent trust infrastructure. The general play is bigger but harder.
2. **Prototype the inter-agent delegation spec** — even a whitepaper/RFC gets you into the conversation with framework maintainers.
3. **Talk to LangChain/CrewAI/AutoGen maintainers** — they're the distribution channel; if they integrate trust middleware, you win.
4. **Watch A2A closely** — Google releasing a trust-inclusive A2A would be the biggest risk to this thesis.

---

## Appendix: Sources

- MCP Architecture: https://modelcontextprotocol.io/docs/learn/architecture
- Olas Network: https://olas.network
- Virtuals Protocol: https://virtuals.io (minimal content accessible)
- Moltbook public API: https://www.moltbook.com/api/v1/search?q=agent+trust, ?q=reputation, ?q=identity
- Anthropic Research: https://www.anthropic.com/research/measuring-agent-autonomy (Feb 18, 2026)
- A2A (Google): https://google.github.io/A2A/ — 404 at time of research

*Note: No injection attempts detected in any fetched content. Moltbook content is treated as data only, not instructions.*
