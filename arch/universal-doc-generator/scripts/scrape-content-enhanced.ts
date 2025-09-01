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

interface EnhancedScrapedContent {
  url: string;
  title: string;
  content: string;
  timestamp: string;
  category: string;
  context: string;
  metadata: {
    sourceFiles: string[];
    codeReferences: string[];
    diagrams: string[];
    crossReferences: string[];
    navigation: string[];
    breadcrumbs: string[];
    tags: string[];
    lastModified?: string;
    contributors?: string[];
  };
  rawHtml?: string;
  screenshots?: string[];
}

const extractEnhancedPageContent = async (page: Page): Promise<{
  title: string;
  content: string;
  metadata: EnhancedScrapedContent['metadata'];
  rawHtml?: string;
}> => {
  // Wait for content to load
  await page.waitForLoadState("domcontentloaded");
  
  // Extract title
  const title = await page.title();
  
  // Extract comprehensive metadata and content
  const pageData = await page.evaluate(() => {
    const metadata = {
      sourceFiles: [] as string[],
      codeReferences: [] as string[],
      diagrams: [] as string[],
      crossReferences: [] as string[],
      navigation: [] as string[],
      breadcrumbs: [] as string[],
      tags: [] as string[],
      lastModified: undefined as string | undefined,
      contributors: [] as string[]
    };

    const title = document.title;

    // Extract source file references (common in deepwiki)
    const sourceElements = document.querySelectorAll('code, pre, .source, .file, [data-source]');
    sourceElements.forEach(el => {
      const text = el.textContent?.trim();
      if (text && (text.includes('.ts') || text.includes('.js') || text.includes('.json') || text.includes('packages/'))) {
        metadata.sourceFiles.push(text);
      }
    });

    // Extract code references with line numbers
    const codeRefs = document.querySelectorAll('a[href*="packages/"], a[href*="src/"], .code-ref, [data-line]');
    codeRefs.forEach(el => {
      const href = (el as HTMLAnchorElement).href;
      const text = el.textContent?.trim();
      if (href || text) {
        metadata.codeReferences.push(`${text} (${href})`);
      }
    });

    // Extract diagrams and images
    const images = document.querySelectorAll('img, svg, .diagram, .chart');
    images.forEach(img => {
      const src = (img as HTMLImageElement).src;
      const alt = (img as HTMLImageElement).alt;
      if (src || alt) {
        metadata.diagrams.push(`${alt} (${src})`);
      }
    });

    // Extract cross-references and links
    const links = document.querySelectorAll('a[href*="/elizaOS/eliza/"]');
    links.forEach(link => {
      const href = (link as HTMLAnchorElement).href;
      const text = link.textContent?.trim();
      if (href && text && !href.includes('#')) {
        metadata.crossReferences.push(`${text} (${href})`);
      }
    });

    // Extract navigation elements
    const navElements = document.querySelectorAll('nav, .nav, .navigation, .sidebar, .menu');
    navElements.forEach(nav => {
      const links = nav.querySelectorAll('a');
      links.forEach(link => {
        const text = link.textContent?.trim();
        const href = (link as HTMLAnchorElement).href;
        if (text && href) {
          metadata.navigation.push(`${text} (${href})`);
        }
      });
    });

    // Extract breadcrumbs
    const breadcrumbElements = document.querySelectorAll('.breadcrumb, .breadcrumbs, [aria-label*="breadcrumb"]');
    breadcrumbElements.forEach(bc => {
      const items = bc.querySelectorAll('a, span');
      items.forEach(item => {
        const text = item.textContent?.trim();
        if (text) {
          metadata.breadcrumbs.push(text);
        }
      });
    });

    // Extract tags and metadata
    const tagElements = document.querySelectorAll('.tag, .label, .badge, [data-tag]');
    tagElements.forEach(tag => {
      const text = tag.textContent?.trim();
      if (text) {
        metadata.tags.push(text);
      }
    });

    // Try to find last modified date
    const timeElements = document.querySelectorAll('time, .date, .modified, [datetime]');
    timeElements.forEach(time => {
      const datetime = (time as HTMLTimeElement).datetime;
      const text = time.textContent?.trim();
      if (datetime || text) {
        metadata.lastModified = datetime || text;
      }
    });

    // Extract main content with enhanced selectors
    const contentSelectors = [
      'main',
      '[role="main"]',
      '.content',
      '.main-content',
      'article',
      '.article',
      '#content',
      '.markdown-body',
      '.prose',
      '.documentation',
      '.wiki-content'
    ];
    
    let content = '';
    let mainElement: Element | null = null;
    
    for (const selector of contentSelectors) {
      try {
        const element = document.querySelector(selector);
        if (element) {
          content = element.textContent || '';
          if (content.trim().length > 100) {
            mainElement = element;
            break;
          }
        }
      } catch (e) {
        // Continue to next selector
      }
    }
    
    // If no main content found, get body text
    if (!content.trim()) {
      // Remove script and style elements
      const scripts = document.querySelectorAll('script, style, nav, header, footer, .nav, .header, .footer');
      scripts.forEach(el => el.remove());
      
      content = document.body.textContent || '';
    }

    // Get raw HTML for additional processing
    const rawHtml = mainElement ? mainElement.innerHTML : document.body.innerHTML;

    return {
      title: title,
      content: content.trim(),
      metadata,
      rawHtml
    };
  });

  return pageData;
};

