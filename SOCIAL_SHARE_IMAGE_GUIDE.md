# Social Share (Open Graph) Image Guide

## 📱 What is This?

When someone shares your URL on Twitter, Facebook, LinkedIn, Slack, Discord, iMessage, etc., a preview card appears with:
- **Image** (the most important part!)
- **Title**: "Avoid the Rain - Never Miss A Special Occasion"
- **Description**: "Premium greeting cards delivered to your door..."

## 🎨 Current Setup

Your site is configured to use `/public/hero.png` but you need to create a custom image.

### Image Specifications

```
Filename: og-image.png (or hero.png)
Size: 1200 x 630 pixels
Format: PNG or JPG
Max file size: < 1 MB (smaller is better)
Location: /public/
```

## ✨ Design Recommendations

### What Makes a Great OG Image

1. **Bold, Large Text** - Readable on mobile
2. **High Contrast** - Works in light/dark modes
3. **Minimal Design** - Simple beats complex
4. **Brand Colors** - Use your gradient palette
5. **Safe Zones** - Keep important content centered

### Safe Zones (Avoid Cropping)
```
Top: 60px margin
Bottom: 60px margin
Left: 60px margin
Right: 60px margin

Center zone (840 x 440) is safest - this appears everywhere
```

### Design Template Ideas

#### Option 1: Hero Shot with Text
```
┌────────────────────────────────────────┐
│                                        │
│    [Gradient Background]               │
│                                        │
│    Never Miss A                        │
│    Special Occasion                    │
│                                        │
│    Premium cards delivered to          │
│    your door, ready to send            │
│                                        │
│    [Sample card image]                 │
│                                        │
└────────────────────────────────────────┘
```

#### Option 2: Card Stack
```
┌────────────────────────────────────────┐
│  [Sample Card Images Collage]          │
│                                        │
│  Avoid the Rain                        │
│  Never miss a birthday,                │
│  anniversary, or holiday               │
│                                        │
└────────────────────────────────────────┘
```

#### Option 3: Simple & Bold
```
┌────────────────────────────────────────┐
│                                        │
│       Avoid the Rain                   │
│                                        │
│       Never forget the people          │
│       who matter                       │
│                                        │
│       Premium cards • Delivered        │
│       Pre-stamped • Ready to send      │
│                                        │
└────────────────────────────────────────┘
```

## 🛠️ How to Create Your OG Image

### Option A: Use Figma (Recommended)
1. Create new file: 1200 x 630 px
2. Use your brand colors (gradients from website)
3. Add your logo/brand name
4. Include 1-2 sample card images
5. Add compelling headline
6. Export as PNG

### Option B: Use Canva (Easy)
1. Go to Canva.com
2. Search "Facebook Post" (1200x630)
3. Design with your brand elements
4. Download as PNG

### Option C: Use HTML Template (I'll create one below)
1. Open HTML in browser
2. Screenshot at exact size
3. Or export using a tool

### Option D: Photoshop/Design Tool
- Canvas: 1200 x 630 px
- Resolution: 72 DPI (web)
- Color mode: RGB

## 📋 Design Checklist

- [ ] Text is large and readable (40px+ font size)
- [ ] High contrast text on background
- [ ] Brand colors match website
- [ ] Important content in center safe zone
- [ ] Looks good when cropped to square (1:1)
- [ ] File size under 1 MB
- [ ] Saved as PNG or high-quality JPG
- [ ] Named `og-image.png` or `hero.png`
- [ ] Placed in `/public/` folder

## 🎨 Suggested Text for Image

### Main Headline (Pick One):
- "Never Miss A Special Occasion"
- "Never Forget The People Who Matter"
- "Thoughtful Cards, Zero Effort"
- "Premium Cards Delivered to Your Door"
- "Stay Connected Without The Stress"

### Subtext:
- "Pre-stamped • Pre-addressed • Ready to send"
- "Birthday, anniversary, and holiday cards"
- "Luxury greeting cards on autopilot"

## 🎨 Color Palette (From Your Site)

