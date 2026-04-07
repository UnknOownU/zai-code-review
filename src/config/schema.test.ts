import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@actions/core', () => ({
  info: vi.fn(),
  debug: vi.fn(),
  warning: vi.fn(),
}));

vi.mock('@actions/github', () => ({}));

import * as core from '@actions/core';

import { validateConfig } from './schema';

describe('validateConfig', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns only allowed keys with correct types', () => {
    expect(
      validateConfig({
        language: 'ja',
        max_files: 10,
        max_comments: 25,
        exclude_patterns: ['dist/**', '*.snap'],
        auto_approve: false,
        model: 'glm-5.1',
        system_prompt: 'Focus on bugs',
        enable_thinking: true,
        autofix_mode: 'suggest',
        incremental: true,
      }),
    ).toEqual({
      language: 'ja',
      max_files: 10,
      max_comments: 25,
      exclude_patterns: ['dist/**', '*.snap'],
      auto_approve: false,
      model: 'glm-5.1',
      system_prompt: 'Focus on bugs',
      enable_thinking: true,
      autofix_mode: 'suggest',
      incremental: true,
    });
  });

  it('strips forbidden keys and logs a security warning', () => {
    expect(validateConfig({ api_key: 'secret', language: 'en' })).toEqual({ language: 'en' });
    expect(core.warning).toHaveBeenCalledWith('Security: config key api_key is not allowed');
  });

  it('warns on unknown keys and ignores invalid types', () => {
    expect(validateConfig({ unknown_flag: true, max_files: '10', exclude_patterns: ['src/**', 1] })).toEqual({});
    expect(core.warning).toHaveBeenCalledWith('Unknown config key: unknown_flag — ignored');
  });

  it('returns an empty object for non-object input', () => {
    expect(validateConfig('language: ja')).toEqual({});
    expect(validateConfig(null)).toEqual({});
    expect(validateConfig(['language'])).toEqual({});
  });
});
