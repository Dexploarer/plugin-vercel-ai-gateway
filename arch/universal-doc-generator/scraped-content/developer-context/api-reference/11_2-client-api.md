# Client API | elizaOS/eliza | DeepWiki

**URL:** https://deepwiki.com/elizaOS/eliza/11.2-client-api
**Category:** API Reference
**Context:** Developer Context
**Scraped:** 2025-08-31T23:19:55.064Z

---

Client API
Relevant source files

This document covers the client-side API system for the ElizaOS web interface, including HTTP REST endpoints, real-time Socket.IO communication, React Query integration, and component data patterns. For server-side API implementation details, see Core API. For command-line interface APIs, see CLI API.

Architecture Overview

The ElizaOS client API system provides a comprehensive interface for web applications to interact with agent runtimes, manage data, and maintain real-time communication. The architecture consists of three main layers: the HTTP REST client, React Query hooks for state management, and Socket.IO for real-time messaging.

Client API Architecture

Backend Services

Network Layer

Data Layer

React Components

Chat Component

AgentCard

Home Page

Settings Panel

React Query Hooks
useAgent, useChannelMessages

apiClient
HTTP REST Client

SocketIO Manager
Real-time Communication

/api/* endpoints
Express Router

Socket.IO Server
WebSocket Events

MessageBusService
Internal Routing

AgentRuntime
Agent Processing

DatabaseAdapter
Persistent Storage

File System
Media Storage

Sources: 
packages/client/src/lib/api.ts
 
packages/client/src/hooks/use-query-hooks.ts
 
packages/client/src/components/chat.tsx
 
packages/cli/src/server/api/index.ts

HTTP REST Client

The createElizaClient() function provides a centralized interface for all HTTP communications with the ElizaOS server. It returns a client object with organized API methods for different system domains.

ElizaClient Structure

Infrastructure

elizaClient Structure

agents
listAgents, getAgent
startAgent, stopAgent

messaging
getChannelMessages
createGroupChannel

memory
getAgentMemories
updateMemory

system
getGlobalLogs
updateEnvSettings

createElizaClient()
Client Factory

HTTP Configuration
Base URL, Headers

Error Handling
Network, Response Validation

The client organizes operations into logical domains with consistent response patterns:

Domain	Key Methods	Response Format	Error Handling
Agent Management	listAgents(), getAgent(), startAgent(), stopAgent()	{ data: T }	Status code validation
Messaging	getChannelMessages(), createGroupChannel(), deleteChannel()	{ data: T }	Channel validation
Memory Operations	getAgentMemories(), updateMemory(), deleteMemory()	{ memories: T[] }	UUID validation
System Operations	getGlobalLogs(), updateEnvSettings()	{ logs: T[], levels: string[] }	Configuration validation

Sources: 
packages/client/src/lib/api-client-config.ts
 
packages/client/src/components/chat.tsx
33

Agent Management Operations

The agent domain provides comprehensive lifecycle management with status tracking and runtime control:

// Core agent operations from elizaClient.agents
const elizaClient = createElizaClient();
await elizaClient.agents.listAgents(); // Get all agents with status
await elizaClient.agents.getAgent(agentId); // Get specific agent details
await elizaClient.agents.startAgent(agentId); // Start agent runtime
await elizaClient.agents.stopAgent(agentId); // Stop agent runtime

Sources: 
packages/client/src/hooks/use-query-hooks.ts
132-134
 
packages/client/src/hooks/use-query-hooks.ts
164-166

Messaging System Integration

The messaging domain handles both DM and group chat communications with channel-based architecture:

// Message and channel operations
await elizaClient.messaging.getChannelMessages(channelId, { limit: 30, before: timestamp });
await elizaClient.messaging.createGroupChannel({ name, participantCentralUserIds, type });
await elizaClient.messaging.deleteChannel(channelId);
await elizaClient.messaging.getChannelParticipants(channelId);

Sources: 
packages/client/src/hooks/use-query-hooks.ts
421-424
 
packages/client/src/components/group-panel.tsx
93-99

React Query Integration

The React Query hooks provide optimized data fetching with caching, polling, and error handling. The system implements network-aware polling and manages message state locally for performance.

Data Fetching Hooks

Caching Strategy

Mutation Hooks

Query Hooks

useAgents()
Network-Aware Polling

useAgent(agentId)
Individual Agent Data

useChannelMessages()
Manual State Management

useAgentsWithDetails()
Enhanced Agent Info

useServers()
Server Discovery

useStartAgent()
Optimistic Updates

useStopAgent()
Status Management

useDeleteChannelMessage()
Message Operations

useClearChannelMessages()
Bulk Operations

STALE_TIMES
FREQUENT: 30s
STANDARD: 2m
RARE: 10m

useNetworkStatus()
Connection Detection

Local State + React Query
Manual Message Management

The system implements different caching strategies based on data characteristics:

Hook	Stale Time	Polling Strategy	State Management
useAgents()	30 seconds	Network-aware polling	React Query cache
useAgent(agentId)	30 seconds	Conditional polling	React Query cache
useChannelMessages()	Manual	No polling	Local useState + manual fetch
useAgentsWithDetails()	30 seconds	Background polling	React Query cache
useServers()	2 minutes	No polling	React Query cache

Sources: 
packages/client/src/hooks/use-query-hooks.ts
70-76
 
packages/client/src/hooks/use-query-hooks.ts
127-149
 
packages/client/src/hooks/use-query-hooks.ts
312-544

Message State Management

The useChannelMessages hook implements manual state management for optimal performance with real-time updates:

// Channel messages with manual state management
export function useChannelMessages(channelId: UUID | undefined, serverId?: UUID) {
  const [messages, setMessages] = useState<UiMessage[]>([]);
  const [hasMoreMessages, setHasMoreMessages] = useState<boolean>(true);
  
  const transformServerMessageToUiMessage = useCallback((sm: ServerMessage): UiMessage => {
    // Transform server message format to UI message format
    return {
      id: sm.id,
      text: sm.content,
      name: isAgent ? sm.metadata?.agentName || 'Agent' : USER_NAME,
      senderId: sm.authorId,
      isAgent: isAgent,
      createdAt: timestamp,
      // ... other fields
    };
  }, [currentClientCentralId]);

  const addMessage = useCallback((newMessage: UiMessage) => {
    setMessages(prev => [...prev, newMessage].sort((a, b) => a.createdAt - b.createdAt));
  }, []);
}
Optimistic Updates and Error Handling

The mutation hooks implement optimistic updates with comprehensive error recovery:

// useStartAgent with optimistic updates and error handling
export function useStartAgent() {
  return useMutation({
    mutationFn: async (agentId: UUID) => {
      const result = await elizaClient.agents.startAgent(agentId);
      return { data: { id: agentId, name: 'Agent', status: result.status } };
    },
    onMutate: async (_agentId) => {
      toast({ title: 'Starting Agent', description: 'Initializing agent...' });
    },
    onSuccess: (response, agentId) => {
      queryClient.invalidateQueries({ queryKey: ['agents'] });
      queryClient.invalidateQueries({ queryKey: ['agent', agentId] });
      toast({ title: 'Agent Started', description: `${response?.data?.name} is now running` });
    },
    onError: (error) => {
      const errorMessage = error instanceof Error ? error.message : 'Failed to start agent';
      toast({ title: 'Error Starting Agent', description: errorMessage, variant: 'destructive' });
    }
  });
}

Sources: 
packages/client/src/hooks/use-query-hooks.ts
312-544
 
packages/client/src/hooks/use-query-hooks.ts
190-238

Real-time Communication

The SocketIOManager singleton provides real-time messaging, control messages, and live updates. The system handles channel-based message routing, connection management, and event streaming.

SocketIOManager Architecture

Client Integration

Socket Events

SocketIOManager Singleton

EventAdapter
Evt-based event system

Channel Management
activeChannelIds Set

Event Types
messageBroadcast, controlMessage
messageDeleted, channelCleared

messageBroadcast
Real-time messages

controlMessage
Input enable/disable

messageDeleted
Message removal

channelCleared
Bulk message clearing

logStream
System log streaming

useSocketChat Hook
Message lifecycle

Chat Component
UI updates

AgentLogViewer
Real-time logs

Socket.IO Message Flow
"AgentRuntime"
"Socket.IO Server"
"SocketIOManager"
"useSocketChat"
"Chat Component"
"AgentRuntime"
"Socket.IO Server"
"SocketIOManager"
"useSocketChat"
"Chat Component"
Control messages for input state
sendMessage(text, channelId)
sendMessage(payload)
emit('message', data)
processSocketMessage()
Generate response
Broadcast response
'messageBroadcast' event
onAddMessage(message)
UI update
'controlMessage' event
onInputDisabledChange(disabled)
Disable/enable input

The useSocketChat hook integrates with SocketIOManager for complete message lifecycle management:

// Socket chat integration with SocketIOManager
const { sendMessage, animatedMessageId } = useSocketChat({
  channelId: finalChannelIdForHooks,
  currentUserId: currentClientEntityId,
  contextId,
  chatType,
  allAgents,
  messages,
  onAddMessage: (message: UiMessage) => { addMessage(message); updateChatTitle(); },
  onUpdateMessage: (messageId: string, updates: Partial<UiMessage>) => updateMessage(messageId, updates),
  onDeleteMessage: (messageId: string) => removeMessage(messageId),
  onClearMessages: () => clearMessages(),
  onInputDisabledChange: (disabled: boolean) => updateChatState({ inputDisabled: disabled })
});

Sources: 
packages/client/src/lib/socketio-manager.ts
143-191
 
packages/client/src/hooks/use-socket-chat.ts
30-42
 
packages/client/src/components/chat.tsx
767-791

File Upload and Media Processing

The useFileUpload hook provides comprehensive file handling with validation, compression, and upload management:

Chat Integration

Upload Integration

File Upload Flow

File Selection
handleFileChange()

File Validation
Size, type, count checks

Blob URL Creation
createBlobUrls()

Upload Processing
uploadFiles()

elizaClient.upload
HTTP multipart upload

Server Storage
Media file system

Public URL
Media serving

Optimistic UI
Blob URLs for preview

Message Attachment
Final URLs

Upload Failure
Retry + cleanup

The system handles media processing with optimistic UI updates and cleanup:

// File upload integration in Chat component
const {
  selectedFiles,
  handleFileChange,
  removeFile,
  createBlobUrls,
  uploadFiles,
  cleanupBlobUrls,
  clearFiles
} = useFileUpload({
  agentId: targetAgentData?.id,
  channelId: finalChannelIdForHooks,
  chatType
});

// Optimistic attachment handling in message send
const optimisticAttachments = createBlobUrls(currentSelectedFiles);
const { uploaded, failed, blobUrls } = await uploadFiles(currentSelectedFiles);
cleanupBlobUrls(blobUrls);

Sources: 
packages/client/src/hooks/use-file-upload.ts
 
packages/client/src/components/chat.tsx
794-806
 
packages/client/src/components/chat.tsx
888-902

Component Integration Patterns

ElizaOS components follow consistent patterns for API integration, state management, and real-time updates.

Chat Component Integration

The Chat component demonstrates comprehensive integration with multiple systems and real-time communication:

UI Components

Real-time Integration

Data Hooks Integration

Chat Component State

ChatUIState
showSidebar, input, inputDisabled
selectedGroupAgentId, currentDmChannelId

Message Management
addMessage, updateMessage
removeMessage, clearMessages

Channel Management
DM vs GROUP, contextId
finalChannelIdForHooks

useAgent(agentId)
Target agent data

useChannelMessages()
Message history + local state

useDmChannelsForAgent()
DM channel list

useCreateDmChannel()
Channel creation

useAgentsWithDetails()
All agents for groups

useSocketChat
SocketIOManager integration

useFileUpload
Attachment processing

useAutoScroll
Scroll management

ChatInputArea
Message composition

ChatMessageListComponent
Message rendering

AgentSidebar
Agent details panel

Home Page Component Pattern

The Home component demonstrates the dashboard pattern with tabbed interfaces and agent management:

UI Components

Data Integration

Home Component

Tab Management
activeTab: agents | groups

Agent Operations
handleNavigateToDm, handleCreateGroup

Data Refresh
refreshHomePage callback

useAgentsWithDetails()
All agents with status

useServers()
Group servers

useChannels(serverId)
Server channels

AgentCard
Agent status + actions

GroupCard
Group info + navigation

ServerChannels
Channel discovery

Sources: 
packages/client/src/components/chat.tsx
241-295
 
packages/client/src/routes/home.tsx
21-39
 
packages/client/src/components/agent-card.tsx
15-18

Error Handling Patterns

Components implement consistent error handling with user feedback and graceful degradation:

Error Type	Handling Strategy	User Feedback	Recovery Action
Network Errors	Retry with exponential backoff	Toast notification	Auto-retry
Authentication	Clear invalid tokens	Login prompt	Redirect to auth
Server Errors	Show error message	Error banner	Manual retry
Validation Errors	Form validation	Inline errors	User correction

Sources: 
packages/client/src/lib/api.ts
117-197
 
packages/client/src/context/ConnectionContext.tsx

Connection Management

The ConnectionProvider manages API connection status and provides global error handling:

// Connection status management
const connectionStatusActions = {
  setUnauthorized: (message: string) => { /* Handle auth errors */ },
  setOfflineStatus: (isOffline: boolean) => { /* Handle network errors */ }
};

The system provides visual feedback through the ConnectionErrorBanner component when API connectivity issues occur.

Sources: 
packages/client/src/lib/api.ts
144
 
packages/client/src/components/connection-error-banner.tsx

Media and File Handling

The client API provides comprehensive media upload and management capabilities with automatic compression and format handling.

File Upload System

Usage

Server Processing

Upload Flow

File Input
useFileUpload()

File Validation
Size, type checks

Image Compression
compressImage()

FormData Creation
Multipart upload

uploadAgentMedia()
uploadChannelMedia()

File System Storage
/media/uploads/

Public URL Generation
Media serving

Message Attachments
Chat integration

Agent Avatars
Profile images

Knowledge Documents
Document upload

Sources: 
packages/client/src/hooks/use-file-upload.ts
 
packages/client/src/lib/api.ts
326-333
 
packages/client/src/lib/api.ts
451-465
