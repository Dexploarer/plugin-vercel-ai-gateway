import { DEFAULT_MODELS } from "../provider.js";
import { SimpleGatewayProvider } from "../providers/simple-gateway.js";
import pRetry from "p-retry";
/**
 * Text generation handler for ElizaOS model types
 */
export async function textHandler(runtime, params, modelSize = "large") {
    const provider = new SimpleGatewayProvider(runtime);
    // Get model from params or use default
    const defaultModel = modelSize === "small" ? DEFAULT_MODELS.TEXT_SMALL : DEFAULT_MODELS.TEXT_LARGE;
    const modelId = params.model || runtime.getSetting(`AIGATEWAY_${modelSize.toUpperCase()}_MODEL`) || defaultModel;
    runtime.logger?.info(`[AI Gateway] Using ${modelSize} text model: ${modelId}`);
    const messages = [];
    // Add system message if available
    if (runtime.character?.system) {
        messages.push({
            role: "system",
            content: runtime.character.system,
        });
    }
    // Add messages or prompt
    if (params.messages && params.messages.length > 0) {
        messages.push(...params.messages);
    }
    else if (params.prompt) {
        messages.push({
            role: "user",
            content: params.prompt,
        });
    }
    // Use the simple provider with retry logic
    const result = await pRetry(async () => {
        return await provider.generateText({
            model: modelId,
            messages,
            temperature: params.temperature ?? 0.7,
            stream: params.stream,
            onToken: params.onToken,
        });
    }, {
        retries: 3,
        onFailedAttempt: (error) => {
            runtime.logger?.warn(`[AI Gateway] Text generation attempt ${error.attemptNumber} failed: ${error.message}`);
        },
    });
    runtime.logger?.debug(`[AI Gateway] Generated text: ${result.length} characters`);
    return result;
}
//# sourceMappingURL=text.js.map