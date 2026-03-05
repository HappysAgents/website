# Session Log: Discord Multi-Agent Setup — Full Build
**Date:** 2026-03-04 → 2026-03-05
**Session type:** Infrastructure build + live debugging
**Participants:** R (human operator) + Claude (advisor via claude.ai)
**Goal:** Set up a Discord server as the primary multi-agent workspace for Happy's Agents, replacing the single-session WebChat limitation

---

## Why This Session Happened

### The Problem
OpenClaw's WebChat is a single persistent session. Every browser tab, every topic, every project — they all hit the same "Main Session." R was trying to run multiple projects simultaneously (website, Athens meetup, brand playbook, Mission Control dashboard) and context was bleeding across topics. There was no way to have parallel conversations with different agents scoped to different tasks.

### The Solution
Discord. Each channel gets its own isolated agent session. Each agent gets its own bot, its own workspace, its own memory. R can walk into `#proj-website` and talk to Happy about the website, then walk into `#agent-content` and talk to Nova about a blog post — zero bleed, full persistence, parallel execution.

### What Existed Before This Session
- A PRD had been written by Happy (PM Agent mode) defining the full channel architecture
- A Discord server ("Happy's Agents") had been created by Happy with server ID `1478761476704702637`
- A `setup.sh` script had been written and executed to create 5 categories and 18 channels
- Happy's Discord bot had been created and connected to OpenClaw
- The channel structure was built: META (3), OPS (4), AGENTS (4), PROJECTS (5), RESEARCH (2)
- 4 sub-agent spec files existed in `~/openclaw-workspace/agents/`: content-agent.md, creative-lead.md, graphic-design.md, security-agent.md

### What Was Broken
The `openclaw doctor` output showed two config errors that were blocking the gateway:
1. `channels.discord.guilds.1478761476704702637: Unrecognized key: "allow"` — invalid guild structure
2. `channels.discord.dmPolicy is "allowlist" but allowFrom is empty` — all DMs blocked

---

## The Starting Config (What Happy Built)

Happy had configured the Discord block in `openclaw.json` with two fundamental errors:

### Error 1: `allow` at the guild level
```json
"guilds": {
  "1478761476704702637": {
    "allow": true,
    "channels": { ... }
  }
}
```
**Why it's wrong:** OpenClaw's guild schema only accepts `requireMention`, `users`, `roles`, and `channels` at the guild level. The `allow` key is only valid inside individual channel entries nested under `channels`. Happy put `allow` on the building when the bouncer only reads approval stamps on individual room doors.

### Error 2: Channel IDs instead of channel names
```json
"channels": {
  "1478762067166232577": { "allow": true },
  "1478762070630469632": { "allow": true },
  ...
}
```
**Why it's wrong:** OpenClaw expects channel slug names like `"agent-happy"` or `"ops-approvals"` as keys, not numeric Discord channel IDs. This is a design choice by OpenClaw — names are human-readable and match what you see in Discord's sidebar.

### Error 3: Empty DM allowlist
```json
"dmPolicy": "allowlist",
"allowFrom": []
```
**Why it's wrong:** Allowlist mode with nobody on the list = all DMs blocked. Should have been `"pairing"` (the default) which lets users DM the bot and get a pairing code.

---

## Research Phase: How OpenClaw Discord Config Actually Works

Before writing any fixes, we researched the official OpenClaw documentation to understand the correct config schema. Key sources:
- Official docs: https://docs.openclaw.ai/channels/discord
- Multi-agent routing: https://docs.openclaw.ai/concepts/multi-agent
- GitHub Issues: Feature requests showing real-world config examples
- Community guides: MoltFounders, Pinggy, DEV Community

### Key Learnings from Docs

**Guild-level config keys:** Only `requireMention`, `users`, `roles`, `channels` are valid.

**Channel listing is optional:** "If a guild has no `channels` block, all channels in that allowlisted guild are allowed." This means for a private server, you don't need to list every channel.

**But if you DO list channels:** "If a guild has channels configured, non-listed channels are denied." This becomes critical later — we hit this exact trap multiple times during debugging.

