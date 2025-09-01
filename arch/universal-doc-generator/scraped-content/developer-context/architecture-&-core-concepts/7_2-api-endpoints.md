# API Endpoints | elizaOS/eliza | DeepWiki

**URL:** https://deepwiki.com/elizaOS/eliza/7.2-api-endpoints
**Category:** Architecture & Core Concepts
**Context:** Developer Context
**Scraped:** 2025-08-31T23:19:25.849Z

---

API Endpoints
Relevant source files

This document provides a comprehensive reference for the ElizaOS server REST API endpoints. The API enables external clients to interact with agents, manage messaging sessions, process audio, and handle system operations. For information about the server architecture and Socket.IO real-time communication, see Server Architecture.

API Architecture

The ElizaOS API is structured as a hierarchical REST API with several major endpoint categories mounted under /api. The main router delegates to specialized sub-routers that handle specific functionality domains.

Sources: 
packages/server/src/index.ts
775-795
 
packages/server/src/api/index.ts
18

Request Processing Flow

The API follows a consistent request processing pattern with middleware for validation, authentication, and error handling.

Sources: 
packages/server/src/index.ts
441-452
 
packages/server/src/api/shared/middleware.ts
 
packages/server/src/api/messaging/errors/SessionErrors.ts
258-297

Authentication

API authentication is optional but recommended for production deployments. When ELIZA_SERVER_AUTH_TOKEN environment variable is set, all /api routes require the X-API-KEY header.

Header	Required	Description
X-API-KEY	Conditional	Required when ELIZA_SERVER_AUTH_TOKEN is configured
Content-Type	Yes	Must be application/json for POST/PATCH requests

Sources: 
packages/server/src/index.ts
441-452
 
packages/server/src/authMiddleware.ts

Messaging API

The messaging API provides two interfaces: a simplified sessions API for basic messaging and a comprehensive channels/servers API for advanced messaging scenarios.

Sessions API

The sessions API abstracts messaging complexity by automatically managing channels and servers behind a simple session concept.

Method	Endpoint	Description
POST	/api/messaging/sessions	Create new messaging session
GET	/api/messaging/sessions/:sessionId	Get session details
POST	/api/messaging/sessions/:sessionId/messages	Send message in session
GET	/api/messaging/sessions/:sessionId/messages	Retrieve session messages
GET	/api/messaging/sessions/health	Health check for sessions
Create Session
POST /api/messaging/sessions
Content-Type: application/json

{
  "agentId": "123e4567-e89b-12d3-a456-426614174000",
  "userId": "456e7890-e89b-12d3-a456-426614174000",
  "metadata": {
    "platform": "web",
    "userPlan": "premium"
  },
  "timeoutConfig": {
    "timeoutMinutes": 60,
    "autoRenew": true,
    "maxDurationMinutes": 1440
  }
}
Send Message
POST /api/messaging/sessions/{sessionId}/messages
Content-Type: application/json

{
  "content": "Hello, how can you help me?",
  "attachments": [],
  "metadata": {
    "messageType": "user_query"
  }
}

Sources: 
packages/server/src/api/messaging/sessions.ts
562-657
 
packages/server/src/api/messaging/sessions.ts
688-803

Channels API

The channels API provides direct access to the underlying messaging infrastructure for complex scenarios requiring server and channel management.

Method	Endpoint	Description
POST	/api/messaging/central-channels/:channelId/messages	Post message to channel
GET	/api/messaging/central-channels/:channelId/messages	Get channel messages
GET	/api/messaging/central-servers/:serverId/channels	List server channels
POST	/api/messaging/channels	Create new channel
GET	/api/messaging/dm-channel	Get/create DM channel

Sources: 
packages/server/src/api/messaging/channels.ts
76-267
 
packages/server/src/api/messaging/channels.ts
270-313

Agents API

The agents API handles agent lifecycle management, configuration, and operational data.

