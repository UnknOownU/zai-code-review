import { Octokit } from '@octokit/rest';
import { ReviewComment } from '../review/types';
/**
 * Post a single inline review comment on a specific line of a file.
 */
export declare function postInlineComment(octokit: Octokit, owner: string, repo: string, pullNumber: number, commitId: string, comment: ReviewComment): Promise<number | null>;
/**
 * Create a full review with all comments grouped together.
 * This is the preferred approach - similar to GitHub Copilot.
 */
export declare function createReview(octokit: Octokit, owner: string, repo: string, pullNumber: number, commitId: string, comments: ReviewComment[], event: 'APPROVE' | 'REQUEST_CHANGES' | 'COMMENT', body: string): Promise<number | null>;
/**
 * Post the global summary comment on the PR (as an issue comment).
 */
export declare function postSummaryComment(octokit: Octokit, owner: string, repo: string, pullNumber: number, summaryBody: string): Promise<number | null>;
/**
 * Delete old review comments created by this action (identified by the marker).
 * This prevents duplicate comments on subsequent pushes.
 */
export declare function cleanOldComments(octokit: Octokit, owner: string, repo: string, pullNumber: number): Promise<void>;
//# sourceMappingURL=comments.d.ts.map