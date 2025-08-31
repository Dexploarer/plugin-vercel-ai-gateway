import { generateText, generateObject as aiGenerateObject, embed } from "ai";
import {
  IAgentRuntime,
  GenerateTextParams,
  TextEmbeddingParams,
  ObjectGenerationParams,
  logger,
} from "@elizaos/core";
import pRetry from "p-retry";
import { CacheService } from "../utils/cache";
import {
  getApiKey,
  getBaseURL,
  getSmallModel,
  getLargeModel,
  getEmbeddingModel,
  getMaxRetries,
  getCacheTTL,
  useOIDC,
  isModelBlockingDisabled,
} from "../utils/config";
import {
  validateAndSuggestModel,
  logModelAccess,
} from "../utils/model-controls";

/**
 * Gateway Provider for Vercel AI Gateway with Model Controls
 * Uses the AI SDK with built-in protection against expensive models
 */
export class GatewayProvider {
  private runtime: IAgentRuntime;
  private cache: CacheService;

  constructor(runtime: IAgentRuntime) {
    this.runtime = runtime;
    this.cache = new CacheService(getCacheTTL(runtime));

    logger.info(
      `[AIGateway] Initializing Gateway Provider with Model Controls`,
    );
    logger.info(`[AIGateway] Base URL: ${getBaseURL(runtime)}`);
    logger.info(`[AIGateway] OIDC enabled: ${useOIDC(runtime)}`);
    logger.info(`[AIGateway] API Key configured: ${!!getApiKey(runtime)}`);
    logger.info(
      `[AIGateway] Model blocking disabled: ${isModelBlockingDisabled(runtime)}`,
    );
  }

  /**
   * Generate streaming text for small models
   */
  async generateTextSmallStreaming(
    runtime: IAgentRuntime,
    params: GenerateTextParams,
  ): Promise<AsyncGenerator<string, void, unknown>> {
    const { StreamingGatewayProvider } = await import(
      "./streaming-gateway-provider"
    );
    const streamingProvider = new StreamingGatewayProvider(runtime);
    return streamingProvider.generateTextSmallStream(runtime, params);
  }

  /**
   * Generate streaming text for large models
   */
  async generateTextLargeStreaming(
    runtime: IAgentRuntime,
    params: GenerateTextParams,
  ): Promise<AsyncGenerator<string, void, unknown>> {
    const { StreamingGatewayProvider } = await import(
      "./streaming-gateway-provider"
    );
    const streamingProvider = new StreamingGatewayProvider(runtime);
    return streamingProvider.generateTextLargeStream(runtime, params);
  }

  /**
   * Generate streaming objects
   */
  async generateObjectStreaming(
    runtime: IAgentRuntime,
    params: ObjectGenerationParams,
    modelSize: "small" | "large" = "large",
  ): Promise<AsyncGenerator<string, void, unknown>> {
    const { StreamingGatewayProvider } = await import(
      "./streaming-gateway-provider"
    );
    const streamingProvider = new StreamingGatewayProvider(runtime);
    return streamingProvider.generateObjectStream(runtime, params, modelSize);
  }

  /**
   * Validate and potentially replace a model based on user settings
   */
  private validateModel(requestedModel: string): string {
    if (isModelBlockingDisabled(this.runtime)) {
      logger.debug(
        `[AIGateway] Model blocking disabled, using requested model: ${requestedModel}`,
      );
      return requestedModel;
    }

    const validation = validateAndSuggestModel(requestedModel, this.runtime);
    logModelAccess(requestedModel, !validation.wasBlocked, validation.reason);

    if (validation.wasBlocked) {
      logger.warn(
        `[AIGateway] Model ${requestedModel} blocked, using ${validation.modelToUse} instead`,
      );
    }

    return validation.modelToUse;
  }

  /**
   * Generate text using small model with validation
   */
  async generateTextSmall(params: GenerateTextParams): Promise<string> {
    const requestedModel = getSmallModel(this.runtime);
    const modelToUse = this.validateModel(requestedModel);

    logger.info(`[AIGateway] Using TEXT_SMALL model: ${modelToUse}`);

    // Check cache
    const cacheKey = this.cache.generateKey({ model: modelToUse, ...params });
    const cached = this.cache.get<string>(cacheKey);
    if (cached) {
      logger.debug("[AIGateway] Cache hit for TEXT_SMALL");
      return cached;
    }

    const result = await pRetry(
      async () => {
        const messages = [];

        if (this.runtime.character?.system) {
          messages.push({
            role: "system" as const,
            content: this.runtime.character.system,
          });
        }

        messages.push({ role: "user" as const, content: params.prompt });

        const response = await generateText({
          model: modelToUse as any,
          messages: messages as any,
          temperature: params.temperature ?? 0.7,
          maxTokens: params.maxTokens ?? 2048,
          frequencyPenalty: params.frequencyPenalty ?? 0.7,
          presencePenalty: params.presencePenalty ?? 0.7,
          ...(params.stopSequences && params.stopSequences.length > 0
            ? { stopSequences: params.stopSequences }
            : {}),
        });

        return response.text;
      },
      {
        retries: getMaxRetries(this.runtime),
        onFailedAttempt: (error) => {
          logger.warn(
            `[AIGateway] TEXT_SMALL attempt ${error.attemptNumber} failed: ${error.message}`,
          );
        },
      },
    );

    logger.debug("[AIGateway] Caching TEXT_SMALL result");
    this.cache.set(cacheKey, result, getCacheTTL(this.runtime));

    return result;
  }

