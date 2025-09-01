import { IAgentRuntime, Route, logger } from "@elizaos/core";
import type { Request, Response } from "express";
import { randomUUID } from "crypto";
import { z } from "zod";
import { areCentralRoutesEnabled, getCentralRateLimitPerMin, getInternalToken } from "../utils/config";
import { __setLimiterMaxFromRuntime } from "./central-compat";

// Internal auth guard for central routes
function authorizeInternal(req: Request, runtime: IAgentRuntime): { ok: boolean; message?: string } {
  const required = getInternalToken(runtime);
  if (!required) return { ok: true };
  const header = req.headers["authorization"]; // Expect Bearer <token>
  const token = typeof header === "string" && header.startsWith("Bearer ") ? header.slice(7) : undefined;
  if (!token || token !== required) {
    return { ok: false, message: "Forbidden: invalid token" };
  }
  return { ok: true };
}

async function ensureAgentParticipantInternal(runtime: IAgentRuntime, channelId: string) {
  const serverInstance = (runtime as any).serverInstance;
  const agentId = runtime.agentId as string;
  if (!serverInstance) throw new Error("serverInstance unavailable");
  const details = await serverInstance.getChannelDetails?.(channelId);
  if (!details) throw new Error("Channel not found");
  const participants: string[] = await serverInstance.getChannelParticipants?.(channelId);
  if (!participants?.includes(agentId)) {
    await serverInstance.addParticipantsToChannel?.(channelId, [agentId]);
    logger.info(`[CentralCompat] Added agent ${agentId} to channel ${channelId}`);
  }
  return { channelId, agentId };
}

// POST /v1/central/channels/:channelId/ensure-agent
// Ensures the current agent is a participant of the given central channel.
async function ensureAgentParticipant(req: Request, res: Response, runtime: IAgentRuntime): Promise<void> {
  const reqId = randomUUID();
  res.setHeader("X-Request-Id", reqId);
  try {
    const auth = authorizeInternal(req, runtime);
    if (!auth.ok) return void res.status(403).json({ success: false, reqId, error: auth.message });
    const { channelId } = req.params as { channelId: string };
    const data = await ensureAgentParticipantInternal(runtime, channelId);
    logger.info(`[CentralCompat][${reqId}] ensured agent in channel ${channelId}`);
    res.json({ success: true, reqId, data });
  } catch (err: any) {
    logger.error(`[CentralCompat][${reqId}] ensure-agent failed: ${err?.message || String(err)}`);
    res.status(500).json({ success: false, reqId, error: err?.message || String(err) });
  }
}

