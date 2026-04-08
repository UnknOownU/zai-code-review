import { beforeEach, describe, expect, it, vi } from 'vitest';

// Mock the github/client to return a mock octokit
const mockGetContent = vi.fn();
vi.mock('../github/client', () => ({
  getOctokit: () => ({
    repos: { getContent: mockGetContent },
  }),
}));

const mockGetInput = vi.fn();
vi.mock('@actions/core', () => ({
  info: vi.fn(),
  debug: vi.fn(),
  warning: vi.fn(),
  error: vi.fn(),
  getInput: (...args: unknown[]) => mockGetInput(...args),
  setFailed: vi.fn(),
}));

vi.mock('@actions/github', () => ({
  context: {
    eventName: 'pull_request',
    repo: { owner: 'testowner', repo: 'testrepo' },
    payload: {
      pull_request: {
        number: 42,
        head: { sha: 'abc123', ref: 'feature-branch' },
        base: { ref: 'develop' },
        title: 'Test PR',
      },
    },
  },
}));

function encode(content: string): string {
  return Buffer.from(content, 'utf-8').toString('base64');
}

// Import after mocks are set up
import { parseConfig } from '../config';

describe('parseConfig merge logic', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Default: return empty for all inputs (simulating defaults)
    mockGetInput.mockImplementation((name: string) => {
      const defaults: Record<string, string> = {
        ZAI_API_KEY: 'test-key',
        GITHUB_TOKEN: 'gh-token',
      };
      return defaults[name] ?? '';
    });
    // Default: config file not found (404)
    mockGetContent.mockRejectedValue({ status: 404 });
  });

  it('uses config file language when action input is at default', async () => {
    // Config file returns language: 'ja'
    mockGetContent.mockImplementation((params: { path: string }) => {
      if (params.path === '.github/zai-review.yaml') {
        return {
          data: {
            type: 'file',
            content: encode('language: ja\n'),
            encoding: 'base64',
          },
        };
      }
      return Promise.reject({ status: 404 });
    });

    const config = await parseConfig();
    expect(config.language).toBe('ja');
  });

  it('uses explicit action input over config file', async () => {
    // Explicit language input
    mockGetInput.mockImplementation((name: string) => {
      const inputs: Record<string, string> = {
        ZAI_API_KEY: 'test-key',
        GITHUB_TOKEN: 'gh-token',
        language: 'fr',
      };
      return inputs[name] ?? '';
    });

    // Config file returns language: 'ja'
    mockGetContent.mockImplementation((params: { path: string }) => {
      if (params.path === '.github/zai-review.yaml') {
        return {
          data: {
            type: 'file',
            content: encode('language: ja\n'),
            encoding: 'base64',
          },
        };
      }
      return Promise.reject({ status: 404 });
    });

    const config = await parseConfig();
    expect(config.language).toBe('fr');
  });

  it('uses config file max_files and max_comments when inputs are default', async () => {
    mockGetContent.mockImplementation((params: { path: string }) => {
      if (params.path === '.github/zai-review.yaml') {
        return {
          data: {
            type: 'file',
            content: encode('max_files: 5\nmax_comments: 10\n'),
            encoding: 'base64',
          },
        };
      }
      return Promise.reject({ status: 404 });
    });

    const config = await parseConfig();
    expect(config.maxFiles).toBe(5);
    expect(config.maxComments).toBe(10);
  });

  it('uses config file model when ZAI_MODEL input is default', async () => {
    mockGetContent.mockImplementation((params: { path: string }) => {
      if (params.path === '.github/zai-review.yaml') {
        return {
          data: {
            type: 'file',
            content: encode('model: glm-4.7\n'),
            encoding: 'base64',
          },
        };
      }
      return Promise.reject({ status: 404 });
    });

    const config = await parseConfig();
    expect(config.zaiModel).toBe('glm-4.7');
  });

  it('loads custom instructions from instructions file', async () => {
    mockGetContent.mockImplementation((params: { path: string }) => {
      if (params.path === '.github/zai-review-instructions.md') {
        return {
          data: {
            type: 'file',
            content: encode('# Project Rules\nFocus on security.\n'),
            encoding: 'base64',
          },
        };
      }
      return Promise.reject({ status: 404 });
    });

    const config = await parseConfig();
    expect(config.customInstructions).toContain('Focus on security.');
  });

  it('does not fail when config file does not exist', async () => {
    mockGetContent.mockRejectedValue({ status: 404 });

    const config = await parseConfig();
    expect(config.language).toBe('en');
    expect(config.customInstructions).toBe('');
  });

  it('uses config file exclude_patterns when input is default', async () => {
    mockGetContent.mockImplementation((params: { path: string }) => {
      if (params.path === '.github/zai-review.yaml') {
        return {
          data: {
            type: 'file',
            content: encode('exclude_patterns:\n  - "*.generated.ts"\n  - "vendor/*"\n'),
            encoding: 'base64',
          },
        };
      }
      return Promise.reject({ status: 404 });
    });

    const config = await parseConfig();
    expect(config.excludePatterns).toContain('*.generated.ts');
    expect(config.excludePatterns).toContain('vendor/*');
  });

  it('reads config from base branch, not head branch', async () => {
    mockGetContent.mockRejectedValue({ status: 404 });

    await parseConfig();

    // Verify all getContent calls use the base ref ('develop')
    const calls = mockGetContent.mock.calls;
    for (const call of calls) {
      expect(call[0].ref).toBe('develop');
    }
  });

  it('uses config file system_prompt when ZAI_SYSTEM_PROMPT input is default', async () => {
    mockGetContent.mockImplementation((params: { path: string }) => {
      if (params.path === '.github/zai-review.yaml') {
        return {
          data: {
            type: 'file',
            content: encode('system_prompt: "Custom system prompt from config"\n'),
            encoding: 'base64',
          },
        };
      }
      return Promise.reject({ status: 404 });
    });

    const config = await parseConfig();
    expect(config.zaiSystemPrompt).toBe('Custom system prompt from config');
  });
});
