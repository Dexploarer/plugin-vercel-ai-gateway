# Development | elizaOS/eliza | DeepWiki

**URL:** https://deepwiki.com/elizaOS/eliza/8-development
**Category:** Development Workflow
**Context:** Developer Context
**Scraped:** 2025-08-31T23:20:05.718Z

---

Development
Relevant source files

This document covers the development workflow, project structure, and contribution guidelines for ElizaOS. It provides technical guidance for contributors working on the monorepo codebase, including setup procedures, build processes, testing methodologies, and continuous integration practices.

For detailed information about individual subsystems, see Project Structure, Building and Testing, CI/CD Pipeline, and Contributing.

Development Environment
Runtime and Package Management

ElizaOS uses Bun as the primary JavaScript runtime and package manager with Turbo for monorepo build orchestration. The development environment requires Node.js version 23.3.0 as specified in engines.node.

Core Development Stack:

Bun 1.2.15: Primary runtime and package manager (packageManager in root package.json)
Node.js 23.3.0: Required runtime version for compatibility
TypeScript 5.8.2: Primary language with strict type checking
Turbo 2.5.5: Monorepo build system with remote caching
Lerna 8.1.4: Package versioning and publishing
Rust: For Tauri desktop applications (@tauri-apps/cli)

The monorepo uses Bun workspaces defined in workspaces: ["packages/*", "plugin-specification/*"] for dependency management.

ElizaOS Development Environment Architecture

Quality Tools

Package Workspaces

Language & Build Tools

Core Development Tools

Bun 1.2.15
packageManager
scripts: dev, test, build

Turbo 2.5.5
turbo run build
turbo run test --concurrency 3

Lerna 8.1.4
lerna version
lerna publish from-package

TypeScript 5.8.2
tsup 8.5.0
Type checking & compilation

Vite 6.3.5
@vitejs/plugin-react
Web app bundling

@tauri-apps/cli 2.6.2
Desktop app builds
Rust integration

@elizaos/cli
packages/cli
bin: elizaos

@elizaos/core
packages/core
Core runtime

@elizaos/client
packages/client
React web UI

@elizaos/server
packages/server
Express + Socket.IO

@elizaos/app
packages/app
Tauri desktop app

Prettier 3.5.3
format:check
Code formatting

ESLint 9.22.0
lint
Code quality

Husky 9.1.7
prepare
Git hooks

Sources: 
package.json
39-44
 
package.json
6-8
 
package.json
44-54
 
bun.lock
1-26

Continuous Integration Pipeline
Core Development Scripts

The root package.json defines the primary development scripts that orchestrate the entire monorepo workflow through Turbo:

