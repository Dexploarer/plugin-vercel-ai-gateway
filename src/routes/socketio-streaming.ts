import {
  IAgentRuntime,
  Route,
  SOCKET_MESSAGE_TYPE,
  logger,
} from "@elizaos/core";
import type { Request, Response } from "express";
import { StreamingGatewayProvider } from "../providers/streaming-gateway-provider";
import { getConfig } from "../utils/config";
import { applyModelControls } from "../utils/model-controls";

/**
 * Socket.IO streaming routes for ElizaOS native integration
 * Provides WebSocket-based streaming using ElizaOS patterns
 */

/**
 * POST /v1/chat/stream - WebSocket streaming endpoint
 * Returns connection details for Socket.IO streaming
 */
async function initiateChatStream(
  req: Request,
  res: Response,
  runtime: IAgentRuntime,
) {
  try {
    const {
      messages,
      model = "text-large",
      temperature,
      max_tokens,
      room_id,
    } = req.body;

    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({
        error: {
          message: "Messages parameter is required and must be an array",
          type: "invalid_request_error",
        },
      });
    }

    if (!room_id) {
      return res.status(400).json({
        error: {
          message: "room_id parameter is required for Socket.IO streaming",
          type: "invalid_request_error",
        },
      });
    }

    // Apply model controls (Grok blocking)
    const config = getConfig(runtime);
    const controlledModel = applyModelControls(model, config);

    // Generate unique stream ID
    const streamId = `stream-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    // Process messages
    const prompt = messages
      .map((msg: any) => `${msg.role}: ${msg.content}`)
      .join("\n");

    // Start streaming in the background
    setImmediate(() => {
      handleSocketIOStreaming(runtime, {
        streamId,
        roomId: room_id,
        prompt,
        model: controlledModel,
        temperature,
        maxTokens: max_tokens,
      });
    });

    // Return connection details
    res.json({
      stream_id: streamId,
      room_id: room_id,
      model: controlledModel,
      status: "streaming_initiated",
      message: "Connect to Socket.IO to receive streaming messages",
    });
  } catch (error) {
    logger.error("[AIGateway] Error initiating stream:", error);
    res.status(500).json({
      error: {
        message: "Failed to initiate streaming",
        type: "internal_error",
      },
    });
  }
}

/**
 * Handle Socket.IO streaming using ElizaOS patterns
 */
async function handleSocketIOStreaming(
  runtime: IAgentRuntime,
  params: {
    streamId: string;
    roomId: string;
    prompt: string;
    model: string;
    temperature?: number;
    maxTokens?: number;
  },
) {
  const { streamId, roomId, prompt, model, temperature, maxTokens } = params;

  try {
    logger.info(
      `[AIGateway] Starting Socket.IO stream ${streamId} for room ${roomId}`,
    );

    // Get server instance to access Socket.IO
    const serverInstance = (runtime as any).serverInstance;
    if (!serverInstance?.io) {
      logger.error("[AIGateway] Socket.IO server not available");
      return;
    }

    const io = serverInstance.io;

    // Send initial thinking message
    const thinkingPayload = {
      type: SOCKET_MESSAGE_TYPE.THINKING,
      streamId,
      roomId,
      status: "processing",
      timestamp: Date.now(),
    };
    // Emit on both legacy and standard channels for compatibility
    io.to(roomId).emit("messageBroadcast", thinkingPayload);
    io.to(roomId).emit("message", thinkingPayload);

    const streamingProvider = new StreamingGatewayProvider(runtime);

    // Determine which stream generator to use
    const streamGenerator =
      model.includes("small") || model.includes("fast")
        ? streamingProvider.generateTextSmallStream(runtime, {
            prompt,
            temperature,
            maxTokens,
          })
        : streamingProvider.generateTextLargeStream(runtime, {
            prompt,
            temperature,
            maxTokens,
          });

    let accumulatedContent = "";
    let chunkIndex = 0;

    // Stream tokens
    for await (const chunk of streamGenerator) {
      accumulatedContent += chunk;
      chunkIndex++;

      // Emit streaming chunk
      const chunkPayload = {
        type: SOCKET_MESSAGE_TYPE.MESSAGE,
        streamId,
        roomId,
        content: {
          text: chunk,
          accumulated: accumulatedContent,
          chunk_index: chunkIndex,
          is_streaming: true,
        },
        timestamp: Date.now(),
      };
      io.to(roomId).emit("messageBroadcast", chunkPayload);
      io.to(roomId).emit("message", chunkPayload);

      // Small delay to prevent overwhelming the client
      await new Promise((resolve) => setTimeout(resolve, 10));
    }

    // Send completion message
    const completePayload = {
      type: SOCKET_MESSAGE_TYPE.MESSAGE,
      streamId,
      roomId,
      content: {
        text: accumulatedContent,
        accumulated: accumulatedContent,
        is_streaming: false,
        complete: true,
      },
      timestamp: Date.now(),
      finish_reason: "stop",
    };
    io.to(roomId).emit("messageBroadcast", completePayload);
    io.to(roomId).emit("message", completePayload);

    logger.info(
      `[AIGateway] Completed Socket.IO stream ${streamId} with ${chunkIndex} chunks`,
    );
  } catch (error) {
    logger.error(
      `[AIGateway] Error in Socket.IO streaming ${streamId}:`,
      error,
    );

    // Send error message if possible
    try {
      const serverInstance = (runtime as any).serverInstance;
      if (serverInstance?.io) {
        const errorPayload = {
          type: SOCKET_MESSAGE_TYPE.MESSAGE,
          streamId,
          roomId,
          error: {
            message: "Streaming failed",
            type: "internal_error",
          },
          timestamp: Date.now(),
        };
        serverInstance.io.to(roomId).emit("messageBroadcast", errorPayload);
        serverInstance.io.to(roomId).emit("message", errorPayload);
      }
    } catch (errorEmitError) {
      logger.error("[AIGateway] Failed to emit error message:", errorEmitError);
    }
  }
}

/**
 * GET /v1/stream/:streamId/status - Check streaming status
 */
async function getStreamStatus(
  req: Request,
  res: Response,
  runtime: IAgentRuntime,
) {
  try {
    const { streamId } = req.params;

    if (!streamId) {
      return res.status(400).json({
        error: {
          message: "Stream ID is required",
          type: "invalid_request_error",
        },
      });
    }

    // In a production implementation, you'd track stream status
    // For now, return a simple response
    res.json({
      stream_id: streamId,
      status: "active", // Could be: active, completed, error
      timestamp: Date.now(),
    });
  } catch (error) {
    logger.error("[AIGateway] Error checking stream status:", error);
    res.status(500).json({
      error: {
        message: "Failed to check stream status",
        type: "internal_error",
      },
    });
  }
}

/**
 * Socket.IO streaming routes for the plugin
 */
export const socketIOStreamingRoutes: Route[] = [
  {
    type: "POST",
    path: "/v1/chat/stream",
    handler: initiateChatStream,
  },
  {
    type: "GET",
    path: "/v1/stream/:streamId/status",
    handler: getStreamStatus,
  },
];
