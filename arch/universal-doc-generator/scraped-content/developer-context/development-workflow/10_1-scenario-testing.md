# Scenario Testing | elizaOS/eliza | DeepWiki

**URL:** https://deepwiki.com/elizaOS/eliza/10.1-scenario-testing
**Category:** Development Workflow
**Context:** Developer Context
**Scraped:** 2025-08-31T23:20:05.718Z

---

DeepWiki

elizaOS/eliza

Get free private DeepWikis with
Devin
Share
Last indexed: 24 August 2025 (256325)
Overview
Architecture
Getting Started
Core System
AgentRuntime
Character System
Memory and Knowledge Management
Model Providers
Settings and Configuration
CLI System
Commands and Usage
Project Creation
Plugin Management
Environment Configuration
Testing and Validation
Client Interfaces
Web Interface
Real-time Communication
Agent Management UI
Platform Clients
Plugin System
Plugin Architecture
Core Plugins
Creating Plugins
Actions, Evaluators, and Providers
Plugin Registry and Discovery
Data and Storage
Database Integration
Memory Management
Data Models
Server and API
Server Architecture
API Endpoints
Message Bus and Communication
Development
Project Structure
Building and Testing
CI/CD Pipeline
Contributing
Deployment
Local Development
Production Deployment
Configuration Management
Advanced Features
Scenario Testing
TEE Integration
Documentation Automation
API Reference
Core API
Client API
CLI API
Scenario Testing
Relevant source files

This document covers ElizaOS's advanced scenario testing framework, which enables automated testing of agent behavior through YAML-defined scenarios, matrix testing across parameter combinations, and comprehensive evaluation systems. The framework supports both natural language interactions and code execution in isolated environments.

For information about basic CLI usage and project management, see CLI System. For details about plugin development and testing, see Creating Plugins.

Overview

The scenario testing system provides a declarative approach to testing agent capabilities through structured YAML files. It supports individual scenario execution, large-scale matrix testing, sophisticated evaluation engines, and comprehensive reporting.

Sources: 
packages/cli/src/commands/scenario/index.ts
77-464
 
packages/cli/src/commands/scenario/src/schema.ts
165-176
 
packages/cli/src/commands/scenario/src/matrix-schema.ts

Scenario Configuration

Scenarios are defined using YAML files with a structured schema that specifies the test environment, execution steps, and evaluation criteria.

Basic Scenario Structure

The ScenarioSchema defines the core structure for individual test scenarios:

Sources: 
packages/cli/src/commands/scenario/src/schema.ts
165-176
 
packages/cli/src/commands/scenario/examples/test-github-issues.scenario.yaml
1-34

Matrix Testing Configuration

Matrix testing enables running scenarios across multiple parameter combinations using MatrixConfig:

Sources: 
packages/cli/src/commands/scenario/examples/github-issue-analysis.matrix.yaml
1-12
 
packages/cli/src/commands/scenario/src/matrix-schema.ts

Environment Providers

Environment providers implement the EnvironmentProvider interface to execute scenarios in different contexts.

LocalEnvironmentProvider

The LocalEnvironmentProvider executes scenarios on the local machine using temporary directories and subprocess execution:

Method	Purpose	Implementation
setup()	Creates temp directory and virtual filesystem	
packages/cli/src/commands/scenario/src/LocalEnvironmentProvider.ts
34-46

run()	Executes steps via bunExec or askAgentViaApi	
packages/cli/src/commands/scenario/src/LocalEnvironmentProvider.ts
85-224

teardown()	Cleanup temporary resources	
packages/cli/src/commands/scenario/src/LocalEnvironmentProvider.ts
226-232

Sources: 
packages/cli/src/commands/scenario/src/LocalEnvironmentProvider.ts
12-233
 
packages/cli/src/commands/scenario/src/providers.ts
24-40

E2BEnvironmentProvider

The E2BEnvironmentProvider uses E2B sandboxes for isolated code execution:

Sources: 
packages/cli/src/commands/scenario/src/E2BEnvironmentProvider.ts
8-181

Evaluation System

The evaluation system provides multiple evaluator types to assess scenario outcomes through the EvaluationEngine class.

