/**
 * Result of chunking a file's diff.
 */
export interface ChunkResult {
    chunks: string[];
    wasSplit: boolean;
}
/**
 * Split a large diff into manageable chunks for AI processing.
 * Uses hunk boundaries for intelligent splitting.
 */
export declare function chunkDiff(diffContent: string, maxChunkSize?: number): ChunkResult;
/**
 * Estimate the number of tokens in a text string.
 * Rough approximation: 1 token ≈ 4 characters.
 */
export declare function estimateTokens(text: string): number;
//# sourceMappingURL=chunker.d.ts.map