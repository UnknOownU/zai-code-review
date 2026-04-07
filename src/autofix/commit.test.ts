import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@actions/core', () => ({
  debug: vi.fn(),
  error: vi.fn(),
  info: vi.fn(),
  warning: vi.fn(),
}));

import * as core from '@actions/core';

import { Category, type ReviewComment, Severity } from '../review/types';
import { applySuggestions, buildSuggestionPatches, commitSuggestions } from './commit';

function encodeContent(content: string): string {
  return Buffer.from(content, 'utf-8').toString('base64');
}

function createComment(overrides: Partial<ReviewComment> = {}): ReviewComment {
  return {
    path: 'src/example.ts',
    line: 2,
    body: 'Replace this line',
    severity: Severity.Info,
    category: Category.Improvement,
    title: 'Suggested change',
    description: 'Use the safer variant.',
    ...overrides,
  };
}

const mockOctokit = {
  repos: {
    getContent: vi.fn(),
  },
  git: {
    createTree: vi.fn(),
    createCommit: vi.fn(),
    updateRef: vi.fn(),
  },
};

beforeEach(() => {
  vi.clearAllMocks();
});

describe('commitSuggestions protected branch guard', () => {
  it.each(['main', 'master', 'develop', 'release/1.2.3'])('rejects protected branch %s', async branch => {
    await expect(commitSuggestions(mockOctokit as never, 'owner', 'repo', branch, [], 'head-sha')).rejects.toThrow(
      'protected branch'
    );
  });

  it('allows non-protected branches', async () => {
    await expect(commitSuggestions(mockOctokit as never, 'owner', 'repo', 'feature/x', [], 'head-sha')).resolves.toEqual({
      committed: false,
      reason: 'No suggestions to apply',
    });
  });
});

describe('commitSuggestions', () => {
  it('throws for main branch', async () => {
    await expect(commitSuggestions(mockOctokit as never, 'owner', 'repo', 'main', [], 'head-sha')).rejects.toThrow(
      'protected'
    );
  });

  it('creates one tree, one commit, and one ref update for multiple files', async () => {
    mockOctokit.repos.getContent.mockImplementation(({ path }: { path: string }) => {
      const sourceByPath: Record<string, string> = {
        'src/one.ts': 'line 1\nline 2\nline 3',
        'src/two.ts': 'alpha\nbeta\ngamma',
        'src/three.ts': 'first\nsecond\nthird',
      };

      return Promise.resolve({
        data: {
          type: 'file',
          content: encodeContent(sourceByPath[path]),
          encoding: 'base64',
        },
      });
    });
    mockOctokit.git.createTree.mockResolvedValue({ data: { sha: 'tree-sha' } });
    mockOctokit.git.createCommit.mockResolvedValue({ data: { sha: 'commit-sha' } });
    mockOctokit.git.updateRef.mockResolvedValue({});

    const comments = [
      createComment({ path: 'src/one.ts', line: 2, suggestion: 'updated line 2' }),
      createComment({ path: 'src/two.ts', line: 1, suggestion: 'updated alpha' }),
      createComment({ path: 'src/three.ts', line: 3, suggestion: 'updated third' }),
    ];

    await expect(
      commitSuggestions(mockOctokit as never, 'owner', 'repo', 'feature/autofix', comments, 'head-sha', 'batch message')
    ).resolves.toEqual({ committed: true, sha: 'commit-sha' });

    expect(mockOctokit.repos.getContent).toHaveBeenCalledTimes(3);
    expect(mockOctokit.git.createTree).toHaveBeenCalledTimes(1);
    expect(mockOctokit.git.createCommit).toHaveBeenCalledTimes(1);
    expect(mockOctokit.git.updateRef).toHaveBeenCalledTimes(1);

    expect(mockOctokit.git.createTree).toHaveBeenCalledWith({
      owner: 'owner',
      repo: 'repo',
      base_tree: 'head-sha',
      tree: [
        { path: 'src/one.ts', mode: '100644', type: 'blob', content: 'line 1\nupdated line 2\nline 3' },
        { path: 'src/two.ts', mode: '100644', type: 'blob', content: 'updated alpha\nbeta\ngamma' },
        { path: 'src/three.ts', mode: '100644', type: 'blob', content: 'first\nsecond\nupdated third' },
      ],
    });
    expect(mockOctokit.git.createCommit).toHaveBeenCalledWith({
      owner: 'owner',
      repo: 'repo',
      message: 'batch message',
      tree: 'tree-sha',
      parents: ['head-sha'],
    });
    expect(mockOctokit.git.updateRef).toHaveBeenCalledWith({
      owner: 'owner',
      repo: 'repo',
      ref: 'heads/feature/autofix',
      sha: 'commit-sha',
    });
  });

  it('returns conflict when updateRef receives a 409', async () => {
    mockOctokit.repos.getContent.mockResolvedValue({
      data: {
        type: 'file',
        content: encodeContent('before\nafter'),
        encoding: 'base64',
      },
    });
    mockOctokit.git.createTree.mockResolvedValue({ data: { sha: 'tree-sha' } });
    mockOctokit.git.createCommit.mockResolvedValue({ data: { sha: 'commit-sha' } });
    mockOctokit.git.updateRef.mockRejectedValue({ status: 409 });

    await expect(
      commitSuggestions(
        mockOctokit as never,
        'owner',
        'repo',
        'feature/autofix',
        [createComment({ suggestion: 'replacement' })],
        'head-sha'
      )
    ).resolves.toEqual({ committed: false, reason: 'conflict' });

    expect(core.warning).toHaveBeenCalledWith(
      'Commit conflict on feature/autofix — suggestions not applied. Resolve manually.'
    );
  });

  it('returns early when no suggestions exist', async () => {
    await expect(
      commitSuggestions(
        mockOctokit as never,
        'owner',
        'repo',
        'feature/autofix',
        [createComment(), createComment({ line: 3, suggestion: '   ' })],
        'head-sha'
      )
    ).resolves.toEqual({ committed: false, reason: 'No suggestions to apply' });

    expect(mockOctokit.repos.getContent).not.toHaveBeenCalled();
    expect(mockOctokit.git.createTree).not.toHaveBeenCalled();
  });
});

describe('applySuggestions', () => {
  it('replaces the targeted line', () => {
    expect(applySuggestions('one\ntwo\nthree\nfour', [{ path: 'src/example.ts', startLine: 3, endLine: 3, newContent: 'updated' }])).toBe(
      'one\ntwo\nupdated\nfour'
    );
  });
});

describe('buildSuggestionPatches', () => {
  it('filters out comments without suggestions', () => {
    expect(
      buildSuggestionPatches([
        createComment({ path: 'src/one.ts', line: 2, suggestion: 'keep this' }),
        createComment({ path: 'src/two.ts', line: 4 }),
        createComment({ path: 'src/three.ts', line: 6, suggestion: '   ' }),
      ])
    ).toEqual([
      {
        path: 'src/one.ts',
        startLine: 2,
        endLine: 2,
        newContent: 'keep this',
      },
    ]);
  });
});
