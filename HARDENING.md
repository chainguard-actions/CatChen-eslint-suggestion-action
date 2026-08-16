<!-- markdownlint-disable -->

# Hardening Report: CatChen--eslint-suggestion-action/v4.1.34

> This file was generated automatically by the hardening agent.

**Policy SHA:** `d636be7e43ef829af6e853da6b3c7566db9f72fe`

**Test Policy SHA:** `843adf9e4b8f85d0c08b27b9d0b09dd094b54702`

**Harden Agent Version:** `2`

Action **CatChen--eslint-suggestion-action/v4.1.34** was hardened automatically. 4 finding(s) were identified and resolved across 2 iteration(s).

## Findings Fixed

### unpinned-uses (severity: high)

All workflow files use mutable tag-based or version-based `uses:` references instead of immutable 40-character SHA commit pins. This exposes the workflows to supply-chain attacks if any referenced action is compromised or its tag is moved. Failing references include: build.yml (actions/create-github-app-token@v3, actions/checkout@v7, actions/setup-node@v7, CatChen/check-git-status-action@v2), codeql.yml (actions/checkout@v7, github/codeql-action/init@v4.37.6, github/codeql-action/analyze@v4.37.6), dependabot.yml (dependabot/fetch-metadata@v3), eslint.yml (actions/checkout@v7, actions/setup-node@v7), graphql-schema.yml (actions/create-github-app-token@v3, actions/checkout@v7, actions/setup-node@v7, CatChen/check-git-status-action@v2, CatChen/config-git-with-token-action@v2), release.yml (actions/create-github-app-token@v3, actions/checkout@v7, actions/setup-node@v7, CatChen/node-package-release-action@v2), ship.yml (actions/checkout@v7, actions/create-github-app-token@v3, CatChen/accept-to-ship-action@v0.8), test-pr.yml (actions/checkout@v7, actions/setup-node@v7), test-push.yml (actions/checkout@v7, actions/setup-node@v7), test.yml (actions/checkout@v7, CatChen/config-git-with-token-action@v2).

Locations:

- `.github/workflows/build.yml:22`
- `.github/workflows/codeql.yml:57`
- `.github/workflows/dependabot.yml:16`
- `.github/workflows/eslint.yml:20`
- `.github/workflows/graphql-schema.yml:16`
- `.github/workflows/release.yml:56`
- `.github/workflows/ship.yml:55`
- `.github/workflows/test-pr.yml:18`
- `.github/workflows/test-push.yml:22`
- `.github/workflows/test.yml:44`

### script-injection (severity: high)

Rule (a) violation: A `${{ }}` expression is directly interpolated inside a `run:` shell command string. In test-push.yml, the step 'Set check run id' contains: `run: echo "check-run-id=${{ job.check_run_id }}" >> $GITHUB_OUTPUT`. The `${{ job.check_run_id }}` expression is substituted by the Actions template engine before the shell ever sees the string, meaning any special characters in the value are not shell-quoted and could be exploited. All `${{ }}` expressions must be moved to an `env:` block and the env var must be double-quoted in the shell script.

Locations:

- `.github/workflows/test-push.yml:46`

### github-env-injection (severity: high)

A value derived from the `job.*` context (`${{ job.check_run_id }}`) is written directly to `$GITHUB_OUTPUT` without the required sanitization step (`printf '%s' ... | tr -d '\n\r'`). The offending line in test-push.yml is: `run: echo "check-run-id=${{ job.check_run_id }}" >> $GITHUB_OUTPUT`. Because the expression is interpolated before the shell runs, a newline or carriage return in the value could inject additional key=value pairs into GITHUB_OUTPUT, potentially overwriting outputs consumed by downstream jobs.

Locations:

- `.github/workflows/test-push.yml:46`

### missing-permissions (severity: medium)

Several workflow files have no top-level `permissions:` block and contain at least one job that also lacks a job-level `permissions:` block, meaning those jobs inherit the default (potentially broad) repository permissions.

- `eslint.yml`: No top-level permissions; the single `eslint` job has no `permissions:` key.
- `ship.yml`: No top-level permissions; the `concurrency-group` job has no `permissions:` key (the other two jobs do have permissions).
- `release.yml`: No top-level permissions; the `eslint` job (reusable workflow call) and the `release` job both lack a `permissions:` key.

Locations:

- `.github/workflows/eslint.yml:16`
- `.github/workflows/ship.yml:29`
- `.github/workflows/release.yml:53`

## Iteration Notes

### Iteration 1

**Fixes applied:** unpinned-uses, script-injection, github-env-injection, missing-permissions

**Notes:**

Fixed all findings across 10 workflow files:

1. unpinned-uses: Pinned all action references to full 40-char SHAs in build.yml, codeql.yml, dependabot.yml, eslint.yml, graphql-schema.yml, release.yml, ship.yml, test-pr.yml, test-push.yml, and test.yml. Actions pinned: actions/create-github-app-token@v3, actions/checkout@v7, actions/setup-node@v7, CatChen/check-git-status-action@v2, github/codeql-action/init@v4.37.6, github/codeql-action/analyze@v4.37.6, dependabot/fetch-metadata@v3, CatChen/config-git-with-token-action@v2, CatChen/node-package-release-action@v2, CatChen/accept-to-ship-action@v0.8.

2. script-injection + github-env-injection: Fixed in test-push.yml 'Set check run id' step by moving ${{ job.check_run_id }} to an env: block as CHECK_RUN_ID, then sanitizing with `printf '%s' "$CHECK_RUN_ID" | tr -d '\n\r'` before writing to GITHUB_OUTPUT.

3. missing-permissions: Added permissions to eslint job in eslint.yml (contents: read, pull-requests: write), concurrency-group job in ship.yml (permissions: {}), eslint reusable workflow call in release.yml (contents: read, pull-requests: write), and release job in release.yml (contents: write, pull-requests: write).

### Iteration 2

**Fixes applied:** script-injection

**Notes:**

Fixed four unquoted shell variable expansions in .github/workflows/test.yml:
1. Quoted $RUN_ID in 'gh run view $RUN_ID' → 'gh run view "$RUN_ID"' in the Open PR step
2. Quoted $CHECKS_TEMP_FILE in 'cat $CHECKS_TEMP_FILE' → 'cat "$CHECKS_TEMP_FILE"' in the Report Checks step of test_pull_request job
3. Quoted $TEST_PR_NUMBER in 'gh pr close $TEST_PR_NUMBER' → 'gh pr close "$TEST_PR_NUMBER"' in the Close PR step
4. Quoted $CHECKS_TEMP_FILE in 'cat $CHECKS_TEMP_FILE' → 'cat "$CHECKS_TEMP_FILE"' in the Report Checks step of test_push job
Also fixed the corresponding 'rm -f $CHECKS_TEMP_FILE' → 'rm -f "$CHECKS_TEMP_FILE"' in both Report Checks steps.

