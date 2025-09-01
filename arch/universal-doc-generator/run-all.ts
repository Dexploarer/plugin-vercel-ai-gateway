#!/usr/bin/env bun

import { execSync } from "child_process";
import { existsSync, mkdirSync } from "fs";
import { writeFile } from "fs/promises";

interface Step {
  name: string;
  description: string;
  command: string;
  required: boolean;
}

const STEPS: Step[] = [
  {
    name: "1. Crawl Documentation",
    description: "Crawl documentation from the specified URL",
    command: "bun scripts/crawl.ts",
    required: true
  },
  {
    name: "2. Categorize URLs",
    description: "Organize crawled URLs into developer and user contexts",
    command: "bun scripts/categorize.ts",
    required: true
  },
  {
    name: "3. Scrape Content",
    description: "Scrape actual content from all discovered URLs",
    command: "bun scripts/scrape-content.ts",
    required: true
  },
  {
    name: "4. Generate Documentation",
    description: "Generate comprehensive documentation structure",
    command: "bun scripts/generate-docs.ts",
    required: true
  },
  {
    name: "5. Estimate Costs",
    description: "Calculate AI polishing costs",
    command: "bun scripts/cost-estimator.ts",
    required: false
  },
  {
    name: "6. Polish with AI",
    description: "Polish documentation using OpenAI models",
    command: "bun scripts/polish-docs.ts",
    required: false
  }
];

const logStep = (step: Step, status: "STARTING" | "COMPLETED" | "SKIPPED" | "ERROR") => {
  const timestamp = new Date().toISOString();
  const statusEmoji = {
    STARTING: "🚀",
    COMPLETED: "✅",
    SKIPPED: "⏭️",
    ERROR: "❌"
  }[status];
  
  console.log(`${statusEmoji} ${step.name} - ${status}`);
  console.log(`   ${step.description}`);
  console.log(`   ${timestamp}\n`);
};

const runStep = async (step: Step, skipOptional: boolean = false): Promise<boolean> => {
  try {
    if (!step.required && skipOptional) {
      logStep(step, "SKIPPED");
      return true;
    }
    
    logStep(step, "STARTING");
    
    // Execute the command
    execSync(step.command, { 
      stdio: 'inherit',
      cwd: process.cwd()
    });
    
    logStep(step, "COMPLETED");
    return true;
    
  } catch (error) {
    logStep(step, "ERROR");
    console.error(`   Error: ${error}`);
    
    if (step.required) {
      console.error(`\n❌ Required step failed. Stopping execution.`);
      return false;
    } else {
      console.error(`\n⚠️ Optional step failed. Continuing...`);
      return true;
    }
  }
};

const createSummary = async (completedSteps: string[], failedSteps: string[], startUrl: string): Promise<void> => {
  const domainName = new URL(startUrl).hostname.replace(/\./g, '_');
  
  const summary = `# Universal Documentation Generator - Execution Summary

## Target Website
- **URL**: ${startUrl}
- **Domain**: ${new URL(startUrl).hostname}
- **Generated**: ${new Date().toISOString()}

## Execution Details
- **Completed Steps**: ${completedSteps.length}
- **Failed Steps**: ${failedSteps.length}

## Completed Steps
${completedSteps.map(step => `- ✅ ${step}`).join('\n')}

## Failed Steps
${failedSteps.length > 0 ? failedSteps.map(step => `- ❌ ${step}`).join('\n') : '- None'}

## Output Files
- **Crawled URLs**: \`${domainName}_links.txt\`
- **Categorization**: \`${domainName}_categorization.md\`, \`${domainName}_summary.md\`
- **Scraped Content**: \`output/scraped-content/\`
- **Generated Docs**: \`output/scraped-content/\` (with full documentation structure)
- **AI Polishing**: \`output/scraped-content/POLISHING_REPORT.md\`

## Next Steps
1. Review the generated documentation in \`output/scraped-content/\`
2. Check quality assessments in \`.assessment.json\` files
3. Use the documentation for your project
4. Run individual scripts for specific tasks if needed

## Scripts Available
- \`bun scripts/crawl.ts\` - Crawl documentation URLs
- \`bun scripts/categorize.ts\` - Categorize URLs
- \`bun scripts/scrape-content.ts\` - Scrape content
- \`bun scripts/generate-docs.ts\` - Generate documentation
- \`bun scripts/cost-estimator.ts\` - Estimate AI costs
- \`bun scripts/polish-docs.ts\` - Polish with AI

## Directory Structure
\`\`\`
universal-doc-generator/
├── scripts/           # All processing scripts
├── output/           # Generated content and documentation
├── docs/            # Additional documentation
├── tools/           # Utility tools
├── package.json     # Dependencies
└── run-all.ts       # This master script
\`\`\`

## Configuration
To use with a different website, set the START_URL environment variable:
\`\`\`bash
START_URL="https://your-website.com/docs" bun run-all.ts
\`\`\`
`;

  await writeFile("EXECUTION_SUMMARY.md", summary, "utf8");
  console.log("📄 Execution summary saved to: EXECUTION_SUMMARY.md");
};

