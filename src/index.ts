import {
  IAgentRuntime,
  ModelType,
  logger,
} from "@elizaos/core";
import { GatewayProvider } from "./providers/gateway-provider";
import { getConfig } from "./utils/config";

/**
 * Vercel AI Gateway Plugin for ElizaOS
 * 
 * Features:
 * - Access to 100+ AI models through Vercel AI Gateway
 * - Built-in Grok model blocking in support of ElizaOS
 * - Automatic failover and caching
 * - API Key and OIDC authentication
 * - Cost optimization features
 */

const plugin = {
  name: "aigateway",
  description: "Universal AI Gateway integration with Grok model protection",
  
  async init(runtime: IAgentRuntime) {
    logger.info("[AIGateway] Plugin initializing...");
    
    const config = getConfig(runtime);
    logger.info(`[AIGateway] Base URL: ${config.baseURL}`);
    logger.info(`[AIGateway] API Key configured: ${config.apiKey}`);
    logger.info(`[AIGateway] OIDC enabled: ${config.useOIDC}`);
    logger.info(`[AIGateway] Grok models enabled: ${config.grokModelsEnabled}`);
    
    const provider = new GatewayProvider(runtime);

    // Register all model types with the gateway provider
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
      ModelType.OBJECT_LARGE,
    ];

    logger.info(`[AIGateway] Available model types: ${availableModelTypes.join(', ')}`);

    // Register model handlers with proper provider signature
    const modelHandlers = [
      { type: ModelType.TEXT_SMALL, handler: provider.generateTextSmall.bind(provider) },
      { type: ModelType.TEXT_LARGE, handler: provider.generateTextLarge.bind(provider) },
      { type: ModelType.SMALL, handler: provider.generateTextSmall.bind(provider) }, // Legacy
      { type: ModelType.MEDIUM, handler: provider.generateTextLarge.bind(provider) }, // Legacy
      { type: ModelType.LARGE, handler: provider.generateTextLarge.bind(provider) }, // Legacy
      { type: ModelType.TEXT_EMBEDDING, handler: provider.generateEmbedding.bind(provider) },
      { type: ModelType.OBJECT_SMALL, handler: provider.generateObjectSmall.bind(provider) },
      { type: ModelType.OBJECT_LARGE, handler: provider.generateObjectLarge.bind(provider) },
      { type: ModelType.IMAGE, handler: provider.generateImage.bind(provider) },
    ];

    // Register all model handlers
    try {
      for (const { type, handler } of modelHandlers) {
        runtime.registerModel(type, handler);
      }

      logger.info(`[AIGateway] Authentication configured: ${config.useOIDC ? 'OIDC' : 'API Key'}`);
      logger.info("[AIGateway] Plugin initialization complete");
      
      if (!config.grokModelsEnabled) {
        logger.info("[AIGateway] 🚫 Grok models are blocked in support of ElizaOS");
        logger.info("[AIGateway] 🔄 Alternative models will be used automatically");
      }
      
    } catch (error) {
      logger.error('[AIGateway] Error registering model handlers:', error instanceof Error ? error.message : String(error));
      throw error;
    }
  }
};

export default plugin;
