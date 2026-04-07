import { describe, expect, it, vi } from 'vitest';

vi.mock('@actions/core', () => ({
  debug: vi.fn(),
  error: vi.fn(),
  info: vi.fn(),
  warning: vi.fn(),
}));

import { Category, type ReviewComment, Severity } from '../review/types';
import { canAutofix, detectForkPR, enhanceSuggestionComment } from './suggestions';

describe('detectForkPR', () => {
  it('returns true for fork pull requests', () => {
    expect(
      detectForkPR({
        pull_request: {
          head: {
            repo: {
              fork: true,
            },
          },
        },
      })
    ).toBe(true);
  });

  it('returns false for non-fork pull requests', () => {
    expect(
      detectForkPR({
        pull_request: {
          head: {
            repo: {
              fork: false,
            },
          },
        },
      })
    ).toBe(false);
  });

  it('returns false for nullish payloads', () => {
    expect(detectForkPR(null)).toBe(false);
    expect(detectForkPR(undefined)).toBe(false);
  });
});

describe('canAutofix', () => {
  it('downgrades commit mode to suggest on fork pull requests', () => {
    expect(canAutofix('commit', true)).toEqual({
      mode: 'suggest',
      reason: 'Fork PRs cannot use commit mode. Using suggestion mode instead.',
    });
  });

  it('allows commit mode on non-fork pull requests', () => {
    expect(canAutofix('commit', false)).toEqual({ mode: 'commit' });
  });

  it('keeps disabled mode disabled', () => {
    expect(canAutofix('disabled', false)).toEqual({ mode: 'disabled' });
  });

  it('keeps suggest mode enabled', () => {
    expect(canAutofix('suggest', true)).toEqual({ mode: 'suggest' });
  });
});

describe('enhanceSuggestionComment', () => {
  const baseComment: ReviewComment = {
    path: 'src/example.ts',
    line: 12,
    body: 'Example comment',
    severity: Severity.Info,
    category: Category.Improvement,
    title: 'Use safer fallback',
    description: 'Prefer a default value here.',
  };

  it('formats GitHub suggestion blocks when a suggestion exists', () => {
    const output = enhanceSuggestionComment({
      ...baseComment,
      suggestion: 'const value = input ?? defaultValue;',
    });

    expect(output).toContain('```suggestion');
    expect(output).toBe('```suggestion\nconst value = input ?? defaultValue;\n```');
  });

  it('returns an empty string when no suggestion exists', () => {
    expect(enhanceSuggestionComment({ ...baseComment, suggestion: '' })).toBe('');
  });
});
