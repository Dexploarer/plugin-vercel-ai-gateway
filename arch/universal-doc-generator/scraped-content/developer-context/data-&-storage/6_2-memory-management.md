# Memory Management | elizaOS/eliza | DeepWiki

**URL:** https://deepwiki.com/elizaOS/eliza/6.2-memory-management
**Category:** Data & Storage
**Context:** Developer Context
**Scraped:** 2025-08-31T23:20:30.911Z

---

Memory Management
Relevant source files
Purpose and Scope

This document covers the memory management system in ElizaOS, which handles agent memory storage, retrieval, and semantic search capabilities. The system enables agents to maintain contextual awareness by storing and retrieving relevant information from past interactions and learned facts.

For information about the underlying database storage layer, see Database Integration. For details about memory data structures and models, see Data Models.

Memory Architecture Overview

The ElizaOS memory management system consists of several interconnected components that work together to provide intelligent memory storage and retrieval for agents.

Memory Management System Architecture

Memory Processing

Memory Storage

Embedding Generation

Memory Retrieval

factsProvider
Provider

runtime.getMemories()
Recent Messages

runtime.searchMemories()
Semantic Search

runtime.useModel()
TEXT_EMBEDDING

Embedding Model
Text to Vector

messages
Table

facts
Table

BaseDrizzleAdapter
Database Layer

formatFacts()
Text Formatting

Deduplication Logic
Filter by ID

Context Composition
Agent State

Sources: 
packages/plugin-bootstrap/src/providers/facts.ts
1-121

Facts Provider System

The factsProvider is the core component responsible for retrieving and organizing relevant memories for agent context. It implements a sophisticated semantic search system that combines recent message context with stored facts.

Facts Provider Implementation Flow

Result Processing

Parallel Memory Search

Embedding Generation

Context Gathering

Incoming Message
Memory Object

runtime.getMemories()
tableName: messages
count: 10

Extract Last 5 Messages
message.content.text

Join Message Texts
Create Context String

runtime.useModel()
ModelType.TEXT_EMBEDDING
text: last5Messages

Embedding Vector
Numerical Representation

searchMemories()
tableName: facts
roomId + worldId

searchMemories()
tableName: facts
roomId + entityId

Combine Search Results
[...relevantFacts, ...recentFactsData]

Deduplicate by ID
filter((fact, index, self))

formatFacts()
Reverse + Join by Newline

Sources: 
packages/plugin-bootstrap/src/providers/facts.ts
30-118

Memory Search Implementation

The facts provider performs two parallel semantic searches to gather comprehensive context:

Search Type	Table	Scope	Purpose
Relevant Facts	facts	roomId + worldId	Global room knowledge
Recent Facts	facts	roomId + entityId	Entity-specific memories

Both searches use the same embedding vector generated from the last 5 messages, ensuring semantic relevance to the current conversation context.

Sources: 
packages/plugin-bootstrap/src/providers/facts.ts
54-71

Memory Storage and Retrieval
Memory Table Structure

The system uses distinct tables for different types of memories:

messages: Conversation history and interactions
facts: Learned knowledge and extracted information
Retrieval Methods
Method	Purpose	Parameters
runtime.getMemories()	Recent message retrieval	tableName, roomId, count, unique
runtime.searchMemories()	Semantic search	tableName, embedding, roomId, worldId, entityId, count, query

Sources: 
packages/plugin-bootstrap/src/providers/facts.ts
37-42
 
packages/plugin-bootstrap/src/providers/facts.ts
55-70

Semantic Search System
Embedding-Based Retrieval

The semantic search system uses text embeddings to find contextually relevant memories:

Context Creation: Last 5 messages are joined to create search context
Embedding Generation: Text is converted to numerical vectors using ModelType.TEXT_EMBEDDING
Similarity Search: Database searches for memories with similar embedding vectors
Result Ranking: Results ordered by semantic similarity score
Search Parameters
searchMemories({
  tableName: 'facts',
  embedding: embeddingVector,
  roomId: message.roomId,
  worldId: message.worldId,
  count: 6,
  query: message.content.text,
})

Sources: 
packages/plugin-bootstrap/src/providers/facts.ts
50-62

Memory Formatting and Context Integration
Text Formatting

The formatFacts function processes retrieved memories for agent context:

function formatFacts(facts: Memory[]) {
  return facts
    .reverse()
    .map((fact: Memory) => fact.content.text)
    .join('\n');
}
Reverse Order: Most recent facts appear first
Text Extraction: Extracts content.text from Memory objects
Newline Joining: Creates readable multi-line format

Sources: 
packages/plugin-bootstrap/src/providers/facts.ts
16-21

Provider Output Structure

The facts provider returns structured data for agent context:

Field	Type	Purpose
values.facts	string	Formatted facts text for templates
data.facts	Memory[]	Raw memory objects for processing
text	string	Formatted context with agent name

Sources: 
packages/plugin-bootstrap/src/providers/facts.ts
96-104

Error Handling and Fallbacks

The system includes comprehensive error handling:

Empty Results: Returns "No facts available." when no memories found
Search Errors: Logs errors and returns empty facts with "Error retrieving facts." message
Graceful Degradation: System continues operation even when memory retrieval fails

Sources: 
packages/plugin-bootstrap/src/providers/facts.ts
78-88
 
packages/plugin-bootstrap/src/providers/facts.ts
105-116
