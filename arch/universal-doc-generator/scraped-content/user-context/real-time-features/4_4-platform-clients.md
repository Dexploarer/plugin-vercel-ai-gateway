# Platform Clients | elizaOS/eliza | DeepWiki

**URL:** https://deepwiki.com/elizaOS/eliza/4.4-platform-clients
**Category:** Real-time Features
**Context:** User Context
**Scraped:** 2025-08-31T23:21:11.143Z

---

Platform Clients
Relevant source files

Platform Clients are specialized plugins that connect ElizaOS agents to external communication platforms such as Discord, Telegram, Twitter, and other messaging services. These clients are implemented as plugins within the ElizaOS plugin ecosystem, handling platform-specific protocols, message formatting, and authentication while integrating with the core AgentRuntime system.

For information about the web-based chat interface, see Web Interface. For details about real-time communication protocols, see Real-time Communication. For information about the broader plugin architecture that enables platform clients, see Plugin System.

Architecture Overview

Platform Clients are implemented as ElizaOS plugins that bridge external communication platforms with the AgentRuntime. They leverage the plugin system's registration, lifecycle management, and message processing infrastructure while handling platform-specific communication protocols.

Platform Client Plugin Architecture

Core Runtime

Plugin System

Platform Client Plugins

External Platforms

Discord API

Telegram Bot API

Twitter API

Custom Platform APIs

@elizaos/plugin-discord

@elizaos/plugin-telegram

@elizaos/plugin-twitter

custom-platform-plugin

plugin-bootstrap

Plugin Registry

elizaos CLI plugin loader

AgentRuntime

messageReceivedHandler

composeState

factsProvider

Sources: 
packages/plugin-bootstrap/src/providers/facts.ts
1-121
 plugin system architecture from repository overview

Plugin-Based Platform Integration

Platform clients are implemented as ElizaOS plugins that register message handlers, actions, and providers with the core runtime. Rather than implementing a specific client interface, they leverage the existing plugin architecture to integrate with external platforms.

Plugin Integration Pattern

«interface»

Plugin

+name: string

+description: string

+actions?: Action[]

+evaluators?: Evaluator[]

+providers?: Provider[]

PlatformPlugin

+name: string

+actions: Action[]

+providers: Provider[]

+messageHandler: MessageHandler

+connectionManager: ConnectionManager

MessageHandler

+handleIncomingMessage(message: any) : Promise<Memory>

+shouldRespond(message: Memory) : Promise<boolean>

+processResponse(response: Memory) : Promise<void>

ConnectionManager

+runtime: IAgentRuntime

+platformAPI: any

+authenticate() : Promise<void>

+connect() : Promise<void>

+disconnect() : Promise<void>

FactsProvider

+name: "FACTS"

+get(runtime: IAgentRuntime, message: Memory) : Promise<ProviderResult>

+searchMemories(query: string) : Promise<Memory[]>

Sources: 
packages/plugin-bootstrap/src/providers/facts.ts
30-118
 plugin system architecture from repository overview

Integration with AgentRuntime

Platform client plugins integrate with the AgentRuntime through the plugin-bootstrap message processing system. The messageReceivedHandler coordinates with the factsProvider to build context and generate responses, while platform clients handle the platform-specific message parsing and delivery.

Message Processing Flow
"AI Model"
"AgentRuntime"
"factsProvider"
"plugin-bootstrap"
"Platform Client Plugin"
"External Platform API"
"AI Model"
"AgentRuntime"
"factsProvider"
"plugin-bootstrap"
"Platform Client Plugin"
"External Platform API"
"Platform Message Event"
"Parse to Memory format"
"messageReceivedHandler(message)"
"shouldRespond(message)"
"get(runtime, message, state)"
"searchMemories(embedding, query)"
"getMemories(roomId, count)"
"relevantFacts, recentMessages"
"formatted facts context"
"composeState(message, context)"
"useModel(ModelType.TEXT_EMBEDDING)"
"processActions(message, state)"
"generated response"
"response Memory object"
"Platform-formatted message"

Sources: 
packages/plugin-bootstrap/src/providers/facts.ts
34-117
 message processing flow from plugin-bootstrap architecture

Context and Memory Integration