const main = async () => {
  console.log("🚀 Universal Documentation Generator - Master Script");
  console.log("=" .repeat(60));
  console.log("This script will generate comprehensive documentation from any website\n");
  
  // Check if we're in the right directory
  if (!existsSync("scripts/crawl.ts")) {
    console.error("❌ Error: Please run this script from the universal-doc-generator directory");
    process.exit(1);
  }
  
  // Get the target URL
  const startUrl = process.env.START_URL || "https://example.com";
  console.log(`🎯 Target Website: ${startUrl}`);
  console.log(`🌐 Domain: ${new URL(startUrl).hostname}\n`);
  
  // Create output directory if it doesn't exist
  if (!existsSync("output")) {
    mkdirSync("output", { recursive: true });
  }
  
  const completedSteps: string[] = [];
  const failedSteps: string[] = [];
  
  // Check command line arguments
  const args = process.argv.slice(2);
  const skipOptional = args.includes("--skip-ai");
  
  if (skipOptional) {
    console.log("💰 Running without AI polishing (cost savings)...\n");
  } else {
    console.log("🤖 Running complete pipeline with AI polishing...\n");
  }
  
  // Execute each step
  for (const step of STEPS) {
    const success = await runStep(step, skipOptional);
    
    if (success) {
      completedSteps.push(step.name);
    } else {
      failedSteps.push(step.name);
      if (step.required) {
        break; // Stop on required step failure
      }
    }
    
    // Add a small delay between steps
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  // Generate summary
  console.log("\n" + "=".repeat(60));
  console.log("📊 EXECUTION SUMMARY");
  console.log("=".repeat(60));
  
  await createSummary(completedSteps, failedSteps, startUrl);
  
  console.log(`\n✅ Completed Steps: ${completedSteps.length}`);
  console.log(`❌ Failed Steps: ${failedSteps.length}`);
  
  if (failedSteps.length === 0) {
    console.log("\n🎉 All steps completed successfully!");
    console.log("📁 Check the 'output/' directory for generated documentation");
  } else {
    console.log("\n⚠️ Some steps failed. Check the output above for details.");
  }
  
  console.log("\n📄 Full summary: EXECUTION_SUMMARY.md");
};

// Handle command line arguments
const args = process.argv.slice(2);
if (args.includes("--help") || args.includes("-h")) {
  console.log(`
Universal Documentation Generator - Master Script

Usage: bun run-all.ts [options]

Options:
  --help, -h     Show this help message
  --skip-ai      Skip AI polishing steps

Environment Variables:
  START_URL      Target website URL (default: https://example.com)
  MAX_PAGES      Maximum pages to crawl (default: 1000)
  CONCURRENCY    Number of concurrent browsers (default: 16)

Examples:
  # Generate docs from a specific website
  START_URL="https://docs.example.com" bun run-all.ts
  
  # Skip AI polishing for cost savings
  START_URL="https://docs.example.com" bun run-all.ts --skip-ai
  
  # Custom crawling limits
  START_URL="https://docs.example.com" MAX_PAGES=500 CONCURRENCY=8 bun run-all.ts

Steps:
  1. Crawl Documentation - Discover URLs from target website
  2. Categorize URLs - Organize into developer/user contexts
  3. Scrape Content - Extract actual content from URLs
  4. Generate Documentation - Create comprehensive doc structure
  5. Estimate Costs - Calculate AI polishing costs
  6. Polish with AI - Enhance documentation quality

Output:
  - All generated files in output/ directory
  - Execution summary in EXECUTION_SUMMARY.md
  - Quality assessments in .assessment.json files
`);
  process.exit(0);
}

main().catch(error => {
  console.error("❌ Fatal error:", error);
  process.exit(1);
});
