var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
var __publicField = (obj, key, value) => __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);

// src/utils/config.ts
function getSetting(runtime, key, defaultValue) {
  if (runtime && typeof runtime.getSetting === "function") {
    return runtime.getSetting(key) ?? process.env[key] ?? defaultValue;
  }
  return process.env[key] ?? defaultValue;
}
__name(getSetting, "getSetting");
function getApiKey(runtime) {
  return getSetting(runtime, "AI_GATEWAY_API_KEY") || getSetting(runtime, "AIGATEWAY_API_KEY") || void 0;
}
__name(getApiKey, "getApiKey");
function getBaseURL(runtime) {
  return getSetting(runtime, "AIGATEWAY_BASE_URL", "https://ai-gateway.vercel.sh/v1");
}
__name(getBaseURL, "getBaseURL");
function getSmallModel(runtime) {
  return getSetting(runtime, "AIGATEWAY_DEFAULT_MODEL", "openai/gpt-4o-mini");
}
__name(getSmallModel, "getSmallModel");
function getLargeModel(runtime) {
  return getSetting(runtime, "AIGATEWAY_LARGE_MODEL", "openai/gpt-4o");
}
__name(getLargeModel, "getLargeModel");
function getEmbeddingModel(runtime) {
  return getSetting(runtime, "AIGATEWAY_EMBEDDING_MODEL", "openai/text-embedding-3-small");
}
__name(getEmbeddingModel, "getEmbeddingModel");
function getMaxRetries(runtime) {
  const retries = getSetting(runtime, "AIGATEWAY_MAX_RETRIES");
  const parsed = retries ? parseInt(retries, 10) : NaN;
  return !isNaN(parsed) ? parsed : 3;
}
__name(getMaxRetries, "getMaxRetries");
function getCacheTTL(runtime) {
  const ttl = getSetting(runtime, "AIGATEWAY_CACHE_TTL");
  const parsed = ttl ? parseInt(ttl, 10) : NaN;
  return !isNaN(parsed) ? parsed : 300;
}
__name(getCacheTTL, "getCacheTTL");
function useOIDC(runtime) {
  const oidc = getSetting(runtime, "AIGATEWAY_USE_OIDC");
  return oidc === "true" || oidc === "1";
}
__name(useOIDC, "useOIDC");
function getTimeout(runtime) {
  const timeout = getSetting(runtime, "AIGATEWAY_TIMEOUT");
  const parsed = timeout ? parseInt(timeout, 10) : NaN;
  return !isNaN(parsed) ? parsed : 3e4;
}
__name(getTimeout, "getTimeout");
function getAppName(runtime) {
  return getSetting(runtime, "AIGATEWAY_APP_NAME") || runtime.character?.name || "ElizaOS-Agent";
}
__name(getAppName, "getAppName");
function areGrokModelsEnabled(runtime) {
  const enabled = getSetting(runtime, "AIGATEWAY_ENABLE_GROK_MODELS");
  return enabled === "true" || enabled === "1";
}
__name(areGrokModelsEnabled, "areGrokModelsEnabled");
function isModelBlockingDisabled(runtime) {
  const disabled = getSetting(runtime, "AIGATEWAY_DISABLE_MODEL_BLOCKING");
  return disabled === "true" || disabled === "1";
}
__name(isModelBlockingDisabled, "isModelBlockingDisabled");
function getConfig(runtime) {
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
    modelBlockingDisabled: isModelBlockingDisabled(runtime)
  };
}
__name(getConfig, "getConfig");

