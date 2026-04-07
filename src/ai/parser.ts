import * as core from '@actions/core';
import { AIFinding, AIFileReviewResponse, AISummaryResponse } from '../review/types';

/**
 * Parse the AI response for a file review.
 * Handles various formats: clean JSON, markdown-wrapped JSON, or plain text fallback.
 */
export function parseFileReviewResponse(rawResponse: string): AIFileReviewResponse {
  const jsonStr = extractJson(rawResponse);

  if (jsonStr) {
    try {
      const parsed = JSON.parse(jsonStr);

      if (parsed && typeof parsed === 'object') {
        const findings: AIFinding[] = [];

        if (Array.isArray(parsed.findings)) {
          for (const f of parsed.findings) {
            if (f && typeof f === 'object') {
              findings.push({
                line: typeof f.line === 'number' ? f.line : 1,
                severity: normalizeSeverity(f.severity),
                category: normalizeCategory(f.category),
                title: String(f.title || 'Issue found'),
                description: String(f.description || ''),
                suggestion: f.suggestion ? String(f.suggestion) : undefined,
              });
            }
          }
        }

        return { findings };
      }
    } catch (e: any) {
      core.warning(`Failed to parse JSON response: ${e.message}`);
    }
  }

  return parseFallbackResponse(rawResponse);
}

/**
 * Parse the AI response for a PR summary.
 */
export function parseSummaryResponse(rawResponse: string): AISummaryResponse {
  const jsonStr = extractJson(rawResponse);

  if (jsonStr) {
    try {
      const parsed = JSON.parse(jsonStr);

      if (parsed && typeof parsed === 'object') {
        return {
          changes: Array.isArray(parsed.changes) ? parsed.changes.map(String) : [],
          attentionPoints: Array.isArray(parsed.attentionPoints) ? parsed.attentionPoints.map(String) : [],
          verdict: normalizeVerdict(parsed.verdict) as AISummaryResponse['verdict'],
          summary: String(parsed.summary || ''),
        };
      }
    } catch (e: any) {
      core.warning(`Failed to parse summary JSON: ${e.message}`);
    }
  }

  return {
    changes: [],
    attentionPoints: [],
    verdict: 'comment',
    summary: rawResponse.substring(0, 500),
  };
}

/**
 * Extract JSON from a response that may be wrapped in markdown code blocks.
 */
function extractJson(response: string): string | null {
  const trimmed = response.trim();

  // Case 1: Direct JSON object
  if (trimmed.startsWith('{') && trimmed.endsWith('}')) {
    return trimmed;
  }

  // Case 2: JSON array
  if (trimmed.startsWith('[') && trimmed.endsWith(']')) {
    return trimmed;
  }

  // Case 3: Markdown code block with json
  const jsonBlockMatch = trimmed.match(/```(?:json)?\s*\n?([\s\S]*?)\n?```/);
  if (jsonBlockMatch) {
    return jsonBlockMatch[1].trim();
  }

  // Case 4: Find first { ... } in the text
  const firstBrace = trimmed.indexOf('{');
  const lastBrace = trimmed.lastIndexOf('}');
  if (firstBrace !== -1 && lastBrace > firstBrace) {
    return trimmed.substring(firstBrace, lastBrace + 1);
  }

  return null;
}

/**
 * Normalize severity values from various AI response formats.
 */
function normalizeSeverity(severity: any): string {
  if (!severity) return 'info';
  const s = String(severity).toLowerCase().trim();
  if (['critical', 'error', 'high', 'blocker'].includes(s)) return 'critical';
  if (['warning', 'medium', 'moderate'].includes(s)) return 'warning';
  return 'info';
}

/**
 * Normalize category values from various AI response formats.
 */
function normalizeCategory(category: any): string {
  if (!category) return 'improvement';
  const c = String(category).toLowerCase().trim();
  if (['bug', 'error', 'defect'].includes(c)) return 'bug';
  if (['security', 'vulnerability', 'cve'].includes(c)) return 'security';
  if (['performance', 'perf', 'optimization'].includes(c)) return 'performance';
  if (['style', 'formatting', 'format'].includes(c)) return 'style';
  if (['nit', 'minor', 'cosmetic'].includes(c)) return 'nit';
  return 'improvement';
}

/**
 * Normalize verdict values.
 */
function normalizeVerdict(verdict: any): string {
  if (!verdict) return 'comment';
  const v = String(verdict).toLowerCase().trim();
  if (['approve', 'approved', 'ok', 'good', 'pass'].includes(v)) return 'approve';
  if (['request_changes', 'requestchanges', 'reject', 'rejected', 'fail', 'changes_requested'].includes(v)) return 'request_changes';
  return 'comment';
}

/**
 * Fallback parser for non-JSON responses.
 * Tries to extract meaningful information from plain text.
 */
function parseFallbackResponse(rawResponse: string): AIFileReviewResponse {
  core.warning('Using fallback parser for non-JSON AI response.');

  // Try to find line-specific comments
  const findings: AIFinding[] = [];
  const lines = rawResponse.split('\n');
  let currentFinding: Partial<AIFinding> | null = null;

  for (const line of lines) {
    // Look for patterns like "Line 42:" or "L42:" or ":42:"
    const lineMatch = line.match(/\d+/);
    if (lineMatch) {
      if (currentFinding && currentFinding.description) {
        findings.push(currentFinding as AIFinding);
      }
      currentFinding = {
        line: parseInt(lineMatch[0], 10),
        severity: line.toLowerCase().includes('critical') || line.toLowerCase().includes('bug') ? 'critical' : 'warning',
        category: 'improvement',
        title: line.substring(0, 80),
        description: line,
      };
    } else if (currentFinding) {
      currentFinding.description = (currentFinding.description || '') + '\n' + line;
    }
  }

  if (currentFinding && currentFinding.description) {
    findings.push(currentFinding as AIFinding);
  }

  // If we couldn't extract any structured findings, create a single info finding
  if (findings.length === 0 && rawResponse.trim().length > 0) {
    findings.push({
      line: 1,
      severity: 'info',
      category: 'improvement',
      title: 'AI Review Feedback',
      description: rawResponse.substring(0, 1000),
    });
  }

  return { findings };
}
