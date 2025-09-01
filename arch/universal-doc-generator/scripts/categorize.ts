import { readFile, writeFile } from "node:fs/promises";

interface Category {
  name: string;
  description: string;
  patterns: string[];
}

interface Context {
  name: string;
  description: string;
  categories: Category[];
}

// Universal categorization patterns that work for most documentation sites
const CONTEXTS: Context[] = [
  {
    name: "developer-context",
    description: "Technical documentation for developers",
    categories: [
      {
        name: "architecture-&-core-concepts",
        description: "System architecture, core concepts, and fundamental design",
        patterns: ["architecture", "core", "system", "design", "overview", "concepts", "fundamentals"]
      },
      {
        name: "plugin-development",
        description: "Plugin system, creation, and management",
        patterns: ["plugin", "extension", "addon", "module", "component"]
      },
      {
        name: "api-reference",
        description: "API documentation and reference materials",
        patterns: ["api", "reference", "endpoint", "interface", "sdk"]
      },
      {
        name: "development-workflow",
        description: "Development processes, building, testing, and CI/CD",
        patterns: ["development", "workflow", "build", "test", "ci", "cd", "pipeline", "deploy"]
      },
      {
        name: "server-&-infrastructure",
        description: "Server setup, deployment, and infrastructure",
        patterns: ["server", "infrastructure", "deployment", "production", "hosting", "config"]
      },
      {
        name: "data-&-storage",
        description: "Database, storage, and data management",
        patterns: ["data", "storage", "database", "memory", "cache", "persistence"]
      },
      {
        name: "advanced-development",
        description: "Advanced features, integrations, and complex scenarios",
        patterns: ["advanced", "integration", "scenario", "complex", "enterprise", "scaling"]
      }
    ]
  },
  {
    name: "user-context",
    description: "User-facing documentation and guides",
    categories: [
      {
        name: "getting-started",
        description: "Quick start guides and onboarding",
        patterns: ["start", "quick", "guide", "tutorial", "onboarding", "setup", "install"]
      },
      {
        name: "cli-usage",
        description: "Command line interface and tools",
        patterns: ["cli", "command", "terminal", "console", "tool"]
      },
      {
        name: "user-interface",
        description: "Web interface, client apps, and UI",
        patterns: ["ui", "interface", "web", "client", "app", "dashboard", "console"]
      },
      {
        name: "real-time-features",
        description: "Real-time communication and live features",
        patterns: ["real-time", "live", "communication", "chat", "message", "stream"]
      }
    ]
  }
];

function categorizeUrls(urls: string[]): Map<string, string[]> {
  const categorized = new Map<string, string[]>();
  
  // Initialize categories
  CONTEXTS.forEach(context => {
    context.categories.forEach(category => {
      const fullPath = `${context.name}/${category.name}`;
      categorized.set(fullPath, []);
    });
  });
  
  // Add uncategorized bucket
  categorized.set("uncategorized", []);
  
  urls.forEach(url => {
    const urlPath = new URL(url).pathname.toLowerCase();
    let isCategorized = false;
    
    // Check each context and category
    for (const context of CONTEXTS) {
      for (const category of context.categories) {
        for (const pattern of category.patterns) {
          if (urlPath.includes(pattern.toLowerCase())) {
            const fullPath = `${context.name}/${category.name}`;
            const existing = categorized.get(fullPath) || [];
            existing.push(url);
            categorized.set(fullPath, existing);
            isCategorized = true;
            break;
          }
        }
        if (isCategorized) break;
      }
      if (isCategorized) break;
    }
    
    // If not categorized, add to uncategorized
    if (!isCategorized) {
      const uncategorized = categorized.get("uncategorized") || [];
      uncategorized.push(url);
      categorized.set("uncategorized", uncategorized);
    }
  });
  
  return categorized;
}

function generateReport(categorized: Map<string, string[]>, domainName: string): string {
  let report = `# ${domainName} Documentation Categorization Report\n\n`;
  report += `Generated: ${new Date().toISOString()}\n\n`;
  
  let totalUrls = 0;
  
  CONTEXTS.forEach(context => {
    report += `## ${context.name.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}\n`;
    report += `${context.description}\n\n`;
    
    context.categories.forEach(category => {
      const fullPath = `${context.name}/${category.name}`;
      const urls = categorized.get(fullPath) || [];
      totalUrls += urls.length;
      
      report += `### ${category.name.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}\n`;
      report += `${category.description}\n`;
      report += `**URLs Found: ${urls.length}**\n\n`;
      
      if (urls.length > 0) {
        report += "**Pages:**\n";
        urls.forEach(url => {
          const path = new URL(url).pathname;
          report += `- ${path}\n`;
        });
        report += "\n";
      }
    });
  });
  
  // Handle uncategorized
  const uncategorized = categorized.get("uncategorized") || [];
  totalUrls += uncategorized.length;
  
  if (uncategorized.length > 0) {
    report += `## Uncategorized\n`;
    report += `URLs that didn't match any specific patterns: ${uncategorized.length}\n\n`;
    report += "**Pages:**\n";
    uncategorized.forEach(url => {
      const path = new URL(url).pathname;
      report += `- ${path}\n`;
    });
    report += "\n";
  }
  
  report += `## Summary\n`;
  report += `- **Total URLs**: ${totalUrls}\n`;
  report += `- **Categorized**: ${totalUrls - uncategorized.length}\n`;
  report += `- **Uncategorized**: ${uncategorized.length}\n`;
  report += `- **Coverage**: ${((totalUrls - uncategorized.length) / totalUrls * 100).toFixed(1)}%\n`;
  
  return report;
}

