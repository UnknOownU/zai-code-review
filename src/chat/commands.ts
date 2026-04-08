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

const HELP_MESSAGE = `## Z.ai Code Review — Commands

- \`/zai-review explain <question>\` — Ask a question about the code
- \`/zai-review review\` — Re-run the full code review
- \`/zai-review fix\` — Apply suggestion fixes (if autofix is enabled)
- \`/zai-review help\` — Show this message`;

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

  // Build prompt: use diff hunk (inline comment) or ask the question directly (general comment)
  const userContent = ctx.diffHunk
    ? `Given this code:\n\`\`\`\n${ctx.diffHunk}\n\`\`\`\n\nQuestion: ${args}`
    : args;

  const response = await ctx.aiClient.chatCompletion([
    {
      role: 'system',
      content: 'You are a code reviewer. Answer the developer\'s question clearly and concisely. Focus on the specific question asked.',
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
    'Re-review requested. The next push will trigger a full review.',
    ctx.commentId
  );
}

export async function handleFix(ctx: ChatContext): Promise<void> {
  const { owner, repo } = github.context.repo;

  const body = (() => {
    switch (ctx.config.autofixMode) {
      case 'suggest':
        return "Suggestions are already visible in the review comments. Use GitHub's 'Apply suggestion' button on each comment.";
      case 'commit':
        return 'Autofix in commit mode will be applied on the next review run.';
      case 'disabled':
      default:
        return "Autofix is disabled. Set autofix_mode to 'suggest' or 'commit' in your workflow to enable it.";
    }
  })();

  await postReply(ctx.octokit, owner, repo, ctx.pullNumber, body, ctx.commentId);
}
