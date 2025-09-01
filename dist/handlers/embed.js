import { DEFAULT_MODELS } from "../provider.js";
import { SimpleGatewayProvider } from "../providers/simple-gateway.js";
import pRetry from "p-retry";
/**
 * Embedding generation handler
 */
export async function embedHandler(runtime, params) {
    // Handle different parameter formats
    if (params === null) {
        runtime.logger?.warn("[AI Gateway] Null embedding params, returning zero vector");
        return new Array(1536).fill(0);
    }
    const text = typeof params === "string" ? params : params.text;
    if (!text) {
        runtime.logger?.warn("[AI Gateway] Empty text for embedding, returning zero vector");
        return new Array(1536).fill(0);
    }
    const provider = new SimpleGatewayProvider(runtime);
    const modelId = (typeof params === "object" && params && params.model) ||
        runtime.getSetting("AIGATEWAY_EMBEDDING_MODEL") ||
        DEFAULT_MODELS.TEXT_EMBEDDING;
    runtime.logger?.info(`[AI Gateway] Using embedding model: ${modelId}`);
    const result = await pRetry(async () => {
        return await provider.generateEmbedding({
            text,
            model: modelId,
        });
    }, {
        retries: 3,
        onFailedAttempt: (error) => {
            runtime.logger?.warn(`[AI Gateway] Embedding attempt ${error.attemptNumber} failed: ${error.message}`);
        },
    });
    runtime.logger?.debug(`[AI Gateway] Generated embedding with ${result.length} dimensions`);
    return result;
}
//# sourceMappingURL=embed.js.map