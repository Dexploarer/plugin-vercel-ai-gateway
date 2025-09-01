import { readFile, writeFile, mkdir, readdir } from "node:fs/promises";
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

interface DirectoryInfo {
  context: string;
  category: string;
  description: string;
  contentFiles: string[];
  totalPages: number;
}

const generateRules = (category: string, context: string): string => {
  return `# ${category} - Rules & Standards

## Overview
This document outlines the rules, standards, and best practices for ${category.toLowerCase()} within the ${context.toLowerCase()}.

## Core Rules

### 1. Code Quality Standards
- All code must follow TypeScript best practices
- Maintain consistent naming conventions
- Implement proper error handling
- Write comprehensive unit tests

### 2. Documentation Requirements
- All functions must have JSDoc comments
- API endpoints must be documented
- Include usage examples
- Maintain up-to-date README files

### 3. Security Guidelines
- Validate all user inputs
- Implement proper authentication
- Follow OWASP security guidelines
- Regular security audits

### 4. Performance Standards
- Optimize for speed and efficiency
- Monitor resource usage
- Implement caching where appropriate
- Regular performance testing

## Compliance Checklist
- [ ] Code review completed
- [ ] Tests passing
- [ ] Documentation updated
- [ ] Security review passed
- [ ] Performance benchmarks met
- [ ] Accessibility standards met

## Enforcement
- Automated checks in CI/CD pipeline
- Regular code reviews
- Performance monitoring
- Security scanning
`;
};

const generateWorkflows = (category: string, context: string): string => {
  return `# ${category} - Workflows

## Overview
Standardized workflows for ${category.toLowerCase()} operations within ${context.toLowerCase()}.

## Development Workflow

### 1. Feature Development
1. **Planning Phase**
   - Define requirements
   - Create technical specifications
   - Estimate timeline
   - Identify dependencies

2. **Implementation Phase**
   - Create feature branch
   - Implement core functionality
   - Write unit tests
   - Update documentation

3. **Testing Phase**
   - Run automated tests
   - Perform manual testing
   - Security testing
   - Performance testing

4. **Review Phase**
   - Code review
   - Documentation review
   - Security review
   - Final testing

5. **Deployment Phase**
   - Merge to main branch
   - Deploy to staging
   - Deploy to production
   - Monitor performance

## Commands Workflow

### Standard Commands
\`\`\`bash
# Development
npm run dev          # Start development server
npm run build        # Build for production
npm run test         # Run tests
npm run lint         # Run linter

# Deployment
npm run deploy       # Deploy to production
npm run backup       # Create backup
npm run restore      # Restore from backup

# Monitoring
npm run monitor      # Start monitoring
npm run logs         # View logs
npm run health       # Health check
\`\`\`

## AI Integration Workflow

### 1. AI Model Integration
- Model selection and evaluation
- API integration setup
- Performance optimization
- Monitoring and logging

### 2. AI Call Processing
- Input validation
- Model inference
- Response processing
- Error handling

### 3. AI Workflow Automation
- Automated decision making
- Process optimization
- Quality assurance
- Continuous learning

## Quality Assurance
- Automated testing
- Code quality checks
- Performance monitoring
- Security validation
- Documentation verification
`;
};

const generateKnowledge = (category: string, context: string): string => {
  return `# ${category} - Knowledge Base

## Overview
Comprehensive knowledge base for ${category.toLowerCase()} within ${context.toLowerCase()}.

## Core Concepts

### Key Terminology
- **${category}**: The primary focus area
- **${context}**: The broader context
- **Integration**: How components work together
- **Optimization**: Performance improvements
- **Security**: Protection measures

### Best Practices
1. **Design Principles**
   - Modular architecture
   - Separation of concerns
   - Scalability considerations
   - Maintainability focus

2. **Implementation Guidelines**
   - Code organization
   - Error handling
   - Logging and monitoring
   - Testing strategies

3. **Performance Optimization**
   - Caching strategies
   - Database optimization
   - Network efficiency
   - Resource management

## Reference Materials

### Documentation Links
- Official documentation
- API references
- Tutorial guides
- Community resources

### Tools and Resources
- Development tools
- Testing frameworks
- Monitoring solutions
- Deployment platforms

## Troubleshooting

### Common Issues
1. **Performance Problems**
   - Identify bottlenecks
   - Optimize queries
   - Implement caching
   - Monitor resources

2. **Integration Issues**
   - Check API compatibility
   - Verify configurations
   - Test connectivity
   - Review logs

3. **Security Concerns**
   - Audit access controls
   - Review permissions
   - Check for vulnerabilities
   - Update dependencies

## Learning Resources
- Online courses
- Books and articles
- Video tutorials
- Community forums
- Expert consultations
`;
};

