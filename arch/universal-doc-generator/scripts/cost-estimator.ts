import { readFile, readdir } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";

// OpenAI pricing (as of 2024) - GPT-4o-mini
const PRICING = {
  "gpt-4o-mini": {
    input: 0.00015, // per 1K tokens
    output: 0.0006   // per 1K tokens
  }
};

// Rate limiting and cost management
const RATE_LIMITS = {
  MAX_TOKENS_PER_REQUEST: 2000,
  MAX_FILES_PER_SESSION: 20,
  DELAY_BETWEEN_REQUESTS: 3000
};

interface FileInfo {
  path: string;
  size: number;
  estimatedTokens: number;
  category: string;
}

const estimateTokens = (text: string): number => {
  // Rough estimation: 1 token ≈ 4 characters for English text
  return Math.ceil(text.length / 4);
};

const calculateCost = (inputTokens: number, outputTokens: number, model: string): number => {
  const pricing = PRICING[model as keyof typeof PRICING];
  if (!pricing) return 0;
  
  const inputCost = (inputTokens / 1000) * pricing.input;
  const outputCost = (outputTokens / 1000) * pricing.output;
  
  return inputCost + outputCost;
};

const findDocumentationFiles = async (dirPath: string): Promise<FileInfo[]> => {
  const files: FileInfo[] = [];
  
  const findFiles = async (dir: string) => {
    try {
      const items = await readdir(dir, { withFileTypes: true });
      
      for (const item of items) {
        const fullPath = path.join(dir, item.name);
        
        if (item.isDirectory()) {
          await findFiles(fullPath);
        } else if (item.isFile() && item.name.endsWith('.md') && !item.name.includes('.backup') && !item.name.includes('.assessment')) {
          const isGeneratedDoc = [
            'rules.md',
            'workflows.md', 
            'knowledge.md',
            'guiding-docs.md',
            'sanity-checks.md',
            'architectural-docs.md',
            'agent.md',
            'README.md'
          ].includes(item.name);
          
          if (isGeneratedDoc) {
            try {
              const content = await readFile(fullPath, 'utf8');
              const tokens = estimateTokens(content);
              const category = fullPath.split('/').slice(-2, -1)[0] || 'unknown';
              
              files.push({
                path: fullPath,
                size: content.length,
                estimatedTokens: tokens,
                category
              });
            } catch (error) {
              console.error(`Error reading ${fullPath}:`, error);
            }
          }
        }
      }
    } catch (error) {
      console.error(`Error reading directory ${dir}:`, error);
    }
  };
  
  await findFiles(dirPath);
  return files;
};

const generateCostReport = (files: FileInfo[]): void => {
  console.log("💰 ElizaOS Documentation Polishing - Cost Estimation");
  console.log("=" .repeat(60));
  
  // Group files by category
  const categories = files.reduce((acc, file) => {
    if (!acc[file.category]) acc[file.category] = [];
    acc[file.category].push(file);
    return acc;
  }, {} as Record<string, FileInfo[]>);
  
  let totalCost = 0;
  let totalTokens = 0;
  let totalFiles = 0;
  
  console.log("\n📊 Cost Breakdown by Category:");
  console.log("-".repeat(60));
  
  Object.entries(categories).forEach(([category, categoryFiles]) => {
    const categoryTokens = categoryFiles.reduce((sum, file) => sum + file.estimatedTokens, 0);
    const categoryCost = calculateCost(categoryTokens, categoryTokens * 0.5, 'gpt-4o-mini'); // Assume 50% output ratio
    
    console.log(`\n${category}:`);
    console.log(`  Files: ${categoryFiles.length}`);
    console.log(`  Total tokens: ${categoryTokens.toLocaleString()}`);
    console.log(`  Estimated cost: $${categoryCost.toFixed(4)}`);
    
    totalCost += categoryCost;
    totalTokens += categoryTokens;
    totalFiles += categoryFiles.length;
  });
  
  console.log("\n" + "=".repeat(60));
  console.log("📈 SUMMARY:");
  console.log(`Total files: ${totalFiles}`);
  console.log(`Total tokens: ${totalTokens.toLocaleString()}`);
  console.log(`Estimated total cost: $${totalCost.toFixed(4)}`);
  
  // Cost-effective processing
  const limitedFiles = files.slice(0, RATE_LIMITS.MAX_FILES_PER_SESSION);
  const limitedTokens = limitedFiles.reduce((sum, file) => sum + file.estimatedTokens, 0);
  const limitedCost = calculateCost(limitedTokens, limitedTokens * 0.5, 'gpt-4o-mini');
  
  console.log("\n💡 COST-EFFECTIVE PROCESSING:");
  console.log(`Files per session: ${RATE_LIMITS.MAX_FILES_PER_SESSION}`);
  console.log(`Limited tokens: ${limitedTokens.toLocaleString()}`);
  console.log(`Limited cost: $${limitedCost.toFixed(4)}`);
  console.log(`Cost savings: $${(totalCost - limitedCost).toFixed(4)}`);
  
  // Processing time estimation
  const totalRequests = limitedFiles.length * 2; // Judge + Polish
  const totalTimeMinutes = (totalRequests * RATE_LIMITS.DELAY_BETWEEN_REQUESTS) / 1000 / 60;
  
  console.log("\n⏱️ PROCESSING TIME:");
  console.log(`Total API requests: ${totalRequests}`);
  console.log(`Estimated time: ${totalTimeMinutes.toFixed(1)} minutes`);
  
  // Recommendations
  console.log("\n🎯 RECOMMENDATIONS:");
  console.log("1. Start with limited batch to test quality");
  console.log("2. Review results before processing all files");
  console.log("3. Consider processing in multiple sessions");
  console.log("4. Monitor API usage and costs");
  
  // Alternative approaches
  console.log("\n🔄 ALTERNATIVE APPROACHES:");
  console.log("1. Process only high-priority files first");
  console.log("2. Use different models for different tasks");
  console.log("3. Implement manual review for cost savings");
  console.log("4. Batch similar files together");
};

async function main() {
  try {
    console.log("🔍 Analyzing documentation files for cost estimation...");
    
    const baseDir = "scraped-content";
    if (!existsSync(baseDir)) {
      console.error("❌ scraped-content directory not found. Run generate-docs.ts first.");
      process.exit(1);
    }
    
    const files = await findDocumentationFiles(baseDir);
    
    if (files.length === 0) {
      console.log("No documentation files found to process.");
      return;
    }
    
    generateCostReport(files);
    
  } catch (error) {
    console.error("❌ Error:", error);
    process.exit(1);
  }
}

main();
