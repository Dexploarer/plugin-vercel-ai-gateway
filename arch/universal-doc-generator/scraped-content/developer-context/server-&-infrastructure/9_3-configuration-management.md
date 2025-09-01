# Configuration Management | elizaOS/eliza | DeepWiki

**URL:** https://deepwiki.com/elizaOS/eliza/9.3-configuration-management
**Category:** Server & Infrastructure
**Context:** Developer Context
**Scraped:** 2025-08-31T23:20:19.544Z

---

Configuration Management
Relevant source files

This document covers the configuration management system in ElizaOS, including settings encryption, world-level configuration, character settings, and environment variable management. The system provides secure handling of sensitive data like API keys, database credentials, and character secrets through encryption and role-based access controls.

For information about deployment-specific configuration, see Production Deployment. For CLI-based environment setup, see Environment Configuration.

Configuration Hierarchy

The ElizaOS configuration system operates at multiple levels, with each level providing specific scopes and security contexts.

Storage Layer

Security Layer

Configuration Levels

Environment Variables
(.env, process.env)

World Settings
(WorldSettings)

Character Configuration
(Character)

Runtime Settings
(IAgentRuntime)

getSalt()
(SECRET_SALT)

encryptStringValue()
decryptStringValue()

Character.secrets
Character.settings.secrets

World.metadata.settings

BaseDrizzleAdapter

Runtime Memory

Sources: 
packages/core/src/settings.ts
1-415
 
packages/core/src/entities.ts
1-407
 
packages/core/src/roles.ts
1-86

Settings System

The core settings system uses the Setting interface to define configurable parameters with validation, encryption, and dependency management.

Setting Structure

Each setting contains metadata for validation, security, and UI rendering:

Property	Type	Description
name	string	Unique identifier for the setting
description	string	Human-readable description
usageDescription	string	Instructions for proper usage
value	any	Current value (encrypted if secret)
required	boolean	Whether setting is mandatory
validation	function	Validation function for values
public	boolean	Whether setting is publicly visible
secret	boolean	Whether setting should be encrypted
dependsOn	string[]	Settings that must be configured first
onSetAction	function	Callback when setting is changed
visibleIf	function	Conditional visibility logic
Setting Creation and Management

Omit

createSettingFromConfig()

Setting

saltSettingValue()

World.metadata.settings

Sources: 
packages/core/src/settings.ts
24-38

The createSettingFromConfig function initializes settings with default values and proper structure. Settings marked as secret: true are automatically encrypted before storage using the saltSettingValue function.

Encryption and Security

ElizaOS implements AES-256-CBC encryption for sensitive configuration data using environment-based salt values.

Encryption Flow

Storage Format

Encryption Process

Raw String Value

getSalt()
(SECRET_SALT env var)

SHA256 Hash
(32 bytes)

Random IV
(16 bytes)

AES-256-CBC

iv:encrypted format

16-byte-hex:encrypted-hex

a1b2c3...d4e5:f6g7h8...i9j0

Sources: 
packages/core/src/settings.ts
67-111
 
packages/core/src/settings.ts
119-172

Key Security Functions
getSalt(): Retrieves encryption salt from SECRET_SALT environment variable
encryptStringValue(value, salt): Encrypts string values with AES-256-CBC
decryptStringValue(value, salt): Decrypts values in iv:encrypted format
saltSettingValue(setting, salt): Applies encryption to secret settings
unsaltSettingValue(setting, salt): Removes encryption from secret settings

The system automatically detects already-encrypted values to prevent double-encryption and handles various data types gracefully.

World Settings Management

World-level settings provide server or community-specific configuration that persists across agent restarts and affects all agents operating in that world.

World Settings Operations

Database Operations

World Settings Flow

initializeOnboarding()

OnboardingConfig

World.metadata.settings

updateWorldSettings()

getWorldSettings()

IAgentRuntime

createUniqueUuid()

BaseDrizzleAdapter

Sources: 
packages/core/src/settings.ts
233-285
 
packages/core/src/settings.ts
289-325

Key World Settings Functions
updateWorldSettings(runtime, serverId, worldSettings): Saves encrypted settings to world metadata
getWorldSettings(runtime, serverId): Retrieves and decrypts settings from world metadata
initializeOnboarding(runtime, world, config): Sets up initial settings configuration
saltWorldSettings(worldSettings, salt): Encrypts all secret settings in a WorldSettings object
unsaltWorldSettings(worldSettings, salt): Decrypts all settings in a WorldSettings object

All world settings are automatically encrypted before database storage and decrypted upon retrieval using the configured salt.

Character Configuration

Character configuration manages agent personalities, capabilities, and secrets. The system supports both public configuration and encrypted sensitive data.

Character Configuration Structure

Data Flow

Encryption Functions

Character Configuration

Character

Character.settings

Character.secrets

Character.settings.secrets

encryptedCharacter()

decryptedCharacter()

encryptObjectValues()

decryptObjectValues()

Character Loading

AgentRuntime

Secure Storage

Sources: 
packages/core/src/settings.ts
332-372
 
packages/core/src/settings.ts
380-412

Character Security Functions
encryptedCharacter(character): Creates encrypted copy of character with secure secrets
decryptedCharacter(character, runtime): Returns character with decrypted secrets for runtime use
encryptObjectValues(obj, salt): Encrypts all string values in an object
decryptObjectValues(obj, salt): Decrypts all string values in an object

Character secrets are automatically detected and encrypted in both character.secrets and character.settings.secrets objects. The encryption is transparent to the runtime but ensures sensitive data like API keys are never stored in plaintext.

Role-Based Configuration Access

The configuration system integrates with role-based access controls to ensure proper permission management for configuration changes.

Role Configuration Management

Permission Checks

Role System

EntityId

ServerId

World.metadata.roles

Role (OWNER/ADMIN/USER/NONE)

getUserServerRole()

createUniqueUuid()

Configuration Access

Sources: 
packages/core/src/roles.ts
32-54
 
packages/core/src/entities.ts
307-319

Role-Based Access Functions
getUserServerRole(runtime, entityId, serverId): Gets user's role in a specific server/world
findWorldsForOwner(runtime, entityId): Finds all worlds where user has owner permissions
createUniqueUuid(runtime, baseUserId): Creates deterministic UUIDs for user-agent combinations

Configuration access is controlled through world metadata roles, ensuring only authorized users can modify sensitive settings.

Environment Configuration Integration

The configuration system integrates with environment variables and CLI tooling for development and deployment scenarios.

Environment Variable Flow

Security Processing

Configuration Loading

Environment Sources

process.env

import.meta.env

.env files

SECRET_SALT

API Keys

Database URLs

Runtime Settings

getSalt()

Encryption Functions

Secure Storage

Sources: 
packages/core/src/settings.ts
45-59

The getSalt() function provides a unified interface for accessing the encryption salt from either Node.js process.env or browser import.meta.env, ensuring compatibility across different runtime environments.
