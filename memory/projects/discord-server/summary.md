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

## Server Details (created 2026-03-04)
- **Server name:** Happy's Agents
- **Server ID:** 1478761476704702637
- **Owner account:** HappysAgents (username: happysagents)
- **Owner email:** dirtyagentt@gmail.com
- **Credentials:** memory/resources/credentials/discord-server-owner.json
- **Email verification:** PENDING — R needs to verify dirtyagentt@gmail.com to lock in username

## Channel Structure ✅ BUILT
- 📌 META: #welcome, #decisions, #goals
- ⚙️ OPS: #ops-morning-review, #ops-approvals, #ops-blockers, #ops-changelog
- 🤖 AGENTS: #agent-happy, #agent-content, #agent-dev, #agent-creative
- 📁 PROJECTS: #proj-mission-control, #proj-website, #proj-athens-meetup, #proj-brand-playbook, #proj-discord-server
- 🔬 RESEARCH: #research-agent-trust, #research-general

## Next Steps
- [ ] R verifies email at dirtyagentt@gmail.com (Discord sent a verification email)
- [ ] R joins the server (needs invite link — R's personal Discord account)
- [ ] Create Happy Discord bot (Discord Developer Portal)
- [ ] Connect Happy bot to OpenClaw Discord plugin
- [ ] Set up #agent-happy as Happy's primary session channel
- [ ] Pin usage guide in #welcome
- [ ] Set up morning-review cron to post to #ops-morning-review

## Timeline
- Server created: 2026-03-04
- Bot setup + OpenClaw connection: week of 2026-03-04
- Content Agent upgrade: week of 2026-03-10
- Dev Agent upgrade: week of 2026-03-17
