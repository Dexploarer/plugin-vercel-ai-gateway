import {
  GatewayProvider,
  applyModelControls,
  getConfig
} from "./chunk-SNN2DLUZ.js";

// src/providers/streaming-gateway-provider.ts
import { logger } from "@elizaos/core";
var StreamingGatewayProvider = class extends GatewayProvider {
  constructor(runtime) {
    super(runtime);
  }
  /**
   * Generate streaming text response for small models
   */
  async *generateTextSmallStream(runtime, params) {
    yield* this.generateStreamingText(runtime, params, "small");
  }
  /**
   * Generate streaming text response for large models
   */
  async *generateTextLargeStream(runtime, params) {
    yield* this.generateStreamingText(runtime, params, "large");
  }
  /**
   * Core streaming text generation with model controls
   */
  async *generateStreamingText(runtime, params, modelSize) {
    try {
      const config = getConfig(runtime);
      const prompt = params.prompt || params.messages?.map((m) => `${m.role}: ${m.content}`).join("\n");
      if (!prompt) {
        throw new Error("No prompt provided for streaming generation");
      }
      let model = modelSize === "small" ? "anthropic/claude-3-haiku:beta" : "anthropic/claude-3-5-sonnet:beta";
      model = applyModelControls(model, config);
      logger.debug(
        `[StreamingGateway] Starting streaming generation with model: ${model}`
      );
      const streamingResponse = await this.createStreamingRequest(config, {
        model,
        messages: this.formatMessages(prompt),
        stream: true,
        temperature: params.temperature || 0.7,
        max_tokens: params.maxTokens || 2e3
      });
      const reader = streamingResponse.body?.getReader();
      if (!reader) {
        throw new Error("No reader available for streaming response");
      }
      const decoder = new TextDecoder();
      let buffer = "";
      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) {
            break;
          }
          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n");
          buffer = lines.pop() || "";
          for (const line of lines) {
            if (line.startsWith("data: ")) {
              const data = line.slice(6).trim();
              if (data === "[DONE]") {
                return;
              }
              try {
                const parsed = JSON.parse(data);
                const content = parsed.choices?.[0]?.delta?.content;
                if (content) {
                  yield content;
                }
              } catch (parseError) {
                continue;
              }
            }
          }
        }
      } finally {
        reader.releaseLock();
      }
    } catch (error) {
      logger.error("[StreamingGateway] Error in streaming generation:", error);
      throw error;
    }
  }
  /**
   * Create streaming HTTP request to AI Gateway
   */
  async createStreamingRequest(config, payload) {
    const headers = {
      "Content-Type": "application/json"
    };
    if (config.useOIDC && config.oidcToken) {
      headers["Authorization"] = `Bearer ${config.oidcToken}`;
    } else if (config.apiKey) {
      headers["Authorization"] = `Bearer ${config.apiKey}`;
    }
    const response = await fetch(`${config.baseURL}/v1/chat/completions`, {
      method: "POST",
      headers,
      body: JSON.stringify(payload)
    });
    if (!response.ok) {
      throw new Error(
        `AI Gateway streaming request failed: ${response.status} ${response.statusText}`
      );
    }
    return response;
  }
  /**
   * Format prompt into OpenAI-style messages
   */
  formatMessages(prompt) {
    if (prompt.includes("user:") || prompt.includes("assistant:") || prompt.includes("system:")) {
      const messages = [];
      const lines = prompt.split("\n").filter((line) => line.trim());
      for (const line of lines) {
        const colonIndex = line.indexOf(":");
        if (colonIndex > 0) {
          const role = line.substring(0, colonIndex).trim().toLowerCase();
          const content = line.substring(colonIndex + 1).trim();
          if (["user", "assistant", "system"].includes(role) && content) {
            messages.push({ role, content });
          }
        }
      }
      if (messages.length > 0) {
        return messages;
      }
    }
    return [{ role: "user", content: prompt }];
  }
  /**
   * Generate streaming object response
   */
  async *generateObjectStream(runtime, params, modelSize = "large") {
    let accumulated = "";
    for await (const chunk of this.generateStreamingText(
      runtime,
      params,
      modelSize
    )) {
      accumulated += chunk;
      yield chunk;
    }
    try {
      JSON.parse(accumulated);
    } catch {
      logger.warn("[StreamingGateway] Generated content may not be valid JSON");
    }
  }
};

export {
  StreamingGatewayProvider
};
