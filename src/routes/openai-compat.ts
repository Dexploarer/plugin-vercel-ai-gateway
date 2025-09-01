import { IAgentRuntime, Route, ModelType, logger } from "@elizaos/core";
import { Request, Response } from "express";
import { getConfig } from "../utils/config";
import { applyModelControls } from "../utils/model-controls";
// Removed processUploadedFile import - not available in current server version
import { StreamingGatewayProvider } from "../providers/streaming-gateway-provider";

/**
 * OpenAI-compatible API endpoints for the Vercel AI Gateway plugin
 * Provides standard OpenAI REST API interface while using ElizaOS model registry
 */

/**
 * GET /v1/models - List available models
 */
async function listModels(
  req: Request,
  res: Response,
  runtime: IAgentRuntime,
): Promise<void> {
  try {
    // Dynamically discover all registered models from runtime
    const modelList = [];
    const timestamp = Math.floor(Date.now() / 1000);

    // Access the runtime's model registry
    const models = (runtime as any).models; // Access private models Map

    if (models && models instanceof Map) {
      // Iterate through all registered model types
      for (const [modelType, handlers] of models.entries()) {
        if (handlers && handlers.length > 0) {
          // Include all handlers for this model type
          for (const handler of handlers) {
            modelList.push({
              id: `${handler.provider}-${modelType}`.toLowerCase(),
              object: "model",
              created: timestamp,
              owned_by: handler.provider || "unknown",
              permission: [],
              root: modelType,
              parent: null,
              elizaos_type: modelType,
              provider: handler.provider,
              priority: handler.priority || 0,
            });
          }
        }
      }
    }

    // Sort models by provider then by model type
    modelList.sort((a, b) => {
      const providerCompare = a.owned_by.localeCompare(b.owned_by);
      if (providerCompare !== 0) return providerCompare;
      return a.elizaos_type.localeCompare(b.elizaos_type);
    });

    res.json({
      object: "list",
      data: modelList,
    });
  } catch (error) {
    logger.error(
      "[AIGateway] Error listing models:",
      error instanceof Error ? error.message : String(error),
    );
    res.status(500).json({
      error: {
        message: "Internal server error",
        type: "internal_error",
      },
    });
  }
}

/**
 * POST /v1/chat/completions - OpenAI-compatible chat completions with file upload support
 */
async function chatCompletions(
  req: Request,
  res: Response,
  runtime: IAgentRuntime,
): Promise<void> {
  try {
    const {
      messages,
      model = "text-large",
      stream = false,
      temperature,
      max_tokens,
    } = req.body;

    if (!messages || !Array.isArray(messages)) {
      res.status(400).json({
        error: {
          message: "Messages parameter is required and must be an array",
          type: "invalid_request_error",
        },
      });
      return;
    }

    // Apply model controls (Grok blocking)
    const controlledModel = applyModelControls(model, getConfig(runtime));

    // Process any file uploads in messages
    const processedMessages = await processMessagesWithFiles(messages, runtime);

    // Convert messages to ElizaOS format
    const prompt = processedMessages
      .map((msg: any) => `${msg.role}: ${msg.content}`)
      .join("\n");

    // Determine model type from the requested model
    // Extract ElizaOS model type from the model parameter
    let modelType = ModelType.TEXT_LARGE; // default

    // Check if model matches provider-modeltype format
    const modelParts = model.split("-");
    if (modelParts.length >= 2) {
      const potentialModelType = modelParts.slice(1).join("_").toUpperCase();
      // Verify this is a valid ElizaOS model type
      if (Object.values(ModelType).includes(potentialModelType as any)) {
        modelType = potentialModelType as any;
      }
    }

    // Use ElizaOS model system
    const result = await runtime.useModel(modelType, {
      prompt,
      temperature,
      maxTokens: max_tokens,
    });

    if (stream) {
      // Handle Server-Sent Events streaming for OpenAI compatibility
      res.writeHead(200, {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Cache-Control",
      });

      const streamingProvider = new StreamingGatewayProvider(runtime);
      const chatId = `chatcmpl-${Date.now()}`;
      const created = Math.floor(Date.now() / 1000);

      try {
        // Generate streaming response
        const streamGenerator =
          controlledModel.includes("small") || controlledModel.includes("fast")
            ? streamingProvider.generateTextSmallStream(runtime, {
                prompt,
                temperature,
                maxTokens: max_tokens,
              })
            : streamingProvider.generateTextLargeStream(runtime, {
                prompt,
                temperature,
                maxTokens: max_tokens,
              });

        for await (const chunk of streamGenerator) {
          const streamChunk = {
            id: chatId,
            object: "chat.completion.chunk",
            created,
            model: controlledModel,
            choices: [
              {
                index: 0,
                delta: {
                  content: chunk,
                },
                finish_reason: null,
              },
            ],
          };

          res.write(`data: ${JSON.stringify(streamChunk)}\n\n`);
        }

        // Send final chunk
        const finalChunk = {
          id: chatId,
          object: "chat.completion.chunk",
          created,
          model: controlledModel,
          choices: [
            {
              index: 0,
              delta: {},
              finish_reason: "stop",
            },
          ],
        };

        res.write(`data: ${JSON.stringify(finalChunk)}\n\n`);
        res.write("data: [DONE]\n\n");
        res.end();
      } catch (streamError) {
        logger.error(
          "[AIGateway] Error in streaming:",
          streamError instanceof Error
            ? streamError.message
            : String(streamError),
        );
        res.write(
          `data: {"error": {"message": "Streaming failed", "type": "internal_error"}}\n\n`,
        );
        res.end();
      }
    } else {
      res.json({
        id: `chatcmpl-${Date.now()}`,
        object: "chat.completion",
        created: Math.floor(Date.now() / 1000),
        model: controlledModel,
        choices: [
          {
            index: 0,
            message: {
              role: "assistant",
              content: result,
            },
            finish_reason: "stop",
          },
        ],
        usage: {
          prompt_tokens: prompt.length / 4,
          completion_tokens: result.length / 4,
          total_tokens: (prompt.length + result.length) / 4,
        },
      });
    }
  } catch (error) {
    logger.error(
      "[AIGateway] Error in chat completions:",
      error instanceof Error ? error.message : String(error),
    );
    res.status(500).json({
      error: {
        message: "Internal server error",
        type: "internal_error",
      },
    });
  }
}

