# Client Interfaces | elizaOS/eliza | DeepWiki

**URL:** https://deepwiki.com/elizaOS/eliza/4-client-interfaces
**Category:** User Interface
**Context:** User Context
**Scraped:** 2025-08-31T23:21:02.950Z

---

Client Interfaces
Relevant source files

This document covers the user-facing client interfaces in ElizaOS, including the web application, chat systems, agent management interfaces, and real-time communication infrastructure. These interfaces provide the primary means for users to interact with AI agents, manage configurations, and monitor system activity.

For information about the core agent runtime and plugin systems, see Core System. For details about the CLI interface, see CLI System. For backend API implementation, see Server and API.

Architecture Overview

The ElizaOS client system is built as a React-based single-page application with real-time communication capabilities. The architecture separates concerns between UI components, data management, and communication layers.

Client System Architecture

Backend Services

Communication Layer

Core Components

React Application

App.tsx
Main Application

React Router
Navigation

TanStack Query
Data Management

AppSidebar
Navigation & Agent List

Chat Component
Message Interface

AgentCreator
Agent Configuration

Home
Dashboard

apiClient
HTTP API Client

SocketIOManager
Real-time Communication

AgentRuntime
Core Engine

WebSocket Server
Real-time Events

HTTP API
REST Endpoints

Sources: 
packages/client/src/App.tsx
1-219
 
packages/client/src/lib/api.ts
1-611
 
packages/client/src/lib/socketio-manager.ts
1-554

Component Hierarchy

Chat Components

Routes

App
Main Application Container

SidebarProvider
Layout Management

AppSidebar
Navigation & Agent List

SidebarInset
Main Content Area

Home
Dashboard

Chat Route
Agent Communication

Agent Creator
Configuration

Group Channel
Multi-agent Chat

Settings
System Configuration

Chat
Main Chat Interface

ChatInputArea
Message Input

ChatMessageListComponent
Message Display

AgentSidebar
Agent Details

Sources: 
packages/client/src/App.tsx
74-194
 
packages/client/src/components/app-sidebar.tsx
1-625
 
packages/client/src/components/chat.tsx
1-1340

Web Interface

The web interface is implemented as a React application using modern patterns including hooks, context providers, and component composition. The interface supports both desktop and mobile layouts with responsive design.

Main Application Structure

The application entry point is App.tsx, which sets up providers and routing:

QueryClientProvider: Manages server state and caching using TanStack Query
BrowserRouter: Handles client-side routing
AuthProvider: Manages authentication state
ConnectionProvider: Tracks server connectivity
SidebarProvider: Controls sidebar visibility and responsive behavior

Key configuration includes query client settings with retry logic, stale time management, and background refetching capabilities.

Sources: 
packages/client/src/App.tsx
32-72
 
packages/client/src/App.tsx
98-194

Responsive Layout System

The interface uses a sidebar-based layout that adapts to different screen sizes:

Mobile Layout

Sheet Trigger
Hamburger Menu

Sheet Content
Overlay Sidebar

Full Width Content
Main Area

Desktop Layout

AppSidebar
Fixed Left Panel

SidebarInset
Main Content

The layout switches between fixed sidebar (desktop) and sheet overlay (mobile) based on screen width detection.

Sources: 
packages/client/src/App.tsx
100-120
 
packages/client/src/components/app-sidebar.tsx
492-501

Navigation and Sidebar

The AppSidebar component provides primary navigation with sections for:

Agents: List of available agents with status indicators
Groups: Group chat channels organized by server
System Links: Documentation, logs, and settings

Each section includes create buttons for adding new agents or groups, with real-time status updates and optimistic UI updates.

Sources: 
packages/client/src/components/app-sidebar.tsx
438-595
 
packages/client/src/components/app-sidebar.tsx
149-170

Chat System

The chat system enables real-time communication between users and AI agents through both direct messages (DM) and group channels. It supports text messages, file attachments, and rich media content.