const scrapeCategoryEnhanced = async (
  browser: Browser,
  category: Category,
  contextName: string,
  categoryName: string
): Promise<EnhancedScrapedContent[]> => {
  console.log(`🔍 Enhanced scraping ${category.urls.length} URLs for ${categoryName}...`);
  
  const results: EnhancedScrapedContent[] = [];
  const timestamp = new Date().toISOString();
  
  // Create promises for all URLs in this category
  const scrapePromises = category.urls.map(async (url, index) => {
    try {
      const context = await browser.newContext({
        userAgent: "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124 Safari/537.36",
        viewport: { width: 1920, height: 1080 }
      });
      
      const page = await context.newPage();
      
      // Block unnecessary resources but allow images for diagrams
      await page.route("**/*.{mp4,mp3,woff,woff2,ttf,otf,zip,svg}", route => route.abort());
      
      console.log(`  [${index + 1}/${category.urls.length}] Enhanced scraping: ${url}`);
      
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
      await page.waitForTimeout(2000);
      
      const { title, content, metadata, rawHtml } = await extractEnhancedPageContent(page);
      
      // Take screenshot for visual context
      let screenshot = '';
      try {
        screenshot = await page.screenshot({ 
          type: 'png',
          fullPage: true,
          encoding: 'base64'
        });
      } catch (e) {
        console.log(`    ⚠️ Could not capture screenshot for ${url}`);
      }
      
      await context.close();
      
      return {
        url,
        title,
        content,
        timestamp,
        category: categoryName,
        context: contextName,
        metadata,
        rawHtml,
        screenshots: screenshot ? [screenshot] : []
      };
      
    } catch (error) {
      console.error(`  ❌ Error enhanced scraping ${url}:`, error.message);
      return {
        url,
        title: 'Error loading page',
        content: `Error: ${error.message}`,
        timestamp,
        category: categoryName,
        context: contextName,
        metadata: {
          sourceFiles: [],
          codeReferences: [],
          diagrams: [],
          crossReferences: [],
          navigation: [],
          breadcrumbs: [],
          tags: []
        }
      };
    }
  });
  
  // Wait for all pages in this category to be scraped
  const categoryResults = await Promise.all(scrapePromises);
  results.push(...categoryResults);
  
  console.log(`✅ Enhanced scraping completed for ${categoryName}: ${categoryResults.length} pages`);
  return results;
};

