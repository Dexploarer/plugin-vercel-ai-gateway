import { chromium, Browser, Page } from "playwright";
import { readFile, writeFile, mkdir } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";

interface Category {
  name: string;
  description: string;
  patterns: string[];
  urls: string[];
}

interface Context {
  name: string;
  description: string;
  categories: Category[];
}

interface ScrapedContent {
  url: string;
  title: string;
  content: string;
  timestamp: string;
  category: string;
  context: string;
}

const extractPageContent = async (page: Page): Promise<{ title: string; content: string }> => {
  // Wait for content to load
  await page.waitForLoadState("domcontentloaded");
  
  // Extract title
  const title = await page.title();
  
  // Extract main content - try different selectors for the main content area
  const contentSelectors = [
    'main',
    '[role="main"]',
    '.content',
    '.main-content',
    'article',
    '.article',
    '#content',
    '.markdown-body',
    '.prose'
  ];
  
  let content = '';
  for (const selector of contentSelectors) {
    try {
      const element = await page.$(selector);
      if (element) {
        content = await element.innerText();
        if (content.trim().length > 100) break; // Found substantial content
      }
    } catch (e) {
      // Continue to next selector
    }
  }
  
  // If no main content found, get body text
  if (!content.trim()) {
    content = await page.evaluate(() => {
      // Remove script and style elements
      const scripts = document.querySelectorAll('script, style, nav, header, footer, .nav, .header, .footer');
      scripts.forEach(el => el.remove());
      
      // Get text content
      return document.body.innerText;
    });
  }
  
  return { title, content: content.trim() };
};

const scrapeCategory = async (
  browser: Browser,
  category: Category,
  contextName: string,
  categoryName: string
): Promise<ScrapedContent[]> => {
  console.log(`Scraping ${category.urls.length} URLs for ${categoryName}...`);
  
  const results: ScrapedContent[] = [];
  const timestamp = new Date().toISOString();
  
  // Create promises for all URLs in this category
  const scrapePromises = category.urls.map(async (url, index) => {
    try {
      const context = await browser.newContext({
        userAgent: "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124 Safari/537.36"
      });
      
      const page = await context.newPage();
      
      // Block unnecessary resources
      await page.route("**/*.{png,jpg,jpeg,gif,webp,mp4,mp3,woff,woff2,ttf,otf,zip,svg}", route => route.abort());
      
      console.log(`  [${index + 1}/${category.urls.length}] Scraping: ${url}`);
      
      await page.goto(url, { 
        waitUntil: "domcontentloaded", 
        timeout: 30000 
      });
      
      // Wait for content to load
      try {
        await page.waitForLoadState("networkidle", { timeout: 5000 });
      } catch (e) {
        // Continue if network doesn't become idle
      }
      
      // Small delay to ensure dynamic content loads
      await page.waitForTimeout(1000);
      
      const { title, content } = await extractPageContent(page);
      
      await context.close();
      
      return {
        url,
        title,
        content,
        timestamp,
        category: categoryName,
        context: contextName
      };
      
    } catch (error) {
      console.error(`  Error scraping ${url}:`, error.message);
      return {
        url,
        title: 'Error loading page',
        content: `Error: ${error.message}`,
        timestamp,
        category: categoryName,
        context: contextName
      };
    }
  });
  
  // Wait for all pages in this category to be scraped
  const categoryResults = await Promise.all(scrapePromises);
  results.push(...categoryResults);
  
  console.log(`✅ Completed ${categoryName}: ${categoryResults.length} pages`);
  return results;
};

const saveContent = async (content: ScrapedContent[], outputDir: string): Promise<void> => {
  // Create directory structure
  const contextDir = path.join(outputDir, content[0].context.replace(/\s+/g, '-').toLowerCase());
  const categoryDir = path.join(contextDir, content[0].category.replace(/\s+/g, '-').toLowerCase());
  
  if (!existsSync(contextDir)) {
    await mkdir(contextDir, { recursive: true });
  }
  if (!existsSync(categoryDir)) {
    await mkdir(categoryDir, { recursive: true });
  }
  
  // Save each page as individual file
  for (const item of content) {
    const filename = item.url.split('/').pop() || 'index';
    const safeFilename = filename.replace(/[^a-zA-Z0-9-_]/g, '_') + '.md';
    const filepath = path.join(categoryDir, safeFilename);
    
    const markdownContent = `# ${item.title}

**URL:** ${item.url}
**Category:** ${item.category}
**Context:** ${item.context}
**Scraped:** ${item.timestamp}

---

${item.content}
`;
    
    await writeFile(filepath, markdownContent, 'utf8');
  }
  
  // Save summary file for the category
  const summaryPath = path.join(categoryDir, '_summary.md');
  const summaryContent = `# ${content[0].category} Summary

**Context:** ${content[0].context}
**Total Pages:** ${content.length}
**Scraped:** ${content[0].timestamp}

## Pages

${content.map(item => `- [${item.title}](${item.url})`).join('\n')}
`;
  
  await writeFile(summaryPath, summaryContent, 'utf8');
};

