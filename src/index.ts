import {
  IAgentRuntime,
  Plugin,
  ModelType,
  logger,
  GenerateTextParams,
  TextEmbeddingParams,
  ObjectGenerationParams,
} from "@elizaos/core";
import { GatewayProvider } from "./providers/gateway-provider";
import { getConfig } from "./utils/config.js";
import { openaiRoutes } from "./routes/openai-compat";
import { socketIOStreamingRoutes } from "./routes/socketio-streaming";
import { toolCallsAction } from "./actions/tool-calls";
import { centralCompatRoutes } from "./routes/central-compat";
import { healthRoutes } from "./routes/health";
export { createGatewayClient } from "./utils/client";

const plugin: Plugin = {
  name: "aigateway",
  description:
    "Universal AI Gateway integration plugin for elizaOS with Grok model protection - Access 100+ AI models through unified gateways",
  actions: [toolCallsAction],
  evaluators: [],
  providers: [],
  routes: [...openaiRoutes, ...socketIOStreamingRoutes, ...centralCompatRoutes, ...healthRoutes],
  models: {
    [ModelType.TEXT_SMALL]: async (
      runtime: IAgentRuntime,
      params: GenerateTextParams,
    ) => {
      const provider = new GatewayProvider(runtime);
      return provider.generateTextSmall(params);
    },
    [ModelType.TEXT_LARGE]: async (
      runtime: IAgentRuntime,
      params: GenerateTextParams,
    ) => {
      const provider = new GatewayProvider(runtime);
      return provider.generateTextLarge(params);
    },
    [ModelType.TEXT_EMBEDDING]: async (
      runtime: IAgentRuntime,
      params: TextEmbeddingParams,
    ) => {
      const provider = new GatewayProvider(runtime);
      return provider.generateEmbedding(params);
    },
    [ModelType.IMAGE]: async (runtime: IAgentRuntime, params: any) => {
      const provider = new GatewayProvider(runtime);
      return provider.generateImage(params);
    },
    [ModelType.OBJECT_SMALL]: async (
      runtime: IAgentRuntime,
      params: ObjectGenerationParams,
    ) => {
      const provider = new GatewayProvider(runtime);
      return provider.generateObjectSmall(params);
    },
    [ModelType.OBJECT_LARGE]: async (
      runtime: IAgentRuntime,
      params: ObjectGenerationParams,
    ) => {
      const provider = new GatewayProvider(runtime);
      return provider.generateObjectLarge(params);
    },
  },
  // Accept both usages at runtime: init(runtime) or init(config, runtime)
  init: async (...args: any[]) => {
    const runtime: IAgentRuntime = (
      args.length === 1 ? args[0] : args[1]
    ) as IAgentRuntime;

    logger.info("[AIGateway] Plugin initialized with models export structure");

    if (runtime && typeof runtime.registerModel === "function") {
      for (const [modelType, handler] of Object.entries(plugin.models ?? {})) {
        runtime.registerModel(modelType as ModelType, "aigateway", handler);
      }
      logger.info("[AIGateway] All model handlers registered.");
    }
  },
};

export default plugin;