function generateSummary(categorized: Map<string, string[]>, domainName: string): string {
  let summary = `# ${domainName} Documentation Summary\n\n`;
  summary += `Generated: ${new Date().toISOString()}\n\n`;
  
  let totalUrls = 0;
  const contextSummary: { [key: string]: number } = {};
  
  CONTEXTS.forEach(context => {
    let contextTotal = 0;
    context.categories.forEach(category => {
      const fullPath = `${context.name}/${category.name}`;
      const urls = categorized.get(fullPath) || [];
      contextTotal += urls.length;
      totalUrls += urls.length;
    });
    contextSummary[context.name] = contextTotal;
  });
  
  const uncategorized = categorized.get("uncategorized") || [];
  totalUrls += uncategorized.length;
  
  summary += `## Overview\n`;
  summary += `- **Total Documentation Pages**: ${totalUrls}\n`;
  summary += `- **Developer Context**: ${contextSummary["developer-context"]} pages\n`;
  summary += `- **User Context**: ${contextSummary["user-context"]} pages\n`;
  summary += `- **Uncategorized**: ${uncategorized.length} pages\n\n`;
  
  summary += `## Context Breakdown\n`;
  CONTEXTS.forEach(context => {
    summary += `### ${context.name.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}\n`;
    summary += `${context.description}\n`;
    summary += `**Total Pages**: ${contextSummary[context.name]}\n\n`;
    
    context.categories.forEach(category => {
      const fullPath = `${context.name}/${category.name}`;
      const urls = categorized.get(fullPath) || [];
      if (urls.length > 0) {
        summary += `- **${category.name.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}**: ${urls.length} pages\n`;
      }
    });
    summary += "\n";
  });
  
  return summary;
}

async function main() {
  try {
    // Find the links file based on domain
    const { readdir } = await import('fs/promises');
    const files = await readdir(".", { withFileTypes: true });
    const linkFiles = files.filter(f => f.isFile() && f.name.endsWith('_links.txt'));
    
    if (linkFiles.length === 0) {
      console.error("❌ No links file found. Please run the crawler first.");
      process.exit(1);
    }
    
    const linksFile = linkFiles[0].name;
    const domainName = linksFile.replace('_links.txt', '').replace(/_/g, '.');
    
    console.log(`📁 Reading links from: ${linksFile}`);
    console.log(`🌐 Domain: ${domainName}`);
    
    const content = await readFile(linksFile, "utf8");
    const urls = content.trim().split("\n").filter(Boolean);
    
    console.log(`🔗 Found ${urls.length} URLs to categorize`);
    
    const categorized = categorizeUrls(urls);
    
    // Generate reports
    const report = generateReport(categorized, domainName);
    const summary = generateSummary(categorized, domainName);
    
    const reportFile = `${domainName}_categorization.md`;
    const summaryFile = `${domainName}_summary.md`;
    
    await writeFile(reportFile, report, "utf8");
    await writeFile(summaryFile, summary, "utf8");
    
    console.log(`✅ Categorization complete!`);
    console.log(`📄 Detailed report: ${reportFile}`);
    console.log(`📊 Summary: ${summaryFile}`);
    
    // Print quick stats
    let totalCategorized = 0;
    CONTEXTS.forEach(context => {
      context.categories.forEach(category => {
        const fullPath = `${context.name}/${category.name}`;
        const urls = categorized.get(fullPath) || [];
        totalCategorized += urls.length;
      });
    });
    
    const uncategorized = categorized.get("uncategorized") || [];
    console.log(`\n📈 Quick Stats:`);
    console.log(`   Total URLs: ${urls.length}`);
    console.log(`   Categorized: ${totalCategorized}`);
    console.log(`   Uncategorized: ${uncategorized.length}`);
    console.log(`   Coverage: ${(totalCategorized / urls.length * 100).toFixed(1)}%`);
    
  } catch (error) {
    console.error("❌ Error during categorization:", error);
    process.exit(1);
  }
}

main();
