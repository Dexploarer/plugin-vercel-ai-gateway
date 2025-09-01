import { createGatewayClient } from '@dexploarer/plugin-vercel-ai-gateway';

export async function embedHealthcheck() {
  if (process.env.EMBEDDINGS_DISABLED === '1') return { ok: true, note: 'disabled' } as const;
  try {
    const gw = createGatewayClient();
    const { dim } = await gw.embeddings({ input: 'healthcheck' });
    if (!dim) return { ok: false, note: 'no dim' } as const;
    return { ok: true } as const;
  } catch (e: any) {
    return { ok: false, note: e?.message || 'unknown' } as const;
  }
}

