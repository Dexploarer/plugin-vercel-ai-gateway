# Model Providers | elizaOS/eliza | DeepWiki

**URL:** https://deepwiki.com/elizaOS/eliza/2.4-model-providers
**Category:** Architecture & Core Concepts
**Context:** Developer Context
**Scraped:** 2025-08-31T23:19:25.849Z

---

Model Providers
Relevant source files

This document covers ElizaOS's model provider system, which abstracts AI model integration and enables agents to work with multiple AI providers through a unified interface. The system supports text generation, embeddings, and other AI model capabilities from providers like OpenAI, Anthropic, Ollama, and others.

For information about character-specific model settings, see Character System. For database adapter configuration, see Data and Storage.

Architecture Overview

The model provider system consists of a registration-based architecture where plugins register model handlers for specific model types. The AgentRuntime manages these providers through a centralized registry and routes model calls to appropriate handlers.

Model Provider System Architecture

Sources: 
packages/core/src/runtime.ts
108
 
packages/core/src/runtime.ts
286-294
 
packages/core/src/runtime.ts
432

Model Registration System

Models are registered through the plugin system during runtime initialization. Each plugin can provide model handlers for different model types, and the runtime maintains multiple handlers per type for fallback and load balancing.

Registration Process

The model registration occurs in the registerPlugin method where plugins specify their model capabilities:

Step	Component	Description
1	Plugin Definition	Plugin defines models object with model type mappings
2	Runtime Registration	registerModel() called for each model type
3	Handler Storage	Handlers stored in models Map with priority
4	Availability Check	Runtime validates model availability during initialization

The registration process handles priority ordering and allows multiple providers for the same model type.

Sources: 
packages/core/src/runtime.ts
286-295
 
packages/core/src/runtime.ts
222-323

Model Types and Handlers

ElizaOS defines several core model types that providers can implement. Each type serves specific purposes within the agent's capabilities.

Core Model Types
ModelHandler Interface

Each model provider implements the ModelHandler interface which defines the contract for model execution. The handler receives typed parameters and returns typed results based on the model type.

The ModelParamsMap and ModelResultMap types ensure type safety across different model types and their expected inputs/outputs.

Sources: 
packages/core/src/runtime.ts
30-32
 
packages/core/src/runtime.ts
46

Provider Integration

The system integrates with multiple AI providers through environment-based configuration and plugin-specific implementations. Each provider plugin handles authentication, rate limiting, and provider-specific features.

Supported Providers and Configuration

Each provider plugin manages its own configuration, error handling, and model-specific features while conforming to the standard ModelHandler interface.

Sources: 
.env.example
40-56

Model Usage and Execution

The runtime provides model access through the getModel() method, which returns the appropriate handler for a given model type. During execution, the system tracks model calls and manages context for debugging and optimization.

Model Call Flow

The model execution flow includes prompt tracking, error handling, and result processing:

Model Retrieval: getModel(ModelType.*) returns appropriate handler
Context Setup: Current action context tracks prompts and calls
Handler Execution: Provider-specific handler processes the request
Result Processing: Typed results returned to calling component
Logging: Model calls logged with prompts and metadata
Prompt Tracking System

The system maintains detailed logs of all model interactions for debugging, optimization, and cost tracking purposes.

Sources: 
packages/core/src/runtime.ts
124-134
 
packages/core/src/runtime.ts
756-761
 
packages/core/src/runtime.ts
920-941

Configuration and Settings

Model providers are configured through environment variables and character-specific settings. The system supports runtime configuration changes and provider fallbacks.

Configuration Hierarchy
Priority	Source	Description
1	Character Settings	Agent-specific model preferences
2	Environment Variables	Global provider configuration
3	Plugin Defaults	Default settings from provider plugins
4	System Defaults	Fallback configuration
Model Settings Management

The MODEL_SETTINGS constant and character configuration work together to determine which models and providers are used for different operations. The runtime validates model availability during initialization and provides fallback mechanisms.

Settings can include:

Provider API endpoints and keys
Model-specific parameters (temperature, max tokens, etc.)
Embedding dimensions and search thresholds
Rate limiting and retry configuration
Cost optimization settings

Sources: 
packages/core/src/runtime.ts
16
 
packages/core/src/runtime.ts
432-439
 
.env.example
38-56
