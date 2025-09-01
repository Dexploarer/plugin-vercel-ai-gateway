# elizaOS/eliza | DeepWiki

**URL:** https://deepwiki.com/elizaOS/eliza/1-overview
**Category:** Architecture & Core Concepts
**Context:** Developer Context
**Scraped:** 2025-08-31T23:19:25.849Z

---

Overview
Relevant source files

ElizaOS is a comprehensive framework for multi-agent development and deployment, providing a modular architecture for building, configuring, and running AI agents across multiple platforms and communication channels. The system consists of a core runtime engine, extensible plugin architecture, command-line interface, web client, and supporting infrastructure organized as a TypeScript monorepo.

This document provides a technical overview of the ElizaOS system architecture, core components, and development workflow. For specific implementation details of individual components, see the corresponding sections: Core System covers the AgentRuntime and related components, CLI System details the command-line interface, Client Interfaces covers web and platform clients, Plugin System explains the extensible architecture, and Development describes the build and deployment processes.

System Architecture

ElizaOS follows a layered architecture with clear separation between the core runtime, plugin system, client interfaces, and development tooling.

Sources: 
package.json
40-43
 
packages/core/package.json
 
packages/cli/package.json
 
packages/client/package.json
 
packages/server/package.json

Core Component Structure

The ElizaOS monorepo organizes functionality into distinct packages, each serving specific roles in the agent development and runtime ecosystem.

Sources: 
bun.lock
253-651
 
README.md
297-328
 
packages/core/package.json
 
packages/cli/package.json
63-115

Agent Runtime Architecture

The AgentRuntime serves as the central orchestrator for all agent operations, coordinating between plugins, memory systems, and external interfaces.

Sources: 
packages/plugin-bootstrap/package.json
295-313
 
packages/core/package.json
253-281
 
packages/plugin-sql/package.json
345-366

CLI-Driven Development Workflow

The elizaos CLI provides the primary interface for creating, configuring, and managing agents and projects.

Sources: 
packages/cli/package.json
66-96
 
README.md
34-191
 
package.json
9-37

Key Capabilities
Multi-Platform Agent Deployment

ElizaOS supports deployment across multiple communication platforms through platform-specific clients, all coordinated by the central AgentRuntime. Each platform client implements the same core interfaces while handling platform-specific message formats and authentication.

Extensible Plugin Architecture

The plugin system centers around the @elizaos/plugin-bootstrap package, which provides essential message processing capabilities. Additional plugins extend functionality through Actions, Evaluators, and Providers that integrate seamlessly with the runtime.

Developer-Friendly Tooling

The @elizaos/cli package provides comprehensive project management capabilities, from initial scaffolding through testing and deployment. The CLI integrates with the monorepo structure using Turbo and Lerna for efficient build orchestration.

Real-Time Communication

The system supports real-time bidirectional communication through Socket.IO integration in both the server and client packages, enabling live agent interactions and status updates.

Flexible Database Integration

Database support is provided through the BaseDrizzleAdapter in @elizaos/plugin-sql, supporting both PostgreSQL for production and PGLite for lightweight development scenarios.

Sources: 
README.md
5-24
 
packages/plugin-bootstrap/package.json
295-313
 
packages/server/package.json
449-475
 
packages/plugin-sql/package.json
345-366
