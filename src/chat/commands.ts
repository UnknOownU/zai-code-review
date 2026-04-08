import * as core from '@actions/core';
import * as github from '@actions/github';
import type { Octokit } from '@octokit/rest';
import type { ZaiClient } from '../ai/client';
import type { ActionConfig } from '../config';

export interface ChatContext {
  octokit: Octokit;
  aiClient: ZaiClient;
  config: ActionConfig;
  commentId: number;
  pullNumber: number;
  commentBody: string;
  diffHunk?: string;
}

function buildChatSystemPrompt(basePrompt: string, config: ActionConfig): string {
  let prompt = basePrompt;
  if (config.language && config.language !== 'en') {
    prompt += `\n\nYou MUST write all responses in ${config.language}. Code examples must remain in the original programming language.`;
  }
  if (config.customInstructions) {
    prompt += `\n\n<repo_instructions>\n${config.customInstructions}\n</repo_instructions>`;
  }
  return prompt;
}

const HELP_MESSAGE = `## Z.ai Code Review — Commands

| Command | Description |
|---|---|
| \`/zai-review explain <question>\` | Ask a question about the code — with optional diff context from inline comments |
| \`/zai-review review\` | Request a fresh full review on the next push |
| \`/zai-review fix\` | Check autofix status and how to apply suggestions |
| \`/zai-review help\` | Show this command reference |

**Configuration**: Add \`.github/zai-review.yaml\` for repo-level settings.
**Custom instructions**: Add \`.github/zai-review-instructions.md\` to customize review behavior.`;

async function postReply(
  octokit: Octokit,
  owner: string,
  repo: string,
  pullNumber: number,
  body: string,
  commentId?: number
): Promise<void> {
  // For pull_request_review_comment events, reply in the thread using the dedicated reply endpoint
  const eventName = github.context.eventName;
  if (eventName === 'pull_request_review_comment' && commentId) {
    await octokit.pulls.createReplyForReviewComment({
      owner,
      repo,
      pull_number: pullNumber,
      comment_id: commentId,
      body,
    });
  } else {
    await octokit.issues.createComment({
      owner,
      repo,
      issue_number: pullNumber,
      body,
    });
  }
}

export async function handleExplain(ctx: ChatContext, args: string): Promise<void> {
  const { owner, repo } = github.context.repo;

  // Guard: require a question
  if (!args.trim()) {
    await postReply(
      ctx.octokit, owner, repo, ctx.pullNumber,
      'Please provide a question after the command.\nExample: `/zai-review explain why is eval dangerous`',
      ctx.commentId
    );
    return;
  }

  core.info(`Processing explain command for PR #${ctx.pullNumber}`);

  const systemPrompt = `${buildChatSystemPrompt(`You are Explainer, an expert code analyst specializing in clear, precise explanations of code behavior, patterns, and potential issues.

## Core Principles:
1. **Precision**: Answer the exact question asked. Do not add unrelated observations.
2. **Evidence-Based**: Reference specific code elements (variable names, function calls, line patterns) in your explanation.
3. **Concise**: Keep explanations focused. One clear paragraph is better than five vague ones.
4. **Educational**: Explain the "why" — not just the "what". Help the developer understand the underlying concept.`, ctx.config)}

<guidelines>
- If code context is provided (diff hunk), analyze it directly.
- If no code context is available, answer the question based on your knowledge of the programming language and best practices.
- Use code examples in your explanation when they help clarify the point.
- If the question is ambiguous, address the most likely interpretation and note the ambiguity.
</guidelines>

<non_negotiable_rules>
- NEVER fabricate code that was not provided in the context.
- NEVER give generic answers like "it depends" without explaining the specific factors.
- ALWAYS write in ${ctx.config.language} if specified.
</non_negotiable_rules>`;

  const userContent = ctx.diffHunk
    ? `<explain_request>\n<code>\n${ctx.diffHunk}\n</code>\n<question>${args}</question>\n</explain_request>`
    : `<explain_request>\n<question>${args}</question>\n</explain_request>`;

  const response = await ctx.aiClient.chatCompletion([
    {
      role: 'system',
      content: systemPrompt,
    },
    {
      role: 'user',
      content: userContent,
    },
  ]);

  await postReply(ctx.octokit, owner, repo, ctx.pullNumber, response, ctx.commentId);
}

export async function handleHelp(ctx: ChatContext): Promise<void> {
  const { owner, repo } = github.context.repo;
  await postReply(ctx.octokit, owner, repo, ctx.pullNumber, HELP_MESSAGE, ctx.commentId);
}

export async function handleReview(ctx: ChatContext): Promise<void> {
  const { owner, repo } = github.context.repo;
  await postReply(
    ctx.octokit,
    owner,
    repo,
    ctx.pullNumber,
    '**Review requested** — A full re-review will be triggered on the next push to this PR. If you want an immediate review, push an empty commit: `git commit --allow-empty -m "trigger review" && git push`.',
    ctx.commentId
  );
}

export async function handleFix(ctx: ChatContext): Promise<void> {
  const { owner, repo } = github.context.repo;

  const body = (() => {
    switch (ctx.config.autofixMode) {
      case 'suggest':
        return "**Suggestions are available.** Look for the `suggestion` blocks in the review comments above — click 'Apply suggestion' on each one to accept.";
      case 'commit':
        return '**Autofix (commit mode) is active.** Suggestion fixes will be applied automatically in the next review run.';
      default:
        return '**Autofix is disabled.** To enable it, add `autofix_mode: suggest` or `autofix_mode: commit` to your workflow or `.github/zai-review.yaml` config file.';
    }
  })();

  await postReply(ctx.octokit, owner, repo, ctx.pullNumber, body, ctx.commentId);
}
