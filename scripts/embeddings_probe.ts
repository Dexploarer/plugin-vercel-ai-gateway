import 'dotenv/config';
import { createGatewayClient } from '@dexploarer/plugin-vercel-ai-gateway';

async function main() {
  if (process.env.EMBEDDINGS_DISABLED === '1') {
    console.log('Embeddings disabled by flag');
    process.exit(0);
  }
  const gw = createGatewayClient();

  const model = process.env.ELIZA_EMBEDDINGS_MODEL || 'text-embedding-3-small';
  const { vectors, dim } = await gw.embeddings({
    input: ['hello world', 'second sample'],
    model,
  });

  if (!dim || !Number.isInteger(dim)) throw new Error('No embedding dimension returned');
  if (!vectors?.length) throw new Error('No vectors returned');

  console.log('OK embeddings via plugin. dim=', dim, 'count=', vectors.length);
}

main().catch((e) => {
  console.error('FAIL embeddings via plugin:', e?.message || e);
  process.exit(2);
});

