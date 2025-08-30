// src/index.ts
import {
  ModelType,
  logger as logger4
} from "@elizaos/core";

// src/providers/gateway-provider.ts
import { generateText, embed } from "ai";
import {
  logger as logger3
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
    logger.debug(`[AIGateway] Cache initialized with TTL: ${ttlSeconds}s, max items: 1000`);
  }
  /**
   * Generate a cache key from parameters
   */
  generateKey(params) {
    const keyData = {
      ...params,
      // Ensure consistent ordering
      timestamp: Math.floor(Date.now() / (this.ttl / 1e3))
      // Group by TTL periods
    };
    delete keyData.timestamp;
    const key = JSON.stringify(keyData, Object.keys(keyData).sort());
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
    logger.debug(`[AIGateway] Cache set for key: ${key.substring(0, 20)}... (TTL: ${ttl / 1e3}s)`);
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
      logger.debug(`[AIGateway] Cache deleted for key: ${key.substring(0, 20)}...`);
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
    logger.info(`[AIGateway] Cache stats: ${stats.size}/${stats.max} items, TTL: ${stats.ttl}s`);
  }
};

// src/utils/config.ts
function getApiKey(runtime) {
  return runtime.getSetting("AI_GATEWAY_API_KEY") || runtime.getSetting("AIGATEWAY_API_KEY") || process.env.AI_GATEWAY_API_KEY || process.env.AIGATEWAY_API_KEY;
}
function getBaseURL(runtime) {
  return runtime.getSetting("AIGATEWAY_BASE_URL") || process.env.AIGATEWAY_BASE_URL || "https://ai-gateway.vercel.sh/v1";
}
function getSmallModel(runtime) {
  return runtime.getSetting("AIGATEWAY_DEFAULT_MODEL") || process.env.AIGATEWAY_DEFAULT_MODEL || "openai/gpt-4o-mini";
}
function getLargeModel(runtime) {
  return runtime.getSetting("AIGATEWAY_LARGE_MODEL") || process.env.AIGATEWAY_LARGE_MODEL || "openai/gpt-4o";
}
function getEmbeddingModel(runtime) {
  return runtime.getSetting("AIGATEWAY_EMBEDDING_MODEL") || process.env.AIGATEWAY_EMBEDDING_MODEL || "openai/text-embedding-3-small";
}
function getMaxRetries(runtime) {
  const retries = runtime.getSetting("AIGATEWAY_MAX_RETRIES") || process.env.AIGATEWAY_MAX_RETRIES;
  return retries ? parseInt(retries, 10) : 3;
}
function getCacheTTL(runtime) {
  const ttl = runtime.getSetting("AIGATEWAY_CACHE_TTL") || process.env.AIGATEWAY_CACHE_TTL;
  return ttl ? parseInt(ttl, 10) : 300;
}
function useOIDC(runtime) {
  const oidc = runtime.getSetting("AIGATEWAY_USE_OIDC") || process.env.AIGATEWAY_USE_OIDC;
  return oidc === "true" || oidc === true;
}
function getTimeout(runtime) {
  const timeout = runtime.getSetting("AIGATEWAY_TIMEOUT") || process.env.AIGATEWAY_TIMEOUT;
  return timeout ? parseInt(timeout, 10) : 3e4;
}
function getAppName(runtime) {
  return runtime.getSetting("AIGATEWAY_APP_NAME") || process.env.AIGATEWAY_APP_NAME || runtime.character?.name || "ElizaOS-Agent";
}
function areGrokModelsEnabled(runtime) {
  const enabled = runtime.getSetting("AIGATEWAY_ENABLE_GROK_MODELS") || process.env.AIGATEWAY_ENABLE_GROK_MODELS;
  return enabled === "true" || enabled === true;
}
function areHighCostModelsEnabled(runtime) {
  const enabled = runtime.getSetting("AIGATEWAY_ENABLE_HIGH_COST_MODELS") || process.env.AIGATEWAY_ENABLE_HIGH_COST_MODELS;
  return enabled === "true" || enabled === true;
}
function isModelBlockingDisabled(runtime) {
  const disabled = runtime.getSetting("AIGATEWAY_DISABLE_MODEL_BLOCKING") || process.env.AIGATEWAY_DISABLE_MODEL_BLOCKING;
  return disabled === "true" || disabled === true;
}
function getConfig(runtime) {
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
    highCostModelsEnabled: areHighCostModelsEnabled(runtime),
    modelBlockingDisabled: isModelBlockingDisabled(runtime)
  };
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
  const grokEnabled = runtime.getSetting("AIGATEWAY_ENABLE_GROK_MODELS");
  return grokEnabled === "true" || grokEnabled === true;
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
      logger2.warn(`[AIGateway] Grok model access granted (user override): ${modelName}`);
    } else {
      logger2.info(`[AIGateway] Model access granted: ${modelName}`);
    }
  } else {
    if (isGrokModel(modelName)) {
      logger2.info(`[AIGateway] Grok model blocked in support of ElizaOS: ${modelName}`);
    } else {
      logger2.warn(`[AIGateway] Model access denied: ${modelName} - ${reason}`);
    }
  }
}
function getSafeAlternative(modelName) {
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
  const safeAlternative = getSafeAlternative(modelName);
  if (isGrokModel(modelName)) {
    logger2.info(`[AIGateway] Grok model ${modelName} blocked in support of ElizaOS`);
    logger2.info(`[AIGateway] Using alternative model: ${safeAlternative}`);
    logger2.info(`[AIGateway] ${validation.suggestion}`);
  } else {
    logger2.warn(`[AIGateway] Blocked ${modelName}: ${validation.reason}`);
    logger2.info(`[AIGateway] Using safe alternative: ${safeAlternative}`);
    logger2.info(`[AIGateway] To use original model: ${validation.suggestion}`);
  }
  return {
    modelToUse: safeAlternative,
    wasBlocked: true,
    originalModel: modelName,
    reason: validation.reason
  };
}

