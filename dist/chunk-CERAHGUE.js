// src/providers/gateway-provider.ts
import {
  generateText,
  embed,
  experimental_generateImage as aiGenerateImage
} from "ai";
import { createOpenAI } from "@ai-sdk/openai";
import {
  logger as logger3,
  EventType,
  ModelType
} from "@elizaos/core";
import pRetry from "p-retry";

// src/utils/cache.ts
import { LRUCache } from "lru-cache";
import { logger } from "@elizaos/core";
var CacheService = class {
  constructor(ttlSeconds = 300) {
    this.ttl = ttlSeconds * 1e3;
    this.cache = new LRUCache({
      max: 1e3,
      // Maximum number of items
      ttl: this.ttl,
      updateAgeOnGet: true,
      updateAgeOnHas: true
    });
    logger.debug(
      `[AIGateway] Cache initialized with TTL: ${ttlSeconds}s, max items: 1000`
    );
  }
  /**
   * Generate a cache key from parameters
   */
  generateKey(params) {
    const key = JSON.stringify(params, Object.keys(params).sort());
    return Buffer.from(key).toString("base64").substring(0, 50);
  }
  /**
   * Get item from cache
   */
  get(key) {
    const value = this.cache.get(key);
    if (value !== void 0) {
      logger.debug(`[AIGateway] Cache hit for key: ${key.substring(0, 20)}...`);
    }
    return value;
  }
  /**
   * Set item in cache
   */
  set(key, value, ttlSeconds) {
    const ttl = ttlSeconds ? ttlSeconds * 1e3 : this.ttl;
    this.cache.set(key, value, { ttl });
    logger.debug(
      `[AIGateway] Cache set for key: ${key.substring(0, 20)}... (TTL: ${ttl / 1e3}s)`
    );
  }
  /**
   * Check if key exists in cache
   */
  has(key) {
    return this.cache.has(key);
  }
  /**
   * Delete item from cache
   */
  delete(key) {
    const deleted = this.cache.delete(key);
    if (deleted) {
      logger.debug(
        `[AIGateway] Cache deleted for key: ${key.substring(0, 20)}...`
      );
    }
    return deleted;
  }
  /**
   * Clear all cache
   */
  clear() {
    this.cache.clear();
    logger.debug("[AIGateway] Cache cleared");
  }
  /**
   * Get cache statistics
   */
  getStats() {
    return {
      size: this.cache.size,
      max: this.cache.max,
      ttl: this.ttl / 1e3,
      calculatedSize: this.cache.calculatedSize
    };
  }
  /**
   * Log cache statistics
   */
  logStats() {
    const stats = this.getStats();
    logger.info(
      `[AIGateway] Cache stats: ${stats.size}/${stats.max} items, TTL: ${stats.ttl}s`
    );
  }
};

