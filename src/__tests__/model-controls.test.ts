import { describe, it, expect, beforeEach } from "bun:test";
import {
  isGrokModel,
  areGrokModelsEnabled,
  validateModelAccess,
  logModelAccess,
  getAlternativeModel,
  validateAndSuggestModel,
  applyModelControls,
} from "../utils/model-controls";

// Mock runtime for testing
const createMockRuntime = (grokEnabled: boolean = false) => ({
  getSetting: (key: string) => {
    if (key === "AIGATEWAY_ENABLE_GROK_MODELS") {
      return grokEnabled ? "true" : "false";
    }
    return null;
  },
});

describe("Model Controls", () => {
  describe("isGrokModel", () => {
    it("should identify Grok models correctly", () => {
      expect(isGrokModel("xai/grok-4")).toBe(true);
      expect(isGrokModel("xai/grok-code-fast-1")).toBe(true);
      expect(isGrokModel("xai/grok-3-fast-beta")).toBe(true);
      expect(isGrokModel("xai/grok-2-vision")).toBe(true);
      expect(isGrokModel("grok-4")).toBe(true);
      expect(isGrokModel("GROK-CODE-FAST")).toBe(true);
    });

    it("should not identify non-Grok models as Grok", () => {
      expect(isGrokModel("openai/gpt-4o")).toBe(false);
      expect(isGrokModel("anthropic/claude-3-5-sonnet")).toBe(false);
      expect(isGrokModel("meta/llama-3")).toBe(false);
      expect(isGrokModel("")).toBe(false);
    });

    it("should catch all xAI models", () => {
      expect(isGrokModel("xai/some-new-model")).toBe(true);
      expect(isGrokModel("XAI/FUTURE-MODEL")).toBe(true);
    });
  });

  describe("areGrokModelsEnabled", () => {
    it("should return false when Grok models are disabled", () => {
      const runtime = createMockRuntime(false);
      expect(areGrokModelsEnabled(runtime)).toBe(false);
    });

    it("should return true when Grok models are enabled", () => {
      const runtime = createMockRuntime(true);
      expect(areGrokModelsEnabled(runtime)).toBe(true);
    });

    it("should handle boolean true setting", () => {
      const runtime = {
        getSetting: () => true,
      };
      expect(areGrokModelsEnabled(runtime)).toBe(true);
    });
  });

  describe("validateModelAccess", () => {
    it("should allow non-Grok models", () => {
      const runtime = createMockRuntime(false);
      const result = validateModelAccess("openai/gpt-4o", runtime);

      expect(result.allowed).toBe(true);
      expect(result.reason).toBeUndefined();
    });

    it("should block Grok models when disabled", () => {
      const runtime = createMockRuntime(false);
      const result = validateModelAccess("xai/grok-4", runtime);

      expect(result.allowed).toBe(false);
      expect(result.reason).toContain(
        "disabled by default in support of ElizaOS",
      );
      expect(result.suggestion).toContain("AIGATEWAY_ENABLE_GROK_MODELS=true");
    });

    it("should allow Grok models when explicitly enabled", () => {
      const runtime = createMockRuntime(true);
      const result = validateModelAccess("xai/grok-4", runtime);

      expect(result.allowed).toBe(true);
    });
  });

  describe("getAlternativeModel", () => {
    it("should suggest appropriate alternatives for Grok models", () => {
      expect(getAlternativeModel("xai/grok-4")).toBe("openai/gpt-4o");
      expect(getAlternativeModel("xai/grok-code-fast-1")).toBe("openai/gpt-4o");
      expect(getAlternativeModel("xai/grok-3-fast-beta")).toBe(
        "anthropic/claude-3-5-sonnet",
      );
      expect(getAlternativeModel("xai/grok-3-mini-beta")).toBe(
        "openai/gpt-4o-mini",
      );
      expect(getAlternativeModel("xai/grok-2-vision")).toBe("openai/gpt-4o");
    });

    it("should provide default alternative for non-specific models", () => {
      expect(getAlternativeModel("some-other-model")).toBe(
        "openai/gpt-4o-mini",
      );
      expect(getAlternativeModel("xai/unknown-grok")).toBe("openai/gpt-4o");
    });
  });

  describe("validateAndSuggestModel", () => {
    it("should return original model when allowed", () => {
      const runtime = createMockRuntime(false);
      const result = validateAndSuggestModel("openai/gpt-4o", runtime);

      expect(result.modelToUse).toBe("openai/gpt-4o");
      expect(result.wasBlocked).toBe(false);
      expect(result.originalModel).toBeUndefined();
    });

    it("should suggest alternative when model is blocked", () => {
      const runtime = createMockRuntime(false);
      const result = validateAndSuggestModel("xai/grok-4", runtime);

      expect(result.modelToUse).toBe("openai/gpt-4o");
      expect(result.wasBlocked).toBe(true);
      expect(result.originalModel).toBe("xai/grok-4");
      expect(result.reason).toContain("disabled by default");
    });

    it("should allow Grok models when explicitly enabled", () => {
      const runtime = createMockRuntime(true);
      const result = validateAndSuggestModel("xai/grok-4", runtime);

      expect(result.modelToUse).toBe("xai/grok-4");
      expect(result.wasBlocked).toBe(false);
    });
  });

  describe("applyModelControls", () => {
    it("should apply controls and return final model", () => {
      const config = createMockRuntime(false);
      const result = applyModelControls("xai/grok-4", config);

      expect(result).toBe("openai/gpt-4o");
    });

    it("should return original model when not blocked", () => {
      const config = createMockRuntime(false);
      const result = applyModelControls("openai/gpt-4o", config);

      expect(result).toBe("openai/gpt-4o");
    });

    it("should handle enabled Grok models", () => {
      const config = createMockRuntime(true);
      const result = applyModelControls("xai/grok-4", config);

      expect(result).toBe("xai/grok-4");
    });
  });
});