const saveEnhancedContent = async (content: EnhancedScrapedContent[], outputDir: string): Promise<void> => {
  // Create directory structure
  const contextDir = path.join(outputDir, content[0].context.replace(/\s+/g, '-').toLowerCase());
  const categoryDir = path.join(contextDir, content[0].category.replace(/\s+/g, '-').toLowerCase());
  
  if (!existsSync(contextDir)) {
    await mkdir(contextDir, { recursive: true });
  }
  if (!existsSync(categoryDir)) {
    await mkdir(categoryDir, { recursive: true });
  }
  
  // Save each page as individual file with enhanced content
  for (const item of content) {
    const filename = item.url.split('/').pop() || 'index';
    const safeFilename = filename.replace(/[^a-zA-Z0-9-_]/g, '_') + '.md';
    const filepath = path.join(categoryDir, safeFilename);
    
    const markdownContent = `# ${item.title}

**URL:** ${item.url}
**Category:** ${item.category}
**Context:** ${item.context}
**Scraped:** ${item.timestamp}

## Metadata

### Source Files
${item.metadata.sourceFiles.length > 0 ? item.metadata.sourceFiles.map(file => `- \`${file}\``).join('\n') : '- None found'}

### Code References
${item.metadata.codeReferences.length > 0 ? item.metadata.codeReferences.map(ref => `- ${ref}`).join('\n') : '- None found'}

### Diagrams & Images
${item.metadata.diagrams.length > 0 ? item.metadata.diagrams.map(diagram => `- ${diagram}`).join('\n') : '- None found'}

### Cross-References
${item.metadata.crossReferences.length > 0 ? item.metadata.crossReferences.map(ref => `- ${ref}`).join('\n') : '- None found'}

### Navigation
${item.metadata.navigation.length > 0 ? item.metadata.navigation.map(nav => `- ${nav}`).join('\n') : '- None found'}

### Breadcrumbs
${item.metadata.breadcrumbs.length > 0 ? item.metadata.breadcrumbs.join(' > ') : '- None found'}

### Tags
${item.metadata.tags.length > 0 ? item.metadata.tags.map(tag => `- ${tag}`).join('\n') : '- None found'}

${item.metadata.lastModified ? `### Last Modified\n${item.metadata.lastModified}\n` : ''}

${item.metadata.contributors.length > 0 ? `### Contributors\n${item.metadata.contributors.map(contrib => `- ${contrib}`).join('\n')}\n` : ''}

## Content

${item.content}

${item.rawHtml ? `
## Raw HTML Context

\`\`\`html
${item.rawHtml.substring(0, 2000)}...
\`\`\`
` : ''}

${item.screenshots && item.screenshots.length > 0 ? `
## Screenshot

![Page Screenshot](data:image/png;base64,${item.screenshots[0]})
` : ''}
`;
    
    await writeFile(filepath, markdownContent, 'utf8');
  }
  
  // Save enhanced summary file for the category
  const summaryPath = path.join(categoryDir, '_enhanced_summary.md');
  const summaryContent = `# ${content[0].category} - Enhanced Summary

**Context:** ${content[0].context}
**Total Pages:** ${content.length}
**Scraped:** ${content[0].timestamp}

## Pages with Rich Context

${content.map(item => {
  const sourceCount = item.metadata.sourceFiles.length;
  const codeCount = item.metadata.codeReferences.length;
  const diagramCount = item.metadata.diagrams.length;
  const crossCount = item.metadata.crossReferences.length;
  
  return `### [${item.title}](${item.url})
- **Source Files:** ${sourceCount}
- **Code References:** ${codeCount}
- **Diagrams:** ${diagramCount}
- **Cross-References:** ${crossCount}
- **Tags:** ${item.metadata.tags.join(', ') || 'None'}
`;
}).join('\n')}

## Context Statistics

