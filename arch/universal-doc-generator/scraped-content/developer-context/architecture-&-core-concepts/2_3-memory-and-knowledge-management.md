# Memory and Knowledge Management | elizaOS/eliza | DeepWiki

**URL:** https://deepwiki.com/elizaOS/eliza/2.3-memory-and-knowledge-management
**Category:** Architecture & Core Concepts
**Context:** Developer Context
**Scraped:** 2025-08-31T23:19:25.849Z

---

Memory and Knowledge Management
Relevant source files

This document covers ElizaOS's memory and knowledge management systems, which enable agents to store, retrieve, and utilize information across conversations. The system provides semantic search capabilities, fact storage, and context-aware memory retrieval to give agents persistent knowledge and conversational memory.

For database integration and storage mechanisms, see Database Integration. For detailed data structures and models, see Data Models. For the core runtime coordination, see AgentRuntime.

System Overview

ElizaOS implements a multi-layered memory and knowledge management architecture that combines structured data storage with semantic search capabilities. The system stores different types of memories in dedicated tables and uses embedding-based similarity search to retrieve relevant information based on conversational context.

Sources: 
packages/plugin-bootstrap/src/providers/facts.ts
1-121

Facts Provider System

The factsProvider is the primary component for knowledge retrieval in ElizaOS. It implements intelligent fact gathering by combining recent conversation context with semantic search to find relevant stored knowledge.

Core Functionality

The facts provider operates through several key steps:

Step	Description	Method
Context Gathering	Retrieves recent messages for context	runtime.getMemories()
Embedding Generation	Creates embeddings from recent conversation	runtime.useModel(ModelType.TEXT_EMBEDDING)
Semantic Search	Finds relevant facts using embeddings	runtime.searchMemories()
Deduplication	Removes duplicate facts from results	Array filtering by ID
Formatting	Formats facts for agent consumption	formatFacts()

Sources: 
packages/plugin-bootstrap/src/providers/facts.ts
30-118

Search Strategy

The facts provider implements a dual-search approach to maximize knowledge retrieval relevance:

Relevance-Based Search: Searches the entire facts table using embeddings from recent conversation context
Entity-Specific Search: Searches facts specifically related to the current entity (user/agent)

Both searches use the same embedding vector but different scoping parameters:

// Relevance-based search (broader scope)
runtime.searchMemories({
  tableName: 'facts',
  embedding,
  roomId: message.roomId,
  worldId: message.worldId,
  count: 6,
  query: message.content.text,
})

// Entity-specific search (narrower scope)
runtime.searchMemories({
  embedding,
  query: message.content.text,
  tableName: 'facts',
  roomId: message.roomId,
  entityId: message.entityId,
  count: 6,
})

Sources: 
packages/plugin-bootstrap/src/providers/facts.ts
54-71

Semantic Search Architecture

ElizaOS leverages embedding-based semantic search to find contextually relevant information. The system generates embeddings from conversation text and uses vector similarity to locate related memories.

Embedding Generation

The system uses the last 5 messages from the conversation to create context embeddings:

The embedding captures the conversational context, allowing the system to find facts that are semantically related to the current discussion topic.

Sources: 
packages/plugin-bootstrap/src/providers/facts.ts
45-52

Memory Tables

The system organizes different types of memories in dedicated database tables:

Table	Purpose	Search Method
facts	Persistent knowledge and learned information	Embedding-based semantic search
messages	Conversation history	Recent retrieval with optional embedding search
entities	Information about users, agents, and other entities	Entity-specific searches

Each table supports both direct retrieval (by time, count, etc.) and semantic search using embeddings.

Sources: 
packages/plugin-bootstrap/src/providers/facts.ts
37-42
 
packages/plugin-bootstrap/src/providers/facts.ts
55-71

Knowledge Retrieval Workflow

The complete knowledge retrieval process integrates multiple data sources and search strategies:

The provider returns structured data that includes:

values.facts: Formatted fact text for template injection
data.facts: Raw Memory objects for programmatic access
text: Human-readable summary of the retrieved facts

Sources: 
packages/plugin-bootstrap/src/providers/facts.ts
96-104

Error Handling and Fallbacks

The facts provider implements robust error handling to ensure system stability:

When no facts are found, the system returns a graceful response indicating no facts are available rather than failing.

Sources: 
packages/plugin-bootstrap/src/providers/facts.ts
105-117
 
packages/plugin-bootstrap/src/providers/facts.ts
78-87

Integration with Agent Runtime

The facts provider integrates seamlessly with the broader AgentRuntime system as a dynamic provider. The runtime automatically invokes the provider during state composition, ensuring that relevant knowledge is always available for response generation.

The provider's output is injected into the agent's context through template variables, allowing the agent's character and response generation to access retrieved facts naturally within conversation flow.

Sources: 
packages/plugin-bootstrap/src/providers/facts.ts
30-33
