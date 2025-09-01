# CLI API | elizaOS/eliza | DeepWiki

**URL:** https://deepwiki.com/elizaOS/eliza/11.3-cli-api
**Category:** API Reference
**Context:** Developer Context
**Scraped:** 2025-08-31T23:19:55.064Z

---

CLI API
Relevant source files

This document covers the programmatic interfaces and command structure of the ElizaOS CLI (elizaos). The CLI API encompasses the command-line interface for project management, agent configuration, plugin handling, and testing infrastructure.

For information about the core runtime APIs that power agents, see Core API. For client-side APIs used in web and native applications, see Client API.

CLI Command Architecture

The ElizaOS CLI provides a comprehensive command structure for managing agents, plugins, and development workflows.

Sources: 
packages/cli/package.json
38-60

CLI System Integration

The CLI integrates with core ElizaOS systems to provide development and runtime capabilities.

Sources: 
packages/cli/package.json
80-107
 
packages/cli/package.json
35-36

Core CLI Commands
Project Creation API

The elizaos create command provides scaffolding for different project types.

Command	Template Package	Purpose
elizaos create project	@elizaos/project-starter	Basic ElizaOS application
elizaos create plugin	@elizaos/plugin-starter	Custom plugin development
elizaos create agent	Character JSON template	Agent configuration
elizaos create tee	@elizaos/project-tee-starter	TEE-enabled application

The CLI uses template replacement variables for dynamic content generation:

Variable	Usage	Description
${PLUGINNAME}	Plugin projects	Plugin package name
${PLUGINDESCRIPTION}	Plugin projects	Plugin description
${GITHUB_USERNAME}	All projects	GitHub username
${REPO_URL}	All projects	Repository URL

Sources: 
packages/plugin-starter/package.json
3
 
packages/plugin-starter/package.json
13
 
packages/plugin-starter/package.json
20
 
packages/plugin-starter/package.json
24

Agent Management API

The elizaos agent command manages agent lifecycle and configuration.

Sources: 
packages/cli/package.json
84-88

Development Server API

The development commands provide hot-reload and testing capabilities.

Command	Purpose	Integration
elizaos start	Production server	@elizaos/server
elizaos dev	Development mode	chokidar file watching
elizaos test	Test execution	Bun test runner

Sources: 
packages/cli/package.json
39
 
packages/cli/package.json
93

Plugin Management API
Plugin Registry Integration

The CLI integrates with a remote plugin registry for discovery and installation.

Sources: 
packages/cli/package.json
96

Plugin Configuration Schema

Plugins define their configuration requirements using the agentConfig schema in package.json.

interface PluginConfig {
  pluginType: "elizaos:plugin:1.0.0"
  pluginParameters: {
    [key: string]: {
      type: "string" | "number" | "boolean"
      description: string
      required?: boolean
    }
  }
}

Sources: 
packages/plugin-starter/package.json
89-97
 
packages/plugin-dummy-services/package.json
49-78

Testing Infrastructure API
Test Command Structure

The CLI provides comprehensive testing capabilities through multiple test runners.

Test Type	Command	Framework	Purpose
Unit	elizaos test unit	Bun	Component testing
Integration	elizaos test integration	Bun	System integration
E2E	elizaos test e2e	BATS	End-to-end workflows
Matrix	elizaos test matrix	Custom	Multi-scenario testing
CLI	elizaos test bats	BATS	CLI command testing

Sources: 
packages/cli/package.json
45-55

Scenario Testing API

The scenario system provides YAML-based test configuration for complex workflows.

Sources: 
packages/cli/package.json
50
 
packages/cli/package.json
59

Configuration Management API
Environment Configuration

The CLI manages environment variables and API key setup across different deployment contexts.

Configuration Type	Files	Purpose
API Keys	.env, .env.local	Service authentication
Database	DATABASE_URL	Storage configuration
Model Providers	OPENAI_API_KEY, ANTHROPIC_API_KEY	AI model access
Platform Tokens	DISCORD_API_TOKEN, TWITTER_*	Platform integration
Build System Integration

The CLI integrates with the monorepo build system using modern JavaScript tooling.

Tool	Purpose	Configuration
bun	Package manager & runtime	
packages/cli/package.json
89

tsup	TypeScript bundler	Build configuration
commander	CLI parsing	
packages/cli/package.json
92

turbo	Monorepo task runner	Workspace coordination

Sources: 
packages/cli/package.json
40
 
lerna.json
4

Error Handling and Validation

The CLI implements comprehensive error handling and validation across all operations.

Sources: 
packages/cli/package.json
90
 
packages/cli/package.json
98
