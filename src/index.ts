import { IAgentRuntime, Plugin, ModelType, logger } from "@elizaos/core";
import { GatewayProvider } from "./providers/gateway-provider";
import { GatewayProvider } from "./providers/gateway-provider.js";
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
    [ModelType.TEXT_SMALL]: async (params: any) => {
      if (!params || !params.runtime) {
        throw new Error("Runtime parameter is required");
      }
      const provider = new GatewayProvider(params.runtime);
      return provider.generateTextSmall(params);
    },
    [ModelType.TEXT_LARGE]: async (params: any) => {
      if (!params || !params.runtime) {
        throw new Error("Runtime parameter is required");
      }
      const provider = new GatewayProvider(params.runtime);
      return provider.generateTextLarge(params);
    },
    [ModelType.TEXT_EMBEDDING]: async (params: any) => {
      if (!params || !params.runtime) {
        throw new Error("Embedding parameters cannot be null");
      }
      const provider = new GatewayProvider(params.runtime);
      return provider.generateEmbedding(params);
    },
    [ModelType.IMAGE]: async (params: any) => {
      if (!params || !params.runtime) {
        throw new Error("Runtime parameter is required");
      }
      const provider = new GatewayProvider(params.runtime);
      return provider.generateImage(params);
    },
    [ModelType.OBJECT_SMALL]: async (params: any) => {
      if (!params || !params.runtime) {
        throw new Error("Runtime parameter is required");
      }
      const provider = new GatewayProvider(params.runtime);
      return provider.generateObjectSmall(params);
    },
    [ModelType.OBJECT_LARGE]: async (params: any) => {
      if (!params || !params.runtime) {
        throw new Error("Runtime parameter is required");
      }
      const provider = new GatewayProvider(params.runtime);
      return provider.generateObjectLarge(params);
    },
  },
  // Accept both usages at runtime: init(runtime) or init(config, runtime)
  // Keep implementation simple and type-safe: no return value expected
  init: async (...args: any[]) => {
    const runtime: IAgentRuntime = (args.length === 1
      ? (args[0] as IAgentRuntime)
      : (args[1] as IAgentRuntime)) as IAgentRuntime;

    logger.info("[AIGateway] Plugin initialized with models export structure");
  },

    // Registration with runtime (if any) is best-effort and optional.
    // We avoid strict typing issues by not calling internal registration APIs here.
    void runtime;
  }
};

export default plugin;
