import type { Octokit } from '@octokit/rest';
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@actions/core', () => ({
  info: vi.fn(),
  debug: vi.fn(),
  warning: vi.fn(),
}));

vi.mock('@actions/github', () => ({}));

import * as core from '@actions/core';

import { readRepoConfig, readRepoInstructions } from './reader';

function createOctokitMock(getContent: ReturnType<typeof vi.fn>): Octokit {
  return {
    repos: {
      getContent,
    },
  } as unknown as Octokit;
}

function encode(content: string): string {
  return Buffer.from(content, 'utf-8').toString('base64');
}

describe('readRepoConfig', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('parses valid YAML config from the base branch', async () => {
    const getContent = vi.fn().mockResolvedValue({
      data: {
        type: 'file',
        content: encode('language: ja\nmax_files: 10\n'),
        encoding: 'base64',
      },
    });

    const config = await readRepoConfig(createOctokitMock(getContent), 'owner', 'repo', 'main');

    expect(config).toEqual({ language: 'ja', max_files: 10 });
    expect(getContent).toHaveBeenCalledWith({
      owner: 'owner',
      repo: 'repo',
      path: '.github/zai-review.yaml',
      ref: 'main',
    });
  });

  it('returns an empty object on 404 without warning', async () => {
    const getContent = vi.fn().mockRejectedValue({ status: 404 });

    await expect(readRepoConfig(createOctokitMock(getContent), 'owner', 'repo', 'main')).resolves.toEqual({});
    expect(core.warning).not.toHaveBeenCalled();
  });

  it('strips forbidden keys and logs a warning', async () => {
    const getContent = vi.fn().mockResolvedValue({
      data: {
        type: 'file',
        content: encode('language: en\napi_key: secret\n'),
        encoding: 'base64',
      },
    });

    const config = await readRepoConfig(createOctokitMock(getContent), 'owner', 'repo', 'main');

    expect(config).toEqual({ language: 'en' });
    expect(core.warning).toHaveBeenCalledWith('Security: config key api_key is not allowed');
  });

  it('returns an empty object when the config file exceeds 10KB', async () => {
    const oversized = `language: en\nsystem_prompt: "${'a'.repeat(10 * 1024)}"`;
    const getContent = vi.fn().mockResolvedValue({
      data: {
        type: 'file',
        content: encode(oversized),
        encoding: 'base64',
      },
    });

    const config = await readRepoConfig(createOctokitMock(getContent), 'owner', 'repo', 'main');

    expect(config).toEqual({});
    expect(core.warning).toHaveBeenCalledWith('Skipping .github/zai-review.yaml: file exceeds 10240 bytes');
  });
});

describe('readRepoInstructions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns markdown instructions as a string', async () => {
    const getContent = vi.fn().mockResolvedValue({
      data: {
        type: 'file',
        content: encode('# Review Rules\nFocus on security only.\n'),
        encoding: 'base64',
      },
    });

    const instructions = await readRepoInstructions(createOctokitMock(getContent), 'owner', 'repo', 'main');

    expect(instructions).toContain('Focus on security only.');
    expect(getContent).toHaveBeenCalledWith({
      owner: 'owner',
      repo: 'repo',
      path: '.github/zai-review-instructions.md',
      ref: 'main',
    });
  });

  it('returns an empty string on 404 without warning', async () => {
    const getContent = vi.fn().mockRejectedValue({ status: 404 });

    await expect(readRepoInstructions(createOctokitMock(getContent), 'owner', 'repo', 'main')).resolves.toBe('');
    expect(core.warning).not.toHaveBeenCalled();
  });
});