const generateGuidingDocs = (category: string, context: string): string => {
  return `# ${category} - Guiding Documentation

## Overview
Guiding principles and documentation for ${category.toLowerCase()} development and usage.

## Development Guidelines

### Architecture Principles
1. **Modularity**
   - Break down complex systems
   - Maintain clear interfaces
   - Enable easy testing
   - Support scalability

2. **Reliability**
   - Implement error handling
   - Add comprehensive logging
   - Create fallback mechanisms
   - Monitor system health

3. **Performance**
   - Optimize critical paths
   - Implement caching
   - Monitor resource usage
   - Regular performance reviews

### Code Standards
- **Naming Conventions**: Clear, descriptive names
- **Documentation**: Comprehensive comments
- **Testing**: Unit and integration tests
- **Error Handling**: Graceful failure modes

## User Guidelines

### Getting Started
1. **Prerequisites**
   - Required software
   - System requirements
   - Dependencies
   - Configuration

2. **Installation**
   - Step-by-step setup
   - Configuration options
   - Verification steps
   - Troubleshooting

3. **Basic Usage**
   - Common operations
   - Basic commands
   - Configuration examples
   - Best practices

### Advanced Usage
- **Customization**: Tailoring to specific needs
- **Integration**: Working with other systems
- **Optimization**: Performance tuning
- **Troubleshooting**: Problem resolution

## Maintenance Guidelines

### Regular Tasks
- **Updates**: Keep systems current
- **Backups**: Regular data protection
- **Monitoring**: System health checks
- **Documentation**: Keep docs updated

### Emergency Procedures
- **Incident Response**: Quick problem resolution
- **Rollback Procedures**: Reverting changes
- **Support Contacts**: Getting help
- **Escalation Paths**: When to escalate

## Quality Assurance
- **Testing**: Comprehensive test coverage
- **Review**: Code and documentation reviews
- **Validation**: Performance and security checks
- **Monitoring**: Continuous system monitoring
`;
};

const generateSanityChecks = (category: string, context: string): string => {
  return `# ${category} - Sanity Checks

## Overview
Comprehensive sanity checks and validation procedures for ${category.toLowerCase()} within ${context.toLowerCase()}.

## Pre-Deployment Checks

### Code Quality Checks
- [ ] **Linting**: All code passes linting rules
- [ ] **Type Checking**: TypeScript compilation successful
- [ ] **Test Coverage**: Minimum 80% test coverage
- [ ] **Documentation**: All functions documented
- [ ] **Security Scan**: No security vulnerabilities

### Performance Checks
- [ ] **Load Testing**: System handles expected load
- [ ] **Memory Usage**: Within acceptable limits
- [ ] **Response Time**: Meets performance requirements
- [ ] **Resource Usage**: Efficient resource utilization
- [ ] **Scalability**: System scales appropriately

### Integration Checks
- [ ] **API Compatibility**: All APIs working correctly
- [ ] **Database Connections**: Stable database connectivity
- [ ] **External Services**: Third-party integrations functional
- [ ] **Data Flow**: End-to-end data processing verified
- [ ] **Error Handling**: Graceful error management

## Runtime Checks

### System Health
- [ ] **Service Status**: All services running
- [ ] **Log Analysis**: No critical errors in logs
- [ ] **Resource Monitoring**: CPU, memory, disk usage normal
- [ ] **Network Connectivity**: All network connections stable
- [ ] **Database Health**: Database performance optimal

### Functionality Checks
- [ ] **Core Features**: All main features working
- [ ] **User Interface**: UI responsive and functional
- [ ] **Data Integrity**: Data consistency maintained
- [ ] **Security**: Access controls working properly
- [ ] **Backup Systems**: Backup procedures functional

## Post-Deployment Checks

### Verification
- [ ] **User Acceptance**: Users can perform tasks
- [ ] **Performance**: System meets performance targets
- [ ] **Monitoring**: All monitoring systems active
- [ ] **Documentation**: Documentation updated
- [ ] **Training**: Team trained on new features

### Rollback Readiness
- [ ] **Backup Available**: Recent backup available
- [ ] **Rollback Plan**: Clear rollback procedures
- [ ] **Communication Plan**: Stakeholder notification ready
- [ ] **Support Team**: Support team briefed
- [ ] **Monitoring**: Rollback monitoring in place

## Automated Checks

### CI/CD Pipeline
\`\`\`yaml
# Example CI/CD checks
- name: Code Quality
  run: npm run lint && npm run test

- name: Security Scan
  run: npm run security-scan

- name: Performance Test
  run: npm run performance-test

- name: Integration Test
  run: npm run integration-test
\`\`\`

### Monitoring Alerts
- **Error Rate**: Alert if error rate > 1%
- **Response Time**: Alert if response time > 2s
- **Resource Usage**: Alert if CPU > 80% or memory > 85%
- **Service Status**: Alert if any service down
- **Security Events**: Alert on security incidents

## Manual Checks

### Daily Checks
- [ ] Review system logs
- [ ] Check resource usage
- [ ] Verify backup completion
- [ ] Monitor error rates
- [ ] Review security alerts

### Weekly Checks
- [ ] Performance analysis
- [ ] Security review
- [ ] Documentation updates
- [ ] Team training
- [ ] Process improvements

### Monthly Checks
- [ ] Comprehensive security audit
- [ ] Performance optimization review
- [ ] Architecture review
- [ ] Capacity planning
- [ ] Disaster recovery testing
`;
};

