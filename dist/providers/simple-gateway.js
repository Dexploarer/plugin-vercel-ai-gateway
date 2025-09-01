import { getGatewayConfig } from "../provider.js";
/**
 * Simple gateway provider using direct fetch calls
 * More reliable than AI SDK version compatibility issues
 */
export class SimpleGatewayProvider {
    runtime;
    config;
    constructor(runtime) {
        this.runtime = runtime;
        this.config = getGatewayConfig(runtime);
    }
    async generateText(params) {
        const baseUrl = this.config.baseURL || "https://ai-gateway.vercel.sh/v1";
        const apiKey = this.config.apiKey;
        if (!apiKey) {
            throw new Error("AI Gateway API key not configured");
        }
        const headers = {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`,
        };
        if (this.config.appTitle) {
            headers['x-title'] = this.config.appTitle;
        }
        if (this.config.httpReferer) {
            headers['http-referer'] = this.config.httpReferer;
        }
        const requestBody = {
            model: params.model,
            messages: params.messages,
            temperature: params.temperature ?? 0.7,
            stream: params.stream || false,
        };
        this.runtime.logger?.debug(`[SimpleGateway] Request: ${JSON.stringify(requestBody)}`);
        const response = await fetch(`${baseUrl}/chat/completions`, {
            method: 'POST',
            headers,
            body: JSON.stringify(requestBody),
        });
        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`API request failed: ${response.status} ${errorText}`);
        }
        if (params.stream && params.onToken) {
            return this.handleStreamingResponse(response, params.onToken);
        }
        else {
            const data = await response.json();
            const text = data.choices?.[0]?.message?.content || '';
            this.runtime.logger?.debug(`[SimpleGateway] Response: ${text.substring(0, 100)}...`);
            return text;
        }
    }
    async generateObject(params) {
        // For now, generate text and try to parse as JSON
        const text = await this.generateText({
            model: params.model,
            messages: [
                ...params.messages,
                {
                    role: "system",
                    content: `Please respond with valid JSON that matches this schema: ${JSON.stringify(params.schema)}`
                }
            ],
            temperature: params.temperature,
        });
        try {
            return JSON.parse(text);
        }
        catch (error) {
            // Fallback: try to extract JSON from text
            const jsonMatch = text.match(/\{.*\}/s);
            if (jsonMatch) {
                try {
                    return JSON.parse(jsonMatch[0]);
                }
                catch {
                    // If all else fails, return the text wrapped in an object
                    return { result: text };
                }
            }
            return { result: text };
        }
    }
    async generateEmbedding(params) {
        const baseUrl = this.config.baseURL || "https://ai-gateway.vercel.sh/v1";
        const apiKey = this.config.apiKey;
        if (!apiKey) {
            throw new Error("AI Gateway API key not configured");
        }
        const headers = {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`,
        };
        if (this.config.appTitle) {
            headers['x-title'] = this.config.appTitle;
        }
        if (this.config.httpReferer) {
            headers['http-referer'] = this.config.httpReferer;
        }
        const response = await fetch(`${baseUrl}/embeddings`, {
            method: 'POST',
            headers,
            body: JSON.stringify({
                model: params.model,
                input: params.text,
            }),
        });
        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Embedding API request failed: ${response.status} ${errorText}`);
        }
        const data = await response.json();
        return data.data?.[0]?.embedding || [];
    }
    async handleStreamingResponse(response, onToken) {
        const reader = response.body?.getReader();
        if (!reader) {
            throw new Error("No response body for streaming");
        }
        let fullText = "";
        const decoder = new TextDecoder();
        try {
            while (true) {
                const { done, value } = await reader.read();
                if (done)
                    break;
                const chunk = decoder.decode(value, { stream: true });
                const lines = chunk.split('\n');
                for (const line of lines) {
                    if (line.startsWith('data: ')) {
                        const data = line.slice(6).trim();
                        if (data === '[DONE]')
                            continue;
                        try {
                            const parsed = JSON.parse(data);
                            const content = parsed.choices?.[0]?.delta?.content;
                            if (content) {
                                fullText += content;
                                onToken(content);
                            }
                        }
                        catch (error) {
                            // Skip invalid JSON chunks
                        }
                    }
                }
            }
        }
        finally {
            reader.releaseLock();
        }
        return fullText;
    }
}
//# sourceMappingURL=simple-gateway.js.map