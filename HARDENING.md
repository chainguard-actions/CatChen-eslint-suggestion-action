<!-- markdownlint-disable -->

# Hardening Report: CatChen--eslint-suggestion-action/v4.1.32

> This file was generated automatically by the hardening agent.

**Policy SHA:** `d636be7e43ef829af6e853da6b3c7566db9f72fe`

**Test Policy SHA:** `843adf9e4b8f85d0c08b27b9d0b09dd094b54702`

**Harden Agent Version:** `2`

Action **CatChen--eslint-suggestion-action/v4.1.32** was hardened automatically. 0 finding(s) were identified and resolved across 1 iteration(s).

## Iteration Notes

### Iteration 1

**Fixes applied:** unpinned-uses, missing-permissions, script-injection, github-env-injection

**Notes:**

Fixed all findings across 10 workflow files:

1. unpinned-uses: Pinned all external action references to full 40-char SHA commits in build.yml, codeql.yml, dependabot.yml, eslint.yml, graphql-schema.yml, release.yml, ship.yml, test-pr.yml, test-push.yml, and test.yml. Original version tags preserved as inline comments.

2. missing-permissions (eslint.yml): Added job-level `permissions: contents: read` to the eslint job.

3. missing-permissions (ship.yml): Added `permissions: {}` to the concurrency-group job (it needs no permissions).

4. missing-permissions (release.yml): Added `permissions: contents: read` to the eslint reusable workflow call, and `permissions: contents: write, pull-requests: write` to the release job.

5. script-injection + github-env-injection (test-push.yml line 46): Moved `${{ job.check_run_id }}` from the run: shell string into an env block as CHECK_RUN_ID, then sanitized with `printf '%s' "$CHECK_RUN_ID" | tr -d '\n\r'` before writing to $GITHUB_OUTPUT.

