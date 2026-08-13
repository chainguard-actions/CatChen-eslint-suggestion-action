<!-- markdownlint-disable -->

# Hardening Report: CatChen--eslint-suggestion-action/v4.1.29

> This file was generated automatically by the hardening agent.

**Policy SHA:** `d636be7e43ef829af6e853da6b3c7566db9f72fe`

**Test Policy SHA:** `843adf9e4b8f85d0c08b27b9d0b09dd094b54702`

**Harden Agent Version:** `2`

Action **CatChen--eslint-suggestion-action/v4.1.29** was hardened automatically. 4 finding(s) were identified and resolved across 1 iteration(s).

## Findings Fixed

### unpinned-uses (severity: high)

All workflow files use mutable version tags instead of pinned full SHA commits, making them vulnerable to supply-chain attacks. Failing references include: actions/create-github-app-token@v3, actions/checkout@v6, actions/setup-node@v6, CatChen/check-git-status-action@v2, github/codeql-action/init@v4, github/codeql-action/analyze@v4, dependabot/fetch-metadata@v3, CatChen/config-git-with-token-action@v2, CatChen/node-package-release-action@v2, CatChen/accept-to-ship-action@v0.8.

Locations:

- `.github/workflows/build.yml:21`
- `.github/workflows/codeql.yml:55`
- `.github/workflows/dependabot.yml:16`
- `.github/workflows/eslint.yml:22`
- `.github/workflows/graphql-schema.yml:18`
- `.github/workflows/release.yml:62`
- `.github/workflows/ship.yml:57`
- `.github/workflows/test-pr.yml:20`
- `.github/workflows/test-push.yml:23`
- `.github/workflows/test.yml:47`

### script-injection (severity: high)

Rule (a) violation: The expression ${{ job.check_run_id }} is directly interpolated inside a run: shell command string. This causes YAML template substitution to inject the value before the shell ever sees it. Offending line: `run: echo "check-run-id=${{ job.check_run_id }}" >> $GITHUB_OUTPUT`

Locations:

- `.github/workflows/test-push.yml:46`

### github-env-injection (severity: high)

The run: block writes ${{ job.check_run_id }} directly to $GITHUB_OUTPUT without the required sanitization step (printf '%s' ... | tr -d '\n\r'). Offending line: `run: echo "check-run-id=${{ job.check_run_id }}" >> $GITHUB_OUTPUT`

Locations:

- `.github/workflows/test-push.yml:46`

### missing-permissions (severity: medium)

eslint.yml has no top-level permissions block and its only job ('eslint') also has no permissions block. release.yml has no top-level permissions block and the 'eslint' job (reusable call) and 'release' job both lack permissions blocks. ship.yml has no top-level permissions block and the 'concurrency-group' job lacks a permissions block.

Locations:

- `.github/workflows/eslint.yml:1`
- `.github/workflows/release.yml:1`
- `.github/workflows/ship.yml:1`

## Iteration Notes

### Iteration 1

**Fixes applied:** unpinned-uses, script-injection, github-env-injection, missing-permissions

**Notes:**

Fixed all findings across 10 workflow files:

1. unpinned-uses: Pinned all mutable tag references to full commit SHAs in build.yml, codeql.yml, dependabot.yml, eslint.yml, graphql-schema.yml, release.yml, ship.yml, test-pr.yml, test-push.yml, and test.yml. All 10 actions (actions/create-github-app-token@v3, actions/checkout@v6, actions/setup-node@v6, CatChen/check-git-status-action@v2, github/codeql-action/init@v4, github/codeql-action/analyze@v4, dependabot/fetch-metadata@v3, CatChen/config-git-with-token-action@v2, CatChen/node-package-release-action@v2, CatChen/accept-to-ship-action@v0.8) are now pinned with SHA + tag comment.

2. script-injection + github-env-injection: In test-push.yml line 46, moved ${{ job.check_run_id }} out of the run: shell string into an env: block (CHECK_RUN_ID), then sanitized with printf '%s' "$CHECK_RUN_ID" | tr -d '\n\r' before writing to $GITHUB_OUTPUT.

3. missing-permissions: Added permissions blocks to eslint.yml job (contents: read, pull-requests: write), release.yml eslint reusable call job (contents: read, pull-requests: write), release.yml release job (contents: write, pull-requests: write), and ship.yml concurrency-group job (permissions: {}).

