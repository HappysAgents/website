# Security Review: pm-agent skill — Round 4

**Date:** 2026-03-03  
**Round:** 4 (additional deep pass — all files read in full, no grep shortcuts)  
**Method:** Every file read end-to-end, not pattern-matched

---

## Verdict: ⚠️ CAUTION
**Confidence:** High  
**Summary:** No injection vectors, no credential exfiltration, no identity spoofing, no hidden content. Two findings: one real functional bug (AMBER-9) that would cause a silent runtime failure in a real build, and one design-awareness note about engineer agents having Bash access by design.

---

## What Changed in Round 4

Previous rounds used grep and targeted checks. This round read every file in its entirety, word by word. That deeper reading surfaced one issue missed in Rounds 1–3.

---

## New Findings

### 🟡 AMBER-9: BUILD_STATUS.md path is inconsistent across the skill — agents will write to the wrong location

**Root cause:** The SKILL.md correctly defines `outputs/BUILD_STATUS.md` as the canonical path. But none of the 4 engineer agent files, and not the agent_coordination.md reference file, use that path. They all say `BUILD_STATUS.md` without the `outputs/` prefix — implying the project root.

**Evidence:**

`SKILL.md` (authoritative output paths section, line 664):
```
outputs/BUILD_STATUS.md
```

`agent_coordination.md` (Output File Conventions section):
```
BUILD_STATUS.md            — Shared status ledger (all roles)
```
← No `outputs/` prefix. Listed alongside project-root paths.

`agents/backend-engineer.md` (throughout):
> "Update `BUILD_STATUS.md`..."
> "set your status to `in_progress`"
> ← No path qualifier anywhere in the file

`agents/devops-engineer.md`, `agents/frontend-engineer.md`, `agents/qa-engineer.md`:
← Same pattern — all reference `BUILD_STATUS.md` without `outputs/` prefix

**Runtime consequence:** The PM agent writes to `outputs/BUILD_STATUS.md`. The 4 engineer agents write to `BUILD_STATUS.md` at the project root. Result: two separate files, neither seeing the other's updates. Engineers think they're coordinating; they're not. The build coordination model silently breaks.

**Risk level:** Not a security risk — but a functional failure that would cause the entire multi-agent coordination model to malfunction on first real use.

**Fix:** 4 targeted updates:
1. `agent_coordination.md` Output File Conventions: change `BUILD_STATUS.md` → `outputs/BUILD_STATUS.md`
2. `agents/backend-engineer.md`: replace all `BUILD_STATUS.md` references with `outputs/BUILD_STATUS.md`
3. `agents/frontend-engineer.md`: same
4. `agents/devops-engineer.md`: same
5. `agents/qa-engineer.md`: same

---

### 🔵 INFO (design awareness, not a security block): All 4 engineer agents have `tools: Bash`

**Files:** All 4 agent files (`frontend-engineer.md`, `backend-engineer.md`, `devops-engineer.md`, `qa-engineer.md`) have in their frontmatter:
```
tools: Read, Write, Bash, Glob, Grep
```

**Why it matters:** Bash grants shell execution. When R approves dispatch and an engineer agent is spawned, that agent can execute arbitrary shell commands. This is intentional — engineers need Bash to run migrations, tests, pipeline commands, and infra tooling. But it means:

- Engineer agents have broader access than the PM agent (which has no Bash in its SKILL.md)
- If a malicious brief were ever dispatched (e.g., via prompt injection at the PM layer that survives to dispatch), the receiving engineer agent could be directed to run shell commands
- The approval gate at Step 5 is the critical control here — it is the last safeguard before Bash-capable agents are activated

**This is not a blocker.** Engineer agents without Bash couldn't do their jobs. The approval gate is the right control. Surfacing so R understands the permission model when agents are live.

---

## Carried Forward from Round 3

### 🟡 AMBER-8 (cosmetic, non-blocking): devops-engineer.md line 55 prose path
```
Pipeline files live in `/.github/workflows/`.
```
Leading slash in a prose sentence. Structured output paths (lines 20–24) are correct with `./`. Optional fix.

---

## Full Clean Scan — No New Issues Found

| Check | Result |
|-------|--------|
| Zero-width unicode | ✅ Clean — all 10 files |
| Base64 payloads | ✅ None |
| Injection keywords (ignore/override/bypass/jailbreak/forget/pretend/act as/you are now) | ✅ Clean — all false positives confirmed benign (documentation anti-patterns, flow examples) |
| References to MEMORY.md, SOUL.md, ~/.openclaw, ~/.config, ~/.git-credentials | ✅ None |
| External URL fetch instructions | ✅ None |
| Subagent spawn instructions (outside approved gate) | ✅ None |
| Credential storage instructions | ✅ Explicitly prohibited at SKILL.md line 673 |
| Identity override attempts | ✅ None |
| Urgency / authority framing | ✅ None |
| Absolute filesystem paths (beyond AMBER-8) | ✅ Clean |
| LICENSE.txt tilde path (`~/openclaw-workspace`) | ✅ Low risk — metadata only, not an operational path |

---

## Files Confirmed Clean (full read)

- `SKILL.md` — 675 lines, read end-to-end ✅
- `LICENSE.txt` — MIT license, no embedded instructions ✅
- `agents/backend-engineer.md` — Solid security practices (RLS, parameterised queries, no credential logging) ✅
- `agents/frontend-engineer.md` — Good security (no sensitive data in client state) ✅
- `agents/devops-engineer.md` — Strong security posture (secrets management, principle of least privilege, no scripts from external URLs) ✅
- `agents/qa-engineer.md` — Clean, TDD-focused, no security concerns ✅
- `references/acceptance_criteria.md` — Documentation patterns only ✅
- `references/user_flow_examples.md` — Flow templates only ✅
- `references/tech_stack_options.md` — npm install commands properly disclaimed ✅
- `references/agent_coordination.md` — Except AMBER-9 path inconsistency ✅ (after fix)

---

## Fix Required Before Final Approval

**AMBER-9 must be fixed.** It won't cause a security breach — but it will silently break the skill's core functionality on first real use, which undermines the entire reason for building it. A 5-minute fix.

After AMBER-9 is applied: ✅ APPROVED.

---

## Recommended Fixes

**AMBER-9 — BUILD_STATUS.md path (functional, required):**

In `agent_coordination.md`, Output File Conventions section:
```
# Change:
BUILD_STATUS.md            — Shared status ledger (all roles)
# To:
outputs/BUILD_STATUS.md    — Shared status ledger (all roles)
```

In each of the 4 agent files, replace all bare `BUILD_STATUS.md` references with `outputs/BUILD_STATUS.md`.

**AMBER-8 — devops-engineer.md line 55 (cosmetic, optional):**
```
# Change:
Pipeline files live in `/.github/workflows/`.
# To:
Pipeline files live in `./.github/workflows/`.
```
