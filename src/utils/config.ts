import { IAgentRuntime } from "@elizaos/core";

/**
 * Retrieves a configuration setting from the runtime, falling back to environment variables or a default value if not found.
 */
function getSetting(
  runtime: IAgentRuntime,
  key: string,
  defaultValue?: string,
): string | undefined {
  // Handle case where runtime might not have getSetting method
  if (runtime && typeof runtime.getSetting === "function") {
    return runtime.getSetting(key) ?? process.env[key] ?? defaultValue;
  }
  return process.env[key] ?? defaultValue;
}

/**
 * Get API key from environment
 */
export function getApiKey(runtime: IAgentRuntime): string | undefined {
  return (
    getSetting(runtime, "AIGATEWAY_API_KEY") ||
    getSetting(runtime, "AI_GATEWAY_API_KEY") ||
    undefined
  );
}

/**
 * Get base URL for the gateway
 */
export function getBaseURL(runtime: IAgentRuntime): string {
  return (
    getSetting(runtime, "AIGATEWAY_BASE_URL") ||
    getSetting(runtime, "AI_GATEWAY_BASE_URL") ||
    "https://ai-gateway.vercel.sh/v1"
  )!;
}

/**
 * Get default small model
 */
export function getSmallModel(runtime: IAgentRuntime): string {
  return (
    getSetting(runtime, "AIGATEWAY_DEFAULT_MODEL") ||
    getSetting(runtime, "AI_GATEWAY_DEFAULT_MODEL") ||
    "openai/gpt-4o-mini"
  )!;
}

/**
 * Get large model for complex tasks
 */
export function getLargeModel(runtime: IAgentRuntime): string {
  return (
    getSetting(runtime, "AIGATEWAY_LARGE_MODEL") ||
    getSetting(runtime, "AI_GATEWAY_LARGE_MODEL") ||
    "openai/gpt-4o"
  )!;
}

/**
 * Get embedding model
 */
export function getEmbeddingModel(runtime: IAgentRuntime): string {
  return (
    getSetting(runtime, "AIGATEWAY_EMBEDDING_MODEL") ||
    getSetting(runtime, "AI_GATEWAY_EMBEDDING_MODEL") ||
    "openai/text-embedding-3-small"
  )!;
}

/**
 * Get maximum retry attempts
 */
export function getMaxRetries(runtime: IAgentRuntime): number {
  const retries =
    getSetting(runtime, "AIGATEWAY_MAX_RETRIES") ||
    getSetting(runtime, "AI_GATEWAY_MAX_RETRIES");
  const parsed = retries ? parseInt(retries, 10) : NaN;
  return !isNaN(parsed) ? parsed : 3;
}

/**
 * Get cache TTL in seconds
 */
export function getCacheTTL(runtime: IAgentRuntime): number {
  const ttl =
    getSetting(runtime, "AIGATEWAY_CACHE_TTL") ||
    getSetting(runtime, "AI_GATEWAY_CACHE_TTL");
  const parsed = ttl ? parseInt(ttl, 10) : NaN;
  return !isNaN(parsed) ? parsed : 300;
}

/**
 * Check if OIDC authentication is enabled
 */
export function useOIDC(runtime: IAgentRuntime): boolean {
  const oidc =
    getSetting(runtime, "AIGATEWAY_USE_OIDC") ||
    getSetting(runtime, "AI_GATEWAY_USE_OIDC");
  return oidc === "true" || oidc === "1" || oidc === true;
}

/**
 * Get request timeout in milliseconds
 */
export function getTimeout(runtime: IAgentRuntime): number {
  const timeout =
    getSetting(runtime, "AIGATEWAY_TIMEOUT") ||
    getSetting(runtime, "AI_GATEWAY_TIMEOUT");
  const parsed = timeout ? parseInt(timeout, 10) : NaN;
  return !isNaN(parsed) ? parsed : 30000;
}

/**
 * Get app name for attribution
 */
export function getAppName(runtime: IAgentRuntime): string {
  return (
    getSetting(runtime, "AIGATEWAY_APP_NAME") ||
    getSetting(runtime, "AI_GATEWAY_APP_NAME") ||
    runtime.character?.name ||
    "ElizaOS-Agent"
  );
}

/**
 * Check if Grok models are enabled
 */
export function areGrokModelsEnabled(runtime: IAgentRuntime): boolean {
  const enabled =
    getSetting(runtime, "AIGATEWAY_ENABLE_GROK_MODELS") ||
    getSetting(runtime, "AI_GATEWAY_ENABLE_GROK_MODELS");
  return enabled === "true" || enabled === "1" || enabled === true;
}

/**
 * Check if model blocking is disabled (for advanced users)
 */
export function isModelBlockingDisabled(runtime: IAgentRuntime): boolean {
  const disabled =
    getSetting(runtime, "AIGATEWAY_DISABLE_MODEL_BLOCKING") ||
    getSetting(runtime, "AI_GATEWAY_DISABLE_MODEL_BLOCKING");
  return disabled === "true" || disabled === "1" || disabled === true;
}

/**
 * Get all configuration for debugging
 */
export function getConfig(runtime: IAgentRuntime) {
  return {
    apiKey: getApiKey(runtime),
    baseURL: getBaseURL(runtime),
    defaultModel: getSmallModel(runtime),
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

/**
 * Central routes toggle (enabled by default)
 */
export function areCentralRoutesEnabled(runtime: IAgentRuntime): boolean {
  const v = (runtime as any)?.getSetting?.("AIGATEWAY_ENABLE_CENTRAL_ROUTES") ?? process.env.AIGATEWAY_ENABLE_CENTRAL_ROUTES;
  return v === undefined || v === null ? true : v === "true" || v === "1" || v === true;
}

/**
 * Central routes rate limit (requests per minute, default 60)
 */
export function getCentralRateLimitPerMin(runtime: IAgentRuntime): number {
  const v = (runtime as any)?.getSetting?.("AIGATEWAY_CENTRAL_RATE_LIMIT_PER_MIN") ?? process.env.AIGATEWAY_CENTRAL_RATE_LIMIT_PER_MIN;
  const n = v ? parseInt(String(v), 10) : NaN;
  return Number.isFinite(n) && n > 0 ? n : 60;
}

/**
 * Internal token used to authorize central routes
 */
export function getInternalToken(runtime: IAgentRuntime): string | undefined {
  return (runtime as any)?.getSetting?.("AIGATEWAY_INTERNAL_TOKEN") ?? process.env.AIGATEWAY_INTERNAL_TOKEN ?? undefined;
}