  /**
   * Generate text using large model with validation
   */
  async generateTextLarge(params: GenerateTextParams): Promise<string> {
    const requestedModel = getLargeModel(this.runtime);
    const modelToUse = this.validateModel(requestedModel);

    logger.info(`[AIGateway] Using TEXT_LARGE model: ${modelToUse}`);

    // Check cache
    const cacheKey = this.cache.generateKey({ model: modelToUse, ...params });
    const cached = this.cache.get<string>(cacheKey);
    if (cached) {
      logger.debug("[AIGateway] Cache hit for TEXT_LARGE");
      return cached;
    }

    const result = await pRetry(
      async () => {
        const messages = [];

        if (this.runtime.character?.system) {
          messages.push({
            role: "system" as const,
            content: this.runtime.character.system,
          });
        }

        messages.push({ role: "user" as const, content: params.prompt });

        const response = await generateText({
          model: modelToUse as any,
          messages: messages as any,
          temperature: params.temperature ?? 0.7,
          maxTokens: params.maxTokens ?? 4096,
          frequencyPenalty: params.frequencyPenalty ?? 0.7,
          presencePenalty: params.presencePenalty ?? 0.7,
          ...(params.stopSequences && params.stopSequences.length > 0
            ? { stopSequences: params.stopSequences }
            : {}),
        });

        return response.text;
      },
      {
        retries: getMaxRetries(this.runtime),
        onFailedAttempt: (error) => {
          logger.warn(
            `[AIGateway] TEXT_LARGE attempt ${error.attemptNumber} failed: ${error.message}`,
          );
        },
      },
    );

    logger.debug("[AIGateway] Caching TEXT_LARGE result");
    this.cache.set(cacheKey, result, getCacheTTL(this.runtime));

    return result;
  }

  /**
   * Generate embeddings using embedding model with validation
   */
  async generateEmbedding(params: TextEmbeddingParams): Promise<number[]> {
    const requestedModel = getEmbeddingModel(this.runtime);
    const modelToUse = this.validateModel(requestedModel);

    logger.info(`[AIGateway] Using embedding model: ${modelToUse}`);

    if (params === null) {
      logger.debug("[AIGateway] Creating test embedding for initialization");
      const testVector = Array(1536).fill(0); // Default OpenAI embedding dimension
      return testVector;
    }

    // Check cache
    const cacheKey = this.cache.generateKey({
      model: modelToUse,
      text: params.text,
    });
    const cached = this.cache.get<number[]>(cacheKey);
    if (cached) {
      logger.debug("[AIGateway] Cache hit for embedding");
      return cached;
    }

    const result = await pRetry(
      async () => {
        const response = await embed({
          model: {
            modelId: modelToUse,
            specificationVersion: 'v1',
            provider: 'aigateway',
            maxEmbeddingsPerCall: 1,
            supportsParallelCalls: false,
            doEmbed: async ({ values, headers, abortSignal }) => {
              const apiKey = getApiKey(this.runtime);
              const baseURL = getBaseURL(this.runtime);
              
              const response = await fetch(`${baseURL}/embeddings`, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${apiKey}`,
                  ...headers,
                },
                body: JSON.stringify({
                  model: modelToUse,
                  input: values[0],
                }),
                signal: abortSignal,
              });

              if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
              }

              const data = await response.json();
              return {
                embeddings: [data.data[0].embedding],
              };
            },
          },
          value: params.text,
        });

        return response.embedding;
      },
      {
        retries: getMaxRetries(this.runtime),
        onFailedAttempt: (error) => {
          logger.warn(
            `[AIGateway] Embedding attempt ${error.attemptNumber} failed: ${error.message}`,
          );
        },
      },
    );

    logger.debug("[AIGateway] Caching embedding result");
    this.cache.set(cacheKey, result, getCacheTTL(this.runtime));

    return result;
  }

  /**
   * Generate image (placeholder - not directly supported by AI SDK embed/generateText)
   */
  async generateImage(params: {
    prompt: string;
    count?: number;
    size?: string;
  }): Promise<{ url: string; revisedPrompt?: string }[]> {
    logger.warn(
      "[AIGateway] Image generation not yet implemented for Vercel AI Gateway",
    );
    throw new Error(
      "Image generation not yet implemented for Vercel AI Gateway",
    );
  }

  /**
   * Generate object using small model with validation (simplified for now)
   */
  async generateObjectSmall(params: ObjectGenerationParams): Promise<any> {
    logger.warn(
      "[AIGateway] Object generation not yet fully implemented - falling back to text generation",
    );
    const textResult = await this.generateTextSmall({
      prompt: params.prompt,
      temperature: params.temperature,
      maxTokens: 2048,
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
  async generateObjectLarge(params: ObjectGenerationParams): Promise<any> {
    logger.warn(
      "[AIGateway] Object generation not yet fully implemented - falling back to text generation",
    );
    const textResult = await this.generateTextLarge({
      prompt: params.prompt,
      temperature: params.temperature,
      maxTokens: 4096,
    });

    try {
      return JSON.parse(textResult);
    } catch {
      return { text: textResult };
    }
  }
}
