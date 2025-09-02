import {
  generateText,
  generateObject as aiGenerateObject,
  embed,
  experimental_generateImage as aiGenerateImage,
} from "ai";
import { createOpenAI } from "@ai-sdk/openai";
import {
  IAgentRuntime,
  GenerateTextParams,
  TextEmbeddingParams,
  ObjectGenerationParams,
  logger,
  EventType,
  ModelType,
} from "@elizaos/core";
import pRetry from "p-retry";
import { CacheService } from "../utils/cache";
import {
  getApiKey,
  getBaseURL,
  getSmallModel,
  getLargeModel,
  getEmbeddingModel,
  getImageModel,
  getMaxRetries,
  getCacheTTL,
  useOIDC,
  isModelBlockingDisabled,
} from "../utils/config";
import {
  validateAndSuggestModel,
  logModelAccess,
} from "../utils/model-controls";

// TODO: Move to @elizaos/core
export type ImageGenerationParams = {
  prompt: string;
  count?: number;
  size?: string;
};

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
      `[AIGateway] Model blocking disabled: ${isModelBlockingDisabled(
        runtime,
      )}`,
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
        const messages: {
          role: "system" | "user" | "assistant";
          content: string;
        }[] = [];

        if (this.runtime.character?.system) {
          messages.push({
            role: "system" as const,
            content: this.runtime.character.system,
          });
        }

        messages.push({ role: "user" as const, content: params.prompt });

        const openai = createOpenAI({
          apiKey: getApiKey(this.runtime),
          baseURL: getBaseURL(this.runtime),
        });
        const smallId = modelToUse.includes("/")
          ? modelToUse.split("/")[1]
          : modelToUse;
        const smallModel = openai(smallId);

        const response = await generateText({
          model: smallModel as any,
          messages,
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
        const messages: {
          role: "system" | "user" | "assistant";
          content: string;
        }[] = [];

        if (this.runtime.character?.system) {
          messages.push({
            role: "system" as const,
            content: this.runtime.character.system,
          });
        }

        messages.push({ role: "user" as const, content: params.prompt });

        const openai = createOpenAI({
          apiKey: getApiKey(this.runtime),
          baseURL: getBaseURL(this.runtime),
        });
        const largeId = modelToUse.includes("/")
          ? modelToUse.split("/")[1]
          : modelToUse;
        const largeModel = openai(largeId);

        const response = await generateText({
          model: largeModel as any,
          messages,
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

    const cacheKey = `embedding:${modelToUse}:${params.text}`;
    logger.debug("[AIGateway] Checking cache for embedding");
    const cached = this.cache.get<number[]>(cacheKey);
    if (cached) {
      logger.debug("[AIGateway] Cache hit for embedding");
      return cached;
    }

    const result = await pRetry(
      async () => {
        logger.info(
          `[AIGateway] Embedding request - Model: ${modelToUse}, Text: "${params.text}"`,
        );

        // Create embedding model directly
        const embeddingModel = {
          modelId: modelToUse,
          specificationVersion: "v1" as const,
          provider: "aigateway",
          maxEmbeddingsPerCall: 1,
          supportsParallelCalls: false,
          doEmbed: async ({ values, headers, abortSignal }: any) => {
            const token =
              getApiKey(this.runtime) || process.env.VERCEL_OIDC_TOKEN;
            const response = await fetch(
              `${getBaseURL(this.runtime)}/embeddings`,
              {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  ...(token ? { Authorization: `Bearer ${token}` } : {}),
                  ...headers,
                },
                body: JSON.stringify({
                  model: modelToUse,
                  input: values[0],
                }),
                signal: abortSignal,
              },
            );

            if (!response.ok) {
              const errorText = await response.text();
              throw new Error(`HTTP ${response.status}: ${errorText}`);
            }

            const data = await response.json();
            return {
              embeddings: [data.data[0].embedding],
            };
          },
        };

        const response = await embed({
          model: embeddingModel,
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
   * Generate image
   */
  async generateImage(
    params: ImageGenerationParams,
  ): Promise<{ url: string; revisedPrompt?: string }[]> {
    const requestedModel = getImageModel(this.runtime);
    const modelToUse = this.validateModel(requestedModel);

    logger.info(`[AIGateway] Using IMAGE model: ${modelToUse}`);

    try {
      this.runtime.emitEvent(EventType.MODEL_USED, {
        provider: "aigateway",
        type: ModelType.IMAGE,
        tokens: 0,
        model: modelToUse,
      });
    } catch (error: any) {
      logger.warn(
        `[AIGateway] Failed to emit model usage event: ${error.message}`,
      );
    }

    const result = await pRetry(
      async () => {
        const openai = createOpenAI({
          apiKey: getApiKey(this.runtime),
          baseURL: getBaseURL(this.runtime),
        });
        const imageId = modelToUse.includes("/") ? modelToUse.split("/")[1] : modelToUse;
        const imageModel = openai.image(imageId);

        const response = await aiGenerateImage({
          model: imageModel,
          prompt: params.prompt,
          n: params.count,
          size: params.size,
        });

        return response.images.map((image) => ({
          url: image.url,
          revisedPrompt: image.revisedPrompt,
        }));
      },
      {
        retries: getMaxRetries(this.runtime),
        onFailedAttempt: (error) => {
          logger.warn(
            `[AIGateway] IMAGE attempt ${error.attemptNumber} failed: ${error.message}`,
          );
        },
      },
    );

    return result;
  }

  /**
   * Private method to generate object with validation
   */
  private async _generateObject(
    params: ObjectGenerationParams,
    modelSize: "small" | "large",
  ): Promise<any> {
    const { getModel, textGenerator, maxTokens, modelType } =
      modelSize === "small"
        ? {
            getModel: getSmallModel,
            textGenerator: this.generateTextSmall.bind(this),
            maxTokens: 2048,
            modelType: "OBJECT_SMALL",
          }
        : {
            getModel: getLargeModel,
            textGenerator: this.generateTextLarge.bind(this),
            maxTokens: 4096,
            modelType: "OBJECT_LARGE",
          };

    const requestedModel = getModel(this.runtime);
    const modelToUse = this.validateModel(requestedModel);
    logger.info(`[AIGateway] Using ${modelType} model: ${modelToUse}`);

    const cacheKey = this.cache.generateKey({ model: modelToUse, ...params });
    const cached = this.cache.get<any>(cacheKey);
    if (cached) {
      logger.debug(`[AIGateway] Cache hit for ${modelType}`);
      return cached;
    }

    logger.warn(
      `[AIGateway] Object generation not yet fully implemented - falling back to text generation`,
    );

    const textParams: GenerateTextParams = Object.fromEntries(
      Object.entries({
        prompt: params.prompt,
        temperature: params.temperature,
        maxTokens,
        stopSequences: params.stopSequences,
        frequencyPenalty: params.frequencyPenalty,
        presencePenalty: params.presencePenalty,
      }).filter(([, v]) => v !== undefined),
    ) as GenerateTextParams;

    const textResult = await textGenerator(textParams);

    try {
      const result = JSON.parse(textResult);
      this.cache.set(cacheKey, result, getCacheTTL(this.runtime));
      return result;
    } catch (error: any) {
      logger.error(
        `[AIGateway] JSON parse error in ${modelType}: ${error.message}`,
      );
      logger.debug(
        `[AIGateway] Failed text content: ${textResult.substring(0, 500)}${
          textResult.length > 500 ? "..." : ""
        }`,
      );
      return { text: textResult };
    }
  }

  /**
   * Generate object using small model with validation
   */
  async generateObjectSmall(params: ObjectGenerationParams): Promise<any> {
    return this._generateObject(params, "small");
  }

  /**
   * Generate object using large model with validation
   */
  async generateObjectLarge(params: ObjectGenerationParams): Promise<any> {
    return this._generateObject(params, "large");
  }
}
