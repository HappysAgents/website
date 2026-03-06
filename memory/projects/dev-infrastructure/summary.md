# Dev Infrastructure — Project Summary
*Last updated: 2026-03-06*

## Status: 🟡 Architecture designed, awaiting R approval to install OrbStack

## What This Is
The infrastructure that allows a Dev Agent to safely build internal tools and external products without risk to the main MacBook environment (OpenClaw config, API keys, memory files).

## One-Line Architecture
OrbStack Docker containers on MacBook for isolated builds → GitHub as sole deploy path → Cloudflare Workers Builds for external products.

## Key Files
| File | Contents |
|------|---------|
| `security-arch.md` | Full security architecture — sandbox, secrets, git workflow, API policy |
| `secure-build-environment-plan.md` | Original build environment plan (2026-03-04) |
| `dev-agent-review.md` | Dev Agent technical review of the plan (2026-03-04) |
| `/agents/dev-agent.md` | Dev Agent spec — role, rules, startup protocol |
| `git-workflow.md` | Detailed git workflow reference |
| `secrets-management.md` | Secrets patterns and provisioning guide |

## Current State (2026-03-06)
- OrbStack: NOT INSTALLED — requires R approval + security review
- Docker: NOT INSTALLED
- Homebrew: NOT INSTALLED
- Exec approvals: `allowlist` mode, forwarding to Telegram
- Dev Agent spec: WRITTEN (agents/dev-agent.md)
- Security architecture: WRITTEN (security-arch.md)

## Blockers Before Dev Agent Can Build
1. ⚠️ R approval to install Homebrew
2. ⚠️ R approval to install OrbStack (via security agent review)
3. ⚠️ R to provision secrets in `~/.secrets/dev-agent/`
4. ⚠️ Add Docker/OrbStack to exec-approvals.json allowlist

## What Dev Agent CAN Do Right Now (No Blockers)
- Write code files
- Create git branches and commits
- Open PRs via gh CLI
- Research, plan, document
- Build pure HTML/static tools (no npm install needed)

## Decisions Locked
- Container-only builds: no npm/pip on bare Mac ever
- `~/.secrets/` for all credentials (outside workspace, chmod 700)
- GitHub + Cloudflare Workers Builds = only deploy path to production
- No Hetzner until a service needs 24/7 uptime independent of MacBook
- GitHub Actions: all Actions pinned to commit SHA (never @v3 tags)
