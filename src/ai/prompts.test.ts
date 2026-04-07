import { describe, expect, test, vi } from 'vitest';

vi.mock('@actions/core', () => ({
  info: vi.fn(),
  debug: vi.fn(),
  warning: vi.fn(),
  error: vi.fn(),
}));

import { getDefaultSystemPrompt, buildFileReviewPrompt, buildSummaryPrompt } from './prompts';

describe('getDefaultSystemPrompt', () => {
  test('injects language instruction for non-English language (ja)', () => {
    const prompt = getDefaultSystemPrompt('ja');
    expect(prompt).toContain('ja');
    expect(prompt).not.toContain('français');
    expect(prompt).not.toContain('Tu DOIS');
    expect(prompt).toContain('You MUST write all your review comments');
  });

  test('omits language instruction for English (en)', () => {
    const prompt = getDefaultSystemPrompt('en');
    expect(prompt).not.toContain('You MUST write all your review comments');
    expect(prompt).not.toContain('You MUST write all responses in English');
    expect(prompt).toContain('You are Reviewer');
  });

  test('injects language instruction for French (fr)', () => {
    const prompt = getDefaultSystemPrompt('fr');
    expect(prompt).toContain('fr');
    expect(prompt).toContain('You MUST write all your review comments');
    expect(prompt).not.toContain('Tu DOIS');
  });
});

describe('buildFileReviewPrompt', () => {
  test('includes language instruction in system prompt for German (de)', () => {
    const { system } = buildFileReviewPrompt('test.ts', 'diff content', '', 'de');
    expect(system).toContain('de');
    expect(system).toContain('You MUST write all your review comments');
  });

  test('omits language instruction when custom system prompt is provided', () => {
    const { system } = buildFileReviewPrompt('test.ts', 'diff', 'Custom prompt override', 'de');
    expect(system).toBe('Custom prompt override');
  });
});

describe('buildSummaryPrompt', () => {
  test('includes language instruction for Chinese (zh)', () => {
    const { system } = buildSummaryPrompt(
      'PR Title',
      [{ path: 'a.ts', additions: 5, deletions: 2, findingsCount: 1 }],
      'Some findings',
      'zh',
    );
    expect(system).toContain('zh');
    expect(system).toContain('You MUST write all your review comments');
  });

  test('omits language instruction for English (en)', () => {
    const { system } = buildSummaryPrompt(
      'PR Title',
      [{ path: 'a.ts', additions: 5, deletions: 2, findingsCount: 0 }],
      'No issues',
      'en',
    );
    expect(system).not.toContain('You MUST write all your review comments');
    expect(system).not.toContain('You MUST write all responses in English');
  });
});
