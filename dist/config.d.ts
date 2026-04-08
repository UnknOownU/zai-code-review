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
    customInstructions: string;
    incremental: boolean;
    chatAllowedRoles: string[];
    autofixMode: 'disabled' | 'suggest' | 'commit';
}
export declare function parseConfig(): Promise<ActionConfig>;
