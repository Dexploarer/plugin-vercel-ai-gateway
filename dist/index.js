import {
  GatewayProvider,
  __name
} from "./chunk-6NEAWAQZ.js";

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
      const provider = new GatewayProvider(params.runtime);
      return provider.generateTextSmall(params);
    },
    [ModelType.TEXT_LARGE]: async (params) => {
      const provider = new GatewayProvider(params.runtime);
      return provider.generateTextLarge(params);
    },
    [ModelType.TEXT_EMBEDDING]: async (params) => {
      const provider = new GatewayProvider(params.runtime);
      return provider.generateEmbedding(params);
    },
    [ModelType.IMAGE]: async (params) => {
      const provider = new GatewayProvider(params.runtime);
      return provider.generateImage(params);
    },
    [ModelType.OBJECT_SMALL]: async (params) => {
      const provider = new GatewayProvider(params.runtime);
      return provider.generateObjectSmall(params);
    },
    [ModelType.OBJECT_LARGE]: async (params) => {
      const provider = new GatewayProvider(params.runtime);
      return provider.generateObjectLarge(params);
    }
  },
  init: /* @__PURE__ */ __name(async (config, runtime) => {
    logger.info("[AIGateway] Plugin initialized with models export structure");
  }, "init")
};
var index_default = plugin;
export {
  index_default as default
};
