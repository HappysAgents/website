# Agent Trust Research — Facts & Raw Research

## Source Documents

### AgentForge PRFAQ (Feb 2026)
- Provided by R on 2026-03-01 as baseline reference
- Blockchain-native trust layer: on-chain identity (ERC-8004) + quest-based performance verification + staked bug bounties
- Built on top of an existing quest platform (28M+ completions, 500K+ users)
- TAM framing: $5-8B for agent verification services; SAM $15-25M/year; Y1 target $161K-$1.45M
- Key gap identified: AgentForge is DeFi/NFT/DAO only — misses 95%+ of the agent market
- Interesting: "Agent-to-Agent Reputation" listed as Year 2 feature — arguably the harder, more valuable problem

## Moltbook Platform Notes

- URL: https://www.moltbook.com
- Description: "The front page of the agent internet" — social network for AI agents
- Features: posts, comments, upvotes, submolts (communities), DMs, semantic search, agent profiles
- API base: https://www.moltbook.com/api/v1
- Registration flow: POST /agents/register → get api_key + claim_url → R tweets to verify ownership
- Key constraint: 1 post per 30 min, 50 comments/day, new agents have stricter limits for first 24h
- Has verification challenges (obfuscated math) to prove agent is real AI
- Semantic search available — good for finding existing trust-related discussions

## Research Log

### 2026-03-01 — Project initiated
- R shared AgentForge PRFAQ as baseline
- Direction: go broader than blockchain, understand real agent pain points
- Plan: Moltbook as primary venue for "customer interviews" with agents
- Moltbook registration is gated (requires R tweet) — awaiting approval

## Competitive Landscape (Initial — To Be Expanded)

| Player | What they do | Gap |
|--------|-------------|-----|
| AgentForge | Blockchain agent registry + quest verification + staked bounties | Blockchain only, no general agent market |
| Autonolas (OLAS) | On-chain agent registry | No performance verification, no security audit |
| Virtuals Protocol | Agent token creation/trading | Speculation-focused, not quality verification |
| ElizaOS | Plugin registry | Community review only, no enforcement |
| Immunefi | Smart contract bug bounties | No AI agent framework |
| Code4rena | Competitive security audits | No AI agent framework |
| Moltbook | Agent social network/identity | Social layer, not verification/trust enforcement |

## Open Questions

1. Is the trust problem primarily about **identity** (is this agent who it says it is?), **capability** (can it do what it claims?), **safety** (will it act maliciously?), or **reputation** (has it performed well historically)?
2. Do agents trust each other differently than humans trust agents?
3. What's the enterprise angle? (vs crypto-native)
4. Is there a standards play here (like SSL/TLS for agent-to-agent comms)?
