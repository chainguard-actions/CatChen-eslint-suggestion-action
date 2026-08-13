<!-- markdownlint-disable -->

# Hardening Report: CatChen--eslint-suggestion-action/v4.1.31

> This file was generated automatically by the hardening agent.

**Policy SHA:** `d636be7e43ef829af6e853da6b3c7566db9f72fe`

**Test Policy SHA:** `843adf9e4b8f85d0c08b27b9d0b09dd094b54702`

**Harden Agent Version:** `2`

Action **CatChen--eslint-suggestion-action/v4.1.31** was hardened automatically. 4 finding(s) were identified and resolved across 2 iteration(s).

## Findings Fixed

### unpinned-uses (severity: high)

Every `uses:` reference across all workflow files is pinned to a mutable version tag rather than a full 40-character SHA commit digest, making the workflows vulnerable to supply-chain attacks if the referenced action tags are moved or compromised. Affected references include: actions/checkout@v6, actions/setup-node@v6, actions/create-github-app-token@v3, github/codeql-action/init@v4, github/codeql-action/analyze@v4, dependabot/fetch-metadata@v3, CatChen/check-git-status-action@v2, CatChen/config-git-with-token-action@v2, CatChen/node-package-release-action@v2, CatChen/accept-to-ship-action@v0.8.

Locations:

- `.github/workflows/build.yml:22`
- `.github/workflows/codeql.yml:63`
- `.github/workflows/dependabot.yml:17`
- `.github/workflows/eslint.yml:22`
- `.github/workflows/graphql-schema.yml:18`
- `.github/workflows/release.yml:62`
- `.github/workflows/ship.yml:57`
- `.github/workflows/test-pr.yml:20`
- `.github/workflows/test-push.yml:23`
- `.github/workflows/test.yml:46`

### script-injection (severity: high)

Rule (a) violation: A `${{ }}` expression is interpolated directly inside a `run:` shell command string. In `.github/workflows/test-push.yml`, the step 'Set check run id' contains: `echo "check-run-id=${{ job.check_run_id }}" >> $GITHUB_OUTPUT`. The `${{ job.check_run_id }}` expression is substituted by the Actions template engine before the shell ever sees the string, allowing any value injected into that context to break out of the quoted string and execute arbitrary shell commands.

Locations:

- `.github/workflows/test-push.yml:46`

### github-env-injection (severity: high)

A value derived from a GitHub Actions expression (`${{ job.check_run_id }}`) is written directly to `$GITHUB_OUTPUT` without the required sanitization step (`printf '%s' ... | tr -d '\n\r'`). In `.github/workflows/test-push.yml`, the step 'Set check run id' runs: `echo "check-run-id=${{ job.check_run_id }}" >> $GITHUB_OUTPUT`. If the value contains newline characters, an attacker could inject additional key=value pairs into GITHUB_OUTPUT, potentially overwriting outputs consumed by downstream steps.

Locations:

- `.github/workflows/test-push.yml:46`

### missing-permissions (severity: medium)

Three workflow files have no top-level `permissions:` block and contain at least one job that also lacks a job-level `permissions:` block, meaning those jobs run with the default (potentially broad) token permissions.

- `eslint.yml`: No top-level permissions; the sole `eslint` job has no `permissions:` key.
- `release.yml`: No top-level permissions; the `release` job (which checks out code and calls external actions) has no `permissions:` key.
- `ship.yml`: No top-level permissions; the `concurrency-group` job has no `permissions:` key.

Locations:

- `.github/workflows/eslint.yml:1`
- `.github/workflows/release.yml:1`
- `.github/workflows/ship.yml:1`

## Iteration Notes

### Iteration 1

**Fixes applied:** unpinned-uses, script-injection, github-env-injection, missing-permissions

**Notes:**

Fixed all four findings across 10 workflow files:

1. unpinned-uses: Pinned all action references to full 40-char SHAs with tag comments in build.yml, codeql.yml, dependabot.yml, eslint.yml, graphql-schema.yml, release.yml, ship.yml, test-pr.yml, test-push.yml, and test.yml.

2. script-injection: In test-push.yml 'Set check run id' step, moved ${{ job.check_run_id }} from the run: shell string into the step's env: block as CHECK_RUN_ID.

3. github-env-injection: In test-push.yml 'Set check run id' step, added sanitization using `printf '%s' "$CHECK_RUN_ID" | tr -d '\n\r'` before writing to $GITHUB_OUTPUT.

4. missing-permissions: Added permissions blocks to eslint.yml (contents: read, pull-requests: write on eslint job), release.yml (contents: write, pull-requests: write on release job), and ship.yml (permissions: {} on concurrency-group job).

### Iteration 2

**Fixes applied:** missing-permissions

**Notes:**

Added an explicit `permissions:` block to the `eslint` job in `.github/workflows/release.yml`. The job calls `./.github/workflows/eslint.yml` as a reusable workflow, and the called workflow's job requires `contents: read` and `pull-requests: write`. These same permissions were added to the calling job to satisfy the least-privilege requirement and prevent the job from running with default (potentially broad) inherited permissions.

