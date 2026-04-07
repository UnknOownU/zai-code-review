import { ZaiClient } from '../ai/client';
import { FileDiff, FileReview } from '../review/types';
/**
 * Review a single file by sending its diff to the AI for analysis.
 * Handles chunking for large diffs and maps AI findings to proper line numbers.
 */
export declare function reviewFile(aiClient: ZaiClient, file: FileDiff, customSystemPrompt: string, language: string, customInstructions?: string): Promise<FileReview>;
/**
 * Review multiple files in parallel with limited concurrency.
 */
export declare function reviewFiles(aiClient: ZaiClient, files: FileDiff[], customSystemPrompt: string, language: string, concurrency?: number, customInstructions?: string): Promise<FileReview[]>;
//# sourceMappingURL=reviewer.d.ts.map