const generateArchitecturalDocs = (category: string, context: string): string => {
  return `# ${category} - Architectural Design Documents

## Overview
Architectural design documentation for ${category.toLowerCase()} within ${context.toLowerCase()}.

## System Architecture

### High-Level Design
\`\`\`
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   User Layer    │    │  Business Layer │    │   Data Layer    │
│                 │    │                 │    │                 │
│ • Web Interface │◄──►│ • Core Logic    │◄──►│ • Database      │
│ • API Clients   │    │ • Services      │    │ • File Storage  │
│ • Mobile Apps   │    │ • Controllers   │    │ • Cache         │
└─────────────────┘    └─────────────────┘    └─────────────────┘
\`\`\`

### Component Architecture
1. **Presentation Layer**
   - User interfaces
   - API endpoints
   - Client applications
   - Mobile interfaces

2. **Business Logic Layer**
   - Core business rules
   - Service implementations
   - Data processing
   - Integration logic

3. **Data Access Layer**
   - Database operations
   - File system access
   - External API calls
   - Caching mechanisms

## Design Patterns

### Architectural Patterns
- **MVC (Model-View-Controller)**: Separation of concerns
- **Repository Pattern**: Data access abstraction
- **Service Layer**: Business logic encapsulation
- **Factory Pattern**: Object creation management

### Design Principles
1. **SOLID Principles**
   - Single Responsibility
   - Open/Closed Principle
   - Liskov Substitution
   - Interface Segregation
   - Dependency Inversion

2. **DRY (Don't Repeat Yourself)**
   - Code reusability
   - Shared components
   - Common utilities
   - Standardized patterns

## Data Architecture

### Data Flow
\`\`\`
Input → Validation → Processing → Storage → Output
  ↓         ↓           ↓         ↓        ↓
User    Business    Business   Database  Response
Data    Rules      Logic      Layer     Data
\`\`\`

### Database Design
- **Normalization**: Proper data structure
- **Indexing**: Performance optimization
- **Relationships**: Entity relationships
- **Constraints**: Data integrity

## Security Architecture

### Security Layers
1. **Authentication**: User identity verification
2. **Authorization**: Access control
3. **Data Protection**: Encryption and security
4. **Audit Logging**: Activity monitoring

### Security Measures
- **Input Validation**: Prevent injection attacks
- **Output Encoding**: Prevent XSS attacks
- **HTTPS**: Secure communication
- **Token Management**: Secure session handling

## Performance Architecture

### Optimization Strategies
1. **Caching**: Reduce database load
2. **Load Balancing**: Distribute traffic
3. **CDN**: Content delivery optimization
4. **Database Optimization**: Query optimization

### Scalability
- **Horizontal Scaling**: Add more servers
- **Vertical Scaling**: Increase server capacity
- **Microservices**: Service decomposition
- **Containerization**: Deployment flexibility

## Deployment Architecture

### Infrastructure
\`\`\`
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Load Balancer │    │  Application    │    │   Database      │
│                 │    │   Servers       │    │   Cluster       │
│ • Traffic Dist  │◄──►│ • Web Servers   │◄──►│ • Primary DB    │
│ • SSL Term      │    │ • API Servers   │    │ • Replica DB    │
│ • Health Check  │    │ • Background    │    │ • Backup DB     │
└─────────────────┘    └─────────────────┘    └─────────────────┘
\`\`\`

### Deployment Strategy
- **Blue-Green Deployment**: Zero-downtime updates
- **Canary Releases**: Gradual rollout
- **Rollback Procedures**: Quick recovery
- **Monitoring**: Continuous oversight

## Technology Stack

### Frontend
- **Framework**: React/Vue/Angular
- **Styling**: CSS/Sass/Tailwind
- **State Management**: Redux/Vuex
- **Build Tools**: Webpack/Vite

### Backend
- **Runtime**: Node.js/Python/Java
- **Framework**: Express/FastAPI/Spring
- **Database**: PostgreSQL/MongoDB
- **Cache**: Redis/Memcached

### DevOps
- **Containerization**: Docker
- **Orchestration**: Kubernetes
- **CI/CD**: GitHub Actions/Jenkins
- **Monitoring**: Prometheus/Grafana
`;
};

