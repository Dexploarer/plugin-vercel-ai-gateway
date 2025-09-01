# Creating Plugins | elizaOS/eliza | DeepWiki

**URL:** https://deepwiki.com/elizaOS/eliza/5.3-creating-plugins
**Category:** Plugin Development
**Context:** Developer Context
**Scraped:** 2025-08-31T23:19:44.673Z

---

Creating Plugins
Relevant source files

This document covers the creation of custom plugins for ElizaOS using the CLI tooling. It explains the plugin creation workflow, templates, naming conventions, and configuration setup. For information about plugin architecture and interfaces, see Plugin Architecture. For details about core plugin components like actions and providers, see Actions, Evaluators, and Providers.

Plugin Creation Overview

The ElizaOS CLI provides the elizaos create command with plugin-specific options to scaffold new plugins. The plugin creation system uses pre-configured templates to generate the necessary file structure, dependencies, and boilerplate code for extending agent capabilities.

Plugin Creation Workflow

Sources: 
packages/cli/src/commands/create/actions/creators.ts
117-185
 
packages/cli/src/commands/create/index.ts
19-251

Plugin Types and Templates

ElizaOS supports two plugin template types, each designed for different use cases and complexity levels.

Plugin Type	Template Name	Description	Use Case
Quick Plugin	plugin-quick	Backend-only plugin with minimal setup	Simple actions, evaluators, providers
Full Plugin	plugin	Complete plugin with React frontend	Complex plugins requiring UI components

Template Selection Process

Sources: 
packages/cli/src/commands/create/index.ts
142-172
 
packages/cli/src/commands/create/actions/creators.ts
163-169

CLI Commands and Usage
Basic Plugin Creation
# Interactive plugin creation
elizaos create my-plugin --type plugin

# Non-interactive with defaults
elizaos create my-plugin --type plugin --yes

# Quick plugin (backend-only)
elizaos create simple-action --type plugin
# Then select "Quick Plugin (Backend Only)"
Command Structure

The createPlugin function handles the entire plugin creation workflow with the following signature:

async function createPlugin(
  pluginName: string,
  targetDir: string, 
  pluginType: string = 'full',
  isNonInteractive = false
): Promise<void>

Sources: 
packages/cli/src/commands/create/actions/creators.ts
117-122

Plugin Naming and Validation
Naming Conventions

The plugin creation system enforces specific naming conventions to maintain consistency across the ElizaOS ecosystem.

Plugin Name Processing

Sources: 
packages/cli/src/commands/create/actions/creators.ts
124-148
 
packages/cli/src/commands/create/utils
7

Directory Structure Creation

When a plugin is created, the system generates a standardized directory structure:

plugin-my-awesome/
├── package.json
├── tsconfig.json
├── src/
│   ├── index.ts
│   ├── actions/
│   ├── evaluators/
│   └── providers/
├── __tests__/
└── dist/


The validateTargetDirectory function ensures the target location is suitable for plugin creation and handles conflicts with existing directories.

Sources: 
packages/cli/src/commands/create/actions/creators.ts
145-148

Plugin Creation Workflow
Core Creation Process

The plugin creation process follows a structured workflow with error handling and cleanup mechanisms.

Complete Creation Workflow

Sources: 
packages/cli/src/commands/create/actions/creators.ts
162-184

Error Handling and Cleanup

The withCleanupOnInterrupt function provides robust error handling during plugin creation:

// Cleanup mechanism for interrupted operations
const cleanup = () => {
  if (!directoryExistedBefore && existsSync(targetDir)) {
    rmSync(targetDir, { recursive: true, force: true });
  }
};

This ensures that partially created plugins are cleaned up if the process is interrupted by the user (Ctrl+C) or encounters an error.

Sources: 
packages/cli/src/commands/create/actions/creators.ts
50-112

Plugin Integration and Configuration
Character Plugin Loading

Once created, plugins must be integrated into agent characters to be loaded at runtime. The plugin loading system uses environment-based configuration:

Plugin Loading in Character Files

Sources: 
packages/cli/src/characters/eliza.ts
225-264
 
packages/project-starter/src/character.ts
10-38

Plugin Registry Integration

Created plugins can be published to the plugin registry for discovery and installation by other users. The registry system supports automatic plugin detection and validation.

Sources: 
packages/cli/src/commands/create/actions/setup.ts
301-328

Development Commands

After plugin creation, several development commands become available:

# Navigate to plugin directory
cd plugin-my-awesome

# Build the plugin
bun run build

# Development mode with hot reloading
elizaos dev

# Production mode
elizaos start

# Run tests
elizaos test

The CLI automatically generates these commands and displays them as next steps after successful plugin creation.

Sources: 
packages/cli/src/commands/create/actions/creators.ts
174-183

Plugin Templates and Structure
Template System

The template system uses copyTemplateUtil to scaffold plugin files from predefined templates stored in the ElizaOS repository:

plugin-quick: Minimal backend-only template
plugin: Full template with React frontend support

The template copying process preserves file permissions and directory structure while allowing for customization based on the plugin name and type selected.

Sources: 
packages/cli/src/commands/create/actions/creators.ts
164-169
 
packages/cli/src/utils
2

Plugin Structure Standards

All created plugins follow the same structural conventions:

Entry Point: src/index.ts exports the plugin object
Components: Actions, evaluators, and providers in dedicated directories
Tests: __tests__/ directory with test files
Configuration: package.json with proper dependencies and scripts
TypeScript: Full TypeScript support with tsconfig.json

This standardization ensures consistency across the plugin ecosystem and compatibility with the ElizaOS runtime.

Sources: 
packages/project-starter/src/index.ts
1-25
