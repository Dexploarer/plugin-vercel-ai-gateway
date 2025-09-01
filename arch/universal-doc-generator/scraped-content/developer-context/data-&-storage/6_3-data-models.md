# Data Models | elizaOS/eliza | DeepWiki

**URL:** https://deepwiki.com/elizaOS/eliza/6.3-data-models
**Category:** Data & Storage
**Context:** Developer Context
**Scraped:** 2025-08-31T23:20:30.911Z

---

Data Models
Relevant source files

This document covers the core data structures used throughout ElizaOS, including Entity, Memory, Character, Room, World, and related models that form the foundation of the agent system's data layer. For database integration details, see Database Integration. For memory storage and retrieval mechanisms, see Memory Management.

Overview

ElizaOS uses a set of interconnected data models to represent agents, users, conversations, relationships, and system configuration. These models support features like multi-platform identity management, encrypted settings, role-based permissions, and semantic memory storage.

Core Data Models
Entity Model

The Entity represents any participant in the system - users, agents, or other entities that can interact within rooms and worlds.

has

Entity

UUID

id

string[]

names

object

metadata

Component[]

components

Component

UUID

sourceEntityId

object

data

string

platform

Entity Structure:

id: Unique identifier (UUID)
names: Array of display names or aliases
metadata: Platform-specific data storage
components: Platform-specific data containers

Components store platform-specific information like usernames, handles, and profile data. The component system allows entities to have different identities across platforms while maintaining a unified core identity.

Sources: 
packages/core/src/entities.ts
1-406

Memory Model

The Memory model represents stored messages, conversations, and interactions between entities.

belongs_to

stored_in

Memory

UUID

id

UUID

entityId

UUID

roomId

object

content

timestamp

createdAt

boolean

unique

Entity

Room

Memory Features:

Links messages to specific entities and rooms
Supports reply threading via content.inReplyTo
Enables semantic search and relationship building
Used for context retrieval in conversations

The memory system supports both direct message storage and semantic embedding for intelligent context retrieval.

Sources: 
packages/core/src/entities.ts
83-127

Character Model

The Character model defines an agent's personality, capabilities, and configuration.

Encryption Layer

Character

settings

secrets

public settings

encrypted secrets

encrypted secrets

encryptStringValue()

decryptStringValue()

Character Structure:

Contains agent personality and behavior configuration
Supports encrypted storage of sensitive data (API keys, passwords)
Settings can be public or secret with encryption
Integrates with plugin system for dynamic capabilities

The character system uses AES-256-CBC encryption for sensitive data, with salt-based key derivation for security.

Sources: 
packages/core/src/settings.ts
332-372

World Model

The World represents a server, community, or organizational context that contains rooms and manages user roles.

World

metadata

roles

ownership

settings

Room[]

Entity[]

entityId -> Role

ownerId

encrypted settings

World Features:

Role-based access control (OWNER, ADMIN, NONE)
Hierarchical organization of rooms
World-specific settings and configuration
Ownership tracking and permissions

Sources: 
packages/core/src/roles.ts
15-85

Room Model

The Room represents a conversation space within a world where entities interact.

belongs_to

contains

has_messages

Room

UUID

id

string

name

UUID

worldId

string

source

object

metadata

World

Entity

Memory

Room Features:

Links to parent world for permission inheritance
Contains entities (participants)
Stores conversation messages as memories
Platform-agnostic conversation containers

Sources: 
packages/core/src/entities.ts
142-147

Relationship Model

The Relationship tracks connections and interaction strength between entities.

Relationship

Relationship Metadata

interaction_count

recent_messages

relationship_strength

Entity A

Entity B

Relationship Features:

Tracks interaction frequency between entities
Stores relationship metadata and strength
Supports bidirectional connections
Used for entity resolution and context ranking

Sources: 
packages/core/src/entities.ts
73-127

Setting Model

The Setting model provides configuration management with encryption support.

true

false

Setting

name

value

secret?

required?

validation

dependsOn[]

encryptStringValue()

store plaintext

encrypted value

plaintext value

Setting Features:

Public and secret (encrypted) settings
Validation rules and dependencies
Conditional visibility (visibleIf)
Action triggers (onSetAction)

Sources: 
packages/core/src/settings.ts
24-38

Data Relationships
Entity Resolution System

The entity resolution system enables natural language references to entities within conversations.

"ModelType.TEXT_SMALL"
"findEntityByName()"
"AgentRuntime"
User
"ModelType.TEXT_SMALL"
"findEntityByName()"
"AgentRuntime"
User
"tell @john about the meeting"
findEntityByName(message, state)
getEntitiesForRoom()
getRecentInteractions()
entityResolutionTemplate + context
resolution response
resolved Entity
message sent to john

Entity Resolution Process:

Extracts entity references from messages
Gathers room entities and relationships
Uses LLM to resolve ambiguous references
Returns matched entity with filtered components

Sources: 
packages/core/src/entities.ts
137-298

World Settings Management

World settings provide encrypted configuration storage at the server level.

Encryption Layer

WorldSettings

Setting A

Setting B

Setting C

getSalt()

saltWorldSettings()

store in world.metadata

unsaltWorldSettings()

return decrypted

World Settings Features:

Server-level configuration management
Automatic encryption of secret settings
Onboarding configuration initialization
Persistent storage in world metadata

Sources: 
packages/core/src/settings.ts
233-324

UUID Generation and Identity

ElizaOS uses deterministic UUID generation for consistent entity identification across sessions.

Special Cases

true

false

baseUserId

combine with agentId

agentId

stringToUuid()

deterministic UUID

baseUserId == agentId?

return agentId

The createUniqueUuid() function ensures consistent entity identification while maintaining uniqueness per agent-user combination.

Sources: 
packages/core/src/entities.ts
307-319

Data Access Patterns
Component Filtering

Entity components are filtered based on permissions and world roles to ensure data privacy.

true

true

true

false

false

false

Entity with Components

Filter Components

sourceEntityId == requesterId?

sourceEntityId is OWNER/ADMIN?

sourceEntityId == agentId?

Include Component

Exclude Component

Filtered Entity

This permission system ensures users only see data they have access to, maintaining privacy across multi-user environments.

Sources: 
packages/core/src/entities.ts
154-181
