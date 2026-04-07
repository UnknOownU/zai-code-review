import * as core from '@actions/core';
import { ZaiClient } from '../ai/client';
import { buildFileReviewPrompt } from '../ai/prompts';
import { parseFileReviewResponse } from '../ai/parser';
import { chunkDiff } from '../ai/chunker';
import {
  FileDiff,
  FileReview,
  ReviewComment,
  Severity,
  Category,
  AIFinding,
} from '../review/types';

/**
 * Review a single file by sending its diff to the AI for analysis.
 * Handles chunking for large diffs and maps AI findings to proper line numbers.
 */
export async function reviewFile(
  aiClient: ZaiClient,
  file: FileDiff,
  customSystemPrompt: string,
  language: string
): Promise<FileReview> {
  core.info(`Reviewing file: ${file.path} (+${file.additions}/-${file.deletions})`);

  try {
    const { chunks, wasSplit } = chunkDiff(file.diff);
    const allFindings: AIFinding[] = [];

    for (let i = 0; i < chunks.length; i++) {
      if (wasSplit) {
        core.info(`  Processing chunk ${i + 1}/${chunks.length} for ${file.path}`);
      }

      const { system, user } = buildFileReviewPrompt(
        file.path,
        chunks[i],
        customSystemPrompt,
        language
      );

      const response = await aiClient.chatCompletion(
        [
          { role: 'system', content: system },
          { role: 'user', content: user },
        ],
        { responseFormat: 'json' }
      );

      const parsed = parseFileReviewResponse(response);
      allFindings.push(...parsed.findings);
    }

    const comments = mapFindingsToComments(file, allFindings);

    core.info(`  Found ${comments.length} issues in ${file.path}`);

    return {
      path: file.path,
      comments,
      additions: file.additions,
      deletions: file.deletions,
    };
  } catch (error: any) {
    core.warning(`Error reviewing file ${file.path}: ${error.message}`);
    return {
      path: file.path,
      comments: [],
      additions: file.additions,
      deletions: file.deletions,
      error: error.message,
    };
  }
}

/**
 * Review multiple files in parallel with limited concurrency.
 */
export async function reviewFiles(
  aiClient: ZaiClient,
  files: FileDiff[],
  customSystemPrompt: string,
  language: string,
  concurrency: number = 3
): Promise<FileReview[]> {
  core.info(`Starting review of ${files.length} files with concurrency ${concurrency}...`);

  const results: FileReview[] = [];
  const queue = [...files];

  async function processQueue(): Promise<void> {
    while (queue.length > 0) {
      const file = queue.shift();
      if (!file) break;

      const result = await reviewFile(aiClient, file, customSystemPrompt, language);
      results.push(result);
    }
  }

  const workers = Array.from({ length: Math.min(concurrency, files.length) }, () =>
    processQueue()
  );

  await Promise.all(workers);

  const totalComments = results.reduce((sum, r) => sum + r.comments.length, 0);
  const errors = results.filter(r => r.error).length;
  core.info(`Review complete: ${totalComments} comments across ${results.length} files (${errors} errors)`);

  return results;
}

/** AI returns line numbers relative to the diff chunk; these must be mapped
 * to actual file line numbers for GitHub's inline comment API. */
function mapFindingsToComments(file: FileDiff, findings: AIFinding[]): ReviewComment[] {
  const comments: ReviewComment[] = [];

  for (const finding of findings) {
    const lineNumber = resolveLineNumber(file, finding.line);

    const comment: ReviewComment = {
      path: file.path,
      line: lineNumber,
      body: '', // Will be formatted by comments.ts
      severity: normalizeSeverityEnum(finding.severity),
      category: normalizeCategoryEnum(finding.category),
      title: finding.title,
      description: finding.description,
      suggestion: finding.suggestion,
    };

    comments.push(comment);
  }

  return comments;
}

function resolveLineNumber(file: FileDiff, diffLineNum: number): number {
  if (diffLineNum <= 0) {
    return 1;
  }

  let currentDiffLine = 0;

  for (const hunk of file.hunks) {
    for (const line of hunk.lines) {
      currentDiffLine++;
      if (currentDiffLine === diffLineNum) {
        if (line.type === 'added' || line.type === 'context') {
          return line.newLineNumber || hunk.newStart;
        }
        // For removed lines, use the next context/added line
        return line.oldLineNumber || hunk.oldStart;
      }
    }
  }

  return 1;
}
function normalizeSeverityEnum(severity: string): Severity {
  switch (severity) {
    case 'critical': return Severity.Critical;
    case 'warning': return Severity.Warning;
    case 'info': return Severity.Info;
    default: return Severity.Info;
  }
}

function normalizeCategoryEnum(category: string): Category {
  switch (category) {
    case 'bug': return Category.Bug;
    case 'security': return Category.Security;
    case 'improvement': return Category.Improvement;
    case 'nit': return Category.Nit;
    case 'performance': return Category.Performance;
    case 'style': return Category.Style;
    default: return Category.Improvement;
  }
}