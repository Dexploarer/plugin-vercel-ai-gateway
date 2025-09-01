# Production Deployment | elizaOS/eliza | DeepWiki

**URL:** https://deepwiki.com/elizaOS/eliza/9.2-production-deployment
**Category:** Server & Infrastructure
**Context:** Developer Context
**Scraped:** 2025-08-31T23:20:19.544Z

---

Production Deployment
Relevant source files

This document covers production deployment strategies for ElizaOS applications, including NPM package publishing, native application distribution, and automated release workflows. For local development setup, see Local Development. For managing secrets and environment variables in production, see Configuration Management.

Deployment Strategies Overview

ElizaOS supports multiple production deployment strategies depending on your use case:

Deployment Type	Use Case	Distribution Method
NPM Packages	Server applications, CLI tools	npmjs.org registry
Native Desktop Apps	End-user applications	GitHub Releases (DMG, MSI, AppImage)
Mobile Apps	iOS/Android applications	App stores or direct distribution
Docker Containers	Cloud/container deployments	Container registries

The deployment process is fully automated through GitHub Actions workflows that handle building, testing, and publishing across all supported platforms.

Production Deployment Architecture

Distribution Channels

Build Artifacts

CI/CD Pipeline

Source Control

main branch

Release Tags
v1.2.3

Pull Requests

.github/workflows/ci.yaml
Continuous Integration

.github/workflows/release.yaml
NPM Publishing

.github/workflows/tauri-release.yml
Native App Builds

.github/workflows/pre-release.yml
Beta Releases