Agent Management
Method	Endpoint	Description
GET	/api/agents	List all agents
POST	/api/agents	Create new agent
GET	/api/agents/:agentId	Get agent details
PATCH	/api/agents/:agentId	Update agent
DELETE	/api/agents/:agentId	Delete agent
Agent Operations
Method	Endpoint	Description
POST	/api/agents/:agentId/start	Start agent
POST	/api/agents/:agentId/stop	Stop agent
GET	/api/agents/:agentId/panels	Get agent UI panels
GET	/api/agents/:agentId/logs	Get agent logs
DELETE	/api/agents/:agentId/logs/:logId	Delete specific log
World Management
Method	Endpoint	Description
GET	/api/agents/worlds	List all worlds
POST	/api/agents/:agentId/worlds	Create world for agent
PATCH	/api/agents/:agentId/worlds/:worldId	Update world

Sources: 
packages/server/src/api/agents/panels.ts
13-44
 
packages/server/src/api/agents/logs.ts
13-82
 
packages/server/src/api/agents/worlds.ts
13-136

Audio API

The audio API enables speech-to-text transcription, text-to-speech synthesis, and conversational audio interactions.

Speech Processing
Method	Endpoint	Description
POST	/api/audio/:agentId/audio-messages/synthesize	Text-to-speech synthesis
POST	/api/audio/:agentId/speech/generate	Generate speech from text
POST	/api/audio/:agentId/speech/conversation	Full speech conversation
POST	/api/audio/:agentId/audio-messages	Upload and transcribe audio
Text-to-Speech
POST /api/audio/{agentId}/speech/generate
Content-Type: application/json

{
  "text": "Hello, this is a test of speech synthesis."
}

Response: Audio file (WAV/MP3) with appropriate Content-Type header.

Speech Conversation
POST /api/audio/{agentId}/speech/conversation
Content-Type: application/json

{
  "text": "What's the weather like today?",
  "roomId": "room-123",
  "entityId": "user-456",
  "userName": "John"
}

Sources: 
packages/server/src/api/audio/synthesis.ts
14-99
 
packages/server/src/api/audio/conversation.ts
22-156

Memory API

The memory API provides access to agent memory systems for storing and retrieving conversational context and knowledge.

Memory Operations
Method	Endpoint	Description
GET	/api/memory/:agentId/memories	Get agent memories
POST	/api/memory/:agentId/memories	Create new memory
DELETE	/api/memory/:agentId/memories/:memoryId	Delete specific memory
GET	/api/memory/:agentId/rooms	List agent rooms
GET	/api/memory/:agentId/rooms/:roomId	Get room details

Sources: 
packages/server/src/api/agents/index.ts
37-39

Error Handling

The API uses consistent error response formats with structured error codes and detailed error information.

Common Error Codes
Code	Status	Description
AGENT_NOT_FOUND	404	Specified agent does not exist
SESSION_NOT_FOUND	404	Messaging session not found
SESSION_EXPIRED	410	Session has expired
VALIDATION_ERROR	400	Request validation failed
INVALID_ID	400	Invalid UUID format
RATE_LIMIT_EXCEEDED	429	Rate limit exceeded
INTERNAL_SERVER_ERROR	500	Unexpected server error
Error Response Format
{
  "success": false,
  "error": {
    "code": "SESSION_NOT_FOUND",
    "message": "Session with ID 'abc123' not found",
    "timestamp": "2023-12-01T10:30:00.000Z",
    "details": {
      "sessionId": "abc123"
    }
  }
}

Sources: 
packages/server/src/api/messaging/errors/SessionErrors.ts
8-44
 
packages/server/src/api/messaging/errors/SessionErrors.ts
258-297

Request/Response Data Models
Session Types

The sessions API uses several key data structures for managing messaging sessions.

Message Types

The messaging system uses structured message types for internal bus communication and API responses.

Sources: 
packages/server/src/types/sessions.ts
30-50
 
packages/server/src/types.ts
26-54
