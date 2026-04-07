import * as core from '@actions/core';
import type { Octokit } from '@octokit/rest';
import { parse } from 'yaml';

import { type RepoConfig, validateConfig } from './schema';

const CONFIG_PATH = '.github/zai-review.yaml';
const INSTRUCTIONS_PATH = '.github/zai-review-instructions.md';
const MAX_CONFIG_SIZE_BYTES = 10 * 1024;
const MAX_INSTRUCTIONS_SIZE_BYTES = 20 * 1024;

function decodeBase64Content(content: string): string {
  return Buffer.from(content, 'base64').toString('utf-8');
}

async function readRepoFile(
  octokit: Octokit,
  owner: string,
  repo: string,
  ref: string,
  path: string,
  maxSizeBytes: number,
  fallbackValue: string,
): Promise<string> {
  try {
    const response = await octokit.repos.getContent({ owner, repo, path, ref });
    const { data } = response;

    if (Array.isArray(data) || data.type !== 'file' || typeof data.content !== 'string' || data.encoding !== 'base64') {
      core.warning(`Could not read ${path}: expected a base64-encoded file`);
      return fallbackValue;
    }

    const decodedContent = decodeBase64Content(data.content);
    const sizeBytes = Buffer.byteLength(decodedContent, 'utf-8');

    if (sizeBytes > maxSizeBytes) {
      core.warning(`Skipping ${path}: file exceeds ${maxSizeBytes} bytes`);
      return fallbackValue;
    }

    return decodedContent;
  } catch (error) {
    const status = typeof error === 'object' && error !== null && 'status' in error ? error.status : undefined;

    if (status === 404) {
      return fallbackValue;
    }

    const message = error instanceof Error ? error.message : String(error);
    core.warning(`Failed to read ${path}: ${message}`);
    return fallbackValue;
  }
}

export async function readRepoConfig(
  octokit: Octokit,
  owner: string,
  repo: string,
  ref: string,
): Promise<Partial<RepoConfig>> {
  const rawYaml = await readRepoFile(octokit, owner, repo, ref, CONFIG_PATH, MAX_CONFIG_SIZE_BYTES, '');

  if (!rawYaml) {
    return {};
  }

  try {
    return validateConfig(parse(rawYaml));
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    core.warning(`Failed to parse ${CONFIG_PATH}: ${message}`);
    return {};
  }
}

export async function readRepoInstructions(
  octokit: Octokit,
  owner: string,
  repo: string,
  ref: string,
): Promise<string> {
  return readRepoFile(octokit, owner, repo, ref, INSTRUCTIONS_PATH, MAX_INSTRUCTIONS_SIZE_BYTES, '');
}