NPM Packages
@elizaos/*

Desktop Apps
DMG, MSI, AppImage

Mobile Apps
APK, IPA

npmjs.org
Package Registry

GitHub Releases
Binary Distribution

App Stores
(Future)

Sources: 
.github/workflows/ci.yaml
1-95
 
.github/workflows/release.yaml
1-210
 
.github/workflows/tauri-release.yml
1-438

NPM Package Deployment

ElizaOS packages are published to npmjs.org using Lerna for coordinated versioning across the monorepo. The release process is triggered by creating GitHub releases.

Release Workflow Process

Publishing

Version Management

Pre-publish Validation

Release Trigger

GitHub Release Created
Manual or Automated

Extract Version
from Release Tag

Checkout main Branch
fetch-depth: 0

bun install
Install Dependencies

bun run format:check
bun run lint

bun run build
Build All Packages

npx lerna version
--exact --yes --no-git-tag-version

Verify lerna.json
and package.json files

npx lerna publish
from-package --yes

git commit
Version Bump

git push origin main

The release workflow implements atomic publishing with rollback capability. If publishing fails after version updates, the version changes are not committed to git, preventing version drift between git and npm.

Sources: 
.github/workflows/release.yaml
109-210

Package Publishing Configuration

The publishing process uses specific NPM configurations:

Registry: https://registry.npmjs.org/
Authentication: NPM_TOKEN secret for automated publishing
Dist Tag: latest for stable releases, next for pre-releases
Access: Public packages with coordinated versioning

Sources: 
.github/workflows/release.yaml
49-53
 
.github/workflows/pre-release.yml
30-49

Native Application Deployment

Native applications are built for multiple platforms using Tauri and distributed through GitHub Releases. The build process creates platform-specific installers and packages.

Multi-Platform Build Matrix

Distribution

Build Outputs

Platform Builds

Build Triggers

Release Tag
v*

Manual Trigger
workflow_dispatch

macos-latest
Universal Apple Darwin

windows-latest
x86_64-pc-windows-msvc

ubuntu-latest
x86_64-unknown-linux-gnu

ubuntu-latest
aarch64-linux-android

macos-latest
aarch64-apple-ios

macOS DMG
universal-apple-darwin

Windows MSI
NSIS Installer

Linux AppImage
+ DEB Package

Android APK
aarch64-release

iOS IPA
Enterprise Distribution

GitHub Releases
Automated Upload

Sources: 
.github/workflows/tauri-release.yml
50-255

Tauri Application Configuration

The native application is configured through tauri.conf.json:

Product Name: "Eliza Desktop"
Bundle ID: "com.elizaos.desktop"
Security: Content Security Policy for local and remote resources
Window Settings: Default size 1200x800, minimum 800x600

Sources: 
packages/app/src-tauri/tauri.conf.json
1-50

Platform-Specific Build Requirements

Each platform has specific dependencies and build requirements:

macOS:

Rust targets: aarch64-apple-darwin, x86_64-apple-darwin
Universal binary for both Intel and Apple Silicon
Code signing (placeholder for Apple certificates)

Windows:

WebView2 runtime installation
NSIS installer generation
Visual Studio Build Tools (implied)

Linux:

GTK3 and WebKit dependencies
AppImage and DEB package generation

Android:

Android SDK/NDK setup
Java 17 (Temurin distribution)
Multiple target architectures

Sources: 
.github/workflows/tauri-release.yml
68-330

CI/CD Pipeline Architecture

The continuous integration pipeline ensures code quality and build integrity before deployment.

CI Workflow Components

Build Cache

Test Environment

Parallel Jobs

Trigger Conditions

push: main

pull_request: main

test
packages/core

lint-and-format
ESLint + Prettier

build
Turbo Build

TEST_DATABASE_CLIENT=pglite

NODE_ENV=test

bun test:coverage

Turbo Remote Cache
TURBO_TOKEN

bun install
Dependency Caching

The CI pipeline uses Turbo for build caching and runs tests with PGLite for fast database operations. All jobs must pass before code can be merged or released.

Sources: 
.github/workflows/ci.yaml
13-95

Build Performance Optimizations
Turbo Remote Caching: Shared build cache across CI runs
Parallel Job Execution: Test, lint, and build run concurrently
Dependency Caching: Bun lockfile and node_modules caching
Timeout Management: 20-minute overall timeout, 15-minute test timeout

Sources: 
.github/workflows/ci.yaml
22-24
 
.github/workflows/ci.yaml
42-45

Release Management

Release management follows semantic versioning with support for both stable and pre-release channels.

Release Types and Channels
Release Type	NPM Dist Tag	GitHub Release	Trigger
Stable	latest	Public release	GitHub release creation
Pre-release	next	Pre-release flag	Manual workflow dispatch
Development	N/A	N/A	Direct development
Pre-release Workflow

Publishing

Version Management

Pre-release Trigger

workflow_dispatch
Manual Trigger

Input: release_type
prerelease, patch, minor, major

bunx lerna version
--conventional-commits

--force-publish
All Packages

bunx lerna publish
--dist-tag next

GitHub Release
Prerelease Flag

Pre-releases use conventional commits for automatic changelog generation and are published to the next dist tag for beta testing.

Sources: 
.github/workflows/pre-release.yml
44-73

Version Synchronization

All packages in the monorepo maintain synchronized versions through Lerna:

Exact Versioning: --exact flag ensures consistent dependency versions
Force Publishing: All packages are published together regardless of changes
Git Integration: Version commits are pushed back to the main branch after successful publishing

Sources: 
.github/workflows/release.yaml
121

Security and Access Management

Production deployments require secure credential management and access controls.

Required Secrets
Secret	Purpose	Used In
NPM_TOKEN	NPM package publishing	Release workflows
GITHUB_TOKEN	GitHub API access	All workflows
GH_TOKEN	Enhanced GitHub access	Native app releases
TURBO_TOKEN	Turbo cache access	CI/CD performance
Build Environment Security
Isolated Runners: Each build runs on fresh Ubuntu/macOS/Windows runners
Dependency Validation: Package integrity checks during installation
Secrets Scope: Secrets are only available to authorized workflows
Artifact Signing: Code signing for native applications (when configured)

Sources: 
.github/workflows/release.yaml
19-21
 
.github/workflows/tauri-release.yml
31-32

Monitoring and Troubleshooting
Common Deployment Issues
Version Drift: Resolved by atomic publishing - versions only committed after successful npm publish
Build Failures: Separate jobs for different platforms prevent total failure
Dependency Conflicts: Exact versioning and synchronized releases prevent conflicts
Cache Issues: Turbo cache invalidation and fresh runners prevent stale builds
Build Artifact Verification

Each deployment generates verifiable artifacts:

NPM Packages: Published with integrity hashes
Native Binaries: Code-signed (when certificates are configured)
Release Notes: Auto-generated from conventional commits
Build Logs: Complete CI/CD logs available in GitHub Actions

Sources: 
.github/workflows/release.yaml
125-144
 
.github/workflows/tauri-release.yml
244-254