const generateLLMTxt = (category: string, context: string, description: string): string => {
  return `# ${category} - LLM Context

## Overview
This file provides context for Large Language Models working with ${category.toLowerCase()} in ${context.toLowerCase()}.

## Context Information

### Domain: ${category}
- **Primary Focus**: ${category.toLowerCase()} development and management
- **Context**: ${context.toLowerCase()}
- **Scope**: Technical implementation and best practices

### Key Concepts
- System architecture and design patterns
- Development workflows and processes
- Performance optimization strategies
- Security and compliance requirements
- Integration with other systems

### Technical Stack
- Programming languages and frameworks
- Database systems and data models
- API design and implementation
- Testing and quality assurance
- Deployment and infrastructure

## Common Tasks

### Development Tasks
1. **Code Implementation**
   - Write clean, maintainable code
   - Follow established patterns
   - Implement error handling
   - Add comprehensive tests

2. **System Design**
   - Design scalable architectures
   - Plan data structures
   - Define API contracts
   - Consider security implications

3. **Integration**
   - Connect with external systems
   - Implement data flows
   - Handle authentication
   - Manage dependencies

### Analysis Tasks
1. **Performance Analysis**
   - Identify bottlenecks
   - Optimize critical paths
   - Monitor resource usage
   - Plan capacity

2. **Security Review**
   - Audit access controls
   - Review data handling
   - Check for vulnerabilities
   - Validate compliance

3. **Code Review**
   - Check code quality
   - Verify best practices
   - Ensure documentation
   - Validate testing

## Guidelines for AI Assistance

### When Providing Code
- Use TypeScript/JavaScript for web development
- Follow established naming conventions
- Include proper error handling
- Add JSDoc comments
- Write unit tests

### When Analyzing Problems
- Consider system architecture
- Review error logs
- Check configuration
- Validate assumptions
- Suggest improvements

### When Making Recommendations
- Consider scalability
- Evaluate security implications
- Assess maintainability
- Review performance impact
- Check compatibility

## Reference Information

### Documentation Structure
- README files for overview
- API documentation for interfaces
- Code comments for implementation
- Architecture docs for design
- Workflow docs for processes

### Quality Standards
- Code coverage requirements
- Performance benchmarks
- Security compliance
- Documentation completeness
- Testing requirements

### Best Practices
- Modular design
- Error handling
- Logging and monitoring
- Security by design
- Performance optimization
`;
};

