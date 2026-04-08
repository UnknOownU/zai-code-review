# Z.ai Code Review v2 — 5 Major Features

## TL;DR

> **Quick Summary**: Add 5 competitive features to catch up with CodeRabbit: multi-language support, PR chat commands, autofix suggestions, incremental reviews, and repo-level config files.
> 
> **Deliverables**:
> - Dynamic multi-language AI responses (any language)
> - `/zai-review` chat commands in PR comments (explain, review, fix)
> - Autofix via enhanced suggestions + opt-in direct commit
> - Incremental review (only new commits since last review)
> - `.github/zai-review.yaml` repo-level configuration + `.github/zai-review-instructions.md` custom AI instructions
> 
> **Estimated Effort**: Large
> **Parallel Execution**: YES - 4 waves
> **Critical Path**: F5 (config) → F1 (lang) → F4 (incremental) → F3 (autofix) → F2 (chat) → Final

---

## Context

### Original Request
Add 5 features to compete with CodeRabbit: multi-langue, chat, autofix, incremental review, repo config.

### Research Findings
- CodeRabbit's open-source version has exact patterns for chat (`review-comment.ts`), incremental review (commit SHA tracking in HTML comments), and config
- better-auth/better-hub has the autofix pattern (`createOrUpdateFileContents`)
- Metis identified that `createOrUpdateFileContents` is wrong for autofix (1 commit per file, doesn't work for forks) — use suggestion syntax instead
- Current codebase already generates `suggestion` blocks — autofix is 80% done
- Permission matrix: `contents:write` (autofix commit mode), `pull-requests:write` (reviews), `issues:write` (chat replies)

### Metis Review
**Identified Gaps (addressed)**:
- Autofix strategy corrected: suggestion syntax default, direct commit opt-in
- Chat authorization gate required to prevent abuse
- Force push handling for incremental review
- Config file must be read from base branch (not head) to prevent weaponization
- Fallback parser in `parser.ts` uses English patterns ("Line 42:") — needs fix for multi-lang
- `action.yml` missing `outputs:` section — fix in same release
- `maxFiles`/`maxComments` clamping bug — warns but returns unclamped value

---

## Work Objectives

### Core Objective
Add 5 major features to transform zai-code-review from a basic reviewer into a competitive, feature-rich code review platform.

### Concrete Deliverables
- `src/config/reader.ts` + `src/config/schema.ts` — repo config reader
- Modified `src/ai/prompts.ts` — dynamic language support
- `src/review/incremental.ts` — SHA tracking + incremental diff
- `src/autofix/suggestions.ts` + `src/autofix/commit.ts` — autofix
- `src/chat/parser.ts` + `src/chat/commands.ts` + `src/chat/handler.ts` — chat
- Updated `action.yml` — new inputs, outputs, events
- Updated READMEs EN + FR

### Definition of Done
- [ ] `pnpm run check` passes (tsc + vitest + build)
- [ ] All 5 features have unit tests
- [ ] `dist/index.js` rebuilt and committed
- [ ] READMEs updated with new features

### Must Have
- All 5 features work independently (no feature depends on another being enabled)
- Backward-compatible with v1 workflows (existing users don't break)
- Autofix defaults to suggestion mode (no extra permissions needed)
- Chat requires authorization gate (OWNER/MEMBER/COLLABORATOR only)
- Incremental review handles force push gracefully (fallback to full)

### Must NOT Have (Guardrails)
- NO auto-merge functionality (scope creep)
- NO per-directory config files (scope creep)
- NO i18n translation tables — AI generates in requested language natively
- NO config override of `ZAI_API_KEY` or `GITHUB_TOKEN` (security)
- NO autofix commits to protected branches or default branches
- NO processing chat commands on closed/merged PRs
- NO processing chat commands from bot accounts
- NO `issue_comment` `edited` event subscription (prevents re-triggers)

---

## Verification Strategy

> **ZERO HUMAN INTERVENTION** — ALL verification is agent-executed.

### Test Decision
- **Infrastructure exists**: YES (vitest)
- **Automated tests**: YES (tests-after — each feature includes its test file)
- **Framework**: vitest

### QA Policy
Every task MUST include agent-executed QA scenarios.
- Mock Octokit calls using `vi.fn()` — NO real API calls
- Mock `@actions/core` in every test file
- Test error paths explicitly — every try/catch needs a test
- `pnpm run check` must pass after every feature

---

## Execution Strategy

### Parallel Execution Waves

```
Wave 1 (Foundation — start immediately):
├── Task 1: Repo config reader + schema validator [deep]
├── Task 2: Multi-language dynamic prompts [quick]
└── Task 3: Fix pre-existing bugs (maxFiles clamping, action.yml outputs) [quick]

Wave 2 (Core features — after Wave 1):
├── Task 4: Integrate config reader into parseConfig [quick]
├── Task 5: Incremental review SHA tracking module [deep]
├── Task 6: Autofix suggestion enhancer + fork detection [deep]
└── Task 7: Chat command parser + authorization gate [deep]

Wave 3 (Integration — after Wave 2):
├── Task 8: Integrate incremental review into index.ts flow [unspecified-high]
├── Task 9: Autofix direct-commit mode (opt-in) [deep]
├── Task 10: Chat command handlers (explain, review, fix) [deep]
└── Task 11: Chat event routing in index.ts [unspecified-high]

Wave 4 (Polish — after Wave 3):
├── Task 12: Update action.yml with all new inputs/outputs/events [quick]
├── Task 13: Update READMEs EN + FR [writing]
├── Task 14: Final build + version bump [quick]

Wave FINAL (Verification — after ALL tasks):
├── F1: Plan compliance audit (oracle)
├── F2: Code quality review (unspecified-high)
├── F3: Real QA execution (unspecified-high)
└── F4: Scope fidelity check (deep)
→ Present results → Get explicit user okay

Critical Path: T1 → T4 → T5 → T8 → T10 → T11 → T12 → T14 → F1-F4
```

### Dependency Matrix

| Task | Depends On | Blocks |
|---|---|---|
| T1 | — | T4 |
| T2 | — | T10 |
| T3 | — | T14 |
| T4 | T1 | T5, T6, T7 |
| T5 | T4 | T8 |
| T6 | T4 | T9, T10 |
| T7 | T4 | T10, T11 |
| T8 | T5 | T14 |
| T9 | T6 | T14 |
| T10 | T2, T6, T7 | T11 |
| T11 | T10 | T14 |
| T12 | T8, T9, T11 | T14 |
| T13 | T12 | T14 |
| T14 | T12, T13 | F1-F4 |

---

## TODOs

- [x] 1. Repo config reader + YAML schema validator

  **What to do**:
  - Create `src/config/reader.ts` with two functions:
    - `readRepoConfig(octokit, owner, repo, ref)` — reads `.github/zai-review.yaml` via `octokit.repos.getContent()` from the PR's **base branch**
    - `readRepoInstructions(octokit, owner, repo, ref)` — reads `.github/zai-review-instructions.md` (optional markdown file with custom AI instructions). Returns the raw markdown string or empty string if 404.
  - Handle 404 gracefully (return empty config)
  - Size limit: reject files > 10KB
  - Create `src/config/schema.ts`: define TypeScript interface `RepoConfig` + validation function
  - Supported keys: `language`, `max_files`, `max_comments`, `exclude_patterns`, `auto_approve`, `model`, `system_prompt`, `enable_thinking`, `autofix_mode`, `incremental`
  - Reject unknown keys with `core.warning()`
  - Do NOT allow `api_key`, `github_token`, `base_url` in config (security)
  - Install `yaml` npm package: `pnpm add yaml`
  - Create `src/config/reader.test.ts` + `src/config/schema.test.ts`

  **Must NOT do**:
  - No per-directory config
  - No config inheritance chains
  - No reading from head branch (prevents PR weaponizing config)

  **Recommended Agent Profile**:
  - **Category**: `deep`
  - **Skills**: `[]`

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1 (with T2, T3)
  - **Blocks**: T4
  - **Blocked By**: None

  **References**:
  - `src/config.ts:29-55` — Current parseConfig pattern, understand how inputs are read
  - `src/github/client.ts` — How Octokit is initialized and passed around
  - CodeRabbit pattern: `octokit.repos.getContent({ owner, repo, path: '.github/zai-review.yaml', ref: baseBranch })`
  - GitHub Copilot pattern: `.github/copilot-instructions.md` — same UX for custom AI instructions
  - `pr-labeler-action/src/utils/config.ts` — Production pattern for reading YAML from repo

  **Acceptance Criteria**:
  - [ ] `pnpm run check` passes
  - [ ] `yaml` package installed as dependency
  - [ ] `readRepoInstructions()` returns markdown string or empty string on 404

  **Instructions Handling**:
  - `readRepoInstructions()` reads `.github/zai-review-instructions.md` from the base branch
  - Returns the raw markdown content as a string
  - If 404: return `''` (empty string, no error)
  - Size limit: reject files > 20KB (instructions can be longer than config)
  - The returned instructions string is later prepended to the system prompt in `prompts.ts` by the reviewer (see T4 integration)

  **QA Scenarios**:
  ```
  Scenario: Valid YAML config file
    Tool: vitest
    Steps:
      1. Mock octokit.repos.getContent to return base64-encoded YAML with language: ja, max_files: 10
      2. Call readRepoConfig()
      3. Assert returned object has language === 'ja' and max_files === 10
    Expected: Config parsed correctly
    Evidence: pnpm test output

  Scenario: Config file not found (404)
    Tool: vitest
    Steps:
      1. Mock octokit.repos.getContent to throw { status: 404 }
      2. Call readRepoConfig()
      3. Assert returns empty object (no error thrown)
    Expected: Graceful fallback

  Scenario: Forbidden keys rejected
    Tool: vitest
    Steps:
      1. Mock config with api_key: "secret"
      2. Call validateConfig()
      3. Assert api_key is stripped and warning logged
    Expected: Security keys removed

  Scenario: Oversized file rejected
    Tool: vitest
    Steps:
      1. Mock config with content > 10KB
      2. Call readRepoConfig()
      3. Assert returns empty config with warning
    Expected: Size limit enforced

  Scenario: Instructions.md file read successfully
    Tool: vitest
    Steps:
      1. Mock octokit.repos.getContent to return base64-encoded markdown '# Review Rules\nFocus on security only.'
      2. Call readRepoInstructions()
      3. Assert returned string contains 'Focus on security only.'
    Expected: Markdown content returned as string

  Scenario: Instructions.md not found (404)
    Tool: vitest
    Steps:
      1. Mock octokit.repos.getContent to throw { status: 404 }
      2. Call readRepoInstructions()
      3. Assert returns '' (empty string, no error)
    Expected: Graceful fallback to empty
  ```

  **Commit**: YES
  - Message: `feat(config): add YAML config file reader and schema validator`
  - Files: `src/config/reader.ts`, `src/config/schema.ts`, `src/config/reader.test.ts`, `src/config/schema.test.ts`, `package.json`, `pnpm-lock.yaml`

---

- [x] 2. Multi-language dynamic prompts

  **What to do**:
  - In `src/ai/prompts.ts`, replace the hardcoded `language === 'fr' ? 'Tu DOIS...' : 'You MUST...'` ternary with a single dynamic instruction: `You MUST write all responses in ${language}.`
  - If `language` is `en`, omit the instruction (English is default)
  - For any other value, include: `You MUST write all your review comments, titles, descriptions, and suggestions in ${language}. Code in suggestion blocks must remain in the original programming language.`
  - Update `parseFallbackResponse` in `parser.ts` — the regex `line.match(/(?:line\s*|l|:)(\d+)/i)` uses English. Either make it locale-aware or remove it (JSON mode via `response_format` makes it unnecessary)
  - Update `action.yml` description for `language` input to list examples: `en, fr, de, ja, zh, es, ar`
  - Create `src/ai/prompts.test.ts` — test that `getDefaultSystemPrompt('ja')` does NOT contain the hardcoded French string
  - Update both READMEs

  **Must NOT do**:
  - NO translation tables / i18n files
  - NO translating code suggestions — only natural language text
  - NO translating severity labels (CRITICAL/WARNING stay in English for parseability)

  **Recommended Agent Profile**:
  - **Category**: `quick`
  - **Skills**: `[]`

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1 (with T1, T3)
  - **Blocks**: T10
  - **Blocked By**: None

  **References**:
  - `src/ai/prompts.ts:7-9` — The hardcoded language ternary to replace
  - `src/ai/prompts.ts:158-160` — Second hardcoded ternary in buildSummaryPrompt
  - `src/ai/parser.ts:156` — English fallback regex pattern

  **Acceptance Criteria**:
  - [ ] `pnpm run check` passes
  - [ ] `getDefaultSystemPrompt('ja')` contains language instruction for Japanese
  - [ ] `getDefaultSystemPrompt('en')` does NOT contain a language instruction line
  - [ ] No hardcoded `=== 'fr'` remaining in prompts.ts

  **QA Scenarios**:
  ```
  Scenario: Japanese prompt generation
    Tool: vitest
    Steps:
      1. Call getDefaultSystemPrompt('ja')
      2. Assert result contains 'ja' or 'Japanese' in language instruction
      3. Assert result does NOT contain 'français' or 'French'
    Expected: Dynamic language instruction

  Scenario: English prompt (no extra instruction)
    Tool: vitest
    Steps:
      1. Call getDefaultSystemPrompt('en')
      2. Assert result does NOT contain 'You MUST write all responses in'
    Expected: No redundant instruction for default language

  Scenario: No hardcoded French remaining
    Tool: ast-grep
    Steps:
      1. Search for `language === 'fr'` in src/ai/prompts.ts
    Expected: Zero matches
  ```

  **Commit**: YES
  - Message: `feat(i18n): make language selection fully dynamic in prompts`
  - Files: `src/ai/prompts.ts`, `src/ai/parser.ts`, `src/ai/prompts.test.ts`

---

- [x] 3. Fix pre-existing bugs (maxFiles clamping, action.yml outputs)

  **What to do**:
  - In `config.ts`: fix `maxFiles` and `maxComments` clamping — currently warns but doesn't clamp. Add: `maxFiles = Math.min(Math.max(maxFiles, 1), 100)` and same for maxComments
  - In `action.yml`: add `outputs:` section declaring the 5 outputs that `index.ts` sets via `core.setOutput()`: `review_status`, `comments_count`, `critical_count`, `security_count`, `summary`
  - Find which outputs index.ts sets by grepping for `core.setOutput`

  **Recommended Agent Profile**:
  - **Category**: `quick`
  - **Skills**: `[]`

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1 (with T1, T2)
  - **Blocks**: T14
  - **Blocked By**: None

  **References**:
  - `src/config.ts:83-89` — The broken clamping code
  - `src/index.ts` — grep for `core.setOutput` to find all outputs
  - `action.yml` — missing `outputs:` section


  **QA Scenarios**:
  ```
  Scenario: maxFiles gets clamped to valid range
    Tool: vitest
    Steps:
      1. Mock core.getInput('max_files') to return '999'
      2. Call parseConfig()
      3. Assert config.maxFiles === 100 (clamped to max)
    Expected: Value clamped, warning logged

  Scenario: action.yml declares all outputs
    Tool: Bash (grep)
    Steps:
      1. Run: grep -c 'review_status\|comments_count\|critical_count\|security_count\|summary' action.yml
      2. Assert count >= 5
    Expected: All outputs declared
  ```

  **Commit**: YES
  - Message: `fix: clamp maxFiles/maxComments values and declare action outputs`

---

- [x] 4. Integrate config reader into parseConfig

  **What to do**:
  - In `src/config.ts`: after reading action inputs, call `readRepoConfig()` to get repo-level config
  - Also call `readRepoInstructions()` to get the `.github/zai-review-instructions.md` content
  - Deep merge: hardcoded defaults → config file values → action input values (action inputs win)
  - Only apply config file values when the action input is at its default value (user didn't explicitly set it)
  - Store the instructions markdown in `ActionConfig.customInstructions: string` (empty string if no file)
  - Pass octokit, owner, repo, and base branch ref to both readers
  - In `src/ai/prompts.ts`: if `customInstructions` is non-empty, prepend it to the system prompt wrapped in `<repo_instructions>` XML tags:
    ```
    <repo_instructions>
    ${customInstructions}
    </repo_instructions>
    ```
  - Update `ActionConfig` interface with `customInstructions: string`
  - Add integration test

  **Recommended Agent Profile**:
  - **Category**: `quick`
  - **Skills**: `[]`

  **Parallelization**:
  - **Blocked By**: T1
  - **Blocks**: T5, T6, T7

  **References**:
  - `src/config.ts` — Current parseConfig implementation
  - `src/config/reader.ts` — The reader created in T1
  - `src/config/schema.ts` — The schema/interface created in T1


  **QA Scenarios**:
  ```
  Scenario: Config file merged with action inputs
    Tool: vitest
    Steps:
      1. Mock octokit.repos.getContent to return YAML with language: 'ja', max_files: 5
      2. Mock core.getInput('language') to return default 'en'
      3. Mock core.getInput('max_files') to return default '20'
      4. Call parseConfig with mocked octokit
      5. Assert config.language === 'ja' (config file wins over default)
    Expected: Config file values applied for default inputs

  Scenario: Explicit action input overrides config file
    Tool: vitest
    Steps:
      1. Mock config file with language: 'ja'
      2. Mock core.getInput('language') to return 'fr' (explicitly set)
      3. Call parseConfig
      4. Assert config.language === 'fr' (action input wins)
    Expected: Action input takes precedence
  ```

  **Commit**: YES
  - Message: `feat(config): integrate repo config file into parseConfig with merge logic`

---

- [x] 5. Incremental review SHA tracking module

  **What to do**:
  - Create `src/review/incremental.ts` with functions:
    - `embedReviewedSha(commentBody: string, sha: string): string` — injects `<!-- zai-last-reviewed-sha: {sha} -->` into comment body
    - `extractReviewedSha(commentBody: string): string | null` — extracts SHA from HTML comment
    - `getIncrementalDiff(octokit, owner, repo, lastSha, headSha): Promise<FileDiff[]>` — calls `octokit.repos.compareCommits()`, returns changed files
    - `isForceP push(octokit, owner, repo, sha): Promise<boolean>` — checks if a SHA still exists (try getCommit, catch 404/422)
  - Create `src/review/incremental.test.ts`

  **Must NOT do**:
  - NO external state storage (no artifacts, no cache)
  - NO skipping files that existed before but were modified

  **Recommended Agent Profile**:
  - **Category**: `deep`
  - **Skills**: `[]`

  **Parallelization**:
  - **Blocked By**: T4
  - **Blocks**: T8

  **References**:
  - CodeRabbit pattern: `commenter.ts` L45-46, L679-717 — SHA tracking in HTML comments
  - CodeRabbit pattern: `review.ts` L85-138 — compareCommits for incremental diff
  - `src/review/types.ts:FileDiff` — interface for file diff data

  **QA Scenarios**:
  ```
  Scenario: Embed and extract SHA roundtrip
    Tool: vitest
    Steps:
      1. Call embedReviewedSha("Summary text", "abc123def")
      2. Call extractReviewedSha on the result
      3. Assert extracted SHA === "abc123def"
    Expected: Roundtrip works

  Scenario: Missing SHA returns null
    Tool: vitest
    Steps:
      1. Call extractReviewedSha("No SHA here")
      2. Assert returns null
    Expected: Graceful null

  Scenario: Force push detection
    Tool: vitest
    Steps:
      1. Mock octokit.repos.compareCommits to throw { status: 404 }
      2. Call getIncrementalDiff with old SHA
      3. Assert returns null (signal for full review fallback)
    Expected: Force push handled
  ```

  **Commit**: YES
  - Message: `feat(incremental): add commit SHA tracking module`

---

- [x] 6. Autofix suggestion enhancer + fork detection

  **What to do**:
  - Create `src/autofix/suggestions.ts` with:
    - `detectForkPR(payload): boolean` — checks `payload.pull_request.head.repo.fork`
    - `enhanceSuggestionComment(comment: ReviewComment): string` — ensures suggestion blocks use proper GitHub suggestion syntax for click-to-apply
    - `canAutofix(config): { mode: 'suggest' | 'commit' | 'disabled', reason?: string }` — determines autofix mode based on config + fork detection
  - Add `autofix_mode` to ActionConfig: `'disabled' | 'suggest' | 'commit'` (default: `'disabled'`)
  - Create `src/autofix/suggestions.test.ts`

  **Recommended Agent Profile**:
  - **Category**: `deep`
  - **Skills**: `[]`

  **Parallelization**:
  - **Blocked By**: T4
  - **Blocks**: T9, T10

  **QA Scenarios**:
  ```
  Scenario: Fork PR forces suggest-only mode
    Tool: vitest
    Steps:
      1. Create mock payload with head.repo.fork === true
      2. Call canAutofix with autofix_mode: 'commit'
      3. Assert returns { mode: 'suggest', reason: 'Fork PRs cannot use commit mode' }
    Expected: Fork detection overrides config

  Scenario: Suggestion syntax generation
    Tool: vitest
    Steps:
      1. Create ReviewComment with suggestion field
      2. Call enhanceSuggestionComment()
      3. Assert output contains ```suggestion block
    Expected: Proper GitHub suggestion syntax
  ```

  **Commit**: YES
  - Message: `feat(autofix): add suggestion enhancer with fork detection`

---

- [x] 7. Chat command parser + authorization gate

  **What to do**:
  - Create `src/chat/parser.ts` with:
    - `parseCommand(body: string): { command: string, args: string } | null` — parse `/zai-review <command> [args]` from comment body
    - Supported commands: `explain`, `review`, `fix`, `help`, `config`
    - Return null if no command found (normal comment)
  - Create `src/chat/auth.ts` with:
    - `isAuthorized(comment, allowedRoles: string[]): boolean` — check `comment.author_association` against allowed roles
    - Default allowed: `['OWNER', 'MEMBER', 'COLLABORATOR']`
    - Always reject bot accounts (`comment.user.type === 'Bot'`)
  - Create `src/chat/parser.test.ts` + `src/chat/auth.test.ts`

  **Recommended Agent Profile**:
  - **Category**: `deep`
  - **Skills**: `[]`

  **Parallelization**:
  - **Blocked By**: T4
  - **Blocks**: T10, T11

  **QA Scenarios**:
  ```
  Scenario: Parse valid command
    Tool: vitest
    Steps:
      1. Call parseCommand("/zai-review explain why is this O(n²)?")
      2. Assert { command: "explain", args: "why is this O(n²)?" }

  Scenario: Ignore normal comment
    Tool: vitest
    Steps:
      1. Call parseCommand("Great PR, looks good to me!")
      2. Assert returns null

  Scenario: Reject unauthorized user
    Tool: vitest
    Steps:
      1. Create comment with author_association: "NONE"
      2. Call isAuthorized(comment, ['OWNER', 'MEMBER', 'COLLABORATOR'])
      3. Assert returns false

  Scenario: Reject bot account
    Tool: vitest
    Steps:
      1. Create comment with user.type: "Bot", author_association: "MEMBER"
      2. Call isAuthorized()
      3. Assert returns false
  ```

  **Commit**: YES
  - Message: `feat(chat): add command parser and authorization gate`

---

- [x] 8. Integrate incremental review into index.ts flow

  **What to do**:
  - Modify `src/index.ts`:
    - Before cleaning old comments, extract last reviewed SHA from existing summary comment
    - After cleaning, check if incremental mode is enabled (config)
    - If enabled + previous SHA exists + not force-pushed: use `getIncrementalDiff()` instead of `fetchPullRequestFiles()`
    - If force pushed or no previous SHA: full review with `[full review]` label in summary
    - Add `[incremental]` or `[full review]` label to summary comment
    - After posting summary, embed new SHA via `embedReviewedSha()`
  - Modify `src/github/comments.ts`:
    - Add `findSummaryComment(octokit, owner, repo, pullNumber): Promise<string | null>` — find existing summary comment body by REVIEW_MARKER
  - Add `incremental` boolean to ActionConfig (default: true)

  **Recommended Agent Profile**:
  - **Category**: `unspecified-high`
  - **Skills**: `[]`

  **Parallelization**:
  - **Blocked By**: T5
  - **Blocks**: T14


  **QA Scenarios**:
  ```
  Scenario: Incremental review uses getIncrementalDiff when SHA exists
    Tool: vitest
    Steps:
      1. Mock findSummaryComment to return body with '<!-- zai-last-reviewed-sha: abc123 -->'
      2. Mock octokit.repos.compareCommits to return 2 changed files
      3. Run the review flow with incremental: true
      4. Assert compareCommits was called with base: 'abc123'
    Expected: Incremental diff used

  Scenario: Falls back to full review when no previous SHA
    Tool: vitest
    Steps:
      1. Mock findSummaryComment to return null
      2. Run the review flow with incremental: true
      3. Assert fetchPullRequestFiles was called (full review)
      4. Assert summary contains '[full review]' label
    Expected: Full review fallback with label
  ```

  **Commit**: YES
  - Message: `feat(incremental): integrate incremental diff into review flow`

---

- [x] 9. Autofix direct-commit mode (opt-in)

  **What to do**:
  - Create `src/autofix/commit.ts`:
    - `commitSuggestions(octokit, owner, repo, branch, suggestions[]): Promise<void>`
    - Use Git Data API for single commit: `git/trees` → `git/commits` → `git/refs/update`
    - Handle 409 conflict gracefully (post comment saying "conflict, resolve manually")
    - Guard: never commit to default branch or protected branches
  - Integrate into index.ts: if `autofix_mode === 'commit'` and there are suggestions, call `commitSuggestions()` after review
  - Create `src/autofix/commit.test.ts`

  **Must NOT do**:
  - NO `createOrUpdateFileContents` (1 commit per file — use Git Data API for batch)
  - NO committing to protected branches
  - NO auto-enabling — must be explicitly set to `'commit'`

  **Recommended Agent Profile**:
  - **Category**: `deep`
  - **Skills**: `[]`

  **Parallelization**:
  - **Blocked By**: T6
  - **Blocks**: T14


  **QA Scenarios**:
  ```
  Scenario: Batch commit via Git Data API
    Tool: vitest
    Steps:
      1. Mock octokit.git.createTree, createCommit, updateRef
      2. Call commitSuggestions with 3 file suggestions
      3. Assert createTree was called once (single tree, not per-file)
      4. Assert createCommit was called once (single commit)
    Expected: All files in one commit

  Scenario: Protected branch guard
    Tool: vitest
    Steps:
      1. Call commitSuggestions with branch: 'main'
      2. Assert throws Error with message containing 'protected'
    Expected: Commit rejected for default branch

  Scenario: 409 conflict handled gracefully
    Tool: vitest
    Steps:
      1. Mock octokit.git.updateRef to throw { status: 409 }
      2. Call commitSuggestions
      3. Assert does not throw (posts warning comment instead)
    Expected: Conflict handled without crash
  ```

  **Commit**: YES
  - Message: `feat(autofix): add opt-in direct-commit mode via Git Data API`

---

- [x] 10. Chat command handlers (explain, review, fix)

  **What to do**:
  - Create `src/chat/commands.ts`:
    - `handleExplain(aiClient, octokit, context, args)` — send the diff hunk + user question to AI, reply with explanation
    - `handleReview(aiClient, octokit, context)` — trigger a fresh review of the PR (reuse existing `reviewFiles()`)
    - `handleFix(aiClient, octokit, context)` — trigger autofix (reuse T6 suggestion logic)
    - `handleHelp(octokit, context)` — post a comment listing all available commands
  - Create `src/chat/handler.ts`:
    - `handleChatEvent(event, config)` — main entry: parse command → authorize → dispatch → reply
    - Post 👀 reaction on trigger comment immediately (before AI processing)
    - Handle errors gracefully (post error message as reply, don't crash)
  - Create `src/chat/commands.test.ts`

  **Recommended Agent Profile**:
  - **Category**: `deep`
  - **Skills**: `[]`

  **Parallelization**:
  - **Blocked By**: T2, T6, T7
  - **Blocks**: T11


  **QA Scenarios**:
  ```
  Scenario: handleExplain sends context to AI and replies
    Tool: vitest
    Steps:
      1. Mock aiClient.chatCompletion to return 'This is O(n²) because...'
      2. Mock octokit.issues.createComment
      3. Call handleExplain with args: 'why is this slow?'
      4. Assert chatCompletion was called with diff context + user question
      5. Assert createComment was called with AI response
    Expected: AI explanation posted as reply

  Scenario: handleHelp lists all commands
    Tool: vitest
    Steps:
      1. Mock octokit.issues.createComment
      2. Call handleHelp
      3. Assert createComment body contains 'explain', 'review', 'fix', 'help'
    Expected: Help text with all commands

  Scenario: Error in handler posts error reply
    Tool: vitest
    Steps:
      1. Mock aiClient.chatCompletion to throw Error('API failed')
      2. Call handleChatEvent
      3. Assert octokit.issues.createComment was called with error message
    Expected: Graceful error handling, no crash
  ```

  **Commit**: YES
  - Message: `feat(chat): implement explain, review, fix command handlers`

---

- [x] 11. Chat event routing in index.ts

  **What to do**:
  - Modify `src/index.ts`:
    - At top of `run()`, detect event type: `github.context.eventName`
    - If `pull_request` → existing review flow (unchanged)
    - If `issue_comment` or `pull_request_review_comment` → route to `handleChatEvent()`
    - For `issue_comment`: verify it's a PR comment via `context.payload.issue.pull_request`
    - For `issue_comment`: fetch PR details to get head SHA, base branch (not available in payload)
  - Modify `src/config.ts`:
    - Handle `issue_comment` event: extract PR number from `context.payload.issue.number`
    - Handle `pull_request_review_comment` event: extract from `context.payload.pull_request.number`
  - Do NOT subscribe to `edited` event type — only `created`

  **Recommended Agent Profile**:
  - **Category**: `unspecified-high`
  - **Skills**: `[]`

  **Parallelization**:
  - **Blocked By**: T10
  - **Blocks**: T14


  **QA Scenarios**:
  ```
  Scenario: issue_comment on PR routes to chat handler
    Tool: vitest
    Steps:
      1. Mock github.context with eventName: 'issue_comment', payload.issue.pull_request: { url: '...' }
      2. Mock payload.comment.body: '/zai-review explain this'
      3. Call run()
      4. Assert handleChatEvent was called
      5. Assert reviewFiles was NOT called (review flow skipped)
    Expected: Chat event routed correctly

  Scenario: issue_comment on issue (not PR) is ignored
    Tool: vitest
    Steps:
      1. Mock github.context with eventName: 'issue_comment', payload.issue.pull_request: undefined
      2. Call run()
      3. Assert handleChatEvent was NOT called
    Expected: Non-PR comments ignored
  ```

  **Commit**: YES
  - Message: `feat(chat): integrate chat handler into index.ts with event routing`

---

- [x] 12. Update action.yml with all new inputs/outputs/events

  **What to do**:
  - Add new inputs: `autofix_mode` (disabled/suggest/commit, default: disabled), `incremental` (true/false, default: true), `chat_enabled` (true/false, default: true), `chat_allowed_roles` (default: 'OWNER,MEMBER,COLLABORATOR')
  - Add `outputs:` section with all outputs from `core.setOutput()`
  - Update `description` for `language` input
  - Update READMEs will be done in T13

  **Recommended Agent Profile**:
  - **Category**: `quick`
  - **Skills**: `[]`

  **Parallelization**:
  - **Blocked By**: T8, T9, T11
  - **Blocks**: T14


  **QA Scenarios**:
  ```
  Scenario: All new inputs present in action.yml
    Tool: Bash (grep)
    Steps:
      1. Run: grep -c 'autofix_mode\|incremental\|chat_enabled\|chat_allowed_roles' action.yml
      2. Assert count >= 4
    Expected: All new inputs declared

  Scenario: Outputs section exists
    Tool: Bash (grep)
    Steps:
      1. Run: grep -c 'outputs:' action.yml
      2. Assert count >= 1
    Expected: Outputs section present
  ```

  **Commit**: YES
  - Message: `feat(action): add new inputs, outputs for v2 features`

---

- [x] 13. Update READMEs EN + FR

  **What to do**:
  - Add sections for each new feature: Multi-language, Chat Commands, Autofix, Incremental Review, Repo Config
  - Update config table with all new inputs
  - Add example `.github/zai-review.yaml`
  - Add example `.github/zai-review-instructions.md`
  - Add example workflow with chat events
  - Add chat command reference table
  - Update both README.md and README.fr.md

  **Recommended Agent Profile**:
  - **Category**: `writing`
  - **Skills**: `[]`

  **Parallelization**:
  - **Blocked By**: T12
  - **Blocks**: T14


  **QA Scenarios**:
  ```
  Scenario: README.md contains all 5 new feature sections
    Tool: Bash (grep)
    Steps:
      1. Run: grep -c 'Chat Commands\|Autofix\|Incremental Review\|Repo Config\|Multi-language' README.md
      2. Assert count >= 5
    Expected: All features documented

  Scenario: README.fr.md contains French equivalents
    Tool: Bash (grep)
    Steps:
      1. Run: grep -c 'Commandes Chat\|Autofix\|Revue Incrémentale\|Config Repo\|Multi-langue' README.fr.md
      2. Assert count >= 5
    Expected: French README matches
  ```

  **Commit**: YES
  - Message: `docs: update READMEs with v2 features`

---

- [x] 14. Final build + version bump + release

  **What to do**:
  - Bump version in `package.json` to `2.0.0`
  - Run `pnpm run check` (must pass)
  - Rebuild `dist/index.js`
  - Commit all dist/ changes
  - Create tag `v2.0.0` + update major tag `v2`
  - Create GitHub release with changelog
  - Keep `v1` tag pointing at previous release (backward compat)

  **Recommended Agent Profile**:
  - **Category**: `quick`
  - **Skills**: `['git-master']`

  **Parallelization**:
  - **Blocked By**: T12, T13
  - **Blocks**: F1-F4


  **QA Scenarios**:
  ```
  Scenario: Full check passes
    Tool: Bash
    Steps:
      1. Run: pnpm run check
      2. Assert exit code 0
    Expected: tsc + vitest + ncc build all pass

  Scenario: Version bumped
    Tool: Bash (grep)
    Steps:
      1. Run: grep '"version"' package.json
      2. Assert contains '2.0.0'
    Expected: Version is 2.0.0

  Scenario: Tags created
    Tool: Bash (git)
    Steps:
      1. Run: git tag -l 'v2*'
      2. Assert output contains v2.0.0 and v2
    Expected: Both tags exist
  ```

  **Commit**: YES
  - Message: `chore: v2.0.0 release`

---

## Final Verification Wave (MANDATORY — after ALL implementation tasks)

> 4 review agents run in PARALLEL. ALL must APPROVE.
> Present consolidated results to user and get explicit "okay" before completing.

- [ ] F1. **Plan Compliance Audit** — `oracle`

  **QA Scenarios**:
  ```
  Scenario: All "Must Have" requirements present
    Tool: Bash (grep)
    Steps:
      1. grep -r 'parseCommand' src/chat/ — assert file exists (chat feature)
      2. grep -r 'readRepoConfig' src/config/ — assert file exists (config feature)
      3. grep -r 'embedReviewedSha' src/review/ — assert file exists (incremental feature)
      4. grep -r 'detectForkPR' src/autofix/ — assert file exists (autofix feature)
      5. grep -r 'You MUST write' src/ai/prompts.ts — assert dynamic language (multi-lang)
    Expected: All 5 feature modules exist

  Scenario: No forbidden patterns in codebase
    Tool: Bash (grep)
    Steps:
      1. grep -r 'auto-merge\|autoMerge' src/ — assert zero matches
      2. grep -r 'api_key\|apiKey' src/config/schema.ts — assert key is in forbidden list
      3. grep -r 'language === .fr.' src/ai/prompts.ts — assert zero matches (no hardcoded French)
    Expected: Zero forbidden patterns

  Scenario: Evidence files from per-task QA
    Tool: Bash
    Steps:
      1. Run: pnpm run check
      2. Assert exit code 0
      3. Assert test count >= 50 in vitest output
    Expected: All tests pass
  ```
  Output: `Must Have [N/N] | Must NOT Have [N/N] | VERDICT: APPROVE/REJECT`

- [ ] F2. **Code Quality Review** — `unspecified-high`

  **QA Scenarios**:
  ```
  Scenario: TypeScript strict compliance
    Tool: Bash
    Steps:
      1. Run: pnpm run check
      2. Assert tsc --noEmit exit code 0 (zero type errors)
    Expected: Type-safe code

  Scenario: No unsafe patterns in new files
    Tool: Bash (grep)
    Steps:
      1. grep -rn 'as any' src/chat/ src/autofix/ src/config/reader.ts src/config/schema.ts src/review/incremental.ts
      2. Assert count <= 3 (some `as any` may be justified for Octokit payloads)
      3. grep -rn '@ts-ignore\|@ts-expect-error' src/ — assert zero matches
    Expected: Minimal unsafe casts

  Scenario: No AI slop in new files
    Tool: Bash (grep)
    Steps:
      1. grep -c 'TODO\|FIXME\|HACK\|XXX' src/chat/ src/autofix/ src/config/reader.ts
      2. Assert zero matches
    Expected: Clean code, no deferred work
  ```
  Output: `Build [PASS/FAIL] | Tests [N pass/N fail] | Unsafe casts [N] | VERDICT`

- [ ] F3. **Automated QA Execution** — `unspecified-high`

  **QA Scenarios**:
  ```
  Scenario: Unit tests cover all new modules
    Tool: Bash
    Steps:
      1. Run: pnpm test -- --reporter=verbose 2>&1
      2. Assert test files exist for: parser, auth, commands, suggestions, commit, incremental, reader, schema, prompts
      3. Assert all tests pass (zero failures)
      4. Assert total test count >= 50
    Expected: All new modules have tests, all pass

  Scenario: Config file parsing end-to-end
    Tool: vitest
    Steps:
      1. Create a mock .github/zai-review.yaml content with language: 'de', max_files: 5
      2. Mock octokit.repos.getContent to return it
      3. Call readRepoConfig + validateConfig
      4. Assert language === 'de' and max_files === 5
    Expected: Config pipeline works end-to-end

  Scenario: Chat parser + auth integration
    Tool: vitest
    Steps:
      1. Create mock comment with body: '/zai-review explain this', author_association: 'MEMBER', user.type: 'User'
      2. Call parseCommand → assert { command: 'explain', args: 'this' }
      3. Call isAuthorized → assert true
    Expected: Chat pipeline components integrate correctly
  ```
  Output: `Tests [N/N pass] | Modules covered [N/N] | VERDICT`

- [ ] F4. **Scope Fidelity Check** — `deep`

  **QA Scenarios**:
  ```
  Scenario: Backward compatibility with v1
    Tool: Bash (grep)
    Steps:
      1. Verify action.yml still has all v1 inputs with same defaults
      2. grep 'pull_request' .github/workflows/review.yml — assert still present
      3. Verify v1 tag still points to previous release: git log v1 --oneline -1
    Expected: v1 workflows unchanged

  Scenario: No scope creep
    Tool: Bash (grep + find)
    Steps:
      1. Assert no auto-merge code: grep -r 'mergePullRequest\|auto.merge' src/ — zero matches
      2. Assert no per-directory config: grep -r 'readDirConfig\|directoryConfig' src/ — zero matches
      3. Assert no config security override: grep 'api_key.*=\|github_token.*=' src/config/schema.ts validation rejects these
    Expected: Scope boundaries respected

  Scenario: Each feature works independently
    Tool: vitest
    Steps:
      1. Run tests with each feature config disabled (incremental: false, chat_enabled: false, autofix_mode: disabled)
      2. Assert core review still works (reviewFiles called, summary posted)
    Expected: Features are additive, not required
  ```
  Output: `Backward compat [PASS/FAIL] | Scope [CLEAN/CREEP] | Independence [N/N] | VERDICT`
---

## Commit Strategy

| # | Message | Files |
|---|---|---|
| 1 | `feat(config): add YAML config file reader and schema validator` | `src/config/reader.ts`, `src/config/schema.ts`, tests |
| 2 | `feat(i18n): make language selection fully dynamic` | `src/ai/prompts.ts`, `src/ai/parser.ts`, test |
| 3 | `fix: clamp maxFiles/maxComments and declare action outputs` | `src/config.ts`, `action.yml` |
| 4 | `feat(config): integrate repo config into parseConfig` | `src/config.ts` |
| 5 | `feat(incremental): add commit SHA tracking module` | `src/review/incremental.ts`, test |
| 6 | `feat(autofix): add suggestion enhancer with fork detection` | `src/autofix/suggestions.ts`, test |
| 7 | `feat(chat): add command parser and authorization gate` | `src/chat/parser.ts`, `src/chat/auth.ts`, tests |
| 8 | `feat(incremental): integrate into review flow` | `src/index.ts`, `src/github/comments.ts` |
| 9 | `feat(autofix): add opt-in direct-commit mode` | `src/autofix/commit.ts`, test |
| 10 | `feat(chat): implement command handlers` | `src/chat/commands.ts`, `src/chat/handler.ts`, test |
| 11 | `feat(chat): integrate event routing` | `src/index.ts`, `src/config.ts` |
| 12 | `feat(action): add new inputs/outputs for v2` | `action.yml` |
| 13 | `docs: update READMEs with v2 features` | `README.md`, `README.fr.md` |
| 14 | `chore: v2.0.0 release` | `package.json`, `dist/` |

---

## Success Criteria

### Verification Commands
```bash
pnpm run check          # Expected: tsc OK, all tests pass, build OK
pnpm test               # Expected: all tests pass (40+ tests)
```

### Final Checklist
- [ ] All 5 features implemented and tested
- [ ] `pnpm run check` passes
- [ ] `dist/index.js` rebuilt
- [ ] READMEs updated (EN + FR)
- [ ] `v2.0.0` tag created
- [ ] GitHub release published
- [ ] Backward compatible with v1 workflows
- [ ] No forbidden patterns (auto-merge, per-dir config, security key override)
