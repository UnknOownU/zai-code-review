import * as core from '@actions/core';
import { DiffHunk } from '../review/types';

/**
 * Maximum approximate character count per chunk (roughly ~4000 tokens).
 */
const DEFAULT_MAX_CHUNK_SIZE = 15000;

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
export function chunkDiff(diffContent: string, maxChunkSize: number = DEFAULT_MAX_CHUNK_SIZE): ChunkResult {
  if (!diffContent || diffContent.length === 0) {
    return { chunks: [], wasSplit: false };
  }

  if (diffContent.length <= maxChunkSize) {
    return { chunks: [diffContent], wasSplit: false };
  }

  core.info(`Diff is large (${diffContent.length} chars), splitting into chunks...`);

  // Split by hunk boundaries (@@ ... @@)
  const hunks = splitIntoHunks(diffContent);

  // Group hunks into chunks that fit within maxChunkSize
  const chunks: string[] = [];
  let currentChunk = '';

  for (let i = 0; i < hunks.length; i++) {
    const hunk = hunks[i];

    if (currentChunk.length + hunk.length > maxChunkSize && currentChunk.length > 0) {
      chunks.push(currentChunk);
      currentChunk = hunk;
    } else {
      currentChunk += (currentChunk ? '\n' : '') + hunk;
    }
  }

  if (currentChunk) {
    chunks.push(currentChunk);
  }

  // Handle case where a single hunk is larger than maxChunkSize
  const finalChunks: string[] = [];
  for (const chunk of chunks) {
    if (chunk.length > maxChunkSize) {
      const lineChunks = splitByLines(chunk, maxChunkSize);
      finalChunks.push(...lineChunks);
    } else {
      finalChunks.push(chunk);
    }
  }

  core.info(`Split diff into ${finalChunks.length} chunks.`);
  return { chunks: finalChunks, wasSplit: true };
}

/**
 * Split diff content into individual hunks.
 */
function splitIntoHunks(diffContent: string): string[] {
  const hunks: string[] = [];
  const lines = diffContent.split('\n');
  let currentHunk: string[] = [];

  for (const line of lines) {
    if (line.startsWith('@@') && currentHunk.length > 0) {
      hunks.push(currentHunk.join('\n'));
      currentHunk = [];
    }
    currentHunk.push(line);
  }

  if (currentHunk.length > 0) {
    hunks.push(currentHunk.join('\n'));
  }

  return hunks.length > 0 ? hunks : [diffContent];
}

/**
 * Force-split content by lines when hunks are too large.
 */
function splitByLines(content: string, maxSize: number): string[] {
  const chunks: string[] = [];
  const lines = content.split('\n');
  let currentChunk = '';

  for (const line of lines) {
    if (currentChunk.length + line.length + 1 > maxSize && currentChunk.length > 0) {
      chunks.push(currentChunk);
      currentChunk = '';
    }
    currentChunk += (currentChunk ? '\n' : '') + line;
  }

  if (currentChunk) {
    chunks.push(currentChunk);
  }

  return chunks;
}

/**
 * Estimate the number of tokens in a text string.
 * Rough approximation: 1 token ≈ 4 characters.
 */
export function estimateTokens(text: string): number {
  return Math.ceil(text.length / 4);
}
