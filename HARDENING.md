<!-- markdownlint-disable -->

# Hardening Report: CatChen--eslint-suggestion-action/v4.1.28

> This file was generated automatically by the hardening agent.

**Policy SHA:** `d636be7e43ef829af6e853da6b3c7566db9f72fe`

**Test Policy SHA:** `843adf9e4b8f85d0c08b27b9d0b09dd094b54702`

**Harden Agent Version:** `2`

Action **CatChen--eslint-suggestion-action/v4.1.28** was hardened automatically. 6 finding(s) were identified and resolved across 3 iteration(s).

## Findings Fixed

### unpinned-uses (severity: high)

All workflow files use mutable version tags instead of pinned full SHA hashes for their `uses:` references. Failing references include: `actions/create-github-app-token@v3`, `actions/checkout@v6`, `actions/setup-node@v6`, `CatChen/check-git-status-action@v2`, `dependabot/fetch-metadata@v2`, `github/codeql-action/init@v4`, `github/codeql-action/analyze@v4`, `CatChen/config-git-with-token-action@v2`, `CatChen/node-package-release-action@v2`, `CatChen/accept-to-ship-action@v0.8`. These should be pinned to full 40-character commit SHAs.

Locations:

- `.github/workflows/build.yml:21`
- `.github/workflows/codeql.yml:57`
- `.github/workflows/dependabot.yml:16`
- `.github/workflows/eslint.yml:21`
- `.github/workflows/graphql-schema.yml:17`
- `.github/workflows/release.yml:60`
- `.github/workflows/ship.yml:55`
- `.github/workflows/test-pr.yml:21`
- `.github/workflows/test-push.yml:23`
- `.github/workflows/test.yml:44`

### missing-permissions (severity: medium)

`eslint.yml` has no top-level `permissions:` key and its only job (`eslint`) has no job-level `permissions:` key, leaving it with default (potentially broad) token permissions.

Locations:

- `.github/workflows/eslint.yml:16`

### missing-permissions (severity: medium)

`release.yml` has no top-level `permissions:` key, and two of its jobs lack job-level `permissions:`: the `eslint` reusable-workflow call job (no permissions block) and the `release` job (which checks out code and calls external actions without scoped permissions).

Locations:

- `.github/workflows/release.yml:53`

### missing-permissions (severity: medium)

`ship.yml` has no top-level `permissions:` key and the `concurrency-group` job has no job-level `permissions:` key, leaving it with default token permissions.

Locations:

- `.github/workflows/ship.yml:28`

### script-injection (severity: high)

Rule (a) violation: A `${{ }}` expression is interpolated directly inside a `run:` shell command. The step `Set check run id` uses `run: echo "check-run-id=${{ job.check_run_id }}" >> $GITHUB_OUTPUT`. The `job.*` context is substituted into the shell command string before the shell executes it, enabling script injection if the value contains shell metacharacters.

Locations:

- `.github/workflows/test-push.yml:46`

### github-env-injection (severity: high)

The step `Set check run id` in `test-push.yml` writes `${{ job.check_run_id }}` (a workflow-context value) directly to `$GITHUB_OUTPUT` without the required sanitization step (`printf '%s' ... | tr -d '\n\r'`). The offending line is: `run: echo "check-run-id=${{ job.check_run_id }}" >> $GITHUB_OUTPUT`. A newline-containing value could inject additional output variables.

Locations:

- `.github/workflows/test-push.yml:46`

## Iteration Notes

### Iteration 1

**Fixes applied:** unpinned-uses, missing-permissions, script-injection, github-env-injection

**Notes:**

Fixed all findings across 10 workflow files:

1. **unpinned-uses**: Pinned all mutable action tags to full SHA hashes in build.yml, codeql.yml, dependabot.yml, eslint.yml, graphql-schema.yml, release.yml, ship.yml, test-pr.yml, test-push.yml, and test.yml. Actions pinned: actions/create-github-app-token@v3→bcd2ba49, actions/checkout@v6→d23441a4, actions/setup-node@v6→24997072, CatChen/check-git-status-action@v2→cc5a7973, dependabot/fetch-metadata@v2→21025c70, github/codeql-action/init@v4→e4fba868, github/codeql-action/analyze@v4→e4fba868, CatChen/config-git-with-token-action@v2→0b2fc9b6, CatChen/node-package-release-action@v2→947db5a6, CatChen/accept-to-ship-action@v0.8→f408fe03.

2. **missing-permissions** (eslint.yml): Added `permissions: contents: read` to the eslint job.

3. **missing-permissions** (release.yml): Added `permissions: contents: read` to the eslint reusable-workflow call job; added `permissions: contents: write, pull-requests: write` to the release job.

4. **missing-permissions** (ship.yml): Added `permissions: {}` to the concurrency-group job.

5. **script-injection** + **github-env-injection** (test-push.yml): Moved `${{ job.check_run_id }}` into the step's `env:` block as `CHECK_RUN_ID`, then sanitized with `printf '%s' "$CHECK_RUN_ID" | tr -d '\n\r'` before writing to `$GITHUB_OUTPUT`.

### Iteration 2

**Fixes applied:** script-injection

**Notes:**

Fixed two script-injection findings in .github/workflows/test.yml:
1. 'Make commit' step (line 88): Added double-quotes around $BASE_PR_NUMBER in the [[ -z ]] test: `[[ -z $BASE_PR_NUMBER ]]` → `[[ -z "$BASE_PR_NUMBER" ]]`.
2. 'Open PR' step (line 107): Same fix for $BASE_PR_NUMBER: `[[ -z $BASE_PR_NUMBER ]]` → `[[ -z "$BASE_PR_NUMBER" ]]`.
3. 'Open PR' step (line 110): Added double-quotes around $RUN_ID used as a CLI argument: `gh run view $RUN_ID` → `gh run view "$RUN_ID"`.

### Iteration 3

**Fixes applied:** script-injection

**Notes:**

Fixed all unquoted shell variable expansions in .github/workflows/test.yml: (1) Quoted $TEST_PR_NUMBER in the 'Close PR' step: `gh pr close "$TEST_PR_NUMBER"`. (2) Quoted all $CHECKS_TEMP_FILE usages in the check-pr step (tee -a, if [[ -s ]], cat). (3) Quoted $CHECKS_TEMP_FILE in the 'Report Checks' step of test_pull_request (cat, rm -f). (4) Quoted all $CHECKS_TEMP_FILE usages in the check-push step (tee -a, if [[ -s ]], cat). (5) Quoted $CHECKS_TEMP_FILE in the 'Report Checks' step of test_push (cat, rm -f).