// src/utils/config.ts
var DEFAULT_BASE_URL = "https://ai-gateway.vercel.sh/v1";
var DEFAULT_SMALL_MODEL = "openai/gpt-4o-mini";
var DEFAULT_LARGE_MODEL = "openai/gpt-4o";
var DEFAULT_EMBEDDING_MODEL = "openai/text-embedding-3-small";
var DEFAULT_IMAGE_MODEL = "dall-e-3";
function getSetting(runtime, key, defaultValue) {
  if (runtime && typeof runtime.getSetting === "function") {
    return runtime.getSetting(key) ?? process.env[key] ?? defaultValue;
  }
  return process.env[key] ?? defaultValue;
}
function getApiKey(runtime) {
  return getSetting(runtime, "AIGATEWAY_API_KEY") || getSetting(runtime, "AI_GATEWAY_API_KEY");
}
function getBaseURL(runtime) {
  return getSetting(runtime, "AIGATEWAY_BASE_URL") || getSetting(runtime, "AI_GATEWAY_BASE_URL") || DEFAULT_BASE_URL;
}
function getSmallModel(runtime) {
  return getSetting(runtime, "AIGATEWAY_DEFAULT_MODEL") || getSetting(runtime, "AI_GATEWAY_DEFAULT_MODEL") || DEFAULT_SMALL_MODEL;
}
function getLargeModel(runtime) {
  return getSetting(runtime, "AIGATEWAY_LARGE_MODEL") || getSetting(runtime, "AI_GATEWAY_LARGE_MODEL") || DEFAULT_LARGE_MODEL;
}
function getEmbeddingModel(runtime) {
  return getSetting(runtime, "AIGATEWAY_EMBEDDING_MODEL") || getSetting(runtime, "AI_GATEWAY_EMBEDDING_MODEL") || DEFAULT_EMBEDDING_MODEL;
}
function getImageModel(runtime) {
  return getSetting(runtime, "AIGATEWAY_IMAGE_MODEL") || getSetting(runtime, "AI_GATEWAY_IMAGE_MODEL") || DEFAULT_IMAGE_MODEL;
}
function getMaxRetries(runtime) {
  const retries = getSetting(runtime, "AIGATEWAY_MAX_RETRIES") || getSetting(runtime, "AI_GATEWAY_MAX_RETRIES");
  const parsed = retries ? parseInt(retries, 10) : NaN;
  return !isNaN(parsed) ? parsed : 3;
}
function getCacheTTL(runtime) {
  const ttl = getSetting(runtime, "AIGATEWAY_CACHE_TTL") || getSetting(runtime, "AI_GATEWAY_CACHE_TTL");
  const parsed = ttl ? parseInt(ttl, 10) : NaN;
  return !isNaN(parsed) ? parsed : 300;
}
function useOIDC(runtime) {
  const oidc = getSetting(runtime, "AIGATEWAY_USE_OIDC") || getSetting(runtime, "AI_GATEWAY_USE_OIDC");
  return oidc === "true" || oidc === "1" || oidc === true;
}
function getTimeout(runtime) {
  const timeout = getSetting(runtime, "AIGATEWAY_TIMEOUT") || getSetting(runtime, "AI_GATEWAY_TIMEOUT");
  const parsed = timeout ? parseInt(timeout, 10) : NaN;
  return !isNaN(parsed) ? parsed : 3e4;
}
function getAppName(runtime) {
  return getSetting(runtime, "AIGATEWAY_APP_NAME") || getSetting(runtime, "AI_GATEWAY_APP_NAME") || runtime.character?.name || "ElizaOS-Agent";
}
function areGrokModelsEnabled(runtime) {
  const enabled = getSetting(runtime, "AIGATEWAY_ENABLE_GROK_MODELS") || getSetting(runtime, "AI_GATEWAY_ENABLE_GROK_MODELS");
  return enabled === "true" || enabled === "1" || enabled === true;
}
function isModelBlockingDisabled(runtime) {
  const disabled = getSetting(runtime, "AIGATEWAY_DISABLE_MODEL_BLOCKING") || getSetting(runtime, "AI_GATEWAY_DISABLE_MODEL_BLOCKING");
  return disabled === "true" || disabled === "1" || disabled === true;
}
function getConfig(runtime) {
  return {
    apiKey: getApiKey(runtime),
    baseURL: getBaseURL(runtime),
    defaultModel: getSmallModel(runtime),
    largeModel: getLargeModel(runtime),
    embeddingModel: getEmbeddingModel(runtime),
    imageModel: getImageModel(runtime),
    maxRetries: getMaxRetries(runtime),
    cacheTTL: getCacheTTL(runtime),
    useOIDC: useOIDC(runtime),
    timeout: getTimeout(runtime),
    appName: getAppName(runtime),
    grokModelsEnabled: areGrokModelsEnabled(runtime),
    modelBlockingDisabled: isModelBlockingDisabled(runtime)
  };
}
function areCentralRoutesEnabled(runtime) {
  const v = runtime?.getSetting?.("AIGATEWAY_ENABLE_CENTRAL_ROUTES") ?? process.env.AIGATEWAY_ENABLE_CENTRAL_ROUTES;
  return v === void 0 || v === null ? true : v === "true" || v === "1" || v === true;
}
function getCentralRateLimitPerMin(runtime) {
  const v = runtime?.getSetting?.("AIGATEWAY_CENTRAL_RATE_LIMIT_PER_MIN") ?? process.env.AIGATEWAY_CENTRAL_RATE_LIMIT_PER_MIN;
  const n = v ? parseInt(String(v), 10) : NaN;
  return Number.isFinite(n) && n > 0 ? n : 60;
}
function getInternalToken(runtime) {
  return runtime?.getSetting?.("AIGATEWAY_INTERNAL_TOKEN") ?? process.env.AIGATEWAY_INTERNAL_TOKEN ?? void 0;
}

