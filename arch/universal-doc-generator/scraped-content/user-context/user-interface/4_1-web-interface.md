# Web Interface | elizaOS/eliza | DeepWiki

**URL:** https://deepwiki.com/elizaOS/eliza/4.1-web-interface
**Category:** User Interface
**Context:** User Context
**Scraped:** 2025-08-31T23:21:02.950Z

---

Web Interface
Relevant source files

The Web Interface provides a React-based client application for interacting with ElizaOS agents through a modern web browser. It includes chat interfaces, agent management dashboards, real-time communication features, and administrative tools.

For detailed information about real-time Socket.IO communication, see Real-time Communication. For specific agent configuration interfaces, see Agent Management UI. For Discord, Twitter, and other platform integrations, see Platform Clients.

Application Architecture

The web interface is built as a single-page application using React, TypeScript, and modern web technologies. The application follows a component-based architecture with centralized state management through React Query.

Web Interface System Architecture

UI Framework

Data Layer

Core UI Components

Browser Environment

App.tsx
Main Application

React Router
Navigation

React Query
Data Management

AppSidebar
Navigation & Agent List

Home
Agent Dashboard

Chat
Conversation Interface

ProfileOverlay
Agent Details

use-query-hooks
API Integration

SocketIOManager
Real-time Events

createElizaClient
API Client

shadcn/ui
Component Library

Tailwind CSS
Styling

Radix UI
Headless Components

Sources: 
packages/client/src/App.tsx
1-223
 
packages/client/src/lib/api-client-config.ts
 
packages/client/src/hooks/use-query-hooks.ts
1-50

Main Application Structure

The application entry point is App.tsx, which sets up the core providers and routing structure. The app uses a sidebar layout with different views for agent management, chat, and system administration.

Application Component Hierarchy

Routes

App
QueryClientProvider + AuthProvider

AppContent
Core Application Logic

SidebarProvider + TooltipProvider

AppSidebar
Navigation Menu

SidebarInset
Main Content Area

Sheet Mobile Menu

/ → Home

chat/:agentId → Chat

group/:channelId → GroupChannel

/create → AgentCreator

settings/:agentId → AgentSettings

/logs → AgentLogViewer

Sources: 
packages/client/src/App.tsx
77-198
 
packages/client/src/components/app-sidebar.tsx
1-50

Core Application Setup

The App component establishes the foundational structure:

// Query client with optimized settings
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: STALE_TIMES.STANDARD,
      refetchInterval: false,
      retry: 3,
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000)
    }
  }
});

The AppContent component manages routing and mobile responsiveness with a hamburger menu for smaller screens.

Sources: 
packages/client/src/App.tsx
32-53
 
packages/client/src/App.tsx
107-119

Core UI Components
AppSidebar - Navigation Interface

The AppSidebar provides the main navigation interface, displaying agent lists, group channels, and utility links. It adapts to mobile layouts and maintains state persistence.

Key features:

Agent list with online/offline status indicators
Group channel navigation
Logo and version display
Footer links to documentation, logs, and settings

The sidebar uses the useAgentsWithDetails and useServers hooks to populate agent and group lists dynamically.

Sources: 
packages/client/src/components/app-sidebar.tsx
484-656
 
packages/client/src/components/app-sidebar.tsx
195-224

Home Dashboard

The Home component renders the main dashboard with tabbed views for agents and groups. It displays agent cards with status indicators and provides creation workflows.

