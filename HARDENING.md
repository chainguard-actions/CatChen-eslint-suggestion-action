<!-- markdownlint-disable -->

# Hardening Report: CatChen--eslint-suggestion-action/v4.1.27

> This file was generated automatically by the hardening agent.

**Policy SHA:** `d636be7e43ef829af6e853da6b3c7566db9f72fe`

**Test Policy SHA:** `843adf9e4b8f85d0c08b27b9d0b09dd094b54702`

**Harden Agent Version:** `2`

Action **CatChen--eslint-suggestion-action/v4.1.27** was hardened automatically. 4 finding(s) were identified and resolved across 1 iteration(s).

## Findings Fixed

### unpinned-uses (severity: high)

Multiple workflow files reference external actions using mutable version tags (e.g., @v2, @v3, @v4, @v6, @v0.8) instead of pinned full 40-character SHA commits. This exposes the workflows to supply-chain attacks if a tag is moved or a repository is compromised. Affected references include: actions/create-github-app-token@v3, actions/checkout@v6, actions/setup-node@v6, CatChen/check-git-status-action@v2, dependabot/fetch-metadata@v2, github/codeql-action/init@v4, github/codeql-action/analyze@v4, CatChen/config-git-with-token-action@v2, CatChen/node-package-release-action@v2, CatChen/accept-to-ship-action@v0.8.

Locations:

- `.github/workflows/build.yml:22`
- `.github/workflows/build.yml:29`
- `.github/workflows/build.yml:37`
- `.github/workflows/build.yml:53`
- `.github/workflows/codeql.yml:60`
- `.github/workflows/codeql.yml:63`
- `.github/workflows/codeql.yml:83`
- `.github/workflows/dependabot.yml:17`
- `.github/workflows/eslint.yml:22`
- `.github/workflows/eslint.yml:26`
- `.github/workflows/graphql-schema.yml:16`
- `.github/workflows/graphql-schema.yml:23`
- `.github/workflows/graphql-schema.yml:29`
- `.github/workflows/graphql-schema.yml:41`
- `.github/workflows/graphql-schema.yml:62`
- `.github/workflows/release.yml:56`
- `.github/workflows/release.yml:65`
- `.github/workflows/release.yml:71`
- `.github/workflows/release.yml:78`
- `.github/workflows/release.yml:96`
- `.github/workflows/release.yml:104`
- `.github/workflows/ship.yml:53`
- `.github/workflows/ship.yml:55`
- `.github/workflows/ship.yml:60`
- `.github/workflows/ship.yml:83`
- `.github/workflows/ship.yml:85`
- `.github/workflows/ship.yml:90`
- `.github/workflows/test-pr.yml:22`
- `.github/workflows/test-pr.yml:26`
- `.github/workflows/test-push.yml:22`
- `.github/workflows/test-push.yml:26`
- `.github/workflows/test.yml:42`
- `.github/workflows/test.yml:44`
- `.github/workflows/test.yml:48`

### missing-permissions (severity: medium)

Several workflow files have jobs without a permissions: key and no top-level permissions block, meaning those jobs inherit the default (potentially broad) GITHUB_TOKEN permissions. (1) eslint.yml has no top-level permissions and its only job 'eslint' has no job-level permissions. (2) ship.yml has no top-level permissions and the 'concurrency-group' job has no permissions key. (3) release.yml has no top-level permissions and the 'release' job has no permissions key; the 'eslint' reusable-workflow call also has no permissions.

Locations:

- `.github/workflows/eslint.yml:16`
- `.github/workflows/ship.yml:29`
- `.github/workflows/release.yml:49`
- `.github/workflows/release.yml:52`

### script-injection (severity: high)

Sub-rule (a) violation: A ${{ }} expression is interpolated directly inside a run: shell command string. In test-push.yml, the step 'Set check run id' uses `run: echo "check-run-id=${{ job.check_run_id }}" >> $GITHUB_OUTPUT`. The expression ${{ job.check_run_id }} is substituted by the Actions template engine before the shell ever sees the string, meaning any special characters in the value are not shell-quoted and could be exploited.

Locations:

- `.github/workflows/test-push.yml:37`

### github-env-injection (severity: high)

A value derived from a workflow-context expression (${{ job.check_run_id }}) is written directly to $GITHUB_OUTPUT without the required sanitization step (printf '%s' ... | tr -d '\n\r'). The offending line is: `run: echo "check-run-id=${{ job.check_run_id }}" >> $GITHUB_OUTPUT`. Because the ${{ }} expression is expanded by the Actions template engine before the shell runs, a newline embedded in the value could inject additional key=value pairs into the output file.

Locations:

- `.github/workflows/test-push.yml:37`

## Iteration Notes

### Iteration 1

**Fixes applied:** unpinned-uses, missing-permissions, script-injection, github-env-injection

**Notes:**

Fixed all findings across 8 workflow files:

1. unpinned-uses: Pinned all 10 distinct action references to full 40-char SHAs with tag comments in build.yml, codeql.yml, dependabot.yml, eslint.yml, graphql-schema.yml, release.yml, ship.yml, test-pr.yml, test-push.yml, and test.yml.

2. missing-permissions: Added permissions blocks to eslint.yml (contents: read on eslint job), ship.yml (permissions: {} on concurrency-group job), and release.yml (contents: write + pull-requests: write on release job; contents: read on eslint reusable workflow call).

3. script-injection: In test-push.yml 'Set check run id' step, moved ${{ job.check_run_id }} out of the run: shell string into an env: block as CHECK_RUN_ID, then referenced it as $CHECK_RUN_ID.

4. github-env-injection: In the same step, added sanitization using printf '%s' "$CHECK_RUN_ID" | tr -d '\n\r' before writing to $GITHUB_OUTPUT.

