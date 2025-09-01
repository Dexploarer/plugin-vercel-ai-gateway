# Commands and Usage | elizaOS/eliza | DeepWiki

**URL:** https://deepwiki.com/elizaOS/eliza/3.1-commands-and-usage
**Category:** CLI Usage
**Context:** User Context
**Scraped:** 2025-08-31T23:20:54.493Z

---

Commands and Usage
Relevant source files

This document covers the complete command-line interface (CLI) for ElizaOS, providing detailed usage information for all available commands and their options. The CLI serves as the primary tool for creating, managing, and deploying ElizaOS agents and plugins.

For information about the underlying AgentRuntime system that powers these commands, see Core System. For details about project structure and development workflows, see Development.

Overview

The ElizaOS CLI (elizaos) provides a comprehensive command-line interface for managing the entire agent development lifecycle. The CLI supports project creation, development workflow, agent management, plugin installation, environment configuration, and deployment operations.

CLI Command Hierarchy

Utilities

Publishing

Testing & Validation

Configuration

Plugin System

Agent Management

Project Lifecycle

elizaos CLI

create

dev

start

update

agent list

agent start

agent stop

agent get

agent set

plugins list

plugins add

plugins remove

plugins installed-plugins

env

monorepo

test

scenario

publish

tee

report

Sources: 
packages/cli/src/index.ts
121-144

Global Options and Configuration

The CLI supports several global options that apply across all commands:

Option	Description
--no-emoji	Disable emoji output in command responses
--no-auto-install	Disable automatic Bun installation
-v, --version	Display CLI version information

Environment Variables

The CLI respects several environment variables for configuration:

ELIZA_NONINTERACTIVE - Suppresses interactive prompts
ELIZA_NO_AUTO_INSTALL - Disables automatic dependency installation
ELIZA_TEST_MODE - Enables test mode for automated testing
LOG_LEVEL - Controls logging verbosity (fatal, error, warn, info, debug, trace)

Sources: 
packages/cli/src/index.ts
95-103
 
packages/cli/src/utils/get-config.ts
28-112

Project Lifecycle Commands
create

Creates new ElizaOS projects, plugins, agents, or TEE applications.

Syntax:

elizaos create <name> [options]

Options:

--type <type> - Project type: project, plugin, agent, tee
--yes - Skip interactive prompts and use defaults

Examples:

# Create a new ElizaOS project
elizaos create my-agent-app --type project

# Create a plugin
elizaos create my-plugin --type plugin

# Create an agent character
elizaos create my-character --type agent

# Create TEE application
elizaos create my-tee-app --type tee

Project Creation Workflow

elizaos create

validateProjectName()

Select Project Type

Project Starter

Plugin Starter

Agent Character

TEE Starter

copyTemplate()

createAgentCharacter()

Update Dependencies

bun install

setupPgLite()

Project Ready

Sources: 
packages/cli/src/commands/create/index.ts
 
packages/cli/src/utils/copy-template.ts
111-227

dev

Starts the development server with automatic rebuilding and hot-reloading.

Syntax:

elizaos dev [options]

Options:

--port <port> - Port to listen on (default: 3000)
--character <path> - Path to character file(s)

Features:

Automatic project type detection
File watching with rebuild on changes
Port conflict resolution
Character hot-reloading

Development Mode Flow

Yes

No

Yes

No

elizaos dev

detectDirectoryType()

ElizaOS Project?

Project Mode

Standalone Mode

Build Project

Setup File Watcher

startServer()

Check Port Availability

Port in Use?

Find Next Available Port

Bind to Port

Load Character Files

Development Server Ready

Create Basic Server

Sources: 
packages/cli/src/commands/dev/index.ts
 
packages/cli/tests/commands/dev.test.ts
529-621

start

Launches the ElizaOS server with specified agents and configuration.

Syntax:

elizaos start [options]

Options:

-p, --port <port> - Port to listen on (default: 3000)
-c, --character <paths> - Character file paths (comma or space separated)

Features:

Multi-character support
Database initialization
Plugin loading
Server health monitoring

Sources: 
packages/cli/src/commands/start.ts
 
packages/cli/tests/commands/start.test.ts
90-134

update

Updates the CLI tool and project dependencies.

Syntax:

elizaos update [options]

Options:

--cli - Update only the CLI tool
--packages - Update only project packages
--check - Check for available updates
--skip-build - Skip building after update

Sources: 
packages/cli/tests/commands/update.test.ts
44-51

Agent Management Commands

The agent command provides lifecycle management for ElizaOS agents running on a server.

agent list

Lists all available agents on the target server.

Syntax:

elizaos agent list [options]

Options:

