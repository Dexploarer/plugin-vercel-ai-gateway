import { createOpenAI } from "@ai-sdk/openai";
/**
 * Creates a Vercel AI Gateway provider instance
 * Uses OpenAI-compatible interface with Gateway base URL
 */
export function createGatewayProvider(config) {
    const { apiKey, baseURL = "https://ai-gateway.vercel.sh/v1", appTitle, httpReferer } = config;
    const headers = {};
    // Add app attribution headers for Gateway analytics
    if (appTitle) {
        headers["x-title"] = appTitle;
    }
    if (httpReferer) {
        headers["http-referer"] = httpReferer;
    }
    return createOpenAI({
        apiKey: apiKey || process.env.AI_GATEWAY_API_KEY || "",
        baseURL,
        headers,
    });
}
/**
 * Gets gateway configuration from runtime settings
 */
export function getGatewayConfig(runtime) {
    return {
        apiKey: runtime.getSetting("AI_GATEWAY_API_KEY") || runtime.getSetting("AIGATEWAY_API_KEY"),
        baseURL: runtime.getSetting("AI_GATEWAY_BASE_URL") || runtime.getSetting("AIGATEWAY_BASE_URL"),
        appTitle: runtime.getSetting("AI_GATEWAY_APP_TITLE") || runtime.getSetting("AIGATEWAY_APP_TITLE"),
        httpReferer: runtime.getSetting("AI_GATEWAY_HTTP_REFERER") || runtime.getSetting("AIGATEWAY_HTTP_REFERER"),
    };
}
/**
 * Default model mappings for different model types
 */
export const DEFAULT_MODELS = {
    TEXT_SMALL: "openai/gpt-4o-mini",
    TEXT_LARGE: "openai/gpt-4o",
    TEXT_REASONING: "openai/o1",
    OBJECT_SMALL: "openai/gpt-4o-mini",
    OBJECT_LARGE: "anthropic/claude-3-5-sonnet-20241022",
    TEXT_EMBEDDING: "openai/text-embedding-3-small",
    IMAGE: "openai/dall-e-3",
    IMAGE_DESCRIPTION: "openai/gpt-4o",
};
//# sourceMappingURL=provider.js.map