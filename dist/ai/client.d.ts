interface ChatMessage {
    role: 'system' | 'user' | 'assistant';
    content: string;
}
interface AIClientConfig {
    apiKey: string;
    baseUrl: string;
    model: string;
    maxRetries?: number;
    timeout?: number;
    useCodingPlan?: boolean;
}
/**
 * Z.ai API Client with retry logic, timeout, and error handling.
 */
export declare class ZaiClient {
    private apiKey;
    private baseUrl;
    private model;
    private maxRetries;
    private timeout;
    private useCodingPlan;
    constructor(config: AIClientConfig);
    chatCompletion(messages: ChatMessage[], options?: {
        temperature?: number;
        maxTokens?: number;
        responseFormat?: string;
    }): Promise<string>;
    /**
     * Make an HTTP request using Node.js built-in modules (no external deps needed).
     */
    private makeHttpRequest;
}
export {};
//# sourceMappingURL=client.d.ts.map