# Architecture | elizaOS/eliza | DeepWiki

**URL:** https://deepwiki.com/elizaOS/eliza/1.1-architecture
**Category:** Architecture & Core Concepts
**Context:** Developer Context
**Scraped:** 2025-08-31T23:19:25.849Z

---

Architecture
Relevant source files

This document describes the high-level system architecture of ElizaOS, focusing on how the core runtime system, plugin ecosystem, database layer, and development tools work together to provide a multi-agent development platform. It covers the primary code entities, their relationships, and the flow of data through the system.

For information about specific CLI commands and usage, see CLI System. For details about creating and managing plugins, see Plugin System. For database schemas and data models, see Data and Storage.

Core Runtime System

The ElizaOS architecture centers around the AgentRuntime class, which serves as the central orchestrator for all agent operations. This runtime manages the agent lifecycle, plugin registration, message processing, and state management.

Runtime Architecture

The AgentRuntime class maintains several key data structures and services:

plugins: Array of registered Plugin objects that extend agent capabilities
actions: Array of Action objects that define what the agent can do
evaluators: Array of Evaluator objects that assess agent responses
providers: Array of Provider objects that supply context data
adapter: Implementation of IDatabaseAdapter for data persistence
models: Map of ModelHandler functions for different AI model types

Sources: 
packages/core/src/runtime.ts
86-124
 
packages/core/src/types.ts

Agent Initialization Process

The initialization process involves:

Plugin registration via registerPlugin() method
Database adapter initialization through adapter.init()
Agent entity creation with ensureAgentExists()
Room setup and participant linking

Sources: 
packages/core/src/runtime.ts
339-444
 
packages/plugin-sql/src/base.ts
95-97

Message Processing Pipeline

Message processing is primarily handled by the bootstrap plugin's messageReceivedHandler function, which implements a sophisticated pipeline for processing incoming messages and generating appropriate responses.

Message Flow Architecture

The pipeline processes messages through several key stages:

Message Reception: Generates unique response and run IDs for tracking
Message Processing: Saves to memory, queues embedding generation, checks user state
Response Decision: Uses shouldRespondTemplate to determine if agent should respond
Response Generation: Uses messageHandlerTemplate to generate structured responses

Sources: 
packages/plugin-bootstrap/src/index.ts
332-407
 
packages/plugin-bootstrap/src/index.ts
495-563

State Composition System

The state composition system aggregates context from multiple providers to create a comprehensive State object that informs response generation.

Sources: 
packages/plugin-bootstrap/src/index.ts
495-499
 
packages/plugin-bootstrap/src/providers/actions.ts
36-90

Database and Persistence Layer

The database layer provides a flexible adapter pattern supporting multiple database backends through the IDatabaseAdapter interface.

Database Architecture

Key database operations include:

Memory Management: createMemory(), getMemories(), searchMemories()
Entity Management: createEntities(), getEntitiesByIds(), updateEntity()
Agent Management: createAgent(), getAgent(), updateAgent()
Embedding Operations: getCachedEmbeddings(), ensureEmbeddingDimension()

Sources: 
packages/plugin-sql/src/base.ts
81-90
 
packages/core/src/database.ts
28-63

Retry and Error Handling

The BaseDrizzleAdapter implements robust retry logic with exponential backoff and jitter for database operations.

Sources: 
packages/plugin-sql/src/base.ts
124-154

Plugin System Architecture

The plugin system provides the primary extensibility mechanism for ElizaOS, allowing modular addition of actions, evaluators, providers, and services.

Plugin Registration Flow

Plugin registration involves:

Duplicate name checking
Plugin initialization via plugin.init()
Component registration (actions, evaluators, providers, models, services)
Database adapter registration if provided

Sources: 
packages/core/src/runtime.ts
222-323

Action Execution Pipeline

The action execution system supports:

Action Planning: Multi-step action coordination with actionPlan
Context Preservation: State accumulation across action steps
Result Tracking: ActionResult objects with success/failure status
Memory Storage: Action results stored as memories

Sources: 
packages/core/src/runtime.ts
574-1021

Configuration and Settings

ElizaOS uses a hierarchical configuration system supporting environment variables, character settings, and runtime overrides.

Configuration Architecture

Key configuration areas include:

Server Settings: SERVER_PORT, SERVER_HOST, NODE_ENV, ELIZA_UI_ENABLE
Database Settings: POSTGRES_URL, PGLITE_DATA_DIR
AI Model APIs: OPENAI_API_KEY, ANTHROPIC_API_KEY, OLLAMA_API_ENDPOINT
Plugin Control: IGNORE_BOOTSTRAP, plugin-specific configuration

Sources: 
.env.example
1-82
 
packages/core/src/runtime.ts
496-506

Settings Management

The AgentRuntime provides methods for dynamic settings management:

getSetting(): Retrieves setting with decryption and type coercion
setSetting(): Stores setting in character configuration with optional encryption
Settings resolution order: secrets → settings → environment

Sources: 
packages/core/src/runtime.ts
482-506

Logging and Observability

ElizaOS implements a comprehensive logging system that adapts to both Node.js and browser environments.

Logger Architecture

The logging system provides:

Environment Adaptation: Automatic detection between Node.js and browser
Custom Log Levels: Extends standard levels with success and progress
Memory Management: Configurable in-memory log storage with size limits
Child Logger Support: Hierarchical logging with binding inheritance

Sources: 
packages/core/src/logger.ts
20-38
 
packages/core/src/logger.ts
430-624
