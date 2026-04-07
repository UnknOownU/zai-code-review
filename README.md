# Z.ai Code Review

[![GitHub Actions Status](https://img.shields.io/github/actions/workflow/status/UnknOownU/zai-code-review/review.yml?branch=master)](https://github.com/UnknOownU/zai-code-review/actions)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

> **[Version française](README.fr.md)**

Z.ai Code Review is a GitHub Action that uses the Z.ai API to provide intelligent, automated code reviews. It analyzes pull request diffs to identify bugs, security vulnerabilities, and logic errors, delivering feedback via inline comments and comprehensive PR summaries.

## Feature Highlights

- **Automated Inline Comments**: Precise feedback on specific lines of code including titles, descriptions, and severity levels.
- **Smart Code Suggestions**: Click-to-apply code improvements directly within the GitHub PR interface.
- **PR Summaries**: Synthesizes all file-level findings into a high-level overview with functional change lists and risk assessments.
- **Large Diff Handling**: Automatically chunks massive diffs into manageable parts for the AI while maintaining line number accuracy.
- **Reliable API Client**: Built-in exponential backoff retry logic and configurable timeouts to handle API rate limits and transient errors.
- **Noise Reduction**: Cleans up previous review comments on every new push to keep the PR conversation focused.
- **Concurrent Processing**: Reviews multiple files simultaneously for fast turnaround on large pull requests.
- **Customizable Logic**: Supports custom system prompts to tailor the reviewer's focus to specific team standards.

## Quick Start

Add the following workflow file to your repository at `.github/workflows/zai-review.yml`:

```yaml
name: Z.ai Code Review

on:
  pull_request:
    types: [opened, synchronize]

permissions:
  contents: read
  pull-requests: write

jobs:
  review:
    runs-on: ubuntu-latest
    steps:
      - name: Z.ai Code Review
        uses: UnknOownU/zai-code-review@master
        with:
          ZAI_API_KEY: ${{ secrets.ZAI_API_KEY }}
```

## Configuration

| Input | Type | Default | Description |
|---|---|---|---|
| `ZAI_API_KEY` | string | **Required** | Z.ai API key for authentication. |
| `ZAI_MODEL` | string | `glm-4.7` | Z.ai model to use for analysis. |
| `ZAI_SYSTEM_PROMPT` | string | `""` | Optional override for the AI system instructions. |
| `ZAI_REVIEWER_NAME` | string | `Z.ai Code Review` | Display name used in review comments. |
| `GITHUB_TOKEN` | string | `${{ github.token }}` | GitHub token for API access. Requires `pull-requests: write`. |
| `max_files` | number | `20` | Maximum number of files to analyze per PR. |
| `exclude_patterns` | string | (see below) | Comma-separated glob patterns to skip. |
| `language` | string | `en` | Language for comments (`en` or `fr`). |
| `auto_approve` | boolean | `false` | Automatically approve the PR if no issues are found. |
| `max_comments` | number | `50` | Maximum inline comments to post per review. |
| `ai_base_url` | string | `https://api.z.ai` | Base URL for the Z.ai API. |
| `use_coding_plan` | boolean | `true` | Use the GLM Coding Plan endpoint (`/api/coding/paas/v4`) instead of the standard API. |

## How It Works

1. **Trigger**: The action activates when a pull request is opened or updated.
2. **Context Gathering**: Fetches the PR diff and identifies changed files, filtering out binary data and excluded paths.
3. **AI Analysis**: Files are processed concurrently. Large files are split into chunks. The AI analyzes the code with a "Bug-First" approach, focusing on logic, security, and performance.
4. **Validation**: Findings are mapped from diff-relative positions to absolute file line numbers.
5. **Reporting**:
   - Deletes obsolete comments from previous runs.
   - Posts new inline comments with severity markers.
   - Generates a summary comment containing the review verdict and key findings.

Example of an inline review comment:

```markdown
## [BUG] [CRITICAL] Null dereference on empty response

When the API returns an empty array, response[0] is undefined.
Accessing .id on undefined throws TypeError at runtime.

```suggestion
if (!response.length) return null;
```
```

## Custom Prompts

Override the default behavior by providing a `ZAI_SYSTEM_PROMPT`. The default prompt enforces a JSON output format and focuses on:
- Logic errors and off-by-one mistakes.
- Security vulnerabilities like SQL injection or secret exposure.
- Performance bottlenecks like N+1 queries.

If you provide a custom prompt, ensure it instructs the AI to return a valid JSON object matching the internal schema.

## Supported Languages

The action supports `en` (English) and `fr` (French) for all generated feedback:

```yaml
with:
  language: fr
```

## File Exclusion

Exclude specific files or directories using the `exclude_patterns` input. Supports comma-separated values and glob-like patterns:

- `*.min.js` (by extension)
- `tests/*` (by directory)
- `generated.ts` (exact match)

**Default exclusions**: `package-lock.json`, `yarn.lock`, `pnpm-lock.yaml`, `*.min.js`, `*.min.css`, `*.bundle.js`, `*.map`.

## Development

Prerequisites: Node.js 20+ and pnpm.

```bash
pnpm install       # Install dependencies
pnpm run check     # Type-check + build
pnpm run build     # Build only
```

The project uses `@vercel/ncc` to bundle the TypeScript source into a single distribution file required by GitHub Actions.

## License

This project is licensed under the MIT License.
