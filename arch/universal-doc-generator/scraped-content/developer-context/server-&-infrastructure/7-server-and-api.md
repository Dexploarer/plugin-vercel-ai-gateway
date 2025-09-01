# Server and API | elizaOS/eliza | DeepWiki

**URL:** https://deepwiki.com/elizaOS/eliza/7-server-and-api
**Category:** Server & Infrastructure
**Context:** Developer Context
**Scraped:** 2025-08-31T23:20:19.544Z

---

Server and API
Relevant source files

This page documents the ElizaOS backend server architecture and API endpoints. The server is built around the AgentServer class which provides HTTP/WebSocket endpoints, manages agent lifecycles, handles real-time messaging via Socket.IO, and coordinates inter-agent communication through an internal message bus.

Key server components include RESTful APIs for agent management, a unified Sessions API for simplified messaging, real-time communication via Socket.IO, secure file upload handling, and a centralized message bus for agent coordination.

For core runtime and agent orchestration details, see AgentRuntime. For client interfaces and web UI integration, see Client Interfaces. For plugin system extension points, see Plugin System.

Server Architecture Overview

The ElizaOS server is built around the AgentServer class from 
packages/server/src/index.ts
 which orchestrates multiple agent runtimes, provides HTTP/WebSocket endpoints, and manages inter-agent communication through internalMessageBus.

Data & File Handling

Real-time Communication

API Router System

Agent Management

AgentServer Core

AgentServer

this.app: express.Application

this.socketIO: SocketIOServer

this.server: http.Server

this.database: DatabaseAdapter

agents: Map

registerAgent()

startAgent()

stopAgent()

loadCharacterTryPath()

createApiRouter()

agentsRouter()

messagingRouter()

mediaRouter()

audioRouter()

createPluginRouteHandler()

internalMessageBus

setupSocketIO()

MessageBusService

createSessionsRouter()

BaseDrizzleAdapter

createDatabaseAdapter()

multer middleware

/.eliza/data/uploads/

Sources: 
packages/server/src/index.ts
143-891
 
packages/server/src/api/index.ts
1-451
 
packages/server/src/services/message.ts
32-818

AgentServer Core Class

The AgentServer class serves as the central orchestrator for the ElizaOS server infrastructure, managing agent lifecycles, database connections, and HTTP/WebSocket services.

Server Initialization and Configuration

Socket.IO Setup

Express Configuration

Database Setup

Initialization Flow

AgentServer()

initialize(options)

initializeServer(options)

start(port)

createDatabaseAdapter()

DatabaseMigrationService

ensureDefaultServer()

helmet() security

cors() middleware

API rate limiting

express.json()

static file serving

http.createServer()

setupSocketIO()

SocketIORouter

The server initialization process handles database setup, security configuration, and service orchestration:

Component	Configuration	Purpose
helmet()	Environment-aware CSP	Security headers and content policies
cors()	Configurable origins	Cross-origin request handling
Rate limiting	API-specific limits	Request throttling and abuse prevention
Database	PostgreSQL/PGLite	Agent data and message persistence
Socket.IO	Real-time messaging	Live chat and event broadcasting

Sources: 
packages/server/src/index.ts
163-223
 
packages/server/src/index.ts
307-662

Agent Registration and Management

Server Association

Plugin Registration

Agent Lifecycle

registerAgent(runtime)

agents: Map

unregisterAgent(agentId)

messageBusConnectorPlugin

phala-tee-plugin

Plugin Actions/Providers

DEFAULT_SERVER_ID

addAgentToServer()

Server-Agent Mapping

Sources: 
packages/server/src/index.ts
671-734
 
packages/server/src/index.ts
742-773

API Router System

The API system is organized into domain-specific routers that handle different aspects of agent functionality and server management. The routing system is defined in createApiRouter() from 
packages/server/src/api/index.ts

Router Hierarchy and Mounting

Plugin Route Handler

Messaging Subsystem

Domain-Specific Routers

Main API Router

createApiRouter()

securityMiddleware()

createApiRateLimit()

/media - mediaRouter()

/agents - agentsRouter()

/messaging - messagingRouter()

/memory - memoryRouter()

/audio - audioRouter()

/server - runtimeRouter()

/system - systemRouter()

/tee - teeRouter()

createSessionsRouter()

createChannelsRouter()

createServersRouter()

createMessagingCoreRouter()

createPluginRouteHandler()