const generateAgentMd = (category: string, context: string, description: string): string => {
  return `# ${category} - Agent Configuration

## Overview
Configuration and guidelines for AI agents working with ${category.toLowerCase()} in ${context.toLowerCase()}.

## Agent Profile

### Role Definition
- **Primary Role**: ${category.toLowerCase()} specialist
- **Context**: ${context.toLowerCase()}
- **Expertise**: Technical implementation and optimization
- **Scope**: Development, analysis, and maintenance

### Core Responsibilities
1. **Development Support**
   - Code review and optimization
   - Architecture design
   - Problem solving
   - Best practice guidance

2. **Analysis and Monitoring**
   - Performance analysis
   - Security assessment
   - Quality assurance
   - Risk evaluation

3. **Documentation and Training**
   - Technical documentation
   - Process documentation
   - Team training
   - Knowledge sharing

## Agent Capabilities

### Technical Skills
- **Programming**: TypeScript, JavaScript, Python
- **Frameworks**: React, Node.js, Express
- **Databases**: PostgreSQL, MongoDB, Redis
- **DevOps**: Docker, Kubernetes, CI/CD
- **Cloud**: AWS, Azure, Google Cloud

### Domain Knowledge
- **Architecture**: System design patterns
- **Security**: Authentication, authorization, encryption
- **Performance**: Optimization, caching, scaling
- **Testing**: Unit, integration, end-to-end
- **Monitoring**: Logging, metrics, alerting

### Communication Skills
- **Technical Writing**: Clear documentation
- **Code Review**: Constructive feedback
- **Problem Solving**: Systematic approach
- **Knowledge Sharing**: Training and mentoring

## Agent Behavior Guidelines

### Interaction Style
- **Professional**: Maintain professional tone
- **Helpful**: Provide constructive assistance
- **Thorough**: Consider all aspects of problems
- **Educational**: Explain reasoning and concepts

### Problem-Solving Approach
1. **Understand**: Gather all relevant information
2. **Analyze**: Break down complex problems
3. **Design**: Create comprehensive solutions
4. **Implement**: Provide practical code examples
5. **Validate**: Ensure solutions are correct
6. **Document**: Explain implementation details

### Quality Standards
- **Accuracy**: Provide correct information
- **Completeness**: Cover all relevant aspects
- **Clarity**: Use clear, understandable language
- **Practicality**: Focus on implementable solutions

## Agent Tools and Resources

### Development Tools
- **Code Editor**: VS Code with extensions
- **Version Control**: Git with best practices
- **Testing**: Jest, Mocha, Cypress
- **Linting**: ESLint, Prettier
- **Documentation**: JSDoc, Markdown

### Analysis Tools
- **Performance**: Lighthouse, WebPageTest
- **Security**: OWASP ZAP, npm audit
- **Monitoring**: Prometheus, Grafana
- **Logging**: Winston, Bunyan
- **Profiling**: Node.js profiler

### Reference Materials
- **Documentation**: Official docs, tutorials
- **Standards**: Industry best practices
- **Patterns**: Design patterns, anti-patterns
- **Examples**: Code samples, case studies

## Agent Workflow

### Initial Assessment
1. **Context Understanding**: Grasp the problem domain
2. **Requirements Analysis**: Identify key requirements
3. **Constraint Evaluation**: Consider limitations
4. **Solution Planning**: Design approach

### Implementation Support
1. **Architecture Design**: System structure
2. **Code Development**: Implementation
3. **Testing Strategy**: Quality assurance
4. **Deployment Planning**: Production readiness

### Ongoing Support
1. **Monitoring**: System health
2. **Optimization**: Performance improvements
3. **Maintenance**: Regular updates
4. **Evolution**: Feature enhancements

## Agent Communication

### Response Format
- **Structured**: Clear sections and headings
- **Detailed**: Comprehensive explanations
- **Practical**: Actionable recommendations
- **Educational**: Learning opportunities

### Code Examples
- **Clean**: Well-formatted, readable code
- **Commented**: Clear explanations
- **Tested**: Working examples
- **Secure**: Security best practices

### Documentation Style
- **Clear**: Easy to understand
- **Complete**: All necessary information
- **Organized**: Logical structure
- **Maintainable**: Easy to update

## Agent Limitations

### Scope Boundaries
- **Technical Focus**: Development and implementation
- **Domain Expertise**: ${category.toLowerCase()} specific
- **Current Knowledge**: Based on available information
- **Practical Constraints**: Real-world limitations

### Collaboration Guidelines
- **Team Work**: Coordinate with other agents
- **Knowledge Sharing**: Contribute to collective knowledge
- **Continuous Learning**: Stay updated with trends
- **Quality Improvement**: Enhance capabilities over time
`;
};

