# Getting Started | elizaOS/eliza | DeepWiki

**URL:** https://deepwiki.com/elizaOS/eliza/1.2-getting-started
**Category:** Getting Started
**Context:** User Context
**Scraped:** 2025-08-31T23:20:48.996Z

---

Getting Started
Relevant source files

This page provides a quick start guide for creating and running your first ElizaOS agent using the command-line interface. It covers project creation, basic configuration, and launching your agent.

For information about the overall ElizaOS architecture and core systems, see Architecture. For detailed CLI command reference, see Commands and Usage. For plugin development, see Creating Plugins.

Overview

ElizaOS is a multi-agent development platform that allows you to create, configure, and deploy AI agents with various capabilities. The elizaos CLI provides tools to scaffold projects, manage plugins, configure environments, and run agents locally or in production.

Quick Start Workflow

The fastest way to get started is to create a new project using the CLI:

# Create a new ElizaOS project
elizaos create my-agent

# Navigate to the project
cd my-agent

# Start development server
elizaos dev

CLI Command Structure

elizaos CLI

elizaos create

elizaos start

elizaos dev

elizaos agent

elizaos plugins

Project Creation

Plugin Creation

Agent Character

TEE Project

Production Server

Development Server

Start Agent

Stop Agent

List Agents

Install Plugin

List Plugins

Sources: 
packages/cli/src/index.ts
6-17
 
packages/cli/src/commands/create/index.ts
19-24

Creating Your First Project

The create command supports multiple project types. For your first agent, create a standard project:

Interactive Project Creation

When you run elizaos create without arguments, the CLI provides an interactive wizard:

elizaos create

The wizard will prompt you to select:

Project Type: Choose from project, plugin, agent, or tee
Project Name: Provide a name (validates against naming conventions)
Database: Select pglite (local) or postgres (production)
AI Model: Choose from local (Ollama), openai, claude, openrouter, or google
Embedding Model: Selected automatically if your AI model lacks embedding support

Project Creation Workflow

elizaos create

selectProjectType()

validateProjectName()

selectDatabase()

selectAIModel()

selectEmbeddingModel()

copyTemplate()

setupProjectEnvironment()

installDependenciesWithSpinner()

buildProjectWithSpinner()

Sources: 
packages/cli/src/commands/create/index.ts
54-89
 
packages/cli/src/commands/create/actions/creators.ts
309-383

Non-Interactive Creation

For automated setups, use the --yes flag with defaults:

elizaos create my-agent --yes --type project

This creates a project with:

PGLite database (local development)
Local AI via Ollama
Default ElizaOS character configuration

Sources: 
packages/cli/src/commands/create/index.ts
29-44

Project Structure

A newly created project contains these key components:

Core Project Files

my-agent/

package.json

src/character.ts

src/index.ts

src/plugin.ts

.env

.eliza/

src/

config.json

registry-cache.json

.elizadb/

Key Files
src/index.ts: Main project entry point that exports projectAgent and configures the runtime
src/character.ts: Agent personality, bio, and plugin configuration
src/plugin.ts: Custom plugin definition for project-specific functionality
.env: Environment variables for API keys, database configuration
.eliza/: ElizaOS configuration directory with settings and database

Sources: 
packages/project-starter/src/index.ts
1-25
 
packages/project-starter/src/character.ts
9-38

Configuration
Environment Setup

The CLI automatically creates a .env file with template variables. Configure the required API keys for your chosen AI provider:

For OpenAI:

OPENAI_API_KEY=your_openai_api_key_here

For Anthropic:

ANTHROPIC_API_KEY=your_anthropic_api_key_here

For Local AI (Ollama):

OLLAMA_API_ENDPOINT=http://localhost:11434
OLLAMA_MODEL=gemma3
OLLAMA_EMBEDDING_MODEL=nomic-embed-text
Database Configuration

PGLite (Default):

PGLITE_DATA_DIR=/path/to/project/.eliza/.elizadb

PostgreSQL:

POSTGRES_URL=postgresql://user:password@host:port/dbname

Sources: 
packages/cli/src/utils/get-config.ts
28-112

Character Configuration

The getElizaCharacter() function automatically loads plugins based on available environment variables:

Plugin Loading Priority

@elizaos/plugin-sql

Text-Only Plugins

Embedding Plugins

Platform Plugins

@elizaos/plugin-bootstrap

@elizaos/plugin-ollama

@elizaos/plugin-anthropic

@elizaos/plugin-openrouter

@elizaos/plugin-openai

@elizaos/plugin-google-genai

@elizaos/plugin-discord

@elizaos/plugin-twitter

@elizaos/plugin-telegram

Sources: 
packages/cli/src/characters/eliza.ts
225-264

Running Your Agent
Development Mode

Use elizaos dev for development with hot reloading:

elizaos dev

This starts the development server with:

File watching and automatic restart
Debug logging enabled
Web interface at http://localhost:5173
API server at http://localhost:3000
Production Mode

Use elizaos start for production deployment:

elizaos start
Using Custom Characters

To run with a specific character file:

elizaos start --character ./path/to/character.json

Agent Runtime Architecture

elizaos start/dev

AgentRuntime

Character

Plugin System

AgentServer

Web Client

Database

Memory System

AI Models

PGLite

PostgreSQL

OpenAI

Anthropic

Ollama

Sources: 
packages/cli/src/commands/start/index.ts
 
packages/server/src/index.ts

Next Steps

Once your agent is running, you can:

Customize the Character: Edit src/character.ts to modify personality, bio, and capabilities
Add Custom Plugins: Create plugins in src/plugin.ts or install from the registry
Connect Platforms: Configure Discord, Twitter, Telegram tokens to deploy on social platforms
Extend Functionality: Add actions, evaluators, and providers through the plugin system

For detailed information on these topics, see:

Character System for personality customization
Plugin System for extending functionality
Platform Clients for social media integration
Memory and Knowledge Management for knowledge bases

Sources: 
packages/cli/src/commands/create/actions/creators.ts
172-184
