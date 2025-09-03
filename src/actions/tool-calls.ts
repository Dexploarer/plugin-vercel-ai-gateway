import {
  Action,
  IAgentRuntime,
  Memory,
  State,
  logger,
} from "@elizaos/core";

export const toolCallsAction: Action = {
  name: "TOOL_CALLS",
  similes: ["function_call", "tool_use", "function_execution"],
  description:
    "Execute tool/function calls using AI Gateway integration with ElizaOS actions",
  examples: [
    [
      {
        name: "User",
        content: {
          text: "What's the weather like in San Francisco?",
        },
      },
      {
        name: "Assistant",
        content: {
          text: "I'll check the weather in San Francisco for you.",
          action: "TOOL_CALLS",
        },
      },
    ],
  ],
  validate: async (runtime: IAgentRuntime, message: Memory, state?: State) => {
    // Run when explicit tool calls are present
    if (Array.isArray(message.content?.tool_calls) && message.content.tool_calls.length > 0) {
      // Validate that at least one tool call has the required structure
      const hasValidToolCall = message.content.tool_calls.some(call => 
        call && typeof call === 'object' && call.id && 
        (call.type === 'function' && call.function && typeof call.function.name === 'string')
      );
      return hasValidToolCall;
    }
    const messageText = message.content?.text?.toLowerCase() || "";
    const toolPatterns = [
      /weather/i,
      /calculate/i,
      /search/i,
      /get.*information/i,
      /lookup/i,
      /find/i,
    ];
    return toolPatterns.some((pattern) => pattern.test(messageText));
  },
  handler: async (
    runtime: IAgentRuntime,
    message: Memory,
    state?: State,
    options?: any,
  ) => {
    try {
      logger.debug("[AIGateway] Processing tool calls action");

      const toolCalls = extractToolCalls(message);

      if (!toolCalls || toolCalls.length === 0) {
        return {
          success: false,
          error: "No valid tool calls found in message",
        };
      }

      const results = [];
      for (const toolCall of toolCalls) {
        try {
          const result = await executeToolCall(runtime, toolCall, state);
          results.push({
            tool_call_id: toolCall.id,
            role: "tool",
            content: JSON.stringify(result),
          });
        } catch (error) {
          logger.error(
            `[AIGateway] Error executing tool call ${toolCall.id}:`,
            error,
          );
          results.push({
            tool_call_id: toolCall.id,
            role: "tool",
            content: JSON.stringify({
              error: error instanceof Error ? error.message : "Unknown error",
            }),
          });
        }
      }

      return {
        success: true,
        text: "Tool calls executed successfully",
        data: {
          tool_results: results,
          tool_calls_count: toolCalls.length,
        },
      };
    } catch (error: any) {
      logger.error("[AIGateway] Error in tool calls handler:", error);
      return {
        success: false,
        error:
          error instanceof Error ? error.message : "Unknown error in tool calls",
      };
    }
  },
};

function extractToolCalls(message: Memory): any[] {
  const toolCalls = [];

  if (message.content?.tool_calls) {
    return message.content.tool_calls;
  }

  const text = message.content?.text || "";
  const functionCallPattern = /(\w+)\((.*?)\)/g;
  let match;
  let callId = 1;

  while ((match = functionCallPattern.exec(text)) !== null) {
    const [, functionName, args] = match;
    toolCalls.push({
      id: `call_${callId++}`,
      type: "function",
      function: {
        name: functionName,
        arguments: args || "{}",
      },
    });
  }

  return toolCalls;
}

async function executeToolCall(
  runtime: IAgentRuntime,
  toolCall: any,
  state?: State,
): Promise<any> {
  const { function: func } = toolCall;

  const functionMappings: { [key: string]: string } = {
    get_weather: "weather",
    search_web: "web_search",
    calculate: "calculation",
    get_time: "time",
    send_message: "message",
  };

  const actionName = functionMappings[func.name] || func.name;

  const lname = actionName.toLowerCase();
  const action = runtime.actions.find(
    (a) =>
-      a.name.toLowerCase().includes(actionName.toLowerCase()) ||
      a.name.toLowerCase() === lname ||
      a.similes?.some((s) => s.toLowerCase() === lname),
  );
  if (!action) {
    throw new Error(`No action found for function: ${func.name}`);
  }

  let args = {};
  try {
    args = typeof func.arguments === 'string' ? JSON.parse(func.arguments) : func.arguments;
  } catch (error) {
    logger.warn(
      `[AIGateway] Failed to parse tool call arguments: ${func.arguments}`,
    );
    // Try to extract key-value pairs from string if it's not valid JSON
    if (typeof func.arguments === 'string') {
      try {
        // Try a more lenient parsing approach
        const cleanedArgs = func.arguments.replace(/(['"])?([a-zA-Z0-9_]+)(['"])?:/g, '"$2":');
        args = JSON.parse(`{${cleanedArgs}}`);
      } catch (e) {
        // Fall back to simple splitting as last resort
        args = func.arguments.split(',').reduce((obj, pair) => {
          const [key, value] = pair.split(':').map(s => s.trim());
          if (key) obj[key] = value || true;
          return obj;
        }, {});
        logger.warn(`[AIGateway] Using simplified argument parsing for: ${func.arguments}`);
      }
    }

  const mockMessage: Memory = {
    id: `tool_call_${toolCall.id}`,
    userId: "system",
    agentId: runtime.agentId,
    roomId: state?.roomId || "tool_calls",
    content: {
      text: `Execute ${func.name} with arguments: ${JSON.stringify(args)}`,
      action: action.name,
      ...args,
    },
    createdAt: Date.now(),
    embedding: [],
  };

  const result = await action.handler(runtime, mockMessage, state);
  return result;
}