**Multi-agent routing uses `accounts` + `bindings`:** Each Discord bot gets its own account with its own token. Bindings map `accountId` to `agentId`. The key insight: routing is by bot account, not by channel name.

**`requireMention` controls response gating:** `false` = respond to everything. `true` = only respond when @tagged. This becomes the primary mechanism for preventing double-responses.

---

## The "Bouncer" Mental Model

We developed a plain-English mental model to explain how the config works:

**Think of `openclaw.json` as a bouncer's instructions.** The bouncer (OpenClaw gateway) stands at the door of every conversation and decides: should I let this message through to the agent, or ignore it?

**Layer 1 — The building (`guilds`):** "Does this message come from a server I recognize?" Only listed guild IDs are accepted.

**Layer 2 — The person (`users`):** "Is the sender on my approved list?" Only listed Discord user IDs are allowed to interact.

**Layer 3 — The room (`channels`):** "Is this specific channel one I should respond in?" Optional layer — skip it for full access, add it to restrict.

---

## Stage 1: Fixing the Broken Config (Happy Only)

### The Plan
Replace the broken Discord block with a minimal, correct config that routes everything through Happy. Get the gateway running again.

### Target Config
```json
"discord": {
  "enabled": true,
  "token": "HAPPY_BOT_TOKEN",
  "dmPolicy": "pairing",
  "groupPolicy": "allowlist",
  "guilds": {
    "1478761476704702637": {
      "requireMention": false,
      "users": ["R_DISCORD_USER_ID"]
    }
  }
}
```

### Bug #1: JSON Syntax Error After Manual Edit

**What happened:** R edited `openclaw.json` manually (or via the python script) but the resulting file had a structural error — `channels` was missing its closing brace. The `gateway`, `skills`, and `plugins` blocks ended up accidentally nested *inside* `channels`.

**Symptom:** `SyntaxError: JSON5: invalid end of input at 159:1` — every `openclaw` command failed.

**Root cause:** When replacing the discord block, the closing `}` for the `channels` object was lost. The JSON appeared to end prematurely because the brace count was off.

**Diagnosis process:**
1. `tail -20` to check end of file — looked fine
2. `python3 -c "import json; json.load(open(...))"` — confirmed error at line 159
3. R pasted the full file contents — we identified the missing brace between `discord` closing and `gateway` opening

**Fix:** Restored from backup (`openclaw.json.bak`) and applied the discord change using `json.load/json.dump` in python, which guarantees valid JSON output. This became the standard approach for all subsequent edits.

**Lesson:** Never manually edit `openclaw.json` with nano/vim for structural changes. Always use python's `json.load/json.dump` to avoid brace-counting errors. Always validate with `python3 -m json.tool` before restarting. Always backup first with `cp openclaw.json openclaw.json.bak`.

### Bug #2: `gateway.mode` Unset After Doctor Repair

**What happened:** After fixing the JSON, `openclaw doctor` reported `gateway.mode is unset; gateway start will be blocked.`

**Root cause:** The doctor's config repair may have cleared this field, or it was a side effect of the JSON corruption. The gateway needs `mode: "local"` to know it should bind to loopback.

**Fix:** Running `openclaw doctor --fix` resolved it automatically. The doctor also created `~/.openclaw/credentials/` directory and reinstalled the LaunchAgent.

### Stage 1 Result
After fix: `openclaw doctor` returned clean output:
- Telegram: ok (@Dirtyagenttbot)
- Discord: ok (@Happy)
- Agents: main (default)
- Zero config errors
- Gateway running

---

## Agent Discovery: What We Actually Had

### Assumption vs Reality

We initially assumed R had 4 registered OpenClaw agents. Investigation revealed:

**The `agents` block in config only had `defaults`** — no `agents.list` array. This means only one implicit agent (`main` = Happy) existed. No agents had been formally registered via `openclaw agents add`.

**The 4 files in `~/openclaw-workspace/agents/` were sub-agent spec files** — markdown instructions that Happy spawns as sub-agents when needed:

| File | Role | Model in Spec |
|------|------|---------------|
| `content-agent.md` | Daily blog post writer | claude-opus-4-6 |
| `creative-lead.md` | Head of Creative & Brand | claude-sonnet-4-6 |
| `graphic-design.md` | Graphic Designer (Imagen 4) | gemini-3-pro-preview |
| `security-agent.md` | Security Review Agent | claude-sonnet-4-6 |

**Key insight from spec review:** Graphic Design Agent explicitly reports to Creative Lead and says "Send output directly to Happy or R — always back to Creative Lead." It is NOT a standalone agent. It's a sub-agent that Pixel spawns. No promotion, no Discord channel, no bot token needed.

**Missing:** No dev agent spec existed at all. The PRD planned for one, but it hadn't been written yet.

### Final Agent Roster Decision

After discussion, R decided on 5 full agents + 1 sub-agent:

| Agent ID | Name | Role | Model | Spec Status |
|----------|------|------|-------|-------------|
| `main` | Happy | Chief of Staff (default) | claude-sonnet-4-6 | Main agent ✅ |
| `nova` | Nova | Content Writer | claude-opus-4-6 | content-agent.md ✅ |
| `coda` | Coda | Dev Agent | claude-sonnet-4-6 | Needs creation ❌ |
| `pixel` | Pixel | Creative Lead | claude-sonnet-4-6 | creative-lead.md ✅ |
| `vault` | Vault | Security Reviewer | claude-sonnet-4-6 | security-agent.md ✅ |
| *(sub)* | — | Graphic Designer | gemini-3-pro-preview | graphic-design.md (spawned by Pixel) |

### Name Selection Process
R wanted random personal names that are easy to associate with roles:
- **Nova** — bright, new ideas (content)
- **Coda** — code + finality, ships things (dev)
- **Pixel** — design, visual, brand (creative)
- **Vault** — security, protection, locked down (security)

R went through multiple rounds of name options before settling on these. Initial suggestions (Sage, Forge) were rejected. Final picks came from an expanded list of ~16 options per role.

---

## Stage 2: Registering Agents

### The Process
Each agent was registered via `openclaw agents add <name>`. The wizard asks for:
1. Workspace directory
2. Copy auth profiles from main?
3. Configure model/auth?
4. Configure chat channels?

### Bug #3: Wrong Workspace Paths

**What happened:** During `openclaw agents add`, the wizard defaulted to `~/.openclaw/openclaw-workspace/agents/<name>` instead of `~/openclaw-workspace/agents/<name>`. R accepted the defaults without noticing the path difference.

**Why it matters:** There are two separate locations:
- `~/.openclaw/agents/` — OpenClaw's internal storage (sessions, auth profiles, agent state). Managed by OpenClaw. Don't touch.
- `~/openclaw-workspace/agents/` — Working directories with SOUL.md, spec files, project work. User-managed.

The workspace path tells the agent where to find its SOUL.md, AGENTS.md, and working files. Wrong path = agent can't find its instructions.

**Nova was extra wrong:** Its path was `/Users/dirtyagent/.openclaw/openclaw-workspace/nova` — missing the `agents/` segment entirely.

**Fix:** Python script to rewrite all workspace paths in `agents.list`:
```python
config['agents']['list'] = [
    {"id": "main", "default": True},
    {"id": "nova", "workspace": "/Users/dirtyagent/openclaw-workspace/agents/nova", ...},
    {"id": "coda", "workspace": "/Users/dirtyagent/openclaw-workspace/agents/coda", ...},
    ...
]
```

**Lesson:** Always verify the workspace path during `openclaw agents add`. The default suggestion includes `.openclaw` which is the wrong parent directory.

### Bug #4: Happy Agent Registration Attempted

**What happened:** We initially tried `openclaw agents add happy`, which would have created a SECOND agent separate from the existing `main` agent — splitting Happy from all 142 existing sessions of context.