// src/utils/model-controls.ts
import { logger } from "@elizaos/core";
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
__name(isGrokModel, "isGrokModel");
function areGrokModelsEnabled2(runtime) {
  const grokEnabled = runtime.getSetting("AIGATEWAY_ENABLE_GROK_MODELS");
  return grokEnabled === "true" || grokEnabled === true;
}
__name(areGrokModelsEnabled2, "areGrokModelsEnabled");
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
  return {
    allowed: true
  };
}
__name(validateModelAccess, "validateModelAccess");
function logModelAccess(modelName, allowed, reason) {
  if (allowed) {
    if (isGrokModel(modelName)) {
      logger.warn(`[AIGateway] Grok model access granted (user override): ${modelName}`);
    } else {
      logger.info(`[AIGateway] Model access granted: ${modelName}`);
    }
  } else {
    if (isGrokModel(modelName)) {
      logger.info(`[AIGateway] Grok model blocked in support of ElizaOS: ${modelName}`);
    } else {
      logger.warn(`[AIGateway] Model access denied: ${modelName} - ${reason}`);
    }
  }
}
__name(logModelAccess, "logModelAccess");
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
__name(getAlternativeModel, "getAlternativeModel");
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
    logger.info(`[AIGateway] Grok model ${modelName} blocked in support of ElizaOS`);
    logger.info(`[AIGateway] Using alternative model: ${alternativeModel}`);
    logger.info(`[AIGateway] ${validation.suggestion}`);
  } else {
    logger.warn(`[AIGateway] Blocked ${modelName}: ${validation.reason}`);
    logger.info(`[AIGateway] Using alternative: ${alternativeModel}`);
    logger.info(`[AIGateway] To use original model: ${validation.suggestion}`);
  }
  return {
    modelToUse: alternativeModel,
    wasBlocked: true,
    originalModel: modelName,
    reason: validation.reason
  };
}
__name(validateAndSuggestModel, "validateAndSuggestModel");
function applyModelControls(modelName, config) {
  const result = validateAndSuggestModel(modelName, config);
  logModelAccess(modelName, !result.wasBlocked, result.reason);
  return result.modelToUse;
}
__name(applyModelControls, "applyModelControls");

// src/providers/gateway-provider.ts
import { generateText, embed } from "ai";
import { logger as logger3 } from "@elizaos/core";
import pRetry from "p-retry";

// src/utils/cache.ts
import { LRUCache } from "lru-cache";
import { logger as logger2 } from "@elizaos/core";
var _CacheService = class _CacheService {
  constructor(ttlSeconds = 300) {
    __publicField(this, "cache");
    __publicField(this, "ttl");
    this.ttl = ttlSeconds * 1e3;
    this.cache = new LRUCache({
      max: 1e3,
      ttl: this.ttl,
      updateAgeOnGet: true,
      updateAgeOnHas: true
    });
    logger2.debug(`[AIGateway] Cache initialized with TTL: ${ttlSeconds}s, max items: 1000`);
  }
  /**
  * Generate a cache key from parameters
  */
  generateKey(params) {
    const keyData = {
      ...params,
      // Ensure consistent ordering
      timestamp: Math.floor(Date.now() / (this.ttl / 1e3))
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
      logger2.debug(`[AIGateway] Cache hit for key: ${key.substring(0, 20)}...`);
    }
    return value;
  }
  /**
  * Set item in cache
  */
  set(key, value, ttlSeconds) {
    const ttl = ttlSeconds ? ttlSeconds * 1e3 : this.ttl;
    this.cache.set(key, value, {
      ttl
    });
    logger2.debug(`[AIGateway] Cache set for key: ${key.substring(0, 20)}... (TTL: ${ttl / 1e3}s)`);
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
      logger2.debug(`[AIGateway] Cache deleted for key: ${key.substring(0, 20)}...`);
    }
    return deleted;
  }
  /**
  * Clear all cache
  */
  clear() {
    this.cache.clear();
    logger2.debug("[AIGateway] Cache cleared");
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
    logger2.info(`[AIGateway] Cache stats: ${stats.size}/${stats.max} items, TTL: ${stats.ttl}s`);
  }
};
__name(_CacheService, "CacheService");
var CacheService = _CacheService;

