# Character System | elizaOS/eliza | DeepWiki

**URL:** https://deepwiki.com/elizaOS/eliza/2.2-character-system
**Category:** Architecture & Core Concepts
**Context:** Developer Context
**Scraped:** 2025-08-31T23:19:25.849Z

---

Character System
Relevant source files

The Character System defines agent personalities, capabilities, and behavior through structured configuration files that dynamically load plugins based on environment variables and API credentials. This system enables the creation of diverse AI agents with specific traits, knowledge domains, and platform integrations.

For information about plugin development and architecture, see Plugin System. For details about agent runtime execution, see AgentRuntime.

Character Structure

Characters in ElizaOS are defined using the Character interface, which specifies an agent's personality, capabilities, and behavior patterns through structured configuration.

Core Character Components

Sources: 
packages/cli/src/characters/eliza.ts
7-264
 
packages/project-starter/src/character.ts
9-141

Character Properties
Property	Type	Purpose
name	string	Agent display name
plugins	string[]	Ordered list of plugin package names
system	string	Core system prompt defining behavior
bio	string[]	Agent background and personality traits
topics	string[]	Knowledge domains and discussion areas
messageExamples	MessageExample[][]	Conversation templates
postExamples	string[]	Sample social media posts
style	StyleConfig	Communication style guidelines
settings	CharacterSettings	Configuration and secrets

Sources: 
packages/cli/src/characters/eliza.ts
7-217

Dynamic Plugin Configuration

The Character System implements environment-aware plugin loading that automatically detects available API credentials and configures appropriate plugins in priority order.

Plugin Loading Architecture

Sources: 
packages/cli/src/characters/eliza.ts
225-264
 
packages/cli/tests/unit/characters/character-plugin-ordering.test.ts
1-450

Environment Variable Mapping

The getElizaCharacter() function dynamically loads plugins based on detected environment variables:

Environment Variable	Plugin	Category
ANTHROPIC_API_KEY	@elizaos/plugin-anthropic	Text-Only AI
OPENROUTER_API_KEY	@elizaos/plugin-openrouter	Text-Only AI
OPENAI_API_KEY	@elizaos/plugin-openai	Embedding-Capable AI
GOOGLE_GENERATIVE_AI_API_KEY	@elizaos/plugin-google-genai	Embedding-Capable AI
DISCORD_API_TOKEN	@elizaos/plugin-discord	Platform
TELEGRAM_BOT_TOKEN	@elizaos/plugin-telegram	Platform
TWITTER_API_KEY + 3 others	@elizaos/plugin-twitter	Platform

Sources: 
packages/cli/src/characters/eliza.ts
231-247

Plugin Ordering System

The Character System enforces a strict plugin loading order to ensure proper fallback behavior for different AI capabilities.

Plugin Priority Rules

Sources: 
packages/cli/tests/unit/characters/README.md
45-53
 
packages/cli/tests/unit/characters/character-plugin-ordering.test.ts
182-205

The ordering ensures:

Text-only providers (Anthropic, OpenRouter) load before embedding-capable providers
Embedding-capable providers (OpenAI, Google GenAI) serve as fallbacks for embeddings
Ollama always loads as universal local AI fallback
Platform plugins load after AI providers

Sources: 
packages/cli/tests/unit/characters/character-plugin-ordering.test.ts
125-178

Character Creation Process

The CLI provides commands for creating new character files and configuring them with appropriate plugins and environment settings.

Character Creation Workflow

Sources: 
packages/cli/src/commands/create/actions/creators.ts
189-241
 
packages/cli/src/commands/create/index.ts
175-177

Character Template Structure

The createAgent() function generates character files using the base Eliza template with customized properties:

const agentCharacter = {
  ...getElizaCharacter(),
  name: agentName,
  bio: [
    `${agentName} is a helpful AI assistant...`,
    `${agentName} is knowledgeable, creative...`,
  ],
};

Sources: 
packages/cli/src/commands/create/actions/creators.ts
221-228

Character Examples

The codebase includes several character implementations demonstrating different configurations and use cases.

Eliza Character (Base Template)

The default Eliza character provides a helpful, conversational AI assistant with comprehensive plugin support:

Sources: 
packages/cli/src/characters/eliza.ts
7-217
 
packages/project-starter/src/character.ts
9-141

Mr. TEE Character (Specialized)

The Mr. TEE character demonstrates a specialized security-focused agent with custom plugins and voice capabilities:

Specialized Plugins: @elizaos/plugin-tee, @elizaos/plugin-redpill, @elizaos/plugin-elevenlabs
Security Focus: TEE (Trusted Execution Environment) expertise
Custom Personality: Military drill sergeant style with security paranoia
Voice Integration: ElevenLabs TTS configuration

Sources: 
packages/project-tee-starter/src/character.ts
19-271

Environment-Based Plugin Selection

The Character System implements sophisticated logic for selecting and ordering plugins based on available API credentials and configuration.

AI Model Selection Logic

Sources: 
packages/cli/src/characters/eliza.ts
231-257
 
packages/cli/tests/unit/characters/character-plugin-ordering.test.ts
88-123

Environment Configuration Management

The setup system handles API key configuration for different AI providers:

AI Model	Configuration Function	Environment Variables
local (Ollama)	promptAndStoreOllamaConfig()	OLLAMA_API_ENDPOINT, OLLAMA_MODEL
openai	promptAndStoreOpenAIKey()	OPENAI_API_KEY
claude	promptAndStoreAnthropicKey()	ANTHROPIC_API_KEY
openrouter	promptAndStoreOpenRouterKey()	OPENROUTER_API_KEY
google	promptAndStoreGoogleKey()	GOOGLE_GENERATIVE_AI_API_KEY

Sources: 
packages/cli/src/commands/create/actions/setup.ts
26-171

Character Integration with Runtime

Characters integrate with the AgentRuntime system through the plugin loading and configuration mechanism.

Runtime Character Loading

Sources: 
packages/cli/src/commands/create/actions/creators.ts
189-241
 
packages/project-starter/src/index.ts
6-16

The character configuration directly influences:

Plugin loading order in AgentRuntime
Available actions and evaluators
AI model provider selection
Platform integration capabilities
Memory and knowledge management settings

Sources: 
packages/cli/tests/unit/characters/character-plugin-ordering.test.ts
419-449