**Fix:** Cancelled with Ctrl+C. Instead, kept `main` as Happy and only registered the 4 new agents. Added `"default": true` to main's config so it catches all unbound channels.

**Lesson:** The existing main agent IS Happy. Don't create a duplicate — just add `default: true` and register the others around it.

### Nova Model Override

Nova's content-agent.md spec explicitly requires Opus for writing quality. We added a per-agent model override:
```json
{
  "id": "nova",
  "model": {
    "primary": "anthropic/claude-opus-4-6",
    "fallbacks": ["anthropic/claude-sonnet-4-6", "google/gemini-3-pro-preview"]
  }
}
```
All other agents inherit the default (Sonnet), keeping costs controlled.

---

## Stage 3: Creating Discord Bots

4 new Discord bot applications created in the Discord Developer Portal, one per agent:

| Bot | Username | Process |
|-----|----------|---------|
| Nova | Nova#1181 | New Application → Bot → Intents → Token → OAuth2 → Invite |
| Coda | Coda | Same process |
| Pixel | Pixel | Same process |
| Vault | Vault | Same process |

Each bot required:
- Message Content Intent enabled (required)
- Server Members Intent enabled (recommended)
- OAuth2 scopes: `bot` + `applications.commands`
- Bot Permissions: View Channels, Send Messages, Read Message History, Embed Links, Attach Files
- Invite URL generated and used to add bot to Happy's Agents server

All 5 bots visible in server member list after completion.

---

## Stage 4: Multi-Account Discord Config

### Bug #5: `channelName` Is Not a Valid Binding Key

**What happened:** Initial bindings used `channelName` to route channels to agents:
```json
"bindings": [
  { "agentId": "nova", "match": { "channel": "discord", "channelName": "agent-content" } }
]
```

**Symptom:** `openclaw doctor` flagged: `Unrecognized key: "channelName"` on all 4 bindings.

**Root cause:** OpenClaw bindings don't support matching by channel name. The correct approach for Discord multi-agent is to match by `accountId` — each bot account maps to an agent. Channel restrictions go inside the account's guild config, not in bindings.

**Research that fixed it:** The official multi-agent docs show the Discord pattern clearly:
```json
bindings: [
  { agentId: "main", match: { channel: "discord", accountId: "default" } },
  { agentId: "coding", match: { channel: "discord", accountId: "coding" } }
]
```

**Fix:** Restructured to use `accountId` in bindings and moved channel config into per-account guild settings:
```json
"bindings": [
  { "agentId": "nova", "match": { "channel": "discord", "accountId": "nova" } },
  { "agentId": "coda", "match": { "channel": "discord", "accountId": "coda" } },
  ...
]
```

**Lesson:** OpenClaw routes Discord by bot account, not by channel name. One bot = one account = one agent. Bindings connect accounts to agents. Channel restrictions are optional and go inside the account's guild config.

### Bug #6: Doctor Auto-Migration of Single-Account Values

**What happened:** `openclaw doctor` kept showing: "Moved channels.discord single-account top-level values into channels.discord.accounts.default."

**Root cause:** When we had `dmPolicy` and `groupPolicy` at the top level of the discord block alongside the `accounts` block, doctor wanted to migrate them into the proper nested structure.

**Fix:** Running `openclaw doctor --fix` with "Yes" to apply repairs resolved this automatically. Non-breaking — just structural cleanup.

---

## Stage 5: The Double-Response Problem

### The Core Issue
With `requireMention: false` on Happy's account, Happy responded to EVERY message in every channel — including messages tagged for other agents. So `@Nova hello` in `#agent-content` would get responses from both Nova AND Happy.

### Attempt 1: Channel-Level `requireMention` Override on Happy

**Approach:** Add a `channels` block to Happy's guild config that sets `requireMention: true` only in the 4 agent channels:
```json
"channels": {
  "agent-content":  { "allow": true, "requireMention": true },
  "agent-dev":      { "allow": true, "requireMention": true },
  "agent-creative": { "allow": true, "requireMention": true },
  "agent-vault":    { "allow": true, "requireMention": true }
}
```