// src/providers/gateway-provider.ts
var _GatewayProvider = class _GatewayProvider {
  constructor(runtime) {
    __publicField(this, "runtime");
    __publicField(this, "cache");
    this.runtime = runtime;
    this.cache = new CacheService(getCacheTTL(runtime));
    logger3.info(`[AIGateway] Initializing Gateway Provider with Model Controls`);
    logger3.info(`[AIGateway] Base URL: ${getBaseURL(runtime)}`);
    logger3.info(`[AIGateway] OIDC enabled: ${useOIDC(runtime)}`);
    logger3.info(`[AIGateway] API Key configured: ${!!getApiKey(runtime)}`);
    logger3.info(`[AIGateway] Model blocking disabled: ${isModelBlockingDisabled(runtime)}`);
  }
  /**
  * Generate streaming text for small models
  */
  async generateTextSmallStreaming(runtime, params) {
    const { StreamingGatewayProvider } = await import("./streaming-gateway-provider-UJM2KPMG.js");
    const streamingProvider = new StreamingGatewayProvider(runtime);
    return streamingProvider.generateTextSmallStream(runtime, params);
  }
  /**
  * Generate streaming text for large models
  */
  async generateTextLargeStreaming(runtime, params) {
    const { StreamingGatewayProvider } = await import("./streaming-gateway-provider-UJM2KPMG.js");
    const streamingProvider = new StreamingGatewayProvider(runtime);
    return streamingProvider.generateTextLargeStream(runtime, params);
  }
  /**
  * Generate streaming objects
  */
  async generateObjectStreaming(runtime, params, modelSize = "large") {
    const { StreamingGatewayProvider } = await import("./streaming-gateway-provider-UJM2KPMG.js");
    const streamingProvider = new StreamingGatewayProvider(runtime);
    return streamingProvider.generateObjectStream(runtime, params, modelSize);
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
    const cacheKey = this.cache.generateKey({
      model: modelToUse,
      ...params
    });
    const cached = this.cache.get(cacheKey);
    if (cached) {
      logger3.debug("[AIGateway] Cache hit for TEXT_SMALL");
      return cached;
    }
    const result = await pRetry(async () => {
      const messages = [];
      if (this.runtime.character?.system) {
        messages.push({
          role: "system",
          content: this.runtime.character.system
        });
      }
      messages.push({
        role: "user",
        content: params.prompt
      });
      const response = await generateText({
        model: modelToUse,
        messages,
        temperature: params.temperature ?? 0.7,
        maxTokens: params.maxTokens ?? 2048,
        frequencyPenalty: params.frequencyPenalty ?? 0.7,
        presencePenalty: params.presencePenalty ?? 0.7,
        ...params.stopSequences && params.stopSequences.length > 0 ? {
          stopSequences: params.stopSequences
        } : {}
      });
      return response.text;
    }, {
      retries: getMaxRetries(this.runtime),
      onFailedAttempt: /* @__PURE__ */ __name((error) => {
        logger3.warn(`[AIGateway] TEXT_SMALL attempt ${error.attemptNumber} failed: ${error.message}`);
      }, "onFailedAttempt")
    });
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
    const cacheKey = this.cache.generateKey({
      model: modelToUse,
      ...params
    });
    const cached = this.cache.get(cacheKey);
    if (cached) {
      logger3.debug("[AIGateway] Cache hit for TEXT_LARGE");
      return cached;
    }
    const result = await pRetry(async () => {
      const messages = [];
      if (this.runtime.character?.system) {
        messages.push({
          role: "system",
          content: this.runtime.character.system
        });
      }
      messages.push({
        role: "user",
        content: params.prompt
      });
      const response = await generateText({
        model: modelToUse,
        messages,
        temperature: params.temperature ?? 0.7,
        maxTokens: params.maxTokens ?? 4096,
        frequencyPenalty: params.frequencyPenalty ?? 0.7,
        presencePenalty: params.presencePenalty ?? 0.7,
        ...params.stopSequences && params.stopSequences.length > 0 ? {
          stopSequences: params.stopSequences
        } : {}
      });
      return response.text;
    }, {
      retries: getMaxRetries(this.runtime),
      onFailedAttempt: /* @__PURE__ */ __name((error) => {
        logger3.warn(`[AIGateway] TEXT_LARGE attempt ${error.attemptNumber} failed: ${error.message}`);
      }, "onFailedAttempt")
    });
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
    const result = await pRetry(async () => {
      const response = await embed({
        model: modelToUse,
        value: params.text
      });
      return response.embedding;
    }, {
      retries: getMaxRetries(this.runtime),
      onFailedAttempt: /* @__PURE__ */ __name((error) => {
        logger3.warn(`[AIGateway] Embedding attempt ${error.attemptNumber} failed: ${error.message}`);
      }, "onFailedAttempt")
    });
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
    logger3.warn("[AIGateway] Object generation not yet fully implemented - falling back to text generation");
    const textResult = await this.generateTextSmall({
      prompt: params.prompt,
      temperature: params.temperature,
      maxTokens: 2048
    });
    try {
      return JSON.parse(textResult);
    } catch {
      return {
        text: textResult
      };
    }
  }
  /**
  * Generate object using large model with validation (simplified for now)
  */
  async generateObjectLarge(params) {
    logger3.warn("[AIGateway] Object generation not yet fully implemented - falling back to text generation");
    const textResult = await this.generateTextLarge({
      prompt: params.prompt,
      temperature: params.temperature,
      maxTokens: 4096
    });
    try {
      return JSON.parse(textResult);
    } catch {
      return {
        text: textResult
      };
    }
  }
};
__name(_GatewayProvider, "GatewayProvider");
var GatewayProvider = _GatewayProvider;

export {
  __name,
  getConfig,
  applyModelControls,
  GatewayProvider
};