const categorizeUrls = (urls: string[]): Context[] => {
  const contexts: Context[] = [
    {
      name: "Developer Context",
      description: "Technical documentation for developers building with ElizaOS",
      categories: [
        {
          name: "Architecture & Core Concepts",
          description: "Fundamental system architecture and core concepts",
          patterns: ["architecture", "core-system", "overview"],
          urls: []
        },
        {
          name: "Plugin Development",
          description: "Creating and managing plugins for ElizaOS",
          patterns: ["plugin", "creating-plugins", "plugin-architecture"],
          urls: []
        },
        {
          name: "API Reference",
          description: "Complete API documentation for developers",
          patterns: ["api-reference", "core-api", "client-api", "cli-api"],
          urls: []
        },
        {
          name: "Development Workflow",
          description: "Development tools, testing, and CI/CD",
          patterns: ["development", "building", "testing", "cicd", "contributing"],
          urls: []
        },
        {
          name: "Server & Infrastructure",
          description: "Server architecture, deployment, and configuration",
          patterns: ["server", "deployment", "configuration"],
          urls: []
        },
        {
          name: "Data & Storage",
          description: "Database integration and data management",
          patterns: ["data", "database", "memory-management", "data-models"],
          urls: []
        },
        {
          name: "Advanced Development",
          description: "Advanced features and integrations",
          patterns: ["advanced-features", "tee-integration", "scenario-testing"],
          urls: []
        }
      ]
    },
    {
      name: "User Context", 
      description: "Documentation for end users and administrators",
      categories: [
        {
          name: "Getting Started",
          description: "Quick start guides and basic setup",
          patterns: ["getting-started", "overview"],
          urls: []
        },
        {
          name: "CLI Usage",
          description: "Command line interface usage and commands",
          patterns: ["cli-system", "commands", "project-creation"],
          urls: []
        },
        {
          name: "User Interface",
          description: "Web interface and client applications",
          patterns: ["web-interface", "client-interfaces", "agent-management-ui"],
          urls: []
        },
        {
          name: "Plugin Management",
          description: "Installing and managing plugins",
          patterns: ["plugin-management", "plugin-registry", "core-plugins"],
          urls: []
        },
        {
          name: "Configuration",
          description: "System configuration and settings",
          patterns: ["settings", "configuration", "environment"],
          urls: []
        },
        {
          name: "Real-time Features",
          description: "Real-time communication and features",
          patterns: ["real-time", "communication", "platform-clients"],
          urls: []
        }
      ]
    }
  ];

  // Categorize each URL
  urls.forEach(url => {
    const pathname = new URL(url).pathname;
    const segments = pathname.split('/').filter(Boolean);
    
    if (segments.length < 3) return;
    
    const relevantPath = segments.slice(2).join('/');
    
    let categorized = false;
    
    for (const context of contexts) {
      for (const category of context.categories) {
        if (category.patterns.some(pattern => relevantPath.includes(pattern))) {
          category.urls.push(url);
          categorized = true;
          break;
        }
      }
      if (categorized) break;
    }
    
    if (!categorized) {
      if (relevantPath.match(/^\d+\.\d+/) || relevantPath.includes('api') || relevantPath.includes('development')) {
        contexts[0].categories[0].urls.push(url);
      } else {
        contexts[1].categories[0].urls.push(url);
      }
    }
  });

  return contexts;
};

async function main() {
  try {
    console.log("🚀 Starting universal content scraping...");
    
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
    
    // Read URLs
    console.log("Reading crawled URLs...");
    const content = await readFile(linksFile, "utf8");
    const urls = content.trim().split("\n").filter(Boolean);
    
    console.log(`Processing ${urls.length} URLs...`);
    const contexts = categorizeUrls(urls);
    
    // Launch browser
    console.log("Launching browser...");
    const browser: Browser = await chromium.launch({ 
      headless: true,
      executablePath: '/usr/bin/chromium-browser'
    });
    
    const outputDir = "scraped-content";
    if (!existsSync(outputDir)) {
      await mkdir(outputDir);
    }
    
    console.log(`\n📁 Output directory: ${outputDir}`);
    
    // Scrape each context and category
    for (const context of contexts) {
      console.log(`\n📚 Processing ${context.name}...`);
      
      for (const category of context.categories) {
        if (category.urls.length === 0) continue;
        
        console.log(`\n  📂 Category: ${category.name} (${category.urls.length} URLs)`);
        
        // Scrape all URLs in this category concurrently
        const scrapedContent = await scrapeCategory(
          browser, 
          category, 
          context.name, 
          category.name
        );
        
        // Save content to organized directory structure
        await saveContent(scrapedContent, outputDir);
      }
    }
    
    await browser.close();
    
    console.log("\n✅ Content scraping completed!");
    console.log(`📁 All content saved to: ${outputDir}/`);
    
    // Generate overall summary
    const summaryPath = path.join(outputDir, "README.md");
    const summaryContent = `# ElizaOS Scraped Content

This directory contains all scraped content from the ElizaOS documentation, organized by context and category.

## Structure

${contexts.map(context => {
  const totalUrls = context.categories.reduce((sum, cat) => sum + cat.urls.length, 0);
  return `### ${context.name} (${totalUrls} pages)
${context.categories.filter(cat => cat.urls.length > 0).map(cat => 
  `- **${cat.name}**: ${cat.urls.length} pages`
).join('\n')}`;
}).join('\n\n')}

## Scraping Details

- **Total URLs**: ${urls.length}
- **Scraped**: ${new Date().toISOString()}
- **Browser**: Chromium (headless)
- **Concurrency**: Per-category (all URLs in a category scraped simultaneously)

## File Format

Each page is saved as a Markdown file with:
- Page title
- Original URL
- Category and context information
- Timestamp
- Full page content
`;
    
    await writeFile(summaryPath, summaryContent, 'utf8');
    console.log(`📄 Summary saved to: ${summaryPath}`);
    
  } catch (error) {
    console.error("❌ Error:", error);
    process.exit(1);
  }
}

main();
