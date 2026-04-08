- Task 1: Repo config reads `.github/zai-review.yaml` and `.github/zai-review-instructions.md` strictly from the PR base branch via `octokit.repos.getContent({ ref })`.
- Validation strips forbidden credential-style keys (`api_key`, `github_token`, `base_url` variants), warns on unknown keys, and keeps only correctly typed allowed values.
- Safe fallback behavior is consistent: 404 returns empty config/instructions, oversize files are skipped, and parse/runtime read failures degrade to warnings plus empty results.

- Audit (2026-04-08): Must-NOT-Have guardrails are clean in source scans: no auto-merge symbols, no per-directory config helpers, no hardcoded French branch in prompts, and schema still blocks credential-style config keys via FORBIDDEN_KEYS.
- Audit (2026-04-08): Incremental review is wired in src/index.ts and falls back to a full PR diff when compareCommits returns null (including 404/422 force-push-style failures in src/review/incremental.ts).
- Audit (2026-04-08): chat authorization is wired via isAuthorized() in src/chat/handler.ts, but feature-flag independence is incomplete because chat_enabled is only declared in action.yml and is never consumed by the runtime.
