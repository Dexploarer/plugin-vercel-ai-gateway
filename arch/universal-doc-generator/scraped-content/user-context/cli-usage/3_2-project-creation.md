# Project Creation | elizaOS/eliza | DeepWiki

**URL:** https://deepwiki.com/elizaOS/eliza/3.2-project-creation
**Category:** CLI Usage
**Context:** User Context
**Scraped:** 2025-08-31T23:20:54.493Z

---

Project Creation
Relevant source files

This document covers the ElizaOS project creation system, which provides scaffolding functionality through the elizaos create command. The system supports creating four types of projects: standard ElizaOS applications, plugins, agent character files, and TEE (Trusted Execution Environment) projects.

For information about managing existing projects after creation, see Commands and Usage. For details about the underlying plugin architecture used in created projects, see Plugin System.

Command Overview

The create system is implemented as a Commander.js command that handles project scaffolding with both interactive and non-interactive modes. The main command supports multiple project types and provides intelligent defaults for rapid development.

Configuration

Creation Functions

create command
packages/cli/src/commands/create/index.ts

validateCreateOptions
validateProjectName

Project Type Selection
project | plugin | agent | tee

createProject
creators.ts:309

createPlugin
creators.ts:117

createAgent
creators.ts:187

createTEEProject
creators.ts:246

selectDatabase
selection.ts:75

selectAIModel
selection.ts:99

selectEmbeddingModel
selection.ts:146

Sources: 
packages/cli/src/commands/create/index.ts
19-251
 
packages/cli/src/commands/create/actions/creators.ts
117-383
 
packages/cli/src/commands/create/utils/selection.ts
75-165

Project Types and Templates

The system supports four distinct project types, each using a different template and configuration approach:

Project Type	Template	Description	Configuration Required
project	project-starter	Full ElizaOS application	Database, AI model, embedding model
plugin	plugin or plugin-quick	Custom plugin development	Plugin type (full/quick)
agent	Eliza character template	Agent character JSON file	Agent name only
tee	project-tee-starter	TEE-enabled application	Database, AI model, embedding model

The template selection logic determines which base template to copy:

copyTemplateUtil Function

Template Selection

project-starter
Full ElizaOS App

plugin template
Custom Plugin

plugin-quick template
Backend Only Plugin

getElizaCharacter()
character template

project-tee-starter
TEE Application

copyTemplate
src/utils

Agent JSON File
agentName.json

Sources: 
packages/cli/src/commands/create/actions/creators.ts
164-169
 
packages/cli/src/commands/create/actions/creators.ts
287-289
 
packages/cli/src/commands/create/actions/creators.ts
355-357
 
packages/cli/src/characters/eliza.ts
225-264

Interactive Configuration Flow

The create command provides rich interactive prompts for project configuration when not running in non-interactive mode. The flow varies by project type:

Non-Interactive Flow

Interactive Flow

No

Yes

elizaos create [name]

Non-interactive mode?
--yes or ELIZA_NONINTERACTIVE

displayBanner()

clack.select()
Project Type

clack.text()
Project Name

Plugin Type Selection
quick | full

Database Selection
pglite | postgres

AI Model Selection
local | openai | claude | etc

Embedding Model
if needed

clack.confirm()
Create confirmation

Use Defaults
pglite, local AI

Skip all prompts

Sources: 
packages/cli/src/commands/create/index.ts
46-48
 
packages/cli/src/commands/create/index.ts
54-89
 
packages/cli/src/commands/create/index.ts
98-124
 
packages/cli/src/commands/create/utils/selection.ts
75-165

Template Copying and Setup Process

Each project type follows a standardized creation workflow using the withCleanupOnInterrupt wrapper for error handling and the task runner system for progress indication:

Setup Functions

Task Execution

Creation Wrapper

withCleanupOnInterrupt
creators.ts:50-112

Target directory validation
validateTargetDirectory

SIGINT/SIGTERM cleanup
rmSync on failure

runTasks
spinner-utils

createTask
Copying template

createTask
Setting up environment

createTask
Installing dependencies

createTask
Building project

setupProjectEnvironment
setup.ts:335

setupAIModelConfig
setup.ts:26

setupEmbeddingModelConfig
setup.ts:195

installModelPlugin
setup.ts:317

Sources: 
packages/cli/src/commands/create/actions/creators.ts
50-112
 
packages/cli/src/commands/create/actions/creators.ts
166-171
 
packages/cli/src/commands/create/actions/setup.ts
335-385

Environment Configuration

The setup system automatically configures environment variables and installs appropriate plugins based on user selections. The configuration process handles multiple AI providers and embedding models:

Environment File

Plugin Installation

Database Configuration

AI Model Configuration

local (Ollama)
OLLAMA_API_ENDPOINT
OLLAMA_MODEL

OpenAI
OPENAI_API_KEY

Anthropic
ANTHROPIC_API_KEY

OpenRouter
OPENROUTER_API_KEY

Google GenAI
GOOGLE_GENERATIVE_AI_API_KEY

PGLite
setupPgLite()

PostgreSQL
promptAndStorePostgresUrl()

resolveModelToPlugin
setup.ts:301-312

installPluginWithSpinner
spinner-utils

.env file
API keys and configuration

The system includes embedding model fallback logic for AI providers that don't support embeddings:

Fallback Selection

Embedding Support Check

false

hasEmbeddingSupport()
selection.ts:49-52

local, openai, google

claude, openrouter

selectEmbeddingModel()
selection.ts:146-165

local | openai | google

Sources: 
packages/cli/src/commands/create/actions/setup.ts
26-171
 
packages/cli/src/commands/create/actions/setup.ts
195-296
 
packages/cli/src/commands/create/utils/selection.ts
49-52
 
packages/cli/src/commands/create/utils/selection.ts
146-165

Character Template System

Agent creation uses the ElizaOS character system to generate properly configured agent files. The character template includes dynamic plugin loading based on available environment variables:

Agent File Creation

Plugin Categories

Character Generation

getElizaCharacter()
eliza.ts:225

baseCharacter
eliza.ts:7-217

Plugin ordering logic
eliza.ts:226-258

@elizaos/plugin-sql
Always first

@elizaos/plugin-anthropic
@elizaos/plugin-openrouter
Text-only AI

@elizaos/plugin-openai
@elizaos/plugin-google-genai
Embedding-capable AI

@elizaos/plugin-discord
@elizaos/plugin-twitter
@elizaos/plugin-telegram

@elizaos/plugin-bootstrap
Unless IGNORE_BOOTSTRAP

@elizaos/plugin-ollama
Universal fallback

agentName.json
Character configuration

Custom bio with agent name

fs.writeFile
creators.ts:230

Sources: 
packages/cli/src/commands/create/actions/creators.ts
220-241
 
packages/cli/src/characters/eliza.ts
225-264
 
packages/cli/src/characters/eliza.ts
226-258

Error Handling and Cleanup

The creation system includes comprehensive error handling with automatic cleanup on interruption:

Cleanup Actions

Error Scenarios

Cleanup System

withCleanupOnInterrupt
creators.ts:50

existsSync(targetDir)
before creation

SIGINT/SIGTERM handlers
cleanup on exit

Ctrl+C during creation

Error during setup/install

Invalid name/directory

rmSync(targetDir)
recursive: true, force: true

Remove signal handlers

Display error message

Sources: 
packages/cli/src/commands/create/actions/creators.ts
50-112
 
packages/cli/src/commands/create/actions/creators.ts
58-71
 
packages/cli/src/commands/create/actions/creators.ts
82-84
