# Universal Documentation Generator

A comprehensive, AI-powered documentation generation system that can crawl, categorize, scrape, and polish documentation from **any website**.

## 🚀 Quick Start

```bash
# Generate documentation from any website
START_URL="https://docs.example.com" bun run-all.ts

# Or run individual steps
bun scripts/crawl.ts
bun scripts/categorize.ts
bun scripts/scrape-content.ts
bun scripts/generate-docs.ts
bun scripts/cost-estimator.ts
bun scripts/polish-docs.ts
```

## 📁 Directory Structure

```
universal-doc-generator/
├── scripts/                    # Processing scripts
│   ├── crawl.ts               # Universal web crawler
│   ├── categorize.ts          # Smart URL categorization
│   ├── scrape-content.ts      # Content extraction
│   ├── generate-docs.ts       # Documentation generation
│   ├── cost-estimator.ts      # AI cost estimation
│   └── polish-docs.ts         # AI-powered polishing
├── output/                    # Generated content
│   └── scraped-content/       # Final documentation
├── docs/                      # Additional documentation
├── tools/                     # Utility tools
├── package.json               # Dependencies
├── tsconfig.json              # TypeScript configuration
├── run-all.ts                 # Master execution script
└── README.md                  # This file
```

## 🎯 Features

### 🔍 Universal Crawling
- **Any Website**: Works with any documentation site
- **Concurrent Processing**: Up to 16 simultaneous browser instances
- **Intelligent Filtering**: Only crawls relevant documentation pages
- **Rate Limiting**: Respectful crawling with delays
- **Error Handling**: Graceful failure recovery

### 📊 Smart Categorization
- **Universal Patterns**: Works with most documentation structures
- **Context Separation**: Developer vs User documentation
- **Category Organization**: 11 detailed categories
- **Pattern Matching**: Smart URL classification
- **Summary Generation**: Automated overview creation

### 🤖 AI-Powered Enhancement
- **Quality Assessment**: 1-10 scoring system
- **Content Polishing**: Grammar, clarity, and structure improvements
- **Cost Optimization**: Token usage optimization
- **Rate Limit Protection**: Automatic retry and delays

### 💰 Cost Effective
- **GPT-4o-mini**: Latest cost-efficient models
- **Token Optimization**: Content truncation and limits
- **Batch Processing**: Controlled API usage
- **Cost Estimation**: Pre-execution cost analysis

## 📋 Prerequisites

### System Requirements
- **Node.js**: 18+ (or Bun runtime)
- **Bun**: Recommended for faster execution
- **Chromium**: For web scraping
- **OpenAI API Key**: For AI polishing (optional)

### Installation
```bash
# Install dependencies
bun install

# Install Chromium for Playwright
bunx playwright install chromium
```

## 🔧 Configuration

### Environment Variables
```bash
# Target website URL
START_URL=https://docs.example.com

# Crawling configuration
MAX_PAGES=2000
CONCURRENCY=16

# OpenAI API Key (for AI polishing)
OPENAI_API_KEY=your_api_key_here
```

### Cost Management
The system includes built-in cost controls:
- **Max files per session**: 20 (configurable)
- **Token limits**: 2000 per request
- **Rate limiting**: 3-second delays
- **Model selection**: GPT-4o-mini for efficiency

## 📖 Usage

### Complete Pipeline
```bash
# Generate docs from any website
START_URL="https://docs.example.com" bun run-all.ts

# Skip AI polishing for cost savings
START_URL="https://docs.example.com" bun run-all.ts --skip-ai

# Custom crawling limits
START_URL="https://docs.example.com" MAX_PAGES=500 CONCURRENCY=8 bun run-all.ts
```

### Individual Steps
```bash
# 1. Crawl documentation URLs
START_URL="https://docs.example.com" bun scripts/crawl.ts

# 2. Categorize URLs
bun scripts/categorize.ts

# 3. Scrape content
bun scripts/scrape-content.ts

# 4. Generate documentation structure
bun scripts/generate-docs.ts

# 5. Estimate AI costs
bun scripts/cost-estimator.ts

# 6. Polish with AI
bun scripts/polish-docs.ts
```

## 📊 Output Structure

