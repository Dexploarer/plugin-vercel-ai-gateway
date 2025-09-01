# AgentRuntime | elizaOS/eliza | DeepWiki

**URL:** https://deepwiki.com/elizaOS/eliza/2.1-agentruntime
**Category:** Architecture & Core Concepts
**Context:** Developer Context
**Scraped:** 2025-08-31T23:19:25.849Z

---

AgentRuntime
Relevant source files

AgentRuntime is the central orchestrator class in ElizaOS that manages the complete lifecycle of AI agents. It serves as the primary interface between agents and all system components including plugins, database adapters, AI models, memory systems, and external services. The runtime handles message processing, state composition, action execution, and coordinates the interaction between all agent subsystems.

For information about individual plugins that extend agent capabilities, see Plugin System. For database-specific operations and adapters, see Data and Storage. For character definitions and configuration, see Character System.

Core Architecture

The AgentRuntime class implements the IAgentRuntime interface and serves as the central hub for all agent operations. It maintains collections of plugins, actions, evaluators, providers, and services while orchestrating their interactions.

AgentRuntime Class Structure

Sources: 
packages/core/src/runtime.ts
73-120
 
packages/core/src/types
40-41

Component Registration System

The runtime uses a comprehensive registration system for managing different types of components:

Sources: 
packages/core/src/runtime.ts
199-294
 
packages/core/src/runtime.ts
492-515

Plugin System Integration

The runtime acts as the central registry for all plugins and their components. During initialization, it processes the characterPlugins array and registers each plugin's actions, evaluators, providers, models, and services.

Plugin Registration Flow

Sources: 
packages/core/src/runtime.ts
199-294
 
packages/core/src/runtime.ts
313-324

Message Processing Pipeline

The runtime coordinates a sophisticated message processing pipeline that handles incoming messages, composes state, evaluates responses, executes actions, and manages memory.

Core Message Processing Flow

The runtime implements run tracking to monitor message processing performance and maintain context across action chains:

Method	Purpose	Key Implementation
startRun()	Begin tracking message processing	Creates UUID, sets currentRunId
getCurrentRunId()	Get current run identifier	Returns currentRunId or creates new
endRun()	Complete run tracking	Clears currentRunId

Sources: 
packages/plugin-bootstrap/src/index.ts
313-636
 
packages/core/src/runtime.ts
177-196

Action Processing Chain

Sources: 
packages/core/src/runtime.ts
517-637

Memory and State Management

The runtime provides comprehensive memory and state management capabilities, including state composition, memory caching, and embedding management.

State Composition System

The composeState() method aggregates data from multiple providers to build comprehensive context for AI model calls:

Memory Operations
Operation	Method	Database Table	Purpose
Create	createMemory()	messages, facts, etc.	Store new memory with embeddings
Retrieve	getMemories()	Any table	Fetch memories by criteria
Search	searchMemories()	Any table	Vector similarity search
Update	updateMemory()	Any table	Modify existing memory
Delete	deleteMemory()	Any table	Remove memory

Sources: 
packages/core/src/runtime.ts
1069-1152
 
packages/plugin-sql/src/base.ts
823-891

Database Integration

The runtime integrates with database adapters through the IDatabaseAdapter interface, with the SQL plugin providing the primary implementation via BaseDrizzleAdapter.

Database Adapter Architecture

Sources: 
packages/core/src/runtime.ts
481-490
 
packages/plugin-sql/src/base.ts
81-91
 
packages/core/src/database.ts
28-44

Model and Provider Management

The runtime maintains a registry of AI model handlers and coordinates their usage for different model types.

Model Registration and Usage
Provider System Integration

The provider system allows dynamic context composition for different scenarios:

Provider Name	Purpose	Data Provided
RECENT_MESSAGES	Message history	Formatted conversation context
ENTITIES	Entity information	Known entities and their data
FACTS	Factual knowledge	Stored facts and relationships
WORLD	World context	Current world/server information
ACTIONS	Available actions	Valid actions for current context
ATTACHMENTS	Media processing	Processed attachment data

Sources: 
packages/core/src/runtime.ts
1257-1299
 
packages/plugin-bootstrap/src/providers/actions.ts
36-74

Event System

The runtime implements a comprehensive event system for plugin communication and system monitoring.

Event Architecture

Sources: 
packages/core/src/runtime.ts
1426-1440
 
packages/plugin-bootstrap/src/index.ts
344-372

Lifecycle Management

The runtime manages the complete agent lifecycle from initialization through shutdown, including plugin loading, database setup, and service coordination.

Initialization Sequence
Settings Management

The runtime provides secure settings management with encryption support:

Method	Purpose	Security Level
setSetting(key, value, secret)	Store configuration	Encrypts if secret=true
getSetting(key)	Retrieve configuration	Auto-decrypts secrets
Character settings	User-visible config	Stored in character.settings
Character secrets	Sensitive data	Stored in character.secrets

Sources: 
packages/core/src/runtime.ts
308-413
 
packages/core/src/runtime.ts
451-475

The AgentRuntime serves as the foundational orchestration layer that enables ElizaOS agents to operate as cohesive, intelligent systems capable of complex multi-modal interactions across diverse platforms and services.
