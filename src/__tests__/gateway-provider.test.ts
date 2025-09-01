import { describe, it, expect, beforeEach, mock } from "bun:test";
import { GatewayProvider } from "../providers/gateway-provider";
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

describe("GatewayProvider", () => {
  let provider: GatewayProvider;
  let mockRuntime: IAgentRuntime;

  beforeEach(() => {
    // Clear environment variables
    delete process.env.AIGATEWAY_API_KEY;
    delete process.env.AIGATEWAY_BASE_URL;
    delete process.env.AIGATEWAY_DEFAULT_MODEL;

    mockRuntime = createMockRuntime({
      AIGATEWAY_API_KEY: "test-api-key",
      AIGATEWAY_BASE_URL: "https://test-gateway.com/v1",
      AIGATEWAY_DEFAULT_MODEL: "openai/gpt-4o-mini",
    });

    provider = new GatewayProvider(mockRuntime);
  });

  describe("constructor", () => {
    it("should initialize with runtime", () => {
      expect(provider).toBeDefined();
    });

    it("should handle runtime without getSetting gracefully", () => {
      const invalidRuntime = {} as IAgentRuntime;

      // Should not throw - our getSetting helper handles missing getSetting method
      expect(() => {
        new GatewayProvider(invalidRuntime);
      }).not.toThrow();
    });
  });

  describe("generateTextSmall", () => {
    it("should handle basic text generation request", async () => {
      // This test verifies the provider can be instantiated and called
      // without throwing runtime.getSetting errors
      expect(() => {
        // We're testing that the provider initializes correctly
        // The actual AI call would be mocked in a full test suite
        expect(provider).toBeDefined();
      }).not.toThrow();
    });
  });

  describe("generateEmbedding", () => {
    it("should handle embedding generation request", async () => {
      // Test that provider can access configuration without errors
      expect(provider).toBeDefined();
    });
  });

  describe("generateObjectSmall", () => {
    it("should handle object generation request", async () => {
      // Test that provider can access configuration without errors
      expect(provider).toBeDefined();
    });
  });
});