const generateReadme = (dirInfo: DirectoryInfo): string => {
  return `# ${dirInfo.category}

## Overview
${dirInfo.description}

This directory contains documentation and resources for ${dirInfo.category.toLowerCase()} within the ${dirInfo.context.toLowerCase()}.

## Contents

### Documentation Files
- **rules.md**: Rules, standards, and best practices
- **workflows.md**: Standardized workflows and processes
- **knowledge.md**: Knowledge base and reference materials
- **guiding-docs.md**: Guiding principles and documentation
- **sanity-checks.md**: Validation procedures and checklists
- **architectural-docs.md**: System architecture and design documents

### AI Integration Files
- **llm.txt**: Context for Large Language Models
- **agent.md**: AI agent configuration and guidelines

### Content Files
- **Total Pages**: ${dirInfo.totalPages}
- **Content Files**: ${dirInfo.contentFiles.length} markdown files
- **Summary**: _summary.md with overview and links

## Quick Start

### For Developers
1. Review \`rules.md\` for coding standards
2. Check \`workflows.md\` for development processes
3. Consult \`architectural-docs.md\` for system design
4. Use \`sanity-checks.md\` for validation

### For Users
1. Start with \`guiding-docs.md\` for usage guidelines
2. Reference \`knowledge.md\` for troubleshooting
3. Check \`sanity-checks.md\` for system health

### For AI Assistants
1. Read \`llm.txt\` for context and guidelines
2. Review \`agent.md\` for role and capabilities
3. Use content files for specific information

## Directory Structure
\`\`\`
${dirInfo.category.replace(/\s+/g, '-').toLowerCase()}/
├── rules.md                    # Rules and standards
├── workflows.md                # Workflows and processes
├── knowledge.md                # Knowledge base
├── guiding-docs.md             # Guiding documentation
├── sanity-checks.md            # Validation procedures
├── architectural-docs.md       # Architecture documents
├── llm.txt                     # LLM context
├── agent.md                    # Agent configuration
├── _summary.md                 # Category summary
└── *.md                        # Content files (${dirInfo.totalPages} files)
\`\`\`

## Related Categories
- **Developer Context**: Technical implementation focus
- **User Context**: End-user and administrator focus
- **Cross-Category**: Integration and collaboration

## Maintenance
- Regular updates to reflect current practices
- Periodic review of rules and workflows
- Continuous improvement of documentation
- Feedback integration from users and developers
`;
};

const getDirectoryInfo = async (dirPath: string): Promise<DirectoryInfo | null> => {
  try {
    const files = await readdir(dirPath);
    const contentFiles = files.filter(file => file.endsWith('.md') && !file.startsWith('_') && file !== 'README.md');
    
    // Extract context and category from path
    const pathParts = dirPath.split('/');
    const context = pathParts[pathParts.length - 2]?.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    const category = pathParts[pathParts.length - 1]?.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    
    if (!context || !category) return null;
    
    return {
      context,
      category,
      description: `Comprehensive documentation and resources for ${category.toLowerCase()} within ${context.toLowerCase()}.`,
      contentFiles,
      totalPages: contentFiles.length
    };
  } catch (error) {
    console.error(`Error reading directory ${dirPath}:`, error);
    return null;
  }
};

const generateDocsForDirectory = async (dirPath: string): Promise<void> => {
  const dirInfo = await getDirectoryInfo(dirPath);
  if (!dirInfo) return;
  
  console.log(`📁 Generating docs for: ${dirInfo.category}`);
  
  const files = [
    { name: 'rules.md', content: generateRules(dirInfo.category, dirInfo.context) },
    { name: 'workflows.md', content: generateWorkflows(dirInfo.category, dirInfo.context) },
    { name: 'knowledge.md', content: generateKnowledge(dirInfo.category, dirInfo.context) },
    { name: 'guiding-docs.md', content: generateGuidingDocs(dirInfo.category, dirInfo.context) },
    { name: 'sanity-checks.md', content: generateSanityChecks(dirInfo.category, dirInfo.context) },
    { name: 'architectural-docs.md', content: generateArchitecturalDocs(dirInfo.category, dirInfo.context) },
    { name: 'llm.txt', content: generateLLMTxt(dirInfo.category, dirInfo.context, dirInfo.description) },
    { name: 'agent.md', content: generateAgentMd(dirInfo.category, dirInfo.context, dirInfo.description) },
    { name: 'README.md', content: generateReadme(dirInfo) }
  ];
  
  for (const file of files) {
    const filePath = path.join(dirPath, file.name);
    await writeFile(filePath, file.content, 'utf8');
  }
  
  console.log(`✅ Generated ${files.length} files for ${dirInfo.category}`);
};