### Generated Documentation
```
output/scraped-content/
├── developer-context/
│   ├── architecture-&-core-concepts/
│   │   ├── rules.md
│   │   ├── workflows.md
│   │   ├── knowledge.md
│   │   ├── guiding-docs.md
│   │   ├── sanity-checks.md
│   │   ├── architectural-docs.md
│   │   ├── llm.txt
│   │   ├── agent.md
│   │   ├── README.md
│   │   └── *.md (content files)
│   └── [other categories...]
├── user-context/
│   └── [user categories...]
├── README.md
├── DOCUMENTATION_OVERVIEW.md
└── POLISHING_REPORT.md
```

### File Types
- **rules.md**: Coding standards and best practices
- **workflows.md**: Development and deployment processes
- **knowledge.md**: Reference materials and troubleshooting
- **guiding-docs.md**: Usage guidelines and principles
- **sanity-checks.md**: Validation procedures and checklists
- **architectural-docs.md**: System design and architecture
- **llm.txt**: AI context for language models
- **agent.md**: AI agent configuration
- **README.md**: Category overview and navigation

## 💡 Cost Analysis

### Typical Costs (GPT-4o-mini)
- **89 files**: ~$0.026 (2.6 cents)
- **20 files (batch)**: ~$0.005 (0.5 cents)
- **Per file**: ~$0.0003 (0.03 cents)

### Cost Optimizations
- ✅ Content truncation for long files
- ✅ Skipped final review step
- ✅ Batch processing with delays
- ✅ Token usage limits
- ✅ Model selection optimization

## 🔍 Quality Assurance

### Automated Checks
- **Content Validation**: Technical accuracy preservation
- **Format Consistency**: Markdown formatting standards
- **Link Verification**: URL accessibility checks
- **Quality Scoring**: 1-10 assessment system

### Manual Review
- **Backup Files**: Original content preserved
- **Assessment Reports**: Detailed quality metrics
- **Execution Summary**: Complete process overview
- **Error Logging**: Comprehensive error tracking

## 🛠️ Customization

### Adding New Sources
1. Simply change the `START_URL` environment variable
2. The system automatically adapts to different website structures
3. Universal patterns work with most documentation sites

### Extending Categories
1. Edit `scripts/categorize.ts` for new categories
2. Add pattern matching rules
3. Update documentation templates
4. Re-run categorization

### AI Enhancement
1. Modify prompts in `scripts/polish-docs.ts`
2. Adjust model parameters and settings
3. Add new quality criteria
4. Implement custom assessment logic

## 🚨 Troubleshooting

### Common Issues
- **Rate Limiting**: Automatic retry with delays
- **API Errors**: Graceful fallback to original content
- **Browser Issues**: Chromium installation verification
- **Memory Usage**: Batch processing to manage resources

### Debug Mode
```bash
# Enable verbose logging
DEBUG=1 bun scripts/crawl.ts

# Check system requirements
bun scripts/cost-estimator.ts
```

## 📈 Performance

### Benchmarks
- **Crawling**: 52 URLs in ~30 seconds
- **Content Scraping**: 52 pages in ~2 minutes
- **AI Polishing**: 20 files in ~2 minutes
- **Total Pipeline**: ~5-10 minutes for complete run

### Optimization Tips
- Use SSD storage for faster I/O
- Increase concurrency for faster crawling
- Adjust batch sizes based on system resources
- Monitor memory usage during processing

## 🤝 Contributing

### Development Setup
```bash
# Clone and setup
git clone <repository>
cd universal-doc-generator
bun install

# Run tests
bun test

# Format code
bun run format
```

### Code Standards
- TypeScript for type safety
- Comprehensive error handling
- Detailed logging and documentation
- Performance optimization
- Cost efficiency considerations

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- **OpenAI**: For AI model capabilities
- **Playwright**: For web scraping functionality
- **Bun**: For fast JavaScript runtime
- **Community**: For feedback and contributions

## 📞 Support

For issues, questions, or contributions:
1. Check the troubleshooting section
2. Review execution logs
3. Examine generated documentation
4. Create an issue with detailed information

## 🔮 Future Enhancements

### Planned Features
- **Multi-Source Support**: Crawl multiple documentation sites simultaneously
- **Advanced AI Models**: Support for newer OpenAI models
- **Custom Templates**: User-defined documentation formats
- **Real-time Updates**: Continuous documentation monitoring
- **API Integration**: REST API for programmatic access

### Potential Improvements
- **Machine Learning**: Automated category detection
- **Content Analysis**: Advanced quality assessment
- **Collaboration**: Multi-user editing and review
- **Version Control**: Git integration for documentation
- **Deployment**: Automated deployment to various platforms

---

**Generated**: 2025-08-31  
**Version**: 1.0.0  
**Status**: Production Ready