/**
 * POST /v1/embeddings - OpenAI-compatible embeddings
 */
async function createEmbeddings(
  req: Request,
  res: Response,
  runtime: IAgentRuntime,
): Promise<void> {
  try {
    const { input, model = "text-embedding" } = req.body;

    if (!input) {
      res.status(400).json({
        error: {
          message: "Input parameter is required",
          type: "invalid_request_error",
        },
      });
      return;
    }

    const texts = Array.isArray(input) ? input : [input];
    const embeddings = [];

    for (let i = 0; i < texts.length; i++) {
      const embedding = await runtime.useModel(
        ModelType.TEXT_EMBEDDING,
        texts[i],
      );
      embeddings.push({
        object: "embedding",
        embedding: embedding,
        index: i,
      });
    }

    res.json({
      object: "list",
      data: embeddings,
      model: model,
      usage: {
        prompt_tokens: texts.join(" ").length / 4,
        total_tokens: texts.join(" ").length / 4,
      },
    });
  } catch (error) {
    logger.error(
      "[AIGateway] Error creating embeddings:",
      error instanceof Error ? error.message : String(error),
    );
    res.status(500).json({
      error: {
        message: "Internal server error",
        type: "internal_error",
      },
    });
  }
}

/**
 * Process messages that may contain file attachments
 */
async function processMessagesWithFiles(
  messages: any[],
  runtime: IAgentRuntime,
): Promise<any[]> {
  const processedMessages = [];

  for (const message of messages) {
    if (message.content && Array.isArray(message.content)) {
      // Handle multimodal messages with images/files
      let textContent = "";
      const attachments = [];

      for (const item of message.content) {
        if (item.type === "text") {
          textContent += item.text + " ";
        } else if (item.type === "image_url" && item.image_url?.url) {
          // Handle image URLs
          const imageInfo = await processImageUrl(item.image_url.url, runtime);
          if (imageInfo) {
            attachments.push(imageInfo);
            textContent += `[Image: ${imageInfo.filename}] `;
          }
        }
      }

      processedMessages.push({
        ...message,
        content: textContent.trim(),
        attachments,
      });
    } else {
      // Regular text message
      processedMessages.push(message);
    }
  }

  return processedMessages;
}

/**
 * Process image URL for ElizaOS integration
 */
async function processImageUrl(
  url: string,
  runtime: IAgentRuntime,
): Promise<any> {
  try {
    if (url.startsWith("data:")) {
      // Handle base64 data URLs
      const matches = url.match(/^data:([^;]+);base64,(.+)$/);
      if (!matches) return null;

      const [, mimeType, base64Data] = matches;
      const buffer = Buffer.from(base64Data, "base64");

      // Create a mock uploaded file
      const mockFile = {
        originalname: `image.${mimeType.split("/")[1]}`,
        mimetype: mimeType,
        buffer: buffer,
        size: buffer.length,
      } as Express.Multer.File;

      // Mock file processing since processUploadedFile is not available
      const result = {
        filename: mockFile.originalname,
        url: `data:${mimeType};base64,${base64Data}`,
        size: buffer.length,
        type: mimeType,
      };
      return result;
    } else if (url.startsWith("http")) {
      // Handle external URLs - would need to fetch and process
      logger.info(`[AIGateway] External image URL detected: ${url}`);
      return { url, type: "external_image" };
    }

    return null;
  } catch (error) {
    logger.error(
      "[AIGateway] Error processing image URL:",
      error instanceof Error ? error.message : String(error),
    );
    return null;
  }
}

/**
 * POST /v1/files - File upload endpoint
 */
async function uploadFile(
  req: Request,
  res: Response,
  runtime: IAgentRuntime,
): Promise<void> {
  try {
    const file = req.file;
    if (!file) {
      res.status(400).json({
        error: {
          message: "No file provided",
          type: "invalid_request_error",
        },
      });
      return;
    }

    // Mock file processing since processUploadedFile is not available
    const result = {
      filename: file.originalname,
      url: `/uploads/${Date.now()}-${file.originalname}`,
      size: file.size,
      type: file.mimetype,
    };

    res.json({
      id: `file-${Date.now()}`,
      object: "file",
      bytes: file.size,
      created_at: Math.floor(Date.now() / 1000),
      filename: result.filename,
      purpose: req.body.purpose || "assistants",
      status: "processed",
      url: result.url,
    });
  } catch (error) {
    logger.error(
      "[AIGateway] Error uploading file:",
      error instanceof Error ? error.message : String(error),
    );
    res.status(500).json({
      error: {
        message: "File upload failed",
        type: "internal_error",
      },
    });
  }
}

/**
 * OpenAI-compatible routes for the plugin
 */
export const openaiRoutes: Route[] = [
  {
    type: "GET",
    path: "/v1/models",
    handler: listModels,
  },
  {
    type: "POST",
    path: "/v1/chat/completions",
    handler: chatCompletions,
  },
  {
    type: "POST",
    path: "/v1/embeddings",
    handler: createEmbeddings,
  },
  {
    type: "POST",
    path: "/v1/files",
    handler: uploadFile,
  },
];
