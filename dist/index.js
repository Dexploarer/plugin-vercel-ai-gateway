import {
  StreamingGatewayProvider
} from "./chunk-CWLVCKS6.js";
import {
  GatewayProvider,
  applyModelControls,
  areCentralRoutesEnabled,
  getCentralRateLimitPerMin,
  getConfig,
  getInternalToken
} from "./chunk-CERAHGUE.js";

// src/index.ts
import {
  ModelType as ModelType2,
  logger as logger5
} from "@elizaos/core";

// src/routes/openai-compat.ts
import { ModelType, logger } from "@elizaos/core";
async function listModels(req, res, runtime) {
  try {
    const modelList = [];
    const timestamp = Math.floor(Date.now() / 1e3);
    const models = runtime.models;
    if (models && models instanceof Map) {
      for (const [modelType, handlers] of models.entries()) {
        if (handlers && handlers.length > 0) {
          for (const handler2 of handlers) {
            modelList.push({
              id: `${handler2.provider}-${modelType}`.toLowerCase(),
              object: "model",
              created: timestamp,
              owned_by: handler2.provider || "unknown",
              permission: [],
              root: modelType,
              parent: null,
              elizaos_type: modelType,
              provider: handler2.provider,
              priority: handler2.priority || 0
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
    logger.error(
      "[AIGateway] Error listing models:",
      error instanceof Error ? error.message : String(error)
    );
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
    const {
      messages,
      model = "text-large",
      stream = false,
      temperature,
      max_tokens
    } = req.body;
    if (!messages || !Array.isArray(messages)) {
      res.status(400).json({
        error: {
          message: "Messages parameter is required and must be an array",
          type: "invalid_request_error"
        }
      });
      return;
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
        Connection: "keep-alive",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Cache-Control"
      });
      const streamingProvider = new StreamingGatewayProvider(runtime);
      const chatId = `chatcmpl-${Date.now()}`;
      const created = Math.floor(Date.now() / 1e3);
      try {
        const streamGenerator = controlledModel.includes("small") || controlledModel.includes("fast") ? streamingProvider.generateTextSmallStream(runtime, {
          prompt,
          temperature,
          maxTokens: max_tokens
        }) : streamingProvider.generateTextLargeStream(runtime, {
          prompt,
          temperature,
          maxTokens: max_tokens
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
                  content: chunk
                },
                finish_reason: null
              }
            ]
          };
          res.write(`data: ${JSON.stringify(streamChunk)}

`);
        }
        const finalChunk = {
          id: chatId,
          object: "chat.completion.chunk",
          created,
          model: controlledModel,
          choices: [
            {
              index: 0,
              delta: {},
              finish_reason: "stop"
            }
          ]
        };
        res.write(`data: ${JSON.stringify(finalChunk)}

`);
        res.write("data: [DONE]\n\n");
        res.end();
      } catch (streamError) {
        logger.error(
          "[AIGateway] Error in streaming:",
          streamError instanceof Error ? streamError.message : String(streamError)
        );
        res.write(
          `data: {"error": {"message": "Streaming failed", "type": "internal_error"}}

`
        );
        res.end();
      }
    } else {
      res.json({
        id: `chatcmpl-${Date.now()}`,
        object: "chat.completion",
        created: Math.floor(Date.now() / 1e3),
        model: controlledModel,
        choices: [
          {
            index: 0,
            message: {
              role: "assistant",
              content: result
            },
            finish_reason: "stop"
          }
        ],
        usage: {
          prompt_tokens: prompt.length / 4,
          completion_tokens: result.length / 4,
          total_tokens: (prompt.length + result.length) / 4
        }
      });
    }
  } catch (error) {
    logger.error(
      "[AIGateway] Error in chat completions:",
      error instanceof Error ? error.message : String(error)
    );
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
      res.status(400).json({
        error: {
          message: "Input parameter is required",
          type: "invalid_request_error"
        }
      });
      return;
    }
    const texts = Array.isArray(input) ? input : [input];
    const embeddings = [];
    for (let i = 0; i < texts.length; i++) {
      const embedding = await runtime.useModel(
        ModelType.TEXT_EMBEDDING,
        texts[i]
      );
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
    logger.error(
      "[AIGateway] Error creating embeddings:",
      error instanceof Error ? error.message : String(error)
    );
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
      const result = {
        filename: mockFile.originalname,
        url: `data:${mimeType};base64,${base64Data}`,
        size: buffer.length,
        type: mimeType
      };
      return result;
    } else if (url.startsWith("http")) {
      logger.info(`[AIGateway] External image URL detected: ${url}`);
      return { url, type: "external_image" };
    }
    return null;
  } catch (error) {
    logger.error(
      "[AIGateway] Error processing image URL:",
      error instanceof Error ? error.message : String(error)
    );
    return null;
  }
}
async function uploadFile(req, res, runtime) {
  try {
    const file = req.file;
    if (!file) {
      res.status(400).json({
        error: {
          message: "No file provided",
          type: "invalid_request_error"
        }
      });
      return;
    }
    const result = {
      filename: file.originalname,
      url: `/uploads/${Date.now()}-${file.originalname}`,
      size: file.size,
      type: file.mimetype
    };
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
    logger.error(
      "[AIGateway] Error uploading file:",
      error instanceof Error ? error.message : String(error)
    );
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
  // Alias for simple send semantics
  {
    type: "POST",
    path: "/v1/send",
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
    const {
      messages,
      model = "text-large",
      temperature,
      max_tokens,
      room_id
    } = req.body;
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
    logger2.info(
      `[AIGateway] Starting Socket.IO stream ${streamId} for room ${roomId}`
    );
    const serverInstance = runtime.serverInstance;
    if (!serverInstance?.io) {
      logger2.error("[AIGateway] Socket.IO server not available");
      return;
    }
    const io = serverInstance.io;
    const thinkingPayload = {
      type: SOCKET_MESSAGE_TYPE.THINKING,
      streamId,
      roomId,
      status: "processing",
      timestamp: Date.now()
    };
    io.to(roomId).emit("messageBroadcast", thinkingPayload);
    io.to(roomId).emit("message", thinkingPayload);
    const streamingProvider = new StreamingGatewayProvider(runtime);
    const streamGenerator = model.includes("small") || model.includes("fast") ? streamingProvider.generateTextSmallStream(runtime, {
      prompt,
      temperature,
      maxTokens
    }) : streamingProvider.generateTextLargeStream(runtime, {
      prompt,
      temperature,
      maxTokens
    });
    let accumulatedContent = "";
    let chunkIndex = 0;
    for await (const chunk of streamGenerator) {
      accumulatedContent += chunk;
      chunkIndex++;
      const chunkPayload = {
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
      };
      io.to(roomId).emit("messageBroadcast", chunkPayload);
      io.to(roomId).emit("message", chunkPayload);
      await new Promise((resolve) => setTimeout(resolve, 10));
    }
    const completePayload = {
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
    };
    io.to(roomId).emit("messageBroadcast", completePayload);
    io.to(roomId).emit("message", completePayload);
    logger2.info(
      `[AIGateway] Completed Socket.IO stream ${streamId} with ${chunkIndex} chunks`
    );
  } catch (error) {
    logger2.error(
      `[AIGateway] Error in Socket.IO streaming ${streamId}:`,
      error
    );
    try {
      const serverInstance = runtime.serverInstance;
      if (serverInstance?.io) {
        const errorPayload = {
          type: SOCKET_MESSAGE_TYPE.MESSAGE,
          streamId,
          roomId,
          error: {
            message: "Streaming failed",
            type: "internal_error"
          },
          timestamp: Date.now()
        };
        serverInstance.io.to(roomId).emit("messageBroadcast", errorPayload);
        serverInstance.io.to(roomId).emit("message", errorPayload);
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

// src/routes/central-compat.ts
import { logger as logger3 } from "@elizaos/core";
import { randomUUID } from "crypto";
import { z } from "zod";
function authorizeInternal(req, runtime) {
  const required = getInternalToken(runtime);
  if (!required) return { ok: true };
  const header = req.headers["authorization"];
  const token = typeof header === "string" && header.startsWith("Bearer ") ? header.slice(7) : void 0;
  if (!token || token !== required) {
    return { ok: false, message: "Forbidden: invalid token" };
  }
  return { ok: true };
}
async function ensureAgentParticipantInternal(runtime, channelId) {
  const serverInstance = runtime.serverInstance;
  const agentId = runtime.agentId;
  if (!serverInstance) throw new Error("serverInstance unavailable");
  const details = await serverInstance.getChannelDetails?.(channelId);
  if (!details) throw new Error("Channel not found");
  const participants = await serverInstance.getChannelParticipants?.(channelId);
  if (!participants?.includes(agentId)) {
    await serverInstance.addParticipantsToChannel?.(channelId, [agentId]);
    logger3.info(`[CentralCompat] Added agent ${agentId} to channel ${channelId}`);
  }
  return { channelId, agentId };
}
async function ensureAgentParticipant(req, res, runtime) {
  const reqId = randomUUID();
  res.setHeader("X-Request-Id", reqId);
  try {
    const auth = authorizeInternal(req, runtime);
    if (!auth.ok) return void res.status(403).json({ success: false, reqId, error: auth.message });
    const { channelId } = req.params;
    const data = await ensureAgentParticipantInternal(runtime, channelId);
    logger3.info(`[CentralCompat][${reqId}] ensured agent in channel ${channelId}`);
    res.json({ success: true, reqId, data });
  } catch (err) {
    logger3.error(`[CentralCompat][${reqId}] ensure-agent failed: ${err?.message || String(err)}`);
    res.status(500).json({ success: false, reqId, error: err?.message || String(err) });
  }
}
var centralCompatRoutes = [
  {
    type: "POST",
    path: "/v1/central/channels/:channelId/ensure-agent",
    handler: ensureAgentParticipant
  },
  {
    type: "POST",
    path: "/v1/central/channels/:channelId/reply",
    handler: async (req, res, runtime) => {
      try {
        const reqId = randomUUID();
        res.setHeader("X-Request-Id", reqId);
        if (!areCentralRoutesEnabled(runtime)) {
          return void res.status(404).json({ success: false, reqId, error: "Not found" });
        }
        const auth = authorizeInternal(req, runtime);
        if (!auth.ok) return void res.status(403).json({ success: false, reqId, error: auth.message });
        const paramsSchema = z.object({ channelId: z.string().min(1) });
        const bodySchema = z.object({
          prompt: z.string().min(1),
          modelSize: z.enum(["small", "large"]).default("small")
        });
        const { channelId } = paramsSchema.parse(req.params);
        const { prompt, modelSize } = bodySchema.parse(req.body ?? {});
        __setLimiterMaxFromRuntime(runtime);
        if (!rateLimiter.consume(keyFor(req, runtime))) {
          return void res.status(429).json({ success: false, reqId, error: "Rate limit exceeded" });
        }
        await ensureAgentParticipantInternal(runtime, channelId);
        const { GatewayProvider: GatewayProvider2 } = await import("./gateway-provider-ABKW5JID.js");
        const provider = new GatewayProvider2(runtime);
        const text = modelSize === "large" ? await provider.generateTextLarge({ prompt, runtime }) : await provider.generateTextSmall({ prompt, runtime });
        const base = `${req.protocol}://${req.get("host")}`;
        const DEFAULT_SERVER_ID = "00000000-0000-0000-0000-000000000000";
        const payload = {
          author_id: runtime.agentId,
          content: text,
          server_id: DEFAULT_SERVER_ID,
          source_type: "gateway_plugin",
          metadata: { user_display_name: runtime.character?.name || "Agent" }
        };
        const postUrl = `${base}/api/messaging/central-channels/${encodeURIComponent(channelId)}/messages`;
        const resp = await fetch(postUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        });
        if (!resp.ok) {
          const t = await resp.text();
          throw new Error(`Central message post failed: HTTP ${resp.status} ${t}`);
        }
        const data = await resp.json();
        logger3.info(`[CentralCompat][${reqId}] posted reply to channel ${channelId}`);
        res.json({ success: true, reqId, data: { message: text, central: data?.data } });
      } catch (err) {
        const reqId = String(res.getHeader("X-Request-Id") || "-");
        logger3.error(`[CentralCompat][${reqId}] reply failed: ${err?.message || String(err)}`);
        res.status(500).json({ success: false, reqId, error: err?.message || String(err) });
      }
    }
  },
  {
    type: "POST",
    path: "/v1/central/channels/:channelId/reply/stream",
    handler: async (req, res, runtime) => {
      const reqId = randomUUID();
      res.setHeader("X-Request-Id", reqId);
      try {
        if (!areCentralRoutesEnabled(runtime)) {
          return void res.status(404).json({ success: false, reqId, error: "Not found" });
        }
        const auth = authorizeInternal(req, runtime);
        if (!auth.ok) return void res.status(403).json({ success: false, reqId, error: auth.message });
        const paramsSchema = z.object({ channelId: z.string().min(1) });
        const bodySchema = z.object({
          prompt: z.string().min(1),
          modelSize: z.enum(["small", "large"]).default("small"),
          maxTokens: z.number().int().positive().max(8192).optional()
        });
        const { channelId } = paramsSchema.parse(req.params);
        const { prompt, modelSize, maxTokens } = bodySchema.parse(req.body ?? {});
        __setLimiterMaxFromRuntime(runtime);
        if (!rateLimiter.consume(keyFor(req, runtime))) {
          return void res.status(429).json({ success: false, reqId, error: "Rate limit exceeded" });
        }
        await ensureAgentParticipantInternal(runtime, channelId);
        res.writeHead(200, {
          "Content-Type": "text/event-stream; charset=utf-8",
          "Cache-Control": "no-cache, no-transform",
          Connection: "keep-alive",
          "X-Request-Id": String(reqId)
        });
        const { StreamingGatewayProvider: StreamingGatewayProvider2 } = await import("./streaming-gateway-provider-34AIFXZ3.js");
        const streamer = new StreamingGatewayProvider2(runtime);
        const gen = modelSize === "large" ? streamer.generateTextLargeStream(runtime, { prompt, maxTokens }) : streamer.generateTextSmallStream(runtime, { prompt, maxTokens });
        let accumulated = "";
        for await (const chunk of gen) {
          accumulated += chunk;
          res.write(`event: token
`);
          res.write(`data: ${JSON.stringify({ reqId, chunk })}

`);
        }
        const base = `${req.protocol}://${req.get("host")}`;
        const DEFAULT_SERVER_ID = "00000000-0000-0000-0000-000000000000";
        const payload = {
          author_id: runtime.agentId,
          content: accumulated,
          server_id: DEFAULT_SERVER_ID,
          source_type: "gateway_plugin_stream",
          metadata: { user_display_name: runtime.character?.name || "Agent" }
        };
        const postUrl = `${base}/api/messaging/central-channels/${encodeURIComponent(channelId)}/messages`;
        const resp = await fetch(postUrl, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
        if (!resp.ok) {
          const t = await resp.text();
          throw new Error(`Central message post failed: HTTP ${resp.status} ${t}`);
        }
        const data = await resp.json();
        res.write(`event: complete
`);
        res.write(`data: ${JSON.stringify({ reqId, length: accumulated.length, central: data?.data })}

`);
        res.end();
      } catch (err) {
        logger3.error(`[CentralCompat][${reqId}] stream reply failed: ${err?.message || String(err)}`);
        try {
          res.write(`event: error
`);
          res.write(`data: ${JSON.stringify({ reqId, error: err?.message || String(err) })}

`);
        } catch {
        }
        res.end();
      }
    }
  }
];
var MinuteRateLimiter = class {
  constructor(max) {
    this.buckets = /* @__PURE__ */ new Map();
    this.max = max;
  }
  consume(key) {
    const now = Date.now();
    const minute = 60 * 1e3;
    const b = this.buckets.get(key);
    if (!b || now >= b.resetAt) {
      this.buckets.set(key, { count: 1, resetAt: now + minute });
      return true;
    }
    if (b.count >= this.max) return false;
    b.count += 1;
    return true;
  }
};
function keyFor(req, runtime) {
  const ip = req.headers["x-forwarded-for"]?.split(",")[0]?.trim() || req.ip || "unknown";
  return `${runtime.agentId}:${ip}`;
}
var rateLimiter = new MinuteRateLimiter(60);
function __setLimiterMaxFromRuntime(runtime) {
  rateLimiter.max = getCentralRateLimitPerMin(runtime);
}

// src/routes/health.ts
import { logger as logger4 } from "@elizaos/core";
import { randomUUID as randomUUID2 } from "crypto";

// src/utils/client.ts
function createGatewayClient(env = {}) {
  const apiKey = env.apiKey || process.env.AI_GATEWAY_API_KEY || process.env.AIGATEWAY_API_KEY;
  const oidcToken = env.oidcToken || process.env.VERCEL_OIDC_TOKEN;
  const baseURL = env.baseURL || process.env.AI_GATEWAY_BASE_URL || process.env.AIGATEWAY_BASE_URL || "https://ai-gateway.vercel.sh/v1";
  const authHeader = apiKey ? `Bearer ${apiKey}` : oidcToken ? `Bearer ${oidcToken}` : void 0;
  if (!authHeader) throw new Error("AI_GATEWAY_API_KEY not set or VERCEL_OIDC_TOKEN not set");
  async function embeddings(args) {
    const body = {
      model: args.model || process.env.ELIZA_EMBEDDINGS_MODEL || "text-embedding-3-small",
      input: args.input
    };
    const headers = {
      Authorization: authHeader,
      "Content-Type": "application/json"
    };
    const resp = await fetch(`${baseURL}/embeddings`, {
      method: "POST",
      headers,
      body: JSON.stringify(body)
    });
    const text = await resp.text();
    if (!resp.ok) throw new Error(`Embeddings HTTP ${resp.status}: ${text}`);
    const json = JSON.parse(text);
    const vectors = (json?.data || []).map((d) => d.embedding);
    const dim = vectors[0]?.length || 0;
    return { vectors, dim };
  }
  async function chat(args) {
    const body = {
      model: args.model || process.env.ELIZA_CHAT_MODEL || "gpt-4o-mini",
      messages: args.messages,
      max_tokens: args.maxTokens,
      temperature: args.temperature ?? 0.7
    };
    const headers = {
      Authorization: authHeader,
      "Content-Type": "application/json"
    };
    const resp = await fetch(`${baseURL}/chat/completions`, {
      method: "POST",
      headers,
      body: JSON.stringify(body)
    });
    const text = await resp.text();
    if (!resp.ok) throw new Error(`Chat HTTP ${resp.status}: ${text}`);
    const json = JSON.parse(text);
    const out = json?.choices?.[0]?.message?.content || "";
    return { text: out };
  }
  return { embeddings, chat };
}

// src/routes/health.ts
function authorize(req, runtime) {
  const required = getInternalToken(runtime);
  if (!required) return { ok: true };
  const header = req.headers["authorization"];
  const token = typeof header === "string" && header.startsWith("Bearer ") ? header.slice(7) : void 0;
  if (!token || token !== required) return { ok: false, message: "Forbidden" };
  return { ok: true };
}
async function handler(req, res, runtime) {
  const reqId = randomUUID2();
  res.setHeader("X-Request-Id", reqId);
  try {
    const auth = authorize(req, runtime);
    if (!auth.ok) return void res.status(403).json({ ok: false, reqId, error: auth.message });
    const results = { ok: true, reqId, timestamp: (/* @__PURE__ */ new Date()).toISOString() };
    try {
      const gw = createGatewayClient();
      const chatModel = process.env.ELIZA_CHAT_MODEL || "gpt-4o-mini";
      const out = await gw.chat({ model: chatModel, messages: [{ role: "user", content: "ping" }] });
      results.gateway = { chat: { ok: !!out.text, model: chatModel } };
      if (!out.text) results.ok = false;
    } catch (e) {
      results.gateway = results.gateway || {};
      results.gateway.chat = { ok: false, error: e?.message || String(e) };
      results.ok = false;
    }
    if (process.env.EMBEDDINGS_DISABLED !== "1") {
      try {
        const gw = createGatewayClient();
        const embModel = process.env.ELIZA_EMBEDDINGS_MODEL || "text-embedding-3-small";
        const { dim } = await gw.embeddings({ input: "healthcheck", model: embModel });
        results.gateway.embeddings = { ok: !!dim, dim, model: embModel };
        if (!dim) results.ok = false;
      } catch (e) {
        results.gateway = results.gateway || {};
        results.gateway.embeddings = { ok: false, error: e?.message || String(e) };
        results.ok = false;
      }
    } else {
      results.gateway = results.gateway || {};
      results.gateway.embeddings = { ok: true, note: "disabled" };
    }
    try {
      const serverInstance = runtime.serverInstance;
      if (serverInstance?.getServers) {
        const servers = await serverInstance.getServers();
        const count = Array.isArray(servers) ? servers.length : 0;
        const hasNonZero = Array.isArray(servers) && servers.some((s) => s?.id && s.id !== "00000000-0000-0000-0000-000000000000");
        results.db = { ok: true, serversCount: count, hasNonZeroServer: !!hasNonZero };
      } else {
        results.db = { ok: true, note: "no serverInstance" };
      }
    } catch (e) {
      results.db = { ok: false, error: e?.message || String(e) };
      results.ok = false;
    }
    res.json(results);
  } catch (e) {
    logger4.error(`[Health] failed: ${e?.message || String(e)}`);
    res.status(500).json({ ok: false, reqId, error: e?.message || String(e) });
  }
}
var healthRoutes = [
  { type: "GET", path: "/v1/health", handler }
];

// src/index.ts
var plugin = {
  name: "aigateway",
  description: "Universal AI Gateway integration plugin for elizaOS with Grok model protection - Access 100+ AI models through unified gateways",
  actions: [
    /*toolCallsAction*/
  ],
  evaluators: [],
  providers: [],
  routes: [
    ...openaiRoutes,
    ...socketIOStreamingRoutes,
    ...centralCompatRoutes,
    ...healthRoutes
  ],
  models: {
    [ModelType2.TEXT_SMALL]: async (runtime, params) => {
      try {
        const provider = new GatewayProvider(runtime);
        return provider.generateTextSmall(params);
      } catch (error) {
        logger5.error(`[AIGateway] TEXT_SMALL handler error: ${error.message}`);
        throw error;
      }
    },
    [ModelType2.TEXT_LARGE]: async (runtime, params) => {
      try {
        const provider = new GatewayProvider(runtime);
        return provider.generateTextLarge(params);
      } catch (error) {
        logger5.error(`[AIGateway] TEXT_LARGE handler error: ${error.message}`);
        throw error;
      }
    },
    [ModelType2.TEXT_EMBEDDING]: async (runtime, params) => {
      try {
        const provider = new GatewayProvider(runtime);
        return provider.generateEmbedding(params);
      } catch (error) {
        logger5.error(
          `[AIGateway] TEXT_EMBEDDING handler error: ${error.message}`
        );
        throw error;
      }
    },
    [ModelType2.IMAGE]: async (runtime, params) => {
      try {
        const provider = new GatewayProvider(runtime);
        return provider.generateImage(params);
      } catch (error) {
        logger5.error(`[AIGateway] IMAGE handler error: ${error.message}`);
        throw error;
      }
    },
    [ModelType2.OBJECT_SMALL]: async (runtime, params) => {
      try {
        const provider = new GatewayProvider(runtime);
        return provider.generateObjectSmall(params);
      } catch (error) {
        logger5.error(
          `[AIGateway] OBJECT_SMALL handler error: ${error.message}`
        );
        throw error;
      }
    },
    [ModelType2.OBJECT_LARGE]: async (runtime, params) => {
      try {
        const provider = new GatewayProvider(runtime);
        return provider.generateObjectLarge(params);
      } catch (error) {
        logger5.error(
          `[AIGateway] OBJECT_LARGE handler error: ${error.message}`
        );
        throw error;
      }
    }
  },
  // Accept both usages at runtime: init(runtime) or init(config, runtime)
  // Keep implementation simple and type-safe: no return value expected
  init: async (...args) => {
    const runtime = args.length === 1 ? args[0] : args[1];
    logger5.info("[AIGateway] Plugin initialized with models export structure");
    void runtime;
  }
};
var index_default = plugin;
export {
  createGatewayClient,
  index_default as default
};
