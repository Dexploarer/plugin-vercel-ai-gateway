# Plugin Management | elizaOS/eliza | DeepWiki

**URL:** https://deepwiki.com/elizaOS/eliza/3.3-plugin-management
**Category:** Plugin Development
**Context:** Developer Context
**Scraped:** 2025-08-31T23:19:44.673Z

---

Plugin Management
Relevant source files

This document covers the ElizaOS CLI's plugin management system, including plugin discovery, installation, management commands, and registry interaction. The plugin management system enables users to discover, install, update, and manage plugins from various sources including the official ElizaOS plugin registry, npm packages, and GitHub repositories.

For information about the plugin architecture and development, see Plugin Architecture. For creating custom plugins, see Creating Plugins.

Plugin Registry System

The ElizaOS CLI uses a centralized registry system to discover and manage plugins. The registry provides a unified interface for accessing plugins from multiple sources.

Registry Architecture

Registry Data

Plugin Discovery

Registry Source

elizaos-plugins/registry
generated-registry.json
GitHub Raw Content

Unsupported markdown: link
elizaos-plugins/registry/
refs/heads/main/generated-registry.json

fetchPluginRegistry()
HTTP Fetch

JSON Parsing
CachedRegistry Type

Error Handling
Returns null on failure

CachedRegistry
lastUpdatedAt + registry

VersionInfo
git/npm/supports

RawRegistry
Simple name mappings

The registry system fetches plugin metadata directly from a centralized GitHub repository, with simple error handling that returns null when the registry is unavailable.

Sources: 
packages/cli/src/utils/plugin-discovery.ts
4-18
 
packages/cli/src/types/plugins.ts
1-31

Registry Data Structure

The registry maintains plugin information in a structured format:

Component	Type	Description
RawRegistry	Record<string, string>	Simple npm package name to GitHub repo mapping
VersionInfo	Object	Detailed version and source information
CachedRegistry	Object	Timestamped registry with detailed plugin metadata

The registry supports both simple string mappings and complex version information:

// Simple registry format
{
  "@elizaos/plugin-discord": "github:elizaos-plugins/plugin-discord",
  "@elizaos/plugin-telegram": "github:elizaos-plugins/plugin-telegram"
}

// Detailed version format
{
  git: { repo: "owner/repo", v1: { version: "1.0.0", branch: "main" } },
  npm: { repo: "@elizaos/plugin-name", v1: "1.0.0" },
  supports: { v0: false, v1: true }
}

Sources: 
packages/cli/src/types/plugins.ts
1-31
 
packages/cli/src/utils/registry/index.ts
194-221

Plugin Discovery and Installation

The plugin installation system supports multiple installation methods and sources with automatic fallback mechanisms.

Installation Flow

Verification

Installation Methods

Source Resolution

Input Processing

User Input
Plugin Name

normalizePluginName()
Generate Variants

detectPluginContext()
Check Self-Install

GitHub URL Pattern
github:owner/repo

fetchPluginRegistry()
Registry Lookup

Direct Package Name
npm/GitHub fallback

executeInstallation()
Primary Install

executeInstallationWithFallback()
GitHub Fallback

runBunCommand(['add', package])
Package Manager

loadPluginModule()
Import Test

verifyPluginImport()
Validation

removeFromBunLock()
Cleanup on Failure

The installation system implements a comprehensive fallback strategy to handle various plugin sources and potential installation failures.

Sources: 
packages/cli/src/utils/install-plugin.ts
121-250
 
packages/cli/src/utils/package-manager.ts
96-134
 
packages/cli/src/utils/package-manager.ts
162-184

Plugin Name Normalization

The normalizePluginName function generates multiple possible plugin name variants to improve discovery success:

Input Format	Generated Variants
ton	ton, plugin-ton, @elizaos/ton, @elizaos/plugin-ton
@elizaos/plugin-discord	@elizaos/plugin-discord, plugin-discord, discord, @elizaos/discord
elizaos/plugin-telegram	elizaos/plugin-telegram, plugin-telegram, telegram, @elizaos/telegram, @elizaos/plugin-telegram

Sources: 
packages/cli/src/utils/registry/index.ts
370-398

Plugin Management Commands

The CLI provides comprehensive plugin management through the plugins command group, which includes discovery, installation, and management operations.

Command Structure

Validation

Core Functions

Plugin Commands

CLI Entry Point

packages/cli/src/index.ts
Command Registration

plugins
Command Group

plugins add
Install Plugin

plugins list
List Installed

plugins search
Discover Plugins

plugins remove
Uninstall Plugin

installPlugin()
Installation Logic

fetchPluginRegistry()
Registry Access

Package Manager
Bun Integration

verifyPluginImport()
Load Test

detectPluginContext()
Self-Install Check

