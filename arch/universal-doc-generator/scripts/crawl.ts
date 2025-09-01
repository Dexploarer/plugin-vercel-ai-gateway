import { chromium, Browser } from "playwright";
import { writeFile } from "node:fs/promises";

// Configurable parameters - can be set via environment variables
const START_URL = process.env.START_URL ?? "https://example.com";
const MAX_PAGES = Number(process.env.MAX_PAGES ?? 1000); // hard stop
const CONCURRENCY = Number(process.env.CONCURRENCY ?? 16); // workers
const ORIGIN = new URL(START_URL).origin;
const PATH_PREFIX = new URL(START_URL).pathname.replace(/\/+$/,"") || "/";

// Output file name based on domain
const DOMAIN_NAME = new URL(START_URL).hostname.replace(/\./g, '_');
const OUTPUT_FILE = `${DOMAIN_NAME}_links.txt`;

type QItem = { url: string, depth: number };

const normalize = (raw: string): string | null => {
  try {
    const u = new URL(raw, START_URL);
    u.hash = ""; // Remove hash fragments
    
    // Only crawl same origin and under the repo path
    if (u.origin !== ORIGIN) return null;
    if (!u.pathname.startsWith(PATH_PREFIX)) return null;
    
    // Avoid binary or obvious non-HTML routes
    if (/\.(png|jpe?g|gif|webp|svg|mp4|mp3|pdf|zip|gz|tgz|bz2|7z|ico|css|js|woff|woff2|ttf|otf)$/i.test(u.pathname)) return null;
    
    return u.toString();
  } catch {
    return null;
  }
};

const sleep = (ms: number) => new Promise(res => setTimeout(res, ms));

async function extractLinks(page): Promise<string[]> {
  // Grab every anchor href on the rendered SPA page
  const hrefs: string[] = await page.$$eval("a[href]", as => as.map((a: any) => a.href as string).filter(Boolean));
  return hrefs;
}

async function crawl(): Promise<void> {
  console.log(`🚀 Starting crawl of: ${START_URL}`);
  console.log(`📊 Max pages: ${MAX_PAGES}`);
  console.log(`⚡ Concurrency: ${CONCURRENCY}`);
  console.log(`📁 Output file: ${OUTPUT_FILE}\n`);

  const browser: Browser = await chromium.launch({
    headless: true,
    executablePath: '/usr/bin/chromium-browser'
  });

  try {
    const visited = new Set<string>();
    const results = new Set<string>();
    const queue: QItem[] = [{ url: START_URL, depth: 0 }];
    const routeBlock = [
      "**/*.{png,jpg,jpeg,gif,webp,mp4,mp3,woff,woff2,ttf,otf,zip,svg,css,js}"
    ];

    // Create a pool of browser contexts for better performance
    const contexts = await Promise.all(
      Array.from({ length: CONCURRENCY }, () => browser.newContext())
    );

    const processPage = async (url: string, depth: number, contextIndex: number) => {
      const context = contexts[contextIndex % contexts.length];
      const page = await context.newPage();
      
      try {
        await page.route(routeBlock[0], route => route.abort());
        
        await page.goto(url, { 
          waitUntil: "domcontentloaded", 
          timeout: 60000 
        });
        
        // Let the SPA fetch data and paint
        try {
          await page.waitForLoadState("networkidle", { timeout: 8000 });
        } catch {}
        
        await sleep(800); // tiny settle
        
        const hrefs = await extractLinks(page);
        for (const h of hrefs) {
          const n = normalize(h);
          if (!n) continue;
          if (!visited.has(n) && !queue.some(q => q.url === n)) {
            queue.push({ url: n, depth: depth + 1 });
          }
        }
      } catch (error) {
        console.log(`⚠️ Error processing ${url}: ${error.message}`);
      } finally {
        await page.close().catch(() => {});
      }
    };

    const processBatch = async (urls: string[], depth: number) => {
      const promises = urls.map(async (url, index) => {
        if (visited.has(url)) return;
        
        visited.add(url);
        results.add(url);
        
        console.log(`🔍 Crawling: ${url} (${visited.size}/${MAX_PAGES}) [Active: ${urls.length}]`);
        
        await processPage(url, depth, index);
      });
      
      await Promise.all(promises);
    };

    // Main processing loop with true concurrency
    while (visited.size < MAX_PAGES && queue.length > 0) {
      const batch = [];
      const batchSize = Math.min(CONCURRENCY, queue.length, MAX_PAGES - visited.size);
      
      for (let i = 0; i < batchSize; i++) {
        const item = queue.shift();
        if (item && !visited.has(item.url)) {
          batch.push(item.url);
        }
      }
      
      if (batch.length === 0) break;
      
      await processBatch(batch, 0);
    }

    // Close all contexts
    await Promise.all(contexts.map(context => context.close()));

    const sorted = Array.from(results).sort();
    await writeFile(OUTPUT_FILE, sorted.join("\n") + "\n", "utf8");
    
    console.log(`\n✅ Crawled pages: ${visited.size}`);
    console.log(`📄 Saved: ${OUTPUT_FILE}`);
    console.log(`🌐 Domain: ${DOMAIN_NAME}`);
    
  } finally {
    await browser.close();
  }
}

crawl().catch(err => {
  console.error(err);
  process.exit(1);
});
