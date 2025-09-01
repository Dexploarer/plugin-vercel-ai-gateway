# CLI System | elizaOS/eliza | DeepWiki

**URL:** https://deepwiki.com/elizaOS/eliza/3-cli-system
**Category:** CLI Usage
**Context:** User Context
**Scraped:** 2025-08-31T23:20:54.493Z

---

CLI System
Relevant source files

The CLI System provides the primary developer interface for managing ElizaOS projects, agents, plugins, and deployments. It serves as the central command-line tool for creating new projects, managing plugin ecosystems, configuring environments, and orchestrating agent lifecycles from development through production deployment.

For information about the core agent runtime that the CLI orchestrates, see AgentRuntime. For details about the plugin architecture that the CLI manages, see Plugin System.

CLI Architecture

The CLI system is built around a modular command structure with integrated tooling for project scaffolding, plugin management, and cloud deployment capabilities.

External Integrations

Plugin Registry

Template System

Core CLI Commands

CLI Entry Points

elizaos CLI Main Entry

create-eliza wrapper

create command

agent command

plugins command

start command

dev command

test command

env command

tee command

update command

publish command

@elizaos/project-starter

@elizaos/project-tee-starter

@elizaos/plugin-starter

@elizaos/plugin-quick-starter

fetchPluginRegistry()

plugin installation

plugin validation

Phala Cloud CLI

npm registry

GitHub API

Sources: 
packages/cli/package.json
35-36
 
packages/create-eliza/index.mjs
1-14
 
packages/cli/README.md
57-834

Command Structure and Implementation

The CLI implements a hierarchical command structure with each major command handling specific aspects of the ElizaOS development workflow.

External Dependencies

Core Services

Command Handlers

CLI Binary Structure

elizaos binary

dist/index.js

src/index.ts

createCommand handler

agentCommand handler

pluginsCommand handler

startCommand handler

devCommand handler

testCommand handler

template copying service

environment management

automatic Bun installer

scenario test runner

commander.js

@clack/prompts

simple-git

chokidar file watcher

Sources: 
packages/cli/package.json
35-36
 
packages/cli/package.json
80-106
 
packages/cli/README.md
57-278

Project and Template Creation

The create command system handles scaffolding of new ElizaOS projects, plugins, agents, and TEE applications through a template-based approach.

Template Type	Package	Purpose
project	@elizaos/project-starter	Full ElizaOS application with agent configuration
plugin	@elizaos/plugin-starter	Complete plugin with frontend/backend components
agent	JSON template	Character definition files
tee	@elizaos/project-tee-starter	TEE-enabled project with Phala Cloud integration
quick-plugin	@elizaos/plugin-quick-starter	Backend-only plugin template

The creation process includes:

Interactive prompts for configuration via @clack/prompts
Automatic dependency installation with bun install
Template file copying with variable substitution
Git repository initialization
Environment file setup

Sources: 
packages/cli/README.md
57-72
 
packages/project-starter/package.json
1-79
 
packages/plugin-starter/package.json
1-99
 
packages/project-tee-starter/package.json
1-94

Plugin Management System

The plugin management subsystem handles discovery, installation, and lifecycle management of ElizaOS plugins through integration with npm and a centralized plugin registry.

Plugin Development

Plugin Discovery

Plugin Installation

Plugin Registry System

Remote Plugin Registry

Local Registry Cache

fetchPluginRegistry()

npm install integration

git clone installation

Plugin Validation

plugins list command

Plugin Search

Plugin Metadata

plugins upgrade command

AI-powered v0.x to v1.x upgrade

publish command integration

Sources: 
packages/cli/README.md
138-156
 
packages/plugin-starter/package.json
89-97
 
packages/plugin-dummy-services/package.json
49-78

Agent and Server Management

The CLI provides comprehensive agent lifecycle management through the agent and start commands, interfacing with the core AgentRuntime and server infrastructure.

Command	Purpose	Key Features
elizaos agent list	List running agents	JSON output, remote runtime support
elizaos agent start	Start agent instances	Character loading, plugin configuration
elizaos agent stop	Stop agents	Individual or bulk stopping
elizaos start	Development server	Hot reload, port configuration
elizaos dev	Development mode	File watching, auto-rebuild

The agent management system supports:

Multiple character file formats and URLs
Remote agent runtime connections via --remote-url
Interactive mode for parameter-less commands
Graceful error handling for failed character loads

Sources: 
packages/cli/README.md
158-202
 
packages/cli/README.md
239-275
 
packages/server/package.json
1-69

Testing Infrastructure

The CLI implements a dual testing strategy combining Bun's native test runner with a custom E2E testing framework for comprehensive validation.

Test Environment

Test Types

Test Runners

Testing Commands

elizaos test command

component test runner

e2e test runner

all tests runner

Bun native test runner

ElizaOS TestRunner

BATS integration tests

*.test.ts files

*.e2e.ts test suites

CLI integration tests

Matrix scenario tests

PGLite test database

Real AgentRuntime

Mock services

Sources: 
packages/cli/README.md
278-310
 
packages/cli/package.json
45-59
 
packages/plugin-starter/src/__tests__/e2e/README.md
1-83

TEE and Cloud Integration

The CLI integrates with Trusted Execution Environment (TEE) platforms through the tee command, providing seamless access to Phala Cloud's confidential computing infrastructure.

The elizaos tee phala commands pass through transparently to the official Phala Cloud CLI, supporting:

Authentication: auth login, auth logout, auth status
CVM Management: cvms create, cvms start, cvms stop, cvms delete
Docker Integration: docker build, docker push, docker generate
Attestation: cvms attestation for cryptographic proof verification
Resource Management: cvms resize for scaling operations

Sources: 
packages/cli/README.md
313-517
 
packages/project-tee-starter/package.json
1-94
 
packages/project-tee-starter/GUIDE.md
1-297

Development and Build Integration

The CLI integrates with the ElizaOS monorepo build system and provides development workflow automation through tight integration with Bun, TypeScript, and the plugin ecosystem.

Key development features include:

Automatic Bun installation and PATH management
Hot reload development mode with chokidar file watching
TypeScript compilation with tsup build system
Environment variable management and validation
Automatic dependency resolution and plugin loading

The CLI supports both development and production deployment workflows, with built-in safeguards for CI environments and configurable auto-installation behavior.

Sources: 
packages/cli/README.md
11-51
 
packages/cli/package.json
80-106
 
lerna.json
1-13
