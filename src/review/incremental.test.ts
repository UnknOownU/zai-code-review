import { describe, expect, test, vi } from 'vitest';

vi.mock('@actions/core', () => ({
  info: vi.fn(),
  warning: vi.fn(),
  debug: vi.fn(),
  error: vi.fn(),
}));

import type { Octokit } from '@octokit/rest';
import { embedReviewedSha, extractReviewedSha, getIncrementalDiff } from './incremental';

describe('embedReviewedSha', () => {
  test('roundtrips embedded SHA markers', () => {
    const body = embedReviewedSha('Summary text', 'abc123def');

    expect(extractReviewedSha(body)).toBe('abc123def');
  });
});

describe('extractReviewedSha', () => {
  test('returns null when no SHA marker exists', () => {
    expect(extractReviewedSha('No SHA here')).toBeNull();
  });

  test('returns null for malformed SHA markers', () => {
    expect(extractReviewedSha('Summary\n\n<!-- zai-last-reviewed-sha: definitely-not-a-sha -->')).toBeNull();
  });
});

describe('getIncrementalDiff', () => {
  test('maps compareCommits files into FileDiff entries', async () => {
    const compareCommits = vi.fn().mockResolvedValue({
      data: {
        files: [
          {
            filename: 'src/added.ts',
            patch: '@@ -0,0 +1 @@\n+export const added = true;',
            additions: 1,
            deletions: 0,
            status: 'added',
          },
          {
            filename: 'assets/logo.png',
            patch: undefined,
            additions: 0,
            deletions: 0,
            status: 'modified',
          },
        ],
      },
    });

    const octokit = {
      repos: { compareCommits },
    } as unknown as Octokit;

    await expect(getIncrementalDiff(octokit, 'owner', 'repo', 'abc1234', 'def5678')).resolves.toEqual([
      {
        path: 'src/added.ts',
        diff: '@@ -0,0 +1 @@\n+export const added = true;',
        hunks: [
          {
            oldStart: 0,
            oldLines: 0,
            newStart: 1,
            newLines: 1,
            content: '+export const added = true;',
            lines: [
              {
                type: 'added',
                content: 'export const added = true;',
                position: 2,
                newLineNumber: 1,
              },
            ],
          },
        ],
        additions: 1,
        deletions: 0,
        status: 'added',
        isBinary: false,
      },
      {
        path: 'assets/logo.png',
        diff: '',
        hunks: [],
        additions: 0,
        deletions: 0,
        status: 'modified',
        isBinary: true,
      },
    ]);
  });

  test('returns null when compareCommits reports a missing base SHA', async () => {
    const octokit = {
      repos: {
        compareCommits: vi.fn().mockRejectedValue({ status: 404 }),
      },
    } as unknown as Octokit;

    await expect(getIncrementalDiff(octokit, 'owner', 'repo', 'abc1234', 'def5678')).resolves.toBeNull();
  });

  test('returns null when compareCommits reports an invalid comparison', async () => {
    const octokit = {
      repos: {
        compareCommits: vi.fn().mockRejectedValue({ status: 422 }),
      },
    } as unknown as Octokit;

    await expect(getIncrementalDiff(octokit, 'owner', 'repo', 'abc1234', 'def5678')).resolves.toBeNull();
  });
});
