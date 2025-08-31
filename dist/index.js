import {
  GatewayProvider,
  StreamingGatewayProvider,
  applyModelControls,
  getConfig
} from "./chunk-KLWPYNXA.js";

// src/index.ts
import {
  ModelType as ModelType2,
  logger as logger4
} from "@elizaos/core";

// src/routes/openai-compat.ts
import {
  ModelType,
  logger
} from "@elizaos/core";
import { processUploadedFile } from "@elizaos/core";
async function listModels(req, res, runtime) {
  try {
    const modelList = [];
    const timestamp = Math.floor(Date.now() / 1e3);
    const models = runtime.models;
    if (models && models instanceof Map) {
      for (const [modelType, handlers] of models.entries()) {
        if (handlers && handlers.length > 0) {
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
              priority: handler.priority || 0
            });
          }
        }
      }
    }
    modelList.sort((a, b) => {
      const providerCompare = a.owned_by.localeCompare(b.owned_by);
      if (providerCompare !== 0) return providerCompare;
      return a.elizaos_type.localeCompare(b.elizaos_type);
    });
    res.json({
      object: "list",
      data: modelList
    });
  } catch (error) {
    logger.error("[AIGateway] Error listing models:", error);
    res.status(500).json({
      error: {
        message: "Internal server error",
        type: "internal_error"
      }
    });
  }
}
async function chatCompletions(req, res, runtime) {
  try {
    const { messages, model = "text-large", stream = false, temperature, max_tokens } = req.body;
    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({
        error: {
          message: "Messages parameter is required and must be an array",
          type: "invalid_request_error"
        }
      });
    }
    const controlledModel = applyModelControls(model, getConfig(runtime));
    const processedMessages = await processMessagesWithFiles(messages, runtime);
    const prompt = processedMessages.map((msg) => `${msg.role}: ${msg.content}`).join("\n");
    let modelType = ModelType.TEXT_LARGE;
    const modelParts = model.split("-");
    if (modelParts.length >= 2) {
      const potentialModelType = modelParts.slice(1).join("_").toUpperCase();
      if (Object.values(ModelType).includes(potentialModelType)) {
        modelType = potentialModelType;
      }
    }
    const result = await runtime.useModel(modelType, {
      prompt,
      temperature,
      maxTokens: max_tokens
    });
    if (stream) {
      res.writeHead(200, {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-cache",
        "Connection": "keep-alive",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Cache-Control"
      });
      const streamingProvider = new StreamingGatewayProvider(runtime);
      const chatId = `chatcmpl-${Date.now()}`;
      const created = Math.floor(Date.now() / 1e3);
      try {
        const streamGenerator = controlledModel.includes("small") || controlledModel.includes("fast") ? streamingProvider.generateTextSmallStream(runtime, { prompt, temperature, maxTokens: max_tokens }) : streamingProvider.generateTextLargeStream(runtime, { prompt, temperature, maxTokens: max_tokens });
        for await (const chunk of streamGenerator) {
          const streamChunk = {
            id: chatId,
            object: "chat.completion.chunk",
            created,
            model: controlledModel,
            choices: [{
              index: 0,
              delta: {
                content: chunk
              },
              finish_reason: null
            }]
          };
          res.write(`data: ${JSON.stringify(streamChunk)}

`);
        }
        const finalChunk = {
          id: chatId,
          object: "chat.completion.chunk",
          created,
          model: controlledModel,
          choices: [{
            index: 0,
            delta: {},
            finish_reason: "stop"
          }]
        };
        res.write(`data: ${JSON.stringify(finalChunk)}

`);
        res.write("data: [DONE]\n\n");
        res.end();
      } catch (streamError) {
        logger.error("[AIGateway] Error in streaming:", streamError);
        res.write(`data: {"error": {"message": "Streaming failed", "type": "internal_error"}}

`);
        res.end();
      }
    } else {
      res.json({
        id: `chatcmpl-${Date.now()}`,
        object: "chat.completion",
        created: Math.floor(Date.now() / 1e3),
        model: controlledModel,
        choices: [{
          index: 0,
          message: {
            role: "assistant",
            content: result
          },
          finish_reason: "stop"
        }],
        usage: {
          prompt_tokens: prompt.length / 4,
          completion_tokens: result.length / 4,
          total_tokens: (prompt.length + result.length) / 4
        }
      });
    }
  } catch (error) {
    logger.error("[AIGateway] Error in chat completions:", error);
    res.status(500).json({
      error: {
        message: "Internal server error",
        type: "internal_error"
      }
    });
  }
}
async function createEmbeddings(req, res, runtime) {
  try {
    const { input, model = "text-embedding" } = req.body;
    if (!input) {
      return res.status(400).json({
        error: {
          message: "Input parameter is required",
          type: "invalid_request_error"
        }
      });
    }
    const texts = Array.isArray(input) ? input : [input];
    const embeddings = [];
    for (let i = 0; i < texts.length; i++) {
      const embedding = await runtime.useModel(ModelType.TEXT_EMBEDDING, texts[i]);
      embeddings.push({
        object: "embedding",
        embedding,
        index: i
      });
    }
    res.json({
      object: "list",
      data: embeddings,
      model,
      usage: {
        prompt_tokens: texts.join(" ").length / 4,
        total_tokens: texts.join(" ").length / 4
      }
    });
  } catch (error) {
    logger.error("[AIGateway] Error creating embeddings:", error);
    res.status(500).json({
      error: {
        message: "Internal server error",
        type: "internal_error"
      }
    });
  }
}
async function processMessagesWithFiles(messages, runtime) {
  const processedMessages = [];
  for (const message of messages) {
    if (message.content && Array.isArray(message.content)) {
      let textContent = "";
      const attachments = [];
      for (const item of message.content) {
        if (item.type === "text") {
          textContent += item.text + " ";
        } else if (item.type === "image_url" && item.image_url?.url) {
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
        attachments
      });
    } else {
      processedMessages.push(message);
    }
  }
  return processedMessages;
}
async function processImageUrl(url, runtime) {
  try {
    if (url.startsWith("data:")) {
      const matches = url.match(/^data:([^;]+);base64,(.+)$/);
      if (!matches) return null;
      const [, mimeType, base64Data] = matches;
      const buffer = Buffer.from(base64Data, "base64");
      const mockFile = {
        originalname: `image.${mimeType.split("/")[1]}`,
        mimetype: mimeType,
        buffer,
        size: buffer.length
      };
      const result = await processUploadedFile(mockFile, runtime.agentId, "agents");
      return result;
    } else if (url.startsWith("http")) {
      logger.info(`[AIGateway] External image URL detected: ${url}`);
      return { url, type: "external_image" };
    }
    return null;
  } catch (error) {
    logger.error("[AIGateway] Error processing image URL:", error);
    return null;
  }
}
async function uploadFile(req, res, runtime) {
  try {
    const file = req.file;
    if (!file) {
      return res.status(400).json({
        error: {
          message: "No file provided",
          type: "invalid_request_error"
        }
      });
    }
    const result = await processUploadedFile(file, runtime.agentId, "agents");
    res.json({
      id: `file-${Date.now()}`,
      object: "file",
      bytes: file.size,
      created_at: Math.floor(Date.now() / 1e3),
      filename: result.filename,
      purpose: req.body.purpose || "assistants",
      status: "processed",
      url: result.url
    });
  } catch (error) {
    logger.error("[AIGateway] Error uploading file:", error);
    res.status(500).json({
      error: {
        message: "File upload failed",
        type: "internal_error"
      }
    });
  }
}
var openaiRoutes = [
  {
    type: "GET",
    path: "/v1/models",
    handler: listModels
  },
  {
    type: "POST",
    path: "/v1/chat/completions",
    handler: chatCompletions
  },
  {
    type: "POST",
    path: "/v1/embeddings",
    handler: createEmbeddings
  },
  {
    type: "POST",
    path: "/v1/files",
    handler: uploadFile
  }
];