**Result:** BROKE Happy completely. Happy stopped responding in ALL channels including `#agent-happy` and all `#proj-*` channels.

**Root cause:** The OpenClaw docs state clearly: "If a guild has channels configured, non-listed channels are denied." By listing only 4 channels, we inadvertently locked Happy out of the other 15.

### Attempt 2: List All 19 Channels for Happy

**Approach:** Enumerate every single channel in Happy's config — 15 with `allow: true` and 4 with `allow: true, requireMention: true`.

**Why we rejected it:** Overcomplicated. Every new channel would require a config update. Defeats the simplicity we wanted.

### Attempt 3: Debug Confusion

**What happened:** We applied Attempt 1 but forgot to restart the gateway before testing. When tests failed, we assumed the config was wrong — but the gateway was still running the OLD config. This led us to prematurely abandon the approach and start exploring alternatives.

**Lesson:** ALWAYS run `openclaw gateway restart` after config changes. Test results are meaningless if the gateway hasn't reloaded the config. This wasted time and caused confusion about what was actually broken.

### Attempt 4 (rejected but would have worked): Re-test Attempt 1 properly

After realizing the restart was missed, we tried reverting to Attempt 1 and testing with a proper restart. Result: same failure. The `channels` block still locked Happy out of unlisted channels. The docs behavior was confirmed — this approach fundamentally doesn't work without listing every channel.

### Final Solution: All Agents Use `requireMention: true`

**Approach:** Set `requireMention: true` on ALL 5 bot accounts. No channel restrictions on any account. Every interaction requires an explicit @tag.

```json
// All 5 accounts get the same simple config:
"guilds": {
  "1478761476704702637": {
    "requireMention": true,
    "users": ["R_DISCORD_USER_ID"]
  }
}
```

**Behavior:**
- `@Happy` in any channel → Happy responds
- `@Nova` in any channel → Nova responds
- Message with no tag → nobody responds
- `@Nova` in `#proj-website` → Nova responds (cross-channel works)
- `@Happy ask @Coda to do X` → Happy responds (delegation = future workspace setup)

**Tradeoff:** R must always type `@AgentName` before every message. No "just type and Happy picks it up" convenience. R accepted this tradeoff — it's cleaner and eliminates all edge cases.

**Why this works:** No `channels` block on any account = all channels allowed. `requireMention: true` = only respond when explicitly tagged. Each bot sees all channels but only activates when called. Zero config maintenance when adding new channels.

---

## Bug #7: Discord Role vs Bot Mention Confusion

### What Happened
When R typed `@Happy` in Discord, the autocomplete dropdown showed TWO entries:
1. **Happy** under MEMBERS (the bot — `Happy#8365`) — correct
2. **@Happy** under roles ("Notify users with this role") — wrong

R picked the role, not the bot. Happy received the message but the mention ID didn't match its own bot ID, so it responded with confusion: "that ping is hitting a different ID than mine."

### Root Cause
Discord automatically creates a role with the same name as each bot that joins the server. These roles appear in the @mention dropdown alongside the actual bot members. The role mention sends a different ID format than a user/bot mention.

### Fix
No config fix needed. R just needs to pick from the **MEMBERS** section of the dropdown, not the roles section. The auto-created roles can't be deleted without removing the bot.

### Happy's Identity Confusion
Even after tagging the correct bot member, Happy responded with uncertainty about its own Discord ID. This is a SOUL.md / workspace issue — Happy doesn't yet have its Discord identity documented in its workspace files. Once Happy's SOUL.md includes its Discord bot ID, it will stop being confused about mentions.

---

## Final Working Config Structure

### agents block
```json
"agents": {
  "defaults": {
    "model": { "primary": "anthropic/claude-sonnet-4-6", ... },
    "workspace": "/Users/dirtyagent/openclaw-workspace",
    "maxConcurrent": 4,
    "subagents": { "maxConcurrent": 8, ... }
  },
  "list": [
    { "id": "main", "default": true },
    { "id": "nova", "workspace": ".../agents/nova", "model": { "primary": "anthropic/claude-opus-4-6", ... } },
    { "id": "coda", "workspace": ".../agents/coda" },
    { "id": "pixel", "workspace": ".../agents/pixel" },
    { "id": "vault", "workspace": ".../agents/vault" }
  ]
}
```

