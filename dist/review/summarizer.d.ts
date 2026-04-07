import { ZaiClient } from '../ai/client';
import { FileReview, ReviewSummary } from '../review/types';
export declare function generateSummary(aiClient: ZaiClient, prTitle: string, fileReviews: FileReview[], reviewerName: string, language: string): Promise<ReviewSummary>;
//# sourceMappingURL=summarizer.d.ts.map