Chat Component Architecture

Communication

Message Management

Chat Interface

Chat
Main Controller

Chat Header
Agent Info & Controls

ChatMessageListComponent
Message Display

ChatInputArea
Message Input

AgentSidebar
Agent Details

useChannelMessages
Message State Hook

useSocketChat
Real-time Events

transformServerMessageToUiMessage
Data Transformation

SocketIOManager
WebSocket Client

apiClient
HTTP Client

Sources: 
packages/client/src/components/chat.tsx
257-995
 
packages/client/src/hooks/use-query-hooks.ts
300-533
 
packages/client/src/hooks/use-socket-chat.ts
1-247

Message Flow

The chat system handles both outgoing and incoming messages with optimistic updates:

Agent
Server
SocketIOManager
useSocketChat
ChatComponent
User
Agent
Server
SocketIOManager
useSocketChat
ChatComponent
User
Send Message
handleSendMessage()
Add Optimistic UI Message
sendMessage()
WebSocket Message
Process Message
Generate Response
messageBroadcast Event
Handle Broadcast
Update Message State
Display Agent Response

Sources: 
packages/client/src/hooks/use-socket-chat.ts
47-84
 
packages/client/src/components/chat.tsx
735-873

Message Types and Content

The system supports multiple message types with rich content:

Text Messages: Markdown-formatted text with animated rendering for agent responses
File Attachments: Images, videos, and documents with upload progress
Media URLs: Automatic parsing and display of media links in text
Agent Thoughts: Collapsible display of agent reasoning process
Actions: Display of actions taken by agents during message generation

Sources: 
packages/client/src/components/chat.tsx
122-255
 
packages/client/src/components/ChatMessageListComponent.tsx
1-141

Channel Management

The chat system supports two channel types:

DM Channels: Direct communication with individual agents
Group Channels: Multi-agent conversations with selective display

DM channels are automatically created when needed, while group channels require explicit creation through the group management interface.

Sources: 
packages/client/src/components/chat.tsx
388-576
 
packages/client/src/hooks/use-query-hooks.ts
535-540

Agent Management

The agent management interface provides comprehensive tools for creating, configuring, and monitoring AI agents. This includes both dashboard views and detailed configuration panels.

Agent Dashboard

The Home component serves as the main dashboard, displaying:

Agent Cards: Visual representation of each agent with status indicators
Quick Actions: Start, stop, message, and configure agents
Group Cards: Available group channels
Creation Controls: Add new agents and groups

Data Sources

Agent Operations

Dashboard Components

Home
Main Dashboard

AgentCard
Agent Display

AddAgentCard
Creation Prompt

GroupCard
Group Display

useAgentManagement
Agent Control Hook

useStartAgent
Mutation Hook

useStopAgent
Mutation Hook

useAgentsWithDetails
Agent List Query

useServers
Server List Query

useChannels
Channel List Query

Sources: 
packages/client/src/routes/home.tsx
23-171
 
packages/client/src/hooks/use-query-hooks.ts
179-278

Agent Creation and Configuration

The agent creation process uses a multi-step interface:

Character Selection: Choose from predefined characters or upload custom JSON
Basic Configuration: Name, description, and core settings
Advanced Settings: Model selection, plugins, and behavior parameters
Deployment: Start the agent and configure initial state

The AgentCreator component handles this workflow with validation and error handling.

Sources: 
packages/client/src/components/agent-creator.tsx
 (referenced but not in provided files)

Agent Details and Monitoring

The AgentSidebar provides detailed agent information through tabbed interface:

Details: Agent configuration and settings
Actions: Recent agent actions and decision logs
Memories: Conversation history and knowledge base
Logs: System logs filtered by agent
Custom Panels: Plugin-provided interfaces

Data Hooks

Agent Sidebar Tabs

AgentSidebar
Tab Container

AgentSettings
Configuration

AgentActionViewer
Action History

AgentMemoryViewer
Memory Browser

