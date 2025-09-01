# TEE Integration | elizaOS/eliza | DeepWiki

**URL:** https://deepwiki.com/elizaOS/eliza/10.2-tee-integration
**Category:** Advanced Development
**Context:** Developer Context
**Scraped:** 2025-08-31T23:20:41.629Z

---

TEE Integration
Relevant source files

The TEE (Trusted Execution Environment) integration provides secure, hardware-backed execution capabilities for ElizaOS agents. This system enables agents to run in confidential computing environments with cryptographic attestation, secure key management, and verifiable execution guarantees.

This document covers the TEE integration architecture, CLI management tools, plugin system, and deployment workflows. For general deployment strategies, see Deployment. For advanced testing capabilities, see Scenario Testing.

Architecture Overview

The TEE integration spans multiple system layers, from CLI tooling to runtime plugins to deployment infrastructure.

TEE System Architecture

Container Layer

TEE Infrastructure

Project Templates

Agent Runtime

CLI Layer

elizaos tee phala

Phala Cloud CLI

auth commands

cvms commands

docker commands

AgentRuntime

@elizaos/plugin-tee

remoteAttestationAction

TEE Service

project-tee-starter

Mr. TEE Character

TEE Configuration

Phala Cloud

Confidential VM

Attestation Service

Secure Enclave

Docker Image

docker-compose.yaml

.env Configuration

Sources: 
packages/cli/README.md
311-517
 
packages/project-tee-starter/README.md
1-232
 
packages/project-tee-starter/GUIDE.md
1-296

CLI TEE Management

The ElizaOS CLI provides comprehensive TEE management through integration with the Phala Cloud CLI, offering commands for authentication, deployment, and resource management.

Command Structure

Docker Operations

CVM Management

Authentication Commands

TEE Simulator

simulator start

simulator stop

auth login [api-key]

auth logout

auth status

cvms list

cvms create

cvms get [app-id]

cvms start [app-id]

cvms stop [app-id]

cvms delete [app-id]

cvms upgrade [app-id]

cvms resize [app-id]

cvms attestation [app-id]

docker login

docker build

docker push

docker generate

Key CLI Commands
Command Category	Primary Commands	Purpose
Authentication	elizaos tee phala auth login	Store Phala Cloud API key
CVM Management	elizaos tee phala cvms create	Deploy new TEE instance
Docker Operations	elizaos tee phala docker build	Build TEE-ready images
Attestation	elizaos tee phala cvms attestation	Verify TEE security

Sources: 
packages/cli/README.md
311-517

TEE Plugin System

The @elizaos/plugin-tee provides the core TEE capabilities integrated into the ElizaOS runtime through actions, services, and configuration.

Plugin Integration Architecture

External TEE Services

Configuration

Runtime Integration

Plugin Components

@elizaos/plugin-tee Plugin

remoteAttestationAction

TEE Service Implementation

TEE Context Providers

AgentRuntime

Action Registry

Service Registry

State Manager

TEE_MODE Environment

TEE_VENDOR Setting

WALLET_SECRET_SALT

API Key Configuration

Phala Attestation Service

Secure Key Storage

Enclave Runtime

TEE Environment Modes
Mode	Description	Use Case
PHALA_DSTACK	Phala Cloud TEE deployment	Production TEE environment
TDX_DSTACK	Intel TDX deployment	Hardware TEE environment
NONE	Simulated TEE	Development and testing

Sources: 
packages/project-tee-starter/README.md
76-89
 
packages/project-tee-starter/GUIDE.md
55-70

Project Templates

The project-tee-starter template provides a complete example of TEE-enabled agent deployment with security-focused character implementation.

TEE Starter Components

Testing Suite

Deployment Configuration

TEE Integration

Mr. TEE Character

Project Structure

src/index.ts

src/character.ts

src/plugin.ts

src/tests/

Mr. TEE Character Definition

Security-Focused Personality

Tough Love Approach

TEE Knowledge Base

@elizaos/plugin-tee Reference

Attestation Actions

Secure Operations

TEE Configuration Management

Dockerfile

docker-compose.tee.yaml

.env.example

TEE Environment Variables

E2E TEE Tests

Component Tests

TEE-Specific Test Cases

Attestation Validation Tests

Character Implementation

The Mr. TEE character demonstrates security-first principles with integrated TEE capabilities:

Security Philosophy: Paranoid security practices and tough love coaching
TEE Integration: Direct access to remoteAttestationAction from @elizaos/plugin-tee
Multi-Platform: Discord integration, voice synthesis, extensible architecture

Sources: 
packages/project-tee-starter/README.md
8-22
 
packages/project-tee-starter/src/__tests__/e2e/README.md
28-45
 
packages/project-tee-starter/GUIDE.md
8-28

Configuration and Deployment

TEE deployment involves environment configuration, Docker containerization, and Phala Cloud deployment management.

Deployment Workflow

Production Environment

TEE Verification

CVM Deployment

Build Process

Local Development

Development Configuration

TEE_MODE=LOCAL/DOCKER

Local Testing

elizaos tee phala docker build

Docker Image Creation

elizaos tee phala docker push

DockerHub Upload

elizaos tee phala cvms create

CVM Provisioning

Environment Variable Injection

Container Startup

elizaos tee phala cvms attestation

Cryptographic Proof Generation

Security Validation

TEE Status Confirmation

TEE_MODE=PRODUCTION

Secure Enclave Execution

Remote Attestation Service

Secure Key Management

Configuration Variables
Variable	Values	Purpose
TEE_MODE	PHALA_DSTACK, TDX_DSTACK, NONE	TEE execution mode
TEE_VENDOR	phala, intel	TEE provider selection
WALLET_SECRET_SALT	Custom string	Key derivation salt

Sources: 
packages/project-tee-starter/GUIDE.md
84-112
 
packages/project-tee-starter/README.md
160-198

Testing and Validation

The TEE integration includes comprehensive testing for both TEE-specific functionality and standard agent capabilities.

TEE Test Architecture

Test Environment Adaptation

TEE-Specific Tests

E2E Tests

Component Tests

Unit Tests (Bun)

Configuration Tests

Plugin Unit Tests

Mock TEE Services

ElizaOS Test Runner

Real Runtime Environment

PGLite Database

TEE Integration Tests

tee_project_should_initialize_correctly

tee_character_should_be_loaded_correctly

tee_service_should_be_available

tee_attestation_action_should_be_registered

agent_should_respond_with_tee_awareness

secure_memory_operations_should_work

concurrent_secure_operations_should_be_handled

tee_configuration_should_be_valid

Development Mode Testing

Production Mode Testing

TEE Hardware Detection

Graceful Fallback Handling

Test Execution Commands
Command	Purpose	Environment
elizaos test	Run all tests	Component + E2E
elizaos test component	Unit tests only	Fast development
elizaos test e2e	Integration tests	Full runtime
elizaos test --port 4000	Custom port E2E	Testing isolation

Sources: 
packages/project-tee-starter/src/__tests__/e2e/README.md
54-75
 
packages/project-tee-starter/README.md
134-156
