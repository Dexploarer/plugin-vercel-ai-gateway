# PR Submission Guide for AI Gateway Plugin

This guide outlines the steps needed to submit the AI Gateway Plugin to both the main ElizaOS repository and the plugin registry.

## 📋 Pre-Submission Checklist

### Code Quality
- [ ] Run Prettier formatting: `npm run format`
- [ ] Run linting: `npm run lint`
- [ ] All TypeScript compiles without errors: `npm run build`
- [ ] Tests pass: `npm test`
- [ ] No console.log statements in production code
- [ ] Sensitive data is not hardcoded

### Documentation
- [ ] README.md is complete with examples
- [ ] plugin.json manifest is included
- [ ] All actions have examples
- [ ] Environment variables are documented
- [ ] License file is present (MIT)

### Testing
- [ ] Unit tests cover core functionality
- [ ] Integration tests with mock runtime
- [ ] Manual testing completed
- [ ] Example configurations work

## 🎯 Option 1: Plugin Registry Submission

### Step 1: Prepare Repository
1. Create repository at: `https://github.com/elizaos-plugins/plugin-aigateway`
2. Push all code to the repository
3. Add GitHub topics:
   - `elizaos`
   - `elizaos-plugin`
   - `ai`
   - `llm`
   - `gateway`

### Step 2: Add Required Assets
Create `images/` directory with:
- `logo.jpg` (400x400px) - AI Gateway logo
- `banner.jpg` (1280x640px) - Banner image
- `screenshots/` - Usage screenshots

### Step 3: Update Registry
1. Fork: `https://github.com/elizaos-plugins/registry`
2. Edit `index.json`:
```json
{
  "@elizaos-plugins/plugin-aigateway": "github:elizaos-plugins/plugin-aigateway"
}
```

### Step 4: Create Registry PR
**PR Title:** `feat: Add AI Gateway Plugin to Registry`

**PR Body:**
```markdown
## 🚀 New Plugin: AI Gateway

### Description
Universal AI Gateway integration for accessing 100+ AI models through Vercel, OpenRouter, and other gateways.

### Key Features
- ✅ 100+ AI models support
- ✅ Multiple gateway providers (Vercel, OpenRouter, custom)
- ✅ Response caching with LRU
- ✅ Automatic retry logic
- ✅ Model fallback support
- ✅ Usage telemetry

### Plugin Structure
- [x] Implements Plugin interface
- [x] Includes plugin.json manifest
- [x] TypeScript with full types
- [x] Comprehensive documentation
- [x] Test coverage included

### Testing Evidence
- [x] Unit tests pass ✅
- [x] Integration tested with mock runtime ✅
- [x] Manual testing completed ✅

### Demo Configuration
```json
{
  "name": "AIGatewayAgent",
  "plugins": ["@elizaos-plugins/plugin-aigateway"],
  "settings": {
    "AIGATEWAY_API_KEY": "your-key",
    "AIGATEWAY_BASE_URL": "https://ai-gateway.vercel.sh/v1/ai"
  }
}
```

### Screenshots
![Plugin in action](images/screenshots/demo.png)

### Checklist
- [x] Repository follows plugin structure
- [x] Documentation complete
- [x] Tests passing
- [x] Images optimized
- [x] GitHub topics added
- [x] Package published to npm
```

## 🏗️ Option 2: Main Repository Core Plugin Submission

### Step 1: Fork and Clone
```bash
git clone https://github.com/elizaos/eliza.git
cd eliza
git checkout -b feat/add-aigateway-plugin
```

### Step 2: Add Plugin to Packages
```bash
cp -r ../plugin-gateway packages/plugin-aigateway
```

### Step 3: Update Monorepo Configuration

#### Update root `package.json`:
```json
{
  "workspaces": [
    "packages/*",
    "packages/plugin-aigateway"
  ]
}
```

#### Update `lerna.json`:
```json
{
  "packages": [
    "packages/*",
    "packages/plugin-aigateway"
  ]
}
```

### Step 4: Integration
1. Run monorepo setup:
```bash
bun install
bun run build
```