runtime.routes[]

Global plugin routes

Core API Endpoints
Router	Mount Point	Key Endpoints	Purpose
agentsRouter()	/api/agents	GET /:agentId, POST /, DELETE /:agentId	Agent CRUD operations
messagingRouter()	/api/messaging	/sessions, /central-channels, /submit	Message and channel management
mediaRouter()	/api/media	/agents/:agentId/upload-media	File upload handling
audioRouter()	/api/audio	/:agentId/transcriptions, /:agentId/speech/generate	Audio processing
memoryRouter()	/api/memory	/:agentId/memories, /:agentId/rooms	Memory and room management

Sources: 
packages/server/src/api/index.ts
125-451
 
packages/server/src/api/messaging/index.ts
9-35

Plugin Route Resolution

The createPluginRouteHandler() provides dynamic routing for agent-specific and global plugin endpoints:

Global Plugin Routing

Agent-Specific Route Matching

Plugin Route Resolution

req: express.Request

Skip /api/agents routes

req.query.agentId?

validateUuid(agentId)

agents.get(agentId)

runtime.routes[]

route.method.toLowerCase()

pathToRegexp.match()

route.path.endsWith('/*')

reqPath === routePath

for (const runtime of agents.values())

!routePath.includes(':')

Global /* routes

Global exact routes

Sources: 
packages/server/src/api/index.ts
99-350
 
packages/server/src/api/index.ts
358-450

Real-time Communication

The server implements real-time communication through Socket.IO for live messaging, event broadcasting, and log streaming via the setupSocketIO() function.

Socket.IO Architecture

Message Bus Integration

Real-time Log Streaming

Socket Event Handlers

Socket.IO Server Setup

setupSocketIO()

new SocketIOServer(server)

CORS configuration

SocketIORouter class

socket.on('joinChannel')

socket.on('leaveChannel')

socket.on('sendMessage')

'messageBroadcast' emit

'messageComplete' emit

logger destination hook

originalWrite method

broadcastLog()

io.emit('log', logData)

internalMessageBus

'new_message' handler

'message_deleted' handler

'channel_cleared' handler

Sources: 
packages/server/src/api/index.ts
36-96

Message Bus and Inter-Service Communication

The internal message bus enables coordination between agents, external platforms, and the web interface through a centralized event system implemented in internalMessageBus from 
packages/server/src/bus.ts

MessageBusService Architecture

Message Processing Pipeline

MessageBusService Class

Message Sources

Message Bus Core

internalMessageBus (EventEmitter)

'new_message' event

'message_deleted' event

'channel_cleared' event

'server_agent_update' event

serverInstance.createMessage()

POST /central-channels/:channelId/messages

POST /api/messaging/submit

sendAgentResponseToBus()

MessageBusService constructor

connectToMessageBus()

handleIncomingMessage()

handleMessageDeleted()

handleChannelCleared()

handleServerAgentUpdate()

validateServerSubscription()

validateNotSelfMessage()

ensureWorldAndRoomExist()

ensureAuthorEntityExists()

createAgentMemory()

runtime.emitEvent(EventType.MESSAGE_RECEIVED)

MessageBusService Integration

Each agent runtime automatically registers a MessageBusService that connects to the internal message bus:

Method	Purpose	Event Handling
handleIncomingMessage()	Process new messages from bus	Validates participation, creates agent memory, emits EventType.MESSAGE_RECEIVED
handleMessageDeleted()	Handle message deletions	Finds corresponding agent memory, emits EventType.MESSAGE_DELETED
handleChannelCleared()	Handle bulk channel clearing	Bulk memory deletion via EventType.CHANNEL_CLEARED
handleServerAgentUpdate()	Server membership changes	Updates subscribedServers and refreshes channel subscriptions
sendAgentResponseToBus()	Send agent responses back	Sends agent responses to central server via /api/messaging/submit

Sources: 
packages/server/src/services/message.ts
32-818
 
packages/server/src/index.ts
910-925

Sessions API

The server provides a unified Sessions API for simplified messaging, abstracting away the complexity of servers and channels for basic use cases. This is implemented in createSessionsRouter() from 
packages/server/src/api/messaging/sessions.ts

Session Management Architecture

Timeout & Renewal System

Channel Abstraction Layer

Session Management

Sessions API Endpoints

POST /api/messaging/sessions

GET /api/messaging/sessions/:sessionId

POST /api/messaging/sessions/:sessionId/messages

GET /api/messaging/sessions/:sessionId/messages

GET /api/messaging/sessions/health

sessions: Map

CreateSessionRequest interface

SessionTimeoutConfig interface

renewSession()

calculateExpirationDate()

serverInstance.createChannel()

serverInstance.addParticipantsToChannel()

serverInstance.createMessage()

serverInstance.getMessagesForChannel()

DEFAULT_TIMEOUT_MINUTES

MAX_TIMEOUT_MINUTES

timeoutConfig.autoRenew

timeoutConfig.maxDurationMinutes

shouldWarnAboutExpiration()

Session Configuration and Timeout

The Sessions API supports configurable timeouts and auto-renewal:

Configuration	Environment Variable	Default	Purpose
Default timeout	SESSION_DEFAULT_TIMEOUT_MINUTES	30 min	Session expiration time
Min timeout	SESSION_MIN_TIMEOUT_MINUTES	5 min	Minimum allowed timeout
Max timeout	SESSION_MAX_TIMEOUT_MINUTES	1440 min (24h)	Maximum allowed timeout
Max duration	SESSION_MAX_DURATION_MINUTES	720 min (12h)	Total session lifetime
Warning threshold	SESSION_WARNING_THRESHOLD_MINUTES	5 min	Warning before expiration

Sources: 
packages/server/src/api/messaging/sessions.ts
84-112
 
packages/server/src/api/messaging/sessions.ts
512-891

File Upload and Media Handling

The server provides secure file upload capabilities for both agent-specific and channel-specific media through dedicated API endpoints using multer middleware for processing.

Upload System Architecture

Static File Serving

File Processing Pipeline

Upload API Endpoints

Upload Configuration

multer.memoryStorage()

ALLOWED_MEDIA_MIME_TYPES

MAX_FILE_SIZE

createUploadRateLimit()

/api/media/agents/:agentId/upload-media

/api/media/channels/:channelId/upload-media

/api/audio/:agentId/transcriptions

validateMediaFile()

saveAgentUploadedFile()

saveChannelUploadedFile()

generateSecureFilename()

/media/uploads/agents/:agentId/:filename

/media/uploads/channels/:channelId/:filename

/media/generated/:agentId/:filename

Path traversal validation

UUID format validation

File Security Implementation

The upload system implements multiple security layers defined in 
packages/server/src/api/shared/constants.ts
 and 
packages/server/src/api/shared/file-utils.ts
:

Security Layer	Implementation	Purpose
MIME type filtering	ALLOWED_MEDIA_MIME_TYPES array	Restrict to safe file types
Size limiting	MAX_FILE_SIZE constant	Prevent resource exhaustion
Path validation	cleanupUploadedFile()	Prevent path traversal attacks
Filename sanitization	generateSecureFilename()	Remove dangerous characters
UUID validation	validateUuid() checks	Ensure valid agent/channel IDs
Rate limiting	createUploadRateLimit()	Prevent upload abuse
Directory isolation	Agent/channel-specific dirs	Isolate uploaded files

Sources: 
packages/server/src/api/media/agents.ts
1-110
 
packages/server/src/api/messaging/channels.ts
23-64
 
packages/server/src/api/shared/constants.ts
 
packages/server/src/api/shared/file-utils.ts
1-97

Security and Middleware

The server implements comprehensive security measures through middleware configuration, authentication, and request validation.

Security Middleware Stack

Environment Awareness

Security Headers

Request Validation

CORS configuration

express-rate-limit

Body size limits

Content-Type validation

Authentication

X-API-KEY header

ELIZA_SERVER_AUTH_TOKEN

apiKeyAuthMiddleware()

helmet() middleware

Content Security Policy

HTTP Strict Transport Security

X-XSS-Protection

X-Content-Type-Options: nosniff

NODE_ENV === 'production'

Development mode

upgrade-insecure-requests

Safari compatibility

Environment-Specific Configuration

The server adapts its security configuration based on the deployment environment:

Production Environment:

Strict Content Security Policy with upgrade-insecure-requests
HSTS with 1-year max-age and subdomain inclusion
Cross-origin resource policy enforcement

Development Environment:

Relaxed CSP without upgrade-insecure-requests for Safari compatibility
HTTP/HTTPS mixed content support
Enhanced debugging and logging

Sources: 
packages/server/src/index.ts
313-382
 
packages/server/src/authMiddleware.ts
