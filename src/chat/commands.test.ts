import { beforeEach, describe, expect, it, vi } from "vitest";
import {
	type ChatContext,
	handleExplain,
	handleFix,
	handleHelp,
	handleReview,
} from "./commands";
import { handleChatEvent } from "./handler";

const mockWarning = vi.fn();
const mockIsAuthorized = vi.fn();

vi.mock("@actions/core", () => ({
	info: vi.fn(),
	warning: (...args: unknown[]) => mockWarning(...args),
	debug: vi.fn(),
	error: vi.fn(),
}));

vi.mock("@actions/github", () => ({
	context: {
		repo: { owner: "test-owner", repo: "test-repo" },
		payload: {
			comment: {
				id: 1,
				body: "/zai-review explain this",
				user: { type: "User", login: "dev" },
				author_association: "MEMBER",
			},
			issue: { state: "open", number: 42 },
		},
	},
}));

vi.mock("./auth", async () => {
	const actual = await vi.importActual<typeof import("./auth")>("./auth");
	return {
		...actual,
		isAuthorized: (...args: Parameters<typeof actual.isAuthorized>) =>
			mockIsAuthorized(...args),
	};
});

function createConfig(
	overrides: Partial<ChatContext["config"]> = {},
): ChatContext["config"] {
	return {
		zaiApiKey: "key",
		zaiModel: "glm-5.1",
		zaiBaseUrl: "https://api.z.ai",
		zaiSystemPrompt: "",
		reviewerName: "Z.ai Code Review",
		githubToken: "gh-token",
		repoOwner: "test-owner",
		repoName: "test-repo",
		pullNumber: 42,
		commitId: "abc123",
		prTitle: "Test PR",
		maxFiles: 20,
		maxComments: 50,
		excludePatterns: [],
		language: "en",
		autoApprove: false,
		useCodingPlan: true,
		enableThinking: false,
		customInstructions: "",
		incremental: true,
		chatAllowedRoles: ["OWNER", "MEMBER", "COLLABORATOR"],
		autofixMode: "disabled",
		chatEnabled: true,
		...overrides,
	};
}

function createContext(overrides: Partial<ChatContext> = {}): ChatContext {
	const octokit = {
		issues: { createComment: vi.fn().mockResolvedValue(undefined) },
		reactions: { createForIssueComment: vi.fn().mockResolvedValue(undefined) },
	} as unknown as ChatContext["octokit"];

	const aiClient = {
		chatCompletion: vi.fn().mockResolvedValue("ok"),
	} as unknown as ChatContext["aiClient"];

	return {
		octokit,
		aiClient,
		config: createConfig(),
		commentId: 1,
		pullNumber: 42,
		commentBody: '/zai-review explain this',
		userLogin: 'test-user',
		commentUrl: 'https://github.com/test-owner/test-repo/pull/42#issuecomment-1',
		...overrides,
	};
}

