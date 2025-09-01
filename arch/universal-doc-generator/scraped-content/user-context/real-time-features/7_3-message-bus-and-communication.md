# Message Bus and Communication | elizaOS/eliza | DeepWiki

**URL:** https://deepwiki.com/elizaOS/eliza/7.3-message-bus-and-communication
**Category:** Real-time Features
**Context:** User Context
**Scraped:** 2025-08-31T23:21:11.143Z

---

Message Bus and Communication
Relevant source files

This document covers ElizaOS's internal message bus system and inter-component communication architecture. The message bus serves as the central nervous system for routing messages between agents, external platforms, and client interfaces, enabling real-time synchronization and event-driven processing across the entire system.

For information about external platform integrations and client-specific communication protocols, see Platform Clients. For details about API endpoints and HTTP communication, see API Endpoints.

Architecture Overview

ElizaOS implements a centralized message bus architecture that decouples message producers from consumers, enabling scalable and reliable communication between system components. The architecture consists of an internal event emitter, service-based message handling, and real-time WebSocket communication.

Core Communication Components

Storage Layer

Agent Layer

Message Bus Layer

External Sources

Events: new_message,
message_deleted,
channel_cleared

GUI Client

Platform Clients
(Discord, Telegram, etc.)

HTTP API Clients

internalMessageBus
(EventEmitter)

Socket.IO Server

