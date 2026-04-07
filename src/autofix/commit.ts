import * as core from '@actions/core';
import type { Octokit } from '@octokit/rest';

import type { ReviewComment } from '../review/types';

const PROTECTED_BRANCHES = ['main', 'master', 'develop', 'production', 'prod', 'release'];
const DEFAULT_COMMIT_MESSAGE = 'Apply AI autofix suggestions';

export interface SuggestionPatch {
  path: string;
  startLine: number;
  endLine: number;
  newContent: string;
}

function isProtectedBranch(branch: string): boolean {
  return PROTECTED_BRANCHES.includes(branch.toLowerCase()) || branch.startsWith('release/');
}

function isConflictError(error: unknown): boolean {
  return typeof error === 'object' && error !== null && 'status' in error && error.status === 409;
}

function decodeBase64Content(content: string): string {
  return Buffer.from(content, 'base64').toString('utf-8');
}

function isFileContentResponse(data: unknown): data is { type: 'file'; content: string; encoding: 'base64' } {
  if (typeof data !== 'object' || data === null || Array.isArray(data)) {
    return false;
  }

  const file = data as Record<string, unknown>;

  return (
    file.type === 'file' &&
    typeof file.content === 'string' &&
    file.encoding === 'base64'
  );
}

export function buildSuggestionPatches(comments: ReviewComment[]): SuggestionPatch[] {
  return comments
    .filter(comment => typeof comment.suggestion === 'string' && comment.suggestion.trim().length > 0)
    .map(comment => ({
      path: comment.path,
      startLine: comment.line,
      endLine: comment.line,
      newContent: comment.suggestion as string,
    }));
}

export function applySuggestions(content: string, patches: SuggestionPatch[]): string {
  const lines = content.split('\n');
  const sortedPatches = [...patches].sort((left, right) => right.startLine - left.startLine);

  for (const patch of sortedPatches) {
    lines.splice(patch.startLine - 1, patch.endLine - patch.startLine + 1, ...patch.newContent.split('\n'));
  }

  return lines.join('\n');
}

export async function commitSuggestions(
  octokit: Octokit,
  owner: string,
  repo: string,
  branch: string,
  comments: ReviewComment[],
  headSha: string,
  commitMessage = DEFAULT_COMMIT_MESSAGE
): Promise<{ committed: boolean; sha?: string; reason?: string }> {
  if (isProtectedBranch(branch)) {
    throw new Error(`Cannot commit to protected branch: ${branch}`);
  }

  const patches = buildSuggestionPatches(comments);

  if (patches.length === 0) {
    return { committed: false, reason: 'No suggestions to apply' };
  }

  const patchesByPath = new Map<string, SuggestionPatch[]>();

  for (const patch of patches) {
    const existingPatches = patchesByPath.get(patch.path);
    if (existingPatches) {
      existingPatches.push(patch);
      continue;
    }

    patchesByPath.set(patch.path, [patch]);
  }

  try {
    const tree = [] as Array<{ path: string; mode: '100644'; type: 'blob'; content: string }>;

    for (const [path, filePatches] of patchesByPath) {
      const response = await octokit.repos.getContent({ owner, repo, path, ref: branch });
      const { data } = response;

      if (!isFileContentResponse(data)) {
        throw new Error(`Could not read ${path}: expected a base64-encoded file`);
      }

      const currentContent = decodeBase64Content(data.content);
      const modifiedContent = applySuggestions(currentContent, filePatches);

      tree.push({
        path,
        mode: '100644',
        type: 'blob',
        content: modifiedContent,
      });
    }

    const newTree = await octokit.git.createTree({
      owner,
      repo,
      base_tree: headSha,
      tree,
    });

    const newCommit = await octokit.git.createCommit({
      owner,
      repo,
      message: commitMessage,
      tree: newTree.data.sha,
      parents: [headSha],
    });

    await octokit.git.updateRef({
      owner,
      repo,
      ref: `heads/${branch}`,
      sha: newCommit.data.sha,
    });

    return { committed: true, sha: newCommit.data.sha };
  } catch (error) {
    if (isConflictError(error)) {
      core.warning(`Commit conflict on ${branch} — suggestions not applied. Resolve manually.`);
      return { committed: false, reason: 'conflict' };
    }

    throw error;
  }
}
