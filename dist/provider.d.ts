import type { IAgentRuntime } from "@elizaos/core";
import { GatewayConfig } from "./types.js";
/**
 * Creates a Vercel AI Gateway provider instance
 * Uses OpenAI-compatible interface with Gateway base URL
 */
export declare function createGatewayProvider(config: GatewayConfig): import("@ai-sdk/openai").OpenAIProvider;
/**
 * Gets gateway configuration from runtime settings
 */
export declare function getGatewayConfig(runtime: IAgentRuntime): GatewayConfig;
/**
 * Default model mappings for different model types
 */
export declare const DEFAULT_MODELS: {
    readonly TEXT_SMALL: "openai/gpt-4o-mini";
    readonly TEXT_LARGE: "openai/gpt-4o";
    readonly TEXT_REASONING: "openai/o1";
    readonly OBJECT_SMALL: "openai/gpt-4o-mini";
    readonly OBJECT_LARGE: "anthropic/claude-3-5-sonnet-20241022";
    readonly TEXT_EMBEDDING: "openai/text-embedding-3-small";
    readonly IMAGE: "openai/dall-e-3";
    readonly IMAGE_DESCRIPTION: "openai/gpt-4o";
};
//# sourceMappingURL=provider.d.ts.map