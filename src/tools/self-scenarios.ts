/*
 A tiny, dependency‑light scenario runner to exercise this plugin end‑to‑end
 using only the AI Gateway credentials (no external scenario framework).

 Usage:
   bun run src/tools/self-scenarios.ts

 Environment:
   AI_GATEWAY_API_KEY
   AI_GATEWAY_BASE_URL (default: https://ai-gateway.vercel.sh/v1)
*/

import { GatewayProvider } from "../providers/gateway-provider";
import { IAgentRuntime, logger } from "@elizaos/core";

type StepFn = () => Promise<{ name: string; ok: boolean; info?: string; error?: string }>;

function makeRuntimeFromEnv(): IAgentRuntime {
  const getSetting = (key: string) => process.env[key];
  return {
    getSetting,
    agentId: "self-test-agent",
    character: {
      name: "self-test",
      system: "You are a helpful assistant used for plugin scenario tests.",
    } as any,
  } as unknown as IAgentRuntime;
}

async function runSteps(steps: StepFn[]) {
  const results: Awaited<ReturnType<StepFn>>[] = [];
  for (const step of steps) {
    try {
      const r = await step();
      const status = r.ok ? "PASS" : "FAIL";
      logger.info(`[Scenario] ${status}: ${r.name}${r.info ? ` — ${r.info}` : ""}`);
      if (!r.ok && r.error) logger.error(`[Scenario]   Reason: ${r.error}`);
      results.push(r);
    } catch (err: any) {
      logger.error(`[Scenario] ERROR in step: ${err?.message || String(err)}`);
      results.push({ name: "<unknown>", ok: false, error: err?.message || String(err) });
    }
  }

  const passed = results.filter((r) => r.ok).length;
  const failed = results.length - passed;
  logger.info(`[Scenario] Summary: ${passed} passed, ${failed} failed`);
  if (failed > 0) process.exitCode = 1;
}

function requireEnv(): { apiKey: string; baseUrl: string } {
  const apiKey = process.env.AI_GATEWAY_API_KEY;
  const baseUrl = process.env.AI_GATEWAY_BASE_URL || "https://ai-gateway.vercel.sh/v1";
  if (!apiKey) {
    throw new Error("AI_GATEWAY_API_KEY is required");
  }
  return { apiKey, baseUrl };
}

async function main() {
  const { apiKey, baseUrl } = requireEnv();
  logger.info(`[Scenario] Using Gateway: ${baseUrl} (key: ****${apiKey.slice(-4)})`);

  const runtime = makeRuntimeFromEnv();
  const provider = new GatewayProvider(runtime);

  const steps: StepFn[] = [
    // Embedding test via provider (exercises our config, retry, and caching path)
    async () => {
      const name = "Embedding: generate vector for sample text";
      try {
        const vec = await provider.generateEmbedding({
          text: "Self‑scenario test embedding",
        } as any);
        const ok = Array.isArray(vec) && vec.length > 0;
        return { name, ok, info: ok ? `dim=${vec.length}` : "no vector returned" };
      } catch (e: any) {
        return { name, ok: false, error: e?.message || String(e) };
      }
    },

    // Small text generation
    async () => {
      const name = "Text Small: basic completion";
      try {
        const out = await provider.generateTextSmall({
          prompt: "Say hello and include the word 'gateway'.",
          temperature: 0.2,
          maxTokens: 64,
          runtime,
        } as any);
        const ok = typeof out === "string" && out.toLowerCase().includes("gateway");
        return { name, ok, info: ok ? `len=${out.length}` : "missing expected token" };
      } catch (e: any) {
        return { name, ok: false, error: e?.message || String(e) };
      }
    },

    // Large text generation
    async () => {
      const name = "Text Large: structured answer";
      try {
        const out = await provider.generateTextLarge({
          prompt: "List three benefits of using an AI gateway in bullets.",
          temperature: 0.3,
          maxTokens: 96,
          runtime,
        } as any);
        const ok = typeof out === "string" && /\n-\s/.test(out);
        return { name, ok, info: ok ? `looks like bullets` : "no bullet points detected" };
      } catch (e: any) {
        return { name, ok: false, error: e?.message || String(e) };
      }
    },
  ];

  await runSteps(steps);
}

main().catch((e) => {
  logger.error(`[Scenario] Fatal: ${e?.message || String(e)}`);
  process.exitCode = 1;
});

