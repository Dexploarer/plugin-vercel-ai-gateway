#!/bin/bash

echo "Fixing GitHub sync issue by removing problematic commit with API key..."

# Check current status
echo "Current git status:"
git status

# Create a backup branch
echo "Creating backup branch..."
git branch backup-info-$(date +%Y%m%d-%H%M%S)

# Reset to the commit before the problematic one
echo "Resetting to remove problematic commit..."
git reset --hard HEAD~1

# Check if the problematic file exists and remove it
if [ -f "deepwiki-crawl/src/polish-docs.ts" ]; then
    echo "Removing file with API key..."
    rm -f "deepwiki-crawl/src/polish-docs.ts"
    git add -A
    git commit -m "Remove file containing API key"
fi

# Force push to update the remote branch
echo "Force pushing to update remote branch..."
git push origin info --force

echo "GitHub sync fix completed!"
