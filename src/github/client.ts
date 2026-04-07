import * as core from '@actions/core';
import { Octokit } from '@octokit/rest';

let octokitInstance: Octokit | null = null;

export function getOctokit(token: string): Octokit {
  if (octokitInstance) {
    return octokitInstance;
  }

  core.info('Initializing GitHub Octokit client...');

  octokitInstance = new Octokit({
    auth: token,
    userAgent: 'zai-code-review-action/1.0.0',
    request: {
      timeout: 30000,
    },
  });

  core.info('GitHub client initialized successfully.');
  return octokitInstance;
}
