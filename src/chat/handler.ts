import * as core from '@actions/core';
import * as github from '@actions/github';
import type { Octokit } from '@octokit/rest';
import type { ZaiClient } from '../ai/client';
import type { ActionConfig } from '../config';
import { isAuthorized, type CommentActor } from './auth';
import { handleExplain, handleFix, handleHelp, handleReview } from './commands';
import { parseCommand } from './parser';

export async function handleChatEvent(
  octokit: Octokit,
  aiClient: ZaiClient,
  config: ActionConfig
): Promise<void> {
  const { owner, repo } = github.context.repo;
  const payload = github.context.payload;
  const comment = payload.comment;

  if (!comment?.body) {
    return;
  }

  const parsed = parseCommand(comment.body);

  if (!parsed) {
    return;
  }

  const pullNumber = payload.issue?.number ?? payload.pull_request?.number;

  if (!pullNumber) {
    core.warning('Chat command received without an associated PR number.');
    return;
  }

  try {
    if (payload.issue?.state === 'closed' || payload.pull_request?.state === 'closed') {
      await octokit.issues.createComment({
        owner,
        repo,
        issue_number: pullNumber,
        body: 'This PR is closed. Commands are not processed on closed PRs.',
      });
      return;
    }

    if (!isAuthorized(comment as unknown as CommentActor, config.chatAllowedRoles)) {
      await octokit.issues.createComment({
        owner,
        repo,
        issue_number: pullNumber,
        body: 'You are not authorized to use Z.ai Code Review commands.',
      });
      return;
    }

    // Post 👀 reaction — use correct endpoint based on event type
    try {
      const eventName = github.context.eventName;
      if (eventName === 'pull_request_review_comment') {
        await octokit.reactions.createForPullRequestReviewComment({
          owner,
          repo,
          comment_id: comment.id,
          content: 'eyes',
        });
      } else {
        await octokit.reactions.createForIssueComment({
          owner,
          repo,
          comment_id: comment.id,
          content: 'eyes',
        });
      }
    } catch {
      // Reaction is best-effort — don't abort the command if it fails
      core.debug('Could not post reaction on comment');
    }

    const chatContext = {
      octokit,
      aiClient,
      config,
      commentId: comment.id,
      pullNumber,
      commentBody: comment.body,
      diffHunk: 'diff_hunk' in comment && typeof comment.diff_hunk === 'string' ? comment.diff_hunk : undefined,
    };

    switch (parsed.command) {
      case 'explain':
        await handleExplain(chatContext, parsed.args);
        break;
      case 'review':
        await handleReview(chatContext);
        break;
      case 'fix':
        await handleFix(chatContext);
        break;
      case 'help':
      case 'config':
        await handleHelp(chatContext);
        break;
    }
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    core.warning(`Failed to process chat command: ${message}`);
    await octokit.issues.createComment({
      owner,
      repo,
      issue_number: pullNumber,
      body: `⚠️ Error processing command: ${message}`,
    });
  }
}
