import * as core from '@actions/core';
import https from 'https';
import http from 'http';

interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface ChatCompletionRequest {
  model: string;
  messages: ChatMessage[];
  temperature?: number;
  max_tokens?: number;
  response_format?: { type: string };
  thinking?: { type: string };
}

interface ChatCompletionResponse {
  id: string;
  choices: {
    index: number;
    message: {
      role: string;
      content: string;
    };
    finish_reason: string;
  }[];
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

interface AIClientConfig {
  apiKey: string;
  baseUrl: string;
  model: string;
  maxRetries?: number;
  timeout?: number;
  useCodingPlan?: boolean;
  language?: string;
  enableThinking?: boolean;
}

/**
 * Z.ai API Client with retry logic, timeout, and error handling.
 */
export class ZaiClient {
  private apiKey: string;
  private baseUrl: string;
  private model: string;
  private maxRetries: number;
  private timeout: number;
  private useCodingPlan: boolean;
  private language: string;
  private enableThinking: boolean;

  constructor(config: AIClientConfig) {
    this.apiKey = config.apiKey;
    this.baseUrl = config.baseUrl.replace(/\/$/, '');
    this.model = config.model;
    this.maxRetries = config.maxRetries ?? 3;
    this.timeout = config.timeout ?? 60000;
    this.useCodingPlan = config.useCodingPlan ?? true;
    this.language = config.language ?? 'en';
    this.enableThinking = config.enableThinking ?? false;
  }

  async chatCompletion(
    messages: ChatMessage[],
    options?: { temperature?: number; maxTokens?: number; responseFormat?: string }
  ): Promise<string> {
    const body: ChatCompletionRequest = {
      model: this.model,
      messages,
      temperature: options?.temperature ?? 0.3,
      max_tokens: options?.maxTokens ?? 4096,
    };

    if (options?.responseFormat === 'json') {
      body.response_format = { type: 'json_object' };
    }

    if (this.enableThinking) {
      body.thinking = { type: 'enabled' };
    }

    const apiPath = this.useCodingPlan
      ? '/api/coding/paas/v4/chat/completions'
      : '/api/paas/v4/chat/completions';
    const url = `${this.baseUrl}${apiPath}`;
    const bodyStr = JSON.stringify(body);

    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= this.maxRetries; attempt++) {
      try {
        core.debug(`API call attempt ${attempt}/${this.maxRetries} to ${url}`);

        const result = await this.makeHttpRequest(url, bodyStr);
        const response = JSON.parse(result) as ChatCompletionResponse;

        if (!response.choices || response.choices.length === 0) {
          throw new Error('Empty response from API: no choices returned.');
        }

        const content = response.choices[0].message.content;
        core.debug(`API response received (${content.length} chars, ${response.usage?.total_tokens ?? 'unknown'} tokens)`);
        return content;
      } catch (error: any) {
        lastError = error;
        core.warning(`API call attempt ${attempt} failed: ${error.message}`);

        // 429: retry with backoff — quota may clear after a delay
        // Other 4xx: throw immediately — won't succeed on retry
        const statusMatch = error.message?.match(/status\s+(\d{3})/);
        const statusCode = statusMatch ? parseInt(statusMatch[1], 10) : 0;

        if (statusCode === 429 && attempt < this.maxRetries) {
          const delays = [15000, 30000]; // 15s, then 30s
          const delay = delays[attempt - 1] ?? 30000;
          core.info(`Rate limited (429). Retrying in ${delay / 1000}s... (attempt ${attempt}/${this.maxRetries})`);
          await sleep(delay);
          continue;
        }

        if (statusCode === 429) {
          // Exhausted all retries on rate limit
          throw new Error(
            'Z.ai rate limit exceeded (HTTP 429). Your Coding Plan quota may be exhausted. ' +
            'Check your usage at https://z.ai/manage-apikey/subscription \u2014 quota resets every 5 hours.'
          );
        }

        if (statusCode >= 400 && statusCode < 500) {
          throw error;
        }

        if (attempt < this.maxRetries) {
          // Exponential backoff: 1s, 2s, 4s
          const delay = Math.pow(2, attempt - 1) * 1000;
          core.info(`Retrying in ${delay}ms...`);
          await sleep(delay);
        }
      }
    }

    throw new Error(`All ${this.maxRetries} API call attempts failed. Last error: ${lastError?.message}`);
  }

  /**
   * Make an HTTP request using Node.js built-in modules (no external deps needed).
   */
  private makeHttpRequest(url: string, body: string): Promise<string> {
    return new Promise((resolve, reject) => {
      const parsedUrl = new URL(url);
      const isHttps = parsedUrl.protocol === 'https:';
      const transport = isHttps ? https : http;

      const options = {
        hostname: parsedUrl.hostname,
        port: parsedUrl.port || (isHttps ? 443 : 80),
        path: parsedUrl.pathname + parsedUrl.search,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
          'Accept-Language': this.language,
          'Content-Length': Buffer.byteLength(body),
          'User-Agent': 'zai-code-review-action/1.0.0',
        },
        timeout: this.timeout,
      };

      const req = transport.request(options, (res) => {
        let data = '';

        res.on('data', (chunk: Buffer | string) => {
          data += chunk.toString();
        });

        res.on('end', () => {
          if (res.statusCode && res.statusCode >= 200 && res.statusCode < 300) {
            resolve(data);
          } else {
            reject(new Error(
              `API returned status ${res.statusCode}: ${data.substring(0, 500)}`
            ));
          }
        });
      });

      req.on('error', (error: Error) => {
        reject(new Error(`HTTP request error: ${error.message}`));
      });

      req.on('timeout', () => {
        req.destroy();
        reject(new Error(`Request timed out after ${this.timeout}ms`));
      });

      req.write(body);
      req.end();
    });
  }
}

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}
