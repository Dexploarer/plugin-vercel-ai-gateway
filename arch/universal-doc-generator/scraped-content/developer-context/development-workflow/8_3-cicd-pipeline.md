# CI/CD Pipeline | elizaOS/eliza | DeepWiki

**URL:** https://deepwiki.com/elizaOS/eliza/8.3-cicd-pipeline
**Category:** Development Workflow
**Context:** Developer Context
**Scraped:** 2025-08-31T23:20:05.718Z

---

CI/CD Pipeline
Relevant source files

The ElizaOS CI/CD pipeline provides automated testing, building, and deployment capabilities for the multi-package monorepo. The pipeline handles both web-based packages (core, server, client, CLI) and native desktop/mobile applications through GitHub Actions workflows. This document covers the automated workflows that ensure code quality, run tests, build packages, and manage releases.

For information about local development workflows, see Building and Testing. For deployment configuration details, see Production Deployment.

Pipeline Architecture Overview

The CI/CD system consists of five main GitHub Actions workflows that handle different aspects of the development and release process:

Sources: 
.github/workflows/ci.yaml
1-95
 
.github/workflows/release.yaml
1-210
 
.github/workflows/pre-release.yml
1-74
 
.github/workflows/tauri-ci.yml
1-107
 
.github/workflows/tauri-release.yml
1-438

Continuous Integration Workflows
Main CI Pipeline (ci.yaml)

The primary CI workflow runs on every push to main and all pull requests, executing three parallel jobs with concurrency control to cancel duplicate runs.

Test Job Configuration:

Runtime: 20-minute timeout with Node.js memory limit of 2GB
Database: Uses PGLite in node mode for testing
Coverage: Runs bun test:coverage with 60-second timeout per test
Environment: Creates .env.test with TEST_DATABASE_CLIENT=pglite

Lint and Format Job:

Commands: bun run format:check and bun run lint
Timeout: 5 minutes
Caching: Leverages Turbo remote cache for faster execution

Build Job:

Command: bun run build
Timeout: 8 minutes
Validation: Ensures all packages compile successfully

Sources: 
.github/workflows/ci.yaml
13-95

Native App CI (tauri-ci.yml)

Dedicated CI pipeline for the Tauri-based native application, running on multiple platforms when app-related files change.

Platform-Specific Configuration:

Linux: Installs GTK3, WebKit2GTK, and other GUI dependencies
Windows: Downloads and installs WebView2 bootstrapper silently
macOS: Sets up universal binary targets for Apple Silicon and Intel

Build Verification:

Runs TypeScript type checking: bun run typecheck
Compiles debug build to verify compilation without full release optimization
Skips binary downloads (YOUTUBE_DL_SKIP_DOWNLOAD, PUPPETEER_SKIP_DOWNLOAD)

Sources: 
.github/workflows/tauri-ci.yml
20-107

Release Management
Package Release Pipeline (release.yaml)

Handles version bumping and NPM publishing for all packages in the monorepo with comprehensive rollback strategy.

Rollback Strategy: The release workflow implements a sophisticated rollback mechanism:

Version updates are NOT committed until NPM publish succeeds
If publishing fails, the temporary commit is reset: git reset --hard HEAD~1
Only successful publishes result in version commits to the main branch
Preserves clean git history and prevents version drift

Version Update Process:

Extracts version from GitHub release tag (removes v prefix)
Updates all package.json files using Lerna with --exact flag
Validates version consistency across lerna.json and key packages
Creates temporary commit for Lerna's working tree requirements
Publishes to NPM with latest dist-tag
Commits final version changes only after successful publish

Sources: 
.github/workflows/release.yaml
16-210

Pre-release Pipeline (pre-release.yml)

Manages pre-release versions with conventional commits and next distribution tag.

Key Features:

Manual Trigger: Uses workflow_dispatch with release type input
Conventional Commits: Automatically generates changelog from commit messages
Next Tag: Publishes to next dist-tag for testing before stable release
GitHub Integration: Creates GitHub releases with generated release notes

Sources: 
.github/workflows/pre-release.yml
3-74

Native Application Release Pipeline
Multi-Platform Release (tauri-release.yml)

Comprehensive release pipeline for native applications across five platforms with parallel builds.

Platform-Specific Build Configuration:

macOS Build:

Target: Universal binary (universal-apple-darwin)
Rust Targets: aarch64-apple-darwin, x86_64-apple-darwin
Output: DMG installer in packages/app/src-tauri/target/universal-apple-darwin/release/bundle/dmg/

Windows Build:

Dependencies: WebView2 runtime installed silently
Target: x86_64-pc-windows-msvc
Output: NSIS installer in packages/app/src-tauri/target/release/bundle/nsis/

Linux Build:

System Dependencies: GTK3, WebKit2GTK, AppIndicator3, librsvg2, patchelf
Outputs: Both AppImage and DEB package formats
Artifact Collection: Copies to ./release-artifacts/ directory

Android Build:

Java: OpenJDK 17 with Android SDK/NDK setup
Rust Targets: aarch64-linux-android, armv7-linux-androideabi, i686-linux-android, x86_64-linux-android
Signing: Uses dummy keystore for unsigned builds (production requires proper signing setup)
Output: Unsigned APK for aarch64 target

iOS Build (Placeholder):

Status: Framework in place but requires Apple certificates and provisioning profiles
Target: aarch64-apple-ios
Requirements: Apple Developer account, signing certificates, provisioning profiles

Sources: 
.github/workflows/tauri-release.yml
40-438

Environment and Configuration Management
Build Environment Setup

All workflows use consistent environment configuration for reproducible builds:

Dependency Management:

Package Manager: Bun for JavaScript dependencies with --no-postinstall flag
Monorepo: Turbo for build caching and task orchestration
Rust: Cargo for native dependencies with sparse registry protocol
Protobuf: System-level protobuf compiler for gRPC code generation

Cache Optimization:

Turbo Remote Cache: TURBO_REMOTE_ONLY=true enforces remote-only caching
Binary Skip: Skips downloading browser binaries during CI (PUPPETEER_SKIP_DOWNLOAD, PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD)
Build Artifacts: Preserves dist directories between workflow steps

Sources: 
.github/workflows/ci.yaml
20-32
 
.github/workflows/release.yaml
49-58
 
.github/workflows/tauri-ci.yml
6-11

Quality Gates and Validation
Code Quality Checks

Test Configuration:

Database: PGLite with PGLITE_WASM_MODE=node for Node.js compatibility
API Keys: OpenAI API key from secrets for integration tests
Memory: Node.js heap size increased to 2GB for large test suites
Coverage: Comprehensive test coverage reporting for core package

Version Validation Process:

Extracts version from multiple sources (lerna.json, package.json files)
Compares versions across core packages (core, server, cli, client)
Fails build if any version mismatches detected
Validates semantic versioning format compliance

Sources: 
.github/workflows/ci.yaml
36-46
 
.github/workflows/release.yaml
125-144
 
.github/workflows/tauri-ci.yml
86-106
