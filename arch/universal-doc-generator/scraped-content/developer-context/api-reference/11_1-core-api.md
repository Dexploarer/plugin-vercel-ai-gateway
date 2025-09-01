# Core API | elizaOS/eliza | DeepWiki

**URL:** https://deepwiki.com/elizaOS/eliza/11.1-core-api
**Category:** API Reference
**Context:** Developer Context
**Scraped:** 2025-08-31T23:19:55.064Z

---

Core API
Relevant source files

This document covers the core APIs that form the foundation of the ElizaOS framework. The Core API encompasses the central AgentRuntime orchestrator, database abstraction layer, memory management systems, character configuration, and plugin integration interfaces that enable agent functionality.

For information about client-side APIs for web and native applications, see Client API. For command-line interface APIs, see CLI API.

AgentRuntime - Central Orchestrator

The AgentRuntime class serves as the primary orchestrator for all agent operations. It manages the agent lifecycle, coordinates plugins, handles message processing, and maintains state across conversations.

Sources: 
packages/core/src/runtime.ts
86-188

Key Runtime Methods

The AgentRuntime provides essential methods for agent operation:

Method	Purpose	Return Type
initialize()	Initialize runtime, plugins, and database	Promise<void>
registerPlugin(plugin)	Register and initialize a plugin	Promise<void>
processActions(message, responses, state)	Execute actions from agent responses	Promise<void>
evaluate(message, state, didRespond)	Run evaluators on messages	Promise<Evaluator[]>
composeState(message, providers)	Build context state for AI models	Promise<State>
getSetting(key)	Retrieve configuration setting	string | boolean | null
setSetting(key, value, secret)	Store configuration setting	void

Sources: 
packages/core/src/runtime.ts
190-521

Action Processing Pipeline

The action processing system handles multi-step action execution with state management:

Sources: 
packages/core/src/runtime.ts
574-1021

Database Abstraction Layer

The database layer provides a unified interface for data persistence across different database implementations.

DatabaseAdapter Interface

The abstract DatabaseAdapter class defines the contract for all database operations:

Sources: 
packages/core/src/database.ts
28-579
 
packages/plugin-sql/src/base.ts
81-88

Memory Management APIs

Memory operations form the core of the agent's knowledge management:

Method	Parameters	Purpose
getMemories()	entityId, agentId, count, tableName, roomId	Retrieve stored memories with filtering
createMemory()	memory, tableName, unique	Store new memory with optional uniqueness check
searchMemories()	embedding, query, match_threshold, tableName	Semantic search using embeddings
updateMemory()	memory with id	Update existing memory content
deleteMemory()	memoryId	Remove specific memory
countMemories()	roomId, unique, tableName	Count memories in scope

Sources: 
packages/core/src/database.ts
148-299

Entity and Component System

Entities represent users, agents, and other objects in the system, with components providing extensible data:

Sources: 
packages/core/src/database.ts
76-142
 
packages/plugin-sql/src/base.ts
507-688

Memory and Knowledge Management

The memory system provides semantic search and knowledge retrieval capabilities for agents.

Memory Data Model

Sources: 
packages/core/src/database.ts
181-250
 
packages/plugin-sql/src/base.ts
162-180

Embedding Operations

The system supports high-dimensional embedding search for semantic similarity:

Sources: 
packages/plugin-sql/src/base.ts
162-180
 
packages/core/src/database.ts
181-200

Character and Settings Management

Character configuration and settings provide agent personality and behavior customization.

Character Configuration

The character system defines agent personality, capabilities, and plugin selection:

Property	Type	Purpose
id	UUID	Unique character identifier
name	string	Display name for the agent
bio	string	Character background and personality
lore	string[]	Knowledge and context information
adjectives	string[]	Personality traits
knowledge	string[]	Domain expertise areas
plugins	string[]	Required plugin names
settings	object	Configuration parameters
secrets	object	Encrypted sensitive data

Sources: 
packages/core/src/runtime.ts
148-188

Settings API

Runtime settings management with encryption support:

Sources: 
packages/core/src/runtime.ts
482-506

Plugin Integration APIs

The plugin system enables extensible agent capabilities through actions, evaluators, providers, and services.

Plugin Registration

Sources: 
packages/core/src/runtime.ts
222-323

Plugin Component Types
Component	Purpose	Method Signature
Action	Execute agent behaviors	handler(runtime, message, state, options)
Evaluator	Assess message responses	validate(runtime, message, state)
Provider	Supply context data	get(runtime, message, state)
Service	Background operations	start(), stop() lifecycle
ModelHandler	AI model integration	(params) => Promise<Result>

Sources: 
packages/core/src/runtime.ts
271-323

Cross-Platform Logging

The logging system provides unified logging across Node.js and browser environments.

Logger Architecture

Sources: 
packages/core/src/logger.ts
819-877
 
packages/core/src/logger.ts
463-624

Logger Usage Patterns
// Basic logging
const logger = createLogger({ service: 'agent-runtime' });
logger.info('Agent initialized', { agentId: '123' });
logger.error(error, 'Failed to process action');

// Child loggers with context
const childLogger = logger.child({ userId: 'user-456' });
childLogger.debug('Processing user request');

// Custom log levels
logger.success('Action completed successfully');
logger.progress('Processing step 3 of 5');

Sources: 
packages/core/src/logger.ts
234-247

The Core API provides the foundational interfaces and implementations that enable agent functionality across the ElizaOS framework. These APIs handle the complete agent lifecycle from initialization through message processing, knowledge management, and plugin integration.
