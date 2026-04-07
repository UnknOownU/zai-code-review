/**
 * Severity levels for review findings.
 */
export enum Severity {
  Critical = 'critical',
  Warning = 'warning',
  Info = 'info',
}

/**
 * Categories of review feedback.
 */
export enum Category {
  Bug = 'bug',
  Security = 'security',
  Improvement = 'improvement',
  Nit = 'nit',
  Performance = 'performance',
  Style = 'style',
}

/**
 * Represents a single inline review comment on a specific line.
 */
export interface ReviewComment {
  /** File path relative to repo root */
  path: string;
  /** Line number in the diff (position in the diff hunk) */
  line: number;
  /** The review comment body (markdown) */
  body: string;
  /** Severity of the finding */
  severity: Severity;
  /** Category of the finding */
  category: Category;
  /** Optional code suggestion (click-to-apply) */
  suggestion?: string;
  /** Title/summary of the finding */
  title: string;
  /** Detailed description */
  description: string;
}

/**
 * Represents the review result for a single file.
 */
export interface FileReview {
  /** File path relative to repo root */
  path: string;
  /** List of review comments for this file */
  comments: ReviewComment[];
  /** Whether the review for this file had errors */
  error?: string;
  /** Number of lines added */
  additions?: number;
  /** Number of lines removed */
  deletions?: number;
}

/**
 * Represents the overall review summary for a PR.
 */
export interface ReviewSummary {
  /** Total number of critical issues */
  criticalCount: number;
  /** Total number of security issues */
  securityCount: number;
  /** Total number of warnings */
  warningCount: number;
  /** Total number of suggestions/info */
  suggestionCount: number;
  /** Key findings with file:line references */
  keyFindings: KeyFinding[];
  /** Overall verdict */
  verdict: ReviewVerdict;
  /** Summary text (markdown) */
  summaryText: string;
}

/**
 * A key finding to highlight in the summary.
 */
export interface KeyFinding {
  severity: Severity;
  category: Category;
  filePath: string;
  line: number;
  message: string;
}

/**
 * Overall verdict for the review.
 */
export enum ReviewVerdict {
  Approve = 'APPROVE',
  RequestChanges = 'REQUEST_CHANGES',
  Comment = 'COMMENT',
}

/**
 * Represents a parsed diff hunk with line number mapping.
 */
export interface DiffHunk {
  /** Old file start line */
  oldStart: number;
  /** Old file line count */
  oldLines: number;
  /** New file start line */
  newStart: number;
  /** New file line count */
  newLines: number;
  /** The raw diff content for this hunk */
  content: string;
  /** Lines with their types */
  lines: DiffLine[];
}

/**
 * Represents a single line in a diff.
 */
export interface DiffLine {
  /** Line type: added, removed, or context */
  type: 'added' | 'removed' | 'context';
  /** The line content */
  content: string;
  /** Line number in the new file (for added/context lines) */
  newLineNumber?: number;
  /** Line number in the old file (for removed/context lines) */
  oldLineNumber?: number;
  /** Position in the diff (for GitHub API comment positioning) */
  position?: number;
}

/**
 * Represents a file with its diff information.
 */
export interface FileDiff {
  /** File path */
  path: string;
  /** The full diff content */
  diff: string;
  /** Parsed hunks */
  hunks: DiffHunk[];
  /** Number of lines added */
  additions: number;
  /** Number of lines removed */
  deletions: number;
  /** Whether the file is binary */
  isBinary: boolean;
  /** File status (added, modified, removed, renamed) */
  status: string;
  /** SHA of the file (for positioning comments) */
  sha?: string;
}

/**
 * AI response format for a single file review.
 */
export interface AIFileReviewResponse {
  /** List of findings */
  findings: AIFinding[];
}

/**
 * A single finding from the AI review.
 */
export interface AIFinding {
  /** Line number in the diff */
  line: number;
  /** Severity level */
  severity: string;
  /** Category */
  category: string;
  /** Short title */
  title: string;
  /** Detailed description */
  description: string;
  /** Optional code suggestion */
  suggestion?: string;
}

/**
 * AI response format for the PR summary.
 */
export interface AISummaryResponse {
  /** List of changes */
  changes: string[];
  /** Points of attention */
  attentionPoints: string[];
  /** Overall verdict */
  verdict: 'approve' | 'request_changes' | 'comment';
  /** Summary text */
  summary: string;
}

/**
 * Marker used to identify comments created by this action.
 */
export const REVIEW_MARKER = '<!-- zai-code-review-marker -->';

/**
 * Maximum diff size in characters before chunking is applied.
 */
export const MAX_DIFF_SIZE = 15000;
