# Settings and Configuration | elizaOS/eliza | DeepWiki

**URL:** https://deepwiki.com/elizaOS/eliza/2.5-settings-and-configuration
**Category:** Server & Infrastructure
**Context:** Developer Context
**Scraped:** 2025-08-31T23:20:19.544Z

---

Settings and Configuration
Relevant source files

This document covers the core settings management system in ElizaOS, including encryption of sensitive data, environment-based configuration, and dynamic settings for agents and worlds. The system provides secure storage and retrieval of configuration values with automatic encryption for sensitive data.

For information about CLI-based environment configuration and API key management, see Environment Configuration. For character definition and personality configuration, see Character System.

Setting System Architecture

The ElizaOS settings system is built around the Setting interface and provides secure storage of configuration values with encryption for sensitive data. Settings can be scoped to individual worlds (servers) or globally applied to characters.

Core Setting Structure

Settings are created using the createSettingFromConfig function which transforms configuration objects into fully-formed Setting instances with default values applied.

Sources: 
packages/core/src/settings.ts
24-38

Setting Types and Properties
Property	Type	Purpose
name	string	Unique identifier for the setting
description	string	Human-readable description
usageDescription	string	Instructions for how to use the setting
value	any	The actual setting value (null by default)
required	boolean	Whether the setting must be provided
validation	RegExp | null	Regular expression for value validation
public	boolean	Whether the setting can be publicly accessed
secret	boolean	Whether the setting should be encrypted
dependsOn	string[]	List of other settings this depends on
onSetAction	string | null	Action to trigger when setting is changed
visibleIf	string | null	Condition for when setting should be visible

Sources: 
packages/core/src/settings.ts
24-38

Encryption and Security

The settings system provides automatic encryption for sensitive configuration values using AES-256-CBC encryption. Secret settings are automatically encrypted when stored and decrypted when retrieved.

Salt and Key Management

The getSalt() function retrieves the encryption salt from the SECRET_SALT environment variable, falling back to a default value if not set. The encryption process uses this salt to generate a consistent 32-byte key for AES-256-CBC encryption.

Sources: 
packages/core/src/settings.ts
45-59
 
packages/core/src/settings.ts
67-111
 
packages/core/src/settings.ts
119-172

Automatic Encryption for Secret Settings

The system automatically applies encryption to settings marked as secret: true:

Functions like saltSettingValue and unsaltSettingValue handle the automatic encryption and decryption of secret settings during storage and retrieval operations.

Sources: 
packages/core/src/settings.ts
178-202

World and Environment Configuration

Settings can be scoped to specific worlds (servers) and are stored in world metadata with automatic encryption applied to sensitive values.

World Settings Management

World settings are stored in the world.metadata.settings field and are automatically encrypted/decrypted based on the secret flag of individual settings.

Sources: 
packages/core/src/settings.ts
233-284
 
packages/core/src/settings.ts
289-325

Setting Storage Flow

The system uses a deterministic UUID generation approach to associate settings with specific servers:

UUID Generation: createUniqueUuid(runtime, serverId) creates a consistent world ID
World Retrieval: getWorld(worldId) fetches the world object
Settings Encryption: saltWorldSettings() encrypts all secret settings
Metadata Storage: Settings are stored in world.metadata.settings
World Update: updateWorld() persists the changes to the database

Sources: 
packages/core/src/entities.ts
307-319
 
packages/core/src/settings.ts
207-228

Character Configuration

Settings are also applied at the character level, with automatic encryption for sensitive character data like API keys and secrets.

Character Encryption System

Character encryption operates on two key areas:

character.settings.secrets: Settings-specific secrets
character.secrets: General character secrets

Both areas are processed using encryptObjectValues and decryptObjectValues which recursively encrypt all string values in the objects.

Sources: 
packages/core/src/settings.ts
332-372
 
packages/core/src/settings.ts
380-412

Role-based Configuration

The system integrates with role-based access control to determine configuration permissions based on user roles within worlds.

Role Management System

Roles are stored in world.metadata.roles as a mapping from entity IDs to Role enum values. These roles determine which configuration components and settings a user can access.

Sources: 
packages/core/src/roles.ts
32-54
 
packages/core/src/entities.ts
159-178

Configuration Access Control

The role system integrates with settings through component filtering, where configuration components are filtered based on:

Entity Match: Components where sourceEntityId matches the requesting entity
Role-based Access: Components where sourceEntityId has OWNER or ADMIN role
Agent Access: Components where sourceEntityId matches the agent ID

This ensures that sensitive configuration data is only accessible to authorized entities within each world context.

Sources: 
packages/core/src/entities.ts
242-253