2. Ensure all tests pass:
```bash
bun test
```

### Step 5: Create Main Repo PR

**PR Title:** `feat(plugin): Add AI Gateway plugin for universal model access`

**PR Body:**
```markdown
## Relates to
- Closes #[issue-number] (if applicable)
- Feature request: Universal AI model provider

## Risks
- **Risk level:** Low
- **Impact:** Adds new optional plugin, no breaking changes

## Background
This PR adds the AI Gateway plugin to provide universal access to 100+ AI models through various gateway providers (Vercel, OpenRouter, etc.).

### What does this PR do?
- ✅ Adds new plugin: `plugin-aigateway`
- ✅ Implements all 6 ModelType variants
- ✅ Provides 4 new actions for AI interactions
- ✅ Includes caching and retry logic
- ✅ Supports multiple gateway providers

### Type of change
- [ ] Bug fix
- [ ] Improvement
- [x] New feature
- [ ] Breaking change
- [ ] Documentation update

## Documentation
- [x] README included with examples
- [x] All environment variables documented
- [x] TypeScript types exported
- [x] Actions have examples

## Testing
### Where to start reviewing?
- `packages/plugin-aigateway/src/index.ts` - Main plugin export
- `packages/plugin-aigateway/src/actions/` - Action implementations
- `packages/plugin-aigateway/README.md` - Documentation

### Detailed testing steps
1. Install dependencies: `bun install`
2. Set environment variable: `AIGATEWAY_API_KEY=your-key`
3. Run tests: `cd packages/plugin-aigateway && bun test`
4. Test with example agent:
```typescript
import aiGatewayPlugin from '@elizaos/plugin-aigateway';

const agent = {
  plugins: [aiGatewayPlugin],
  settings: {
    AIGATEWAY_API_KEY: 'your-key'
  }
};
```

### Test Coverage
- ✅ Unit tests for all actions
- ✅ Provider initialization tests
- ✅ Configuration validation
- ✅ Error handling tests

## Deploy Notes
No special deployment requirements. Plugin is optional and backward compatible.

## Discord username
[Your Discord username for contributor role]
```

## 📦 NPM Publishing (Required for Registry)

Before submitting to the registry, publish to npm:

```bash
# Login to npm
npm login

# Build the package
npm run build

# Publish
npm publish --access public
```

## 🔄 GitHub Actions Setup

For the plugin repository, add these workflows:

### `.github/workflows/ci.yml`
```yaml
name: CI

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: oven-sh/setup-bun@v1
      - run: bun install
      - run: bun run build
      - run: bun test
```

### `.github/workflows/publish.yml`
```yaml
name: Publish

on:
  release:
    types: [created]

jobs:
  publish:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: oven-sh/setup-bun@v1
      - run: bun install
      - run: bun run build
      - run: npm publish --access public
        env:
          NODE_AUTH_TOKEN: ${{secrets.NPM_TOKEN}}
```

## 📊 Success Metrics

Your PR will be evaluated on:
1. **Code Quality** - Clean, maintainable TypeScript
2. **Documentation** - Clear examples and configuration
3. **Testing** - Comprehensive test coverage
4. **Integration** - Works seamlessly with ElizaOS
5. **Value** - Provides significant functionality

## 🚀 Recommended Approach

1. **Start with Plugin Registry** - Easier approval process
2. **Gain adoption** - Let community use and validate
3. **Then propose for core** - After proven value

## 📝 Additional Notes

- The plugin follows all ElizaOS patterns
- Compatible with existing model providers
- No breaking changes to core
- Enhances AI capabilities significantly
- Supports both individual and enterprise use cases

## 🔗 Resources

- [ElizaOS Main Repo](https://github.com/elizaos/eliza)
- [Plugin Registry](https://github.com/elizaos-plugins/registry)
- [Plugin Examples](https://github.com/elizaos-plugins)
- [ElizaOS Docs](https://docs.elizaos.ai)

---

**Ready to submit?** Follow the checklist above and create your PR! 🎉