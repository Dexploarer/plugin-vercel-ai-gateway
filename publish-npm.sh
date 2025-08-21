#!/bin/bash

# Script to publish to npm under @promptordie scope

echo "Building the package..."
npm run build

echo "Creating temporary package.json for npm publish..."
cp package-npm.json package.json.backup
cp package-npm.json package.json

echo "Publishing to npm as @promptordie/plugin-aigateway..."
npm publish --access public

echo "Restoring original package.json..."
mv package.json.backup package.json

echo "Done! Package is available as @promptordie/plugin-aigateway on npm"
echo "Users can install with: npm install @promptordie/plugin-aigateway"