export default function Home() {
  const { data: agentsData, isLoading, isError } = useAgentsWithDetails();
  const agents = useMemo(() => agentsData?.agents || [], [agentsData]);
  const activeAgentsCount = agents.filter((a) => a.status === AgentStatus.ACTIVE).length;

The dashboard includes:

Tabbed interface for agents and groups
Agent status counters in tab badges
Grid layout for agent and group cards
Create new agent/group buttons

Sources: 
packages/client/src/routes/home.tsx
21-60
 
packages/client/src/routes/home.tsx
65-115

Chat Interface

The Chat component provides the main conversation interface, supporting both direct messaging with agents and group conversations. It implements a sophisticated message handling system with real-time updates.

Chat Component Architecture

UI Components

Channel Management

Message Handling

Chat State Management

Chat Component
Unified Interface

chatState
UI State Object

useSidebarState
Persistent Sidebar

usePanelWidthState
Resizable Panels

useSocketChat
Real-time Events

useChannelMessages
Message History

useFileUpload
Attachment Support

useDmChannelsForAgent
Direct Messages

useCreateDmChannel
Channel Creation

useChannelDetails
Group Info

ChatInputArea
Message Composition

ChatMessageListComponent
Message Display

AgentSidebar
Agent Details

GroupPanel
Group Settings

Sources: 
packages/client/src/components/chat.tsx
241-291
 
packages/client/src/components/chat.tsx
350-406

The chat interface handles both DM and group chat types through a unified UnifiedChatViewProps interface:

interface UnifiedChatViewProps {
  chatType: ChannelType.DM | ChannelType.GROUP;
  contextId: UUID; // agentId for DM, channelId for GROUP
  serverId?: UUID; // Required for GROUP, optional for DM
  initialDmChannelId?: UUID;
}

Sources: 
packages/client/src/components/chat.tsx
93-98

Data Management Layer
React Query Integration

The application uses React Query for efficient data fetching, caching, and synchronization. The use-query-hooks.ts file provides specialized hooks for different data types.

Core Query Hooks

Agent Operations

useStartAgent
Start Agent Mutation

useStopAgent
Stop Agent Mutation

useDeleteAgent
Delete Agent Mutation

Server Management

useServers
Server List

useChannels
Channel List

useChannelDetails
Channel Info

Messaging Hooks

useChannelMessages
Message History

useChannelParticipants
Channel Members

useDmChannelsForAgent
DM Channel List

Agent Hooks

useAgents
Agent List

useAgent
Single Agent

useAgentsWithDetails
Full Agent Data

Sources: 
packages/client/src/hooks/use-query-hooks.ts
127-149
 
packages/client/src/hooks/use-query-hooks.ts
312-545

The hooks implement network-aware polling and smart retry logic:

export function useAgents(options = {}) {
  const network = useNetworkStatus();
  
  return useQuery<{ data: { agents: Partial<AgentWithStatus>[] } }>({
    queryKey: ['agents'],
    queryFn: async () => {
      const result = await elizaClient.agents.listAgents();
      return { data: result };
    },
    staleTime: STALE_TIMES.FREQUENT,
    refetchInterval: !network.isOffline ? STALE_TIMES.FREQUENT : false,
    refetchIntervalInBackground: false
  });
}

Sources: 
packages/client/src/hooks/use-query-hooks.ts
127-149

Message State Management

The useChannelMessages hook provides sophisticated message state management with pagination, optimistic updates, and real-time synchronization:

Manual pagination with fetchNextPage
Optimistic message addition/updates via addMessage, updateMessage
Message filtering and deduplication
Integration with Socket.IO for real-time updates

Sources: 
packages/client/src/hooks/use-query-hooks.ts
312-545

Component Patterns
Agent Cards and Management

Agent representation follows a consistent card-based pattern across the interface. The AgentCard component provides the standard agent display with status controls, chat navigation, and settings access.

Key agent management components:

AgentCard - Agent display cards with status toggles
ProfileOverlay - Detailed agent information modal
AgentSidebar - Tabbed agent details view with actions, logs, and memories
AddAgentCard - Create new agent card

Sources: 
packages/client/src/components/agent-card.tsx
20-89
 
packages/client/src/components/profile-overlay.tsx
32-78

Group Management

Group chat functionality is handled through:

GroupCard - Group display with participant avatars
GroupPanel - Group creation and editing interface
Group-specific routing and state management

Sources: 
packages/client/src/components/group-card.tsx
20-52
 
packages/client/src/components/group-panel.tsx
52-118

Responsive Design

The interface adapts to different screen sizes using:

Mobile hamburger menu via Sheet component
Responsive grid layouts for agent/group cards
Floating panel modes for narrow screens
Touch-optimized interactions

Sources: 
packages/client/src/App.tsx
107-119
 
packages/client/src/components/chat.tsx
38-42
