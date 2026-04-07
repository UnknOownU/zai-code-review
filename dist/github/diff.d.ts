import { Octokit } from '@octokit/rest';
import { FileDiff, DiffHunk } from '../review/types';
/**
 * Fetch all files changed in a pull request with pagination.
 */
export declare function fetchPullRequestFiles(octokit: Octokit, owner: string, repo: string, pullNumber: number): Promise<FileDiff[]>;
/**
 * Parse unified diff content into structured hunks with line mappings.
 */
export declare function parseDiffHunks(diffContent: string): DiffHunk[];
/**
 * Check if a file path matches any of the exclude patterns.
 * Supports glob-like patterns: *.ext, prefix/*, exact match.
 */
export declare function isFileExcluded(filePath: string, excludePatterns: string[]): boolean;
/**
 * Filter files based on exclude patterns and limit.
 */
export declare function filterFiles(files: FileDiff[], excludePatterns: string[], maxFiles: number): FileDiff[];
//# sourceMappingURL=diff.d.ts.map