const findCategoryDirectories = async (baseDir: string): Promise<string[]> => {
  const directories: string[] = [];
  
  const findDirs = async (dir: string) => {
    try {
      const items = await readdir(dir, { withFileTypes: true });
      
      for (const item of items) {
        if (item.isDirectory()) {
          const fullPath = path.join(dir, item.name);
          
          // Check if this is a category directory (has content files)
          const files = await readdir(fullPath);
          const hasContent = files.some(file => file.endsWith('.md') && !file.startsWith('_'));
          
          if (hasContent) {
            directories.push(fullPath);
          } else {
            // Recursively search subdirectories
            await findDirs(fullPath);
          }
        }
      }
    } catch (error) {
      console.error(`Error reading directory ${dir}:`, error);
    }
  };
  
  await findDirs(baseDir);
  return directories;
};

async function main() {
  try {
    console.log("🚀 Starting documentation generation...");
    
    const baseDir = "scraped-content";
    if (!existsSync(baseDir)) {
      console.error("❌ scraped-content directory not found. Run scrape-content.ts first.");
      process.exit(1);
    }
    
    console.log("📂 Finding category directories...");
    const categoryDirs = await findCategoryDirectories(baseDir);
    
    console.log(`Found ${categoryDirs.length} category directories:`);
    categoryDirs.forEach(dir => console.log(`  - ${dir}`));
    
    console.log("\n📝 Generating documentation for each category...");
    
    for (const dir of categoryDirs) {
      await generateDocsForDirectory(dir);
    }
    
    console.log("\n✅ Documentation generation completed!");
    console.log(`📁 Generated comprehensive docs for ${categoryDirs.length} categories`);
    
    // Generate overall summary
    const summaryPath = path.join(baseDir, "DOCUMENTATION_OVERVIEW.md");
    const summaryContent = `# ElizaOS Documentation Overview

## Generated Documentation Structure

This directory now contains comprehensive documentation for all ElizaOS categories, organized by context and category.

## Documentation Types

### Core Documentation
- **rules.md**: Rules, standards, and best practices
- **workflows.md**: Standardized workflows and processes  
- **knowledge.md**: Knowledge base and reference materials
- **guiding-docs.md**: Guiding principles and documentation
- **sanity-checks.md**: Validation procedures and checklists
- **architectural-docs.md**: System architecture and design documents

### AI Integration
- **llm.txt**: Context for Large Language Models
- **agent.md**: AI agent configuration and guidelines

### Content
- **Content Files**: Scraped documentation pages
- **_summary.md**: Category summaries with links
- **README.md**: Directory overview and navigation

## Categories Covered

### Developer Context (${categoryDirs.filter(dir => dir.includes('developer-context')).length} categories)
- Architecture & Core Concepts
- Plugin Development  
- API Reference
- Development Workflow
- Server & Infrastructure
- Data & Storage
- Advanced Development

### User Context (${categoryDirs.filter(dir => dir.includes('user-context')).length} categories)
- Getting Started
- CLI Usage
- User Interface
- Real-time Features

## Usage Guidelines

### For Developers
1. Start with the relevant category directory
2. Review rules.md for coding standards
3. Check workflows.md for development processes
4. Consult architectural-docs.md for system design

### For Users
1. Navigate to user-context categories
2. Read guiding-docs.md for usage guidelines
3. Reference knowledge.md for troubleshooting
4. Use sanity-checks.md for system validation

### For AI Assistants
1. Read llm.txt for context and guidelines
2. Review agent.md for role configuration
3. Use content files for specific information
4. Follow established patterns and standards

## Maintenance

### Regular Updates
- Review and update rules and workflows
- Refresh knowledge base with new information
- Update architectural documentation
- Validate sanity checks and procedures

### Quality Assurance
- Ensure documentation accuracy
- Maintain consistency across categories
- Update AI integration files
- Validate all links and references

## Generated: ${new Date().toISOString()}
`;
    
    await writeFile(summaryPath, summaryContent, 'utf8');
    console.log(`📄 Overall summary saved to: ${summaryPath}`);
    
  } catch (error) {
    console.error("❌ Error:", error);
    process.exit(1);
  }
}

main();
