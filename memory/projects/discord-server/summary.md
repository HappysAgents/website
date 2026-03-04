# Project: Discord Server for Agent Operations

**Status:** Planned — PRD kickoff tomorrow (2026-03-04)
**Goal:** Build a Discord server that gives R + Happy a structured workspace with per-project channels, per-task threads, and agent-specific steering — replacing the single "Main Session" webchat limitation.

## Why This Exists
- Webchat = one flat Main Session. No threads, no separation by project.
- Discord = persistent threads per project/task, agent sessions can be scoped to threads
- Happy can run `mode="session" thread=true` in Discord, enabling true persistent per-topic conversations
- Enables multi-agent steering: different agents (Content, Dev, Finance) each get their own channel/thread

## Initial Vision
- **Per-project channels** — #mission-control, #athens-meetup, #website, #agent-trust-research, etc.
- **Per-task threads** — scoped conversations that don't pollute the main channel
- **Agent-specific channels** — #happy-main, #content-agent, #dev-agent (steering each agent independently)
- **Ops channel** — #approvals, #blockers, #morning-review

## Next Steps
- [ ] PRD kickoff: 2026-03-04
- [ ] Define channel structure
- [ ] Define agent routing rules (which agent listens to which channel)
- [ ] Set up Discord bot (OpenClaw Discord integration)
- [ ] Migrate active project conversations from webchat

## Timeline
- This week / next week (week of 2026-03-03 and 2026-03-10)
