# GitHub Org Security + PAT Upgrade — Monday Plan

**Goal:** R is org owner. Happy is a member with repo create + read/write only. No admin access if Happy's account is compromised.
**Date:** 2026-03-06 (execute Monday 2026-03-10)
**R time required:** ~15 minutes

---

## The Problem

Currently `happy-agent-org` is the **owner** of HappysAgents org. If Happy's account or PAT is compromised, attacker gets full org admin: delete repos, change settings, add members. That's too much.

---

## Target Architecture

| Account | Role | Can do |
|---------|------|--------|
| R's personal GitHub account | **Owner** | Everything — billing, settings, members, delete |
| `happy-agent-org` | **Member** | Create repos, read/write all code |

---

## R's Steps (Monday, ~15 min)

### Step 1 — R creates a personal GitHub account (if not already)
- Go to github.com → Sign up
- Use R's personal email (not happy-agent@agentmail.to)
- This account will be the org owner forever

### Step 2 — R joins HappysAgents org as owner
- R sends Happy a message with their new GitHub username
- Happy invites R to the org: `gh api /orgs/HappysAgents/invitations -f email="R's email" -f role="owner"`
- R accepts the invite via email

### Step 3 — R confirms they now show as Owner in the org
- Go to: github.com/orgs/HappysAgents/people
- Confirm R's account shows "Owner"

### Step 4 — Demote happy-agent-org to Member
- R goes to: github.com/orgs/HappysAgents/people
- Click on `happy-agent-org` → Change role → **Member**
- Confirm demotion

### Step 5 — Set org member privileges to allow repo creation
- R goes to: github.com/organizations/HappysAgents/settings/member_privileges
- **Base permissions:** Write (members can read/write all repos)
- **Repository creation:** Allow members to create ☑️ Private repositories (uncheck Public)
- Save

### Step 6 — Generate classic PAT for Happy (repo scope only)
- Go to: github.com/settings/tokens/new (logged in as `happy-agent-org`)
- **Token name:** `happy-agent-main`
- **Expiry:** 90 days
- **Scopes:** ☑️ `repo` only
- Generate → copy token → paste to Happy in Discord/Telegram

---

## Happy's Steps (after receiving token)

```bash
# Store in gh CLI / macOS Keychain
echo "<TOKEN>" | gh auth login --with-token

# Verify member access
gh repo list HappysAgents

# Test repo creation (should now work as member)
gh repo create HappysAgents/mission-control --private --description "Mission Control — agent ops dashboard"
```

---

## Result

- R's account = org owner = only R can delete org, change billing, manage members
- Happy = member with `repo` PAT = can create repos and push code
- Compromised Happy PAT = attacker reads/writes code only. Cannot touch org settings.

---

## Also On Monday (after PAT works)

1. Create `HappysAgents/mission-control` repo
2. Push initial Mission Control structure
3. Build `dashboard.html` MVP
4. Investigate + fix cron errors (Morning Review + Daily Briefing — 3 consecutive failures)