### discord block
```json
"discord": {
  "enabled": true,
  "dmPolicy": "pairing",
  "groupPolicy": "allowlist",
  "accounts": {
    "main":  { "token": "...", "guilds": { "GUILD_ID": { "requireMention": true, "users": ["USER_ID"] } } },
    "nova":  { "token": "...", "guilds": { "GUILD_ID": { "requireMention": true, "users": ["USER_ID"] } } },
    "coda":  { "token": "...", "guilds": { "GUILD_ID": { "requireMention": true, "users": ["USER_ID"] } } },
    "pixel": { "token": "...", "guilds": { "GUILD_ID": { "requireMention": true, "users": ["USER_ID"] } } },
    "vault": { "token": "...", "guilds": { "GUILD_ID": { "requireMention": true, "users": ["USER_ID"] } } }
  }
}
```

### bindings block
```json
"bindings": [
  { "agentId": "nova", "match": { "channel": "discord", "accountId": "nova" } },
  { "agentId": "coda", "match": { "channel": "discord", "accountId": "coda" } },
  { "agentId": "pixel", "match": { "channel": "discord", "accountId": "pixel" } },
  { "agentId": "vault", "match": { "channel": "discord", "accountId": "vault" } }
]
```

---

## Channel → Agent Routing (Final — 19 channels)

### 📌 META
| Channel | How to Invoke | Agent |
|---------|--------------|-------|
| `#welcome` | `@Happy` | Happy |
| `#decisions` | `@Happy` (or any agent to post) | Happy |
| `#goals` | `@Happy` | Happy |

### ⚙️ OPS
| Channel | How to Invoke | Agent |
|---------|--------------|-------|
| `#ops-morning-review` | `@Happy` | Happy (writes daily digest) |
| `#ops-approvals` | `@Happy` | Happy (monitors + routes) |
| `#ops-blockers` | `@Happy` | Happy (triages) |
| `#ops-changelog` | `@Happy` (or any agent to post) | Happy |

### 🤖 AGENTS
| Channel | How to Invoke | Agent |
|---------|--------------|-------|
| `#agent-happy` | `@Happy` | Happy |
| `#agent-content` | `@Nova` | Nova |
| `#agent-dev` | `@Coda` | Coda |
| `#agent-creative` | `@Pixel` | Pixel |
| `#agent-vault` | `@Vault` | Vault |

### 📁 PROJECTS
| Channel | How to Invoke | Agent |
|---------|--------------|-------|
| `#proj-mission-control` | `@Happy` (or `@AgentName` for specific agent) | Any tagged agent |
| `#proj-website` | `@Happy` / `@Nova` / `@Coda` | Any tagged agent |
| `#proj-athens-meetup` | `@Happy` | Happy |
| `#proj-brand-playbook` | `@Happy` / `@Pixel` | Any tagged agent |
| `#proj-discord-server` | `@Happy` | Happy |

### 🔬 RESEARCH
| Channel | How to Invoke | Agent |
|---------|--------------|-------|
| `#research-agent-trust` | `@Happy` | Happy |
| `#research-general` | `@Happy` | Happy |

---

## Lessons Learned (Summary)

### Config Lessons
1. **Never manually edit openclaw.json** — always use python `json.load/json.dump` to guarantee valid JSON
2. **Always validate before restarting** — `cat openclaw.json | python3 -m json.tool`
3. **Always backup before editing** — `cp openclaw.json openclaw.json.bak`
4. **Trailing commas kill the gateway** — JSON doesn't allow them, but they're invisible to the eye
5. **Always restart the gateway before testing** — test results against stale configs waste hours

