import { describe, it, expect, beforeEach } from "bun:test";
import { getConfig } from "../utils/config";
import type { IAgentRuntime } from "@elizaos/core";

// Mock runtime for testing
const createMockRuntime = (
  settings: Record<string, string> = {},
): IAgentRuntime => {
  return {
    getSetting: (key: string) => settings[key] || undefined,
    agentId: "test-agent-id",
    character: null,
    providers: [],
    actions: [],
    evaluators: [],
  } as unknown as IAgentRuntime;
};

describe("Config Utils", () => {
  beforeEach(() => {
    // Clear environment variables before each test
    delete process.env.AIGATEWAY_API_KEY;
    delete process.env.AIGATEWAY_BASE_URL;
    delete process.env.AIGATEWAY_DEFAULT_MODEL;
    delete process.env.AIGATEWAY_LARGE_MODEL;
    delete process.env.AIGATEWAY_EMBEDDING_MODEL;
    delete process.env.AIGATEWAY_ENABLE_GROK_MODELS;
    delete process.env.AIGATEWAY_CACHE_TTL;
    delete process.env.AIGATEWAY_MAX_RETRIES;
    delete process.env.AIGATEWAY_USE_OIDC;
  });

  describe("getConfig", () => {
    it("should return default configuration when no settings provided", () => {
      const runtime = createMockRuntime();
      const config = getConfig(runtime);

      expect(config.baseURL).toBe("https://ai-gateway.vercel.sh/v1");
      expect(config.defaultModel).toBe("openai/gpt-4o-mini");
      expect(config.largeModel).toBe("openai/gpt-4o");
      expect(config.embeddingModel).toBe("openai/text-embedding-3-small");
      expect(config.imageModel).toBe("dall-e-3");
      expect(config.grokModelsEnabled).toBe(false);
      expect(config.cacheTTL).toBe(300);
      expect(config.maxRetries).toBe(3);
      expect(config.useOIDC).toBe(false);
      expect(config.apiKey).toBeUndefined();
    });

    it("should use runtime settings when available", () => {
      const runtime = createMockRuntime({
        AIGATEWAY_API_KEY: "test-api-key",
        AIGATEWAY_BASE_URL: "https://custom-gateway.com/v1",
        AIGATEWAY_DEFAULT_MODEL: "custom/model",
        AIGATEWAY_LARGE_MODEL: "custom/large-model",
        AIGATEWAY_EMBEDDING_MODEL: "custom/embedding-model",
        AIGATEWAY_ENABLE_GROK_MODELS: "true",
        AIGATEWAY_CACHE_TTL: "600",
        AIGATEWAY_MAX_RETRIES: "5",
        AIGATEWAY_USE_OIDC: "true",
      });

      const config = getConfig(runtime);

      expect(config.apiKey).toBe("test-api-key");
      expect(config.baseURL).toBe("https://custom-gateway.com/v1");
      expect(config.defaultModel).toBe("custom/model");
      expect(config.largeModel).toBe("custom/large-model");
      expect(config.embeddingModel).toBe("custom/embedding-model");
      expect(config.grokModelsEnabled).toBe(true);
      expect(config.cacheTTL).toBe(600);
      expect(config.maxRetries).toBe(5);
      expect(config.useOIDC).toBe(true);
    });

    it("should fallback to environment variables when runtime settings not available", () => {
      process.env.AIGATEWAY_API_KEY = "env-api-key";
      process.env.AIGATEWAY_BASE_URL = "https://env-gateway.com/v1";
      process.env.AIGATEWAY_DEFAULT_MODEL = "env/model";
      process.env.AIGATEWAY_ENABLE_GROK_MODELS = "true";

      const runtime = createMockRuntime();
      const config = getConfig(runtime);

      expect(config.apiKey).toBe("env-api-key");
      expect(config.baseURL).toBe("https://env-gateway.com/v1");
      expect(config.defaultModel).toBe("env/model");
      expect(config.grokModelsEnabled).toBe(true);
    });

    it("should prioritize runtime settings over environment variables", () => {
      process.env.AIGATEWAY_API_KEY = "env-api-key";
      process.env.AIGATEWAY_BASE_URL = "https://env-gateway.com/v1";

      const runtime = createMockRuntime({
        AIGATEWAY_API_KEY: "runtime-api-key",
        AIGATEWAY_BASE_URL: "https://runtime-gateway.com/v1",
      });

      const config = getConfig(runtime);

      expect(config.apiKey).toBe("runtime-api-key");
      expect(config.baseURL).toBe("https://runtime-gateway.com/v1");
    });

    it("should handle boolean conversion correctly", () => {
      const runtime = createMockRuntime({
        AIGATEWAY_ENABLE_GROK_MODELS: "false",
        AIGATEWAY_USE_OIDC: "0",
      });

      const config = getConfig(runtime);

      expect(config.grokModelsEnabled).toBe(false);
      expect(config.useOIDC).toBe(false);
    });

    it("should handle number conversion correctly", () => {
      const runtime = createMockRuntime({
        AIGATEWAY_CACHE_TTL: "1200",
        AIGATEWAY_MAX_RETRIES: "10",
      });

      const config = getConfig(runtime);

      expect(config.cacheTTL).toBe(1200);
      expect(config.maxRetries).toBe(10);
    });

    it("should handle invalid number values gracefully", () => {
      const runtime = createMockRuntime({
        AIGATEWAY_CACHE_TTL: "invalid",
        AIGATEWAY_MAX_RETRIES: "not-a-number",
      });

      const config = getConfig(runtime);

      // Should fallback to defaults when parsing fails
      expect(config.cacheTTL).toBe(300);
      expect(config.maxRetries).toBe(3);
    });
  });
});
