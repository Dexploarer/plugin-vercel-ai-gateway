import { IAgentRuntime, logger } from "@elizaos/core";
import { GatewayProvider } from "./gateway-provider";
import { getConfig } from "../utils/config";
import { applyModelControls } from "../utils/model-controls";

/**
 * Streaming Gateway Provider for real-time token streaming
 * Extends the base GatewayProvider with streaming capabilities
 */
export class StreamingGatewayProvider extends GatewayProvider {
  constructor(runtime: IAgentRuntime) {
    super(runtime);
  }

  /**
   * Generate streaming text response for small models
   */
  async *generateTextSmallStream(
    runtime: IAgentRuntime,
    params: any,
  ): AsyncGenerator<string, void, unknown> {
    yield* this.generateStreamingText(runtime, params, "small");
  }

  /**
   * Generate streaming text response for large models
   */
  async *generateTextLargeStream(
    runtime: IAgentRuntime,
    params: any,
  ): AsyncGenerator<string, void, unknown> {
    yield* this.generateStreamingText(runtime, params, "large");
  }

  /**
   * Core streaming text generation with model controls
   */
  private async *generateStreamingText(
    runtime: IAgentRuntime,
    params: any,
    modelSize: "small" | "large",
  ): AsyncGenerator<string, void, unknown> {
    try {
      const config = getConfig(runtime);
      const prompt =
        params.prompt ||
        params.messages?.map((m: any) => `${m.role}: ${m.content}`).join("\n");

      if (!prompt) {
        throw new Error("No prompt provided for streaming generation");
      }

      // Determine model based on size and apply controls
      let model =
        modelSize === "small"
          ? "anthropic/claude-3-haiku:beta"
          : "anthropic/claude-3-5-sonnet:beta";
      model = applyModelControls(model, config);

      logger.debug(
        `[StreamingGateway] Starting streaming generation with model: ${model}`,
      );

      // Create streaming request to Vercel AI Gateway
      const streamingResponse = await this.createStreamingRequest(config, {
        model,
        messages: this.formatMessages(prompt),
        stream: true,
        temperature: params.temperature || 0.7,
        max_tokens: params.maxTokens || 2000,
      });

      // Process streaming response
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

          // Keep the last incomplete line in buffer
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
                // Skip invalid JSON chunks
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
  private async createStreamingRequest(
    config: any,
    payload: any,
  ): Promise<Response> {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };

    // Add authentication headers
    if (config.useOIDC && config.oidcToken) {
      headers["Authorization"] = `Bearer ${config.oidcToken}`;
    } else if (config.apiKey) {
      headers["Authorization"] = `Bearer ${config.apiKey}`;
    }

    const response = await fetch(`${config.baseURL}/v1/chat/completions`, {
      method: "POST",
      headers,
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(
        `AI Gateway streaming request failed: ${response.status} ${response.statusText}`,
      );
    }

    return response;
  }

  /**
   * Format prompt into OpenAI-style messages
   */
  private formatMessages(
    prompt: string,
  ): Array<{ role: string; content: string }> {
    // If prompt already looks like formatted messages, parse it
    if (
      prompt.includes("user:") ||
      prompt.includes("assistant:") ||
      prompt.includes("system:")
    ) {
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

    // Default: treat as user message
    return [{ role: "user", content: prompt }];
  }

  /**
   * Generate streaming object response
   */
  async *generateObjectStream(
    runtime: IAgentRuntime,
    params: any,
    modelSize: "small" | "large" = "large",
  ): AsyncGenerator<string, void, unknown> {
    // For object generation, we'll accumulate the stream and parse at the end
    let accumulated = "";

    for await (const chunk of this.generateStreamingText(
      runtime,
      params,
      modelSize,
    )) {
      accumulated += chunk;
      // Yield intermediate chunks for progress indication
      yield chunk;
    }

    // Try to parse the final accumulated content as JSON
    try {
      JSON.parse(accumulated);
      // If valid JSON, we're done
    } catch {
      // If not valid JSON, log warning but continue
      logger.warn("[StreamingGateway] Generated content may not be valid JSON");
    }
  }
}
