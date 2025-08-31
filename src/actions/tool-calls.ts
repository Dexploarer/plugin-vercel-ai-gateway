import {
  Action,
  IAgentRuntime,
  Memory,
  State,
  ActionResult,
  logger,
} from "@elizaos/core";

/**
 * AI Gateway Tool Calls Action
 * Integrates OpenAI-style tool/function calling with ElizaOS Action system
 */

interface ToolCall {
  id: string;
  type: "function";
  function: {
    name: string;
    arguments: string;
  };
}

interface ToolCallMessage {
  role: "assistant" | "tool";
  content: string;
  tool_calls?: ToolCall[];
  tool_call_id?: string;
}

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

  validate: async (
    runtime: IAgentRuntime,
    message: Memory,
    state?: State,
  ): Promise<boolean> => {
    // Check if message contains tool call requests
    const messageText = message.content?.text?.toLowerCase() || "";

    // Look for patterns that might indicate tool usage
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
    options?: { [key: string]: unknown },
  ): Promise<ActionResult> => {
    try {
      logger.debug("[AIGateway] Processing tool calls action");

      // Extract tool calls from the message
      const toolCalls = extractToolCalls(message);

      if (!toolCalls || toolCalls.length === 0) {
        return {
          success: false,
          error: "No valid tool calls found in message",
        };
      }

      const results = [];

      // Execute each tool call
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
    } catch (error) {
      logger.error("[AIGateway] Error in tool calls handler:", error);
      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Unknown error in tool calls",
      };
    }
  },
};

/**
 * Extract tool calls from message content
 */
function extractToolCalls(message: Memory): ToolCall[] {
  const toolCalls: ToolCall[] = [];

  // Check if message has structured tool calls
  if (message.content?.tool_calls) {
    return message.content.tool_calls as ToolCall[];
  }

  // Parse tool calls from text content
  const text = message.content?.text || "";

  // Simple pattern matching for function calls
  // In a real implementation, you'd use more sophisticated parsing
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

/**
 * Execute a single tool call using ElizaOS actions
 */
async function executeToolCall(
  runtime: IAgentRuntime,
  toolCall: ToolCall,
  state?: State,
): Promise<any> {
  const { function: func } = toolCall;

  // Map common function names to ElizaOS patterns
  const functionMappings: Record<string, string> = {
    get_weather: "weather",
    search_web: "web_search",
    calculate: "calculation",
    get_time: "time",
    send_message: "message",
  };

  const actionName = functionMappings[func.name] || func.name;

  // Find matching action in runtime
  const action = runtime.actions.find(
    (a) =>
      a.name.toLowerCase().includes(actionName.toLowerCase()) ||
      a.similes?.some((s) =>
        s.toLowerCase().includes(actionName.toLowerCase()),
      ),
  );

  if (!action) {
    throw new Error(`No action found for function: ${func.name}`);
  }

  // Parse function arguments
  let args: Record<string, any> = {};
  try {
    args = JSON.parse(func.arguments);
  } catch (error) {
    logger.warn(
      `[AIGateway] Failed to parse tool call arguments: ${func.arguments}`,
    );
  }

  // Create a mock message for the action
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

  // Execute the action
  const result = await action.handler(runtime, mockMessage, state);

  return result;
}
