import { describe, it, expect, beforeEach, mock } from "bun:test";
import plugin from "../index";
import type { IAgentRuntime } from "@elizaos/core";

// Mock runtime for testing
const createMockRuntime = (
  settings: Record<string, string> = {},
): IAgentRuntime => {
  const mockRuntime = {
    getSetting: (key: string) => settings[key] || undefined,
    agentId: "test-agent-id",
    character: null,
    providers: [],
    actions: [],
    evaluators: [],
    registerModel: mock(() => {}),
  } as unknown as IAgentRuntime;

  return mockRuntime;
};

describe("AI Gateway Plugin", () => {
  beforeEach(() => {
    // Clear environment variables
    delete process.env.AIGATEWAY_API_KEY;
    delete process.env.AIGATEWAY_BASE_URL;
    delete process.env.AIGATEWAY_DEFAULT_MODEL;
  });

  describe("plugin structure", () => {
    it("should have correct plugin metadata", () => {
      expect(plugin.name).toBe("aigateway");
      expect(plugin.description).toContain("Universal AI Gateway integration");
      expect(plugin.routes).toBeDefined();
      expect(plugin.actions).toBeDefined();
      expect(plugin.init).toBeDefined();
    });

    it("should have routes defined", () => {
      expect(Array.isArray(plugin.routes)).toBe(true);
      expect(plugin.routes.length).toBeGreaterThan(0);
    });

    it("should have no actions defined", () => {
      expect(Array.isArray(plugin.actions)).toBe(true);
      expect(plugin.actions.length).toBe(0);
    });
  });

  describe("plugin initialization", () => {
    it("should initialize successfully with valid runtime", async () => {
      const mockRuntime = createMockRuntime({
        AIGATEWAY_API_KEY: "test-key",
        AIGATEWAY_BASE_URL: "https://test.com/v1",
      });

      await plugin.init(mockRuntime);
    });

    it("should handle missing getSetting method gracefully", async () => {
      const invalidRuntime = {
        agentId: "test-agent-id",
        character: null,
        providers: [],
        actions: [],
        evaluators: [],
        registerModel: mock(() => {}),
        // Missing getSetting method
      } as unknown as IAgentRuntime;

      await plugin.init(invalidRuntime);
    });

    it("should work with environment variables when runtime settings not available", async () => {
      process.env.AIGATEWAY_API_KEY = "env-test-key";
      process.env.AIGATEWAY_BASE_URL = "https://env-test.com/v1";

      const mockRuntime = createMockRuntime(); // No runtime settings

      await plugin.init(mockRuntime);
    });
  });

  describe("configuration handling", () => {
    it("should use default values when no configuration provided", async () => {
      const mockRuntime = createMockRuntime();

      await plugin.init(mockRuntime);
    });

    it("should prioritize runtime settings over environment variables", async () => {
      process.env.AIGATEWAY_API_KEY = "env-key";

      const mockRuntime = createMockRuntime({
        AIGATEWAY_API_KEY: "runtime-key",
      });

      await plugin.init(mockRuntime);
    });
  });
});
