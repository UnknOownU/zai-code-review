export declare function getDefaultSystemPrompt(language: string): string;
export declare function buildFileReviewPrompt(filePath: string, diffContent: string, customSystemPrompt: string, language: string): {
    system: string;
    user: string;
};
export declare function buildSummaryPrompt(prTitle: string, filesSummary: {
    path: string;
    additions: number;
    deletions: number;
    findingsCount: number;
}[], allFindingsSummary: string, language: string): {
    system: string;
    user: string;
};
export declare function buildSummaryBody(reviewerName: string, changes: string[], attentionPoints: string[], verdict: string, summary: string, criticalCount: number, securityCount: number, warningCount: number, suggestionCount: number): string;
//# sourceMappingURL=prompts.d.ts.map