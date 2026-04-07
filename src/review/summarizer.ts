import * as core from '@actions/core';
import { ZaiClient } from '../ai/client';
import { buildSummaryPrompt, buildSummaryBody } from '../ai/prompts';
import { parseSummaryResponse } from '../ai/parser';
import {
  FileReview,
  ReviewSummary,
  ReviewVerdict,
  Severity,
  Category,
  KeyFinding,
} from '../review/types';

export async function generateSummary(
  aiClient: ZaiClient,
  prTitle: string,
  fileReviews: FileReview[],
  reviewerName: string,
  language: string
): Promise<ReviewSummary> {
  core.info('Generating PR summary...');

  let criticalCount = 0;
  let securityCount = 0;
  let warningCount = 0;
  let suggestionCount = 0;
  const keyFindings: KeyFinding[] = [];

  for (const review of fileReviews) {
    for (const comment of review.comments) {
      switch (comment.severity) {
        case Severity.Critical:
          criticalCount++;
          break;
        case Severity.Warning:
          warningCount++;
          break;
        case Severity.Info:
          suggestionCount++;
          break;
      }

      if (comment.category === Category.Security) {
        securityCount++;
      }

      if (comment.severity === Severity.Critical || comment.category === Category.Security) {
        keyFindings.push({
          severity: comment.severity,
          category: comment.category,
          filePath: comment.path,
          line: comment.line,
          message: comment.title,
        });
      }
    }
  }

  const filesSummary = fileReviews.map(r => ({
    path: r.path,
    additions: r.additions ?? 0,
    deletions: r.deletions ?? 0,
    findingsCount: r.comments.length,
  }));

  const findingsText = keyFindings
    .map(f => `[${f.severity}][${f.category}] ${f.filePath}:${f.line} - ${f.message}`)
    .join('\n');

  const { system, user } = buildSummaryPrompt(
    prTitle,
    filesSummary,
    findingsText,
    language
  );

  let summaryText = '';
  let changes: string[] = [];
  let attentionPoints: string[] = [];
  let verdictStr = 'comment';

  try {
    const response = await aiClient.chatCompletion(
      [
        { role: 'system', content: system },
        { role: 'user', content: user },
      ],
      { responseFormat: 'json' }
    );

    const parsed = parseSummaryResponse(response);
    changes = parsed.changes;
    attentionPoints = parsed.attentionPoints;
    verdictStr = parsed.verdict;
    summaryText = parsed.summary;
  } catch (error: any) {
    core.warning(`Failed to generate AI summary: ${error.message}. Using fallback.`);
    summaryText = `Reviewed ${fileReviews.length} files. Found ${criticalCount} critical issues, ${securityCount} security issues, ${warningCount} warnings, and ${suggestionCount} suggestions.`;
  }

  const verdict = determineVerdict(criticalCount, securityCount, warningCount, verdictStr);

  const formattedBody = buildSummaryBody(
    reviewerName,
    changes,
    attentionPoints,
    verdictStr,
    summaryText,
    criticalCount,
    securityCount,
    warningCount,
    suggestionCount
  );

  return {
    criticalCount,
    securityCount,
    warningCount,
    suggestionCount,
    keyFindings,
    verdict,
    summaryText: formattedBody,
  };
}

function determineVerdict(
  criticalCount: number,
  securityCount: number,
  warningCount: number,
  aiVerdict: string
): ReviewVerdict {
  // Critical bugs or security issues always require changes
  if (criticalCount > 0 || securityCount > 0) {
    return ReviewVerdict.RequestChanges;
  }

  // Respect AI verdict if reasonable
  if (aiVerdict === 'request_changes') {
    return ReviewVerdict.RequestChanges;
  }

  // Warnings -> comment
  if (warningCount > 0) {
    return ReviewVerdict.Comment;
  }

  // All clean -> approve
  return ReviewVerdict.Approve;
}

