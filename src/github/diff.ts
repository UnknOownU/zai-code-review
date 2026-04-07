import * as core from '@actions/core';
import { Octokit } from '@octokit/rest';
import { FileDiff, DiffHunk, DiffLine } from '../review/types';

/**
 * Fetch all files changed in a pull request with pagination.
 */
export async function fetchPullRequestFiles(
  octokit: Octokit,
  owner: string,
  repo: string,
  pullNumber: number
): Promise<FileDiff[]> {
  core.info(`Fetching PR files for ${owner}/${repo}#${pullNumber}...`);

  const files: FileDiff[] = [];
  let page = 1;
  const perPage = 100;

  while (true) {
    const response = await octokit.pulls.listFiles({
      owner,
      repo,
      pull_number: pullNumber,
      per_page: perPage,
      page,
    });

    for (const file of response.data) {
      const isBinary = !file.patch && file.status !== 'removed';

      files.push({
        path: file.filename,
        diff: file.patch || '',
        hunks: isBinary ? [] : parseDiffHunks(file.patch || ''),
        additions: file.additions,
        deletions: file.deletions,
        isBinary,
        status: file.status,
        sha: file.sha ?? undefined,
      });
    }

    if (response.data.length < perPage) {
      break;
    }
    page++;
  }

  core.info(`Fetched ${files.length} files from PR.`);
  return files;
}

/**
 * Parse unified diff content into structured hunks with line mappings.
 */
export function parseDiffHunks(diffContent: string): DiffHunk[] {
  if (!diffContent) {
    return [];
  }

  const hunks: DiffHunk[] = [];
  const lines = diffContent.split('\n');

  let currentHunk: DiffHunk | null = null;
  let newLineNum = 0;
  let oldLineNum = 0;
  let position = 0;

  for (const line of lines) {
    const hunkMatch = line.match(/^@@@? -(\d+)(?:,(\d+))? \+(\d+)(?:,(\d+))? @@/);
    if (hunkMatch) {
      if (currentHunk) {
        hunks.push(currentHunk);
      }

      const oldStart = parseInt(hunkMatch[1], 10);
      const newStart = parseInt(hunkMatch[3], 10);

      currentHunk = {
        oldStart,
        oldLines: parseInt(hunkMatch[2] || '1', 10),
        newStart,
        newLines: parseInt(hunkMatch[4] || '1', 10),
        content: '',
        lines: [],
      };

      oldLineNum = oldStart;
      newLineNum = newStart;
      position++;
      continue;
    }

    if (!currentHunk) {
      continue;
    }

    position++;
    currentHunk.content += (currentHunk.content ? '\n' : '') + line;

    let diffLine: DiffLine;

    if (line.startsWith('+')) {
      diffLine = {
        type: 'added',
        content: line.substring(1),
        position,
        newLineNumber: newLineNum,
      };
      newLineNum++;
    } else if (line.startsWith('-')) {
      diffLine = {
        type: 'removed',
        content: line.substring(1),
        position,
        oldLineNumber: oldLineNum,
      };
      oldLineNum++;
    } else if (line.startsWith(' ')) {
      diffLine = {
        type: 'context',
        content: line.substring(1),
        position,
        newLineNumber: newLineNum,
        oldLineNumber: oldLineNum,
      };
      newLineNum++;
      oldLineNum++;
    } else {
      diffLine = {
        type: 'context',
        content: line,
        position,
      };
    }

    currentHunk.lines.push(diffLine);
  }

  if (currentHunk) {
    hunks.push(currentHunk);
  }

  return hunks;
}

/**
 * Check if a file path matches any of the exclude patterns.
 * Supports glob-like patterns: *.ext, prefix/*, exact match.
 */
export function isFileExcluded(filePath: string, excludePatterns: string[]): boolean {
  for (const pattern of excludePatterns) {
    const trimmed = pattern.trim();
    if (!trimmed) continue;

    if (trimmed.startsWith('*.')) {
      if (filePath.endsWith(trimmed.substring(1))) {
        return true;
      }
    } else if (trimmed.endsWith('.*')) {
      const prefix = trimmed.slice(0, -1);
      const fileName = filePath.split('/').pop() || '';
      if (fileName.startsWith(prefix)) {
        return true;
      }
    } else if (trimmed.includes('*')) {
      const regexStr = '^' + trimmed
        .replace(/[.+^${}()|[\]\\]/g, '\\$&')
        .replace(/\*/g, '.*') + '$';
      const regex = new RegExp(regexStr, 'i');
      if (regex.test(filePath)) {
        return true;
      }
    } else {
      if (filePath === trimmed || filePath.endsWith('/' + trimmed)) {
        return true;
      }
    }
  }
  return false;
}

/**
 * Filter files based on exclude patterns and limit.
 */
export function filterFiles(
  files: FileDiff[],
  excludePatterns: string[],
  maxFiles: number
): FileDiff[] {
  const filtered = files.filter(file => {
    if (file.isBinary) {
      core.debug(`Skipping binary file: ${file.path}`);
      return false;
    }

    if (!file.diff) {
      core.debug(`Skipping file with no diff: ${file.path}`);
      return false;
    }

    if (isFileExcluded(file.path, excludePatterns)) {
      core.debug(`Skipping excluded file: ${file.path}`);
      return false;
    }

    if (file.status === 'removed') {
      core.debug(`Skipping removed file: ${file.path}`);
      return false;
    }

    return true;
  });

  const limited = filtered.slice(0, maxFiles);

  if (limited.length < filtered.length) {
    core.info(`Limited files from ${filtered.length} to ${maxFiles} (max_files setting).`);
  }

  core.info(`Will review ${limited.length} files.`);
  return limited;
}
