# 📋 AI Gateway Plugin Submission Checklist

## Pre-Submission Tasks

### 🔧 Code Preparation
- [ ] Run formatter: `npm run format`
- [ ] Build successfully: `npm run build`
- [ ] All tests pass: `npm test`
- [ ] No TypeScript errors
- [ ] Remove all `console.log` statements
- [ ] Update version in `package.json` if needed

### 📚 Documentation
- [ ] README.md is complete
- [ ] All environment variables documented
- [ ] plugin.json manifest is accurate
- [ ] Examples in `examples/` directory work
- [ ] LICENSE file present (MIT)
- [ ] PR_SUBMISSION_GUIDE.md reviewed

### 🎨 Assets (For Registry)
- [ ] Create logo.jpg (400x400px)
- [ ] Create banner.jpg (1280x640px)
- [ ] Take screenshots for demos
- [ ] Optimize all images (<500KB logo, <1MB banner)

### 🧪 Testing Evidence
- [ ] Run and save test output: `npm test > test-results.txt`
- [ ] Test with actual API key
- [ ] Test all 4 actions manually
- [ ] Test with different gateway URLs
- [ ] Document any limitations found

## Submission Process

### 📦 NPM Publishing (Do First!)
```bash
# 1. Login to npm
npm login

# 2. Build the package
npm run build

# 3. Publish to npm
npm publish --access public

# 4. Verify on npm
# Visit: https://www.npmjs.com/package/@elizaos-plugins/plugin-aigateway
```

### 🗂️ Plugin Registry Submission

#### 1. Create GitHub Repository
- [ ] Create repo: `https://github.com/elizaos-plugins/plugin-aigateway`
- [ ] Push all code
- [ ] Add GitHub topics:
  - `elizaos`
  - `elizaos-plugin`
  - `ai`
  - `llm`
  - `gateway`
  - `vercel`
  - `openrouter`

#### 2. Fork Registry Repository
```bash
# Fork and clone
git clone https://github.com/YOUR_USERNAME/registry.git
cd registry
```

#### 3. Update Registry index.json
Add this line in alphabetical order:
```json
"@elizaos-plugins/plugin-aigateway": "github:elizaos-plugins/plugin-aigateway",
```

#### 4. Create Pull Request
- [ ] Title: `feat: Add AI Gateway Plugin to Registry`
- [ ] Use template from PR_SUBMISSION_GUIDE.md
- [ ] Include screenshots
- [ ] Add testing evidence

### 🏗️ Main Repository Submission (Optional)

#### 1. Fork Main Repository
```bash
git clone https://github.com/YOUR_USERNAME/eliza.git
cd eliza
git checkout -b feat/add-aigateway-plugin
```

#### 2. Add Plugin to Packages
```bash
cp -r ../plugin-gateway packages/plugin-aigateway
cd packages/plugin-aigateway
rm -rf node_modules .git
```

#### 3. Update Monorepo Files
- [ ] Add to root package.json workspaces
- [ ] Add to lerna.json packages
- [ ] Run `bun install` from root
- [ ] Run `bun run build` from root

#### 4. Create Pull Request
- [ ] Title: `feat(plugin): Add AI Gateway plugin for universal model access`
- [ ] Use template from PR_SUBMISSION_GUIDE.md
- [ ] Reference any related issues
- [ ] Include comprehensive testing steps

## Post-Submission

### 📊 Monitor PR
- [ ] Respond to review comments promptly
- [ ] Fix any CI/CD failures
- [ ] Update documentation if requested
- [ ] Be patient - reviews take time

### 🎉 After Approval
- [ ] Thank reviewers
- [ ] Update your local fork
- [ ] Tweet about it (tag @elizaos)
- [ ] Write a blog post/tutorial
- [ ] Support users in Discord

## Quick Commands Reference

```bash
# Format and lint
npm run format
npm run lint

# Build and test
npm run build
npm test

# Clean and rebuild
npm run clean
npm install
npm run build

# Publish to npm
npm publish --access public

# Git commands for PR
git add .
git commit -m "feat: Add AI Gateway plugin"
git push origin feat/add-aigateway-plugin
```

## Support Resources

- **Discord:** [ElizaOS Community](https://discord.gg/elizaos)
- **Registry Issues:** https://github.com/elizaos-plugins/registry/issues
- **Main Repo Issues:** https://github.com/elizaos/eliza/issues
- **Plugin Examples:** https://github.com/elizaos-plugins

## Common Issues & Solutions

### Issue: Tests failing
- Ensure all dependencies installed: `npm install`
- Check Node version: `node --version` (should be >=18)
- Verify TypeScript compiles: `npx tsc --noEmit`

### Issue: NPM publish fails
- Check npm login: `npm whoami`
- Ensure unique package name
- Verify package.json is valid JSON

### Issue: PR checks failing
- Run pre-commit hook: `bun run pre-commit`
- Fix linting issues: `npm run lint`
- Ensure all tests pass locally

### Issue: Images too large
- Use online compressors
- Reduce dimensions if needed
- Convert PNG to JPG for photos

---

**Ready?** Go through this checklist systematically and submit your PR! 🚀