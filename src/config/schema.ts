import * as core from '@actions/core';

export interface RepoConfig {
  language?: string;
  max_files?: number;
  max_comments?: number;
  exclude_patterns?: string[];
  auto_approve?: boolean;
  model?: string;
  system_prompt?: string;
  enable_thinking?: boolean;
  autofix_mode?: 'disabled' | 'suggest' | 'commit';
  incremental?: boolean;
}

const FORBIDDEN_KEYS = ['api_key', 'apiKey', 'github_token', 'githubToken', 'base_url', 'baseUrl'];
const ALLOWED_KEYS = [
  'language',
  'max_files',
  'max_comments',
  'exclude_patterns',
  'auto_approve',
  'model',
  'system_prompt',
  'enable_thinking',
  'autofix_mode',
  'incremental',
] as const;

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isAllowedKey(key: string): key is (typeof ALLOWED_KEYS)[number] {
  return (ALLOWED_KEYS as readonly string[]).includes(key);
}

export function validateConfig(raw: unknown): Partial<RepoConfig> {
  if (!isPlainObject(raw)) {
    return {};
  }

  const validated: Partial<RepoConfig> = {};

  for (const [key, value] of Object.entries(raw)) {
    if (FORBIDDEN_KEYS.includes(key)) {
      core.warning(`Security: config key ${key} is not allowed`);
      continue;
    }

    if (!isAllowedKey(key)) {
      core.warning(`Unknown config key: ${key} — ignored`);
      continue;
    }

    switch (key) {
      case 'language':
      case 'model':
      case 'system_prompt':
        if (typeof value === 'string') {
          validated[key] = value;
        }
        break;
      case 'max_files':
      case 'max_comments':
        if (typeof value === 'number' && Number.isFinite(value)) {
          validated[key] = value;
        }
        break;
      case 'exclude_patterns':
        if (Array.isArray(value) && value.every(item => typeof item === 'string')) {
          validated.exclude_patterns = value;
        }
        break;
      case 'auto_approve':
      case 'enable_thinking':
      case 'incremental':
        if (typeof value === 'boolean') {
          validated[key] = value;
        }
        break;
      case 'autofix_mode':
        if (value === 'disabled' || value === 'suggest' || value === 'commit') {
          validated.autofix_mode = value;
        }
        break;
      default:
        break;
    }
  }

  return validated;
}
