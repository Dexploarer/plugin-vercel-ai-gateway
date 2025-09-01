import type { IAgentRuntime } from "@elizaos/core";
/**
 * Simple gateway provider using direct fetch calls
 * More reliable than AI SDK version compatibility issues
 */
export declare class SimpleGatewayProvider {
    private runtime;
    private config;
    constructor(runtime: IAgentRuntime);
    generateText(params: {
        model: string;
        messages: any[];
        temperature?: number;
        stream?: boolean;
        onToken?: (token: string) => void;
    }): Promise<string>;
    generateObject(params: {
        model: string;
        messages: any[];
        schema: any;
        temperature?: number;
    }): Promise<any>;
    generateEmbedding(params: {
        text: string;
        model: string;
    }): Promise<number[]>;
    private handleStreamingResponse;
}
//# sourceMappingURL=simple-gateway.d.ts.map