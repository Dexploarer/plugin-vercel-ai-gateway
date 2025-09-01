import {
  GatewayProvider
} from "./chunk-KHSAEYF5.js";

// src/index.ts
import { ModelType, logger } from "@elizaos/core";
var plugin = {
  name: "aigateway",
  description: "Universal AI Gateway integration plugin for elizaOS with Grok model protection - Access 100+ AI models through unified gateways",
  actions: [],
  evaluators: [],
  providers: [],
  models: {
    [ModelType.TEXT_SMALL]: async (params) => {
      if (!params || !params.runtime) {
        throw new Error("Runtime parameter is required");
      }
      const provider = new GatewayProvider(params.runtime);
      return provider.generateTextSmall(params);
    },
    [ModelType.TEXT_LARGE]: async (params) => {
      if (!params || !params.runtime) {
        throw new Error("Runtime parameter is required");
      }
      const provider = new GatewayProvider(params.runtime);
      return provider.generateTextLarge(params);
    },
    [ModelType.TEXT_EMBEDDING]: async (params) => {
      if (!params || !params.runtime) {
        throw new Error("Embedding parameters cannot be null");
      }
      const provider = new GatewayProvider(params.runtime);
      return provider.generateEmbedding(params);
    },
    [ModelType.IMAGE]: async (params) => {
      if (!params || !params.runtime) {
        throw new Error("Runtime parameter is required");
      }
      const provider = new GatewayProvider(params.runtime);
      return provider.generateImage(params);
    },
    [ModelType.OBJECT_SMALL]: async (params) => {
      if (!params || !params.runtime) {
        throw new Error("Runtime parameter is required");
      }
      const provider = new GatewayProvider(params.runtime);
      return provider.generateObjectSmall(params);
    },
    [ModelType.OBJECT_LARGE]: async (params) => {
      if (!params || !params.runtime) {
        throw new Error("Runtime parameter is required");
      }
      const provider = new GatewayProvider(params.runtime);
      return provider.generateObjectLarge(params);
    }
  },
  init: async (config, runtime) => {
    logger.info("[AIGateway] Plugin initialized with models export structure");
  }
};
var index_default = plugin;
export {
  index_default as default
};
