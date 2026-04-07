export interface ActionConfig {
    zaiApiKey: string;
    zaiModel: string;
    zaiBaseUrl: string;
    zaiSystemPrompt: string;
    reviewerName: string;
    githubToken: string;
    repoOwner: string;
    repoName: string;
    pullNumber: number;
    commitId: string;
    prTitle: string;
    maxFiles: number;
    maxComments: number;
    excludePatterns: string[];
    language: string;
    autoApprove: boolean;
    useCodingPlan: boolean;
    enableThinking: boolean;
}
export declare function parseConfig(): ActionConfig;
