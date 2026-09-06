<!-- markdownlint-disable -->

# Hardening Report: CatChen--eslint-suggestion-action/v4.1.36

> This file was generated automatically by the hardening agent.

**Policy SHA:** `d636be7e43ef829af6e853da6b3c7566db9f72fe`

**Test Policy SHA:** `843adf9e4b8f85d0c08b27b9d0b09dd094b54702`

**Harden Agent Version:** `2`

Action **CatChen--eslint-suggestion-action/v4.1.36** was hardened automatically. 4 finding(s) were identified and resolved across 2 iteration(s).

## Findings Fixed

### unpinned-uses (severity: high)

All workflow files use mutable version tags (e.g. @v7, @v3, @v2, @v4.37.9, @v0.8) instead of full 40-character SHA commit hashes for their `uses:` references. This exposes the workflows to supply-chain attacks if any referenced action is compromised or its tag is moved. Affected actions include: actions/checkout@v7, actions/setup-node@v7, actions/create-github-app-token@v3, CatChen/check-git-status-action@v2, CatChen/config-git-with-token-action@v2, CatChen/accept-to-ship-action@v0.8, CatChen/node-package-release-action@v2, dependabot/fetch-metadata@v3, github/codeql-action/init@v4.37.9, github/codeql-action/analyze@v4.37.9.

Locations:

- `.github/workflows/build.yml:22`
- `.github/workflows/build.yml:28`
- `.github/workflows/build.yml:37`
- `.github/workflows/build.yml:55`
- `.github/workflows/codeql.yml:57`
- `.github/workflows/codeql.yml:62`
- `.github/workflows/codeql.yml:70`
- `.github/workflows/dependabot.yml:16`
- `.github/workflows/eslint.yml:22`
- `.github/workflows/eslint.yml:27`
- `.github/workflows/graphql-schema.yml:16`
- `.github/workflows/graphql-schema.yml:23`
- `.github/workflows/graphql-schema.yml:29`
- `.github/workflows/graphql-schema.yml:40`
- `.github/workflows/graphql-schema.yml:55`
- `.github/workflows/release.yml:57`
- `.github/workflows/release.yml:65`
- `.github/workflows/release.yml:70`
- `.github/workflows/release.yml:76`
- `.github/workflows/release.yml:90`
- `.github/workflows/release.yml:96`
- `.github/workflows/release.yml:102`
- `.github/workflows/ship.yml:52`
- `.github/workflows/ship.yml:55`
- `.github/workflows/ship.yml:60`
- `.github/workflows/ship.yml:80`
- `.github/workflows/ship.yml:83`
- `.github/workflows/ship.yml:88`
- `.github/workflows/test-pr.yml:18`
- `.github/workflows/test-pr.yml:23`
- `.github/workflows/test-pr.yml:65`
- `.github/workflows/test-pr.yml:70`
- `.github/workflows/test-push.yml:23`
- `.github/workflows/test-push.yml:28`
- `.github/workflows/test.yml:46`
- `.github/workflows/test.yml:52`
- `.github/workflows/test.yml:57`

### script-injection (severity: high)

Sub-rule (a): A `${{ }}` expression is directly interpolated inside a `run:` shell command. In `.github/workflows/test-push.yml`, the step 'Set check run id' contains: `run: echo "check-run-id=${{ job.check_run_id }}" >> $GITHUB_OUTPUT`. The `${{ job.check_run_id }}` expression is expanded by the GitHub Actions template engine before the shell ever sees the string, meaning any special shell characters in the value would be interpreted by the shell. All `${{ ... }}` expressions in `run:` blocks are a script-injection risk regardless of the context they read from.

Locations:

- `.github/workflows/test-push.yml:46`

### github-env-injection (severity: high)

In `.github/workflows/test-push.yml`, the step 'Set check run id' writes a value derived from the `job.*` context directly to `$GITHUB_OUTPUT` without the required sanitization step (`printf '%s' ... | tr -d '\n\r'`): `run: echo "check-run-id=${{ job.check_run_id }}" >> $GITHUB_OUTPUT`. A newline character in the value could inject additional key=value pairs into the output file, potentially overwriting other step outputs.

Locations:

- `.github/workflows/test-push.yml:46`

### missing-permissions (severity: medium)

Three workflow files have no top-level `permissions:` key and contain at least one job that also lacks a `permissions:` key, meaning those jobs inherit the default (potentially broad) token permissions: (1) `eslint.yml`: the single `eslint` job has no `permissions:` block. (2) `release.yml`: the `eslint` and `release` jobs have no `permissions:` block. (3) `ship.yml`: the `concurrency-group` job has no `permissions:` block.

Locations:

- `.github/workflows/eslint.yml:1`
- `.github/workflows/release.yml:1`
- `.github/workflows/ship.yml:1`

## Iteration Notes

### Iteration 1

**Fixes applied:** unpinned-uses, script-injection, github-env-injection, missing-permissions

**Notes:**

Fixed all findings across 8 workflow files:

1. unpinned-uses: Pinned all 10 distinct action references to full 40-char SHAs with tag comments in build.yml, codeql.yml, dependabot.yml, eslint.yml, graphql-schema.yml, release.yml, ship.yml, test-pr.yml, test-push.yml, and test.yml.

2. script-injection + github-env-injection (both in test-push.yml line 46): Moved `${{ job.check_run_id }}` to an env block as CHECK_RUN_ID, then sanitized with `printf '%s' "$CHECK_RUN_ID" | tr -d '\n\r'` before writing to $GITHUB_OUTPUT.

3. missing-permissions:
   - eslint.yml: Added `permissions: { contents: read, pull-requests: write }` to the eslint job.
   - release.yml: Added permissions to the eslint workflow_call job (`contents: read, pull-requests: write`) and to the release job (`contents: write, pull-requests: write`).
   - ship.yml: Added `permissions: {}` to the concurrency-group job (it only logs a notice, needs no token permissions).

### Iteration 2

**Fixes applied:** script-injection

**Notes:**

Fixed all four script-injection findings in hardened/action/.github/workflows/test.yml:
1. Line 110 (Open PR step): Quoted $RUN_ID in `gh run view "$RUN_ID" --json 'url'`
2. Line 167 (Report Checks, test_pull_request job): Quoted $CHECKS_TEMP_FILE in `cat "$CHECKS_TEMP_FILE"` and `rm -f "$CHECKS_TEMP_FILE"`
3. Line 186 (Close PR step): Quoted $TEST_PR_NUMBER in `gh pr close "$TEST_PR_NUMBER"`
4. Line 336 (Report Checks, test_push job): Quoted $CHECKS_TEMP_FILE in `cat "$CHECKS_TEMP_FILE"` and `rm -f "$CHECKS_TEMP_FILE"`
Also fixed all other unquoted $CHECKS_TEMP_FILE uses (tee -a, -s test) throughout the file for consistency and completeness.

