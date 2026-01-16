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


# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is **Veena** (v2.0.2), a Shopify theme developed by Webibazaar. It follows Shopify's standard theme architecture with Liquid templating, modular sections, reusable snippets, and web components for interactive features.

**Documentation**: https://webibazaar.gitbook.io/veena-documentation
**Support**: https://support.webibazaar.com/shopify

## Architecture

### Liquid Template Structure

The theme uses Shopify's section-based architecture:

- **layout/theme.liquid**: Base HTML template that wraps all pages. Contains:
  - Dynamic CSS variables generated from theme settings (color schemes, typography, spacing)
  - Global JavaScript includes (constants.js, pubsub.js, global.js)
  - Section groups: `header-group`, `overlay-group`, `footer-group`
  - Main content area with breadcrumbs

- **sections/**: Dynamic, customizable content blocks in the Theme Editor
  - Main sections like `main-product.liquid`, `main-collection.liquid`
  - Reusable sections like `announcement-bar.liquid`, `cart-drawer.liquid`
  - Each section includes its own CSS/JS requirements inline

- **snippets/**: Reusable Liquid components
  - `product-media-gallery.liquid`: Media viewer with gallery layouts
  - `buy-buttons.liquid`, `card-product.liquid`, `breadcrumbs.liquid`
  - Accepts parameters via `render` tag

- **templates/**: Page-level JSON files that compose sections
  - Format: `{ "sections": { "section-id": { "type": "section-name", "settings": {} } } }`

- **blocks/**: AI-generated or custom blocks (prefixed with `ai_gen_block_`)

### JavaScript Architecture

The theme uses **vanilla JavaScript with Web Components** (Custom Elements):

**Core System:**
- **pubsub.js**: Event bus for component communication
  - `subscribe(eventName, callback)`: Returns unsubscribe function
  - `publish(eventName, data)`: Broadcasts events
  - Events defined in `constants.js` (`PUB_SUB_EVENTS`)

- **constants.js**: Shared configuration
  - `ON_CHANGE_DEBOUNCE_TIMER`: 300ms
  - `PUB_SUB_EVENTS`: `cartUpdate`, `quantityUpdate`, `variantChange`, `cartError`, `optionValueSelectionChange`

- **global.js**: Utility functions and base classes
  - `HTMLUpdateUtility`: View transitions and DOM updates
  - `SectionId`: Parse qualified section IDs (e.g., `template--123__main`)
  - `getFocusableElements()`: Accessibility helper
  - Focus trap handlers

**Key Web Components:**
- `product-form` (product-form.js): Add to cart with section rendering
- `cart-items` (cart.js): Cart quantity updates with debouncing
- `product-info` (product-info.js): Variant selection and URL updates
- `media-gallery` (media-gallery.js): Product image gallery
- `cart-drawer` (cart-drawer.js): Slide-out cart
- `predictive-search` (predictive-search.js): Search suggestions

**Component Communication Pattern:**
```javascript
// Publishing an event
publish(PUB_SUB_EVENTS.cartUpdate, { source: 'product-form', cartData: response });

// Subscribing to events
this.cartUpdateUnsubscriber = subscribe(PUB_SUB_EVENTS.cartUpdate, (event) => {
  if (event.source === 'cart-items') return; // Ignore own updates
  this.onCartUpdate();
});
```

### CSS Architecture

- **base.css**: Core styles and resets
- **component-*.css**: Scoped to specific components (e.g., `component-cart.css`, `component-product-variant-picker.css`)
- **section-*.css**: Scoped to sections (e.g., `section-main-product.css`)
- Dynamic CSS variables set in theme.liquid `:root` from `settings_schema.json`

### Theme Settings

- **config/settings_schema.json**: Defines Theme Editor settings structure
  - Color schemes, typography, button styles, card layouts, spacing
  - Organized by categories: Logo, Colors, Typography, Layout, Product cards, etc.
- **config/settings_data.json**: Current theme configuration values

### Localization

- **locales/**: Translation files
  - `{locale}.json`: UI strings (e.g., `en.default.json`)
  - `{locale}.schema.json`: Setting labels for Theme Editor
  - Accessed via Liquid: `{{ 'products.product.add_to_cart' | t }}`
  - Accessed via JS: `window.variantStrings.addToCart`

## Development Workflow

### Testing Changes

Since this is a Shopify theme, there is no local build process. Changes must be tested in one of these ways:

1. **Shopify CLI** (if configured):
   ```bash
   shopify theme dev
   ```
   - Opens development store preview
   - Hot-reloads on file changes

2. **Theme Editor**: Upload theme to Shopify Admin > Themes

3. **Manual Testing**: Test cart functionality, variant selection, media galleries, and responsive layouts

### Making Changes

**Adding/Modifying Sections:**
1. Edit `.liquid` files in `sections/`
2. Include CSS/JS dependencies using `{{ 'file.css' | asset_url | stylesheet_tag }}`
3. Define schema at bottom for Theme Editor controls

**Adding/Modifying Snippets:**
1. Edit `.liquid` files in `snippets/`
2. Document accepted parameters in comments
3. Render with: `{% render 'snippet-name', param: value %}`

**JavaScript Changes:**
1. Edit files in `assets/` (e.g., `product-form.js`, `cart.js`)
2. Use Web Components pattern (`customElements.define()`)
3. Use pubsub for cross-component communication
4. Reference global utilities from `global.js`

**CSS Changes:**
1. Edit component/section CSS files in `assets/`
2. Use CSS custom properties from `:root` for theming
3. Follow BEM-like naming conventions

**Configuration Changes:**
1. Modify `config/settings_schema.json` for new Theme Editor settings
2. Access in Liquid: `{{ settings.setting_id }}`

## Important Patterns

### Section Rendering (AJAX Updates)

Many components use section rendering to update multiple areas after cart/variant changes:

```javascript
const formData = new FormData(this.form);
formData.append('sections', this.cart.getSectionsToRender().map((section) => section.id));
formData.append('sections_url', window.location.pathname);

fetch(`${routes.cart_add_url}`, config)
  .then((response) => response.json())
  .then((response) => {
    this.cart.renderContents(response);
  });
```

### Variant Selection

Product variants use:
- URL updates (`data-update-url="true"` on `product-info`)
- Media switching based on `variant_images` array
- Price/availability updates via section rendering

### Image Zoom Options

Three modes configured in section settings:
- **hover**: Uses `magnify.js`
- **lightbox**: Uses PhotoSwipe (`photoswipe.js`, `photoswipe-ui-default.js`)
- **click**: Opens modal

### Accessibility

- Focus trapping in modals/drawers (see `trapFocus()` in global.js)
- ARIA attributes managed dynamically
- Skip links for keyboard navigation

## CRITICAL: Toggle Filtering System (Brand New / Renewed)

This theme has a **mandatory toggle filtering system** that allows users to switch between "Brand New" and "Renewed" product views. **ALL sections that display products MUST implement toggle filtering.**

### Toggle System Core Files

- `snippets/detect-current-mode.liquid` - Detects current mode from URL or localStorage
- `snippets/product-mode-filter.liquid` - Filters products based on current mode
- `snippets/sku-parser.liquid` - Parses SKU to determine product condition
- `sections/mode-toggle.liquid` - The UI toggle component
- `assets/sku-parser.js` - JavaScript SKU parser (globally loaded)

### Required Pattern for ALL Product-Displaying Sections

**CRITICAL:** Liquid's `render` tag creates an isolated variable scope. Variables assigned inside a rendered snippet are NOT accessible to the parent template. You MUST inline the mode detection and filtering logic directly in each section.

Every section that loops through products MUST include:

```liquid
{%- comment -%} 1. INLINE mode detection at top of section (DO NOT use render) {%- endcomment -%}
{%- liquid
  assign current_mode = 'brand-new'
  assign url_string = request.url | downcase

  if url_string contains 'mode=renewed'
    assign current_mode = 'renewed'
  elsif url_string contains 'mode=brand-new'
    assign current_mode = 'brand-new'
  elsif url_string contains 'mode=new'
    assign current_mode = 'brand-new'
  endif
-%}

{%- comment -%} 2. Before product loop {%- endcomment -%}
{%- assign visible_count = 0 -%}

{%- comment -%} 3. Inside product loop - INLINE filtering logic {%- endcomment -%}
{%- if section.settings.enable_toggle_filtering -%}
  {%- liquid
    assign show_product = false
    assign product_mode = 'unknown'

    # Check product tags
    if product.tags contains 'brand-new'
      assign product_mode = 'brand-new'
    elsif product.tags contains 'renewed'
      assign product_mode = 'renewed'
    endif

    # Show if mode matches OR if unknown (fail-open)
    if product_mode == current_mode
      assign show_product = true
    elsif product_mode == 'unknown'
      assign show_product = true
    endif
  -%}
{%- else -%}
  {%- assign show_product = true -%}
{%- endif -%}

{%- if show_product -%}
  {%- assign visible_count = visible_count | plus: 1 -%}
  <!-- Product card HTML here -->
{%- endif -%}

{%- comment -%} 4. After product loop - empty state {%- endcomment -%}
{%- if section.settings.enable_toggle_filtering and visible_count == 0 -%}
  <div class="empty-state">
    <p>No {{ current_mode | replace: '-', ' ' }} products found.</p>
  </div>
{%- endif -%}
```

### Required Schema Setting

Add this to every product-displaying section's schema:

```json
{
  "type": "checkbox",
  "id": "enable_toggle_filtering",
  "label": "Enable Toggle Filtering",
  "default": true,
  "info": "When enabled, only products matching the current Brand New/Renewed mode will be displayed."
}
```

### Mode Values

- `brand-new` - Products with tag `brand-new` OR SKU condition code `NEW`
- `renewed` - Products with tag `renewed` OR SKU condition codes `REN`, `REFA`, `REFB`, `REFC`

### SKU Format

`BRAND-MODEL-CAPACITY-CONDITION-COLOR-SEQUENCE` (e.g., `APPL-IPH15PM-256-NEW-BLK-001`)

## Custom Features

- **Age Verification**: `age-verification.js` + `section-age-verification.css`
- **Stock Countdown**: `component-stock-countdown.css`
- **Before/After Images**: `before-after.svg`, `after-image.svg`
- **Visual Display**: `component-visual-display.css`
- **Custom Text**: `custom-text.css`
- **Lookbook**: `lookbook.css`
- **Product Tabs**: `product-tab.css`

## File Naming Conventions

- **Sections**: `{name}.liquid` (e.g., `main-product.liquid`)
- **Snippets**: `{name}.liquid` (e.g., `product-media-gallery.liquid`)
- **JavaScript**: `{component-name}.js` (e.g., `product-form.js`)
- **CSS Components**: `component-{name}.css`
- **CSS Sections**: `section-{name}.css`
- **Templates**: `{page-type}.json` or `{page-type}.{suffix}.json`

## Key Global Variables (Set in theme.liquid)

```javascript
window.shopUrl         // Store origin
window.routes          // Cart/search API URLs
window.cartStrings     // Translated cart messages
window.variantStrings  // Translated product messages
window.accessibilityStrings // Translated a11y messages
```

## Notes

- This theme does not use a build system (no npm/webpack)
- All JavaScript is ES6+ using modern browser APIs
- Component CSS is loaded on-demand by sections
- Theme uses Shopify's Section Groups feature (header-group, footer-group, overlay-group)
- Color schemes are managed via `settings.color_schemes` array

