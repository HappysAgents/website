# Security Review — 1Password Migration Plan
Date: 2026-03-06
Reviewer: Security Agent

## Verdict
**🚨 BLOCKED**

## Summary
The proposed plan is architecturally invalid and will fail if executed. The specific `SecretRef` JSON schema proposed (`id: "op://..."`) is not supported by the OpenClaw `exec` provider, which does not pass the `id` field as a command-line argument to the executable. Additionally, the plan targets a credential (`gateway.auth.token`) that is explicitly unsupported for SecretRefs, and proposes a direct file edit that violates core safety rules.

## Findings

### 🚨 BLOCK items (plan must not proceed until resolved)

1.  **Invalid SecretRef Architecture**:
    - **The Plan:** Proposes a single "default" provider and passing the 1Password item path in the `id` field: `{ "id": "op://..." }`.
    - **The Reality:** OpenClaw's `exec` provider does **not** dynamically pass the `id` field to the CLI command as an argument. It sends a JSON payload to `stdin` (which `op` does not natively understand) OR runs a fixed command where the `id` selects a key from the JSON output.
    - **Fix:** You must either:
        - A) Define a separate `exec` provider for *each* secret, baking the `op://` URL into the `args` array (e.g., `provider: "op_telegram"`, `args: ["read", "op://..."]`).
        - B) Write a wrapper script (middleware) that translates the OpenClaw `exec` JSON protocol (stdin) into `op read` calls.

2.  **Unsupported Credential Target**:
    - The plan includes migrating `gateway.auth.token`.
    - **Documentation Check:** `docs/reference/secretref-credential-surface.md` explicitly lists `gateway.auth.token` as **unsupported** for SecretRefs. It is a runtime-minted artifact, not a static static configuration.

3.  **Missing `allowSymlinkCommand`**:
    - The plan uses Homebrew (`/opt/homebrew/bin/op`), which uses symlinks.
    - OpenClaw's `exec` provider requires `allowSymlinkCommand: true` for symlinked binaries. Without this, resolution will fail with a security error.

4.  **Policy Violation (Rule A)**:
    - The plan explicitly states: *"Config change method: Direct edit of ~/.openclaw/openclaw.json via exec"*.
    - **Violation:** SOUL.md Rule A strictly forbids direct edits to this file. All changes must use `gateway config.patch` or the `openclaw secrets configure` interactive tool.

### ⚠️ CHANGE items (recommend changing before execution)

1.  **Installation Command**:
    - Plan uses `brew install 1password-cli`.
    - Recommended: `brew install --cask 1password-cli`. While Homebrew often redirects, the cask is the official distribution method for the binary.

2.  **Session Management**:
    - Plan uses `eval $(op signin)`. This is the manual/legacy flow.
    - If this is a desktop Mac with a logged-in user, enabling **1Password App Integration** (Biometric unlock) is significantly more secure and convenient than managing raw session tokens in environment variables.

### 💡 NOTE items (flagged for awareness, not blocking)

1.  **Supply Chain**: The Homebrew cask `1password-cli` is legitimate (published by AgileBits) and widely used (>80k installs/month).
2.  **Vault Isolation**: A dedicated `openclaw-agent` vault is good practice.
3.  **Sub-agent Risk**: The plan correctly identifies that any active `op` session allows sub-agents to read secrets. This is an accepted risk of the "Agent-Blind" architecture until OS-level sandboxing is available.

## Recommended Plan Changes

1.  **Rewrite Phase 3 (Architecture)**:
    - Remove the single "default" provider concept.
    - Define individual providers for each secret in `secrets.providers`, e.g.:
      ```json
      "op_telegram": {
        "source": "exec",
        "command": "/opt/homebrew/bin/op",
        "args": ["read", "op://openclaw-agent/telegram/credential", "--no-newline"],
        "allowSymlinkCommand": true,
        "trustedDirs": ["/opt/homebrew/bin"]
      }
      ```
    - Update `openclaw.json` to reference these specific providers (e.g., `provider: "op_telegram", id: "value"`).

2.  **Remove `gateway.auth.token`** from the migration list (it cannot be migrated).

3.  **Use `openclaw secrets configure`** for the migration implementation instead of manual JSON editing. This tool handles the config patching safely.

## Green-Lit Steps
- Phase 1: `brew install --cask 1password-cli` is safe.
- Phase 2: Creating the vault and items is safe.
- Phase 5: Cleanup steps are accurate.
