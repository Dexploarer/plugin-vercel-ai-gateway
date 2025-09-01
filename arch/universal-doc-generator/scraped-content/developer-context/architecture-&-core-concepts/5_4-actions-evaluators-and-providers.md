# Actions, Evaluators, and Providers | elizaOS/eliza | DeepWiki

**URL:** https://deepwiki.com/elizaOS/eliza/5.4-actions-evaluators-and-providers
**Category:** Architecture & Core Concepts
**Context:** Developer Context
**Scraped:** 2025-08-31T23:19:25.849Z

---

Actions, Evaluators, and Providers
Relevant source files

This document explains the three core plugin components that extend agent behavior and decision-making in ElizaOS: Actions, Evaluators, and Providers. These components work together to enable agents to understand context, make decisions, and take meaningful actions in response to messages and events.

For information about creating custom plugins that use these components, see Creating Plugins. For details about the overall plugin architecture and registration system, see Plugin Architecture.

Overview

Actions, Evaluators, and Providers form the foundation of agent capabilities within the ElizaOS plugin system. Each serves a distinct role in the message processing pipeline:

Actions define what an agent can do (reply to messages, execute commands, interact with external services)
Evaluators assess situations, validate responses, and provide feedback on agent behavior
Providers supply contextual information and data to inform agent decisions

These components are orchestrated by the bootstrap plugin during message processing, working together to create intelligent, context-aware agent responses.

Component Architecture

Sources: 
packages/plugin-bootstrap/src/index.ts
495-740

Providers

Providers supply contextual information and data that agents use to make informed decisions. They are invoked during state composition to enrich the agent's understanding of the current situation.

Provider Interface

Providers implement a standard interface with these key properties:

name: Unique identifier for the provider
description: Human-readable description of the provider's purpose
dynamic: Whether the provider generates dynamic content
get: Async function that retrieves and formats data

Sources: 
packages/plugin-bootstrap/src/providers/facts.ts
30-118
 
packages/plugin-bootstrap/src/providers/actions.ts
36-90

Facts Provider Example

The factsProvider demonstrates how providers retrieve and format contextual information:

The facts provider performs semantic search to find relevant information and formats it for inclusion in prompts.

Sources: 
packages/plugin-bootstrap/src/providers/facts.ts
34-117

Provider Selection Rules

Providers are selectively included based on message content and requirements. The system follows these rules for provider selection:

Provider Type	Inclusion Criteria
ATTACHMENTS	Message mentions images, photos, pictures, or contains attachments
ENTITIES	Message asks about or references specific people
RELATIONSHIPS	Message asks about connections between people
FACTS	Message requires factual information or specific knowledge
WORLD	Message asks about environment or world context
ACTIONS	Always included when actions are being processed

Sources: 
packages/core/src/prompts.ts
52-59

Actions

Actions define the capabilities available to agents - the things they can actually do in response to messages. Actions are validated against the current context and executed when selected by the agent's decision-making process.

Action Processing Flow

Sources: 
packages/plugin-bootstrap/src/index.ts
719-727

Actions Provider

The actionsProvider makes available actions discoverable to the agent during decision-making:

The provider validates each action against the current message and state, then formats the available actions for inclusion in prompts.

Sources: 
packages/plugin-bootstrap/src/providers/actions.ts
40-89

Action Execution Order

Actions are executed in the order specified by the agent's response. The system follows specific ordering rules:

REPLY actions come first to acknowledge user requests
Follow-up actions execute the actual tasks
IGNORE is used alone when no response is needed

Sources: 
packages/core/src/prompts.ts
40-50
 
packages/plugin-bootstrap/src/index.ts
642-674

Evaluators

Evaluators assess situations, validate responses, and provide feedback on agent behavior. They are called after action processing to analyze the quality and appropriateness of responses.

Evaluator Integration

Sources: 
packages/plugin-bootstrap/src/index.ts
728-740

Integration in Message Processing

The three component types work together in the message processing pipeline orchestrated by the bootstrap plugin:

State Composition with Providers

During state composition, providers are selectively included based on the request:

Sources: 
packages/plugin-bootstrap/src/index.ts
495-499
 
packages/plugin-bootstrap/src/index.ts
573-574

Plugin Component Registration

Plugins register their actions, evaluators, and providers with the runtime through the plugin interface:

Each plugin can contribute multiple components of each type, extending the agent's capabilities in a modular fashion.

Sources: 
packages/plugin-bootstrap/src/index.ts
38-47
