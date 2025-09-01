import 'dotenv/config';
import { createGatewayClient } from '@dexploarer/plugin-vercel-ai-gateway';

async function main() {
  const gw = createGatewayClient();
  const model = process.env.ELIZA_CHAT_MODEL || 'gpt-4o-mini';
  const out = await gw.chat({
    model,
    messages: [{ role: 'user', content: 'ping' }],
  });
  if (!out.text) throw new Error('Empty chat response');
  console.log('OK chat via plugin. Snippet:', out.text.slice(0, 80));
}

main().catch((e) => {
  console.error('FAIL chat via plugin:', e?.message || e);
  process.exit(2);
});

