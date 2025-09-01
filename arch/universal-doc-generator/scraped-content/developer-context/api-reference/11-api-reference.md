# API Reference | elizaOS/eliza | DeepWiki

**URL:** https://deepwiki.com/elizaOS/eliza/11-api-reference
**Category:** API Reference
**Context:** Developer Context
**Scraped:** 2025-08-31T23:19:55.064Z

---

API Reference
Relevant source files

This document provides comprehensive API documentation for developers working with the ElizaOS framework. It covers the core runtime APIs, database interfaces, logging system, and type definitions that form the foundation of the agent development platform.

For information about higher-level development workflows, see Development. For specific plugin development APIs, see Plugin System. For client-side integration APIs, see Client Interfaces.

Core Runtime API

The AgentRuntime class serves as the central orchestrator for all agent operations, managing plugins, actions, memory, and AI model interactions.

AgentRuntime Class

The main runtime class provides the core functionality for agent lifecycle management:

Model Integration

State Management

Plugin Management

AgentRuntime Core API

AgentRuntime

initialize()

registerPlugin()

processActions()

evaluate()

composeState()

actions: Action[]

evaluators: Evaluator[]

providers: Provider[]

plugins: Plugin[]

stateCache: Map

Memory System

getSetting()

setSetting()

models: Map

ModelHandler

Embeddings

Key Methods:

Method	Purpose	Returns
initialize()	Initializes the runtime, loads plugins, sets up database	Promise<void>
registerPlugin(plugin: Plugin)	Registers a plugin with the runtime	Promise<void>
processActions(message, responses, state, callback)	Executes actions from agent responses	Promise<void>
evaluate(message, state, didRespond, callback, responses)	Runs evaluators on agent interactions	Promise<Evaluator[]>
composeState(message, components)	Builds contextual state for agent processing	Promise<State>

Settings Management:

Method	Purpose	Parameters
getSetting(key: string)	Retrieves a setting value with decryption	key: setting name
setSetting(key, value, secret?)	Stores a setting value with optional encryption	key, value, secret flag

Sources: 
packages/core/src/runtime.ts
86-189
 
packages/core/src/runtime.ts
222-323
 
packages/core/src/runtime.ts
496-506
 
packages/core/src/runtime.ts
482-494

Plugin Registration Flow
DatabaseAdapter
Plugin
AgentRuntime
Client
DatabaseAdapter
Plugin
AgentRuntime
Client
registerPlugin(plugin)
Check existing plugins
plugin.init(config, runtime)
Register actions/evaluators/providers
Register models/routes/services
Register database adapter (if provided)
Add to plugins array
Registration complete

Sources: 
packages/core/src/runtime.ts
222-323

Database API

The database system provides a unified interface for data persistence across different database implementations.

DatabaseAdapter Interface

The abstract DatabaseAdapter class defines the contract for all database implementations:

Advanced Features

Core Operations

Database Adapter Hierarchy

IDatabaseAdapter
(Interface)

DatabaseAdapter
(Abstract Class)

BaseDrizzleAdapter
(Abstract)

PostgreSQLAdapter
PGLiteAdapter
(Concrete)

Entity Management
• getEntitiesByIds()
• createEntities()
• updateEntity()

Memory Management
• getMemories()
• createMemory()
• searchMemories()

Agent Management
• getAgent()
• createAgent()
• updateAgent()

Component System
• getComponent()
• createComponent()
• updateComponent()

Embedding Search
• getCachedEmbeddings()
• searchMemories()

Relationships
• createRelationship()
• getRelationships()

Room Management
• createRooms()
• getRoomsByIds()

Cache Operations
• getCache()
• setCache()

Core Database Operations:

Category	Methods	Purpose
Initialization	init(), initialize(), isReady(), close()	Database lifecycle management
Entities	getEntitiesByIds(), createEntities(), updateEntity()	User and agent entity management
Memories	getMemories(), createMemory(), searchMemories()	Agent memory storage and retrieval
Components	getComponent(), createComponent(), updateComponent()	Entity component system
Agents	getAgent(), createAgent(), updateAgent(), deleteAgent()	Agent lifecycle management

Sources: 
packages/core/src/database.ts
28-579

BaseDrizzleAdapter Implementation

The BaseDrizzleAdapter provides a concrete implementation using Drizzle ORM:

Key Features:

Feature	Implementation	Purpose
Retry Logic	withRetry() with exponential backoff	Handles transient database failures
Embedding Support	ensureEmbeddingDimension()	Manages vector embeddings for semantic search
Transaction Support	Database transactions for data consistency	Ensures atomic operations
Migration System	runMigrations() for schema updates	Handles database schema evolution

Database Schema Tables:

Table	Purpose	Key Fields
agentTable	Stores agent configurations	id, name, bio, settings, secrets
entityTable	Stores entities (users, agents)	id, agentId, names, metadata
memoryTable	Stores agent memories	id, entityId, content, embedding
componentTable	Entity component system	id, entityId, type, data
roomTable	Chat rooms and channels	id, name, type, channelId
embeddingTable	Vector embeddings	memoryId, embedding dimensions

Sources: 
packages/plugin-sql/src/base.ts
81-116
 
packages/plugin-sql/src/base.ts
124-154
 
packages/plugin-sql/src/base.ts
162-180

Logger API

