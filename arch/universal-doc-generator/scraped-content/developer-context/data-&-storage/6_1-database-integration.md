# Database Integration | elizaOS/eliza | DeepWiki

**URL:** https://deepwiki.com/elizaOS/eliza/6.1-database-integration
**Category:** Data & Storage
**Context:** Developer Context
**Scraped:** 2025-08-31T23:20:30.911Z

---

Database Integration
Relevant source files

This document covers the database integration layer of ElizaOS, including the abstract database adapter interface, the Drizzle-based SQL implementation, configuration options, and how agents interact with persistent storage. This system provides a unified interface for data persistence across different database backends.

For information about memory management and retrieval systems that work with the database, see Memory Management. For core data model definitions, see Data Models.

Architecture Overview

The database integration follows a layered architecture with an abstract adapter interface and concrete implementations:

Sources: 
packages/core/src/runtime.ts
90
 
packages/core/src/database.ts
28
 
packages/plugin-sql/src/base.ts
81

Database Adapter Interface

The IDatabaseAdapter interface defines the contract for all database implementations, providing methods for managing agents, entities, memories, rooms, and other core data types:

DatabaseAdapter Abstract Class

IDatabaseAdapter Interface

Agent Operations

Memory Operations

Entity Operations

Core Methods

implements

IDatabaseAdapter

init()

getConnection()

isReady()

close()

getEntitiesByIds()

createEntities()

updateEntity()

deleteEntity()

getMemories()

createMemory()

updateMemory()

deleteMemory()

searchMemories()

getAgent()

createAgent()

updateAgent()

deleteAgent()

DatabaseAdapter

db: DB

Sources: 
packages/core/src/types.ts
 
packages/core/src/database.ts
28-579

BaseDrizzleAdapter Implementation

The BaseDrizzleAdapter is the primary SQL database implementation using Drizzle ORM, supporting both PostgreSQL and PGLite:

Retry Logic Flow

Yes

No

Attempt Operation

Catch Error

Retry < maxRetries?

Exponential Backoff

Add Jitter

BaseDrizzleAdapter Class

Database Tables

Core Methods

agentTable

BaseDrizzleAdapter

withDatabase()

withRetry()

memoryTable

entityTable

embeddingTable

roomTable

componentTable

ensureEmbeddingDimension()

Configuration

maxRetries: 3

baseDelay: 1000

jitterMax: 1000

embeddingDimension

Sources: 
packages/plugin-sql/src/base.ts
81-87
 
packages/plugin-sql/src/base.ts
124-154

Database Configuration

Database connections are configured through environment variables, supporting multiple backend options:

Configuration	Environment Variable	Description
PostgreSQL	POSTGRES_URL	Full connection string for PostgreSQL
PGLite	PGLITE_DATA_DIR	Directory path or memory:// for in-memory
Connection Pool	Various driver-specific	Connection pooling settings

Connection Establishment

Database Backends

Configuration Sources

.env File

Environment Variables

Runtime Configuration

PostgreSQL Configuration

PGLite Configuration

Connection String

Connection Pool

Database Instance

Sources: 
.env.example
30-35
 
packages/plugin-sql/src/base.ts
113-116

Database Schema and Tables

The database schema is defined using Drizzle ORM with the following core tables:

owns

creates

has

has

manages

agents

uuid

id

PK

string

name

string

bio

jsonb

settings

jsonb

secrets

timestamp

createdAt

timestamp

updatedAt

entities

uuid

id

PK

uuid

agentId

FK

string[]

names

jsonb

metadata

memories

uuid

id

PK

uuid

agentId

FK

uuid

entityId

FK

uuid

roomId

FK

uuid

worldId

FK

jsonb

content

jsonb

metadata

timestamp

createdAt

embeddings

uuid

id

PK

uuid

memoryId

FK

vector

embedding_384

vector

embedding_512

vector

embedding_768

vector

embedding_1024

vector

embedding_1536

vector

embedding_3072

rooms

uuid

id

PK

uuid

agentId

FK

uuid

worldId

FK

string

name

string

type

jsonb

metadata

components

uuid

id

PK

uuid

entityId

FK

uuid

agentId

FK

string

type

jsonb

data

timestamp

createdAt

Sources: 
packages/plugin-sql/src/schema/index.ts
 
packages/plugin-sql/src/base.ts
36-54

Connection Management and Retry Logic

The BaseDrizzleAdapter implements robust connection management with exponential backoff retry logic:

Error Handling

withRetry() Flow

Connection Lifecycle

Yes

No

Yes

No

init()

Establish Connection

isReady()

Database Operations

close()

Start Operation

Try Operation

Success?

Handle Failure

attempt < maxRetries?

Calculate Backoff Delay

Wait (delay + jitter)

Throw Final Error

Log Warning

Log Error

Track Retry Attempts

Sources: 
packages/plugin-sql/src/base.ts
124-154
 
packages/plugin-sql/src/base.ts
88-91

Plugin Integration and Migrations

Database adapters integrate with the plugin system through registration and migration mechanisms:

Database Tables Created

Migration System

Plugin Registration Flow

Yes

Plugin with Adapter

registerPlugin()

plugin.adapter exists?

registerDatabaseAdapter()

Set runtime.adapter

Runtime Initialize

runPluginMigrations()

Find Plugin Schemas

Migrate Each Plugin

drizzle.migrate()

Core Tables

Plugin-Specific Tables

Indexes & Constraints

Sources: 
packages/core/src/runtime.ts
267-269
 
packages/core/src/runtime.ts
446-472
 
packages/core/src/runtime.ts
512-521

Embedding Dimension Management

The database adapter manages vector embeddings with support for multiple dimensions:

Vector Search Flow

Query Embedding

cosineDistance()

Match Threshold

Search Results

Embedding Dimension System

Operations

Supported Dimensions

ensureEmbeddingDimension()

DIMENSION_MAP

384 dimensions

512 dimensions

768 dimensions

1024 dimensions

1536 dimensions

3072 dimensions

Check Existing Memories

Set embeddingDimension

EmbeddingDimensionColumn

Vector Operations

Sources: 
packages/plugin-sql/src/base.ts
86
 
packages/plugin-sql/src/base.ts
162-180
 
packages/plugin-sql/src/schema/embedding.ts

Runtime Integration

The AgentRuntime integrates with the database adapter through several key interaction points:

Database
IDatabaseAdapter
AgentRuntime
Database
IDatabaseAdapter
AgentRuntime
Initialization Phase
Agent Operations
Memory Operations
Cleanup
registerDatabaseAdapter()
init()
Establish Connection
runPluginMigrations()
Apply Schema Migrations
ensureAgentExists()
INSERT/UPDATE agent
createEntity()
INSERT entity
createMemory()
INSERT memory + embedding
searchMemories()
Vector similarity search
Search results
Formatted memories
close()
Close connections

Sources: 
packages/core/src/runtime.ts
162-164
 
packages/core/src/runtime.ts
365-367
 
packages/core/src/runtime.ts
446-472