AgentLogViewer
System Logs

Dynamic Panels
Plugin Interfaces

useAgent
Agent Details

useAgentPanels
Plugin Panels

useAgentActions
Action History

useAgentMemories
Memory Data

Sources: 
packages/client/src/components/agent-sidebar.tsx
22-178
 
packages/client/src/components/agent-memory-viewer.tsx
51-478
 
packages/client/src/components/agent-action-viewer.tsx
80-615

Real-time Communication

Real-time communication is handled through WebSocket connections using Socket.io. The system provides reliable message delivery, connection management, and event handling.

WebSocket Manager

The SocketIOManager implements a singleton pattern for WebSocket communication:

Client Components

Event Types

SocketIOManager

getInstance()
Singleton Access

initialize()
Connection Setup

joinChannel()
Room Management

sendMessage()
Message Dispatch

Event Handlers
Message Processing

messageBroadcast
New Messages

messageComplete
Agent Finished

controlMessage
UI State Control

messageDeleted
Message Removal

channelCleared
Channel Reset

useSocketChat
React Hook

Chat Components
UI Integration

Sources: 
packages/client/src/lib/socketio-manager.ts
143-554
 
packages/client/src/hooks/use-socket-chat.ts
30-247

Connection Management

The WebSocket system handles connection lifecycle with automatic reconnection:

Initialization: Establishes connection with client entity ID
Channel Management: Joins/leaves channels based on UI navigation
Reconnection: Automatic reconnection with exponential backoff
Error Handling: Connection failures and unauthorized access

The system tracks active channels to ensure messages are only processed for relevant conversations.

Sources: 
packages/client/src/lib/socketio-manager.ts
205-245
 
packages/client/src/lib/socketio-manager.ts
196-199

Event Processing

WebSocket events are processed through a structured event system:

Event Flow

Server
WebSocket Events

SocketIOManager
Event Processing

EventAdapter
Event Distribution

React Hooks
State Updates

UI Components
Visual Updates

Events include message broadcasts, control messages for UI state, and administrative actions like message deletion or channel clearing.

Sources: 
packages/client/src/lib/socketio-manager.ts
74-136
 
packages/client/src/lib/socketio-manager.ts
251-554

API Integration

The client communicates with the backend through a comprehensive HTTP API client that handles authentication, error handling, and data transformation.

API Client Structure

The apiClient object provides methods organized by functional area:

React Query Integration

HTTP Infrastructure

API Client Methods

Agent Operations
getAgents, startAgent, stopAgent

Message System
getChannelMessages, postMessage

Channel Management
createChannel, updateChannel

Media Upload
uploadAgentMedia, uploadKnowledge

System Operations
ping, getLogs, updateEnv

fetcher()
Core HTTP Function

Error Processing
Status Code Handling

API Key
Header Management

useQuery Hooks
Data Fetching

useMutation Hooks
Data Updates

QueryClient
Cache Management

Sources: 
packages/client/src/lib/api.ts
200-611
 
packages/client/src/lib/api.ts
65-198

Request Processing

The core fetcher function handles all HTTP communication with standardized processing:

URL Normalization: Adds API prefix and handles relative paths
Authentication: Injects API keys from local storage
Content Type Handling: Supports JSON, FormData, and binary responses
Error Processing: Converts HTTP errors to user-friendly messages
Timeout Management: Configurable timeouts for different operation types

Sources: 
packages/client/src/lib/api.ts
65-198

Data Hooks Integration

The API client integrates with React Query through custom hooks that provide:

Caching: Intelligent caching with configurable stale times
Background Updates: Automatic refetching and real-time updates
Optimistic Updates: Immediate UI updates with rollback on failure
Error Handling: Consistent error reporting and retry logic
Loading States: Granular loading indicators for different operations

Sources: 
packages/client/src/hooks/use-query-hooks.ts
123-278
 
packages/client/src/hooks/use-query-hooks.ts
66-72