The logging system provides cross-platform logging with environment detection and consistent APIs.

Cross-Platform Architecture

Unified Logger Interface

Logger API Architecture

Node.js Implementation

Browser Implementation

Environment Detection

createLogger()

envDetector

isBrowser()

isNode()

hasProcess()

createBrowserLogger()

Console API

In-Memory Storage

Pino Logger

pino-pretty

Custom Destinations

Log Methods
• trace(), debug()
• info(), warn()
• error(), fatal()
• success(), progress()

child()

clear()

Logger Interface Methods:

Method	Purpose	Environments
trace(obj, msg, ...args)	Detailed debugging information	Both
debug(obj, msg, ...args)	Development debugging	Both
info(obj, msg, ...args)	Informational messages	Both
warn(obj, msg, ...args)	Warning messages	Both
error(obj, msg, ...args)	Error messages	Both
fatal(obj, msg, ...args)	Fatal error messages	Both
success(obj, msg, ...args)	Success messages (custom)	Both
progress(obj, msg, ...args)	Progress updates (custom)	Both
child(bindings)	Create child logger with context	Both
clear()	Clear log buffer/console	Both

Environment-Specific Features:

Feature	Browser	Node.js
Console Output	Browser console methods	Pino with pino-pretty
Memory Storage	In-memory log buffer	Optional memory destination
Log Levels	JavaScript level filtering	Pino level system
Formatting	Custom timestamp formatting	Pino pretty formatting
Error Handling	Safe stringify for circular refs	Pino error serialization

Sources: 
packages/core/src/logger.ts
20-88
 
packages/core/src/logger.ts
432-624
 
packages/core/src/logger.ts
819-847

Type System

The ElizaOS type system provides comprehensive interfaces for all major entities in the framework.

Core Type Definitions

Component System

Core Entity Types

Plugin System

Plugin
• name: string
• actions: Action[]
• evaluators: Evaluator[]
• providers: Provider[]

Action
• name: string
• handler: Function
• validate: Function
• similes: string[]

Provider
• name: string
• get: Function
• validate: Function

Memory & Content

Memory
• id: UUID
• entityId: UUID
• content: Content
• metadata: object

Content
• text: string
• actions: string[]
• source: string
• type: string

State
• values: object
• data: object
• text: string

Agent
• id: UUID
• name: string
• bio: string
• settings: object

Entity
• id: UUID
• agentId: UUID
• names: string[]
• metadata: object

Character
• id: UUID
• name: string
• username: string
• plugins: string[]

Component
• id: UUID
• entityId: UUID
• type: string
• data: object

Room
• id: UUID
• name: string
• type: ChannelType
• metadata: object

World
• id: UUID
• name: string
• agentId: UUID
• metadata: object

UUID Type System:

All entities use the UUID type for consistent identification:

type UUID = `${string}-${string}-${string}-${string}-${string}`;

Memory Metadata Structure:

Field	Type	Purpose
type	string	Memory classification
source	string	Origin of the memory
timestamp	number	Creation timestamp
tags	string[]	Searchable tags
scope	string	Access scope

Sources: 
packages/core/src/types.ts
 
packages/core/src/index.ts
1-21

Configuration API

The configuration system manages settings, secrets, and environment variables across the framework.

Settings Management

Security Features

Settings API

Configuration Sources

Environment Variables
• NODE_ENV
• LOG_LEVEL
• API Keys

Character Config
• settings: object
• secrets: object

Runtime Settings
• environmentSettings
• character settings

getSetting(key)
• Decryption
• Fallback chain
• Type conversion

setSetting(key, value, secret)
• Encryption
• Character storage
• Secret handling

encryptSecret()

decryptSecret()

getSalt()

Configuration Environment Variables:

Variable	Purpose	Default
SERVER_PORT	Web server port	3000
NODE_ENV	Environment mode	development
LOG_LEVEL	Logging verbosity	info
POSTGRES_URL	PostgreSQL connection	-
OPENAI_API_KEY	OpenAI API access	-
ANTHROPIC_API_KEY	Anthropic API access	-

Settings Resolution Chain:

character.secrets[key] (encrypted)
character.settings[key] (plain)
character.settings.secrets[key] (legacy)
runtime.settings[key] (environment)

Sources: 
packages/core/src/runtime.ts
482-506
 
.env.example
1-82

Model Provider Integration

The framework supports multiple AI model providers through a unified interface.

Model Handler System

Model Provider API

Model Types

Provider Types

TEXT_GENERATION

ModelHandler

models: Map

OpenAI Models
• GPT-4, GPT-3.5
• Text Embeddings
• DALL-E

Anthropic Models
• Claude 3
• Claude Instant

Ollama Local
• Local LLMs
• Custom Models

Google AI
• Gemini
• PaLM

TEXT_EMBEDDING

IMAGE_GENERATION

SPEECH_TO_TEXT

Model Registration:

Models are registered through plugins using the runtime's registerModel() method:

Parameter	Purpose
modelType	Type of model (TEXT_GENERATION, etc.)
handler	Function to handle model requests
pluginName	Name of the providing plugin
priority	Handler priority for selection

Sources: 
packages/core/src/runtime.ts
286-295
 
.env.example
38-56

This API reference provides the foundation for developing with ElizaOS. For specific implementation examples and advanced usage patterns, refer to the related documentation sections for your particular use case.