// src/providers/gateway-provider.ts
var GatewayProvider = class {
  constructor(runtime) {
    this.runtime = runtime;
    this.cache = new CacheService(getCacheTTL(runtime));
    logger3.info(`[AIGateway] Initializing Gateway Provider with Model Controls`);
    logger3.info(`[AIGateway] Base URL: ${getBaseURL(runtime)}`);
    logger3.info(`[AIGateway] OIDC enabled: ${useOIDC(runtime)}`);
    logger3.info(`[AIGateway] API Key configured: ${!!getApiKey(runtime)}`);
    logger3.info(`[AIGateway] Model blocking disabled: ${isModelBlockingDisabled(runtime)}`);
  }
  /**
   * Validate and potentially replace a model based on user settings
   */
  validateModel(requestedModel) {
    if (isModelBlockingDisabled(this.runtime)) {
      logger3.debug(`[AIGateway] Model blocking disabled, using requested model: ${requestedModel}`);
      return requestedModel;
    }
    const validation = validateAndSuggestModel(requestedModel, this.runtime);
    logModelAccess(requestedModel, !validation.wasBlocked, validation.reason);
    if (validation.wasBlocked) {
      logger3.warn(`[AIGateway] Model ${requestedModel} blocked, using ${validation.modelToUse} instead`);
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
          messages.push({ role: "system", content: this.runtime.character.system });
        }
        messages.push({ role: "user", content: params.prompt });
        const response = await generateText({
          model: modelToUse,
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
          messages.push({ role: "system", content: this.runtime.character.system });
        }
        messages.push({ role: "user", content: params.prompt });
        const response = await generateText({
          model: modelToUse,
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
    if (params === null) {
      logger3.debug("[AIGateway] Creating test embedding for initialization");
      const testVector = Array(1536).fill(0);
      return testVector;
    }
    const cacheKey = this.cache.generateKey({
      model: modelToUse,
      text: params.text
    });
    const cached = this.cache.get(cacheKey);
    if (cached) {
      logger3.debug("[AIGateway] Cache hit for embedding");
      return cached;
    }
    const result = await pRetry(
      async () => {
        const response = await embed({
          model: modelToUse,
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
   * Generate image (placeholder - not directly supported by AI SDK embed/generateText)
   */
  async generateImage(params) {
    logger3.warn("[AIGateway] Image generation not yet implemented for Vercel AI Gateway");
    throw new Error("Image generation not yet implemented for Vercel AI Gateway");
  }
  /**
   * Generate object using small model with validation (simplified for now)
   */
  async generateObjectSmall(params) {
    logger3.warn(
      "[AIGateway] Object generation not yet fully implemented - falling back to text generation"
    );
    const textResult = await this.generateTextSmall({
      prompt: params.prompt,
      temperature: params.temperature,
      maxTokens: 2048
    });
    try {
      return JSON.parse(textResult);
    } catch {
      return { text: textResult };
    }
  }
  /**
   * Generate object using large model with validation (simplified for now)
   */
  async generateObjectLarge(params) {
    logger3.warn(
      "[AIGateway] Object generation not yet fully implemented - falling back to text generation"
    );
    const textResult = await this.generateTextLarge({
      prompt: params.prompt,
      temperature: params.temperature,
      maxTokens: 4096
    });
    try {
      return JSON.parse(textResult);
    } catch {
      return { text: textResult };
    }
  }
};

// src/index.ts
var plugin = {
  name: "aigateway",
  description: "Universal AI Gateway integration with Grok model protection",
  async init(runtime) {
    logger4.info("[AIGateway] Plugin initializing...");
    const config = getConfig(runtime);
    logger4.info(`[AIGateway] Base URL: ${config.baseURL}`);
    logger4.info(`[AIGateway] API Key configured: ${config.apiKey}`);
    logger4.info(`[AIGateway] OIDC enabled: ${config.useOIDC}`);
    logger4.info(`[AIGateway] Grok models enabled: ${config.grokModelsEnabled}`);
    const provider = new GatewayProvider(runtime);
    const availableModelTypes = [
      ModelType.SMALL,
      ModelType.MEDIUM,
      ModelType.LARGE,
      ModelType.TEXT_SMALL,
      ModelType.TEXT_LARGE,
      ModelType.TEXT_EMBEDDING,
      ModelType.TEXT_TOKENIZER_ENCODE,
      ModelType.TEXT_TOKENIZER_DECODE,
      ModelType.TEXT_REASONING_SMALL,
      ModelType.TEXT_REASONING_LARGE,
      ModelType.TEXT_COMPLETION,
      ModelType.IMAGE,
      ModelType.IMAGE_DESCRIPTION,
      ModelType.TRANSCRIPTION,
      ModelType.TEXT_TO_SPEECH,
      ModelType.AUDIO,
      ModelType.VIDEO,
      ModelType.OBJECT_SMALL,
      ModelType.OBJECT_LARGE
    ];
    logger4.info(`[AIGateway] Available model types: ${availableModelTypes.join(", ")}`);
    const modelHandlers = {
      [ModelType.TEXT_SMALL]: provider.generateTextSmall.bind(provider),
      [ModelType.TEXT_LARGE]: provider.generateTextLarge.bind(provider),
      [ModelType.SMALL]: provider.generateTextSmall.bind(provider),
      // Legacy
      [ModelType.MEDIUM]: provider.generateTextLarge.bind(provider),
      // Legacy
      [ModelType.LARGE]: provider.generateTextLarge.bind(provider),
      // Legacy
      [ModelType.TEXT_EMBEDDING]: provider.generateEmbedding.bind(provider),
      [ModelType.OBJECT_SMALL]: provider.generateObjectSmall.bind(provider),
      [ModelType.OBJECT_LARGE]: provider.generateObjectLarge.bind(provider),
      [ModelType.IMAGE]: provider.generateImage.bind(provider)
    };
    try {
      for (const [modelType, handler] of Object.entries(modelHandlers)) {
        runtime.registerModel(modelType, handler);
      }
      logger4.info(`[AIGateway] Authentication configured: ${config.useOIDC ? "OIDC" : "API Key"}`);
      logger4.info("[AIGateway] Plugin initialization complete");
      if (!config.grokModelsEnabled) {
        logger4.info("[AIGateway] \u{1F6AB} Grok models are blocked in support of ElizaOS");
        logger4.info("[AIGateway] \u{1F504} Alternative models will be used automatically");
      }
    } catch (error) {
      logger4.error("[AIGateway] Error registering model handlers:", error instanceof Error ? error.message : String(error));
      throw error;
    }
  }
};
var index_default = plugin;
export {
  index_default as default
};