The plugin commands integrate with the broader CLI system and provide user-friendly interfaces for plugin management operations.

Sources: 
packages/cli/src/index.ts
9
 
packages/cli/src/utils/install-plugin.ts
121-250

Installation Context Detection

The system includes smart context detection to prevent problematic installations:

Actions

Context Detection

true

false

detectPluginContext()
Plugin Development Check

isLocalDevelopment
Boolean Flag

Self-Installation
Prevention

Prevent Installation
Show Development Message

Proceed with
Installation

This prevents developers from accidentally installing a plugin into its own development directory.

Sources: 
packages/cli/src/utils/install-plugin.ts
130-138

Package Manager Integration

The ElizaOS CLI exclusively uses Bun as its package manager, with built-in fallback and error handling mechanisms.

Package Manager Architecture

Cleanup

Error Handling

Installation Execution

Package Manager Detection

getPackageManager()
Always Returns 'bun'

isGlobalInstallation()
Installation Context

isRunningViaNpx()
Execution Context

isRunningViaBunx()
Execution Context

getInstallCommand()
['add', '-g'?]

runBunCommand()
Command Execution

executeInstallation()
Full Process

ENOENT Detection
Command Not Found

displayBunInstallationTipCompact()
Help Message

autoInstallBun()
Automatic Setup

removeFromBunLock()
Lockfile Cleanup

Circular Dependency
Prevention

The package manager integration provides robust error handling and automatic installation capabilities.

Sources: 
packages/cli/src/utils/package-manager.ts
14-17
 
packages/cli/src/utils/package-manager.ts
96-134
 
packages/cli/src/utils/package-manager.ts
60-83

Installation Methods

The system supports multiple installation methods with automatic fallback:

Method	Source	Example
npm Registry	@elizaos/plugin-name	Standard scoped packages
GitHub Direct	github:owner/repo	Direct repository installation
GitHub HTTPS	https://github.com/owner/repo	URL-based installation
Registry Lookup	Plugin name resolution	Automatic source detection

Sources: 
packages/cli/src/utils/install-plugin.ts
142-155
 
packages/cli/src/utils/package-manager.ts
96-134

Plugin Validation and Verification

The plugin system includes comprehensive validation to ensure plugins are properly installed and functional.

Verification Process

Error Handling

Import Validation

Installation Verification

false

true

Installation Success
Package Manager Result

Skip Verification
Environment Flag

loadPluginModule()
Dynamic Import

Module Loading
require() / import()

Export Validation
Plugin Interface Check

Verification Logging
Success/Failure

Import Failure
Module Not Found

User Warning
Installation Issues

Lockfile Cleanup
Failed Installation

The verification system ensures that installed plugins can be properly loaded and used by the ElizaOS runtime.

Sources: 
packages/cli/src/utils/install-plugin.ts
47-59
 
packages/cli/src/utils/load-plugin.ts
 (referenced), 
packages/cli/src/utils/install-plugin.ts
93-97

Verification Configuration

The verification process can be controlled through environment variables:

Variable	Purpose	Default
ELIZA_SKIP_PLUGIN_VERIFY	Skip import verification	false
ELIZA_NO_AUTO_INSTALL	Disable automatic Bun installation	false

Sources: 
packages/cli/src/utils/install-plugin.ts
93-97
 
packages/cli/src/index.ts
38-41

Registry Publishing Workflow

The CLI includes comprehensive publishing capabilities for both plugins and projects to the ElizaOS ecosystem.

Publishing Architecture

Registry Integration

Publishing Process

GitHub Operations

Publishing Validation

testPublishToNpm()
NPM Permissions

testPublishToGitHub()
GitHub Access

Package Validation
packageType Check

createGitHubRepository()
Repository Creation

forkRepository()
Registry Fork

createBranch()
Version Branch

updateFile()
Registry Update

publishToNpm()
NPM Publishing

publishToGitHub()
GitHub Publishing

createPullRequest()
Registry PR

getRegistrySettings()
Configuration

Index.json Update
Package Registration

Package Metadata
JSON Creation

The publishing system provides end-to-end workflow management for contributing plugins to the ElizaOS ecosystem.

Sources: 
packages/cli/src/utils/publisher.ts
225-513
 
packages/cli/src/utils/publisher.ts
77-185
 
packages/cli/src/utils/publisher.ts
41-65

Package Type Support

The publishing system supports different package types with appropriate workflows:

Package Type	Registry Update	GitHub Repository	NPM Publishing
plugin	✅ Yes	✅ Yes	✅ Optional
project	❌ No	✅ Yes	✅ Optional

Sources: 
packages/cli/src/utils/publisher.ts
241-255
 
packages/cli/src/utils/publisher.ts
304-324
