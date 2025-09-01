# Plugin System | elizaOS/eliza | DeepWiki

**URL:** https://deepwiki.com/elizaOS/eliza/5-plugin-system
**Category:** Plugin Development
**Context:** Developer Context
**Scraped:** 2025-08-31T23:19:44.673Z

---

Plugin System
Relevant source files

This document covers ElizaOS's extensible plugin architecture for adding capabilities to agents. The plugin system provides standardized interfaces for actions, evaluators, and providers that extend agent behavior and context. For information about creating plugins, see Creating Plugins. For details about the plugin registry, see Plugin Registry and Discovery.

Architecture Overview

The ElizaOS plugin system is built around a modular architecture where plugins export standardized components that integrate with the AgentRuntime. Each plugin can provide three types of components: actions (for agent behaviors), evaluators (for decision-making), and providers (for context enrichment).

Sources: 
packages/plugin-bootstrap/src/index.ts
1-48
 
packages/core/src/types.ts

Core Plugin Components
Actions

Actions define behaviors that agents can perform in response to messages. The Action interface requires name, description, validate, and handler functions. Actions are discovered and filtered through validation before being made available to the agent.

The actionsProvider filters available actions by calling validate() on each registered action and formats them for the agent's context.

Sources: 
packages/plugin-bootstrap/src/providers/actions.ts
36-90

Evaluators

Evaluators assess agent responses and interactions, providing feedback and analysis after actions are executed. They follow the same validation pattern as actions but focus on post-response evaluation rather than execution.

Providers

Providers enrich agent context by supplying relevant data during state composition. The ACTIONS provider demonstrates the pattern: it fetches validated actions and formats them into actionNames, actionExamples, and actionsWithDescriptions for the agent's prompt context.

Sources: 
packages/plugin-bootstrap/src/providers/actions.ts
1-91
 
packages/core/src/utils.ts
101-124

Message Processing Pipeline

The messageReceivedHandler function in the bootstrap plugin demonstrates how plugins integrate into the message processing flow. The pipeline follows these key phases:

Message Storage: Incoming messages are saved to memory and queued for embedding generation
State Composition: Providers are called to enrich context with relevant data
Response Decision: The shouldRespond logic determines if the agent should respond
Action Planning: If responding, the agent plans which actions to take using the messageHandlerTemplate
Action Execution: Planned actions are executed through runtime.processActions()
Evaluation: Evaluators assess the response and execution results

Sources: 
packages/plugin-bootstrap/src/index.ts
332-920

Plugin Registration and Loading

Plugins are registered with the AgentRuntime by adding their exported components to the runtime's collections. The bootstrap plugin exports its components through index files:

Actions: 
packages/plugin-bootstrap/src/actions/index.ts
Evaluators: 
packages/plugin-bootstrap/src/evaluators/index.ts
Providers: 
packages/plugin-bootstrap/src/providers/index.ts

The plugin system supports dynamic loading and filtering of components based on validation results, allowing for context-sensitive availability of features.

Template Integration

The plugin system integrates with ElizaOS's templating system through Handlebars templates. The messageHandlerTemplate and other templates use provider data to compose prompts, with the composePromptFromState function flattening state values for template rendering.

Key templates include:

shouldRespondTemplate: Determines if the agent should respond
messageHandlerTemplate: Plans actions and generates responses
imageDescriptionTemplate: Processes image attachments

Sources: 
packages/core/src/prompts.ts
1-164
 
packages/core/src/utils.ts
101-124
