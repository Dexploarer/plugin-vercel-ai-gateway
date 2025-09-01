# Environment Configuration | elizaOS/eliza | DeepWiki

**URL:** https://deepwiki.com/elizaOS/eliza/3.4-environment-configuration
**Category:** Server & Infrastructure
**Context:** Developer Context
**Scraped:** 2025-08-31T23:20:19.544Z

---

Environment Configuration
Relevant source files

This document covers environment variable and configuration management within the ElizaOS CLI system. It explains how .env files are created and managed, API keys are stored and validated, database settings are configured, and how the system resolves configuration paths across different project contexts.

For information about character and agent settings, see Settings and Configuration. For database integration details, see Database Integration.

Environment File Management

The ElizaOS CLI automatically manages .env files to store configuration variables. The system creates template files with comprehensive documentation and handles environment variable resolution across monorepo and standalone project contexts.

Environment File Creation

The CLI creates .env files with a comprehensive template containing all supported environment variables:

Environment File Template Structure

Sources: 
packages/cli/src/utils/get-config.ts
28-112

Path Resolution

The system resolves .env file paths using a hierarchical search approach:

Key Functions:

resolveEnvFile() - Searches for .env files from current directory up to monorepo root
expandTildePath() - Expands ~ paths relative to project directory
getElizaDirectories() - Returns standard directory paths for configuration

Sources: 
packages/cli/src/utils/resolve-utils.ts
32-56
 
packages/cli/src/utils/get-config.ts
148-166

API Provider Configuration

The CLI provides interactive configuration for multiple AI model providers with validation and secure storage.

Provider Configuration Flow
Configuration Storage

Each provider has dedicated storage functions that manage .env file updates:

API Key Storage Pattern:

Read existing .env content
Remove existing key lines to prevent duplicates
Append new key configuration
Update process.env for immediate use

Supported Providers:

OpenAI: OPENAI_API_KEY, optional endpoint overrides
Anthropic: ANTHROPIC_API_KEY, model configurations
Google: GOOGLE_GENERATIVE_AI_API_KEY
Ollama: OLLAMA_API_ENDPOINT, OLLAMA_MODEL, OLLAMA_EMBEDDING_MODEL
OpenRouter: OPENROUTER_API_KEY

Sources: 
packages/cli/src/utils/get-config.ts
405-996

Database Configuration

The system supports both PostgreSQL and PGLite databases with automatic configuration and migration handling.

Database Selection Flow
PGLite Directory Resolution

The system resolves PGLite database directories with legacy path migration:

Resolution Order:

Explicit dir parameter
PGLITE_DATA_DIR environment variable
Fallback directory parameter
Default: <project-root>/.eliza/.elizadb

Legacy Migration:

Detects old .elizadb paths
Automatically migrates to .eliza/.elizadb
Updates environment variables

Sources: 
packages/cli/src/utils/get-config.ts
1003-1038
 
packages/cli/src/utils/resolve-utils.ts
71-104

Directory Structure and Paths

The CLI manages a standardized directory structure for configuration and data storage.

ElizaOS Directory Layout
Path Information Structure

The UserEnvironment class provides comprehensive path information:

PathInfo Interface:

elizaDir - Main ElizaOS configuration directory
envFilePath - Resolved .env file path
configPath - Configuration JSON file path
pluginsDir - Plugin storage directory
monorepoRoot - Monorepo root (if detected)
packageJsonPath - Project package.json path

Monorepo Detection:

Searches upward for packages/core directory
Validates ElizaOS monorepo structure
Provides monorepo-aware path resolution

Sources: 
packages/cli/src/utils/user-environment.ts
42-318
 
packages/cli/src/utils/get-config.ts
222-245

Interactive Configuration

The CLI provides guided interactive configuration through the promptAndStore* functions using the Clack prompting library.

Generic Provider Configuration

The system uses a generic configuration pattern for all providers:

Configuration Validation

Each provider implements specific validation rules:

OpenAI Validation:

Must start with sk-
Minimum 20 characters
Warns on format mismatch but allows storage

Anthropic Validation:

Must start with sk-ant-
Minimum 20 characters

PostgreSQL Validation:

Must use postgresql:// protocol
Requires hostname and database name
Supports multiple URL formats

Sources: 
packages/cli/src/utils/get-config.ts
550-996

Configuration Validation

The system provides comprehensive validation for configuration settings and environment setup.

Configuration Schema
Environment Validation

The system validates environment configuration through multiple layers:

API Key Validation:

Format checking (prefixes, length)
Test API calls where possible
Secure storage with process.env updates

Database Validation:

URL format validation for PostgreSQL
Directory accessibility for PGLite
Connection testing capabilities

Path Validation:

Directory existence checking
Permission validation
Automatic directory creation

Sources: 
packages/cli/src/utils/get-config.ts
1046-1071
 
packages/cli/src/utils/get-config.ts
119-141
