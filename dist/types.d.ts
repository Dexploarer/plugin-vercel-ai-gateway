import type { IAgentRuntime } from "@elizaos/core";
export interface TextParams {
    prompt?: string;
    messages?: Array<{
        role: 'user' | 'assistant' | 'system';
        content: any;
    }>;
    temperature?: number;
    maxTokens?: number;
    stopSequences?: string[];
    model?: string;
    stream?: boolean;
    onToken?: (chunk: string) => void;
}
export interface ObjectParams {
    prompt: string;
    schema?: any;
    output?: 'object' | 'array' | 'enum' | 'no-schema';
    enumValues?: string[];
    temperature?: number;
    maxTokens?: number;
    model?: string;
    stream?: boolean;
    onChunk?: (jsonFragment: string) => void;
}
export interface EmbedParams {
    text: string;
    model?: string;
}
export interface ImageParams {
    prompt: string;
    size?: string;
    count?: number;
    model?: string;
}
export interface ImageDescriptionParams {
    imageUrl: string;
    prompt?: string;
    model?: string;
}
export interface ProviderOptions {
    providerOptions?: Record<string, any>;
}
export type Handler<TParams, TResult> = (runtime: IAgentRuntime, params: TParams & ProviderOptions) => Promise<TResult>;
export interface GatewayConfig {
    apiKey?: string;
    baseURL?: string;
    appTitle?: string;
    httpReferer?: string;
}
//# sourceMappingURL=types.d.ts.map