```
Gradients to use:
- from-pink-200 via-purple-200 to-blue-300
- from-blue-100 via-indigo-50 to-purple-100
- from-amber-100 via-orange-50 to-pink-100

Text colors:
- White text (#FFFFFF)
- Gray-900 (#111827)
- Gray-700 (#374151)
```

## 📱 Platform-Specific Previews

### Twitter
- Shows: Full 1200x630 image
- Text: Title + description below

### Facebook
- Shows: Full 1200x630 image
- Text: Title + description + site name

### LinkedIn
- Shows: 1200x627 (close enough)
- Text: Title + description

### iMessage / Slack / Discord
- Shows: Square crop (1:1 ratio)
- Keep important content centered!

### WhatsApp
- Shows: Square thumbnail
- Smaller preview, text matters more

## 🚀 Quick Start: Use Existing Image

If you want to use one of your existing images temporarily:

### Best Candidates:
1. **holidaystack.png** - Stack of cards (add text overlay)
2. **SampleCard[X].jpg** - Use a beautiful card as hero
3. **US.jpg** - Founders photo (personal touch)

### How to Add Text Overlay:
Use a simple online tool like:
- Canva (easiest)
- Photopea (free Photoshop alternative)
- Pablo by Buffer

## 📝 Update Metadata After Creating Image

Once you have your image:

1. Save as `/public/og-image.png` or replace `/public/hero.png`
2. If you used a different name, update `app/layout.tsx`:

```typescript
openGraph: {
  images: [
    {
      url: '/og-image.png',  // ← Update this
      width: 1200,
      height: 630,
      alt: 'Avoid the Rain - Never miss a special occasion',
    },
  ],
},
```

## 🧪 Test Your OG Image

### Testing Tools:
1. **Twitter Card Validator**
   - https://cards-dev.twitter.com/validator
   - Paste your URL, see preview

2. **Facebook Sharing Debugger**
   - https://developers.facebook.com/tools/debug/
   - Clear cache, see preview

3. **LinkedIn Post Inspector**
   - https://www.linkedin.com/post-inspector/
   - Check LinkedIn preview

4. **Social Share Preview**
   - https://www.opengraph.xyz/
   - See all platforms at once

5. **Meta Tags Preview**
   - https://metatags.io/
   - Live preview as you build

## 💡 Pro Tips

### Text Readability
- Font size: 60-80px for headlines
- Font weight: Bold (700) or Extra Bold (800)
- Add text shadow or background for contrast
- Use system fonts for maximum compatibility

### Composition
- Follow rule of thirds
- Leave breathing room around text
- Use one focal point (your card or logo)
- Don't cram too much information

### Branding
- Include your logo (but don't make it huge)
- Use your brand colors consistently
- Match the vibe of your website
- Keep it premium/luxury feeling

### File Optimization
- Use TinyPNG to compress: https://tinypng.com/
- Aim for under 500KB (faster loading)
- PNG for graphics, JPG for photos

## 🎨 Quick Figma Template Dimensions

If using Figma:
```
Canvas: 1200 x 630 px

Safe zone:
X: 60 - 1140 (1080 wide)
Y: 60 - 570 (510 tall)

Center text around:
X: 600 (horizontal center)
Y: 315 (vertical center)

Logo position (top left):
X: 80
Y: 80
```

## 📸 Alternative: Screenshot Your Homepage

Quick hack if you need something NOW:

1. Set browser to 1200x630 viewport
2. Screenshot your hero section
3. Add text overlay with your tagline
4. Export as PNG

Not perfect, but better than nothing!

---

## 🎯 Recommended Quick Solution

**Use Canva (5 minutes):**

1. Go to Canva.com → "Facebook Post" template
2. Add gradient background matching your site
3. Add text: "Never Miss A Special Occasion"
4. Subtext: "Premium cards delivered to your door"
5. Add 1-2 sample card images
6. Download as PNG → Save to `/public/og-image.png`
7. Test with https://www.opengraph.xyz/

**Done!** ✨

---

**Current Status**: Metadata configured, need image file
**Priority**: Medium (helps with sharing/marketing)
**Time to create**: 10-30 minutes