Core Evaluator Types
Evaluator	Schema Type	Purpose
StringContainsEvaluator	string_contains	Check if output contains specific text
RegexMatchEvaluator	regex_match	Pattern matching with regular expressions
FileExistsEvaluator	file_exists	Verify file creation during execution
ExecutionTimeEvaluator	execution_time	Validate timing constraints
TrajectoryContainsActionEvaluator	trajectory_contains_action	Check if specific actions were executed
LLMJudgeEvaluator	llm_judge	AI-powered qualitative assessment
LLM Judge Evaluator

The LLMJudgeEvaluator provides sophisticated AI-powered evaluation using structured JSON responses:

Sources: 
packages/cli/src/commands/scenario/src/EvaluationEngine.ts
20-403
 
packages/cli/src/commands/scenario/src/schema.ts
7-43

Matrix Testing Orchestration

Matrix testing executes scenarios across parameter combinations using the executeMatrixRuns function with comprehensive orchestration.

Matrix Execution Flow

The matrix orchestrator manages parallel execution with proper resource management:

Combination Generation: generateMatrixCombinations creates parameter sets
Resource Monitoring: ResourceMonitor tracks memory, CPU, and disk usage
Isolation: Each run executes in a separate IsolationContext
Data Collection: RunDataAggregator centralizes results and metrics
Progress Tracking: ProgressTracker provides real-time status updates

Sources: 
packages/cli/src/commands/scenario/src/matrix-orchestrator.ts
172-550
 
packages/cli/src/commands/scenario/src/run-isolation.ts
 
packages/cli/src/commands/scenario/src/progress-tracker.ts

Mocking System

The MockEngine provides sophisticated service mocking capabilities for testing scenarios without external dependencies.

Mock Configuration Example

Sources: 
packages/cli/src/commands/scenario/src/MockEngine.ts
16-483
 
packages/cli/src/commands/scenario/src/schema.ts
96-133

Trajectory Reconstruction

The TrajectoryReconstructor captures and analyzes agent decision-making processes by reconstructing step-by-step execution traces.

Trajectory Step Structure

Sources: 
packages/cli/src/commands/scenario/src/TrajectoryReconstructor.ts
 
packages/cli/src/commands/scenario/src/schema.ts
187-199

Data Aggregation and Results

The RunDataAggregator centralizes data collection and produces structured results for analysis and reporting.

ScenarioRunResult Structure

The ScenarioRunResult interface provides a comprehensive view of individual test runs:

Field	Type	Purpose
run_id	string	Unique identifier for the run
matrix_combination_id	string	Links to parameter combination
parameters	Record<string, any>	Applied parameter values
metrics	ScenarioRunMetrics	Performance and resource data
final_agent_response	string	Agent's final output
evaluations	EnhancedEvaluationResult[]	Structured evaluation results
trajectory	TrajectoryStep[]	Decision-making trace
error	string | null	Error message if failed

Sources: 
packages/cli/src/commands/scenario/src/data-aggregator.ts
 
packages/cli/src/commands/scenario/src/schema.ts
223-270

CLI Commands

The scenario testing system exposes two primary CLI commands through the scenario command group.

Individual Scenario Execution
Matrix Testing

Sources: 
packages/cli/src/commands/scenario/index.ts
77-464
 
packages/cli/src/commands/scenario/index.ts
465-851

Report Generation

The reporting system generates comprehensive analysis reports in multiple formats through the elizaos report generate command.

The AnalysisEngine processes raw results and generates structured reports with:

Summary Statistics: Success rates, timing metrics, token usage
Parameter Analysis: Performance breakdown by configuration
Trajectory Patterns: Common decision-making sequences
Capability Assessment: Evaluation success rates by type
Detailed Run Explorer: Searchable individual run data

Sources: 
packages/cli/src/commands/report/generate.ts
122-291
 
packages/cli/src/commands/report/src/analysis-engine.ts
 
packages/cli/src/commands/report/src/assets/report_template.html
1-50

Dismiss

Refresh this wiki

Enter email to refresh
On this page
Scenario Testing
Overview
Scenario Configuration
Basic Scenario Structure
Matrix Testing Configuration
Environment Providers
LocalEnvironmentProvider
E2BEnvironmentProvider
Evaluation System
Core Evaluator Types
LLM Judge Evaluator
Matrix Testing Orchestration
Matrix Execution Flow
Mocking System
Mock Configuration Example
Trajectory Reconstruction
Trajectory Step Structure
Data Aggregation and Results
ScenarioRunResult Structure
CLI Commands
Individual Scenario Execution
Matrix Testing
Report Generation
Ask Devin about elizaOS/eliza
Deep Research