### OpenClaw Discord Lessons
6. **`allow` is only valid inside channel entries** — not at the guild level
7. **OpenClaw expects channel slug names, not numeric IDs** — use `"agent-happy"` not `"1478762067166232577"`
8. **If you list ANY channels, unlisted channels are denied** — the `channels` block is an allowlist, not a supplement
9. **Multi-agent routing is by accountId, not channelName** — each bot = one account = one agent
10. **`requireMention: true` on all accounts is the cleanest multi-agent pattern** — tag who you want, anywhere

### Agent Registration Lessons
11. **`~/.openclaw/agents/` ≠ `~/openclaw-workspace/agents/`** — internal state vs working files
12. **The default workspace path suggestion during `openclaw agents add` is wrong** — it puts the workspace inside `.openclaw` instead of the user workspace
13. **Don't register an agent that already exists as `main`** — just add `default: true` to main
14. **Per-agent model overrides work** — Nova gets Opus, everyone else inherits Sonnet from defaults

### Discord Platform Lessons
15. **Discord auto-creates roles matching bot names** — can't be deleted, causes mention confusion
16. **Always pick from MEMBERS, not roles** — the @mention dropdown shows both
17. **Bot identity must be documented in SOUL.md** — otherwise the agent doesn't recognize its own Discord mentions

---

## What's Next (Not Done Yet)

### Immediate
- [ ] Set up agent workspaces (SOUL.md per agent with Discord identity info)
- [ ] Write Coda's dev agent spec from scratch
- [ ] Decide: merge graphic-design.md into Pixel or keep as separate sub-agent spec
- [ ] Configure Happy's SOUL.md with delegation instructions (`sessions_send` to other agents)

### This Week
- [ ] Configure heartbeats and cron per PRD Section 5
- [ ] Set up morning-review cron (Happy posts daily digest to #ops-morning-review)
- [ ] Test agent-to-agent delegation via `sessions_send`
- [ ] Migrate active WebChat project conversations to Discord threads

### Open Questions
1. Should Telegram remain primary for R↔Happy urgent/personal comms, or does Discord replace it?
2. Does Coda need a specific model override (Sonnet should be fine for code)?
3. What Discord identity info does each agent need in its SOUL.md? (bot ID, mention format, home channel)
4. When should Happy get `requireMention: false` in specific channels (like `#agent-happy`) vs keeping uniform tagging?

---

## Raw Data for Blog Post

### The Counterintuitive Thing
The obvious Discord config — list every channel, assign each to an agent — is the worst approach. OpenClaw's "if you list ANY channels, unlisted ones are denied" rule means explicit channel config creates invisible lockouts. The simplest, most maintainable pattern is no channel restrictions at all: every bot sees everything, `requireMention: true` on all, and you just tag who you want. Less config = fewer bugs.

### The Central Tension
Setting up multi-agent infrastructure is building a small operating system. Every decision has second-order effects: channel restrictions lock agents out of places you forgot to list, workspace paths default to the wrong directory, bindings use different key names than you'd expect from the docs, and Discord's own role system creates mention ambiguity. The gap between "I have a PRD" and "5 agents are responding correctly" was 7+ hours of debugging config interactions that no documentation fully prepared us for.

### What a Builder Needs to Know
1. Use python scripts to edit openclaw.json, never nano/vim
2. The multi-agent Discord pattern is: one bot per agent, `accountId` bindings, `requireMention: true` everywhere, zero channel restrictions
3. Test after every restart, not before
4. OpenClaw's agent workspace vs internal state directories are separate and easily confused
5. Discord's @mention dropdown has a role/member ambiguity trap that confuses both humans and bots

### Quote-Worthy Lines
- "We set up the bouncer's instructions so carefully that the bouncer locked the boss out of his own building"
- "The config file was so broken it made every OpenClaw command fail — including the command to fix the config"
- "Five agents, five bots, five tokens, four wrong workspace paths, three invalid config keys, two missing braces, and one forgotten gateway restart"

---

*Session duration: ~7 hours active work*
*Config file edits: 12+*
*Gateway restarts: 8+*
*Bugs encountered and resolved: 7*
*Agents successfully deployed: 5*
