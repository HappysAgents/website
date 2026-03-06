# GitHub PAT Upgrade — Monday Plan

**Goal:** Happy can create repos + read/write all code in HappysAgents org autonomously. No org admin access.
**Date:** 2026-03-06 (execute Monday 2026-03-10)
**R time required:** ~5 minutes

---

## The Plan

Replace the current fine-grained PAT (website-only) with a classic PAT scoped to `repo` only.

**What this gives Happy:**
- ✅ Create repos in HappysAgents org
- ✅ Read/write code in any org repo
- ✅ Clone, push, pull, open PRs

**What this does NOT give Happy:**
- ❌ Org settings or billing
- ❌ Member management
- ❌ Repo deletion (requires separate `delete_repo` scope — not added)
- ❌ GitHub Actions secrets or environments
- ❌ Anything outside code

**Blast radius if compromised:** attacker reads/writes code. Cannot delete repos, cannot touch org settings, cannot add members.

---

## R's Steps (Monday, ~5 min)

1. Go to: <https://github.com/settings/tokens/new> (classic tokens page)
2. **Token name:** `happy-agent-main`
3. **Expiry:** 90 days (rotation reminder already in cron)
4. **Scopes:** Check only ☑️ **`repo`** — do not check anything else
5. Click "Generate token"
6. Copy the token → paste it to Happy in Telegram or Discord (once only — GitHub won't show it again)

---

## Happy's Steps (after receiving token)

```bash
# Store token in gh CLI (macOS Keychain — not on disk)
echo "<TOKEN>" | gh auth login --with-token

# Verify access
gh repo list HappysAgents
gh api /user --jq '.login'

# Test repo creation (creates mission-control)
gh repo create HappysAgents/mission-control --private --description "Mission Control — agent ops dashboard"
```

---

## Also On Monday

Once PAT is working:
1. Create `HappysAgents/mission-control` repo
2. Push initial Mission Control structure (data files + Canvas PRD)
3. Build `dashboard.html` MVP

---

## Rotation

- 90-day expiry → cron reminder already set (GitHub PAT rotation cron)
- When rotating: R generates new token, pastes to Happy → Happy runs `gh auth login` again
- No config files to update — stored in macOS Keychain only
