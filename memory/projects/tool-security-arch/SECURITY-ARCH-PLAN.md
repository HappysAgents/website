# Tool Security Architecture Plan
*Author: Happy · 2026-03-04 · Status: Awaiting R Approval*

---

## What This Solves

Before building Mission Control or any other internal/external tool, we need agreed answers to:
- How do tools outside the Mac (R's phone, iPad, future products) reach the agent safely?
- What can those tools read? What can they write?
- If a tool is compromised, what's the blast radius?

This plan establishes a durable security architecture for **all tools** — internal and external — so every future build has a clear, pre-approved pattern to follow.

---

## Tool Categories

| Category | Examples | Access method today |
|----------|----------|---------------------|
| **Internal** | Happy, sub-agents, cron scripts | Direct file system (already exists) |
| **Internal UI** | Mission Control (local browser/Canvas) | Gateway on 127.0.0.1 (already exists) |
| **External UI** | Mission Control on R's phone/iPad | ❌ Not enabled yet |
| **External tools** | Agent-native products, future services | ❌ Not enabled yet |

This plan unblocks **External UI** and **External tools** — the two categories that currently have no safe path.

---

## Current State

```
Gateway: bind=loopback (127.0.0.1:18789)
Tailscale: mode=off
Auth: token (exists, not rotated recently)
File API: none — no HTTP read/write of workspace files
```

**Bottom line:** Nothing outside this Mac can reach the gateway. No file API exists. Mission Control on a phone = impossible today.

---

## Proposed Architecture

### Layer 1 — Network Boundary (Tailscale)

**Decision: `tailscale.mode: "serve"`**

OpenClaw's built-in Tailscale Serve integration keeps the gateway on loopback but routes external access through Tailscale's HTTPS proxy. Only devices on R's personal Tailnet can reach it. No public internet exposure.

```
R's phone (Tailnet) ──HTTPS──► Tailscale Serve ──loopback──► Gateway :18789
Public internet                      ✗ blocked
```

Why `serve` over `bind: "tailnet"`:
- HTTPS out of the box (no plain HTTP on network)
- Gateway stays on loopback — no accidental LAN exposure if Tailscale is off
- Tailscale identity headers available for future auth upgrade

Config change required (2 lines):
```json
"gateway": {
  "bind": "loopback",
  "tailscale": { "mode": "serve" },
  "auth": { "mode": "token" }
}
```

**Prerequisite:** Tailscale CLI must be installed and logged in on this Mac. Check: `tailscale status`. If not installed, security review required before install.

---

### Layer 2 — File Access: Read Path

**Problem:** The gateway has no file read API. The Control UI doesn't expose workspace files over HTTP.

**Decision: Static file serving from a scoped directory**

Happy writes dashboard data files to `workspace/mission-control/public/`. The gateway is configured (or a companion static server is added) to serve files from this directory only.

**Allowed read scope — external tools can read:**
```
mission-control/public/
  ├── blocker.json
  ├── activity-log.jsonl
  ├── projects-index.json
  ├── agents-registry.json
  └── task-queue.json
```
Plus: `memory/projects/*/summary.md` (rendered on demand)

**Hard blocked — never exposed via any API:**
```
SOUL.md, USER.md, MEMORY.md, IDENTITY.md, tacit-knowledge.md
.openclaw/openclaw.json (has tokens/keys)
agents/ (agent specs and security rules)
memory/areas/, memory/resources/ (personal data)
Any file containing API keys, tokens, credentials
```

**Implementation option A (preferred):** Investigate whether the gateway's `/v1/*` or `/tools/invoke` API can serve scoped files. If yes — zero new infrastructure, use the existing gateway.

**Implementation option B (fallback):** Add a minimal read-only static file server (e.g., `npx serve` or Python `http.server`) on a separate port, scoped to the public directory only. Requires security review before install.

---

### Layer 3 — File Access: Write Path (Inbox Pattern)

**Problem:** External tools (Mission Control action buttons) need to write data. Giving them direct write access to workspace files is dangerous — a compromised tool could overwrite anything.

**Decision: Inbox pattern — external tools write only to one file; Happy validates and acts**

```
External tool (Mission Control)
  │
  └──POST──► task-queue.json (inbox file only)
                │
                └──Happy polls on heartbeat──► validates task ──► executes or rejects
```

**Rules:**
- External tools can only write to `mission-control/public/task-queue.json`
- They cannot write to any other file, path, or location
- Happy reads the queue, validates each entry against its own judgment (prompt injection defenses apply), and executes or rejects
- Happy marks items `status: "processing"` → `"done"` or `"rejected"` — external tool sees the result on next poll

**Why this is safe:**
- Worst case: task-queue.json is injected with a malicious task. Happy's prompt injection rules apply — untrusted content is data, not commands. Happy would flag it rather than execute.
- No direct shell access, no direct file writes to sensitive paths, no agent spawn without Happy's approval

**Implementation:** Requires a gateway write endpoint for `task-queue.json` specifically. If `/tools/invoke` doesn't support this, a minimal write endpoint is added to the gateway via config (needs investigation).

---

### Layer 4 — Auth

**Current:** Token auth — single token in `openclaw.json`. Good.

**Gaps:**
1. Token hasn't been rotated (overdue since 2026-03-03 per daily notes)
2. Token is stored in `openclaw.json` in plaintext on disk

**Decisions:**
- Rotate the gateway token now (I can do this — it's a config change)
- Keep token auth for Phase 1 (Tailscale network is the primary security layer)
- Phase 2 option: `allowTailscale: true` to use Tailscale identity headers instead of tokens (cleaner for mobile, no token to manage)

---

### Layer 5 — Blast Radius Scoping

If an external tool (e.g., Mission Control on R's phone) is compromised:

| Attack | Possible? | Why |
|--------|-----------|-----|
| Read SOUL.md / MEMORY.md / credentials | ❌ No | Not in public read scope |
| Read dashboard data (projects, blockers) | ✅ Yes | That's the intended access |
| Write to arbitrary files | ❌ No | Inbox pattern — only task-queue.json |
| Spawn an agent directly | ❌ No | Happy validates all tasks |
| Execute shell commands | ❌ No | No shell endpoint exposed |
| Reach gateway from public internet | ❌ No | Tailscale Serve — Tailnet only |

**Acceptable risk:** A compromised external tool can inject fake tasks into `task-queue.json`. Happy's prompt injection defenses handle this — same as any other untrusted input channel.

---

## What Needs to Happen (in order)

### Step 1 — Verify Tailscale CLI (R action, 2 mins)
Run in terminal: `tailscale status`
- If running and logged in → proceed to Step 2
- If not installed → security review required before install (not blocking other steps)

### Step 2 — Investigate gateway write API (Happy, ~30 mins)
Test whether `/tools/invoke` or any existing gateway endpoint can:
a) Serve files from a scoped directory
b) Accept writes to a specific file

Document findings. This determines whether we need extra infrastructure or can use what's already there.

### Step 3 — Enable Tailscale Serve (Happy executes after R approves)
2-line config change in `~/.openclaw/openclaw.json` + gateway restart.
**Gated action — requires R approval.**

### Step 4 — Rotate gateway token (Happy executes after R approves)
Generate new token, update config, restart gateway, update any hardcoded references.
**Gated action — requires R approval.**

### Step 5 — Create public directory + scoped read (Happy, ~15 mins)
Create `mission-control/public/`, write initial data files, configure read access.

### Step 6 — Document approved architecture in COMPANY.md (Happy)
Lock the decisions so every future build inherits them.

---

## Open Questions Requiring R Decision

**DECISION 1: Is Tailscale already installed on this Mac?**
→ Run `tailscale status` in terminal. Yes/no unblocks or re-routes Step 1.

**DECISION 2: Approve Tailscale Serve config change?**
→ Two config lines + gateway restart. Low risk. Reversible in 30 seconds.

**DECISION 3: Approve gateway token rotation?**
→ Tokens should rotate regularly. Overdue. ~5 mins.

**DECISION 4: If gateway has no write API — build a minimal sidecar, or keep external tools read-only for Phase 1?**
→ Option A: read-only Phase 1 (actions via Telegram/webchat) — ships faster, no security review needed
→ Option B: sidecar write server — requires security review, ~1 day extra
→ My lean: **read-only Phase 1**. Mission Control's primary value is visibility, not control. Control via chat is fine for now. Add write in Phase 2 once we know the gateway API surface better.

---

*Once R approves decisions 1–4, Happy executes steps 1–6. Mission Control PRD then has all its infrastructure answers.*