--remote-url <url> - Server URL (default: http://localhost:3000)
--json - Output in JSON format
agent start

Starts an agent on the target server.

Syntax:

elizaos agent start [options]

Options:

--remote-url <url> - Server URL
-n, --name <name> - Agent name to start
--path <path> - Path to character file
agent stop

Stops a running agent.

Syntax:

elizaos agent stop [options]

Options:

--remote-url <url> - Server URL
-n, --name <name> - Agent name to stop
--all - Stop all running agents
agent get

Retrieves agent configuration and status.

Syntax:

elizaos agent get [options]

Options:

--remote-url <url> - Server URL
-n, --name <name> - Agent name
--json - Output in JSON format
--output <file> - Save output to file
agent set

Updates agent configuration.

Syntax:

elizaos agent set [options]

Options:

--remote-url <url> - Server URL
-n, --name <name> - Agent name
-f, --file <path> - Configuration file path

Agent Command Architecture

elizaos agent

getAgentRuntimeUrl()

getAuthHeaders()

list

start

stop

get

set

/api/agents

/api/agents/:name/start

/api/agents/:name/stop

/api/agents/:name

/api/agents/:name

formatAgentList()

validateCharacterFile()

confirmStopAgent()

displayAgentInfo()

updateAgentConfig()

Sources: 
packages/cli/src/commands/agent/index.ts
 
packages/cli/tests/commands/agent.test.ts
225-424

Plugin Management

The plugins command manages ElizaOS plugins for extending agent capabilities.

plugins list

Displays available plugins from the registry.

Syntax:

elizaos plugins list
elizaos plugins l    # alias
elizaos plugins ls   # alias
plugins add

Installs a plugin to the current project.

Syntax:

elizaos plugins add <plugin> [options]

Options:

--skip-env-prompt - Skip environment configuration prompts

Supported Plugin Sources:

NPM packages: @elizaos/plugin-openai
GitHub repositories: https://github.com/owner/plugin-repo
GitHub shorthand: github:owner/plugin-repo#branch
Registry names: plugin-openai
plugins remove

Uninstalls a plugin from the current project.

Syntax:

elizaos plugins remove <plugin>
elizaos plugins delete <plugin>  # alias
elizaos plugins del <plugin>     # alias  
elizaos plugins rm <plugin>      # alias
plugins installed-plugins

Lists currently installed plugins in the project.

Plugin Installation Flow

Yes

No

Yes

No

Yes

No

Yes

No

elizaos plugins add

normalizePluginName()

fetchPluginRegistry()

Plugin in Registry?

Install from NPM

Fuzzy Search Registry

Fuzzy Match?

Direct Installation

NPM Failed?

Install from GitHub

verifyPluginImport()

GitHub URL?

Direct NPM Install

Plugin Installed

Sources: 
packages/cli/src/commands/plugins/index.ts
 
packages/cli/src/utils/install-plugin.ts
121-244
 
packages/cli/tests/commands/plugins.test.ts
70-341

Configuration Management
env

Manages environment variables and configuration files.

Syntax:

elizaos env [subcommand] [options]

Subcommands:

check - Validate environment configuration
setup - Initialize environment files
list - Display current environment variables

The env command helps configure API keys, database connections, and other environment-specific settings required by ElizaOS agents.

Sources: 
packages/cli/tests/commands/env.test.ts
10-82

Testing and Validation
test

Runs test suites and validation scenarios.

Syntax:

elizaos test [options]

Features:

Unit test execution
Integration testing
Plugin validation
Character file validation
scenario

Executes scenario-based testing for agent behavior validation.

Syntax:

elizaos scenario [options]

Features:

Behavioral testing scenarios
Multi-agent interaction testing
Performance benchmarking
Regression testing

Sources: 
packages/cli/tests/commands/test.test.ts
7-98

Publishing and Deployment
publish

Publishes plugins and projects to npm and GitHub registries.

Syntax:

elizaos publish [options]

Options:

--npm - Publish to NPM registry
--github - Publish to GitHub
--registry - Update plugin registry
--test - Test publish readiness

Publishing Workflow

Plugin

Project

elizaos publish

detectDirectoryType()

Project Type

Plugin Publishing

Project Publishing

buildProject()

testPublishToNpm()

testPublishToGitHub()

publishToNpm()

publishToGitHub()

updatePluginRegistry()

buildProject()

createGitHubRepository()

pushToGitHub()

Published Successfully

Sources: 
packages/cli/src/utils/publisher.ts
187-315

tee

Manages Trusted Execution Environment (TEE) deployments using Phala Cloud.

Syntax:

elizaos tee <phala-command> [options]

This command serves as a wrapper for the official Phala CLI, allowing seamless integration of TEE deployment workflows within the ElizaOS development environment.

Sources: 
packages/cli/src/commands/tee/phala-wrapper.ts
10-75

Advanced Commands
monorepo

Provides utilities for working with ElizaOS in monorepo environments.

Syntax:

elizaos monorepo [subcommand]
report

Generates system reports and diagnostics.

Syntax:

elizaos report [options]

Features:

Environment diagnostics
Dependency analysis
Configuration validation
Performance metrics

Sources: 
packages/cli/tests/commands/monorepo.test.ts
1-69

Command Integration Architecture

CLI Command Processing Flow

Yes

No

Yes

No

CLI Entry Point

tryDelegateToLocalCli()

Local CLI Found?

Use Local CLI

Use Global CLI

program.parseAsync()

Show Banner?

displayBanner()

Execute Command

Validate Environment

Execute Command Logic

Command Success

Handle Error

gracefulShutdown()

Process Exit

The CLI architecture provides robust error handling, environment validation, and graceful shutdown capabilities to ensure reliable operation across different deployment scenarios.

Sources: 
packages/cli/src/index.ts
51-157
 
packages/cli/src/utils/handle-error.ts
7-60
