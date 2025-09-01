# Data and Storage | elizaOS/eliza | DeepWiki

**URL:** https://deepwiki.com/elizaOS/eliza/6-data-and-storage
**Category:** Data & Storage
**Context:** Developer Context
**Scraped:** 2025-08-31T23:20:30.911Z

---

Data and Storage
Relevant source files

This page covers ElizaOS's data persistence and storage architecture, including database integration, memory management systems, and data models. The system provides a unified interface for storing agent state, memories, conversations, and embeddings across different storage backends.

For information about how data flows through the message processing pipeline, see Core System. For details about configuring database connections, see Settings and Configuration.

Database Architecture

ElizaOS uses a layered database architecture built on the abstract DatabaseAdapter interface, with concrete implementations supporting multiple storage backends.

Database Adapter Pattern

Sources: 
packages/core/src/runtime.ts
90
 
packages/core/src/database.ts
28
 
packages/plugin-sql/src/base.ts
81

Core Database Operations

The DatabaseAdapter abstract class defines comprehensive database operations across multiple entity types:

Entity Type	Create	Read	Update	Delete	Search
Agent	createAgent()	getAgent()	updateAgent()	deleteAgent()	-
Entity	createEntities()	getEntitiesByIds()	updateEntity()	deleteEntity()	searchEntitiesByName()
Memory	createMemory()	getMemories()	updateMemory()	deleteMemory()	searchMemories()
Room	createRooms()	getRoomsByIds()	updateRoom()	deleteRoom()	-
Component	createComponent()	getComponent()	updateComponent()	deleteComponent()	-
Task	createTask()	getTask()	updateTask()	deleteTask()	getTasksByName()

Sources: 
packages/core/src/database.ts
148-578

Database Integration
BaseDrizzleAdapter Implementation

The BaseDrizzleAdapter provides the core database implementation using Drizzle ORM with built-in retry logic and connection management:

Operations

Schema Management

Connection Management

withDatabase()
base.ts:88

withRetry()
base.ts:124

Database Connection
getConnection()

agentTable
schema/index.ts

memoryTable
schema/index.ts

entityTable
schema/index.ts

embeddingTable
schema/index.ts

roomTable
schema/index.ts

CRUD Operations
base.ts:187-500

Embedding Operations
base.ts:162-180

Search Operations
base.ts:729-773

Schema

Sources: 
packages/plugin-sql/src/base.ts
88-154
 
packages/plugin-sql/src/base.ts
187-500

Retry and Error Handling

The adapter implements exponential backoff with jitter for database operations:

Maximum Retries: 3 attempts 
packages/plugin-sql/src/base.ts
82
Base Delay: 1000ms 
packages/plugin-sql/src/base.ts
83
Maximum Delay: 10000ms 
packages/plugin-sql/src/base.ts
84
Jitter: Up to 1000ms 
packages/plugin-sql/src/base.ts
85

Sources: 
packages/plugin-sql/src/base.ts
124-154

Memory Management
Runtime Memory Systems

The AgentRuntime manages multiple memory systems for different types of data persistence and retrieval:

Persistence Layer

Memory Types

Runtime Memory Systems

stateCache
Map
runtime.ts:97

WorkingMemoryEntry
runtime.ts:4-8

Database Memory Store
adapter.createMemory()

Recent Messages
tableName: 'messages'

Long-term Memory
tableName: 'memories'

Action Results
workingMemory

Facts
factsProvider

IDatabaseAdapter
createMemory()

Embedding System
searchMemories()

Sources: 
packages/core/src/runtime.ts
97-104
 
packages/core/src/runtime.ts
4-8

Working Memory Management

The runtime implements working memory with automatic cleanup to prevent memory leaks:

Default Limit: 50 entries 
packages/core/src/runtime.ts
135
Cleanup Strategy: LRU (Least Recently Used) 
packages/core/src/runtime.ts
854-867
Configuration: MAX_WORKING_MEMORY_ENTRIES environment variable 
packages/core/src/runtime.ts
183-187

Sources: 
packages/core/src/runtime.ts
840-868

Data Models
Core Entity Relationships

ElizaOS defines several core data models that represent the fundamental entities in the system:

owns

creates

participates

has

source/target

participates

contains

has

has

belongs_to

contains

Agent

UUID

id

PK

string

name

string

bio

object

settings

object

secrets

timestamp

createdAt

timestamp

updatedAt

Entity

UUID

id

PK

UUID

agentId

FK

string[]

names

object

metadata

Memory

UUID

id

PK

UUID

entityId

FK

UUID

roomId

FK

UUID

worldId

FK

object

content

object

metadata

timestamp

createdAt

Room

UUID

id

PK

string

name

string

type

UUID

worldId

FK

object

metadata

Component

Relationship

Participant

Embedding

World

Sources: 
packages/core/src/types.ts
 (referenced through database operations), 
packages/plugin-sql/src/schema/index.ts

Memory Content Structure

Memories store structured content with type-specific metadata:

Field	Type	Purpose
content.text	string	Primary text content
content.source	string	Origin of the memory
content.type	string	Memory classification
content.actions	string[]	Associated actions
metadata.type	string	Type classification
metadata.tags	string[]	Searchable tags

Sources: 
packages/core/src/runtime.ts
880-909

Storage Backends
PostgreSQL Configuration

Primary production database backend configured via environment variables:

POSTGRES_URL=postgresql://user:pass@host:port/dbname


Sources: 
.env.example
31

PGLite Configuration

Lightweight alternative for development and local deployments:

PGLITE_DATA_DIR=/path/to/data
# or for in-memory:
PGLITE_DATA_DIR=memory://


Sources: 
.env.example
33-35

Embedding Dimension Management

The system supports multiple embedding dimensions with automatic dimension detection:

Supported Dimensions

Embedding Management

DIMENSION_MAP
schema/embedding.ts

embeddingDimension
base.ts:86

ensureEmbeddingDimension()
base.ts:162

384 dimensions

512 dimensions

768 dimensions

1024 dimensions

1536 dimensions

Sources: 
packages/plugin-sql/src/base.ts
86
 
packages/plugin-sql/src/base.ts
162-180
 
packages/plugin-sql/src/schema/embedding.ts
35

Configuration and Initialization
Database Adapter Registration

The AgentRuntime requires database adapter registration during initialization:

Adapter Registration: 
packages/core/src/runtime.ts
512-521
Initialization Check: 
packages/core/src/runtime.ts
357-364
Migration Execution: 
packages/core/src/runtime.ts
446-472
Migration System

Plugin-based migrations run automatically during runtime initialization:

Migration Detection: Plugins with schema property 
packages/core/src/runtime.ts
453
Migration Execution: runMigrations() method 
packages/core/src/runtime.ts
462
Error Handling: Continues on non-critical migration failures 
packages/core/src/runtime.ts
467-469

Sources: 
packages/core/src/runtime.ts
446-472
