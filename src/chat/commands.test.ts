import { beforeEach, describe, expect, it, vi } from 'vitest';

const mockWarning = vi.fn();
const mockIsAuthorized = vi.fn();

vi.mock('@actions/core', () => ({
  info: vi.fn(),
  warning: (...args: unknown[]) => mockWarning(...args),
  debug: vi.fn(),
  error: vi.fn(),
}));

vi.mock('@actions/github', () => ({
  context: {
    repo: { owner: 'test-owner', repo: 'test-repo' },
    payload: {
      comment: {
        id: 1,
        body: '/zai-review explain this',
        user: { type: 'User', login: 'dev' },
        author_association: 'MEMBER',
      },
      issue: { state: 'open', number: 42 },
    },
  },
}));

vi.mock('./auth', async () => {
  const actual = await vi.importActual<typeof import('./auth')>('./auth');
  return {
    ...actual,
    isAuthorized: (...args: Parameters<typeof actual.isAuthorized>) => mockIsAuthorized(...args),
  };
});

import { handleChatEvent } from './handler';
import { handleExplain, handleFix, handleHelp, type ChatContext } from './commands';

function createConfig(overrides: Partial<ChatContext['config']> = {}): ChatContext['config'] {
  return {
    zaiApiKey: 'key',
    zaiModel: 'glm-5.1',
    zaiBaseUrl: 'https://api.z.ai',
    zaiSystemPrompt: '',
    reviewerName: 'Z.ai Code Review',
    githubToken: 'gh-token',
    repoOwner: 'test-owner',
    repoName: 'test-repo',
    pullNumber: 42,
    commitId: 'abc123',
    prTitle: 'Test PR',
    maxFiles: 20,
    maxComments: 50,
    excludePatterns: [],
    language: 'en',
    autoApprove: false,
    useCodingPlan: true,
    enableThinking: false,
    customInstructions: '',
    incremental: true,
    chatAllowedRoles: ['OWNER', 'MEMBER', 'COLLABORATOR'],
    autofixMode: 'disabled',
    ...overrides,
  };
}

function createContext(overrides: Partial<ChatContext> = {}): ChatContext {
  const octokit = {
    issues: { createComment: vi.fn().mockResolvedValue(undefined) },
    reactions: { createForIssueComment: vi.fn().mockResolvedValue(undefined) },
  } as unknown as ChatContext['octokit'];

  const aiClient = {
    chatCompletion: vi.fn().mockResolvedValue('ok'),
  } as unknown as ChatContext['aiClient'];

  return {
    octokit,
    aiClient,
    config: createConfig(),
    commentId: 1,
    pullNumber: 42,
    commentBody: '/zai-review explain this',
    ...overrides,
  };
}

describe('chat commands', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockIsAuthorized.mockReturnValue(true);
  });

  it('handleExplain posts AI response as a PR comment', async () => {
    const aiClient = {
      chatCompletion: vi.fn().mockResolvedValue('This is O(n²) because...'),
    } as unknown as ChatContext['aiClient'];
    const ctx = createContext({ aiClient, diffHunk: '@@ -1,2 +1,2 @@\n-foo\n+bar' });

    await handleExplain(ctx, 'why is this slow?');

    expect(aiClient.chatCompletion).toHaveBeenCalledWith([
      {
        role: 'system',
        content: "You are a code reviewer. Answer the developer's question clearly and concisely.",
      },
      {
        role: 'user',
        content: 'Given this code context:\n@@ -1,2 +1,2 @@\n-foo\n+bar\n\nQuestion: why is this slow?',
      },
    ]);
    expect(ctx.octokit.issues.createComment).toHaveBeenCalledWith({
      owner: 'test-owner',
      repo: 'test-repo',
      issue_number: 42,
      body: 'This is O(n²) because...',
    });
  });

  it('handleHelp posts the static help message', async () => {
    const ctx = createContext();

    await handleHelp(ctx);

    expect(ctx.octokit.issues.createComment).toHaveBeenCalledTimes(1);
    const call = vi.mocked(ctx.octokit.issues.createComment).mock.calls[0]?.[0];
    if (!call) {
      throw new Error('Expected createComment to be called');
    }
    expect(call.body).toContain('explain');
    expect(call.body).toContain('review');
    expect(call.body).toContain('fix');
    expect(call.body).toContain('help');
  });

  it('handleFix explains disabled autofix mode', async () => {
    const ctx = createContext({ config: createConfig({ autofixMode: 'disabled' }) });

    await handleFix(ctx);

    const call = vi.mocked(ctx.octokit.issues.createComment).mock.calls[0]?.[0];
    if (!call) {
      throw new Error('Expected createComment to be called');
    }
    expect(call.body).toContain('disabled');
  });

  it('handleChatEvent posts an error reply when authorization check throws', async () => {
    mockIsAuthorized.mockImplementation(() => {
      throw new Error('authorization failed');
    });

    const octokit = {
      issues: { createComment: vi.fn().mockResolvedValue(undefined) },
      reactions: { createForIssueComment: vi.fn().mockResolvedValue(undefined) },
    } as unknown as ChatContext['octokit'];

    await expect(handleChatEvent(octokit, createContext().aiClient, createConfig())).resolves.toBeUndefined();

    expect(mockWarning).toHaveBeenCalledWith('Failed to process chat command: authorization failed');
    expect(octokit.issues.createComment).toHaveBeenCalledWith({
      owner: 'test-owner',
      repo: 'test-repo',
      issue_number: 42,
      body: '⚠️ Error processing command: authorization failed',
    });
    expect(octokit.reactions.createForIssueComment).not.toHaveBeenCalled();
  });
});
