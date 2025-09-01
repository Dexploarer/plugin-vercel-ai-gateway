# Plugin Architecture | elizaOS/eliza | DeepWiki

**URL:** https://deepwiki.com/elizaOS/eliza/5.1-plugin-architecture
**Category:** Architecture & Core Concepts
**Context:** Developer Context
**Scraped:** 2025-08-31T23:19:25.849Z

---

Plugin Architecture
Relevant source files

This document covers ElizaOS's extensible plugin system, including plugin interfaces, lifecycle management, and the core plugin components (Actions, Evaluators, and Providers). For information about creating custom plugins, see Creating Plugins. For details about specific core plugins, see Core Plugins.

Overview

ElizaOS uses a plugin-based architecture that allows agents to be extended with new capabilities through modular components. Plugins are TypeScript/JavaScript modules that export standardized interfaces and integrate seamlessly with the AgentRuntime system.

Plugin Interface Structure

Every plugin in ElizaOS follows a standard structure defined by the Plugin interface. Plugins export three main types of components:

Sources: packages/plugin-bootstrap/src/index.ts:38-40, packages/plugin-bootstrap/src/providers/actions.ts:36-90

Plugin Component Types
Actions

Actions define what an agent can do in response to messages or events. They contain validation logic, execution handlers, and usage examples.

Sources: packages/plugin-bootstrap/src/providers/actions.ts:42-56, packages/plugin-bootstrap/src/providers/actions.ts:59-82

Evaluators

Evaluators assess agent behavior and responses, providing feedback and learning mechanisms.

Providers

Providers supply contextual information to the agent's state composition process. The actionsProvider example shows how providers gather and format data:

Provider Property	Purpose	Example
name	Identifier used in templates	"ACTIONS"
description	Human-readable purpose	"Possible response actions"
position	Loading order priority	-1 (high priority)
get()	Data retrieval function	Returns {data, values, text}

Sources: packages/plugin-bootstrap/src/providers/actions.ts:36-90

Message Processing Pipeline

The plugin-bootstrap demonstrates the core message handling flow that all plugins participate in:

Sources: packages/plugin-bootstrap/src/index.ts:332-920, packages/plugin-bootstrap/src/index.ts:495-499

Plugin Registration and Lifecycle
Plugin Loading

Plugins are typically loaded during AgentRuntime initialization. The bootstrap plugin shows the export pattern:

// Plugin exports pattern
export * from './actions/index.ts';
export * from './evaluators/index.ts'; 
export * from './providers/index.ts';
Event Handling

The bootstrap plugin implements several event handlers that plugins can provide:

Sources: packages/plugin-bootstrap/src/index.ts:332-337, packages/plugin-bootstrap/src/index.ts:930-946, packages/plugin-bootstrap/src/index.ts:956-983, packages/plugin-bootstrap/src/index.ts:995-1039, packages/plugin-bootstrap/src/index.ts:1050-1292

Template Integration

Plugins interact with the templating system through standardized prompt templates and state composition:

Sources: packages/core/src/utils.ts:80-91, packages/core/src/utils.ts:101-124, packages/core/src/prompts.ts:26-90, packages/core/src/prompts.ts:1-24

Plugin Architecture Components

The following table summarizes key architectural components:

Component	File Location	Purpose
Plugin interface	@elizaos/core	Defines plugin contract
messageReceivedHandler	plugin-bootstrap/src/index.ts:332	Core message processing
actionsProvider	plugin-bootstrap/src/providers/actions.ts:36	Action discovery and formatting
processAttachments	plugin-bootstrap/src/index.ts:149	Media processing pipeline
parseKeyValueXml	core/src/utils.ts:350	LLM response parsing
Template functions	core/src/prompts.ts	Standardized prompt templates

Sources: packages/plugin-bootstrap/src/index.ts:1-35, packages/plugin-bootstrap/src/providers/actions.ts:1-91, packages/core/src/utils.ts:350-574, packages/core/src/prompts.ts:1-164
