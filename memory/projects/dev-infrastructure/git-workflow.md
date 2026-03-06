# Git Workflow — Dev Agent
*Written: 2026-03-06*

## Overview

Dev Agent writes code → commits to a feature branch → opens a PR → Happy reviews → R approves → merge. No direct pushes to main.

---

## Branch Strategy

### Branch Naming
```
feature/<brief-slug>     # New features and builds
fix/<brief-slug>         # Bug fixes
chore/<brief-slug>       # Deps, refactoring, non-functional changes
docs/<brief-slug>        # Documentation only, no code changes
```

### Protected Branches
- `main` — production. No direct pushes. PR required with Happy + R approval.
- `production` — if used for staged deploys (future). Same protection.

### Branch Lifecycle
```
main
 └── feature/mission-control-phase1   ← Dev Agent creates this
      ↓ [Dev Agent writes code, commits]
      ↓ [Dev Agent opens PR]
      ↓ [Happy reviews]
      ↓ [R approves]
      └── merged to main              ← Cloudflare auto-deploys
          └── feature branch deleted
```

---

## Commit Standards

### Format
```
<type>: <short description>

[optional body]
[optional: Closes #issue-number]
```

Types: `feat`, `fix`, `chore`, `docs`, `refactor`, `test`

### Examples
```
feat: add email subscribe form to homepage
fix: resolve CORS error on subscribe endpoint
chore: pin GitHub Actions to commit SHAs
docs: update README with deploy instructions
```

### Rules
- Commits are atomic: one logical change per commit
- No secrets in commits (enforced by .gitignore + PR checklist)
- No merge commits from Dev Agent — use rebase or squash

---

## PR Process

### Opening a PR
Dev Agent always uses gh CLI:
```bash
gh pr create \
  --title "feat: [description]" \
  --body "$(cat <<'EOF'
## What changed
[short description]

## Why
[problem this solves]

## How to test
[steps to verify it works]

## Security notes
[new deps? new APIs? new secrets needed?]

## Checklist
- [ ] No secrets in code
- [ ] All builds ran in containers (not bare Mac)
- [ ] .gitignore updated if new secret patterns
- [ ] GitHub Actions: all Actions pinned to commit SHA
- [ ] Happy reviewed
EOF
)" \
  --base main
```

### PR Review Flow
1. **Dev Agent opens PR** → posts link to Happy via Discord
2. **Happy reviews** — code quality, logic, security flags
3. **Security Agent** — spawned by Happy if any new packages added
4. **R approves** — final merge decision
5. **Merge** — squash merge preferred; branch auto-deleted

### What Happy Reviews For
- Correctness: does it do what the task brief asked?
- Security: any hardcoded secrets? Any suspicious deps? Any unescaped inputs?
- GitHub Actions: are all Actions pinned to commit SHA?
- Container compliance: did Dev Agent build inside a container (not bare Mac)?
- .gitignore: are secret patterns blocked?

### What R Approves
- Any change that goes to production (public-facing)
- Any new external API added
- Any infrastructure change
- Any PR that Happy flags concerns on

---

## GitHub Actions Rules (Non-Negotiable)

All GitHub Actions workflows MUST:
1. Pin all `uses:` lines to **commit SHA**, not version tags
   ```yaml
   # WRONG
   uses: actions/checkout@v4
   # CORRECT
   uses: actions/checkout@11bd71901bbe5b1630ceea73d27597364c9af683
   ```
2. Never use `pull_request_target` trigger without explicit trust checks
3. Never log secrets to stdout
4. Store all secrets in GitHub Actions Secrets — never in workflow YAML

This rule exists because of the tj-actions supply chain attack (identified in security review 2026-03-04). Tag-based pinning = trusting the repo owner forever. SHA-pinning = trusting a specific commit.

---

## Repositories

### Current repos (as of 2026-03-06)
| Repo | Purpose | Deploy |
|------|---------|--------|
| `HappysAgents/website` | happysagents.com | Cloudflare Workers Builds (auto on push to main) |

### Creating a new repo
1. Happy asks R for approval (Rule 2 — repo creation is a gated action)
2. R approves
3. Happy creates via `gh repo create` with appropriate visibility
4. Dev Agent is given write access (not admin)
5. Cloudflare Workers Builds connected to repo if it's a web project

---

## What Dev Agent Cannot Do
- Push to `main` directly
- Create or delete repos without approval
- Trigger GitHub Actions manually
- Merge their own PRs
- Change repo settings or branch protections
