import * as core from '@actions/core';
import { Octokit } from '@octokit/rest';
import { ReviewComment, REVIEW_MARKER } from '../review/types';

/**
 * Post a single inline review comment on a specific line of a file.
 */
export async function postInlineComment(
  octokit: Octokit,
  owner: string,
  repo: string,
  pullNumber: number,
  commitId: string,
  comment: ReviewComment
): Promise<number | null> {
  try {
    const response = await octokit.pulls.createReviewComment({
      owner,
      repo,
      pull_number: pullNumber,
      body: formatCommentBody(comment),
      path: comment.path,
      line: comment.line,
      commit_id: commitId,
    });

    core.debug(`Posted inline comment on ${comment.path}:${comment.line} (id: ${response.data.id})`);
    return response.data.id;
  } catch (error: any) {
    // If line is out of range, try posting without line specification
    if (error.status === 422 || error.message?.includes('line')) {
      core.warning(`Could not post inline comment on ${comment.path}:${comment.line}: ${error.message}. Posting as body-only comment.`);
      try {
        const response = await octokit.pulls.createReviewComment({
          owner,
          repo,
          pull_number: pullNumber,
          body: formatCommentBody({ ...comment, line: 0 }),
          path: comment.path,
          line: 1,
          commit_id: commitId,
        });
        return response.data.id;
      } catch (innerError: any) {
        core.warning(`Failed to post fallback comment: ${innerError.message}`);
        return null;
      }
    }
    core.warning(`Failed to post inline comment on ${comment.path}:${comment.line}: ${error.message}`);
    return null;
  }
}

/**
 * Create a full review with all comments grouped together.
 * This is the preferred approach - similar to GitHub Copilot.
 */
export async function createReview(
  octokit: Octokit,
  owner: string,
  repo: string,
  pullNumber: number,
  commitId: string,
  comments: ReviewComment[],
  event: 'APPROVE' | 'REQUEST_CHANGES' | 'COMMENT',
  body: string
): Promise<number | null> {
  try {
    const reviewComments = comments.map(c => ({
      path: c.path,
      line: c.line,
      body: formatCommentBody(c),
    }));

    const response = await octokit.pulls.createReview({
      owner,
      repo,
      pull_number: pullNumber,
      commit_id: commitId,
      body,
      event,
      comments: reviewComments,
    });

    core.info(`Created review (id: ${response.data.id}) with ${reviewComments.length} inline comments, event: ${event}`);
    return response.data.id;
  } catch (error: any) {
    core.warning(`Failed to create grouped review: ${error.message}. Falling back to individual comments.`);

    for (const comment of comments) {
      await postInlineComment(octokit, owner, repo, pullNumber, commitId, comment);
    }
    return null;
  }
}

/**
 * Post the global summary comment on the PR (as an issue comment).
 */
export async function postSummaryComment(
  octokit: Octokit,
  owner: string,
  repo: string,
  pullNumber: number,
  summaryBody: string
): Promise<number | null> {
  try {
    const response = await octokit.issues.createComment({
      owner,
      repo,
      issue_number: pullNumber,
      body: summaryBody,
    });

    core.info(`Posted summary comment (id: ${response.data.id})`);
    return response.data.id;
  } catch (error: any) {
    core.warning(`Failed to post summary comment: ${error.message}`);
    return null;
  }
}

/**
 * Delete old review comments created by this action (identified by the marker).
 * This prevents duplicate comments on subsequent pushes.
 */
export async function cleanOldComments(
  octokit: Octokit,
  owner: string,
  repo: string,
  pullNumber: number
): Promise<void> {
  core.info('Cleaning up old Z.ai review comments...');

  try {
    const allReviewComments: any[] = [];
    let reviewPage = 1;
    while (true) {
      const response = await octokit.pulls.listReviewComments({
        owner,
        repo,
        pull_number: pullNumber,
        per_page: 100,
        page: reviewPage,
      });
      allReviewComments.push(...response.data);
      if (response.data.length < 100) break;
      reviewPage++;
    }

    const oldComments = allReviewComments.filter(
      (c: any) => c.body && c.body.includes(REVIEW_MARKER)
    );

    for (const comment of oldComments) {
      try {
        await octokit.pulls.deleteReviewComment({
          owner,
          repo,
          comment_id: comment.id,
        });
        core.debug(`Deleted old comment ${comment.id}`);
      } catch (err: any) {
        core.warning(`Failed to delete comment ${comment.id}: ${err.message}`);
      }
    }

    const allIssueComments: any[] = [];
    let issuePage = 1;
    while (true) {
      const response = await octokit.issues.listComments({
        owner,
        repo,
        issue_number: pullNumber,
        per_page: 100,
        page: issuePage,
      });
      allIssueComments.push(...response.data);
      if (response.data.length < 100) break;
      issuePage++;
    }

    const oldSummaryComments = allIssueComments.filter(
      (c: any) => c.body && c.body.includes(REVIEW_MARKER)
    );

    for (const comment of oldSummaryComments) {
      try {
        await octokit.issues.deleteComment({
          owner,
          repo,
          comment_id: comment.id,
        });
        core.debug(`Deleted old summary comment ${comment.id}`);
      } catch (err: any) {
        core.warning(`Failed to delete summary comment ${comment.id}: ${err.message}`);
      }
    }

    if (oldComments.length > 0 || oldSummaryComments.length > 0) {
      core.info(`Cleaned ${oldComments.length} old review comments and ${oldSummaryComments.length} old summary comments.`);
    }
  } catch (error: any) {
    core.warning(`Failed to clean old comments: ${error.message}`);
  }
}

/**
 * Find the most recent summary comment posted by this action.
 * Returns the comment body if found, or null otherwise.
 */
export async function findSummaryComment(
  octokit: Octokit,
  owner: string,
  repo: string,
  pullNumber: number
): Promise<string | null> {
  try {
    const allIssueComments: any[] = [];
    let page = 1;
    while (true) {
      const response = await octokit.issues.listComments({
        owner,
        repo,
        issue_number: pullNumber,
        per_page: 100,
        page,
      });
      allIssueComments.push(...response.data);
      if (response.data.length < 100) break;
      page++;
    }

    const summaryComment = allIssueComments.find(
      (c: any) => c.body && c.body.includes(REVIEW_MARKER)
    );

    return summaryComment?.body ?? null;
  } catch (error: any) {
    core.warning(`Failed to find summary comment: ${error.message}`);
    return null;
  }
}

function formatCommentBody(comment: ReviewComment): string {
  const severityEmoji = {
    critical: '🔴',
    warning: '🟡',
    info: '🔵',
  };

  const categoryLabel = comment.category.toUpperCase();
  const severityLabel = comment.severity.toUpperCase();
  const emoji = severityEmoji[comment.severity] || 'ℹ️';

  let body = `## ${emoji} [${categoryLabel}] [${severityLabel}] ${comment.title}\n\n`;
  body += `${comment.description}\n`;

  if (comment.suggestion) {
    body += `\n\`\`\`suggestion\n${comment.suggestion}\n\`\`\`\n`;
  }

  body += `\n---\n*${REVIEW_MARKER}*\n`;
  return body;
}
