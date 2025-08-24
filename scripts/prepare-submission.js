#!/usr/bin/env node

/**
 * Submission Preparation Script for AI Gateway Plugin
 * This script helps prepare the plugin for submission to the registry or main repo
 */

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

const REQUIRED_FILES = [
  'package.json',
  'README.md',
  'LICENSE',
  'plugin.json',
  'tsconfig.json',
  'src/index.ts'
];

const REQUIRED_IMAGES = [
  'images/logo.jpg',
  'images/banner.jpg'
];

const REGISTRY_ENTRY = '"@elizaos-plugins/plugin-vercel-ai-gateway": "github:elizaos-plugins/plugin-vercel-ai-gateway"';

console.log('🚀 AI Gateway Plugin Submission Preparation\n');

// Check Node version
const nodeVersion = process.version;
const majorVersion = parseInt(nodeVersion.split('.')[0].substring(1));
if (majorVersion < 18) {
  console.error('❌ Node.js 18 or higher is required. Current version:', nodeVersion);
  process.exit(1);
}

// Function to check if file exists
function checkFile(filePath) {
  return fs.existsSync(path.join(process.cwd(), filePath));
}

// Function to run command safely
function runCommand(command, silent = false) {
  try {
    const output = execSync(command, { encoding: 'utf8' });
    if (!silent) console.log(output);
    return true;
  } catch (error) {
    if (!silent) console.error(`Failed to run: ${command}`);
    return false;
  }
}

// 1. Check required files
console.log('📁 Checking required files...');
let missingFiles = [];
for (const file of REQUIRED_FILES) {
  if (checkFile(file)) {
    console.log(`  ✅ ${file}`);
  } else {
    console.log(`  ❌ ${file} - MISSING`);
    missingFiles.push(file);
  }
}

if (missingFiles.length > 0) {
  console.error('\n❌ Missing required files. Please create them before submission.');
  process.exit(1);
}

// 2. Check package.json configuration
console.log('\n📦 Checking package.json...');
const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));

const checks = {
  'Package name': packageJson.name === '@elizaos-plugins/plugin-vercel-ai-gateway',
  'Version': !!packageJson.version,
  'Description': !!packageJson.description,
  'Main entry': packageJson.main === 'dist/index.js',
  'Types': packageJson.types === 'dist/index.d.ts',
  'Repository': !!packageJson.repository,
  'License': packageJson.license === 'MIT',
  'Agent config': !!packageJson.agentConfig
};

for (const [check, passed] of Object.entries(checks)) {
  console.log(`  ${passed ? '✅' : '❌'} ${check}`);
}

// 3. Check plugin.json
console.log('\n🔧 Checking plugin.json...');
if (checkFile('plugin.json')) {
  const pluginJson = JSON.parse(fs.readFileSync('plugin.json', 'utf8'));
  console.log(`  ✅ Plugin name: ${pluginJson.name}`);
  console.log(`  ✅ Version: ${pluginJson.version}`);
  console.log(`  ✅ Actions: ${pluginJson.actions.length} defined`);
}

// 4. Run build
console.log('\n🔨 Building project...');
if (runCommand('npm run build', true)) {
  console.log('  ✅ Build successful');
} else {
  console.error('  ❌ Build failed - fix errors before submission');
  process.exit(1);
}

// 5. Run tests
console.log('\n🧪 Running tests...');
if (runCommand('npm test', true)) {
  console.log('  ✅ All tests passed');
} else {
  console.log('  ⚠️  Some tests failed - review before submission');
}

// 6. Check for images (registry only)
console.log('\n🎨 Checking images for registry submission...');
let missingImages = [];
for (const image of REQUIRED_IMAGES) {
  if (checkFile(image)) {
    const stats = fs.statSync(image);
    const sizeMB = (stats.size / 1024 / 1024).toFixed(2);
    console.log(`  ✅ ${image} (${sizeMB} MB)`);
    
    if (image.includes('logo') && stats.size > 500 * 1024) {
      console.log(`    ⚠️  Logo should be under 500KB`);
    }
    if (image.includes('banner') && stats.size > 1024 * 1024) {
      console.log(`    ⚠️  Banner should be under 1MB`);
    }
  } else {
    console.log(`  ⚠️  ${image} - Missing (required for registry)`);
    missingImages.push(image);
  }
}

// 7. Check git status
console.log('\n📝 Checking git status...');
runCommand('git status --short');

// 8. Generate registry entry
console.log('\n📋 Registry Entry (add to index.json):');
console.log('----------------------------------------');
console.log(REGISTRY_ENTRY);
console.log('----------------------------------------');

// 9. Summary and next steps
console.log('\n✨ Summary\n');

const todos = [];

if (missingImages.length > 0) {
  todos.push('Create missing images for registry submission');
}

if (!checkFile('.git')) {
  todos.push('Initialize git repository: git init');
  todos.push('Create GitHub repository: https://github.com/elizaos-plugins/plugin-vercel-ai-gateway');
}

todos.push('Publish to npm: npm publish --access public');
todos.push('Fork the registry: https://github.com/elizaos-plugins/registry');
todos.push('Add entry to registry index.json');
todos.push('Create pull request');

if (todos.length > 0) {
  console.log('📝 Next Steps:');
  todos.forEach((todo, index) => {
    console.log(`${index + 1}. ${todo}`);
  });
}

console.log('\n📚 Resources:');
console.log('- Submission Guide: PR_SUBMISSION_GUIDE.md');
console.log('- Checklist: SUBMISSION_CHECKLIST.md');
console.log('- Registry: https://github.com/elizaos-plugins/registry');
console.log('- Discord: https://discord.gg/elizaos');

console.log('\n✅ Preparation check complete!');
console.log('Good luck with your submission! 🎉\n');