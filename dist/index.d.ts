import * as _elizaos_core from '@elizaos/core';
import { Route, IAgentRuntime } from '@elizaos/core';

/**
 * Vercel AI Gateway Plugin for ElizaOS
 *
 * Features:
 * - Access to 100+ AI models through Vercel AI Gateway
 * - Built-in Grok model blocking in support of ElizaOS
 * - Automatic failover and caching
 * - API Key and OIDC authentication
 * - Cost optimization features
 */
declare const plugin: {
    name: string;
    description: string;
    routes: Route[];
    actions: _elizaos_core.Action[];
    init(runtime: IAgentRuntime): Promise<void>;
};

export { plugin as default };
