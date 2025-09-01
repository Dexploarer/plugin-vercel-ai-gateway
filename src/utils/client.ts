import { getBaseURL } from "./config";

type EmbeddingsArgs = {
  input: string | string[];
  model?: string;
};

type ChatArgs = {
  model?: string;
  messages: Array<{ role: "system" | "user" | "assistant"; content: string }>;
  maxTokens?: number;
  temperature?: number;
};

export function createGatewayClient(env: {
  apiKey?: string;
  baseURL?: string;
  oidcToken?: string;
} = {}) {
  const apiKey = env.apiKey || process.env.AI_GATEWAY_API_KEY || process.env.AIGATEWAY_API_KEY;
  const oidcToken = env.oidcToken || process.env.VERCEL_OIDC_TOKEN;
  const baseURL = env.baseURL || process.env.AI_GATEWAY_BASE_URL || process.env.AIGATEWAY_BASE_URL || "https://ai-gateway.vercel.sh/v1";
  const authHeader: string | undefined = apiKey ? `Bearer ${apiKey}` : (oidcToken ? `Bearer ${oidcToken}` : undefined);
  if (!authHeader) throw new Error("AI_GATEWAY_API_KEY not set or VERCEL_OIDC_TOKEN not set");

  async function embeddings(args: EmbeddingsArgs): Promise<{ vectors: number[][]; dim: number }> {
    const body = {
      model: args.model || process.env.ELIZA_EMBEDDINGS_MODEL || "text-embedding-3-small",
      input: args.input,
    };
    const headers = {
      Authorization: authHeader as string,
      "Content-Type": "application/json",
    } as Record<string, string>;
    const resp = await fetch(`${baseURL}/embeddings`, {
      method: "POST",
      headers,
      body: JSON.stringify(body),
    });
    const text = await resp.text();
    if (!resp.ok) throw new Error(`Embeddings HTTP ${resp.status}: ${text}`);
    const json = JSON.parse(text);
    const vectors: number[][] = (json?.data || []).map((d: any) => d.embedding);
    const dim = vectors[0]?.length || 0;
    return { vectors, dim };
  }

  async function chat(args: ChatArgs): Promise<{ text: string }> {
    const body = {
      model: args.model || process.env.ELIZA_CHAT_MODEL || "gpt-4o-mini",
      messages: args.messages,
      max_tokens: args.maxTokens,
      temperature: args.temperature ?? 0.7,
    } as any;
    const headers = {
      Authorization: authHeader as string,
      "Content-Type": "application/json",
    } as Record<string, string>;
    const resp = await fetch(`${baseURL}/chat/completions`, {
      method: "POST",
      headers,
      body: JSON.stringify(body),
    });
    const text = await resp.text();
    if (!resp.ok) throw new Error(`Chat HTTP ${resp.status}: ${text}`);
    const json = JSON.parse(text);
    const out = json?.choices?.[0]?.message?.content || "";
    return { text: out };
  }

  return { embeddings, chat };
}
