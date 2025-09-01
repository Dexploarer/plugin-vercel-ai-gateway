# Building and Testing | elizaOS/eliza | DeepWiki

**URL:** https://deepwiki.com/elizaOS/eliza/8.2-building-and-testing
**Category:** Development Workflow
**Context:** Developer Context
**Scraped:** 2025-08-31T23:20:05.718Z

---

Building and Testing
Relevant source files

This page covers the build processes, testing infrastructure, and quality assurance mechanisms in ElizaOS. It focuses on the technical implementation of testing frameworks, CI/CD integration, and cross-platform testing strategies used to ensure code quality and reliability.

For information about the overall project structure and monorepo organization, see Project Structure. For detailed CI/CD pipeline configuration and deployment workflows, see CI/CD Pipeline.

Build System

ElizaOS uses Bun as the primary JavaScript runtime and package manager, with TypeScript compilation handled through the monorepo build system. The build process is integrated with testing to ensure code quality before deployment.

Build Tools and Configuration

The project uses Bun for package management, building, and test execution. The build system supports both development and production builds with appropriate optimizations.

Build Process Flow:

Source Code (.ts)

TypeScript Compilation

Bun Build Process

dist/ Output

Test Build Validation

Package Linking

CLI Ready for Testing

Code Linting

Type Checking

Sources: 
.github/workflows/cli-tests.yml
62-86
 
packages/cli/tests/commands/create.test.ts
74-108

Testing Infrastructure

The testing infrastructure is built around Bun's test runner with comprehensive CLI testing, unit testing, and integration testing capabilities.

Core Testing Architecture

Test Environments

Test Utilities

CLI Testing

Test Framework

Bun Test Runner

TestTimeoutManager

TestProcessManager

CLI Command Tests

Agent Management Tests

Project Creation Tests

Plugin System Tests

bunExecSync Helper

test-utils.ts

Cross-Platform Utils

TEST_TIMEOUTS Config

Local Development

GitHub Actions CI

Multi-OS Testing

Sources: 
packages/cli/tests/commands/test-utils.ts
526-600
 
packages/cli/tests/test-timeouts.ts
1-116
 
packages/cli/tests/unit/utils/testing/timeout-manager.test.ts
1-116

Test Categories and Organization

The testing system is organized into several categories:

Test Type	Purpose	Location	Key Files
CLI Commands	Test all CLI functionality	tests/commands/	agent.test.ts, create.test.ts, plugins.test.ts
Unit Tests	Test individual utilities	tests/unit/	handle-error.test.ts, timeout-manager.test.ts
Integration	Test plugin isolation	tests/integration/	plugin-test-isolation.test.ts
E2E Tests	End-to-end scenarios	Embedded in command tests	Server startup, agent lifecycle
Test Execution Flow

Test Execution Start

Test Environment Setup

Build Packages

Link CLI Globally

Execute Test Suite

CLI Command Tests

Unit Tests

Integration Tests

Agent Tests

Create Tests

Plugin Tests

Server Tests

Test Cleanup

Test Results

Sources: 
.github/workflows/cli-tests.yml
88-133
 
packages/cli/tests/commands/agent.test.ts
16-182

CLI Testing System

The CLI testing system provides comprehensive coverage of all command-line functionality with proper process management and cross-platform support.

CLI Test Architecture

Test Validation

Test Infrastructure

Test Commands

CLI Test Framework

bunExecSync

Bun.spawn Wrapper

Timeout Management

elizaos create

elizaos agent

elizaos plugins

elizaos start

elizaos dev

elizaos update

waitForServerReady

killProcessOnPort

getPlatformOptions

TestProcessManager

Output Validation

File System Validation

API Response Validation

State Validation

Sources: 
packages/cli/tests/commands/test-utils.ts
241-356
 
packages/cli/tests/utils/bun-test-helpers.ts
 
packages/cli/tests/commands/agent.test.ts
225-425

Command Testing Patterns

Each CLI command follows consistent testing patterns:

Setup Phase: Create test environment, mock dependencies
Execution Phase: Run CLI command with bunExecSync or Bun.spawn
Validation Phase: Check outputs, files, and system state
Cleanup Phase: Remove temporary files and kill processes

Example Test Pattern:

// Setup
const testTmpDir = await mkdtemp(join(tmpdir(), 'eliza-test-'));
process.chdir(testTmpDir);

// Execution
const result = bunExecSync('elizaos create test-project --yes', {
  encoding: 'utf8',
  timeout: TEST_TIMEOUTS.PROJECT_CREATION
});