Channel Routes
(/api/messaging/*)

IAgentRuntime instances

MessageBusService

plugin-bootstrap
messageReceivedHandler

Database Adapter
(SQL Plugin)

Memory Management

Sources: 
packages/server/src/bus.js
 
packages/server/src/services/message.ts
1-50
 
packages/server/src/api/messaging/channels.ts
1-100
 
packages/plugin-bootstrap/src/index.ts
1-50

Internal Message Bus

The internalMessageBus is the core event emitter that coordinates all message flow within the ElizaOS system. It implements a publish-subscribe pattern where components can emit and listen for specific event types.

Event Types and Structure

The message bus handles several core event types:

Event Type	Purpose	Payload Structure
new_message	New message ingestion	MessageServiceMessage
message_deleted	Message deletion events	{messageId: UUID}
channel_cleared	Bulk channel clearing	{channelId: UUID, memoryCount: number}
server_agent_update	Agent server subscriptions	{agentId: UUID, serverId: UUID, type: string}
Message Service Structure

Event Flow

MessageServiceMessage Interface

MessageServiceMessage

id: UUID

channel_id: UUID

server_id: UUID

author_id: UUID

content: string

metadata?: any

created_at: number

in_reply_to_message_id?: UUID

internalMessageBus.emit()

internalMessageBus.on()

Event Processing

Sources: 
packages/server/src/services/message.ts
16-30
 
packages/server/src/api/messaging/channels.ts
223-242

Message Bus Service

The MessageBusService class implements the agent-side message bus integration, handling subscription management, message validation, and event processing for individual agent runtimes.

Service Lifecycle and Connection Management
"Message Server API"
"internalMessageBus"
"MessageBusService"
"IAgentRuntime"
"Message Server API"
"internalMessageBus"
"MessageBusService"
"IAgentRuntime"
Service ready for events
MessageBusService.start()
connectToMessageBus()
on('new_message', handler)
on('message_deleted', handler)
on('channel_cleared', handler)
fetchAgentServers()
fetchValidChannelIds()
emit('new_message', message)
validateServerSubscription()
validateNotSelfMessage()
ensureWorldAndRoomExist()
emitEvent(MESSAGE_RECEIVED)
Message Processing Pipeline

The service implements a comprehensive message processing pipeline with validation, entity management, and response routing:

Agent not participant

Not subscribed

Self message

Message Received
from internalMessageBus

getChannelParticipants()
Validate agent participation

validateServerSubscription()
Check server membership

validateNotSelfMessage()
Prevent self-processing

ensureWorldAndRoomExist()
Create world/room if needed

ensureAuthorEntityExists()
Create author entity if needed

createAgentMemory()
Transform to agent memory format

runtime.emitEvent()
MESSAGE_RECEIVED

callbackForCentralBus()
Handle agent response

sendAgentResponseToBus()
Publish back to bus

End Processing

Sources: 
packages/server/src/services/message.ts
400-486
 
packages/server/src/services/message.ts
269-290
 
packages/server/src/services/message.ts
292-398

Agent Integration and Bootstrap Plugin

The bootstrap plugin provides the primary message handling infrastructure for agents, implementing the messageReceivedHandler that processes incoming messages and generates responses.

Message Handler Architecture

Event Emission

Processing Pipeline

Bootstrap Message Handler

messageReceivedHandler

Timeout Monitoring
(60 minute limit)

Run Tracking
runtime.startRun()

Save incoming message
addEmbeddingToMemory()
createMemory()

Check muted state
getParticipantUserState()

Compose state
composeState()

shouldRespond evaluation
(unless bypassed)

processAttachments()
Image/document processing

Generate response
useModel() + XML parsing

processActions()
Execute agent actions

evaluate()
Run evaluators

EventType.RUN_STARTED

EventType.RUN_ENDED

EventType.RUN_TIMEOUT

Response Generation and XML Parsing

The message handler uses XML-based response parsing for structured agent outputs:

Response Routing

LLM Response Processing

Simple

Complex

LLM Raw Response
(XML format)

parseKeyValueXml()
Extract structured data

Map to Content type
{thought, actions, providers, text}

Determine if simple response
(REPLY action only)

Simple Response
Direct callback()

Action Processing
runtime.processActions()

Evaluation
runtime.evaluate()

Sources: 
packages/plugin-bootstrap/src/index.ts
313-677
 
packages/plugin-bootstrap/src/index.ts
496-530
 
packages/core/src/utils.ts
348-412

Real-time Communication with Socket.IO

The system implements WebSocket-based real-time communication through Socket.IO for immediate message delivery to connected clients.

Socket.IO Integration Architecture

Connected Clients

Event Broadcasting

Socket.IO Layer

Socket.IO Server

SocketIORouter

Log Streaming
broadcastLog()

messageBroadcast

Room Management
socket.join(channelId)

Client Event Handling

Web Clients

Desktop Clients

Mobile Clients

Message Broadcasting Flow

When agents generate responses, the system broadcasts them in real-time to connected clients:

"Connected Clients"
"Socket.IO Server"
"Channel Routes"
"Agent Response"
"Connected Clients"
"Socket.IO Server"
"Channel Routes"
"Agent Response"
Broadcast to room members
Real-time message display
POST /central-channels/:channelId/messages
createMessage()
socketIO.to(channelId).emit()
messageBroadcast event

Sources: 
packages/server/src/api/index.ts
36-58
 
packages/server/src/api/messaging/channels.ts
244-256
 
packages/server/src/api/index.ts
60-96

Message Routing and Channel Management

The system implements sophisticated message routing through HTTP endpoints that integrate with the internal message bus.

Channel Message Routing

Real-time Broadcasting

Message Storage

Channel Management

HTTP API Layer

POST /central-channels/:channelId/messages

GET /central-channels/:channelId/messages

POST /messaging/submit

Auto-create channels
if not exists

Validate server existence

Check participant membership

createMessage()
Store in database

Transform to MessageService format

internalMessageBus.emit('new_message')

socketIO.to(channelId).emit()

Update connected clients

Message Deletion and Cleanup Events

The system handles message lifecycle events including deletion and bulk cleanup:

Memory Cleanup

Event Propagation

Deletion Events

Message Deleted

Channel Cleared

internalMessageBus.emit()

MessageBusService.handle*()

Bootstrap event handlers

runtime.deleteMemory()

Bulk memory deletion

Update embeddings

Sources: 
packages/server/src/api/messaging/channels.ts
76-267
 
packages/server/src/services/message.ts
488-561
 
packages/plugin-bootstrap/src/index.ts
687-785

Error Handling and Resilience

The message bus system implements comprehensive error handling and resilience mechanisms to ensure reliable message delivery and processing.

Timeout and Error Management

The bootstrap plugin implements timeout monitoring and error recovery:

Run Timeout: 60-minute timeout for message processing with automatic cleanup
Error Events: Emission of RUN_TIMEOUT and RUN_ENDED events with error details
Graceful Degradation: Continued operation even when individual message processing fails
Memory Cleanup: Automatic cleanup of partial state on errors
Duplicate Message Prevention

The system prevents duplicate message processing through:

Response ID Tracking: Latest response ID tracking per agent-room combination
Memory Deduplication: Checking for existing memories before processing
Atomic Operations: Database-level constraints preventing duplicate insertions

Sources: 
packages/plugin-bootstrap/src/index.ts
319-372
 
packages/plugin-bootstrap/src/index.ts
653-669
 
packages/server/src/services/message.ts
436-443
