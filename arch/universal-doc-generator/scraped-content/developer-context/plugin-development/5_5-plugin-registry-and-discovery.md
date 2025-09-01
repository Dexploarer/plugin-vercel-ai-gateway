# Plugin Registry and Discovery | elizaOS/eliza | DeepWiki

**URL:** https://deepwiki.com/elizaOS/eliza/5.5-plugin-registry-and-discovery
**Category:** Plugin Development
**Context:** Developer Context
**Scraped:** 2025-08-31T23:19:44.673Z

---

Plugin Registry and Discovery
Relevant source files

This document covers ElizaOS's plugin registry and discovery system, which enables automatic discovery, installation, and management of community plugins through the CLI. The registry provides a centralized catalog of available plugins with version information and installation sources.

For information about creating custom plugins, see Creating Plugins. For details on the core plugin architecture, see Plugin Architecture.

Purpose and Architecture

The plugin registry system allows the ElizaOS CLI to discover available plugins from a remote GitHub-hosted registry, validate their compatibility, and install them automatically. The system supports both npm packages and direct GitHub installations, with version tracking for ElizaOS v0 and v1 compatibility.

Registry Data Architecture

Sources: 
packages/cli/src/utils/plugin-discovery.ts
1-18
 
packages/cli/src/types/plugins.ts
1-31

Registry Data Structure

The plugin registry uses a hierarchical data structure to track plugin information and version compatibility:

Component	Type	Purpose
CachedRegistry	Interface	Root registry structure with timestamp
VersionInfo	Interface	Plugin version and installation details
RawRegistry	Type	Simple mapping of npm names to GitHub repos
supports	Object	ElizaOS version compatibility flags
VersionInfo Structure

The VersionInfo interface tracks installation sources and compatibility:

Sources: 
packages/cli/src/types/plugins.ts
4-25

Plugin Discovery Process

The discovery system fetches registry data from GitHub and processes it for CLI consumption:

fetchPluginRegistry Function

The core discovery function retrieves the registry from a remote GitHub repository:

Sources: 
packages/cli/src/utils/plugin-discovery.ts
4-18

The function implements error handling by returning null when the registry is unavailable, allowing the CLI to gracefully handle network issues or registry downtime.

Integration with CLI Commands

The plugin discovery system integrates with various CLI commands to provide plugin management capabilities:

CLI Plugin Management Flow

Sources: 
packages/cli/src/utils/plugin-discovery.ts
1-18
 
packages/cli/src/types/plugins.ts
27-30

Production Validation and Testing

The plugin registry system includes automated validation through CI/CD pipelines to ensure registry availability and plugin installation reliability:

Automated Registry Testing

The system runs production validation tests that verify:

Registry accessibility and response validity
Plugin installation from registry sources
CLI command integration with registry data
Error handling for registry unavailability

Sources: 
.github/workflows/cli-prod-validation.yml
1-99

Error Handling and Resilience

The discovery system implements robust error handling to maintain CLI functionality even when the registry is unavailable:

Network failures: Returns null instead of throwing exceptions
Invalid responses: Logs errors and gracefully degrades functionality
JSON parsing errors: Caught and handled without breaking CLI operations
Registry downtime: CLI continues to function with cached or local plugin information

The logger integration provides visibility into registry issues while maintaining system stability.

Sources: 
packages/cli/src/utils/plugin-discovery.ts
10-16