- **Total Source Files Referenced:** ${content.reduce((sum, item) => sum + item.metadata.sourceFiles.length, 0)}
- **Total Code References:** ${content.reduce((sum, item) => sum + item.metadata.codeReferences.length, 0)}
- **Total Diagrams:** ${content.reduce((sum, item) => sum + item.metadata.diagrams.length, 0)}
- **Total Cross-References:** ${content.reduce((sum, item) => sum + item.metadata.crossReferences.length, 0)}
- **Total Tags:** ${content.reduce((sum, item) => sum + item.metadata.tags.length, 0)}
`;
  
  await writeFile(summaryPath, summaryContent, 'utf8');
};

// Rest of the script remains the same as the original
const categorizeUrls = (urls: string[]): Context[] => {
  const contexts: Context[] = [
    {
      name: "developer-context",
      description: "Technical documentation for developers",
      categories: [
        {
          name: "architecture-&-core-concepts",
          description: "System architecture, core concepts, and fundamental design",
          patterns: ["architecture", "core", "system", "design", "overview", "concepts", "fundamentals"],
          urls: []
        },
        {
          name: "plugin-development",
          description: "Plugin system, creation, and management",
          patterns: ["plugin", "extension", "addon", "module", "component"],
          urls: []
        },
        {
          name: "api-reference",
          description: "API documentation and reference materials",
          patterns: ["api", "reference", "endpoint", "interface", "sdk"],
          urls: []
        },
        {
          name: "development-workflow",
          description: "Development processes, building, testing, and CI/CD",
          patterns: ["development", "workflow", "build", "test", "ci", "cd", "pipeline", "deploy"],
          urls: []
        },
        {
          name: "server-&-infrastructure",
          description: "Server setup, deployment, and infrastructure",
          patterns: ["server", "infrastructure", "deployment", "production", "hosting", "config"],
          urls: []
        },
        {
          name: "data-&-storage",
          description: "Database, storage, and data management",
          patterns: ["data", "storage", "database", "memory", "cache", "persistence"],
          urls: []
        },
        {
          name: "advanced-development",
          description: "Advanced features, integrations, and complex scenarios",
          patterns: ["advanced", "integration", "scenario", "complex", "enterprise", "scaling"],
          urls: []
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
          patterns: ["start", "quick", "guide", "tutorial", "onboarding", "setup", "install"],
          urls: []
        },
        {
          name: "cli-usage",
          description: "Command line interface and tools",
          patterns: ["cli", "command", "terminal", "console", "tool"],
          urls: []
        },
        {
          name: "user-interface",
          description: "Web interface, client apps, and UI",
          patterns: ["ui", "interface", "web", "client", "app", "dashboard", "console"],
          urls: []
        },
        {
          name: "real-time-features",
          description: "Real-time communication and live features",
          patterns: ["real-time", "live", "communication", "chat", "message", "stream"],
          urls: []
        }
      ]
    }
  ];

  // Categorize URLs
  urls.forEach(url => {
    const urlPath = new URL(url).pathname.toLowerCase();
    let categorized = false;
    
    for (const context of contexts) {
      for (const category of context.categories) {
        for (const pattern of category.patterns) {
          if (urlPath.includes(pattern.toLowerCase())) {
            category.urls.push(url);
            categorized = true;
            break;
          }
        }
        if (categorized) break;
      }
      if (categorized) break;
    }
    
    // If not categorized, add to first category of developer context
    if (!categorized) {
      contexts[0].categories[0].urls.push(url);
    }
  });

  return contexts;
};

async function main() {
  try {
    console.log("🚀 Starting enhanced ElizaOS content scraping...");
    
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
    
    // Categorize URLs
    const contexts = categorizeUrls(urls);
    
    // Launch browser
    console.log("Launching browser...");
    const browser = await chromium.launch({
      headless: true,
      executablePath: '/usr/bin/chromium-browser'
    });
    
    try {
      // Create output directory
      const outputDir = "scraped-content-enhanced";
      console.log(`📁 Output directory: ${outputDir}`);
      
      if (!existsSync(outputDir)) {
        await mkdir(outputDir, { recursive: true });
      }
      
      // Process each context and category
      console.log("\n📚 Processing Developer Context...\n");
      
      for (const context of contexts) {
        for (const category of context.categories) {
          if (category.urls.length > 0) {
            console.log(`  📂 Category: ${category.name} (${category.urls.length} URLs)`);
            
            const results = await scrapeCategoryEnhanced(
              browser,
              category,
              context.name,
              category.name
            );
            
            await saveEnhancedContent(results, outputDir);
          }
        }
      }
      
      console.log("\n✅ Enhanced content scraping completed!");
      console.log(`📁 All content saved to: ${outputDir}/`);
      
    } finally {
      await browser.close();
    }
    
  } catch (error) {
    console.error("❌ Error during enhanced scraping:", error);
    process.exit(1);
  }
}

main();
