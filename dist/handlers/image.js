import { DEFAULT_MODELS } from "../provider.js";
import { SimpleGatewayProvider } from "../providers/simple-gateway.js";
import pRetry from "p-retry";
/**
 * Image generation handler (placeholder - Gateway doesn't support image generation yet)
 */
export async function imageHandler(runtime, params) {
    runtime.logger?.warn("[AI Gateway] Image generation not yet supported by Vercel AI Gateway");
    // For now, return a placeholder response
    throw new Error("Image generation not yet implemented for Vercel AI Gateway");
}
/**
 * Image description handler using vision models
 */
export async function imageDescriptionHandler(runtime, params) {
    const provider = new SimpleGatewayProvider(runtime);
    const modelId = params.model || runtime.getSetting("AIGATEWAY_VISION_MODEL") || DEFAULT_MODELS.IMAGE_DESCRIPTION;
    runtime.logger?.info(`[AI Gateway] Using vision model: ${modelId}`);
    const result = await pRetry(async () => {
        return await provider.generateText({
            model: modelId,
            messages: [
                {
                    role: "system",
                    content: "You are an image analyzer. Provide a short title and a 2-3 sentence description of the image.",
                },
                {
                    role: "user",
                    content: [
                        {
                            type: "text",
                            text: params.prompt || "Describe this image in detail.",
                        },
                        {
                            type: "image_url",
                            image_url: {
                                url: params.imageUrl,
                            },
                        },
                    ],
                },
            ],
            temperature: 0.3,
        });
    }, {
        retries: 3,
        onFailedAttempt: (error) => {
            runtime.logger?.warn(`[AI Gateway] Image description attempt ${error.attemptNumber} failed: ${error.message}`);
        },
    });
    // Parse the response - attempt to extract title and description
    const lines = result.split('\n').filter(line => line.trim());
    let title = "Image";
    let description = result.trim();
    // Try to identify if first line is a title
    if (lines.length > 1) {
        const firstLine = lines[0].trim();
        const restLines = lines.slice(1).join(' ').trim();
        // If first line is short and doesn't end with punctuation, treat as title
        if (firstLine.length < 50 && !firstLine.match(/[.!?]$/)) {
            title = firstLine;
            description = restLines || firstLine;
        }
    }
    runtime.logger?.debug(`[AI Gateway] Generated image description: title="${title}", description length=${description.length}`);
    return {
        title,
        description,
    };
}
//# sourceMappingURL=image.js.map