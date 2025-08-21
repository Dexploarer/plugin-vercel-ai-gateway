# Image Assets for Plugin Registry

This directory should contain the following images for plugin registry submission:

## Required Images

### 1. Logo (logo.jpg)
- **Size:** 400x400px
- **Format:** JPG or PNG
- **Content:** AI Gateway logo
- **Suggestions:** 
  - Use a modern, tech-focused design
  - Include gateway/network imagery
  - Keep it simple and recognizable

### 2. Banner (banner.jpg)
- **Size:** 1280x640px
- **Format:** JPG or PNG
- **Content:** Plugin banner showcasing features
- **Suggestions:**
  - Show multiple AI provider logos
  - Include "100+ Models" text
  - Modern gradient background
  - Professional appearance

### 3. Screenshots (screenshots/)
- **Size:** Variable, but consistent
- **Format:** PNG preferred
- **Required screenshots:**
  - `demo.png` - Plugin in action
  - `config.png` - Configuration example
  - `models.png` - Available models list
  - `action.png` - Action being executed

## Creating Images

### Using Canva (Free)
1. Go to [Canva](https://www.canva.com)
2. Search for "Logo" or "Banner" templates
3. Customize with AI/tech themes
4. Export in required dimensions

### Using AI Tools
- **Logo:** Use DALL-E or Midjourney with prompt: "Modern logo for AI Gateway plugin, network nodes, multiple connections, tech style, 400x400"
- **Banner:** "Banner for AI Gateway plugin showing multiple AI providers (OpenAI, Anthropic, Google) connecting through a central gateway, modern tech design, 1280x640"

### Quick Placeholder Generation
For development/testing, create placeholder images:

```bash
# Install ImageMagick first, then:
convert -size 400x400 xc:navy -pointsize 48 -fill white -gravity center -annotate +0+0 "AI\nGateway" logo.jpg
convert -size 1280x640 xc:darkblue -pointsize 72 -fill white -gravity center -annotate +0+0 "AI Gateway Plugin\n100+ Models" banner.jpg
```

## Image Optimization

Before submission, optimize images:
- Keep logo under 500KB
- Keep banner under 1MB
- Use online tools like [TinyPNG](https://tinypng.com) or [Squoosh](https://squoosh.app)

## Color Scheme Suggestions
- Primary: #0066CC (Blue)
- Secondary: #00D4FF (Cyan)
- Accent: #7C3AED (Purple)
- Background: #0F172A (Dark)