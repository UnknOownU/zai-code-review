import * as core from '@actions/core';
import type { Octokit } from '@octokit/rest';
import { parseDiffHunks } from '../github/diff';
import type { FileDiff } from './types';

const SHA_TAG = '<!-- zai-last-reviewed-sha:';
const SHA_TAG_END = '-->';
const SHA_PATTERN = /^[0-9a-f]{7,40}$/i;
const SHA_REGEX = /<!-- zai-last-reviewed-sha:\s*([^\s]+)\s*-->/i;

export function embedReviewedSha(commentBody: string, sha: string): string {
  const marker = `${SHA_TAG} ${sha} ${SHA_TAG_END}`;

  return commentBody ? `${commentBody}\n\n${marker}` : marker;
}

export function extractReviewedSha(commentBody: string): string | null {
  const match = commentBody.match(SHA_REGEX);
  const sha = match?.[1]?.trim();

  if (!sha || !SHA_PATTERN.test(sha)) {
    return null;
  }

  return sha;
}

export async function getIncrementalDiff(
  octokit: Octokit,
  owner: string,
  repo: string,
  lastSha: string,
  headSha: string
): Promise<FileDiff[] | null> {
  if (!SHA_PATTERN.test(lastSha) || !SHA_PATTERN.test(headSha)) {
    core.warning('Skipping incremental diff because one or both SHAs are invalid.');
    return null;
  }

  try {
    const response = await octokit.repos.compareCommits({
      owner,
      repo,
      base: lastSha,
      head: headSha,
    });

    const files = response.data.files ?? [];

    return files.map(file => {
      const diff = file.patch ?? '';
      const isBinary = !file.patch && file.status !== 'removed';

      return {
        path: file.filename,
        diff,
        hunks: isBinary ? [] : parseDiffHunks(diff),
        additions: file.additions,
        deletions: file.deletions,
        status: file.status ?? 'modified',
        isBinary,
      };
    });
  } catch (error: unknown) {
    const status = getErrorStatus(error);

    if (status === 404 || status === 422) {
      return null;
    }

    core.warning(`Failed to fetch incremental diff: ${getErrorMessage(error)}`);
    return null;
  }
}

function getErrorStatus(error: unknown): number | undefined {
  if (typeof error !== 'object' || error === null || !('status' in error)) {
    return undefined;
  }

  const { status } = error;
  return typeof status === 'number' ? status : undefined;
}

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }

  if (typeof error !== 'object' || error === null || !('message' in error)) {
    return 'Unknown error';
  }

  const { message } = error;
  return typeof message === 'string' ? message : 'Unknown error';
}