// src/utils/model-controls.ts
import { logger as logger2 } from "@elizaos/core";
var GROK_MODEL_PATTERNS = [
  // xAI provider format
  /^xai\/grok-code-fast-1$/i,
  /^xai\/grok-4$/i,
  /^xai\/grok-3-fast-beta$/i,
  /^xai\/grok-3-mini-beta$/i,
  /^xai\/grok-3-beta$/i,
  /^xai\/grok-2$/i,
  /^xai\/grok-2-vision$/i,
  // Alternative formats that might be used
  /^xai\/grok/i,
  /^grok-/i,
  /^grok[0-9]/i,
  /grok.*code.*fast/i,
  /grok.*fast.*beta/i,
  /grok.*mini.*beta/i,
  /grok.*beta/i,
  /grok.*vision/i,
  // Catch any xai models
  /^xai\//i
];
function isGrokModel(modelName) {
  return GROK_MODEL_PATTERNS.some((pattern) => pattern.test(modelName));
}
function areGrokModelsEnabled2(runtime) {
  try {
    return areGrokModelsEnabled(runtime);
  } catch {
    const grokEnabled = runtime?.getSetting?.("AIGATEWAY_ENABLE_GROK_MODELS");
    return grokEnabled === "true" || grokEnabled === true;
  }
}
function validateModelAccess(modelName, runtime) {
  if (isGrokModel(modelName)) {
    if (!areGrokModelsEnabled2(runtime)) {
      return {
        allowed: false,
        reason: "Grok/xAI models are disabled by default in support of ElizaOS",
        suggestion: "To override this protection, set AIGATEWAY_ENABLE_GROK_MODELS=true in your environment"
      };
    }
  }
  return { allowed: true };
}
function logModelAccess(modelName, allowed, reason) {
  if (allowed) {
    if (isGrokModel(modelName)) {
      logger2.warn(
        `[AIGateway] Grok model access granted (user override): ${modelName}`
      );
    } else {
      logger2.info(`[AIGateway] Model access granted: ${modelName}`);
    }
  } else {
    if (isGrokModel(modelName)) {
      logger2.info(
        `[AIGateway] Grok model blocked in support of ElizaOS: ${modelName}`
      );
    } else {
      logger2.warn(`[AIGateway] Model access denied: ${modelName} - ${reason}`);
    }
  }
}
function getAlternativeModel(modelName) {
  if (isGrokModel(modelName)) {
    if (/grok-4/i.test(modelName)) {
      return "openai/gpt-4o";
    }
    if (/grok.*code/i.test(modelName)) {
      return "openai/gpt-4o";
    }
    if (/grok-3.*fast/i.test(modelName)) {
      return "anthropic/claude-3-5-sonnet";
    }
    if (/grok.*mini/i.test(modelName)) {
      return "openai/gpt-4o-mini";
    }
    if (/grok.*vision/i.test(modelName)) {
      return "openai/gpt-4o";
    }
    return "openai/gpt-4o";
  }
  return "openai/gpt-4o-mini";
}
function validateAndSuggestModel(modelName, runtime) {
  const validation = validateModelAccess(modelName, runtime);
  if (validation.allowed) {
    return {
      modelToUse: modelName,
      wasBlocked: false
    };
  }
  const alternativeModel = getAlternativeModel(modelName);
  if (isGrokModel(modelName)) {
    logger2.info(
      `[AIGateway] Grok model ${modelName} blocked in support of ElizaOS`
    );
    logger2.info(`[AIGateway] Using alternative model: ${alternativeModel}`);
    logger2.info(`[AIGateway] ${validation.suggestion}`);
  } else {
    logger2.warn(`[AIGateway] Blocked ${modelName}: ${validation.reason}`);
    logger2.info(`[AIGateway] Using alternative: ${alternativeModel}`);
    logger2.info(`[AIGateway] To use original model: ${validation.suggestion}`);
  }
  return {
    modelToUse: alternativeModel,
    wasBlocked: true,
    originalModel: modelName,
    reason: validation.reason
  };
}
function applyModelControls(modelName, config) {
  const result = validateAndSuggestModel(modelName, config);
  logModelAccess(modelName, !result.wasBlocked, result.reason);
  return result.modelToUse;
}

