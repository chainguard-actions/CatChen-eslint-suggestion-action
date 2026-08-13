<!-- markdownlint-disable -->

# Hardening Report: CatChen--eslint-suggestion-action/v4.1.33

> This file was generated automatically by the hardening agent.

**Policy SHA:** `d636be7e43ef829af6e853da6b3c7566db9f72fe`

**Test Policy SHA:** `843adf9e4b8f85d0c08b27b9d0b09dd094b54702`

**Harden Agent Version:** `2`

Action **CatChen--eslint-suggestion-action/v4.1.33** was hardened automatically. 4 finding(s) were identified and resolved across 2 iteration(s).

## Findings Fixed

### unpinned-uses (severity: high)

Multiple workflow files use mutable version tags instead of pinned SHA hashes for `uses:` references, making them vulnerable to supply-chain attacks if the referenced action is compromised or the tag is moved.

Failing references include:
- build.yml: actions/create-github-app-token@v3, actions/checkout@v7, actions/setup-node@v6, CatChen/check-git-status-action@v2
- codeql.yml: actions/checkout@v7, github/codeql-action/init@v4, github/codeql-action/analyze@v4
- dependabot.yml: dependabot/fetch-metadata@v3
- eslint.yml: actions/checkout@v7, actions/setup-node@v6
- graphql-schema.yml: actions/create-github-app-token@v3, actions/checkout@v7, actions/setup-node@v6, CatChen/check-git-status-action@v2, CatChen/config-git-with-token-action@v2
- release.yml: actions/create-github-app-token@v3, actions/checkout@v7, actions/setup-node@v6, CatChen/node-package-release-action@v2
- ship.yml: actions/checkout@v7, actions/create-github-app-token@v3, CatChen/accept-to-ship-action@v0.8
- test-pr.yml: actions/checkout@v7, actions/setup-node@v6
- test-push.yml: actions/checkout@v7, actions/setup-node@v6
- test.yml: actions/checkout@v7, CatChen/config-git-with-token-action@v2

Locations:

- `.github/workflows/build.yml:21`
- `.github/workflows/codeql.yml:57`
- `.github/workflows/dependabot.yml:16`
- `.github/workflows/eslint.yml:21`
- `.github/workflows/graphql-schema.yml:16`
- `.github/workflows/release.yml:57`
- `.github/workflows/ship.yml:55`
- `.github/workflows/test-pr.yml:20`
- `.github/workflows/test-push.yml:22`
- `.github/workflows/test.yml:44`

### missing-permissions (severity: medium)

Several workflow files have no top-level `permissions:` key and contain at least one job without a job-level `permissions:` key, meaning those jobs run with the default (potentially broad) token permissions.

- eslint.yml: No top-level permissions; the only job (`eslint`) has no permissions block.
- release.yml: No top-level permissions; the `eslint` job (reusable workflow call) and the `release` job both lack a permissions block.
- ship.yml: No top-level permissions; the `concurrency-group` job has no permissions block.

Locations:

- `.github/workflows/eslint.yml:1`
- `.github/workflows/release.yml:1`
- `.github/workflows/ship.yml:1`

### script-injection (severity: high)

Sub-rule (a) violation: A `${{ }}` expression is interpolated directly inside a `run:` shell command string. In test-push.yml, the step 'Set check run id' contains:

  run: echo "check-run-id=${{ job.check_run_id }}" >> $GITHUB_OUTPUT

The `${{ job.check_run_id }}` expression is expanded by the GitHub Actions template engine before the shell sees the command, allowing any special characters in the value to be interpreted by the shell.

Locations:

- `.github/workflows/test-push.yml:38`

### github-env-injection (severity: high)

A value derived from a `${{ }}` expression is written directly to `$GITHUB_OUTPUT` without the required sanitization step (`printf '%s' ... | tr -d '\n\r'`). In test-push.yml:

  run: echo "check-run-id=${{ job.check_run_id }}" >> $GITHUB_OUTPUT

The `job.check_run_id` value is interpolated directly into the shell command and written to GITHUB_OUTPUT without newline sanitization, which could allow injection of additional output variables.

Locations:

- `.github/workflows/test-push.yml:38`

## Iteration Notes

### Iteration 1

**Fixes applied:** unpinned-uses, missing-permissions, script-injection, github-env-injection

**Notes:**

Fixed all four findings across 10 workflow files:

1. unpinned-uses: Pinned all action references to full commit SHAs in build.yml, codeql.yml, dependabot.yml, eslint.yml, graphql-schema.yml, release.yml, ship.yml, test-pr.yml, test-push.yml, and test.yml. All 10 unique actions were resolved via lookup_action_sha.

2. missing-permissions: Added permissions blocks to eslint.yml (contents: read, pull-requests: write on the eslint job), release.yml (contents: read + pull-requests: write on the eslint reusable call; contents: write + pull-requests: write on the release job), and ship.yml (permissions: {} on the concurrency-group job).

3. script-injection: Fixed test-push.yml line 38 by moving ${{ job.check_run_id }} out of the run: shell string into an env: block as CHECK_RUN_ID.

4. github-env-injection: Fixed the same line in test-push.yml by sanitizing with `printf '%s' "$CHECK_RUN_ID" | tr -d '\n\r'` before writing to GITHUB_OUTPUT.

Several files (codeql.yml, graphql-schema.yml, test.yml, test-push.yml) required complete rewrites due to edit corruption from overlapping replacements during the fix process.

### Iteration 2

**Fixes applied:** script-injection

**Notes:**

Fixed all unquoted shell variable expansions in .github/workflows/test.yml:
1. 'Report Checks' step (test_pull_request job): quoted $CHECKS_TEMP_FILE in `cat` and `rm -f` commands.
2. 'Close PR' step (test_pull_request job): quoted $TEST_PR_NUMBER in `gh pr close` command.
3. 'Report Checks' step (test_push job): quoted $CHECKS_TEMP_FILE in `cat` and `rm -f` commands.
4. Also fixed additional unquoted $CHECKS_TEMP_FILE uses in the 'Check PR' and 'Check push workflow' steps (tee -a, -s test, cat) for comprehensive hardening.

