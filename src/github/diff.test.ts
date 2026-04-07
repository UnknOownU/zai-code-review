import { describe, expect, test, vi } from 'vitest';

vi.mock('@actions/core', () => ({
  info: vi.fn(),
  debug: vi.fn(),
  warning: vi.fn(),
}));

import type { FileDiff } from '../review/types';
import { filterFiles, isFileExcluded, parseDiffHunks } from './diff';

function createFileDiff(overrides: Partial<FileDiff> = {}): FileDiff {
  return {
    path: 'src/example.ts',
    diff: '@@ -1,1 +1,1 @@\n-oldValue\n+newValue',
    hunks: [],
    additions: 1,
    deletions: 1,
    isBinary: false,
    status: 'modified',
    ...overrides,
  };
}

describe('parseDiffHunks', () => {
  test('returns an empty array for empty diff content', () => {
    expect(parseDiffHunks('')).toEqual([]);
  });

  test('parses a single hunk with added lines', () => {
    const diff = ['@@ -10,2 +10,3 @@', ' const a = 1;', '+const b = 2;', ' return a + b;'].join('\n');
    const hunks = parseDiffHunks(diff);

    expect(hunks).toHaveLength(1);
    expect(hunks[0].lines).toEqual([
      { type: 'context', content: 'const a = 1;', position: 2, newLineNumber: 10, oldLineNumber: 10 },
      { type: 'added', content: 'const b = 2;', position: 3, newLineNumber: 11 },
      { type: 'context', content: 'return a + b;', position: 4, newLineNumber: 12, oldLineNumber: 11 },
    ]);
  });

  test('parses a single hunk with removed lines', () => {
    const diff = ['@@ -5,2 +5,1 @@', '-const legacy = true;', ' const enabled = true;'].join('\n');
    const hunks = parseDiffHunks(diff);

    expect(hunks[0].lines).toEqual([
      { type: 'removed', content: 'const legacy = true;', position: 2, oldLineNumber: 5 },
      { type: 'context', content: 'const enabled = true;', position: 3, newLineNumber: 5, oldLineNumber: 6 },
    ]);
  });

  test('keeps diff positions increasing across multiple hunks', () => {
    const diff = [
      '@@ -1,1 +1,1 @@',
      '-oldName',
      '+newName',
      '@@ -10,1 +10,2 @@',
      ' const current = value;',
      '+return current;',
    ].join('\n');
    const hunks = parseDiffHunks(diff);

    expect(hunks).toHaveLength(2);
    expect(hunks[0].lines[0].position).toBe(2);
    expect(hunks[0].lines[1].position).toBe(3);
    expect(hunks[1].lines[0].position).toBe(5);
    expect(hunks[1].lines[1].position).toBe(6);
  });

  test('sets both old and new line numbers for context lines', () => {
    const diff = ['@@ -20,2 +20,2 @@', ' const start = 1;', ' const end = 2;'].join('\n');
    const lines = parseDiffHunks(diff)[0].lines;

    expect(lines).toEqual([
      { type: 'context', content: 'const start = 1;', position: 2, newLineNumber: 20, oldLineNumber: 20 },
      { type: 'context', content: 'const end = 2;', position: 3, newLineNumber: 21, oldLineNumber: 21 },
    ]);
  });

  test('parses mixed additions removals and context in one hunk', () => {
    const diff = [
      '@@ -30,3 +30,4 @@',
      ' const total = items.length;',
      '-const limit = 5;',
      '+const limit = Math.min(5, maxItems);',
      '+const hasItems = total > 0;',
      ' return limit;',
    ].join('\n');
    const lines = parseDiffHunks(diff)[0].lines;

    expect(lines).toEqual([
      { type: 'context', content: 'const total = items.length;', position: 2, newLineNumber: 30, oldLineNumber: 30 },
      { type: 'removed', content: 'const limit = 5;', position: 3, oldLineNumber: 31 },
      { type: 'added', content: 'const limit = Math.min(5, maxItems);', position: 4, newLineNumber: 31 },
      { type: 'added', content: 'const hasItems = total > 0;', position: 5, newLineNumber: 32 },
      { type: 'context', content: 'return limit;', position: 6, newLineNumber: 33, oldLineNumber: 32 },
    ]);
  });
});

describe('isFileExcluded', () => {
  test('matches exact file names', () => {
    expect(isFileExcluded('package-lock.json', ['package-lock.json'])).toBe(true);
  });

  test('matches extension wildcards', () => {
    expect(isFileExcluded('dist/bundle.min.js', ['*.min.js'])).toBe(true);
  });

  test('matches directory wildcards', () => {
    expect(isFileExcluded('tests/foo.ts', ['tests/*'])).toBe(true);
  });

  test('matches nested paths using endsWith for plain file names', () => {
    expect(isFileExcluded('sub/yarn.lock', ['yarn.lock'])).toBe(true);
  });

  test('returns false for non-matching patterns', () => {
    expect(isFileExcluded('src/index.ts', ['*.min.js', 'tests/*'])).toBe(false);
  });

  test('skips empty patterns', () => {
    expect(isFileExcluded('src/index.ts', [' ', ''])).toBe(false);
  });

  test('matches glob patterns case-insensitively', () => {
    expect(isFileExcluded('dist/bundle.min.js', ['DIST/*.MIN.JS'])).toBe(true);
  });
});

describe('filterFiles', () => {
  test('filters binary files, empty diffs, excluded files, removed files, respects maxFiles, and keeps valid files', () => {
    const files: FileDiff[] = [
      createFileDiff({ path: 'assets/logo.png', isBinary: true }),
      createFileDiff({ path: 'src/no-diff.ts', diff: '' }),
      createFileDiff({ path: 'dist/bundle.min.js' }),
      createFileDiff({ path: 'src/deleted.ts', status: 'removed' }),
      createFileDiff({ path: 'src/keep-one.ts' }),
      createFileDiff({ path: 'src/keep-two.ts' }),
      createFileDiff({ path: 'src/keep-three.ts' }),
    ];

    expect(filterFiles(files, ['*.min.js'], 2)).toEqual([
      createFileDiff({ path: 'src/keep-one.ts' }),
      createFileDiff({ path: 'src/keep-two.ts' }),
    ]);
  });

  test('passes through valid files when nothing is filtered', () => {
    const files = [createFileDiff({ path: 'src/a.ts' }), createFileDiff({ path: 'src/b.ts' })];

    expect(filterFiles(files, [], 10)).toEqual(files);
  });
});
