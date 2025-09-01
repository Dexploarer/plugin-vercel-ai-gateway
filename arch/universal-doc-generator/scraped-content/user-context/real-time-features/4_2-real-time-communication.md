# Real-time Communication | elizaOS/eliza | DeepWiki

**URL:** https://deepwiki.com/elizaOS/eliza/4.2-real-time-communication
**Category:** Real-time Features
**Context:** User Context
**Scraped:** 2025-08-31T23:21:11.143Z

---

Real-time Communication
Relevant source files

This document covers ElizaOS's real-time communication architecture, which enables live messaging between clients and agents through WebSocket connections. The system handles message routing, agent responses, and client-server synchronization for interactive chat experiences.

For information about message persistence and database storage, see Data Models. For details about the web client interface, see Web Interface.

Overview

ElizaOS implements a multi-layered real-time communication system built on Socket.IO that connects web clients directly to agent runtimes. The architecture supports both direct messaging (DM) and group chat scenarios, with automatic message routing, agent processing, and response broadcasting.

Core Components

The real-time communication system consists of four primary layers:

Message Processing Layer

Server Router Layer

Transport Layer

Client Layer

React Chat Components

SocketIOManager

useSocketChat Hook

Socket.IO Server

WebSocket Connections

SocketIORouter

Event Handlers

MessageBusService

Agent Runtime

Internal Message Bus

Sources: 
packages/cli/src/server/api/index.ts
417-442
 
packages/cli/src/server/socketio/index.ts
15-38
 
packages/client/src/lib/socketio-manager.ts
140-155

Client-Side Architecture
SocketIOManager

The SocketIOManager class provides a singleton interface for WebSocket communication on the client side. It maintains connections, handles events, and provides an EventEmitter-like API for React components.

React Hooks

Client Events

SocketIOManager

Connection Management

EventAdapter

Channel Management

Log Streaming

messageBroadcast

messageComplete

controlMessage

messageDeleted

channelCleared

useSocketChat

Chat Components

The manager handles connection lifecycle, automatic reconnection, and event routing:

Method	Purpose
connect()	Establishes WebSocket connection
joinChannel()	Subscribes to channel events
leaveChannel()	Unsubscribes from channel
sendMessage()	Transmits messages to server

Sources: 
packages/client/src/lib/socketio-manager.ts
140-280
 
packages/client/src/hooks/use-socket-chat.ts
15-85

useSocketChat Hook

The useSocketChat React hook integrates Socket.IO communication with chat UI components, managing message state and user interactions.

External Dependencies

useSocketChat

Message State

Event Listeners

Send Logic

Animation State

SocketIOManager

React Query

Toast System

Sources: 
packages/client/src/hooks/use-socket-chat.ts
87-340

Server-Side Architecture
SocketIORouter

The SocketIORouter class handles incoming WebSocket events and routes them to appropriate message processing services.

Processing

Event Types

SocketIORouter

handleNewConnection

handleMessageSubmission

handleChannelJoining

handleLogStreaming

SEND_MESSAGE

ROOM_JOINING

message

subscribe_logs

Central Message Store

Agent Processing

Response Broadcasting

Key event handlers in the router:

Event	Handler	Purpose
SEND_MESSAGE	handleMessageSubmission	Process user messages
ROOM_JOINING	handleChannelJoining	Channel subscription
message	handleGenericMessage	Legacy message format
subscribe_logs	Log streaming setup	Real-time log delivery

Sources: 
packages/cli/src/server/socketio/index.ts
29-70
 
packages/cli/src/server/socketio/index.ts
400-500

Message Processing Pipeline

When a message is received through WebSocket, it follows this processing pipeline:

"Agent Runtime"
"MessageBusService"
"Internal Message Bus"
"Central Message Store"
"SocketIORouter"
"Socket.IO Server"
"Client"
"Agent Runtime"
"MessageBusService"
"Internal Message Bus"
"Central Message Store"
"SocketIORouter"
"Socket.IO Server"
"Client"
SEND_MESSAGE event
handleMessageSubmission
Store message
Emit 'new_message'
Route to subscribed agents
Process message
Generate response
Emit response
Broadcast response
messageBroadcast
Real-time response

Sources: 
packages/cli/src/server/socketio/index.ts
400-550
 
packages/cli/src/server/services/message.ts
276-350

MessageBusService Integration
Agent Message Processing

The MessageBusService connects the Socket.IO layer to agent runtimes through an internal event bus. Each agent runtime has its own MessageBusService instance that filters and processes relevant messages.

Internal Bus Events

Agent Runtime

MessageBusService

validateServerSubscription

validateNotSelfMessage

ensureWorldAndRoomExist

ensureAuthorEntityExists

createAgentMemory

MESSAGE_RECEIVED Event

Agent Processing

Response Generation

new_message

message_deleted

channel_cleared

server_agent_update

The service performs several validation and setup steps before agent processing:

Step	Function	Purpose
Server validation	validateServerSubscription	Ensure agent belongs to message server
Self-message check	validateNotSelfMessage	Prevent agent from processing own messages
World/Room setup	ensureWorldAndRoomExist	Create agent-perspective containers
Entity creation	ensureAuthorEntityExists	Register message author
Memory creation	createAgentMemory	Store message in agent memory

Sources: 
packages/cli/src/server/services/message.ts
145-275
 
packages/cli/src/server/services/message.ts
320-390

WebSocket Event Types
Client-to-Server Events

The system defines specific event types for client-server communication:

Event Payload

Client Events

SEND_MESSAGE

ROOM_JOINING

message

subscribe_logs

{ message, senderId, channelId, attachments }

{ channelId, userId }

{ agentName?, level? }

Server-to-Client Events

Response events broadcast from server to connected clients:

Event Data

Server Events

messageBroadcast

messageComplete

controlMessage

messageDeleted

channelCleared

logStream

{ senderId, text, channelId, createdAt }

{ channelId, agentId }

{ action, channelId }

{ messageId, channelId }

{ channelId }

{ level, time, msg, agentId }

Sources: 
packages/client/src/lib/socketio-manager.ts
8-70
 
packages/cli/src/server/socketio/index.ts
70-150

Real-time Features
Message Broadcasting

When an agent generates a response, it's broadcast to all clients subscribed to the channel:

"Connected Clients"
"Socket.IO Server"
"Response Callback"
"Agent Runtime"
"Connected Clients"
"Socket.IO Server"
"Response Callback"
"Agent Runtime"
Generate response content
Emit 'messageBroadcast'
Broadcast to channel
Emit 'messageComplete'
Emit 'controlMessage' (enable_input)
Live Log Streaming

The system supports real-time log streaming for debugging and monitoring:

Client Subscription

Log Stream Setup

Logger Hook

Write Method Override

Socket Broadcast

subscribe_logs event

{ agentName?, level? }

logStream events

Sources: 
packages/cli/src/server/api/index.ts
444-480
 
packages/cli/src/server/socketio/index.ts
70-120

Connection Management

The client-side SocketIOManager handles connection lifecycle and automatic reconnection:

connect()

Connection Success

Connection Failed

Network Error

Connection Lost

Reconnection Success

Max Retries Exceeded

Disconnected

Connecting

Active WebSocket
Channel Subscriptions
Event Handling

Reconnecting

Sources: 
packages/client/src/lib/socketio-manager.ts
280-350
 
packages/client/src/lib/socketio-manager.ts
400-500
