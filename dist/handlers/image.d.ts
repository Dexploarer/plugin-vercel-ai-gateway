import type { IAgentRuntime } from "@elizaos/core";
/**
 * Image generation handler (placeholder - Gateway doesn't support image generation yet)
 */
export declare function imageHandler(runtime: IAgentRuntime, params: {
    prompt: string;
    count?: number;
    size?: string;
    model?: string;
}): Promise<{
    url: string;
    revisedPrompt?: string;
}[]>;
/**
 * Image description handler using vision models
 */
export declare function imageDescriptionHandler(runtime: IAgentRuntime, params: {
    imageUrl: string;
    prompt?: string;
    model?: string;
}): Promise<{
    title: string;
    description: string;
}>;
//# sourceMappingURL=image.d.ts.map