<!-- markdownlint-disable -->

# Hardening Report: CatChen--eslint-suggestion-action/v4.1.35

> This file was generated automatically by the hardening agent.

**Policy SHA:** `d636be7e43ef829af6e853da6b3c7566db9f72fe`

**Test Policy SHA:** `843adf9e4b8f85d0c08b27b9d0b09dd094b54702`

**Harden Agent Version:** `2`

Action **CatChen--eslint-suggestion-action/v4.1.35** was hardened automatically. 4 finding(s) were identified and resolved across 2 iteration(s).

## Findings Fixed

### unpinned-uses (severity: high)

All workflow files use mutable tag/version refs instead of pinned 40-character SHA commits, making them vulnerable to supply-chain attacks. Failing references include: build.yml: actions/create-github-app-token@v3, actions/checkout@v7, actions/setup-node@v7, CatChen/check-git-status-action@v2; codeql.yml: actions/checkout@v7, github/codeql-action/init@v4.37.7, github/codeql-action/analyze@v4.37.7; dependabot.yml: dependabot/fetch-metadata@v3; eslint.yml: actions/checkout@v7, actions/setup-node@v7; graphql-schema.yml: actions/create-github-app-token@v3, actions/checkout@v7, actions/setup-node@v7, CatChen/check-git-status-action@v2, CatChen/config-git-with-token-action@v2; release.yml: actions/create-github-app-token@v3, actions/checkout@v7, actions/setup-node@v7, CatChen/node-package-release-action@v2; ship.yml: actions/checkout@v7, actions/create-github-app-token@v3, CatChen/accept-to-ship-action@v0.8; test-pr.yml: actions/checkout@v7, actions/setup-node@v7; test-push.yml: actions/checkout@v7, actions/setup-node@v7; test.yml: actions/checkout@v7, CatChen/config-git-with-token-action@v2.

Locations:

- `.github/workflows/build.yml:22`
- `.github/workflows/codeql.yml:60`
- `.github/workflows/dependabot.yml:16`
- `.github/workflows/eslint.yml:22`
- `.github/workflows/graphql-schema.yml:18`
- `.github/workflows/release.yml:64`
- `.github/workflows/ship.yml:55`
- `.github/workflows/test-pr.yml:18`
- `.github/workflows/test-push.yml:20`
- `.github/workflows/test.yml:46`

### missing-permissions (severity: medium)

eslint.yml has no top-level permissions key and its single job (eslint) also has no job-level permissions key. Without explicit permissions, the workflow inherits the default repository permissions, which may be overly broad.

Locations:

- `.github/workflows/eslint.yml:1`

### script-injection (severity: high)

Sub-rule (a): A ${{ ... }} expression is directly interpolated inside a run: shell command string. In test-push.yml, the step 'Set check run id' contains: `run: echo "check-run-id=${{ job.check_run_id }}" >> $GITHUB_OUTPUT`. The expression ${{ job.check_run_id }} is substituted by the Actions runner before the shell sees the command, allowing any value in that context to be interpreted as shell syntax.

Locations:

- `.github/workflows/test-push.yml:44`

### github-env-injection (severity: high)

In test-push.yml, the step 'Set check run id' writes a value derived from ${{ job.check_run_id }} directly to $GITHUB_OUTPUT without the required sanitization step (printf '%s' ... | tr -d '\n\r'). The run block is: `echo "check-run-id=${{ job.check_run_id }}" >> $GITHUB_OUTPUT`. This allows a newline-containing value to inject additional key=value pairs into the output file.

Locations:

- `.github/workflows/test-push.yml:44`

## Iteration Notes

### Iteration 1

**Fixes applied:** unpinned-uses, missing-permissions, script-injection, github-env-injection

**Notes:**

Fixed all findings across 10 workflow files:

1. unpinned-uses: Pinned all action references to full 40-char SHAs with tag comments in build.yml, codeql.yml, dependabot.yml, eslint.yml, graphql-schema.yml, release.yml, ship.yml, test-pr.yml, test-push.yml, and test.yml.

2. missing-permissions: Added `permissions: contents: read` to eslint.yml (contents: read is the minimum needed for actions/checkout).

3. script-injection + github-env-injection: Fixed the 'Set check run id' step in test-push.yml by moving ${{ job.check_run_id }} into the env: block as CHECK_RUN_ID, then sanitizing with `printf '%s' "$CHECK_RUN_ID" | tr -d '\n\r'` before writing to $GITHUB_OUTPUT.

### Iteration 1

**Fixes applied:** missing-permissions

**Notes:**

Fixed missing permissions in two workflow files: (1) ship.yml: Added `permissions: {}` to the `concurrency-group` job, which only runs an echo command and requires no repository access. (2) release.yml: Added `permissions: { contents: read }` to the `eslint` job (reusable workflow call that only needs to read repo contents) and `permissions: { contents: write }` to the `release` job (performs checkout and runs node-package-release-action which creates tags and releases). All jobs in both workflows now have explicit permission blocks.

