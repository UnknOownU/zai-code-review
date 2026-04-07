import { describe, expect, test, vi } from 'vitest';

vi.mock('@actions/core', () => ({
  info: vi.fn(),
  debug: vi.fn(),
  warning: vi.fn(),
}));

import { chunkDiff, estimateTokens } from './chunker';

describe('chunkDiff', () => {
  test('returns no chunks for an empty diff', () => {
    expect(chunkDiff('')).toEqual({ chunks: [], wasSplit: false });
  });

  test('returns one chunk when diff is under the size limit', () => {
    const diff = '@@ -1,1 +1,2 @@\n-const a = 1;\n+const a = 2;';

    expect(chunkDiff(diff, 500)).toEqual({ chunks: [diff], wasSplit: false });
  });

  test('splits large diffs at hunk boundaries', () => {
    const hunkOne = ['@@ -1,2 +1,3 @@', ' const first = 1;', '+const second = 2;', ' return first + second;'].join('\n');
    const hunkTwo = ['@@ -20,2 +20,3 @@', ' const third = 3;', '+const fourth = 4;', ' return third + fourth;'].join('\n');
    const diff = [hunkOne, hunkTwo].join('\n');

    expect(chunkDiff(diff, hunkOne.length + 5)).toEqual({
      chunks: [hunkOne, hunkTwo],
      wasSplit: true,
    });
  });

  test('force-splits a single huge hunk by lines', () => {
    const diff = [
      '@@ -1,1 +1,8 @@',
      '+const lineOne = 1;',
      '+const lineTwo = 2;',
      '+const lineThree = 3;',
      '+const lineFour = 4;',
      '+const lineFive = 5;',
      '+const lineSix = 6;',
      '+const lineSeven = 7;',
    ].join('\n');
    const result = chunkDiff(diff, 45);

    expect(result.wasSplit).toBe(true);
    expect(result.chunks.length).toBeGreaterThan(1);
    expect(result.chunks.every(chunk => chunk.length <= 45)).toBe(true);
    expect(result.chunks.join('\n')).toBe(diff);
  });

  test('honors a custom maxChunkSize value', () => {
    const diff = [
      '@@ -1,1 +1,2 @@',
      '+const alpha = 1;',
      '@@ -10,1 +10,2 @@',
      '+const beta = 2;',
    ].join('\n');

    const largeLimit = chunkDiff(diff, 200);
    const smallLimit = chunkDiff(diff, 30);

    expect(largeLimit).toEqual({ chunks: [diff], wasSplit: false });
    expect(smallLimit.wasSplit).toBe(true);
    expect(smallLimit.chunks.length).toBeGreaterThan(1);
  });
});

describe('estimateTokens', () => {
  test('returns zero for empty text', () => {
    expect(estimateTokens('')).toBe(0);
  });

  test('estimates 100 characters as 25 tokens', () => {
    expect(estimateTokens('a'.repeat(100))).toBe(25);
  });

  test('rounds up fractional token counts', () => {
    expect(estimateTokens('a'.repeat(101))).toBe(26);
  });
});
