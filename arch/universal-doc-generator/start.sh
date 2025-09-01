#!/bin/bash

# Universal Documentation Generator - Startup Script
# This script provides an easy way to run the documentation generation system

set -e  # Exit on any error

echo "🚀 Universal Documentation Generator"
echo "===================================="
echo ""

# Check if we're in the right directory
if [ ! -f "scripts/crawl.ts" ]; then
    echo "❌ Error: Please run this script from the universal-doc-generator directory"
    exit 1
fi

# Check if Bun is installed
if ! command -v bun &> /dev/null; then
    echo "❌ Error: Bun is not installed. Please install Bun first:"
    echo "   curl -fsSL https://bun.sh/install | bash"
    exit 1
fi

# Check if dependencies are installed
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    bun install
fi

# Check if Chromium is installed
if ! bunx playwright --version &> /dev/null; then
    echo "🌐 Installing Chromium for web scraping..."
    bunx playwright install chromium
fi

# Get target URL from user
echo ""
echo "🎯 Configuration:"
echo "Enter the URL of the documentation website you want to process:"
echo "Example: https://docs.example.com"
echo ""

read -p "Target URL: " target_url

if [ -z "$target_url" ]; then
    echo "❌ Error: URL is required"
    exit 1
fi

echo ""
echo "🤔 Processing Options:"
echo "1. Run complete pipeline with AI polishing (recommended)"
echo "2. Run without AI polishing (cost savings)"
echo "3. Run individual steps"
echo "4. Cost estimation only"
echo "5. Exit"
echo ""

read -p "Select an option (1-5): " choice

case $choice in
    1)
        echo ""
        echo "🚀 Running complete pipeline..."
        START_URL="$target_url" bun run-all.ts
        ;;
    2)
        echo ""
        echo "💰 Running without AI polishing..."
        echo "Note: This will skip cost estimation and AI polishing steps"
        START_URL="$target_url" bun run-all.ts --skip-ai
        ;;
    3)
        echo ""
        echo "📋 Individual steps:"
        echo "1. Crawl documentation URLs"
        echo "2. Categorize URLs"
        echo "3. Scrape content"
        echo "4. Generate documentation"
        echo "5. Estimate costs"
        echo "6. Polish with AI"
        echo ""
        read -p "Select step (1-6): " step
        case $step in
            1) START_URL="$target_url" bun scripts/crawl.ts ;;
            2) bun scripts/categorize.ts ;;
            3) bun scripts/scrape-content.ts ;;
            4) bun scripts/generate-docs.ts ;;
            5) bun scripts/cost-estimator.ts ;;
            6) bun scripts/polish-docs.ts ;;
            *) echo "Invalid option" ;;
        esac
        ;;
    4)
        echo ""
        echo "💰 Running cost estimation..."
        bun scripts/cost-estimator.ts
        ;;
    5)
        echo "👋 Goodbye!"
        exit 0
        ;;
    *)
        echo "Invalid option"
        exit 1
        ;;
esac

echo ""
echo "✅ Process completed!"
echo "📁 Check the 'output/' directory for generated documentation"
echo "📄 See EXECUTION_SUMMARY.md for detailed results"
