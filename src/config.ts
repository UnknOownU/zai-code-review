import * as core from '@actions/core';
import * as github from '@actions/github';
import { getOctokit } from './github/client';
import { readRepoConfig, readRepoInstructions } from './config/reader';

export interface ActionConfig {
  zaiApiKey: string;
  zaiModel: string;
  zaiBaseUrl: string;
  zaiSystemPrompt: string;
  reviewerName: string;

  githubToken: string;
  repoOwner: string;
  repoName: string;
  pullNumber: number;
  commitId: string;
  prTitle: string;

  maxFiles: number;
  maxComments: number;
  excludePatterns: string[];
  language: string;
  autoApprove: boolean;
  useCodingPlan: boolean;
  enableThinking: boolean;
  customInstructions: string;
  incremental: boolean;
  chatAllowedRoles: string[];
  chatEnabled: boolean;
  autofixMode: 'disabled' | 'suggest' | 'commit';
}

export async function parseConfig(): Promise<ActionConfig> {
  const zaiApiKey = core.getInput('ZAI_API_KEY', { required: true });
  const zaiModelInput = core.getInput('ZAI_MODEL');
  const zaiBaseUrl = core.getInput('ai_base_url') || 'https://api.z.ai';
  const zaiSystemPromptInput = core.getInput('ZAI_SYSTEM_PROMPT');
  const reviewerName = core.getInput('ZAI_REVIEWER_NAME') || 'Z.ai Code Review';
  const githubToken = core.getInput('GITHUB_TOKEN') || process.env.GITHUB_TOKEN || '';

  const context = github.context;
  const repoOwner = context.repo.owner;
  const repoName = context.repo.repo;
  const eventName = context.eventName;

  let pullNumber: number;
  let commitId: string;
  let prTitle: string;

  if (eventName === 'pull_request') {
    pullNumber = context.payload.pull_request?.number ?? 0;
    commitId = context.payload.pull_request?.head?.sha ?? '';
    prTitle = (context.payload.pull_request?.title as string) ?? 'Pull Request';
  } else if (eventName === 'issue_comment') {
    pullNumber = context.payload.issue?.number ?? 0;
    commitId = '';  // Not available in issue_comment payload
    prTitle = '';
  } else if (eventName === 'pull_request_review_comment') {
    pullNumber = context.payload.pull_request?.number ?? 0;
    commitId = context.payload.pull_request?.head?.sha ?? '';
    prTitle = (context.payload.pull_request?.title as string) ?? '';
  } else {
    throw new Error(`Unsupported event: ${eventName}`);
  }

  let repoConfig: Awaited<ReturnType<typeof readRepoConfig>> = {};
  let customInstructions = '';
  try {
    const octokit = getOctokit(githubToken);
    const baseBranch = context.payload.pull_request?.base?.ref ?? 'main';
    repoConfig = await readRepoConfig(octokit, repoOwner, repoName, baseBranch);
    customInstructions = await readRepoInstructions(octokit, repoOwner, repoName, baseBranch);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    core.warning(`Failed to read repo config: ${message}`);
  }

  // Merge logic: explicit action inputs override config file; config file overrides defaults
  const zaiModel = zaiModelInput || repoConfig.model || 'glm-5.1';
  const zaiSystemPrompt = zaiSystemPromptInput || repoConfig.system_prompt || '';

  const maxFilesInput = core.getInput('max_files');
  const maxCommentsInput = core.getInput('max_comments');
  const excludePatternsInput = core.getInput('exclude_patterns');
  const languageInput = core.getInput('language');
  const autoApproveInput = core.getInput('auto_approve');
  const enableThinkingInput = core.getInput('enable_thinking');
  const incrementalInput = core.getInput('incremental');
  const chatAllowedRolesInput = core.getInput('chat_allowed_roles');
  const autofixModeInput = core.getInput('autofix_mode');
  const chatEnabledInput = core.getInput('chat_enabled');

  let maxFiles = parseInt(maxFilesInput || String(repoConfig.max_files ?? '20'), 10);
  let maxComments = parseInt(maxCommentsInput || String(repoConfig.max_comments ?? '50'), 10);
  const excludePatternsRaw = excludePatternsInput ||
    (repoConfig.exclude_patterns?.length ? repoConfig.exclude_patterns.join(',') : null) ||
    'package-lock.json,yarn.lock,pnpm-lock.yaml,*.min.js,*.min.css,*.bundle.js,*.map';
  const excludePatterns = excludePatternsRaw
    .split(',')
    .map(p => p.trim())
    .filter(p => p.length > 0);
  const language = languageInput || repoConfig.language || 'en';
  const autoApprove = (autoApproveInput || String(repoConfig.auto_approve ?? 'false')).toLowerCase() === 'true';
  const useCodingPlan = (core.getInput('use_coding_plan') || 'true').toLowerCase() === 'true';
  const enableThinking = (enableThinkingInput || String(repoConfig.enable_thinking ?? 'false')).toLowerCase() === 'true';
  const incremental = (incrementalInput || String(repoConfig.incremental ?? 'true')).toLowerCase() === 'true';
  const chatAllowedRoles = (chatAllowedRolesInput || 'OWNER,MEMBER,COLLABORATOR')
    .split(',')
    .map(role => role.trim().toUpperCase())
    .filter(role => role.length > 0);
  const rawAutofixMode = (autofixModeInput || repoConfig.autofix_mode || 'disabled').toLowerCase();
  const autofixMode = rawAutofixMode === 'suggest' || rawAutofixMode === 'commit' ? rawAutofixMode : 'disabled';
  const chatEnabled = (chatEnabledInput || 'true').toLowerCase() === 'true';

  if (rawAutofixMode !== autofixMode) {
    core.warning(`autofix_mode='${rawAutofixMode}' is invalid. Falling back to 'disabled'.`);
  }

  if (!zaiApiKey) {
    throw new Error('ZAI_API_KEY is required but not provided.');
  }
  if (!githubToken) {
    throw new Error('GITHUB_TOKEN is required. Ensure your workflow has `pull-requests: write` permission.');
  }
  if (!repoOwner || !repoName) {
    throw new Error('Could not determine repository owner/name from GITHUB_REPOSITORY.');
  }
  if (!pullNumber || pullNumber === 0) {
    throw new Error('Could not determine pull request number from event payload.');
  }

  const validModels = [
    'glm-5.1', 'glm-5', 'glm-5-turbo', 'glm-4.7', 'glm-4.7-flash', 'glm-4.7-flashx',
    'glm-4.6', 'glm-4.5', 'glm-4.5-air', 'glm-4.5-x', 'glm-4.5-airx', 'glm-4.5-flash',
    'glm-4-32b-0414-128k',
  ];
  if (!validModels.includes(zaiModel.toLowerCase())) {
    core.warning(
      `Model '${zaiModel}' is not in the known Z.ai model list (${validModels.join(', ')}). ` +
      'Proceeding anyway — the API will reject it if invalid.'
    );
  }

  if (maxFiles < 1 || maxFiles > 100) {
    core.warning(`max_files=${maxFiles} is outside the recommended range (1-100). Clamping.`);
    maxFiles = Math.min(Math.max(maxFiles, 1), 100);
  }

  if (maxComments < 1 || maxComments > 200) {
    core.warning(`max_comments=${maxComments} is outside the recommended range (1-200). Clamping.`);
    maxComments = Math.min(Math.max(maxComments, 1), 200);
  }

  core.info(`Configuration loaded:`);
  core.info(`  Repository: ${repoOwner}/${repoName}`);
  core.info(`  PR Number: ${pullNumber}`);
  core.info(`  Model: ${zaiModel}`);
  core.info(`  Max files: ${maxFiles}`);
  core.info(`  Max comments: ${maxComments}`);
  core.info(`  Language: ${language}`);
  core.info(`  Auto-approve: ${autoApprove}`);
  core.info(`  Exclude patterns: ${excludePatterns.join(', ')}`);
  core.info(`  Use Coding Plan: ${useCodingPlan}`);
  core.info(`  Enable Thinking: ${enableThinking}`);
  core.info(`  Incremental: ${incremental}`);
  core.info(`  Chat allowed roles: ${chatAllowedRoles.join(', ')}`);
  core.info(`  Autofix mode: ${autofixMode}`);
  core.info(`  Chat enabled: ${chatEnabled}`);

  return {
    zaiApiKey,
    zaiModel,
    zaiBaseUrl,
    zaiSystemPrompt,
    reviewerName,
    githubToken,
    repoOwner,
    repoName,
    pullNumber,
    commitId,
    prTitle,
    maxFiles,
    maxComments,
    excludePatterns,
    language,
    autoApprove,
    useCodingPlan,
    enableThinking,
    customInstructions,
    incremental,
    chatAllowedRoles,
    autofixMode,
    chatEnabled,
  };
}
