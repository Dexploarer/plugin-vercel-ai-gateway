# Agent Management UI | elizaOS/eliza | DeepWiki

**URL:** https://deepwiki.com/elizaOS/eliza/4.3-agent-management-ui
**Category:** User Interface
**Context:** User Context
**Scraped:** 2025-08-31T23:21:02.950Z

---

Agent Management UI
Relevant source files

The Agent Management UI provides comprehensive interfaces for creating, configuring, and managing AI agents within the ElizaOS framework. This system includes form-based editors, tabbed configuration panels, and specialized components for managing agent properties like plugins, secrets, and avatars.

For information about the core agent runtime system, see AgentRuntime. For details about the CLI-based agent management, see Commands and Usage.

Architecture Overview

The Agent Management UI is built around a central CharacterForm component that provides a flexible, tabbed interface for agent configuration. The system supports both agent creation and editing workflows through wrapper components that handle the specific data flow requirements.

Backend Integration

State Management

Specialized Panels

Main Components

Agent Management Routes

AgentCreatorRoute
/create

AgentSettingsRoute
/:agentId/settings

AgentCreator

AgentSettings

CharacterForm
Core Form Component

PluginsPanel
Plugin Management

SecretPanel
Environment Variables

AvatarPanel
Image Upload

useAgentUpdate
State Hook

usePartialUpdate
Generic Update Logic

createElizaClient
API Integration

agents.createAgent
agents.updateAgent

Sources: 
packages/client/src/routes/createAgent.tsx
1-13
 
packages/client/src/routes/agent-settings.tsx
1-48
 
packages/client/src/components/agent-creator.tsx
1-142
 
packages/client/src/components/agent-settings.tsx
1-270
 
packages/client/src/components/character-form.tsx
1-50

Core Form System

The CharacterForm component serves as the foundation for all agent management interfaces. It implements a schema-driven approach with dynamic tab generation and field validation.

Form Schema Structure

The form is organized into sections corresponding to different aspects of agent configuration:

Data Handlers

Field Types

Form Sections

Basic Info
name, username, system

Content
bio, topics, adjectives

Style
all, chat, post arrays

Custom Components
Plugins, Secret, Avatar

InputField
text, textarea, select

ArrayField
string arrays with ArrayInput

customComponent
React components

handleChange
Standard input handling

updateArray
Array manipulation

handleVoiceModelChange
Plugin dependency handling

Sources: 
packages/client/src/components/character-form.tsx
287-392
 
packages/client/src/components/character-form.tsx
394-414
 
packages/client/src/components/character-form.tsx
469-490

Template System Integration

The form supports agent templates through a dropdown selector that allows users to pre-populate forms with predefined configurations:

Template Function	Purpose
getTemplateById	Retrieves template data by ID
handleTemplateChange	Applies template to current form state
importAgent	Overwrites form fields with template data

Sources: 
packages/client/src/components/character-form.tsx
833-853
 
packages/client/src/config/agent-templates.ts
58

Tabbed Interface System

The UI uses a responsive tabbed interface that adapts to different screen sizes with horizontal scrolling and abbreviated labels on mobile devices.

Navigation Logic

Tab Types

Tab Management

TabsContainer
ref: tabsContainerRef

Scroll Buttons
showLeftScroll, showRightScroll

Responsive Labels
showLabels hook

Schema Tabs
AGENT_FORM_SCHEMA sections

Custom Tabs
customComponents prop

checkScrollButtons
visibility detection

scrollTabs
horizontal navigation

useContainerWidth
responsive behavior

Sources: 
packages/client/src/components/character-form.tsx
121-181
 
packages/client/src/components/character-form.tsx
235-268
 
packages/client/src/components/character-form.tsx
856-867

Specialized Management Panels
Plugin Management Panel

The PluginsPanel provides interface for managing agent plugin dependencies with automatic conflict detection and essential plugin warnings.

UI Elements

Plugin Operations

Plugin Categories

ESSENTIAL_PLUGINS
bootstrap, sql, openai

Voice Model Plugins
providerPluginMap

Available Plugins
from usePlugins hook

handlePluginAdd
with dependency injection

handlePluginRemove
with confirmation dialog

Voice Model Synchronization
automatic plugin addition

Plugin Search Dialog
filtered plugin list

Essential Plugin Confirmation
ESSENTIAL_PLUGINS warning

Plugin Badges
removable with indicators

Sources: 
packages/client/src/components/plugins-panel.tsx
51-67
 
packages/client/src/components/plugins-panel.tsx
142-165
 
packages/client/src/config/voice-models.ts
14-18

Secret Management Panel

The SecretPanel provides comprehensive environment variable and API key management with global/local scope handling and drag-and-drop .env file import.

Validation & UI

Secret Operations

Secret Sources

Agent-Specific Secrets
characterValue.settings.secrets

Global Environment
system.getEnvironment()

Required Secrets
from plugin metadata

addEnv
manual secret addition

handleFileUpload
.env file processing

startEditing/saveEdit
inline editing

removeEnv
with deletion tracking

validateSecrets
required secret checking

toggleSecretVisibility
show/hide values

Raw Editor Modal
bulk editing interface

Sources: 
packages/client/src/components/secret-panel.tsx
61-65
 
packages/client/src/components/secret-panel.tsx
113-159
 
packages/client/src/components/secret-panel.tsx
570-635

State Management Architecture

The Agent Management UI uses a layered state management approach that handles complex nested object updates while tracking changes for optimized API calls.

Update Operations

State Hooks Hierarchy

Change Detection

getChangedFields
diff against initial state

initialAgentRef
comparison baseline

Partial API Updates
only changed fields

useAgentUpdate
Agent-specific operations

usePartialUpdate
Generic nested updates

Agent State Object
with change tracking

updateField
nested path handling

updateSettings
JSONb field management

addArrayItem, removeArrayItem
array manipulation

updateSecret, updateAvatar
domain-specific updates

Sources: 
packages/client/src/hooks/use-agent-update.ts
13-24
 
packages/client/src/hooks/use-partial-update.ts
17-40
 
packages/client/src/hooks/use-agent-update.ts
302-398

Data Flow and API Integration

The system implements a comprehensive data flow from UI interactions to backend persistence with validation and error handling at each stage.

Form Submission Pipeline

API Operations

Submission Paths

Form Submission

handleFormSubmit
form validation entry

ensureAvatarSize
image compression

Secret Validation
required secrets check

MissingSecretsDialog
user confirmation

Direct Submission
validation passed

Cancel Submission
switch to Secret tab

elizaClient.agents.createAgent
new agent creation

elizaClient.agents.updateAgent
partial updates

queryClient.invalidateQueries
cache refresh

Sources: 
packages/client/src/components/character-form.tsx
515-572
 
packages/client/src/components/character-form.tsx
574-601
 
packages/client/src/components/agent-creator.tsx
57-90
 
packages/client/src/components/agent-settings.tsx
59-193

API Client Configuration

The system uses a centralized API client configuration that handles authentication and endpoint routing:

API Method	Endpoint	Purpose
createAgent	POST /agents	Create new agent
updateAgent	PUT /agents/:id	Update existing agent
getAgent	GET /agents/:id	Retrieve agent data
getEnvironment	GET /system/environment	Get global environment variables

Sources: 
packages/client/src/lib/api-client-config.ts
65
 
packages/client/src/components/secret-panel.tsx
218-230
