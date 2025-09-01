import { DEFAULT_MODELS } from "../provider.js";
import { SimpleGatewayProvider } from "../providers/simple-gateway.js";
import pRetry from "p-retry";
/**
 * Object generation handler for structured outputs
 */
export async function objectHandler(runtime, params, modelSize = "large") {
    const provider = new SimpleGatewayProvider(runtime);
    const defaultModel = modelSize === "small" ? DEFAULT_MODELS.OBJECT_SMALL : DEFAULT_MODELS.OBJECT_LARGE;
    const modelId = params.model || runtime.getSetting(`AIGATEWAY_OBJECT_${modelSize.toUpperCase()}_MODEL`) || defaultModel;
    runtime.logger?.info(`[AI Gateway] Using ${modelSize} object model: ${modelId}`);
    const messages = [];
    // Add system message if available
    if (runtime.character?.system) {
        messages.push({
            role: "system",
            content: runtime.character.system,
        });
    }
    messages.push({
        role: "user",
        content: params.prompt,
    });
    // Use the simple provider with retry logic
    const result = await pRetry(async () => {
        return await provider.generateObject({
            model: modelId,
            messages,
            schema: params.schema,
            temperature: params.temperature ?? 0.2,
        });
    }, {
        retries: 3,
        onFailedAttempt: (error) => {
            runtime.logger?.warn(`[AI Gateway] Object generation attempt ${error.attemptNumber} failed: ${error.message}`);
        },
    });
    runtime.logger?.debug(`[AI Gateway] Generated object: ${JSON.stringify(result).length} characters`);
    return result;
}
//# sourceMappingURL=object.js.map