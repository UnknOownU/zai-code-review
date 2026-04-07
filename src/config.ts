import * as core from '@actions/core';
import * as github from '@actions/github';

export interface ActionConfig {
  // Z.ai API configuration
  zaiApiKey: string;
  zaiModel: string;
  zaiBaseUrl: string;
  zaiSystemPrompt: string;
  reviewerName: string;

  // GitHub configuration
  githubToken: string;
  repoOwner: string;
  repoName: string;
  pullNumber: number;
  commitId: string;
  prTitle: string;

  // Review configuration
  maxFiles: number;
  maxComments: number;
  excludePatterns: string[];
  language: string;
  autoApprove: boolean;
  useCodingPlan: boolean;
}

export function parseConfig(): ActionConfig {
  const zaiApiKey = core.getInput('ZAI_API_KEY', { required: true });
  const zaiModel = core.getInput('ZAI_MODEL') || 'glm-4.7';
  const zaiBaseUrl = core.getInput('ai_base_url') || 'https://api.z.ai';
  const zaiSystemPrompt = core.getInput('ZAI_SYSTEM_PROMPT') || '';
  const reviewerName = core.getInput('ZAI_REVIEWER_NAME') || 'Z.ai Code Review';
  const githubToken = core.getInput('GITHUB_TOKEN') || process.env.GITHUB_TOKEN || '';

  const context = github.context;
  const repoOwner = context.repo.owner;
  const repoName = context.repo.repo;
  const pullNumber = context.payload.pull_request?.number ?? 0;
  const commitId = context.payload.pull_request?.head?.sha ?? '';
  const prTitle = (context.payload.pull_request?.title as string) ?? 'Pull Request';

  const maxFiles = parseInt(core.getInput('max_files') || '20', 10);
  const maxComments = parseInt(core.getInput('max_comments') || '50', 10);
  const excludePatternsRaw = core.getInput('exclude_patterns') ||
    'package-lock.json,yarn.lock,pnpm-lock.yaml,*.min.js,*.min.css,*.bundle.js,*.map';
  const excludePatterns = excludePatternsRaw
    .split(',')
    .map(p => p.trim())
    .filter(p => p.length > 0);
  const language = core.getInput('language') || 'en';
  const autoApprove = (core.getInput('auto_approve') || 'false').toLowerCase() === 'true';
  const useCodingPlan = (core.getInput('use_coding_plan') || 'true').toLowerCase() === 'true';

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
    throw new Error('Could not determine pull request number. Ensure this action runs on a pull_request event.');
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
  };
}
