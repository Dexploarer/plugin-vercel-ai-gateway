# Core System | elizaOS/eliza | DeepWiki

**URL:** https://deepwiki.com/elizaOS/eliza/2-core-system
**Category:** Architecture & Core Concepts
**Context:** Developer Context
**Scraped:** 2025-08-31T23:19:25.849Z

---

Core System
Relevant source files

The Core System is the foundational layer of ElizaOS that powers all agent operations. It centers around the AgentRuntime class, which serves as the central orchestrator for agent lifecycle, plugin management, database interactions, and state coordination. This system handles message processing, action execution, memory management, and service integration.

For information about CLI tools and project management, see CLI System. For client applications and user interfaces, see Client Interfaces.

AgentRuntime Architecture

The AgentRuntime class is the central coordinator that manages all agent operations. It implements the IAgentRuntime interface and orchestrates plugins, database adapters, model providers, and state management.

Core Runtime Components

Sources: 
packages/core/src/runtime.ts
86-188
 
packages/core/src/types.ts

Message Processing Flow

The runtime processes incoming messages through a structured pipeline that handles state composition, action execution, and evaluation.

Sources: 
packages/core/src/runtime.ts
574-1021
 
packages/core/src/runtime.ts
1023-1067
 
packages/core/src/runtime.ts
2074-2200

Plugin System Integration

The runtime manages plugins through a registration system that allows dynamic extension of agent capabilities. Each plugin can provide actions, evaluators, providers, services, and model handlers.

Plugin Registration Architecture

Sources: 
packages/core/src/runtime.ts
222-323
 
packages/core/src/runtime.ts
523-547
 
packages/core/src/types.ts

Database Layer

The database layer provides abstraction through the IDatabaseAdapter interface, with concrete implementations like BaseDrizzleAdapter for SQL databases.

Database Architecture

Sources: 
packages/core/src/database.ts
28-580
 
packages/plugin-sql/src/base.ts
81-105

State Management

The runtime maintains state through caching mechanisms and context composition that aggregates information from providers, recent messages, and action results.

State Composition System

The composeState method builds contextual state by invoking providers and aggregating data:

Provider Integration: Calls provider.provide() for each registered provider
Message Context: Retrieves recent messages and conversation history
Action Context: Includes previous action results and current execution plan
Entity Context: Loads entity information and relationships
Cache Management: Uses stateCache for performance optimization

Sources: 
packages/core/src/runtime.ts
2074-2200
 
packages/core/src/runtime.ts
97-104

Service Architecture

Services provide persistent functionality that runs alongside the agent runtime. The service system supports dependency injection and lifecycle management.

Service Management

The runtime manages services through:

Service Registration: registerService() adds services with type-based organization
Service Resolution: Promise-based loading with dependency resolution
Lifecycle Management: Services support start() and stop() methods
Type Safety: Services organized by ServiceTypeName with type checking

Key service management occurs in the services Map and servicePromises for async loading.

Sources: 
packages/core/src/runtime.ts
1714-1850
 
packages/core/src/runtime.ts
106-123

Initialization Flow

The agent runtime initialization follows a specific sequence to ensure all components are properly configured and connected.

Initialization Sequence

Sources: 
packages/core/src/runtime.ts
137-188
 
packages/core/src/runtime.ts
339-444
 
packages/core/src/runtime.ts
446-472