describe("chat commands", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		mockIsAuthorized.mockReturnValue(true);
	});

	it("handleExplain posts AI response as a PR comment", async () => {
		const aiClient = {
			chatCompletion: vi.fn().mockResolvedValue("This is O(n²) because..."),
		} as unknown as ChatContext["aiClient"];
		const ctx = createContext({
			aiClient,
			diffHunk: "@@ -1,2 +1,2 @@\n-foo\n+bar",
		});

		const expectedSystemPrompt = `You are Explainer, an expert code analyst specializing in clear, precise explanations of code behavior, patterns, and potential issues.

## Core Principles:
1. **Precision**: Answer the exact question asked. Do not add unrelated observations.
2. **Evidence-Based**: Reference specific code elements (variable names, function calls, line patterns) in your explanation.
3. **Concise**: Keep explanations focused. One clear paragraph is better than five vague ones.
4. **Educational**: Explain the "why" — not just the "what". Help the developer understand the underlying concept.

<guidelines>
- If code context is provided (diff hunk), analyze it directly.
- If no code context is available, answer the question based on your knowledge of the programming language and best practices.
- Use code examples in your explanation when they help clarify the point.
- If the question is ambiguous, address the most likely interpretation and note the ambiguity.
</guidelines>

<non_negotiable_rules>
- NEVER fabricate code that was not provided in the context.
- NEVER give generic answers like "it depends" without explaining the specific factors.
- ALWAYS write in en if specified.
</non_negotiable_rules>`;

		await handleExplain(ctx, "why is this slow?");

		expect(aiClient.chatCompletion).toHaveBeenCalledWith([
			{
				role: "system",
				content: expectedSystemPrompt,
			},
			{
				role: "user",
				content:
					"<explain_request>\n<code>\n@@ -1,2 +1,2 @@\n-foo\n+bar\n</code>\n<question>why is this slow?</question>\n</explain_request>",
			},
		]);
		expect(ctx.octokit.issues.createComment).toHaveBeenCalledWith(
			expect.objectContaining({
				owner: "test-owner",
				repo: "test-repo",
				issue_number: 42,
				body: expect.stringContaining("This is O(n²) because..."),
			}),
		);
		const call = (ctx.octokit.issues.createComment as any).mock.calls[0][0];
		expect(call.body).toContain("@test-user");
	});

	it("handleExplain injects language and repo instructions when configured", async () => {
		const aiClient = {
			chatCompletion: vi.fn().mockResolvedValue("ok"),
		} as unknown as ChatContext["aiClient"];
		const ctx = createContext({
			aiClient,
			config: createConfig({
				language: "fr",
				customInstructions: "Focus on data safety.",
			}),
		});

		await handleExplain(ctx, "que fait ce code ?");

		expect(aiClient.chatCompletion).toHaveBeenCalledWith([
			{
				role: "system",
				content: `You are Explainer, an expert code analyst specializing in clear, precise explanations of code behavior, patterns, and potential issues.

## Core Principles:
1. **Precision**: Answer the exact question asked. Do not add unrelated observations.
2. **Evidence-Based**: Reference specific code elements (variable names, function calls, line patterns) in your explanation.
3. **Concise**: Keep explanations focused. One clear paragraph is better than five vague ones.
4. **Educational**: Explain the "why" — not just the "what". Help the developer understand the underlying concept.

You MUST write all responses in fr. Code examples must remain in the original programming language.

<repo_instructions>
Focus on data safety.
</repo_instructions>

<guidelines>
- If code context is provided (diff hunk), analyze it directly.
- If no code context is available, answer the question based on your knowledge of the programming language and best practices.
- Use code examples in your explanation when they help clarify the point.
- If the question is ambiguous, address the most likely interpretation and note the ambiguity.
</guidelines>

<non_negotiable_rules>
- NEVER fabricate code that was not provided in the context.
- NEVER give generic answers like "it depends" without explaining the specific factors.
- ALWAYS write in fr if specified.
</non_negotiable_rules>`,
			},
			{
				role: "user",
				content:
					"<explain_request>\n<question>que fait ce code ?</question>\n</explain_request>",
			},
		]);
	});

	it("handleHelp posts the static help message", async () => {
		const ctx = createContext();

		await handleHelp(ctx);

		expect(ctx.octokit.issues.createComment).toHaveBeenCalledTimes(1);
		const call = vi.mocked(ctx.octokit.issues.createComment).mock.calls[0]?.[0];
		if (!call) {
			throw new Error("Expected createComment to be called");
		}
		expect(call.body).toContain("## Z.ai Code Review — Commands");
		expect(call.body).toContain("| `/zai-review explain <question>` |");
		expect(call.body).toContain(
			"**Configuration**: Add `.github/zai-review.yaml`",
		);
		expect(call.body).toContain(
			"**Custom instructions**: Add `.github/zai-review-instructions.md`",
		);
	});

	it("handleReview posts the updated static review request message", async () => {
		const ctx = createContext();

		await handleReview(ctx);

		expect(ctx.octokit.issues.createComment).toHaveBeenCalledWith(
			expect.objectContaining({
				owner: "test-owner",
				repo: "test-repo",
				issue_number: 42,
				body: expect.stringContaining('**Review requested**'),
			}),
		);
		const reviewCall = (ctx.octokit.issues.createComment as any).mock.calls[0][0];
		expect(reviewCall.body).toContain("@test-user");
	});

	it("handleFix explains disabled autofix mode", async () => {
		const ctx = createContext({
			config: createConfig({ autofixMode: "disabled" }),
		});

		await handleFix(ctx);

		const call = vi.mocked(ctx.octokit.issues.createComment).mock.calls[0]?.[0];
		if (!call) {
			throw new Error("Expected createComment to be called");
		}
		expect(call.body).toContain(
			"**Autofix is disabled.** To enable it, add `autofix_mode: suggest` or `autofix_mode: commit` to your workflow or `.github/zai-review.yaml` config file.",
		);
		expect(call.body).toContain("@test-user");
	});

	it("handleFix explains suggest autofix mode", async () => {
		const ctx = createContext({
			config: createConfig({ autofixMode: "suggest" }),
		});

		await handleFix(ctx);

		const call = vi.mocked(ctx.octokit.issues.createComment).mock.calls[0]?.[0];
		if (!call) {
			throw new Error("Expected createComment to be called");
		}
		expect(call.body).toContain(
			"**Suggestions are available.** Look for the `suggestion` blocks in the review comments above — click 'Apply suggestion' on each one to accept.",
		);
		expect(call.body).toContain("@test-user");
	});

	it("handleFix explains commit autofix mode", async () => {
		const ctx = createContext({
			config: createConfig({ autofixMode: "commit" }),
		});

		await handleFix(ctx);

		const call = vi.mocked(ctx.octokit.issues.createComment).mock.calls[0]?.[0];
		if (!call) {
			throw new Error("Expected createComment to be called");
		}
		expect(call.body).toContain(
			"**Autofix (commit mode) is active.** Suggestion fixes will be applied automatically in the next review run.",
		);
		expect(call.body).toContain("@test-user");
	});

	it("handleChatEvent posts an error reply when authorization check throws", async () => {
		mockIsAuthorized.mockImplementation(() => {
			throw new Error("authorization failed");
		});

		const octokit = {
			issues: { createComment: vi.fn().mockResolvedValue(undefined) },
			reactions: {
				createForIssueComment: vi.fn().mockResolvedValue(undefined),
			},
		} as unknown as ChatContext["octokit"];

		await expect(
			handleChatEvent(octokit, createContext().aiClient, createConfig()),
		).resolves.toBeUndefined();

		expect(mockWarning).toHaveBeenCalledWith(
			"Failed to process chat command: authorization failed",
		);
		expect(octokit.issues.createComment).toHaveBeenCalledWith({
			owner: "test-owner",
			repo: "test-repo",
			issue_number: 42,
			body: "⚠️ Error processing command: authorization failed",
		});
		expect(octokit.reactions.createForIssueComment).not.toHaveBeenCalled();
	});
});
