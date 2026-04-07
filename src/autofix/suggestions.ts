import type { ReviewComment } from '../review/types';

export type AutofixMode = 'disabled' | 'suggest' | 'commit';

export interface AutofixDecision {
  mode: AutofixMode;
  reason?: string;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

export function detectForkPR(payload: unknown): boolean {
  if (!isRecord(payload)) {
    return false;
  }

  const pullRequest = payload.pull_request;
  if (!isRecord(pullRequest)) {
    return false;
  }

  const head = pullRequest.head;
  if (!isRecord(head)) {
    return false;
  }

  const repo = head.repo;
  if (!isRecord(repo)) {
    return false;
  }

  return repo.fork === true;
}

export function canAutofix(
  configuredMode: AutofixMode,
  isFork: boolean
): AutofixDecision {
  if (configuredMode === 'disabled') {
    return { mode: 'disabled' };
  }

  if (configuredMode === 'commit') {
    if (isFork) {
      return {
        mode: 'suggest',
        reason: 'Fork PRs cannot use commit mode. Using suggestion mode instead.',
      };
    }

    return { mode: 'commit' };
  }

  return { mode: 'suggest' };
}

export function enhanceSuggestionComment(comment: ReviewComment): string {
  if (!comment.suggestion?.trim()) {
    return '';
  }

  return `\`\`\`suggestion\n${comment.suggestion}\n\`\`\``;
}
