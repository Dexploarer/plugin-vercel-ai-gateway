# 🎯 **Plugin Registry Submission Guide**

## 📋 **Complete Step-by-Step Process**

### **Step 1: Fork the Registry Repository**
1. **Go to**: https://github.com/elizaos-plugins/registry
2. **Click "Fork"** button (top right corner)
3. **Select your GitHub account** to fork to
4. **Wait for fork completion**

### **Step 2: Clone Your Forked Registry**
```bash
# Replace YOUR_USERNAME with your actual GitHub username
git clone https://github.com/YOUR_USERNAME/registry.git
cd registry
```

### **Step 3: Add the Registry Entry**
1. **Open the file**: `index.json`
2. **Add this entry** to the plugins section:
```json
"@elizaos-plugins/plugin-vercel-ai-gateway": "github:elizaos-plugins/plugin-vercel-ai-gateway"
```

**Example of where to add it:**
```json
{
  "plugins": {
    "@elizaos-plugins/plugin-aigateway": "github:elizaos-plugins/plugin-aigateway",
    "@elizaos-plugins/plugin-vercel-ai-gateway": "github:elizaos-plugins/plugin-vercel-ai-gateway",
    // ... other plugins
  }
}
```

### **Step 4: Commit and Push Your Changes**
```bash
# Add the changes
git add index.json

# Commit with descriptive message
git commit -m "feat: Add Vercel AI Gateway Plugin to Registry"

# Push to your fork
git push origin main
```

### **Step 5: Create Pull Request**
1. **Go to your forked repository** on GitHub
2. **Click "Contribute"** button
3. **Click "Open Pull Request"**
4. **Set title**: `feat: Add Vercel AI Gateway Plugin to Registry`
5. **Set description**:
```
## Description
Adds the Vercel AI Gateway Plugin to the ElizaOS Plugin Registry.

## Plugin Details
- **Name**: @elizaos-plugins/plugin-vercel-ai-gateway
- **Repository**: github:elizaos-plugins/plugin-vercel-ai-gateway
- **Description**: Universal AI Gateway integration for ElizaOS with Vercel AI Gateway support

## Features
- Access to 100+ AI models through unified gateways
- Automatic failover and caching
- Centralized billing support
- Full OpenRouter compatibility
- Optimized for Vercel AI Gateway

## Checklist
- [x] Plugin repository exists
- [x] Plugin is functional and tested
- [x] Documentation is complete
- [x] Registry entry follows format
```

6. **Click "Create Pull Request"**

## 🔍 **Registry Entry Format**

The entry should be added to the `index.json` file in this exact format:

```json
"@elizaos-plugins/plugin-vercel-ai-gateway": "github:elizaos-plugins/plugin-vercel-ai-gateway"
```

## 📁 **File Structure in Registry**

Your entry will be added to the `plugins` section of `index.json`:

```json
{
  "plugins": {
    // ... existing plugins
    "@elizaos-plugins/plugin-vercel-ai-gateway": "github:elizaos-plugins/plugin-vercel-ai-gateway"
  }
}
```

## ✅ **Verification Checklist**

Before submitting:
- [ ] Registry entry format is correct
- [ ] Repository URL is valid
- [ ] Plugin name matches exactly
- [ ] Commit message is descriptive
- [ ] PR title follows convention
- [ ] PR description is comprehensive

## 🚀 **After PR Submission**

1. **Wait for review** from maintainers
2. **Address any feedback** if requested
3. **Once merged**, your plugin will be available in the registry
4. **Users can install** with: `npm install @elizaos-plugins/plugin-vercel-ai-gateway`

## 📞 **Need Help?**

- **Registry Issues**: Create issue in the registry repository
- **Plugin Issues**: Create issue in your plugin repository
- **Documentation**: Check the registry README for more details

---

**Status**: Ready for Registry Submission 🎉
**Next Action**: Fork the registry and follow these steps
