# Brand New/Refurbished Toggle System - Technical Analysis

**Document Purpose:** This document provides a comprehensive analysis of the current Brand New/Refurbished toggle system implementation in the Veena Shopify theme (v2.0.2). It is optimized for AI interpretation to enable seamless integration with new SKU-based product categorization systems.

**Last Updated:** 2025-11-27
**Theme Version:** Veena v2.0.2
**Architecture:** Shopify Liquid + Vanilla JavaScript + Web Components

---

## Table of Contents

1. [System Overview](#system-overview)
2. [Current Implementation Architecture](#current-implementation-architecture)
3. [File Structure & Dependencies](#file-structure--dependencies)
4. [Mode Toggle Component](#mode-toggle-component)
5. [Menu Switching System](#menu-switching-system)
6. [Product Collection Switching](#product-collection-switching)
7. [Data Flow & State Management](#data-flow--state-management)
8. [Current Product Filtering Logic](#current-product-filtering-logic)
9. [Integration Points for SKU-Based Systems](#integration-points-for-sku-based-systems)
10. [Code Reference Map](#code-reference-map)

---

## System Overview

### Current Functionality
The Brand New/Refurbished toggle system provides users with a seamless way to switch between viewing brand new products and refurbished products across the entire store. The system operates through URL parameter-based state management.

### Key Characteristics
- **State Persistence:** URL parameters (`?mode=new` or `?mode=refurbished`)
- **Local Storage Backup:** User preference stored in `localStorage.preferredMode`
- **Global Scope:** Affects navigation menus, product collections, and featured content
- **No Product Tagging Required:** Currently uses collection-based filtering
- **Page Reload Mechanism:** Changes require full page reload to update content

### User Flow
```
User clicks toggle → JavaScript updates URL → localStorage saves preference → Page reloads →
All sections detect new mode → Content switches (menus, collections, products)
```

---

## Current Implementation Architecture

### Technology Stack
- **Frontend:** Vanilla JavaScript (ES6+), no frameworks
- **Templating:** Shopify Liquid
- **Styling:** Inline CSS within `.liquid` files
- **State Management:** URL parameters + localStorage API
- **Browser APIs:** URLSearchParams, localStorage, DOM manipulation

### Mode Detection Pattern
**Used across all components:**

```liquid
{%- liquid
  # Detect mode from URL parameter
  assign url_mode = request.url | split: 'mode=' | last | split: '&' | first
  assign current_mode = 'new'
  if url_mode == 'refurbished'
    assign current_mode = 'refurbished'
  endif
-%}
```

**Key Variables:**
- `url_mode` - Extracted from URL query string
- `current_mode` - Normalized mode value (either 'new' or 'refurbished')
- Default: Always 'new' if parameter is missing or invalid

---

## File Structure & Dependencies

### Core Implementation Files

```
theme-test-2-upd/
├── sections/
│   ├── mode-toggle.liquid              # Toggle UI component (242 lines)
│   ├── header.liquid                   # Menu switching logic (~line 193-207)
│   ├── product-spotlight-carousel.liquid  # Collection switching (2055 lines)
│   └── [other sections using mode detection]
├── snippets/
│   └── product-spotlight-card.liquid   # Product card rendering (167 lines)
├── templates/
│   └── index.json                      # Homepage configuration
├── blocks/
│   ├── ai_gen_block_38562b2.liquid    # Alternative toggle (disabled)
│   ├── ai_gen_block_1cd1b43.liquid    # Alternative toggle (disabled)
│   ├── ai_gen_block_875766e.liquid    # Alternative toggle (disabled)
│   └── ai_gen_block_63cc393.liquid    # Alternative toggle (disabled)
└── config/
    └── settings_data.json              # Theme settings

```

### Dependency Graph

```
mode-toggle.liquid (UI)
    ↓ (triggers URL change)
request.url (URL parameter)
    ↓ (detected by)
header.liquid → menu switching
product-spotlight-carousel.liquid → collection switching
[any other section] → conditional content
```

---

## Mode Toggle Component

### File: `sections/mode-toggle.liquid`

**Purpose:** Renders the toggle button UI and handles user interaction

### Component Structure

#### 1. Mode Detection (Lines 6-13)
```liquid
{%- liquid
  assign url_mode = request.url | split: 'mode=' | last | split: '&' | first
  assign current_mode = 'new'
  if url_mode == 'refurbished'
    assign current_mode = 'refurbished'
  endif
-%}
```

#### 2. HTML Structure (Lines 15-40)
```liquid
<div class="mode-toggle-section color-{{ section.settings.color_scheme }} gradient">
  <div class="page-width">
    {%- if section.settings.heading != blank -%}
      <h2 class="mode-toggle-title">{{ section.settings.heading }}</h2>
    {%- endif -%}

    <div class="mode-toggle-wrapper">
      <button class="mode-toggle-button {% if current_mode == 'new' %}active{% endif %}"
              data-mode="new"
              aria-pressed="{% if current_mode == 'new' %}true{% else %}false{% endif %}"
              type="button">
        {{ section.settings.new_label | default: "Brand New" }}
      </button>

      <button class="mode-toggle-button {% if current_mode == 'refurbished' %}active{% endif %}"
              data-mode="refurbished"
              aria-pressed="{% if current_mode == 'refurbished' %}true{% else %}false{% endif %}"
              type="button">
        {{ section.settings.refurb_label | default: "Refurbished" }}
      </button>
    </div>
  </div>
</div>
```

**Key Attributes:**
- `data-mode` - Stores target mode value for JavaScript
- `aria-pressed` - Accessibility state indicator
- `.active` class - Visual state indicator (CSS styling)

#### 3. CSS Styling (Lines 42-126)

**Button States:**
```css
.mode-toggle-button {
  /* Default state */
  background: transparent;
  border: 2px solid rgba(0, 0, 0, 0.2);
  color: rgb(var(--color-foreground));
}

.mode-toggle-button.active {
  /* Selected state */
  background: rgb(var(--color-foreground));
  color: rgb(var(--color-background));
  border-color: rgb(var(--color-foreground));
}
```

**Responsive Breakpoints:**
- Desktop: Full width buttons, side-by-side
- Tablet (< 749px): Slightly smaller buttons
- Mobile (< 480px): Full-width stacked buttons

#### 4. JavaScript Logic (Lines 128-182)

**Click Handler:**
```javascript
button.addEventListener('click', function(e) {
  e.preventDefault();

  const newMode = this.getAttribute('data-mode');
  const url = new URL(window.location.href);

  // Update URL parameter
  url.searchParams.set('mode', newMode);

  // Store preference in localStorage
  localStorage.setItem('preferredMode', newMode);

  // Update UI immediately (optimistic update)
  buttons.forEach(btn => {
    btn.classList.remove('active');
    btn.setAttribute('aria-pressed', 'false');
  });
  this.classList.add('active');
  this.setAttribute('aria-pressed', 'true');

  // Navigate to new URL (triggers page reload)
  window.location.href = url.toString();
});
```

**Auto-Apply Stored Preference:**
```javascript
document.addEventListener('DOMContentLoaded', function() {
  const urlParams = new URLSearchParams(window.location.search);
  const urlMode = urlParams.get('mode');

  // Only apply localStorage if no URL parameter exists
  if (!urlMode) {
    const storedMode = localStorage.getItem('preferredMode');
    if (storedMode && (storedMode === 'new' || storedMode === 'refurbished')) {
      const url = new URL(window.location.href);
      url.searchParams.set('mode', storedMode);
      window.location.href = url.toString();
    }
  }
});
```

**State Priority:**
1. URL parameter (highest priority)
2. localStorage preference (fallback)
3. Default 'new' mode (final fallback)

#### 5. Theme Editor Schema (Lines 184-241)

**Customizable Settings:**
```json
{
  "name": "Mode Toggle",
  "settings": [
    {
      "type": "text",
      "id": "heading",
      "label": "Section Heading",
      "default": "Shop Our Products"
    },
    {
      "type": "text",
      "id": "new_label",
      "label": "Brand New Button Label",
      "default": "Brand New"
    },
    {
      "type": "text",
      "id": "refurb_label",
      "label": "Refurbished Button Label",
      "default": "Refurbished"
    },
    {
      "type": "color_scheme",
      "id": "color_scheme"
    },
    {
      "type": "range",
      "id": "padding_top",
      "default": 36
    },
    {
      "type": "range",
      "id": "padding_bottom",
      "default": 36
    }
  ]
}
```

---

## Menu Switching System

### File: `sections/header.liquid` (Lines 193-207)

**Purpose:** Dynamically switches between different navigation menus based on the current mode

### Implementation

```liquid
{%- comment -%}
  Mode Detection for Brand New / Refurbished Toggle
  Switches between different menus based on URL parameter
{%- endcomment -%}
{%- liquid
  # Detect mode from URL parameter
  assign url_mode = request.url | split: 'mode=' | last | split: '&' | first
  assign current_mode = 'new'
  if url_mode == 'refurbished'
    assign current_mode = 'refurbished'
  endif

  # Select appropriate menu based on mode
  if current_mode == 'refurbished' and section.settings.menu_refurbished != blank
    assign active_menu = linklists[section.settings.menu_refurbished]
  else
    assign active_menu = section.settings.menu
  endif
-%}
```

### Menu Selection Logic

**Conditional Menu Assignment:**
1. **If mode = 'refurbished' AND refurbished menu configured:**
   - Use `linklists[section.settings.menu_refurbished]`
2. **Otherwise:**
   - Use default `section.settings.menu`

**Theme Settings Required:**
```json
{
  "type": "link_list",
  "id": "menu",
  "label": "Default Menu",
  "default": "main-menu"
}
```

```json
{
  "type": "text",
  "id": "menu_refurbished",
  "label": "Refurbished Menu Handle",
  "info": "Enter the menu handle (e.g., 'refurbished-menu')"
}
```

### Usage Example

**Shopify Admin Setup:**
1. Navigation → Create menu named "Refurbished Main Menu"
2. Menu handle becomes: `refurbished-main-menu`
3. Theme Editor → Header → Set `menu_refurbished` = "refurbished-main-menu"

**Result:**
- `?mode=new` → Shows default navigation
- `?mode=refurbished` → Shows refurbished navigation menu

---

## Product Collection Switching

### File: `sections/product-spotlight-carousel.liquid`

**Purpose:** Featured product carousel that switches collections based on mode

### Mode Detection & Collection Selection (Lines 6-74)

```liquid
{%- liquid
  # Mode Detection
  assign url_mode = request.url | split: 'mode=' | last | split: '&' | first
  assign current_mode = 'new'
  if url_mode == 'refurbished'
    assign current_mode = 'refurbished'
  endif

  # Select collection based on mode
  if current_mode == 'refurbished' and section.settings.featured_collection_refurbished != blank
    assign featured_collection = section.settings.featured_collection_refurbished
  else
    assign featured_collection = section.settings.featured_collection
  endif

  # Pull in products from the selected collection
  if featured_collection != blank
    assign collection_products = collections[featured_collection].products
  endif
-%}
```

### Collection Settings Schema (Lines 1866-1878)

```json
{
  "type": "collection",
  "id": "featured_collection",
  "label": "Product Collection",
  "info": "Main collection to display"
},
{
  "type": "collection",
  "id": "featured_collection_refurbished",
  "label": "Refurbished Collection",
  "info": "Collection to show when in refurbished mode"
}
```

### Product Rendering (Lines 352-367)

```liquid
<div class="carousel-track" data-collection="all">
  {%- if collection_products.size > 0 -%}
    {%- for product in collection_products limit: products_limit -%}
      {%- render 'product-spotlight-card',
        product: product,
        show_rating: show_ratings,
        show_starting_at: show_starting_at_text,
        show_new_price: show_new_price_comparison,
        section_id: section.id
      -%}
    {%- endfor -%}
  {%- else -%}
    <div class="carousel-empty">
      <p>No products available in this collection.</p>
    </div>
  {%- endif -%}
</div>
```

### Brand Tab Filtering (Lines 1500-1522)

**JavaScript Function:**
```javascript
function handleBrandClick(event) {
  const button = event.currentTarget;
  const collectionHandle = button.dataset.collection;
  const filter = button.dataset.filter;

  // Switch active state
  brandTabButtons.forEach(tab => {
    tab.classList.remove('active');
    tab.setAttribute('aria-selected', 'false');
  });
  button.classList.add('active');
  button.setAttribute('aria-selected', 'true');

  // Load products or restore original
  if (filter === 'all' || !collectionHandle) {
    restoreOriginalProducts();
  } else {
    loadCollectionProducts(collectionHandle);
  }
}
```

**AJAX Product Loading (Lines 1548-1604):**
```javascript
async function loadCollectionProducts(collectionHandle) {
  track.style.opacity = '0.5';
  track.style.pointerEvents = 'none';

  const response = await fetch(`/collections/${collectionHandle}/products.json?limit=12`);
  const data = await response.json();

  track.innerHTML = '';

  if (data.products && data.products.length > 0) {
    data.products.forEach(product => {
      const card = createProductCard(product);
      track.appendChild(card);
    });
  }

  track.scrollLeft = 0;
  currentPage = 0;
  updateNavigationState();
  createDots();

  track.style.opacity = '1';
  track.style.pointerEvents = 'auto';
}
```

### Dynamic Product Card Generation (Lines 1610-1684)

**JavaScript Function:**
```javascript
function createProductCard(product) {
  const article = document.createElement('article');
  article.className = 'spotlight-product-card';
  article.dataset.productId = product.id;

  const firstVariant = product.variants[0];
  const productPrice = firstVariant ? firstVariant.price : product.price;
  const compareAtPrice = firstVariant ? firstVariant.compare_at_price : null;

  // Image handling
  let imageUrl = product.featured_image || product.images[0]?.src;

  // Price formatting
  const currentPrice = formatMoney(productPrice);
  const comparePriceFormatted = compareAtPrice ? formatMoney(compareAtPrice) : null;

  // Build HTML matching Liquid snippet structure
  article.innerHTML = `
    <a href="/products/${product.handle}" class="spotlight-card-link">
      <div class="spotlight-card-image-wrapper">
        <img src="${imageUrl}" alt="${escapeHtml(product.title)}" class="spotlight-card-image">
      </div>
      <div class="spotlight-card-swatches"></div>
      <div class="spotlight-card-info">
        <h3 class="spotlight-card-title">${escapeHtml(product.title)}</h3>
        <div class="spotlight-card-rating"></div>
        <div class="spotlight-card-price">
          ${startingAtLabel}
          <div class="spotlight-price-wrapper">
            <span class="spotlight-price-current">${currentPrice}</span>
            ${comparePrice}
          </div>
        </div>
      </div>
    </a>
  `;

  return article;
}
```

---

## Data Flow & State Management

### State Initialization Flow

```
Page Load
    ↓
DOMContentLoaded event fires
    ↓
Check for URL parameter '?mode='
    ↓
    ├─→ Parameter exists → Use that value
    └─→ No parameter → Check localStorage
            ↓
            ├─→ localStorage has value → Redirect with parameter
            └─→ No stored value → Default to 'new'
    ↓
All sections read URL parameter
    ↓
Content renders based on mode
```

### State Change Flow

```
User clicks toggle button
    ↓
JavaScript extracts data-mode attribute
    ↓
Create new URL with updated parameter
    ↓
Save preference to localStorage
    ↓
Update button UI (optimistic)
    ↓
Navigate to new URL (page reload)
    ↓
Server renders page with new mode
    ↓
All components detect new parameter
    ↓
Content updates globally
```

### State Persistence Mechanisms

**1. URL Parameters (Primary)**
- Format: `?mode=new` or `?mode=refurbished`
- Scope: Current page session
- Preserved: Browser navigation (back/forward)
- Lost: When manually removed from URL

**2. localStorage (Secondary)**
- Key: `preferredMode`
- Values: `'new'` or `'refurbished'`
- Scope: Domain-wide, persistent across sessions
- Purpose: Auto-apply preference on pages without URL parameter

**3. Default Mode (Tertiary)**
- Value: Always `'new'`
- Applied: When no URL parameter AND no localStorage

---

## Current Product Filtering Logic

### Collection-Based Approach

**Current Method:**
- Products are organized into separate Shopify collections
- Toggle switches between two pre-defined collections
- No product-level filtering or tagging

**Example Configuration:**
```
Default Collection: "all-products-new"
Refurbished Collection: "all-products-refurbished"
```

### Advantages of Current System
1. ✅ Simple implementation
2. ✅ No custom product attributes required
3. ✅ Works with Shopify's native collection system
4. ✅ Fast - no runtime filtering
5. ✅ Theme Editor friendly

### Limitations of Current System
1. ❌ Manual collection management required
2. ❌ Products must be in separate collections
3. ❌ No automated categorization
4. ❌ Difficult to manage products in multiple states
5. ❌ No SKU-based filtering
6. ❌ Cannot filter by condition within same collection

### Product Identification

**Current Markers:**
- Collection membership (which collection a product belongs to)
- No tags used
- No metafields checked
- No SKU parsing

**Product Data Available:**
```liquid
product.id              # Shopify product ID
product.handle          # URL-friendly identifier
product.title           # Display name
product.price           # Current price
product.compare_at_price # Original/compare price
product.collections     # Array of collections
product.tags            # Array of tags (not currently used)
product.metafields      # Custom fields (not currently used)
product.variants        # Product variants
product.variants[].sku  # SKU codes (not currently used)
```

---

## Integration Points for SKU-Based Systems

### Required Changes for SKU Integration

**1. Mode Detection (Keep Existing)**
```liquid
# This logic stays the same
assign url_mode = request.url | split: 'mode=' | last | split: '&' | first
assign current_mode = 'new'
if url_mode == 'refurbished'
  assign current_mode = 'refurbished'
endif
```

**2. Product Filtering (Needs Update)**

**Current:**
```liquid
# Collection-based filtering
if current_mode == 'refurbished' and section.settings.featured_collection_refurbished != blank
  assign featured_collection = section.settings.featured_collection_refurbished
else
  assign featured_collection = section.settings.featured_collection
endif

assign collection_products = collections[featured_collection].products
```

**Proposed SKU-Based:**
```liquid
# Pull from single master collection
assign master_collection = collections[section.settings.master_collection]

# Filter products by SKU pattern
assign filtered_products = '' | split: ''
for product in master_collection.products
  # Parse SKU to determine condition
  assign product_condition = product | determine_condition_from_sku

  if current_mode == 'refurbished' and product_condition == 'refurbished'
    assign filtered_products = filtered_products | push: product
  elsif current_mode == 'new' and product_condition == 'new'
    assign filtered_products = filtered_products | push: product
  endif
endfor
```

**3. SKU Parsing Logic (New Function Needed)**

**Expected SKU Structure:**
```
[BRAND]-[MODEL]-[CONDITION]-[VARIANT]
Example: DELL-XPS13-NEW-16GB
Example: HP-ELITEBOOK-REF-8GB
```

**Liquid Helper Function:**
```liquid
{% comment %}
  Determines product condition from SKU
  Returns: 'new', 'refurbished', or 'unknown'
{% endcomment %}

{%- liquid
  assign sku_parts = product.variants.first.sku | split: '-'
  assign condition_code = sku_parts[2] | downcase

  if condition_code == 'new' or condition_code == 'n'
    assign product_condition = 'new'
  elsif condition_code == 'ref' or condition_code == 'refurbished' or condition_code == 'r'
    assign product_condition = 'refurbished'
  else
    assign product_condition = 'unknown'
  endif
-%}
```

**4. Product Tags as Alternative (If SKU parsing not viable)**

**Tag-Based Filtering:**
```liquid
assign filtered_products = '' | split: ''
for product in collection.products
  if current_mode == 'refurbished' and product.tags contains 'condition:refurbished'
    assign filtered_products = filtered_products | push: product
  elsif current_mode == 'new' and product.tags contains 'condition:new'
    assign filtered_products = filtered_products | push: product
  endif
endfor
```

**Required Product Tags:**
```
condition:new
condition:refurbished
condition:renewed
condition:grade-a
condition:grade-b
```

**5. Metafield-Based Filtering (Most Robust)**

**Metafield Structure:**
```json
{
  "namespace": "custom",
  "key": "product_condition",
  "type": "single_line_text_field",
  "value": "refurbished"
}
```

**Liquid Filtering:**
```liquid
assign filtered_products = '' | split: ''
for product in collection.products
  assign product_condition = product.metafields.custom.product_condition | default: 'new'

  if current_mode == product_condition
    assign filtered_products = filtered_products | push: product
  endif
endfor
```

### JavaScript AJAX Updates

**Current Collection API Call:**
```javascript
fetch(`/collections/${collectionHandle}/products.json?limit=12`)
```

**Proposed Tag-Based API Call:**
```javascript
// Shopify doesn't support filtering by tags in API, would need server-side
// Alternative: Load all products and filter client-side
fetch(`/collections/${collectionHandle}/products.json?limit=250`)
  .then(response => response.json())
  .then(data => {
    const filtered = data.products.filter(product => {
      const condition = parseConditionFromSKU(product.variants[0].sku);
      return condition === currentMode;
    });
    renderProducts(filtered);
  });
```

**SKU Parser Function (JavaScript):**
```javascript
function parseConditionFromSKU(sku) {
  if (!sku) return 'unknown';

  const parts = sku.split('-');
  if (parts.length < 3) return 'unknown';

  const condition = parts[2].toLowerCase();

  if (condition === 'new' || condition === 'n') return 'new';
  if (condition === 'ref' || condition === 'refurbished' || condition === 'r') return 'refurbished';

  return 'unknown';
}
```

### Recommended Integration Approach

**Option 1: Pure SKU-Based (Recommended if SKUs are structured)**
- **Pros:** No additional fields needed, single source of truth
- **Cons:** Requires consistent SKU naming, limited flexibility
- **Implementation:** Add SKU parsing to Liquid templates and JavaScript

**Option 2: Metafield-Based (Recommended if flexible categorization needed)**
- **Pros:** Most flexible, supports complex conditions, Theme Editor friendly
- **Cons:** Requires metafield setup for all products
- **Implementation:** Add metafield definitions, update filtering logic

**Option 3: Tag-Based (Good middle ground)**
- **Pros:** Easy to bulk update, visual in admin, searchable
- **Cons:** Manual tagging required, can become cluttered
- **Implementation:** Add tag filtering to existing code

**Option 4: Hybrid (Most Robust)**
- Use SKU as primary source
- Use tags as fallback
- Use metafields for special cases
- **Implementation:** Layered checking in order of reliability

---

## Code Reference Map

### Key Variables Across Files

| Variable Name | Type | Scope | Purpose |
|--------------|------|-------|---------|
| `url_mode` | String | Section-level | Raw URL parameter value |
| `current_mode` | String | Section-level | Normalized mode ('new' or 'refurbished') |
| `featured_collection` | String | Section-level | Selected collection handle |
| `collection_products` | Array | Section-level | Products from selected collection |
| `active_menu` | Object | Section-level | Selected navigation menu |
| `preferredMode` | String | localStorage | Stored user preference |

### JavaScript Functions

| Function Name | Location | Purpose |
|--------------|----------|---------|
| `handleBrandClick()` | product-spotlight-carousel.liquid:1501 | Handles brand tab clicks |
| `loadCollectionProducts()` | product-spotlight-carousel.liquid:1549 | AJAX loads products from collection |
| `createProductCard()` | product-spotlight-carousel.liquid:1610 | Dynamically builds product card HTML |
| `formatMoney()` | product-spotlight-carousel.liquid:1690 | Formats prices for display |
| `restoreOriginalProducts()` | product-spotlight-carousel.liquid:1527 | Restores default collection view |
| `goToPage()` | product-spotlight-carousel.liquid:1389 | Carousel pagination |

### Liquid Snippets

| Snippet Name | Purpose | Parameters |
|-------------|---------|------------|
| `product-spotlight-card` | Renders individual product card | `product`, `show_rating`, `show_starting_at`, `show_new_price`, `section_id` |

### CSS Classes

| Class Name | Purpose | Location |
|-----------|---------|----------|
| `.mode-toggle-button` | Toggle button base styles | mode-toggle.liquid:66 |
| `.mode-toggle-button.active` | Active toggle state | mode-toggle.liquid:86 |
| `.spotlight-product-card` | Product card container | product-spotlight-carousel.liquid:798 |
| `.carousel-track` | Scrollable product container | product-spotlight-carousel.liquid:697 |
| `.brand-tab-button` | Brand filter button | product-spotlight-carousel.liquid:583 |

### Data Attributes

| Attribute | Values | Purpose |
|-----------|--------|---------|
| `data-mode` | 'new', 'refurbished' | Stores target mode for JS |
| `data-filter` | 'all', collection handle | Brand tab filter type |
| `data-collection` | Collection handle | Collection to load |
| `data-product-id` | Shopify product ID | Product identifier |
| `aria-pressed` | 'true', 'false' | Accessibility state |

---

## Configuration Schema

### Mode Toggle Settings

```json
{
  "name": "Mode Toggle",
  "settings": [
    {
      "type": "text",
      "id": "heading",
      "default": "Shop Our Products"
    },
    {
      "type": "text",
      "id": "new_label",
      "default": "Brand New"
    },
    {
      "type": "text",
      "id": "refurb_label",
      "default": "Refurbished"
    },
    {
      "type": "color_scheme",
      "id": "color_scheme"
    }
  ]
}
```

### Header Settings

```json
{
  "settings": [
    {
      "type": "link_list",
      "id": "menu",
      "default": "main-menu"
    },
    {
      "type": "text",
      "id": "menu_refurbished",
      "label": "Refurbished Menu Handle"
    }
  ]
}
```

### Product Spotlight Settings

```json
{
  "settings": [
    {
      "type": "collection",
      "id": "featured_collection",
      "label": "Product Collection"
    },
    {
      "type": "collection",
      "id": "featured_collection_refurbished",
      "label": "Refurbished Collection"
    },
    {
      "type": "checkbox",
      "id": "show_new_price_comparison",
      "default": false
    }
  ]
}
```

---

## Technical Constraints & Considerations

### Shopify Platform Limitations

1. **No server-side filtering by tags/metafields in Storefront API**
   - Must load full collection and filter client-side OR
   - Use separate collections OR
   - Implement custom app proxy endpoint

2. **Liquid template limitations**
   - Cannot make HTTP requests
   - Limited array manipulation
   - No regex support (must use string split/replace)

3. **Performance considerations**
   - Large collections (>250 products) require pagination
   - Client-side filtering adds processing time
   - Consider caching strategies

### Browser Compatibility

**Minimum Requirements:**
- ES6 JavaScript support (arrow functions, const/let, template literals)
- URLSearchParams API
- localStorage API
- Fetch API (for AJAX)

**Supported Browsers:**
- Chrome 51+
- Firefox 54+
- Safari 10.1+
- Edge 15+

### Accessibility Requirements

**Current Implementation:**
- `aria-pressed` attributes on toggle buttons
- Semantic HTML (`<button>`, `<article>`, `<nav>`)
- Focus states with outline
- Screen reader labels

**Maintained for SKU Integration:**
- All ARIA attributes must be preserved
- Focus management during dynamic updates
- Keyboard navigation support

---

## Testing Checklist for New Implementations

### Functional Testing

- [ ] Toggle switches between modes correctly
- [ ] URL parameter updates on toggle
- [ ] localStorage saves preference
- [ ] Page reload applies saved preference
- [ ] Menu switches in header
- [ ] Product collection switches
- [ ] Brand tabs work with new filtering
- [ ] Products display correct price based on mode
- [ ] Compare pricing shows for refurbished items
- [ ] Empty state shows when no products match

### Edge Cases

- [ ] No products in filtered collection
- [ ] Missing SKU on product
- [ ] Malformed SKU format
- [ ] Product in both new and refurbished
- [ ] localStorage unavailable (incognito mode)
- [ ] URL parameter manually modified
- [ ] Multiple mode parameters in URL
- [ ] Special characters in SKU

### Performance Testing

- [ ] Large collections (500+ products) load time
- [ ] Mobile scroll performance
- [ ] AJAX request timing
- [ ] Memory usage on repeated filtering
- [ ] Page load time with localStorage check

### Cross-Browser Testing

- [ ] Chrome (desktop & mobile)
- [ ] Safari (desktop & mobile)
- [ ] Firefox
- [ ] Edge
- [ ] Internet Explorer 11 (if required)

---

## Migration Path for SKU System

### Phase 1: Preparation
1. Audit all product SKUs for consistency
2. Define SKU structure standard
3. Document condition codes
4. Create test collection with mixed products

### Phase 2: Implementation
1. Add SKU parsing functions (Liquid & JavaScript)
2. Update `product-spotlight-carousel.liquid` filtering logic
3. Update `header.liquid` (if menu should change based on SKU)
4. Test with small subset of products

### Phase 3: Validation
1. Verify all products categorize correctly
2. Check edge cases (missing SKU, malformed data)
3. Performance test with full catalog
4. Cross-browser testing

### Phase 4: Deployment
1. Backup current theme
2. Deploy SKU-based version
3. Monitor for errors
4. Gradual rollout if possible

### Phase 5: Cleanup
1. Remove collection-based settings (optional)
2. Update documentation
3. Train content team on new system

---

## API Endpoints Used

### Shopify Collection Products API

**Endpoint:**
```
GET /collections/{collection-handle}/products.json
```

**Parameters:**
- `limit` - Number of products to return (max 250)
- `page` - Pagination offset

**Response Structure:**
```json
{
  "products": [
    {
      "id": 123456789,
      "title": "Product Name",
      "handle": "product-name",
      "price": "99.99",
      "compare_at_price": "129.99",
      "featured_image": "https://cdn.shopify.com/...",
      "images": [
        {
          "src": "https://cdn.shopify.com/..."
        }
      ],
      "variants": [
        {
          "id": 987654321,
          "title": "Default Title",
          "price": "99.99",
          "compare_at_price": "129.99",
          "sku": "DELL-XPS13-REF-16GB"
        }
      ],
      "tags": ["laptop", "dell", "refurbished"]
    }
  ]
}
```

---

## Summary for AI Implementation

### Current System Characteristics

**✅ Strengths:**
- Clean URL-based state management
- Persistent user preferences
- Global mode switching across site
- Accessible and responsive UI
- No external dependencies

**❌ Limitations for SKU Integration:**
- Hard-coded collection switching
- No product-level condition detection
- Manual collection management required
- Cannot filter by SKU patterns
- No dynamic categorization

### Required Changes for SKU System

**1. Minimal Changes (Keep Working):**
- Mode toggle UI → **No changes needed**
- URL parameter logic → **No changes needed**
- localStorage persistence → **No changes needed**
- CSS styling → **No changes needed**

**2. Must Update:**
- Product filtering logic in `product-spotlight-carousel.liquid`
- Collection selection logic
- JavaScript `loadCollectionProducts()` function
- Add SKU parsing utilities

**3. Recommended Additions:**
- SKU parsing function (Liquid)
- SKU parsing function (JavaScript)
- Fallback logic for missing/malformed SKUs
- Product condition validation
- Error handling for edge cases

### Integration Strategy

**Step-by-step implementation:**

1. **Add SKU parser to Liquid templates**
   ```liquid
   {% assign condition = product.variants.first.sku | parse_sku_condition %}
   ```

2. **Update collection filtering logic**
   ```liquid
   {% for product in all_products %}
     {% if product.condition == current_mode %}
       {% render 'product-spotlight-card', product: product %}
     {% endif %}
   {% endfor %}
   ```

3. **Update JavaScript for AJAX requests**
   ```javascript
   const filtered = products.filter(p => parseConditionFromSKU(p.variants[0].sku) === currentMode);
   ```

4. **Add error handling**
   ```liquid
   {% if product.condition == 'unknown' %}
     {%- comment -%} Handle products without valid SKU {%- endcomment -%}
   {% endif %}
   ```

5. **Test thoroughly with real product data**

---

## Document Revision History

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | 2025-11-27 | Initial comprehensive analysis created |

---

## Related Documentation

- [Shopify Liquid Reference](https://shopify.dev/docs/api/liquid)
- [Shopify Storefront API](https://shopify.dev/docs/api/storefront)
- [Theme Architecture Guide](CLAUDE.md)
- [Veena Theme Documentation](https://webibazaar.gitbook.io/veena-documentation)

---

**End of Document**