export const centralCompatRoutes: Route[] = [
  {
    type: "POST",
    path: "/v1/central/channels/:channelId/ensure-agent",
    handler: ensureAgentParticipant,
  },
  {
    type: "POST",
    path: "/v1/central/channels/:channelId/reply",
    handler: async (req: Request, res: Response, runtime: IAgentRuntime) => {
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
          modelSize: z.enum(["small", "large"]).default("small"),
        });
        const { channelId } = paramsSchema.parse(req.params);
        const { prompt, modelSize } = bodySchema.parse(req.body ?? {});

        // Simple rate limiting
        __setLimiterMaxFromRuntime(runtime);
        if (!rateLimiter.consume(keyFor(req, runtime))) {
          return void res.status(429).json({ success: false, reqId, error: "Rate limit exceeded" });
        }

        // Ensure agent is a participant
        await ensureAgentParticipantInternal(runtime, channelId);

        // Generate a reply via Gateway
        const { GatewayProvider } = await import("../providers/gateway-provider");
        const provider = new GatewayProvider(runtime);
        const text = modelSize === "large"
          ? await provider.generateTextLarge({ prompt, runtime } as any)
          : await provider.generateTextSmall({ prompt, runtime } as any);

        // Post assistant message to central channel via same server
        const base = `${req.protocol}://${req.get("host")}`;
        const DEFAULT_SERVER_ID = "00000000-0000-0000-0000-000000000000";
        const payload = {
          author_id: runtime.agentId,
          content: text,
          server_id: DEFAULT_SERVER_ID,
          source_type: "gateway_plugin",
          metadata: { user_display_name: runtime.character?.name || "Agent" },
        };
        const postUrl = `${base}/api/messaging/central-channels/${encodeURIComponent(channelId)}/messages`;
        const resp = await fetch(postUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (!resp.ok) {
          const t = await resp.text();
          throw new Error(`Central message post failed: HTTP ${resp.status} ${t}`);
        }
        const data = await resp.json();
        logger.info(`[CentralCompat][${reqId}] posted reply to channel ${channelId}`);
        res.json({ success: true, reqId, data: { message: text, central: data?.data } });
      } catch (err: any) {
        const reqId = String(res.getHeader("X-Request-Id") || "-");
        logger.error(`[CentralCompat][${reqId}] reply failed: ${err?.message || String(err)}`);
        res.status(500).json({ success: false, reqId, error: err?.message || String(err) });
      }
    },
  },
  {
    type: "POST",
    path: "/v1/central/channels/:channelId/reply/stream",
    handler: async (req: Request, res: Response, runtime: IAgentRuntime) => {
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
          maxTokens: z.number().int().positive().max(8192).optional(),
        });
        const { channelId } = paramsSchema.parse(req.params);
        const { prompt, modelSize, maxTokens } = bodySchema.parse(req.body ?? {});

        __setLimiterMaxFromRuntime(runtime);
        if (!rateLimiter.consume(keyFor(req, runtime))) {
          return void res.status(429).json({ success: false, reqId, error: "Rate limit exceeded" });
        }

        await ensureAgentParticipantInternal(runtime, channelId);

        // SSE headers
        res.writeHead(200, {
          "Content-Type": "text/event-stream; charset=utf-8",
          "Cache-Control": "no-cache, no-transform",
          Connection: "keep-alive",
          "X-Request-Id": String(reqId),
        });

        const { StreamingGatewayProvider } = await import("../providers/streaming-gateway-provider");
        const streamer = new StreamingGatewayProvider(runtime);
        const gen = modelSize === "large"
          ? streamer.generateTextLargeStream(runtime, { prompt, maxTokens } as any)
          : streamer.generateTextSmallStream(runtime, { prompt, maxTokens } as any);

        let accumulated = "";
        for await (const chunk of gen) {
          accumulated += chunk;
          res.write(`event: token\n`);
          res.write(`data: ${JSON.stringify({ reqId, chunk })}\n\n`);
        }

        // Post final to central
        const base = `${req.protocol}://${req.get("host")}`;
        const DEFAULT_SERVER_ID = "00000000-0000-0000-0000-000000000000";
        const payload = {
          author_id: runtime.agentId,
          content: accumulated,
          server_id: DEFAULT_SERVER_ID,
          source_type: "gateway_plugin_stream",
          metadata: { user_display_name: runtime.character?.name || "Agent" },
        };
        const postUrl = `${base}/api/messaging/central-channels/${encodeURIComponent(channelId)}/messages`;
        const resp = await fetch(postUrl, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
        if (!resp.ok) {
          const t = await resp.text();
          throw new Error(`Central message post failed: HTTP ${resp.status} ${t}`);
        }
        const data = await resp.json();
        res.write(`event: complete\n`);
        res.write(`data: ${JSON.stringify({ reqId, length: accumulated.length, central: data?.data })}\n\n`);
        res.end();
      } catch (err: any) {
        logger.error(`[CentralCompat][${reqId}] stream reply failed: ${err?.message || String(err)}`);
        try {
          res.write(`event: error\n`);
          res.write(`data: ${JSON.stringify({ reqId, error: err?.message || String(err) })}\n\n`);
        } catch {}
        res.end();
      }
    },
  },
];

// --- Simple rate limiter (per key per minute) ---
class MinuteRateLimiter {
  private max: number;
  private buckets = new Map<string, { count: number; resetAt: number }>();
  constructor(max: number) {
    this.max = max;
  }
  consume(key: string): boolean {
    const now = Date.now();
    const minute = 60 * 1000;
    const b = this.buckets.get(key);
    if (!b || now >= b.resetAt) {
      this.buckets.set(key, { count: 1, resetAt: now + minute });
      return true;
    }
    if (b.count >= this.max) return false;
    b.count += 1;
    return true;
  }
}

function keyFor(req: Request, runtime: IAgentRuntime): string {
  // Use agentId + IP as coarse key
  const ip = (req.headers["x-forwarded-for"] as string)?.split(",")[0]?.trim() || req.ip || "unknown";
  return `${runtime.agentId}:${ip}`;
}

const rateLimiter = new MinuteRateLimiter(60);

// initialize limiter with runtime value on first handler invocation
export function __setLimiterMaxFromRuntime(runtime: IAgentRuntime) {
  (rateLimiter as any).max = getCentralRateLimitPerMin(runtime);
}
