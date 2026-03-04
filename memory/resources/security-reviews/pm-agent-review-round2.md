# Security Review: pm-agent skill — Round 2

**Date:** 2026-03-03  
**Round:** 2 of 3  
**Status:** Post-Round-1 fixes verified + new issues found

---

## Round 1 Fix Verification

| Fix | Status |
|-----|--------|
| npm install commands commented out + disclaimed | ✅ Confirmed |
| agent_coordination.md paths changed to `./` prefix | ✅ Confirmed |
| SKILL.md agent-file-as-template disclaimer added | ✅ Confirmed (line 574) |
| Dispatch approval language tightened to reference communication tools | ✅ Confirmed (line 105) |

All Round 1 fixes verified. No regressions.

---

## Verdict: ⚠️ CAUTION
**Confidence:** High  
**Summary:** No injections, no hidden content. Three new amber issues discovered in deeper analysis — inconsistent BUILD_STATUS.md path, missing no-credentials-in-documents instruction, and leftover absolute-style paths in `devops-engineer.md`.

---

## New Issues Found in Round 2

### 🟡 AMBER-5: BUILD_STATUS.md location is inconsistent

**Files:** `SKILL.md` lines 536 vs 664

Line 536 (Role Task Brief System section):
> "Create this file in the project root."

Line 664 (Output File Naming section):
> `outputs/BUILD_STATUS.md`

**Risk:** The PM agent has conflicting instructions about where to write BUILD_STATUS.md. This could cause the agent to write two copies in different locations, or cause engineer agents to fail to find it. Minor but confusing — and in an edge case where "project root" resolves to somewhere outside the workspace, it could write outside the expected boundary.

**Fix:** Make both references consistent. BUILD_STATUS.md should live in `outputs/` alongside the PRD and briefs.

---

### 🟡 AMBER-6: No explicit instruction to never write credential values into output files

**File:** `SKILL.md`

The PRD template includes sections for Security Requirements, Environment Variables (with a "Sensitive: Yes/No" column), and Test Account Credentials Strategy. These are designed for documentation purposes (variable names and descriptions, not values).

However, there is no explicit instruction telling the PM agent: **do not include actual credential values, API keys, passwords, or tokens in any output file.**

**Risk:** If a product owner pastes a credential value into the conversation (e.g., "here's my Stripe key: sk_live_..."), the PM agent might include it verbatim in the PRD or brief. This would embed a live credential in a file stored in the workspace — a significant information exposure risk.

**Fix:** Add to the Output Generation section: "Never include actual credential values (API keys, passwords, tokens, secrets) in any PRD, brief, or output file. If a product owner provides a credential value during the conversation, do not record it — acknowledge receipt and instruct them to store it in their secrets management system."

---

### 🟡 AMBER-7: `devops-engineer.md` output paths use absolute-style leading `/`

**File:** `agents/devops-engineer.md`  
**Lines:** 20–24

```
/.github/workflows/          — CI/CD pipeline definitions
/infra/                      — Infrastructure as code (Terraform, Pulumi, etc.)
/infra/[env]/                — Per-environment configuration
/docs/runbooks/              — Deployment runbooks and operational guides
/docs/monitoring/            — Monitoring and alerting configuration
```

**Risk:** Same issue fixed in `agent_coordination.md` in Round 1. DevOps agent has `/.github/workflows/` with a leading `/` — looks like an absolute filesystem path. While convention makes clear these are project-relative, this is the same ambiguity that was flagged and fixed elsewhere.

**Fix:** Change to `./` prefix for all paths, consistent with the fix applied in `agent_coordination.md`.

---

## Items Confirmed Clean in Round 2

- Credential guidance in agent files is consistently "document names, not values" — backend, devops, frontend all handle this correctly
- No `cd` or directory-change instructions anywhere
- DevOps pipeline security instruction explicitly says "Do not introduce pipeline steps that run arbitrary scripts fetched from external URLs" — security positive
- All approval gate language is clear and actionable
- BUILD_STATUS.md template section contains no sensitive content
- PRD template placeholder `[Test account credentials strategy]` is a section header, not an instruction to store credentials

---

## Fixes to Apply Before Round 3

1. `SKILL.md` line 536: Change "project root" to `outputs/` for BUILD_STATUS.md location
2. `SKILL.md` Output Generation section: Add no-credentials-in-documents instruction
3. `agents/devops-engineer.md` lines 20–24: Change to `./` prefix for all output paths