Platform client plugins leverage the factsProvider system to build rich conversational context from agent memory, recent messages, and semantic search. This enables platform clients to provide contextually relevant responses regardless of the communication platform.

Facts and Memory Flow

Context Assembly

Memory Search

Message Context Building

Platform Message

getMemories(roomId, count: 10)

last5Messages.join()

useModel(ModelType.TEXT_EMBEDDING)

searchMemories(tableName: 'facts')

searchMemories(entityId, roomId)

filter unique facts by id

formatFacts(allFacts)

Key facts that {{agentName}} knows

ProviderResult with values, data, text

composeState for response generation

Sources: 
packages/plugin-bootstrap/src/providers/facts.ts
37-104
 memory search and context building logic

Memory and Knowledge Management

Platform clients access agent knowledge through the factsProvider system, which performs semantic search across stored facts and recent conversation history. This enables contextually aware responses that maintain conversation continuity across different platforms.

Knowledge Retrieval Process
Component	Function	Parameters	Returns
getMemories	Retrieve recent messages	tableName: 'messages', roomId, count: 10	Recent conversation history
useModel	Generate text embeddings	ModelType.TEXT_EMBEDDING, text: last5Messages	Vector embedding
searchMemories	Find relevant facts	tableName: 'facts', embedding, roomId, count: 6	Semantically relevant facts
formatFacts	Format fact display	Memory[] facts	Formatted text string
Facts Provider Integration

Context Formation

Parallel Memory Search

Message Analysis

message.content.text

recentMessages.slice(-5)

runtime.useModel(TEXT_EMBEDDING)

searchMemories(facts, embedding, roomId)

searchMemories(facts, entityId, roomId)

filter by unique id

facts.reverse().map(content.text).join()

Key facts that {{agentName}} knows

values: {facts}, data: {facts}, text

Sources: 
packages/plugin-bootstrap/src/providers/facts.ts
16-104
 facts provider implementation and memory search logic

Configuration and Authentication

Platform clients require platform-specific configuration including API keys, authentication tokens, and connection parameters. The configuration system supports both environment variables and runtime configuration management.

Client Initialization

Configuration Management

Authentication

Configuration Sources

.env File

Runtime Settings

Platform-Specific Config

API Keys

OAuth Tokens

Webhook URLs

Bot Tokens

Configuration Loader

Secret Manager

Config Validator

Client Factory

Connection Establisher

Event Subscriber

Sources: Configuration patterns from 
packages/cli/package.json
74-99
 and environment management approaches.

Error Handling and Memory Fallbacks

The factsProvider implements robust error handling for memory retrieval failures, ensuring platform clients can continue operating even when knowledge systems encounter issues. This provides graceful degradation for platform communication.

Error Handling Strategy
Error Scenario	Handling Approach	Fallback Response
Memory search failure	Catch and log error	Return empty facts with "Error retrieving facts"
Embedding generation failure	Try-catch around useModel	Continue with empty context
Database connection issues	Handle in searchMemories	Return empty results array
Malformed fact data	Filter invalid memories	Skip corrupted entries
Resilient Facts Provider Flow

"Recent messages found"

"Memory retrieval fails"

"Embedding generated"

"Model failure"

"Facts found"

"No facts found"

"Search failure"

"Return formatted facts"

"Return 'No facts available'"

"Return error message"

RetrievingMemories

GeneratingEmbedding

ErrorState

SearchingFacts

FormattingResults

EmptyResults

Sources: 
packages/plugin-bootstrap/src/providers/facts.ts
105-116
 error handling in facts provider try-catch blocks

Creating Custom Platform Clients

Developers can create custom platform clients by extending the base platform client interface and implementing platform-specific communication logic. The plugin system provides scaffolding and integration utilities for rapid development.

Deployment

Integration Points

Required Components

Development Process

Client Template

Custom Implementation

Integration Testing

Plugin Packaging

Client Class

Message Handlers

Configuration Schema

Plugin Manifest

IClient Interface

AgentRuntime Integration

Event System

Message Bus

Plugin Registry

NPM Package

Documentation

Sources: Plugin development patterns from 
packages/plugin-sql/package.json
1-63
 and plugin system architecture.
