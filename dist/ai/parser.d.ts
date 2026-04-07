import { AIFileReviewResponse, AISummaryResponse } from '../review/types';
/**
 * Parse the AI response for a file review.
 * Handles various formats: clean JSON, markdown-wrapped JSON, or plain text fallback.
 */
export declare function parseFileReviewResponse(rawResponse: string): AIFileReviewResponse;
/**
 * Parse the AI response for a PR summary.
 */
export declare function parseSummaryResponse(rawResponse: string): AISummaryResponse;
//# sourceMappingURL=parser.d.ts.map