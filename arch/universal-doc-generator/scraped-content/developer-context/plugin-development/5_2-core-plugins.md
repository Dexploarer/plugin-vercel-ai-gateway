# Core Plugins | elizaOS/eliza | DeepWiki

**URL:** https://deepwiki.com/elizaOS/eliza/5.2-core-plugins
**Category:** Plugin Development
**Context:** Developer Context
**Scraped:** 2025-08-31T23:19:44.673Z

---

Core Plugins
Relevant source files

This document covers the essential plugins that provide fundamental functionality to ElizaOS agents, with primary focus on plugin-bootstrap and overview of plugin-sql. These core plugins handle message processing, database operations, and provide the foundational capabilities that all agents require to function. For information about creating custom plugins, see Creating Plugins. For details about the broader plugin architecture and registration system, see Plugin Architecture.

Overview

Core plugins are the foundational components that every ElizaOS agent depends on. They provide essential services including message handling, database integration, attachment processing, and core actions/evaluators/providers. Unlike optional plugins, core plugins are typically loaded by default and form the backbone of agent functionality.

The two primary core plugins are:

plugin-bootstrap: Handles message processing, attachment handling, and core agent behaviors
plugin-sql: Provides database integration and SQL-based actions (referenced in codebase but not detailed in provided files)
Plugin-Bootstrap Architecture

The plugin-bootstrap plugin serves as the central message processing engine for ElizaOS agents. It exports a comprehensive set of actions, evaluators, and providers while implementing the core message handling pipeline.

Core Plugin Structure

AgentRuntime Integration

Core Components

plugin-bootstrap

index.ts
Main Plugin Entry

actions/
Action Components

evaluators/
Evaluation Logic

providers/
Context Providers

services/
Background Services

messageReceivedHandler()
Primary Message Pipeline

processAttachments()
Media Processing

Event Handlers
reaction, delete, clear

Utility Functions
media, response logic

IAgentRuntime
Runtime Interface

Memory System
Message Storage

State Management
Context Composition

Model Providers
LLM Integration

Sources: 
packages/plugin-bootstrap/src/index.ts
1-50
 
packages/plugin-bootstrap/src/providers/actions.ts
1-91

Message Processing Pipeline

The core message processing logic is implemented in the messageReceivedHandler function, which orchestrates the complete agent response pipeline.

Bypass

Evaluate

Message Input
MessageReceivedHandlerParams

Message Validation
entityId !== agentId

Memory Creation
runtime.createMemory()

Embedding Queue
queueEmbeddingGeneration()

State Composition
composeState()

Mute Check
agentUserState === 'MUTED'

Attachment Processing
processAttachments()

shouldBypassShouldRespond()

Should Respond Evaluation
shouldRespondTemplate

Parse Response
parseKeyValueXml()

Response Generation
messageHandlerTemplate

Parse Response
parseKeyValueXml()

Actions Processing
runtime.processActions()

Evaluation
runtime.evaluate()

Callback Execution
callback(content)

Sources: 
packages/plugin-bootstrap/src/index.ts
332-920
 
packages/plugin-bootstrap/src/index.ts
278-324
 
packages/core/src/prompts.ts
1-25
 
packages/core/src/prompts.ts
26-90

Core Components
Actions Provider

The actions provider discovers and formats available actions that can be executed in response to messages. It validates each action against the current message context and provides formatted action information to the language model.

// Key functions from actionsProvider
const actionsProvider: Provider = {
  name: 'ACTIONS',
  description: 'Possible response actions',
  position: -1,
  get: async (runtime: IAgentRuntime, message: Memory, state: State) => {
    // Validates actions and formats for prompt
  }
}

Sources: 
packages/plugin-bootstrap/src/providers/actions.ts
36-90

Attachment Processing

The plugin handles multimedia attachments by generating descriptions for images and extracting text from documents. This processed information is integrated into agent memory and context.

Key attachment processing functions:

processAttachments(): Main processing pipeline for media attachments
fetchMediaData(): Retrieves media data from URLs or local paths
Image description generation using imageDescriptionTemplate
Document text extraction for plain text files

Sources: 
packages/plugin-bootstrap/src/index.ts
149-273
 
packages/plugin-bootstrap/src/index.ts
117-139
 
packages/core/src/prompts.ts
140-163

Template System

Core plugins utilize template-based prompts for consistent LLM interactions:

Template	Purpose	Key Elements
shouldRespondTemplate	Determines if agent should respond	RESPOND/IGNORE/STOP actions
messageHandlerTemplate	Generates agent responses	thought, actions, providers, text
postCreationTemplate	Creates social media posts	thought, post content, imagePrompt
imageDescriptionTemplate	Describes image attachments	title, description, detailed text

Sources: 
packages/core/src/prompts.ts
1-163

Event Handling System

Plugin-bootstrap implements handlers for various agent lifecycle events:

Event Handler Functions

Memory Operations

Handler Functions

Event Types

messageReceived
Primary Pipeline

reactionReceived
Emoji/Reaction

messageDeleted
Content Removal

channelCleared
Bulk Removal

postGenerated
Content Creation

messageReceivedHandler()
lines 332-920

reactionReceivedHandler()
lines 930-946

messageDeletedHandler()
lines 956-983

channelClearedHandler()
lines 995-1039

postGeneratedHandler()
lines 1050-1292

runtime.createMemory()

runtime.deleteMemory()

runtime.updateMemory()

Bulk Memory Cleanup

Sources: 
packages/plugin-bootstrap/src/index.ts
930-983
 
packages/plugin-bootstrap/src/index.ts
995-1039
 
packages/plugin-bootstrap/src/index.ts
1050-1292

Response Logic and State Management
Should Respond Logic

The plugin implements sophisticated logic to determine when an agent should respond, with configurable bypass rules for different channel types and sources.

// Channel types that bypass shouldRespond evaluation
const defaultBypassTypes = [
  ChannelType.DM,      // Direct messages
  ChannelType.VOICE_DM, // Voice direct messages  
  ChannelType.SELF,    // Self-conversations
  ChannelType.API      // API interactions
];

The shouldBypassShouldRespond() function allows runtime configuration of bypass behavior through environment variables SHOULD_RESPOND_BYPASS_TYPES and SHOULD_RESPOND_BYPASS_SOURCES.

Sources: 
packages/plugin-bootstrap/src/index.ts
278-324

XML Response Parsing

Core plugins use XML-based response parsing for structured LLM outputs, implemented in parseKeyValueXml(). This provides more reliable parsing than JSON for complex agent responses containing thoughts, actions, and generated text.

Sources: 
packages/core/src/utils.ts
350-574

Integration with Agent Runtime

Plugin-bootstrap integrates deeply with the AgentRuntime system through several key interfaces:

Runtime Service Integration

External Integration

Runtime APIs Used

Plugin Services

TaskService
Background Tasks

EmbeddingGenerationService
Vector Processing

Memory APIs
createMemory, getMemoryById

State APIs
composeState

Model APIs
useModel

Event APIs
emitEvent

Entity APIs
getEntityById

IDatabaseAdapter
Persistence Layer

Model Providers
LLM Services

Vector Storage
Embeddings

AgentRuntime

Sources: 
packages/plugin-bootstrap/src/services/task.ts
 
packages/plugin-bootstrap/src/services/embedding.ts
 
packages/plugin-bootstrap/src/index.ts
42-43

The core plugins provide the essential infrastructure that enables ElizaOS agents to process messages, maintain memory, and interact with users across different platforms while maintaining consistent behavior and capabilities.
