# Documentation Automation | elizaOS/eliza | DeepWiki

**URL:** https://deepwiki.com/elizaOS/eliza/10.3-documentation-automation
**Category:** Architecture & Core Concepts
**Context:** Developer Context
**Scraped:** 2025-08-31T23:19:25.849Z

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
Documentation Automation
Relevant source files

This document covers ElizaOS's automated documentation generation systems, which automatically create and maintain JSDoc comments, README files, and multi-language translations. The automation leverages GitHub Actions workflows to ensure documentation stays current with code changes and provides internationalized content for global users.

For information about the CLI testing infrastructure, see CLI Testing and Validation. For details about the overall CI/CD pipeline, see CI/CD Pipeline.

Overview

The documentation automation system consists of two primary workflows that handle different aspects of documentation maintenance:

JSDoc Automation - Automatically generates code comments and README documentation using AI
README Translation - Automatically translates README files into multiple languages

These systems integrate with the broader ElizaOS development workflow to ensure documentation remains accurate and accessible.

JSDoc Documentation Automation
Architecture

The JSDoc automation workflow is implemented in the jsdoc-automation.yml GitHub Actions workflow, which provides configurable documentation generation capabilities.

Sources: 
.github/workflows/jsdoc-automation.yml
1-128

Workflow Configuration

The JSDoc automation workflow accepts several input parameters that control its behavior:

Parameter	Type	Default	Description
jsdoc	string	'T'	Generate code comments (T/F)
readme	string	'T'	Generate README documentation (T/F)
pull_number	string	-	Pull Request Number for scanning
root_directory	string	'packages/core'	Directory to scan for documentation
excluded_directories	string	'node_modules,dist,test'	Directories to exclude
reviewers	string	-	GitHub usernames for PR review
branch	string	'develop'	Target branch for PR

The workflow runs on Ubuntu and requires specific permissions for content writing and pull request creation.

Sources: 
.github/workflows/jsdoc-automation.yml
6-41

Runtime Environment

The automation system sets up a comprehensive development environment:

Sources: 
.github/workflows/jsdoc-automation.yml
71-115

Autodoc Package Integration

The workflow executes the autodoc package located at packages/autodoc, which handles the actual documentation generation logic. The package receives configuration through environment variables:

INPUT_ROOT_DIRECTORY - Source directory for scanning
INPUT_PULL_NUMBER - PR number for targeted updates
INPUT_EXCLUDED_DIRECTORIES - Directories to skip
INPUT_REVIEWERS - PR reviewers
INPUT_BRANCH - Target branch
INPUT_JSDOC - JSDoc generation flag
INPUT_README - README generation flag

Sources: 
.github/workflows/jsdoc-automation.yml
117-127

README Translation Automation
Translation Workflow

The README translation system automatically generates localized versions of the main README file using AI translation services.

Sources: 
.github/workflows/generate-readme-translations.yml
1-84

Translation Configuration

The translation workflow uses the Aixion action with OpenAI's GPT-4o model to perform translations. The configuration includes:

Sources: 
.github/workflows/generate-readme-translations.yml
49-67

Supported Languages

The system supports 22 languages with their corresponding file suffixes:

Language	Code	Output File
Chinese	CN	README_CN.md
German	DE	README_DE.md
Spanish	ES	README_ES.md
French	FR	README_FR.md
Hebrew	HE	README_HE.md
Italian	IT	README_IT.md
Japanese	JA	README_JA.md
Korean	KOR	README_KOR.md
Portuguese (Brazil)	PTBR	README_PTBR.md
Russian	RU	README_RU.md
Thai	TH	README_TH.md
Turkish	TR	README_TR.md
Vietnamese	VI	README_VI.md
Arabic	AR	README_AR.md
Serbian	RS	README_RS.md
Tagalog	TG	README_TG.md
Polish	PL	README_PL.md
Hungarian	HU	README_HU.md
Persian	FA	README_FA.md
Romanian	RO	README_RO.md
Greek	GR	README_GR.md
Dutch	NL	README_NL.md

Sources: 
.github/workflows/generate-readme-translations.yml
12-36

Integration with CI/CD Pipeline
Workflow Dependencies

The documentation automation integrates with other CI/CD workflows in the ElizaOS ecosystem:

Sources: 
.github/workflows/jsdoc-automation.yml
47-54
 
.github/workflows/generate-readme-translations.yml
37-43
 
.github/workflows/pr.yaml
1-36
 
.github/workflows/plugin-sql-tests.yaml
1-41

Security and Permissions

Both documentation workflows require specific GitHub permissions:

Contents: Write access for file modifications
Pull Requests: Write access for PR creation and management
Packages: Read access for dependency installation

The workflows use GitHub secrets for API authentication:

GITHUB_ACCESS_TOKEN / GH_TOKEN - Repository access
OPENAI_API_KEY - AI model access

Sources: 
.github/workflows/jsdoc-automation.yml
47-54
 
.github/workflows/generate-readme-translations.yml
37-43

Development Container Support

The project includes development container configuration that supports the documentation automation workflows:

Sources: 
.devcontainer/devcontainer.json
1-38
 
.devcontainer/Dockerfile
1-24

The development container ensures consistent environments for running documentation automation locally and provides the same tool versions used in CI/CD workflows.

Dismiss

Refresh this wiki

Enter email to refresh
On this page
Documentation Automation
Overview
JSDoc Documentation Automation
Architecture
Workflow Configuration
Runtime Environment
Autodoc Package Integration
README Translation Automation
Translation Workflow
Translation Configuration
Supported Languages
Integration with CI/CD Pipeline
Workflow Dependencies
Security and Permissions
Development Container Support
Ask Devin about elizaOS/eliza
Deep Research
