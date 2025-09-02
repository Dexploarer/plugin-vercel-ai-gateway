import {
  IAgentRuntime,
  Plugin,
  ModelType,
  logger,
  GenerateTextParams,
  TextEmbeddingParams,
  ObjectGenerationParams,
} from "@elizaos/core";
import {
  GatewayProvider,
  ImageGenerationParams,
} from "./providers/gateway-provider";
import { getConfig } from "./utils/config";
import { openaiRoutes } from "./routes/openai-compat";
import { socketIOStreamingRoutes } from "./routes/socketio-streaming";
// TODO: Find the correct import for toolCallsAction
// import { toolCallsAction } from "./actions/tool-calls";
import { centralCompatRoutes } from "./routes/central-compat";
import { healthRoutes } from "./routes/health";
export { createGatewayClient } from "./utils/client";

const plugin: Plugin = {
  name: "aigateway",
  description:
    "Universal AI Gateway integration plugin for elizaOS with Grok model protection - Access 100+ AI models through unified gateways",
  actions: [/*toolCallsAction*/],
  evaluators: [],
  providers: [],
  routes: [
    ...openaiRoutes,
    ...socketIOStreamingRoutes,
    ...centralCompatRoutes,
    ...healthRoutes,
  ],
  models: {
    [ModelType.TEXT_SMALL]: async (
      runtime: IAgentRuntime,
      params: GenerateTextParams,
    ) => {
      try {
        const provider = new GatewayProvider(runtime);
        return provider.generateTextSmall(params);
      } catch (error: any) {
        logger.error(`[AIGateway] TEXT_SMALL handler error: ${error.message}`);
        throw error;
      }
    },
    [ModelType.TEXT_LARGE]: async (
      runtime: IAgentRuntime,
      params: GenerateTextParams,
    ) => {
      try {
        const provider = new GatewayProvider(runtime);
        return provider.generateTextLarge(params);
      } catch (error: any) {
        logger.error(`[AIGateway] TEXT_LARGE handler error: ${error.message}`);
        throw error;
      }
    },
    [ModelType.TEXT_EMBEDDING]: async (
      runtime: IAgentRuntime,
      params: TextEmbeddingParams,
    ) => {
      try {
        const provider = new GatewayProvider(runtime);
        return provider.generateEmbedding(params);
      } catch (error: any) {
        logger.error(
          `[AIGateway] TEXT_EMBEDDING handler error: ${error.message}`,
        );
        throw error;
      }
    },
    [ModelType.IMAGE]: async (
      runtime: IAgentRuntime,
      params: ImageGenerationParams,
    ) => {
      try {
        const provider = new GatewayProvider(runtime);
        return provider.generateImage(params);
      } catch (error: any) {
        logger.error(`[AIGateway] IMAGE handler error: ${error.message}`);
        throw error;
      }
    },
    [ModelType.OBJECT_SMALL]: async (
      runtime: IAgentRuntime,
      params: ObjectGenerationParams,
    ) => {
      try {
        const provider = new GatewayProvider(runtime);
        return provider.generateObjectSmall(params);
      } catch (error: any) {
        logger.error(
          `[AIGateway] OBJECT_SMALL handler error: ${error.message}`,
        );
        throw error;
      }
    },
    [ModelType.OBJECT_LARGE]: async (
      runtime: IAgentRuntime,
      params: ObjectGenerationParams,
    ) => {
      try {
        const provider = new GatewayProvider(runtime);
        return provider.generateObjectLarge(params);
      } catch (error: any) {
        logger.error(
          `[AIGateway] OBJECT_LARGE handler error: ${error.message}`,
        );
        throw error;
      }
    },
  },
  // Accept both usages at runtime: init(runtime) or init(config, runtime)
  // Keep implementation simple and type-safe: no return value expected
  init: async (...args: any[]) => {
    const runtime: IAgentRuntime =
      args.length === 1
        ? (args[0] as IAgentRuntime)
        : (args[1] as IAgentRuntime);

    logger.info("[AIGateway] Plugin initialized with models export structure");

    // Registration with runtime (if any) is best-effort and optional.
    // We avoid strict typing issues by not calling internal registration APIs here.
    void runtime;
  },
};

export default plugin;