// Validation
expect(result).toContain('Project initialized successfully!');
expect(existsSync('test-project/package.json')).toBe(true);

// Cleanup handled by afterEach hooks

Sources: 
packages/cli/tests/commands/create.test.ts
68-108
 
packages/cli/tests/commands/test-utils.ts
71-93

Cross-Platform Testing

The testing system handles platform-specific differences across Windows, macOS, and Linux environments with adaptive timeouts and platform-specific utilities.

Platform Configuration

Process Management

Platform Utils

Timeout Configuration

Platform Detection

Environment Detection

CI Environment Check

Operating System Check

Base Timeouts

CI Adjusted Timeouts

Platform Specific Timeouts

Windows Utilities

macOS Utilities

Linux Utilities

Windows Process Kill

Unix Process Kill

Port Cleanup

Sources: 
packages/cli/tests/test-timeouts.ts
7-106
 
packages/cli/tests/commands/test-utils.ts
361-452
 
packages/cli/tests/commands/test-utils.ts
487-520

Timeout Management

The system uses environment-aware timeout configuration:

Environment	Command Timeout	Server Startup	Individual Test
Local Windows	90s	45s	5min
Local macOS	75s	40s	4min
Local Linux	60s	30s	3min
CI (all platforms)	120s	180s	3min

Sources: 
packages/cli/tests/test-timeouts.ts
12-106

CI/CD Integration

The testing system integrates with GitHub Actions to provide automated testing across multiple platforms and Node.js versions.

CI Pipeline Architecture

Platform Matrix

Test Execution

Build Phase

GitHub Actions Workflow

Push/PR Trigger

Platform Matrix

Environment Setup

Bun Installation

Dependencies Install

Build All Packages

Link CLI Globally

Verify CLI Available

Clean Project Cache

Create Test Environment

Run CLI TypeScript Tests

ubuntu-latest

macos-latest

windows-latest

Sources: 
.github/workflows/cli-tests.yml
1-133

Test Environment Configuration

The CI environment includes specific configurations for reliable testing:

env:
  OPENAI_API_KEY: ${{ secrets.OPENAI_API_KEY }}
  ELIZA_NONINTERACTIVE: true
  ELIZA_TEST_MODE: true

Key CI Features:

Concurrency Control: Cancels previous runs for same PR/branch
Platform Matrix: Tests on Ubuntu, macOS, and Windows
Timeout Management: 45-minute job timeout with proper cleanup
Global Package Linking: Ensures CLI is available system-wide
Cache Management: Cleans ElizaOS project cache between runs

Sources: 
.github/workflows/cli-tests.yml
3-13
 
.github/workflows/cli-tests.yml
24-34

Test Utilities and Helpers

The testing system provides comprehensive utilities for test setup, execution, and cleanup across different environments.

Core Utility Functions

Process Management

Cross-Platform

Server Testing

Test Execution

Environment Management

setupTestEnvironment

safeChangeDirectory

cleanupTestEnvironment

bunExecSync

bunExecSimple

Bun.spawn Wrapper

waitForServerReady

killProcessOnPort

Health Check Polling

getPlatformOptions

crossPlatform Utils

execShellCommand

TestProcessManager

Process Tracking

Cleanup All Processes

Sources: 
packages/cli/tests/commands/test-utils.ts
9-600
 
packages/cli/tests/utils/bun-test-helpers.ts

Server Testing Infrastructure

The system includes sophisticated server testing capabilities:

Server Readiness Detection:

Connection Test: Basic TCP connection to verify port binding
Health Check: HTTP request to validate server responsiveness
Stabilization Wait: Additional time for full service initialization
Retry Logic: Multiple attempts with backoff for CI reliability

Process Lifecycle Management:

Graceful Shutdown: SIGTERM followed by SIGKILL if needed
Port Cleanup: Platform-specific process termination
Resource Tracking: Automatic cleanup of spawned processes
Memory Management: Limited memory allocation for CI environments

Sources: 
packages/cli/tests/commands/test-utils.ts
241-356
 
packages/cli/tests/commands/start.test.ts
90-134

Test Isolation and Cleanup

Each test maintains proper isolation through:

Temporary Directories: Unique temp directories per test
Environment Variables: Scoped environment configuration
Process Cleanup: Automatic termination of spawned processes
Port Management: Cleanup of network resources
File System: Removal of temporary files and directories

The TestProcessManager class provides centralized process lifecycle management with automatic cleanup on test completion.

Sources: 
packages/cli/tests/commands/test-utils.ts
526-600
 
packages/cli/tests/commands/agent.test.ts
184-223
