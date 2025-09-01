import { IAgentRuntime, Route, logger } from "@elizaos/core";
import type { Request, Response } from "express";
import { randomUUID } from "crypto";
import { createGatewayClient } from "../utils/client";
import { getInternalToken } from "../utils/config";

function authorize(req: Request, runtime: IAgentRuntime): { ok: boolean; message?: string } {
  const required = getInternalToken(runtime);
  if (!required) return { ok: true };
  const header = req.headers["authorization"]; // Bearer <token>
  const token = typeof header === "string" && header.startsWith("Bearer ") ? header.slice(7) : undefined;
  if (!token || token !== required) return { ok: false, message: "Forbidden" };
  return { ok: true };
}

async function handler(req: Request, res: Response, runtime: IAgentRuntime) {
  const reqId = randomUUID();
  res.setHeader("X-Request-Id", reqId);
  try {
    const auth = authorize(req, runtime);
    if (!auth.ok) return void res.status(403).json({ ok: false, reqId, error: auth.message });

    const results: any = { ok: true, reqId, timestamp: new Date().toISOString() };

    // Gateway chat
    try {
      const gw = createGatewayClient();
      const chatModel = process.env.ELIZA_CHAT_MODEL || "gpt-4o-mini";
      const out = await gw.chat({ model: chatModel, messages: [{ role: "user", content: "ping" }] });
      results.gateway = { chat: { ok: !!out.text, model: chatModel } };
      if (!out.text) results.ok = false;
    } catch (e: any) {
      results.gateway = results.gateway || {};
      results.gateway.chat = { ok: false, error: e?.message || String(e) };
      results.ok = false;
    }

    // Gateway embeddings (skip if disabled)
    if (process.env.EMBEDDINGS_DISABLED !== "1") {
      try {
        const gw = createGatewayClient();
        const embModel = process.env.ELIZA_EMBEDDINGS_MODEL || "text-embedding-3-small";
        const { dim } = await gw.embeddings({ input: "healthcheck", model: embModel });
        results.gateway.embeddings = { ok: !!dim, dim, model: embModel };
        if (!dim) results.ok = false;
      } catch (e: any) {
        results.gateway = results.gateway || {};
        results.gateway.embeddings = { ok: false, error: e?.message || String(e) };
        results.ok = false;
      }
    } else {
      results.gateway = results.gateway || {};
      results.gateway.embeddings = { ok: true, note: "disabled" };
    }

    // DB/Server check (best-effort)
    try {
      const serverInstance = (runtime as any).serverInstance;
      if (serverInstance?.getServers) {
        const servers = await serverInstance.getServers();
        const count = Array.isArray(servers) ? servers.length : 0;
        const hasNonZero = Array.isArray(servers) && servers.some((s: any) => s?.id && s.id !== "00000000-0000-0000-0000-000000000000");
        results.db = { ok: true, serversCount: count, hasNonZeroServer: !!hasNonZero };
      } else {
        results.db = { ok: true, note: "no serverInstance" };
      }
    } catch (e: any) {
      results.db = { ok: false, error: e?.message || String(e) };
      results.ok = false;
    }

    res.json(results);
  } catch (e: any) {
    logger.error(`[Health] failed: ${e?.message || String(e)}`);
    res.status(500).json({ ok: false, reqId, error: e?.message || String(e) });
  }
}

export const healthRoutes: Route[] = [
  { type: "GET", path: "/v1/health", handler },
];
