import { Plugin } from '@elizaos/core';

type EmbeddingsArgs = {
    input: string | string[];
    model?: string;
};
type ChatArgs = {
    model?: string;
    messages: Array<{
        role: "system" | "user" | "assistant";
        content: string;
    }>;
    maxTokens?: number;
    temperature?: number;
};
declare function createGatewayClient(env?: {
    apiKey?: string;
    baseURL?: string;
    oidcToken?: string;
}): {
    embeddings: (args: EmbeddingsArgs) => Promise<{
        vectors: number[][];
        dim: number;
    }>;
    chat: (args: ChatArgs) => Promise<{
        text: string;
    }>;
};

declare const plugin: Plugin;

export { createGatewayClient, plugin as default };