// src/routes/socketio-streaming.ts
import {
  SOCKET_MESSAGE_TYPE,
  logger as logger2
} from "@elizaos/core";
async function initiateChatStream(req, res, runtime) {
  try {
    const { messages, model = "text-large", temperature, max_tokens, room_id } = req.body;
    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({
        error: {
          message: "Messages parameter is required and must be an array",
          type: "invalid_request_error"
        }
      });
    }
    if (!room_id) {
      return res.status(400).json({
        error: {
          message: "room_id parameter is required for Socket.IO streaming",
          type: "invalid_request_error"
        }
      });
    }
    const config = getConfig(runtime);
    const controlledModel = applyModelControls(model, config);
    const streamId = `stream-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const prompt = messages.map((msg) => `${msg.role}: ${msg.content}`).join("\n");
    setImmediate(() => {
      handleSocketIOStreaming(runtime, {
        streamId,
        roomId: room_id,
        prompt,
        model: controlledModel,
        temperature,
        maxTokens: max_tokens
      });
    });
    res.json({
      stream_id: streamId,
      room_id,
      model: controlledModel,
      status: "streaming_initiated",
      message: "Connect to Socket.IO to receive streaming messages"
    });
  } catch (error) {
    logger2.error("[AIGateway] Error initiating stream:", error);
    res.status(500).json({
      error: {
        message: "Failed to initiate streaming",
        type: "internal_error"
      }
    });
  }
}
async function handleSocketIOStreaming(runtime, params) {
  const { streamId, roomId, prompt, model, temperature, maxTokens } = params;
  try {
    logger2.info(`[AIGateway] Starting Socket.IO stream ${streamId} for room ${roomId}`);
    const serverInstance = runtime.serverInstance;
    if (!serverInstance?.io) {
      logger2.error("[AIGateway] Socket.IO server not available");
      return;
    }
    const io = serverInstance.io;
    io.to(roomId).emit("messageBroadcast", {
      type: SOCKET_MESSAGE_TYPE.THINKING,
      streamId,
      roomId,
      status: "processing",
      timestamp: Date.now()
    });
    const streamingProvider = new StreamingGatewayProvider(runtime);
    const streamGenerator = model.includes("small") || model.includes("fast") ? streamingProvider.generateTextSmallStream(runtime, { prompt, temperature, maxTokens }) : streamingProvider.generateTextLargeStream(runtime, { prompt, temperature, maxTokens });
    let accumulatedContent = "";
    let chunkIndex = 0;
    for await (const chunk of streamGenerator) {
      accumulatedContent += chunk;
      chunkIndex++;
      io.to(roomId).emit("messageBroadcast", {
        type: SOCKET_MESSAGE_TYPE.MESSAGE,
        streamId,
        roomId,
        content: {
          text: chunk,
          accumulated: accumulatedContent,
          chunk_index: chunkIndex,
          is_streaming: true
        },
        timestamp: Date.now()
      });
      await new Promise((resolve) => setTimeout(resolve, 10));
    }
    io.to(roomId).emit("messageBroadcast", {
      type: SOCKET_MESSAGE_TYPE.MESSAGE,
      streamId,
      roomId,
      content: {
        text: accumulatedContent,
        accumulated: accumulatedContent,
        is_streaming: false,
        complete: true
      },
      timestamp: Date.now(),
      finish_reason: "stop"
    });
    logger2.info(`[AIGateway] Completed Socket.IO stream ${streamId} with ${chunkIndex} chunks`);
  } catch (error) {
    logger2.error(`[AIGateway] Error in Socket.IO streaming ${streamId}:`, error);
    try {
      const serverInstance = runtime.serverInstance;
      if (serverInstance?.io) {
        serverInstance.io.to(roomId).emit("messageBroadcast", {
          type: SOCKET_MESSAGE_TYPE.MESSAGE,
          streamId,
          roomId,
          error: {
            message: "Streaming failed",
            type: "internal_error"
          },
          timestamp: Date.now()
        });
      }
    } catch (errorEmitError) {
      logger2.error("[AIGateway] Failed to emit error message:", errorEmitError);
    }
  }
}
async function getStreamStatus(req, res, runtime) {
  try {
    const { streamId } = req.params;
    if (!streamId) {
      return res.status(400).json({
        error: {
          message: "Stream ID is required",
          type: "invalid_request_error"
        }
      });
    }
    res.json({
      stream_id: streamId,
      status: "active",
      // Could be: active, completed, error
      timestamp: Date.now()
    });
  } catch (error) {
    logger2.error("[AIGateway] Error checking stream status:", error);
    res.status(500).json({
      error: {
        message: "Failed to check stream status",
        type: "internal_error"
      }
    });
  }
}
var socketIOStreamingRoutes = [
  {
    type: "POST",
    path: "/v1/chat/stream",
    handler: initiateChatStream
  },
  {
    type: "GET",
    path: "/v1/stream/:streamId/status",
    handler: getStreamStatus
  }
];

// src/actions/tool-calls.ts
import {
  logger as logger3
} from "@elizaos/core";
var toolCallsAction = {
  name: "TOOL_CALLS",
  similes: ["function_call", "tool_use", "function_execution"],
  description: "Execute tool/function calls using AI Gateway integration with ElizaOS actions",
  examples: [
    [
      {
        name: "User",
        content: {
          text: "What's the weather like in San Francisco?"
        }
      },
      {
        name: "Assistant",
        content: {
          text: "I'll check the weather in San Francisco for you.",
          action: "TOOL_CALLS"
        }
      }
    ]
  ],
  validate: async (runtime, message, state) => {
    const messageText = message.content?.text?.toLowerCase() || "";
    const toolPatterns = [
      /weather/i,
      /calculate/i,
      /search/i,
      /get.*information/i,
      /lookup/i,
      /find/i
    ];
    return toolPatterns.some((pattern) => pattern.test(messageText));
  },
  handler: async (runtime, message, state, options) => {
    try {
      logger3.debug("[AIGateway] Processing tool calls action");
      const toolCalls = extractToolCalls(message);
      if (!toolCalls || toolCalls.length === 0) {
        return {
          success: false,
          error: "No valid tool calls found in message"
        };
      }
      const results = [];
      for (const toolCall of toolCalls) {
        try {
          const result = await executeToolCall(runtime, toolCall, state);
          results.push({
            tool_call_id: toolCall.id,
            role: "tool",
            content: JSON.stringify(result)
          });
        } catch (error) {
          logger3.error(`[AIGateway] Error executing tool call ${toolCall.id}:`, error);
          results.push({
            tool_call_id: toolCall.id,
            role: "tool",
            content: JSON.stringify({
              error: error instanceof Error ? error.message : "Unknown error"
            })
          });
        }
      }
      return {
        success: true,
        text: "Tool calls executed successfully",
        data: {
          tool_results: results,
          tool_calls_count: toolCalls.length
        }
      };
    } catch (error) {
      logger3.error("[AIGateway] Error in tool calls handler:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error in tool calls"
      };
    }
  }
};
function extractToolCalls(message) {
  const toolCalls = [];
  if (message.content?.tool_calls) {
    return message.content.tool_calls;
  }
  const text = message.content?.text || "";
  const functionCallPattern = /(\w+)\((.*?)\)/g;
  let match;
  let callId = 1;
  while ((match = functionCallPattern.exec(text)) !== null) {
    const [, functionName, args] = match;
    toolCalls.push({
      id: `call_${callId++}`,
      type: "function",
      function: {
        name: functionName,
        arguments: args || "{}"
      }
    });
  }
  return toolCalls;
}
async function executeToolCall(runtime, toolCall, state) {
  const { function: func } = toolCall;
  const functionMappings = {
    "get_weather": "weather",
    "search_web": "web_search",
    "calculate": "calculation",
    "get_time": "time",
    "send_message": "message"
  };
  const actionName = functionMappings[func.name] || func.name;
  const action = runtime.actions.find(
    (a) => a.name.toLowerCase().includes(actionName.toLowerCase()) || a.similes?.some((s) => s.toLowerCase().includes(actionName.toLowerCase()))
  );
  if (!action) {
    throw new Error(`No action found for function: ${func.name}`);
  }
  let args = {};
  try {
    args = JSON.parse(func.arguments);
  } catch (error) {
    logger3.warn(`[AIGateway] Failed to parse tool call arguments: ${func.arguments}`);
  }
  const mockMessage = {
    id: `tool_call_${toolCall.id}`,
    userId: "system",
    agentId: runtime.agentId,
    roomId: state?.roomId || "tool_calls",
    content: {
      text: `Execute ${func.name} with arguments: ${JSON.stringify(args)}`,
      action: action.name,
      ...args
    },
    createdAt: Date.now(),
    embedding: []
  };
  const result = await action.handler(runtime, mockMessage, state);
  return result;
}

// src/index.ts
var plugin = {
  name: "aigateway",
  description: "Universal AI Gateway integration with Grok model protection and streaming support",
  routes: [...openaiRoutes, ...socketIOStreamingRoutes],
  actions: [toolCallsAction],
  async init(runtime) {
    logger4.info("[AIGateway] Plugin initializing...");
    const config = getConfig(runtime);
    logger4.info(`[AIGateway] Base URL: ${config.baseURL}`);
    logger4.info(`[AIGateway] API Key configured: ${config.apiKey}`);
    logger4.info(`[AIGateway] OIDC enabled: ${config.useOIDC}`);
    logger4.info(`[AIGateway] Grok models enabled: ${config.grokModelsEnabled}`);
    const provider = new GatewayProvider(runtime);
    const availableModelTypes = [
      ModelType2.SMALL,
      ModelType2.MEDIUM,
      ModelType2.LARGE,
      ModelType2.TEXT_SMALL,
      ModelType2.TEXT_LARGE,
      ModelType2.TEXT_EMBEDDING,
      ModelType2.TEXT_TOKENIZER_ENCODE,
      ModelType2.TEXT_TOKENIZER_DECODE,
      ModelType2.TEXT_REASONING_SMALL,
      ModelType2.TEXT_REASONING_LARGE,
      ModelType2.TEXT_COMPLETION,
      ModelType2.IMAGE,
      ModelType2.IMAGE_DESCRIPTION,
      ModelType2.TRANSCRIPTION,
      ModelType2.TEXT_TO_SPEECH,
      ModelType2.AUDIO,
      ModelType2.VIDEO,
      ModelType2.OBJECT_SMALL,
      ModelType2.OBJECT_LARGE
    ];
    logger4.info(`[AIGateway] Available model types: ${availableModelTypes.join(", ")}`);
    const modelHandlers = [
      { type: ModelType2.TEXT_SMALL, handler: provider.generateTextSmall.bind(provider) },
      { type: ModelType2.TEXT_LARGE, handler: provider.generateTextLarge.bind(provider) },
      { type: ModelType2.SMALL, handler: provider.generateTextSmall.bind(provider) },
      // Legacy
      { type: ModelType2.MEDIUM, handler: provider.generateTextLarge.bind(provider) },
      // Legacy
      { type: ModelType2.LARGE, handler: provider.generateTextLarge.bind(provider) },
      // Legacy
      { type: ModelType2.TEXT_EMBEDDING, handler: provider.generateEmbedding.bind(provider) },
      { type: ModelType2.OBJECT_SMALL, handler: provider.generateObjectSmall.bind(provider) },
      { type: ModelType2.OBJECT_LARGE, handler: provider.generateObjectLarge.bind(provider) },
      { type: ModelType2.IMAGE, handler: provider.generateImage.bind(provider) }
    ];
    try {
      for (const { type, handler } of modelHandlers) {
        runtime.registerModel(type, handler, "ai-gateway");
      }
      logger4.info(`[AIGateway] Authentication configured: ${config.useOIDC ? "OIDC" : "API Key"}`);
      logger4.info("[AIGateway] Plugin initialization complete");
      logger4.info("[AIGateway] \u2705 Features enabled:");
      logger4.info("[AIGateway]   \u2022 OpenAI-compatible REST API (/v1/*)");
      logger4.info("[AIGateway]   \u2022 Server-Sent Events streaming");
      logger4.info("[AIGateway]   \u2022 Socket.IO streaming integration");
      logger4.info("[AIGateway]   \u2022 Tool calls via ElizaOS Actions");
      logger4.info("[AIGateway]   \u2022 File upload support");
      logger4.info("[AIGateway]   \u2022 Dynamic model discovery");
      if (!config.grokModelsEnabled) {
        logger4.info("[AIGateway] \u{1F6AB} Grok models are blocked in support of ElizaOS");
        logger4.info("[AIGateway] \u{1F504} Alternative models will be used automatically");
      }
    } catch (error) {
      logger4.error("[AIGateway] Error registering model handlers:", error instanceof Error ? error.message : String(error));
      throw error;
    }
  }
};
var index_default = plugin;
export {
  index_default as default
};
