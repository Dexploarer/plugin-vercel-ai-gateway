import { IAgentRuntime } from "@elizaos/core";

/**
 * Get API key from environment
 */
export function getApiKey(runtime: IAgentRuntime): string | undefined {
  return (
    runtime.getSetting("AI_GATEWAY_API_KEY") ||
    runtime.getSetting("AIGATEWAY_API_KEY") ||
    process.env.AI_GATEWAY_API_KEY ||
    process.env.AIGATEWAY_API_KEY
  );
}

/**
 * Get base URL for the gateway
 */
export function getBaseURL(runtime: IAgentRuntime): string {
  return (
    runtime.getSetting("AIGATEWAY_BASE_URL") ||
    process.env.AIGATEWAY_BASE_URL ||
    "https://ai-gateway.vercel.sh/v1"
  );
}

/**
 * Get default small model
 */
export function getSmallModel(runtime: IAgentRuntime): string {
  return (
    runtime.getSetting("AIGATEWAY_DEFAULT_MODEL") ||
    process.env.AIGATEWAY_DEFAULT_MODEL ||
    "openai/gpt-4o-mini"
  );
}

/**
 * Get large model for complex tasks
 */
export function getLargeModel(runtime: IAgentRuntime): string {
  return (
    runtime.getSetting("AIGATEWAY_LARGE_MODEL") ||
    process.env.AIGATEWAY_LARGE_MODEL ||
    "openai/gpt-4o"
  );
}

/**
 * Get embedding model
 */
export function getEmbeddingModel(runtime: IAgentRuntime): string {
  return (
    runtime.getSetting("AIGATEWAY_EMBEDDING_MODEL") ||
    process.env.AIGATEWAY_EMBEDDING_MODEL ||
    "openai/text-embedding-3-small"
  );
}

/**
 * Get maximum retry attempts
 */
export function getMaxRetries(runtime: IAgentRuntime): number {
  const retries =
    runtime.getSetting("AIGATEWAY_MAX_RETRIES") ||
    process.env.AIGATEWAY_MAX_RETRIES;
  return retries ? parseInt(retries, 10) : 3;
}

/**
 * Get cache TTL in seconds
 */
export function getCacheTTL(runtime: IAgentRuntime): number {
  const ttl =
    runtime.getSetting("AIGATEWAY_CACHE_TTL") ||
    process.env.AIGATEWAY_CACHE_TTL;
  return ttl ? parseInt(ttl, 10) : 300;
}

/**
 * Check if OIDC authentication is enabled
 */
export function useOIDC(runtime: IAgentRuntime): boolean {
  const oidc =
    runtime.getSetting("AIGATEWAY_USE_OIDC") || process.env.AIGATEWAY_USE_OIDC;
  return oidc === "true" || oidc === true;
}

/**
 * Get request timeout in milliseconds
 */
export function getTimeout(runtime: IAgentRuntime): number {
  const timeout =
    runtime.getSetting("AIGATEWAY_TIMEOUT") || process.env.AIGATEWAY_TIMEOUT;
  return timeout ? parseInt(timeout, 10) : 30000;
}

/**
 * Get app name for attribution
 */
export function getAppName(runtime: IAgentRuntime): string {
  return (
    runtime.getSetting("AIGATEWAY_APP_NAME") ||
    process.env.AIGATEWAY_APP_NAME ||
    runtime.character?.name ||
    "ElizaOS-Agent"
  );
}

/**
 * Check if Grok models are enabled
 */
export function areGrokModelsEnabled(runtime: IAgentRuntime): boolean {
  const enabled =
    runtime.getSetting("AIGATEWAY_ENABLE_GROK_MODELS") ||
    process.env.AIGATEWAY_ENABLE_GROK_MODELS;
  return enabled === "true" || enabled === true;
}

/**
 * Check if model blocking is disabled (for advanced users)
 */
export function isModelBlockingDisabled(runtime: IAgentRuntime): boolean {
  const disabled =
    runtime.getSetting("AIGATEWAY_DISABLE_MODEL_BLOCKING") ||
    process.env.AIGATEWAY_DISABLE_MODEL_BLOCKING;
  return disabled === "true" || disabled === true;
}

/**
 * Get all configuration for debugging
 */
export function getConfig(runtime: IAgentRuntime) {
  return {
    apiKey: !!getApiKey(runtime),
    baseURL: getBaseURL(runtime),
    smallModel: getSmallModel(runtime),
    largeModel: getLargeModel(runtime),
    embeddingModel: getEmbeddingModel(runtime),
    maxRetries: getMaxRetries(runtime),
    cacheTTL: getCacheTTL(runtime),
    useOIDC: useOIDC(runtime),
    timeout: getTimeout(runtime),
    appName: getAppName(runtime),
    grokModelsEnabled: areGrokModelsEnabled(runtime),
    modelBlockingDisabled: isModelBlockingDisabled(runtime),
  };
}