Script	Command	Purpose
start	turbo run start --filter=./packages/cli --log-prefix=none	Launch CLI package
dev	bun run scripts/dev-watch.js	Development with file watching
build	turbo run build	Build all packages
test	turbo run test --concurrency 3 --filter=!./packages/plugin-starter --filter=!./packages/project-starter --filter=!@elizaos/plugin-sql	Run tests with exclusions
lint	turbo run lint --filter=./packages/* && prettier --write . --ignore-path .prettierignore && prettier --check . --ignore-path .prettierignore	Lint and format code
release	lerna version --no-private --force-publish --no-push --no-git-tag-version && bun run build && bun lint && lerna publish from-package --no-private --force-publish && bun lint	Full release process

Development Workflow Architecture

Release Pipeline

Quality Gates

Package Build Targets

Development Commands

scripts/dev-watch.js
File watching
Auto-rebuild

turbo run start
--filter=./packages/cli
Launch elizaos CLI

turbo run build
All packages
TypeScript compilation

@elizaos/cli
dist/index.js
CLI binary

@elizaos/core
TypeScript library
Runtime system

@elizaos/client
Vite production build
React web app

@elizaos/server
Express server
Socket.IO integration

@elizaos/app
Tauri desktop app
Cross-platform binary

turbo run test
--concurrency 3
Parallel test execution

turbo run lint
ESLint validation
Prettier formatting

prettier --check .
--ignore-path .prettierignore
Format validation

lerna version
--no-private --force-publish
Version bumping

lerna publish from-package
--no-private --force-publish
NPM publishing

turbo run migrate
--filter=./packages/plugin-sql
Database migrations

Sources: 
package.json
9-37
 
package.json
10-14
 
package.json
20-27

Package-Specific Development Scripts

Each package in the monorepo defines its own development workflow through package-specific scripts:

@elizaos/client Package Scripts

{
  "start:client": "vite",
  "dev:client": "vite --host 0.0.0.0 --port 5173",
  "build": "vite build",
  "test": "bun test",
  "test:e2e": "cypress run --e2e",
  "cypress:open": "cypress open"
}

@elizaos/app Package Scripts (Tauri Desktop)

{
  "start": "tauri dev",
  "dev": "vite", 
  "build": "tsc && vite build",
  "tauri:build": "tauri build"
}

Package Development Dependencies Architecture

CLI Package Dependencies

Commander 14.0.0
@clack/prompts 0.11.0
Interactive CLI

Bun 1.2.17
tsconfig-paths 4.2.0
Runtime compilation

Tiktoken 1.0.18
@anthropic-ai/sdk
AI model support

Chalk 5.4.1
Ora 8.1.1
Terminal styling

Core Package Dependencies

LangChain 0.3.15
AI model integration
Vector operations

js-sha1 0.7.0
crypto-browserify
Security functions

Handlebars 4.7.8
Zod 3.24.4
Template + validation

Pino 9.6.0
pino-pretty 13.0.0
Structured logging

App Package Dependencies

@tauri-apps/api 2.6.0
@tauri-apps/cli 2.6.2
Desktop integration

React 19.1.0
Same as client
Shared components

TypeScript 5.8.2
Vite 6.3.5
Native compilation

Client Package Dependencies

React 19.1.0
react-dom 19.1.0
Modern React features

@radix-ui/* components
@tanstack/react-query
UI framework

Vite 6.3.5
@vitejs/plugin-react-swc
Fast builds

Cypress 14.4.1
@testing-library/react
E2E + component tests

Sources: 
packages/client/package.json
7-25
 
packages/app/package.json
6-18
 
bun.lock
253-281
 
bun.lock
63-114

Build and Release System
Monorepo Workspace Structure

The ElizaOS monorepo is organized into focused packages with clear dependency relationships and build targets:

Workspace Package Organization

Project Templates

Plugin System

CLI & Tools

User Interface Packages

Core Packages

@elizaos/core
packages/core
Runtime system + types

@elizaos/api-client
packages/api-client
HTTP client library

@elizaos/server
packages/server
Express + Socket.IO

@elizaos/client
packages/client
React web application

@elizaos/app
packages/app
Tauri desktop application

@elizaos/cli
packages/cli
bin: elizaos

create-eliza
packages/create-eliza
bin: create-eliza

@elizaos/test-utils
packages/test-utils
Testing utilities

@elizaos/plugin-bootstrap
packages/plugin-bootstrap
Core message handling

@elizaos/plugin-sql
packages/plugin-sql
Database integration

@elizaos/plugin-starter
packages/plugin-starter
Plugin template

@elizaos/project-starter
packages/project-starter
Basic project template

@elizaos/project-tee-starter
packages/project-tee-starter
TEE integration template

Package Dependency Matrix

Package	Depends On	Provides
@elizaos/core	External AI libraries	Core runtime, types, interfaces
@elizaos/api-client	@elizaos/core	HTTP client for agent communication
@elizaos/server	@elizaos/core, @elizaos/plugin-sql	Express server + Socket.IO
@elizaos/client	@elizaos/api-client, @elizaos/core	React web UI
@elizaos/cli	Multiple core packages	elizaos binary command
@elizaos/plugin-bootstrap	@elizaos/core, @elizaos/plugin-sql	Message processing pipeline

Sources: 
package.json
40-43
 
bun.lock
615-651
 
bun.lock
253-489

Build System Configuration

The build system uses Turbo for orchestrating builds across the monorepo with specific filters and configurations for different scenarios:

Build Script Targets and Filters

Script	Turbo Command	Filters	Purpose
build	turbo run build	All packages	Full monorepo build
build:client	turbo run build --filter=@elizaos/client	Client only	Web UI build
build:cli	turbo run build --filter=@elizaos/cli --no-cache	CLI only, no cache	Fresh CLI build
build:core	turbo run build --filter=@elizaos/core --no-cache	Core only, no cache	Fresh core build
test	turbo run test --concurrency 3	Excludes starters & plugin-sql	Parallel testing
start	turbo run start --filter=./packages/cli --log-prefix=none	CLI package only	Launch elizaos CLI

Turbo Build Orchestration

Quality Gates

Plugin System Builds

Frontend Build Targets

Package Build Dependencies

Build Pipeline Entry Points

turbo run build
Full monorepo build
Dependency-aware

turbo run test
--concurrency 3
Parallel execution

turbo run start
--filter=./packages/cli
Launch CLI

@elizaos/core build
tsup compilation
Type generation

@elizaos/api-client build
Depends on core
HTTP client library

@elizaos/server build
Express + Socket.IO
tsup compilation

@elizaos/cli build
esbuild + tsup
elizaos binary

@elizaos/client build
vite build
React production bundle

@elizaos/app build
tsc && vite build
Tauri desktop prep

@elizaos/plugin-bootstrap
tsup compilation
Message processing

@elizaos/plugin-sql
Drizzle + tsup
Database integration

prettier --check .
--ignore-path .prettierignore
Format validation

turbo run lint
--filter=./packages/*
Code quality

TypeScript compilation
Type checking
Build verification

Sources: 
package.json
15-21
 
package.json
32-36
 
package.json
22-24

Testing Infrastructure
Testing Infrastructure

ElizaOS uses a multi-framework testing approach with different tools optimized for different package types:

Testing Framework by Package

Package	Test Framework	Test Scripts	Coverage
@elizaos/core	Bun Test	bun test	Core runtime testing
@elizaos/client	Bun Test + Cypress	test:e2e, test:component	E2E + component tests
@elizaos/app	Bun Test	bun test src/__tests__	Desktop app testing
@elizaos/cli	Custom test suite	CLI integration tests	Command validation
Root	Turbo orchestrated	turbo run test --concurrency 3	Parallel execution

Test Exclusions and Filters

The root test script excludes certain packages from automated testing:

turbo run test --concurrency 3 \
  --filter=!./packages/plugin-starter \
  --filter=!./packages/project-starter \
  --filter=!@elizaos/plugin-sql

Client Package Testing Architecture

Quality Assurance

Test Environment Setup

Test Scripts by Package

Client Testing Stack

Cypress 14.4.1
test:e2e
cypress run --e2e

cypress run --component
Component testing
React component isolation

cypress open
Interactive development
Visual test runner

@testing-library/react 14.0.0
@testing-library/jest-dom
React testing utilities

@elizaos/client
./scripts/test-all.sh
./scripts/test-e2e-with-server.sh

@elizaos/app
bun test src/tests
Tauri integration tests

@elizaos/core
bun test
Runtime system tests

@elizaos/cli
Cross-platform CLI tests
Command validation

@happy-dom/global-registrator
DOM simulation
Server-side testing

vite.config.js
Test configuration
Module resolution

tsconfig.json
Type checking
Test compilation

turbo run test
--concurrency 3
Parallel execution

turbo run format:check
--filter=./packages/*
Code formatting

turbo run lint
--filter=./packages/*
Code quality

Sources: 
package.json
33-36
 
packages/client/package.json
16-25
 
packages/app/package.json
12

Code Quality and Formatting

ElizaOS enforces consistent code quality through automated formatting and linting across all packages:

Quality Tools Configuration

Tool	Version	Configuration	Scope
Prettier	3.5.3	.prettierignore	All packages
ESLint	9.22.0	Per-package configs	TypeScript files
Husky	9.1.7	Git hooks	Pre-commit validation
TypeScript	5.8.2	Strict mode	Type checking

Code Quality Pipeline

Build Verification

Package-Specific Quality

Lint Validation

Format Validation

Pre-commit Hooks (Husky)

husky prepare
Install git hooks
scripts/pre-commit-lint.js

bun run pre-commit
Format + lint validation
Block invalid commits

prettier --write .
--ignore-path .prettierignore
Auto-format code

prettier --check .
--ignore-path .prettierignore
Validate formatting

turbo run format
--filter=./packages/*
Per-package formatting

turbo run lint
--filter=./packages/*
ESLint validation

bun run lint
Prettier + ESLint
Combined validation

@elizaos/client
prettier --write ./src
React-specific rules

@elizaos/app
prettier --write ./src
Tauri-specific rules

@elizaos/cli
TypeScript + Node.js rules
CLI-specific validation

TypeScript compilation
tsc --noEmit
Type checking

turbo run build
Full build verification
Ensure no errors

Quality Gates Before Merge

Husky Pre-commit Hook: Runs scripts/pre-commit-lint.js
Format Check: prettier --check . --ignore-path .prettierignore
Lint Check: turbo run lint --filter=./packages/*
Build Verification: turbo run build must succeed
Test Passage: turbo run test --concurrency 3 must pass

Sources: 
package.json
22-24
 
package.json
37
 
packages/client/package.json
12-14
 
packages/app/package.json
16-18

Development Workflow Integration
Release and Publishing Workflow

ElizaOS uses Lerna for coordinated package versioning and publishing across the monorepo:

Release Process Overview

The release process is defined in the root package.json release script:

lerna version --no-private --force-publish --no-push --no-git-tag-version && 
bun run build && 
bun lint && 
lerna publish from-package --no-private --force-publish && 
bun lint

Release Workflow Components

Database Migrations

Publishing

Build & Quality

Version Management

Beta Releases

lerna publish prerelease
--preid beta --dist-tag beta
--no-private --force-publish

Beta version increments
1.2.3-beta.0 pattern
Separate dist-tag

lerna version
--no-private --force-publish
--no-push --no-git-tag-version

Increment package versions
Update package.json files
No git operations

bun run build
turbo run build
Compile all packages

bun lint
Format + ESLint validation
Quality assurance

lerna publish from-package
--no-private --force-publish
Publish to NPM

bun lint
Final validation
Ensure consistency

bun run migrate:generate
turbo run migrate:generate
--filter=./packages/plugin-sql

bun run migrate
turbo run migrate
--filter=./packages/plugin-sql --force

Package Publishing Configuration

Lerna configuration excludes private packages and forces publishing:

--no-private: Only publish packages with "private": false
--force-publish: Publish even if no changes detected
--no-git-tag-version: Skip git operations during versioning
--no-push: Skip pushing changes to remote

Database Migration Integration

The SQL plugin includes dedicated migration scripts:

migrate:generate: Generate new migration files using Drizzle Kit
migrate: Apply pending migrations to database
Filtered to ./packages/plugin-sql package only

Sources: 
.github/workflows/ci.yaml
3-6
 
.github/workflows/ci.yaml
22-25
 
.github/workflows/tauri-ci.yml
29-32
