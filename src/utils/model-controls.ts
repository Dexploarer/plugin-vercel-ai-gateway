import { logger } from "@elizaos/core";

/**
 * Grok model identifiers - BLOCKED BY DEFAULT
 * 
 * In support of ElizaOS in their ongoing legal matters with X/xAI,
 * all Grok models are disabled by default. Users must explicitly
 * opt-in to use these models.
 * 
 * Current xAI/Grok model lineup:
 * - Grok Code Fast 1: $0.20/M input, $1.50/M output
 * - Grok 4: $3.00/M input, $15.00/M output  
 * - Grok 3 Fast Beta: $5.00/M input, $25.00/M output
 * - Grok 3 Mini Beta: $0.30/M input, $0.50/M output
 * - Grok 3 Beta: $3.00/M input, $15.00/M output
 * - Grok 2: $2.00/M input, $10.00/M output
 * - Grok 2 Vision: $2.00/M input, $10.00/M output
 * 
 * To enable: Set AIGATEWAY_ENABLE_GROK_MODELS=true in your environment
 */
const GROK_MODEL_PATTERNS = [
  // xAI provider format
  /^xai\/grok-code-fast-1$/i,
  /^xai\/grok-4$/i,
  /^xai\/grok-3-fast-beta$/i,
  /^xai\/grok-3-mini-beta$/i,
  /^xai\/grok-3-beta$/i,
  /^xai\/grok-2$/i,
  /^xai\/grok-2-vision$/i,
  
  // Alternative formats that might be used
  /^xai\/grok/i,
  /^grok-/i,
  /^grok[0-9]/i,
  /grok.*code.*fast/i,
  /grok.*fast.*beta/i,
  /grok.*mini.*beta/i,
  /grok.*beta/i,
  /grok.*vision/i,
  
  // Catch any xai models
  /^xai\//i
];

/**
 * Check if a model is a Grok model that requires explicit user consent
 */
export function isGrokModel(modelName: string): boolean {
  return GROK_MODEL_PATTERNS.some(pattern => pattern.test(modelName));
}

/**
 * Check if Grok models are specifically enabled by the user
 */
export function areGrokModelsEnabled(runtime: any): boolean {
  const grokEnabled = runtime.getSetting("AIGATEWAY_ENABLE_GROK_MODELS");
  return grokEnabled === "true" || grokEnabled === true;
}

/**
 * Check if high-cost models are enabled by the user
 */
export function areHighCostModelsEnabled(runtime: any): boolean {
  const highCostEnabled = runtime.getSetting("AIGATEWAY_ENABLE_HIGH_COST_MODELS");
  return highCostEnabled === "true" || highCostEnabled === true;
}

/**
 * Validate if a model can be used based on user settings
 */
export function validateModelAccess(modelName: string, runtime: any): {
  allowed: boolean;
  reason?: string;
  suggestion?: string;
} {
  // Check for Grok models - blocked in support of ElizaOS
  if (isGrokModel(modelName)) {
    if (!areGrokModelsEnabled(runtime)) {
      return {
        allowed: false,
        reason: "Grok/xAI models are disabled by default in support of ElizaOS",
        suggestion: "To override this protection, set AIGATEWAY_ENABLE_GROK_MODELS=true in your environment"
      };
    }
  }

  return { allowed: true };
}

/**
 * Log model access attempt for monitoring
 */
export function logModelAccess(modelName: string, allowed: boolean, reason?: string): void {
  if (allowed) {
    if (isGrokModel(modelName)) {
      logger.warn(`[AIGateway] Grok model access granted (user override): ${modelName}`);
    } else {
      logger.info(`[AIGateway] Model access granted: ${modelName}`);
    }
  } else {
    if (isGrokModel(modelName)) {
      logger.info(`[AIGateway] Grok model blocked in support of ElizaOS: ${modelName}`);
    } else {
      logger.warn(`[AIGateway] Model access denied: ${modelName} - ${reason}`);
    }
  }
}

/**
 * Get safe alternative model suggestions for Grok models
 */
export function getSafeAlternative(modelName: string): string {
  // Grok alternatives - suggest equivalent OpenAI/Anthropic models
  if (isGrokModel(modelName)) {
    // Map specific Grok models to appropriate alternatives
    if (/grok-4/i.test(modelName)) {
      return "openai/gpt-4o"; // Flagship model equivalent
    }
    if (/grok.*code/i.test(modelName)) {
      return "openai/gpt-4o"; // Good for coding
    }
    if (/grok-3.*fast/i.test(modelName)) {
      return "anthropic/claude-3-5-sonnet"; // Fast and capable
    }
    if (/grok.*mini/i.test(modelName)) {
      return "openai/gpt-4o-mini"; // Lightweight equivalent
    }
    if (/grok.*vision/i.test(modelName)) {
      return "openai/gpt-4o"; // Vision capabilities
    }
    // Default Grok alternative
    return "openai/gpt-4o";
  }

  // Default safe alternative for any other blocked models
  return "openai/gpt-4o-mini";
}

/**
 * Enhanced model validation with automatic fallback
 */
export function validateAndSuggestModel(modelName: string, runtime: any): {
  modelToUse: string;
  wasBlocked: boolean;
  originalModel?: string;
  reason?: string;
} {
  const validation = validateModelAccess(modelName, runtime);
  
  if (validation.allowed) {
    return {
      modelToUse: modelName,
      wasBlocked: false
    };
  }

  const safeAlternative = getSafeAlternative(modelName);
  
  if (isGrokModel(modelName)) {
    logger.info(`[AIGateway] Grok model ${modelName} blocked in support of ElizaOS`);
    logger.info(`[AIGateway] Using alternative model: ${safeAlternative}`);
    logger.info(`[AIGateway] ${validation.suggestion}`);
  } else {
    logger.warn(`[AIGateway] Blocked ${modelName}: ${validation.reason}`);
    logger.info(`[AIGateway] Using safe alternative: ${safeAlternative}`);
    logger.info(`[AIGateway] To use original model: ${validation.suggestion}`);
  }

  return {
    modelToUse: safeAlternative,
    wasBlocked: true,
    originalModel: modelName,
    reason: validation.reason
  };
}