// src/providers/gateway-provider.ts
var GatewayProvider = class {
  constructor(runtime) {
    this.runtime = runtime;
    this.cache = new CacheService(getCacheTTL(runtime));
    logger3.info(
      `[AIGateway] Initializing Gateway Provider with Model Controls`
    );
    logger3.info(`[AIGateway] Base URL: ${getBaseURL(runtime)}`);
    logger3.info(`[AIGateway] OIDC enabled: ${useOIDC(runtime)}`);
    logger3.info(`[AIGateway] API Key configured: ${!!getApiKey(runtime)}`);
    logger3.info(
      `[AIGateway] Model blocking disabled: ${isModelBlockingDisabled(
        runtime
      )}`
    );
  }
  /**
   * Generate streaming text for small models
   */
  async generateTextSmallStreaming(runtime, params) {
    const { StreamingGatewayProvider } = await import("./streaming-gateway-provider-34AIFXZ3.js");
    const streamingProvider = new StreamingGatewayProvider(runtime);
    return streamingProvider.generateTextSmallStream(runtime, params);
  }
  /**
   * Generate streaming text for large models
   */
  async generateTextLargeStreaming(runtime, params) {
    const { StreamingGatewayProvider } = await import("./streaming-gateway-provider-34AIFXZ3.js");
    const streamingProvider = new StreamingGatewayProvider(runtime);
    return streamingProvider.generateTextLargeStream(runtime, params);
  }
  /**
   * Generate streaming objects
   */
  async generateObjectStreaming(runtime, params, modelSize = "large") {
    const { StreamingGatewayProvider } = await import("./streaming-gateway-provider-34AIFXZ3.js");
    const streamingProvider = new StreamingGatewayProvider(runtime);
    return streamingProvider.generateObjectStream(runtime, params, modelSize);
  }
  /**
   * Validate and potentially replace a model based on user settings
   */
  validateModel(requestedModel) {
    if (isModelBlockingDisabled(this.runtime)) {
      logger3.debug(
        `[AIGateway] Model blocking disabled, using requested model: ${requestedModel}`
      );
      return requestedModel;
    }
    const validation = validateAndSuggestModel(requestedModel, this.runtime);
    logModelAccess(requestedModel, !validation.wasBlocked, validation.reason);
    if (validation.wasBlocked) {
      logger3.warn(
        `[AIGateway] Model ${requestedModel} blocked, using ${validation.modelToUse} instead`
      );
    }
    return validation.modelToUse;
  }
  /**
   * Generate text using small model with validation
   */
  async generateTextSmall(params) {
    const requestedModel = getSmallModel(this.runtime);
    const modelToUse = this.validateModel(requestedModel);
    logger3.info(`[AIGateway] Using TEXT_SMALL model: ${modelToUse}`);
    const cacheKey = this.cache.generateKey({ model: modelToUse, ...params });
    const cached = this.cache.get(cacheKey);
    if (cached) {
      logger3.debug("[AIGateway] Cache hit for TEXT_SMALL");
      return cached;
    }
    const result = await pRetry(
      async () => {
        const messages = [];
        if (this.runtime.character?.system) {
          messages.push({
            role: "system",
            content: this.runtime.character.system
          });
        }
        messages.push({ role: "user", content: params.prompt });
        const openai = createOpenAI({
          apiKey: getApiKey(this.runtime),
          baseURL: getBaseURL(this.runtime)
        });
        const smallId = modelToUse.includes("/") ? modelToUse.split("/")[1] : modelToUse;
        const smallModel = openai(smallId);
        const response = await generateText({
          model: smallModel,
          messages,
          temperature: params.temperature ?? 0.7,
          maxTokens: params.maxTokens ?? 2048,
          frequencyPenalty: params.frequencyPenalty ?? 0.7,
          presencePenalty: params.presencePenalty ?? 0.7,
          ...params.stopSequences && params.stopSequences.length > 0 ? { stopSequences: params.stopSequences } : {}
        });
        return response.text;
      },
      {
        retries: getMaxRetries(this.runtime),
        onFailedAttempt: (error) => {
          logger3.warn(
            `[AIGateway] TEXT_SMALL attempt ${error.attemptNumber} failed: ${error.message}`
          );
        }
      }
    );
    logger3.debug("[AIGateway] Caching TEXT_SMALL result");
    this.cache.set(cacheKey, result, getCacheTTL(this.runtime));
    return result;
  }
  /**
   * Generate text using large model with validation
   */
  async generateTextLarge(params) {
    const requestedModel = getLargeModel(this.runtime);
    const modelToUse = this.validateModel(requestedModel);
    logger3.info(`[AIGateway] Using TEXT_LARGE model: ${modelToUse}`);
    const cacheKey = this.cache.generateKey({ model: modelToUse, ...params });
    const cached = this.cache.get(cacheKey);
    if (cached) {
      logger3.debug("[AIGateway] Cache hit for TEXT_LARGE");
      return cached;
    }
    const result = await pRetry(
      async () => {
        const messages = [];
        if (this.runtime.character?.system) {
          messages.push({
            role: "system",
            content: this.runtime.character.system
          });
        }
        messages.push({ role: "user", content: params.prompt });
        const openai = createOpenAI({
          apiKey: getApiKey(this.runtime),
          baseURL: getBaseURL(this.runtime)
        });
        const largeId = modelToUse.includes("/") ? modelToUse.split("/")[1] : modelToUse;
        const largeModel = openai(largeId);
        const response = await generateText({
          model: largeModel,
          messages,
          temperature: params.temperature ?? 0.7,
          maxTokens: params.maxTokens ?? 4096,
          frequencyPenalty: params.frequencyPenalty ?? 0.7,
          presencePenalty: params.presencePenalty ?? 0.7,
          ...params.stopSequences && params.stopSequences.length > 0 ? { stopSequences: params.stopSequences } : {}
        });
        return response.text;
      },
      {
        retries: getMaxRetries(this.runtime),
        onFailedAttempt: (error) => {
          logger3.warn(
            `[AIGateway] TEXT_LARGE attempt ${error.attemptNumber} failed: ${error.message}`
          );
        }
      }
    );
    logger3.debug("[AIGateway] Caching TEXT_LARGE result");
    this.cache.set(cacheKey, result, getCacheTTL(this.runtime));
    return result;
  }
  /**
   * Generate embeddings using embedding model with validation
   */
  async generateEmbedding(params) {
    const requestedModel = getEmbeddingModel(this.runtime);
    const modelToUse = this.validateModel(requestedModel);
    logger3.info(`[AIGateway] Using embedding model: ${modelToUse}`);
    const cacheKey = `embedding:${modelToUse}:${params.text}`;
    logger3.debug("[AIGateway] Checking cache for embedding");
    const cached = this.cache.get(cacheKey);
    if (cached) {
      logger3.debug("[AIGateway] Cache hit for embedding");
      return cached;
    }
    const result = await pRetry(
      async () => {
        logger3.info(
          `[AIGateway] Embedding request - Model: ${modelToUse}, Text: "${params.text}"`
        );
        const embeddingModel = {
          modelId: modelToUse,
          specificationVersion: "v1",
          provider: "aigateway",
          maxEmbeddingsPerCall: 1,
          supportsParallelCalls: false,
          doEmbed: async ({ values, headers, abortSignal }) => {
            const token = getApiKey(this.runtime) || process.env.VERCEL_OIDC_TOKEN;
            const response2 = await fetch(
              `${getBaseURL(this.runtime)}/embeddings`,
              {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  ...token ? { Authorization: `Bearer ${token}` } : {},
                  ...headers
                },
                body: JSON.stringify({
                  model: modelToUse,
                  input: values[0]
                }),
                signal: abortSignal
              }
            );
            if (!response2.ok) {
              const errorText = await response2.text();
              throw new Error(`HTTP ${response2.status}: ${errorText}`);
            }
            const data = await response2.json();
            return {
              embeddings: [data.data[0].embedding]
            };
          }
        };
        const response = await embed({
          model: embeddingModel,
          value: params.text
        });
        return response.embedding;
      },
      {
        retries: getMaxRetries(this.runtime),
        onFailedAttempt: (error) => {
          logger3.warn(
            `[AIGateway] Embedding attempt ${error.attemptNumber} failed: ${error.message}`
          );
        }
      }
    );
    logger3.debug("[AIGateway] Caching embedding result");
    this.cache.set(cacheKey, result, getCacheTTL(this.runtime));
    return result;
  }
  /**
   * Generate image
   */
  async generateImage(params) {
    const requestedModel = getImageModel(this.runtime);
    const modelToUse = this.validateModel(requestedModel);
    logger3.info(`[AIGateway] Using IMAGE model: ${modelToUse}`);
    try {
      this.runtime.emitEvent(EventType.MODEL_USED, {
        provider: "aigateway",
        type: ModelType.IMAGE,
        tokens: 0,
        model: modelToUse
      });
    } catch (error) {
      logger3.warn(
        `[AIGateway] Failed to emit model usage event: ${error.message}`
      );
    }
    const result = await pRetry(
      async () => {
        const openai = createOpenAI({
          apiKey: getApiKey(this.runtime),
          baseURL: getBaseURL(this.runtime)
        });
        const imageModel = openai.image(modelToUse);
        const response = await aiGenerateImage({
          model: imageModel,
          prompt: params.prompt,
          n: params.count,
          size: params.size
        });
        return response.images.map((image) => ({
          url: image.url,
          revisedPrompt: image.revisedPrompt
        }));
      },
      {
        retries: getMaxRetries(this.runtime),
        onFailedAttempt: (error) => {
          logger3.warn(
            `[AIGateway] IMAGE attempt ${error.attemptNumber} failed: ${error.message}`
          );
        }
      }
    );
    return result;
  }
  /**
   * Private method to generate object with validation
   */
  async _generateObject(params, modelSize) {
    const { getModel, textGenerator, maxTokens, modelType } = modelSize === "small" ? {
      getModel: getSmallModel,
      textGenerator: this.generateTextSmall.bind(this),
      maxTokens: 2048,
      modelType: "OBJECT_SMALL"
    } : {
      getModel: getLargeModel,
      textGenerator: this.generateTextLarge.bind(this),
      maxTokens: 4096,
      modelType: "OBJECT_LARGE"
    };
    const requestedModel = getModel(this.runtime);
    const modelToUse = this.validateModel(requestedModel);
    logger3.info(`[AIGateway] Using ${modelType} model: ${modelToUse}`);
    const cacheKey = this.cache.generateKey({ model: modelToUse, ...params });
    const cached = this.cache.get(cacheKey);
    if (cached) {
      logger3.debug(`[AIGateway] Cache hit for ${modelType}`);
      return cached;
    }
    logger3.warn(
      `[AIGateway] Object generation not yet fully implemented - falling back to text generation`
    );
    const textParams = Object.fromEntries(
      Object.entries({
        prompt: params.prompt,
        temperature: params.temperature,
        maxTokens,
        stopSequences: params.stopSequences,
        frequencyPenalty: params.frequencyPenalty,
        presencePenalty: params.presencePenalty
      }).filter(([, v]) => v !== void 0)
    );
    const textResult = await textGenerator(textParams);
    try {
      const result = JSON.parse(textResult);
      this.cache.set(cacheKey, result, getCacheTTL(this.runtime));
      return result;
    } catch (error) {
      logger3.error(
        `[AIGateway] JSON parse error in ${modelType}: ${error.message}`
      );
      logger3.debug(
        `[AIGateway] Failed text content: ${textResult.substring(0, 500)}${textResult.length > 500 ? "..." : ""}`
      );
      return { text: textResult };
    }
  }
  /**
   * Generate object using small model with validation
   */
  async generateObjectSmall(params) {
    return this._generateObject(params, "small");
  }
  /**
   * Generate object using large model with validation
   */
  async generateObjectLarge(params) {
    return this._generateObject(params, "large");
  }
};

export {
  getConfig,
  areCentralRoutesEnabled,
  getCentralRateLimitPerMin,
  getInternalToken,
  applyModelControls,
  GatewayProvider
};
