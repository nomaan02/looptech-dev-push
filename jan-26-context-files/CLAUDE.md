# CLAUDE.md - LoopTech Shopify Theme Development

> **Purpose**: Permanent project context for AI assistants. Do NOT modify during active tasks.
> **Theme**: Shrine Pro 1.3.0 (Modified)
> **Store**: isaactests-2.myshopify.com
> **Developer**: Nomaan Akram (NakoLabs)

---

## 🎯 BUSINESS CONTEXT

**Business**: LoopTech - UK tech resale (new + renewed electronics)
**Client**: Isaac Hussain
**USP**: "Renewed" products restored to like-new condition (no A/B/C grades)

### Product Conditions
- **Brand New** = Factory sealed, never used
- **Renewed** = Professionally restored to like-new (single quality tier)
- No grades (A/B/C abolished) - all renewed items meet same standard

### SKU System
```
FORMAT: BRAND-MODEL-CAPACITY-CONDITION-COLOR-SEQ
EXAMPLE: APPL-IPH15P-256-REN-BLK-001

CONDITION CODES:
- NEW = Brand New
- REN = Renewed
```

---

## 🏗️ TECHNICAL ARCHITECTURE

### Theme Stack
- **Base Theme**: Shrine Pro 1.3.0
- **Shopify Version**: Online Store 2.0
- **JavaScript**: Vanilla JS (NO jQuery)
- **CSS**: Theme CSS + custom additions
- **Icons**: Theme's built-in icon system

### Key Custom Systems Already Built
```
Toggle System:
- Cookie: 'looptech_condition' = 'new' | 'renewed'
- Default: 'new'
- Persistence: 30 days
- Event: 'looptech:condition-changed'
```

### File Naming Conventions
```
Sections:   section-[feature-name].liquid
Snippets:   [feature]-[component].liquid
Assets:     [feature]-[type].js/.css
Templates:  [page-type].json + page.[page-type].liquid
```

---

## 📋 CODING STANDARDS

### Liquid Requirements
```liquid
{% comment %} 
  REQUIRED FOR ALL NEW SECTIONS:
  1. Section schema with settings
  2. Merchant-customizable options
  3. Mobile-first responsive design
  4. Fallbacks for missing data
{% endcomment %}

{% liquid
  # Use {% liquid %} for multi-line logic
  # Always provide defaults
  assign heading = section.settings.heading | default: 'Default Heading'
%}
```

### Section Schema Template
```liquid
{% schema %}
{
  "name": "Section Name",
  "tag": "section",
  "class": "section section--[name]",
  "settings": [],
  "blocks": [],
  "presets": [{ "name": "Section Name" }]
}
{% endschema %}
```

### JavaScript Standards
```javascript
// Use IIFE pattern to avoid global pollution
(function() {
  'use strict';
  
  // Use event delegation
  document.addEventListener('click', function(e) {
    if (e.target.matches('.selector')) {
      // Handle
    }
  });
  
  // Dispatch custom events for cross-component communication
  document.dispatchEvent(new CustomEvent('looptech:event-name', {
    detail: { data: value }
  }));
})();
```

### CSS Standards
```css
/* BEM naming convention */
.component { }
.component__element { }
.component--modifier { }

/* Mobile-first breakpoints */
@media screen and (min-width: 750px) { }
@media screen and (min-width: 990px) { }
```

---

## ⚠️ CRITICAL RULES

### NEVER DO:
- ❌ Modify core theme files (main-*.liquid) unless absolutely necessary
- ❌ Use inline styles
- ❌ Hardcode product/collection handles or IDs
- ❌ Use jQuery (theme is vanilla JS)
- ❌ Create N+1 query patterns in Liquid loops
- ❌ Remove existing functionality
- ❌ Skip mobile testing
- ❌ Forget schema settings for merchant control

### ALWAYS DO:
- ✅ Use `{% render %}` not `{% include %}`
- ✅ Add comprehensive schema settings
- ✅ Test at 375px, 768px, 1200px breakpoints
- ✅ Include loading states for async operations
- ✅ Use semantic HTML and ARIA labels
- ✅ Provide fallbacks: `| default: 'value'`
- ✅ Comment complex logic
- ✅ Use theme's existing CSS variables where possible

---

## 🔧 DEVELOPMENT WORKFLOW

### Local Development
```bash
# Start local dev server
shopify theme dev --store=isaactests-2.myshopify.com

# Push to theme
shopify theme push --theme=[theme-id]
```

### Testing Checklist (Apply to ALL tasks)
```
□ Mobile (375px) - touch targets, readability
□ Tablet (768px) - layout adapts properly  
□ Desktop (1200px+) - full layout works
□ No console errors
□ Theme editor preview functional
□ Schema settings work
□ Links/buttons functional
□ Forms validate properly
□ Loading states present
□ Error states handled
```

---

## 📁 EXISTING CUSTOM FILES

```
/sections/
  hero-banner.liquid          # Modified hero
  product-grid-toggle.liquid  # Grid with condition toggle
  mega-menu.liquid           # Custom navigation
  condition-toggle.liquid    # Toggle component

/snippets/
  toggle-switch.liquid       # Toggle UI
  product-card.liquid        # Unified product card
  
/assets/
  toggle-system.js           # Toggle state management
```

---

## 🎨 DESIGN TOKENS

```css
/* Brand Colors (use these) */
--color-primary: #2563eb;      /* Blue - primary actions */
--color-secondary: #059669;    /* Green - renewed/success */
--color-accent: #f59e0b;       /* Amber - warnings/highlights */
--color-neutral: #6b7280;      /* Gray - secondary text */

/* Spacing Scale */
--space-xs: 0.25rem;  /* 4px */
--space-sm: 0.5rem;   /* 8px */
--space-md: 1rem;     /* 16px */
--space-lg: 1.5rem;   /* 24px */
--space-xl: 2rem;     /* 32px */
--space-2xl: 3rem;    /* 48px */
```

---

## 📚 REFERENCE LINKS

- [Shopify Liquid Reference](https://shopify.dev/docs/api/liquid)
- [Theme Architecture](https://shopify.dev/docs/themes/architecture)
- [Section Schema](https://shopify.dev/docs/themes/architecture/sections/section-schema)
- [Customer Account API](https://shopify.dev/docs/api/liquid/objects/customer)

---

**⚡ IMPORTANT**: This file provides context only. For current task instructions, see `/tasks/TASK-[N].md`
