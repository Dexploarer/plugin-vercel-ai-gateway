# Contributing | elizaOS/eliza | DeepWiki

**URL:** https://deepwiki.com/elizaOS/eliza/8.4-contributing
**Category:** Development Workflow
**Context:** Developer Context
**Scraped:** 2025-08-31T23:20:05.718Z

---

Contributing
Relevant source files

This document outlines the process and guidelines for contributing to the ElizaOS project, including development setup, coding standards, testing requirements, and pull request workflows. For information about the project structure and build processes, see Project Structure and Building and Testing.

Overview

ElizaOS welcomes contributions from the community through a structured development process that emphasizes code quality, comprehensive testing, and clear documentation. The project uses a monorepo architecture with automated quality gates and continuous integration to maintain high standards across all contributions.

Development Environment Setup
Prerequisites and Tools

Setting up a development environment requires specific tools aligned with the project's technology stack:

Required Tools:

Node.js (v23+ recommended)
Bun for package management
Git for version control
WSL 2 (Windows users only)

Repository Setup:

# Fork the repository on GitHub first, then clone your fork
git clone https://github.com/your-username/eliza.git
cd eliza

# Add upstream remote for syncing with main repository
git remote add upstream https://github.com/elizaos/eliza.git

# Install dependencies
bun install

# Build the project
bun run build
Development Environment Architecture

Sources: 
README.md
224-231
 
README.md
268-278
 
README.md
282-328

Development Workflow
Branch Management Strategy

The project follows a structured branching model for organized development:

Main Branches:

main: Production-ready code with latest stable features
develop: Integration branch for feature development
Feature branches: feature/description or fix/issue-number

Workflow Process:

# Sync with upstream before starting work
git fetch upstream
git checkout main
git merge upstream/main

# Create feature branch
git checkout -b feature/new-plugin-capability

# Make your changes, commit regularly
git add .
git commit -m "feat: add new plugin capability"

# Push to your fork
git push origin feature/new-plugin-capability
Code Quality Standards

The project enforces consistent code quality through automated tools:

Pre-commit Hooks: The repository uses Husky to run quality checks before each commit:

# Manual execution of pre-commit hook
bun run pre-commit

Formatting and Linting:

Prettier handles code formatting automatically
ESLint provides static analysis for JavaScript/TypeScript
Configuration files maintain consistency across packages

Sources: 
README.md
268-278

Testing Requirements
Comprehensive Test Coverage

Contributors must ensure their changes include appropriate test coverage across multiple testing layers:

Test Types:

Unit tests for individual functions and classes
Integration tests for component interactions
End-to-end tests for complete user workflows
Plugin-specific tests for custom functionality

Running Tests:

# Run all tests
bun run test

# Run specific test categories
elizaos test component    # Component tests only
elizaos test e2e         # End-to-end tests only
elizaos test --name "specific-test"  # Named test execution
Testing Architecture

Sources: 
README.md
116-118
 
README.md
132-136

Pull Request Process
Pull Request Template Requirements

All pull requests must follow the structured template provided in the repository:

Required Sections:

Issue Linking: Connect PR to related issues or tickets
Risk Assessment: Categorize risk level (low, medium, high) and potential impacts
Change Description: Clear explanation of modifications and rationale
Documentation Impact: Assessment of documentation update requirements
Testing Evidence: Detailed testing steps and validation results

Change Categories:

Bug fixes (non-breaking changes addressing issues)
Improvements (enhancements to existing features)
Features (non-breaking additions of new functionality)
Updates (version updates of dependencies)
Pull Request Workflow

Sources: 
.github/pull_request_template.md
1-86

Documentation Requirements
Documentation Standards

Contributing to ElizaOS requires maintaining comprehensive documentation alongside code changes:

Documentation Types:

API Documentation: Function signatures, parameters, return values
User Guides: Step-by-step usage instructions
Architecture Documentation: System design and component relationships
Plugin Documentation: Custom plugin development guides

Required Documentation Updates: When making changes that affect:

Public APIs or interfaces
CLI command functionality
Plugin development processes
Configuration options
User-facing features

Contributors must update relevant documentation files or indicate documentation requirements in their pull requests.

Community and Communication
Community Engagement

The ElizaOS project maintains active community channels for collaboration and support:

Communication Channels:

GitHub Issues: Bug reports, feature requests, technical discussions
Discord Server: Real-time collaboration and community support
Pull Request Discussions: Code review conversations and technical feedback

Contributor Recognition: The project acknowledges contributions through:

Contributors graph on the main repository
Commit attribution in release notes
Community recognition in Discord channels

Getting Help:

Join the Discord server at https://discord.gg/ai16z
Mention your Discord username in pull requests for contributor role access
Participate in #development-feed channel discussions

Sources: 
README.md
258-267
 
.github/pull_request_template.md
81-85

Monorepo Development
Package Management

The ElizaOS monorepo uses coordinated tools for efficient development across multiple packages:

Build Tools:

Bun: Primary package manager and script runner
Lerna: Monorepo management and versioning
Turbo: Build system optimization and caching

Package Structure:

/packages/core/: Core framework functionality
/packages/cli/: Command-line interface
/packages/plugin-*/: Plugin implementations
/packages/client/: Client libraries
/packages/app/: Desktop application

Development Commands:

# Install dependencies across all packages
bun install

# Build all packages with optimization
bun run build

# Run tests across the monorepo
bun run test

# Development mode with auto-rebuild
elizaos dev

Sources: 
README.md
282-328
