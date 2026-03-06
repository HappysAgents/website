# Secrets Management — Dev Agent
*Written: 2026-03-06*

## The Problem

Dev Agent needs API keys to build and test products (Cloudflare, Beehiiv, GitHub, etc.). These secrets must not:
- Appear in task briefs or chat history
- Be stored in the workspace (git-tracked)
- Show up in shell history (`--env VAR=value` on docker run)
- Leak into container image layers

## The Solution: `~/.secrets/dev-agent/`

```
~/.secrets/                     ← chmod 700 (owner read/write only)
└── dev-agent/
    ├── .env.website             ← Website/Beehiiv secrets
    ├── .env.mission-control     ← Mission Control secrets (future)
    ├── .env.template            ← Template for new projects
    └── README.md                ← Describes what keys exist (no values)
```

**Rules for this directory:**
- `chmod 700 ~/.secrets/` — only dirtyagent can access
- `chmod 600 ~/.secrets/dev-agent/.env.*` — read-only for owner
- Never inside `~/openclaw-workspace/` (git-tracked!)
- Never in Dockerfile or docker-compose.yml
- Never in GitHub (not even gitignored — one wrong `git add` is disaster)

---

## Secret Injection Pattern

### In Container Builds
```bash
# CORRECT: --env-file (file path not in shell history, values not in docker inspect)
docker run --rm \
  --env-file /Users/dirtyagent/.secrets/dev-agent/.env.website \
  node:22-alpine \
  npm run build

# WRONG: --env VAR=value (appears in docker inspect, shell history)
docker run --rm \
  --env BEEHIIV_API_KEY=abc123 \   ← NEVER DO THIS
  node:22-alpine \
  npm run build
```

### In GitHub Actions (for production deploys)
```yaml
# Secrets go in GitHub Actions Secrets, never in YAML
- name: Deploy to Cloudflare
  env:
    CLOUDFLARE_API_TOKEN: ${{ secrets.CLOUDFLARE_API_TOKEN }}
  run: wrangler deploy
```

---

## Secret File Format

```bash
# ~/.secrets/dev-agent/.env.website
# Last updated: YYYY-MM-DD by R
# Project: happysagents.com

BEEHIIV_API_KEY=
BEEHIIV_PUBLICATION_ID=
CLOUDFLARE_API_TOKEN=
```

```bash
# ~/.secrets/dev-agent/.env.template
# Template for new projects — copy and fill in

PROJECT_API_KEY=
PROJECT_SECRET=
```

---

## Provisioning Secrets (R's Responsibility)

Dev Agent does NOT create or store secrets. R provisions them directly:

```bash
# R runs these commands manually (not via Happy)
mkdir -p ~/.secrets/dev-agent
chmod 700 ~/.secrets/dev-agent
touch ~/.secrets/dev-agent/.env.website
chmod 600 ~/.secrets/dev-agent/.env.website
# Then edit the file manually with the values
nano ~/.secrets/dev-agent/.env.website
```

Dev Agent is told: "Secrets for this project are in `~/.secrets/dev-agent/.env.website`"
Dev Agent uses the path in container commands — it never reads or logs the values.

---

## What Dev Agent Must Do When a Build Needs Secrets

1. In the task brief response, list what secrets are needed
2. Wait for confirmation from Happy/R that secrets are provisioned
3. Reference the secret file path in container launch commands
4. Never log, print, or write env var values to any file
5. If a command requires `--env VAR=value` format: flag to Happy, wait for approval

---

## Secret Rotation

- Secrets should be rotated every 90 days (or immediately if exposure suspected)
- R rotates by editing the `~/.secrets/dev-agent/.env.*` files directly
- GitHub Actions secrets rotated via GitHub UI
- Cloudflare secrets rotated via Workers dashboard or `wrangler secret put`

---

## Current Secrets Inventory

| Secret | Location | Status | Notes |
|--------|----------|--------|-------|
| BEEHIIV_API_KEY | Cloudflare Worker secrets | ✅ Active | Website subscribe |
| BEEHIIV_PUBLICATION_ID | Cloudflare Worker secrets | ✅ Active | Website subscribe |
| GitHub PAT (fine-grained) | gh CLI → macOS Keychain | ✅ Rotated 2026-03-05 | `repo` scope |
| Telegram bot token | `~/.openclaw/openclaw.json` | ⚠️ High-risk location | Inherent, documented |
| Discord bot token | `~/.secrets/discord/` | ✅ Moved 2026-03-05 | chmod 600 |

**Pending:** `~/.secrets/dev-agent/` directory doesn't exist yet — needs R to provision before first build.
