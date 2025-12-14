# Veena Theme - AI Context Reference

**Version**: 2.0.2
**Developer**: Webibazaar
**Type**: Shopify Theme
**Architecture**: Liquid templates, Web Components, Vanilla JS, Modular CSS

---

## Quick Stats

- **77 sections** (customizable content blocks)
- **132 snippets** (reusable components)
- **39 JavaScript files** (Web Components + utilities)
- **86 CSS files** (component/section-scoped)
- **34 templates** (page layouts)
- **26 languages** supported

---

## Directory Structure

```
theme-test-2-upd/
├── sections/          # Dynamic content blocks (Theme Editor)
├── snippets/          # Reusable Liquid components
├── templates/         # Page-level JSON composition files
├── assets/           # JS, CSS, images
├── config/           # Theme settings (schema + data)
├── layout/           # Base HTML templates
├── locales/          # Translation files
└── blocks/           # Custom/AI-generated blocks
```

---

## Key File Patterns

### Sections (`.liquid` in `sections/`)
- **Main sections**: `main-product.liquid`, `main-collection.liquid`, `main-cart-items.liquid`
- **Special sections**: `header.liquid`, `footer.liquid`, `cart-drawer.liquid`
- **Content sections**: `hero-banner.liquid`, `featured-product.liquid`, `counter.liquid`
- **Custom sections**: `age-verification.liquid`, `countdown-timer.liquid`, `lookbook.liquid`

### Snippets (`.liquid` in `snippets/`)
- **Product**: `card-product.liquid`, `product-media-gallery.liquid`, `buy-buttons.liquid`
- **Cart**: `cart-notification.liquid`, `quantity-input.liquid`
- **UI**: `breadcrumbs.liquid`, `pagination.liquid`, `loading-spinner.liquid`
- **Icons**: `icon-cart.liquid`, `icon-search.liquid`, `icon-close.liquid` (60+ icon snippets)

### JavaScript (`.js` in `assets/`)
- **Core**: `global.js`, `pubsub.js`, `constants.js`
- **Components**: `product-form.js`, `cart-drawer.js`, `media-gallery.js`
- **Features**: `predictive-search.js`, `facets.js`, `animations.js`

### CSS (`.css` in `assets/`)
- **Base**: `base.css`
- **Components**: `component-cart.css`, `component-product-variant-picker.css`
- **Sections**: `section-main-product.css`, `section-footer.css`

---

## Liquid Template Structure

### Section Anatomy
```liquid
{{ 'section-name.css' | asset_url | stylesheet_tag }}

{%- style -%}
.section-{{ section.id }}-padding {
  padding-top: {{ section.settings.padding_top }}px;
  padding-bottom: {{ section.settings.padding_bottom }}px;
}
{%- endstyle -%}

<div class="section-{{ section.id }}-padding color-{{ section.settings.color_scheme }}">
  {%- unless section.settings.heading == blank -%}
    <h2>{{ section.settings.heading }}</h2>
  {%- endunless -%}

  {% for block in section.blocks %}
    <div>{{ block.settings.content }}</div>
  {% endfor %}
</div>

{% schema %}
{
  "name": "Section Name",
  "tag": "section",
  "class": "section",
  "settings": [
    {
      "type": "inline_richtext",
      "id": "heading",
      "label": "Heading",
      "default": "Title"
    },
    {
      "type": "color_scheme",
      "id": "color_scheme",
      "label": "Color scheme"
    },
    {
      "type": "range",
      "id": "padding_top",
      "min": 0,
      "max": 100,
      "step": 4,
      "unit": "px",
      "label": "Top padding",
      "default": 60
    }
  ],
  "blocks": [
    {
      "type": "item",
      "name": "Item",
      "settings": [...]
    }
  ],
  "presets": [
    {
      "name": "Section Name",
      "blocks": [{"type": "item"}]
    }
  ]
}
{% endschema %}
```

### Common Schema Setting Types
- `text` - Single-line text input
- `inline_richtext` - Rich text (inline)
- `richtext` - Multi-line rich text
- `image_picker` - Image selector
- `color_scheme` - Color scheme selector
- `range` - Numeric slider (min/max/step)
- `select` - Dropdown options
- `checkbox` - Boolean toggle
- `url` - Link picker
- `video_url` - Video URL
- `header` - Visual separator

### Accessing Settings
```liquid
{{ section.settings.heading }}
{{ block.settings.text }}
{{ settings.logo }}  <!-- Global theme setting -->
```

### Common Liquid Filters
```liquid
{{ 'style.css' | asset_url | stylesheet_tag }}
{{ 'script.js' | asset_url | script_tag }}
{{ product.featured_image | image_url: width: 800 }}
{{ 'cart.add_to_cart' | t }}  <!-- Translation -->
{{ section.settings.padding_top | times: 0.5 | round: 0 }}
```

---

## JavaScript Architecture

### Web Components Pattern
```javascript
if (!customElements.get('component-name')) {
  customElements.define('component-name', class ComponentName extends HTMLElement {
    constructor() {
      super();
      this.setupEventListeners();
    }

    connectedCallback() {
      // Called when element is added to DOM
    }

    disconnectedCallback() {
      // Cleanup (unsubscribe from events)
      this.unsubscriber?.();
    }

    setupEventListeners() {
      this.querySelector('button').addEventListener('click', this.handleClick.bind(this));
    }

    handleClick(event) {
      event.preventDefault();
      // Handle interaction
    }
  });
}
```

### Pub/Sub Event System
```javascript
// Publishing events (in pubsub.js)
publish(PUB_SUB_EVENTS.cartUpdate, {
  source: 'product-form',
  cartData: response
});

// Subscribing to events
this.unsubscriber = subscribe(PUB_SUB_EVENTS.cartUpdate, (event) => {
  if (event.source === 'product-form') return; // Ignore own updates
  this.onCartUpdate();
});

// Cleanup
this.unsubscriber(); // Call in disconnectedCallback
```

### Event Types (in `constants.js`)
- `PUB_SUB_EVENTS.cartUpdate`
- `PUB_SUB_EVENTS.quantityUpdate`
- `PUB_SUB_EVENTS.variantChange`
- `PUB_SUB_EVENTS.cartError`
- `PUB_SUB_EVENTS.optionValueSelectionChange`

### Global Utilities (in `global.js`)
- `getFocusableElements(container)` - Get focusable elements
- `SectionId.parseId(qualifiedId)` - Parse section ID from `template--123__main`
- `HTMLUpdateUtility.viewTransition(oldNode, newContent)` - Smooth DOM updates
- `trapFocus(container)` - Focus trap for modals

### Key Components
- **product-form** - Add to cart with section rendering
- **cart-drawer** - Slide-out cart
- **cart-items** - Cart quantity management
- **product-info** - Variant selection, URL updates
- **media-gallery** - Product image gallery
- **predictive-search** - Search suggestions

---

## CSS Patterns

### Scoped Styles
```liquid
{%- style -%}
.section-{{ section.id }}-padding {
  padding-top: {{ section.settings.padding_top }}px;
}
{%- endstyle -%}
```

### CSS Variables (from theme.liquid)
```css
:root {
  --color-background: {{ settings.colors_background }};
  --font-body-family: {{ settings.type_body_font.family }};
  --spacing-sections-desktop: {{ settings.spacing_sections }}rem;
}
```

### Common Classes
- `page-width` - Container with max-width
- `color-{{ section.settings.color_scheme }}` - Color scheme
- `gradient` - Background gradient
- `section-{{ section.id }}-padding` - Dynamic padding
- `grid`, `grid__item` - Grid layout
- `loading-overlay__spinner` - Loading state

---

## Common Naming Conventions

### Files
- Sections: `main-product.liquid`, `featured-collection.liquid`
- Snippets: `card-product.liquid`, `icon-cart.liquid`
- JavaScript: `product-form.js`, `cart-drawer.js`
- CSS: `component-cart.css`, `section-main-product.css`

### IDs & Classes
- Section IDs: `section-{{ section.id }}`
- Qualified IDs: `template--123__main` (template ID + section name)
- BEM-like: `product-card__title`, `cart-drawer__items`

### Settings
- `heading`, `heading_size`, `heading_color_scheme`
- `padding_top`, `padding_bottom`
- `color_scheme`, `background_color`
- `columns_desktop`, `columns_mobile`
- `image`, `image_mobile`

---

## Important Patterns

### Section Rendering (AJAX Cart Updates)
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

### Rendering Snippets
```liquid
{% render 'snippet-name', param: value, product: product %}
```

### Including Assets
```liquid
{{ 'component-cart.css' | asset_url | stylesheet_tag }}
{{ 'cart-drawer.js' | asset_url | script_tag }}
```

### Responsive Padding
```liquid
{%- style -%}
.section-{{ section.id }}-padding {
  padding-top: {{ section.settings.padding_top }}px;
  padding-bottom: {{ section.settings.padding_bottom }}px;
}
@media screen and (max-width: 991px) {
  .section-{{ section.id }}-padding {
    padding-top: {{ section.settings.padding_top | times: 0.5 | round: 0 }}px;
    padding-bottom: {{ section.settings.padding_bottom | times: 0.5 | round: 0 }}px;
  }
}
{%- endstyle -%}
```

---

## Global Variables (set in `theme.liquid`)

```javascript
window.shopUrl         // Store origin
window.routes          // Cart/search API URLs (cart_add_url, cart_update_url, etc.)
window.cartStrings     // Translated cart messages
window.variantStrings  // Translated product messages
```

---

## Localization

### Translation Files
- `locales/en.default.json` - UI strings
- `locales/en.default.schema.json` - Theme Editor labels

### Using Translations
```liquid
{{ 'products.product.add_to_cart' | t }}
{{ 'general.search.placeholder' | t }}
```

```javascript
window.cartStrings.addToCart
window.variantStrings.soldOut
```

---

## Development Notes

- **No build system** - Pure Liquid, vanilla JS, no npm/webpack
- **Testing** - Use Shopify CLI (`shopify theme dev`) or upload to Shopify Admin
- **Section rendering** - Most components use AJAX to update multiple areas after cart/variant changes
- **Accessibility** - Focus trapping in modals, ARIA attributes, keyboard navigation
- **Image zoom** - Three modes: hover (magnify.js), lightbox (PhotoSwipe), click (modal)

---

## When Creating New Features

### For a New Section:
1. Create `sections/my-section.liquid`
2. Include CSS: `{{ 'my-section.css' | asset_url | stylesheet_tag }}`
3. Include JS if needed: `{{ 'my-section.js' | asset_url | script_tag }}`
4. Add {% schema %} with settings, blocks, presets
5. Use `section.settings.*` to access values
6. Use `section.id` for unique classes/IDs

### For a New Component (Web Component):
1. Create `assets/my-component.js`
2. Define with `customElements.define('my-component', class ...)`
3. Use pub/sub for cross-component communication
4. Subscribe to events in constructor, unsubscribe in disconnectedCallback
5. Reference in Liquid: `<my-component></my-component>`

### For Styling:
1. Create `assets/component-my-component.css` or `assets/section-my-section.css`
2. Use CSS variables from `:root` for theming
3. Scope styles to avoid conflicts
4. Follow BEM-like naming

---

## File Locations Reference

**Project Root**: `A:\ISAAC - RETAINER WORK\theme-testing-2-updated\theme-test-2-upd\`

### Common Files to Reference:
- Counter section (example): `sections/counter.liquid`
- Main product page: `sections/main-product.liquid`
- Header: `sections/header.liquid`
- Cart drawer: `sections/cart-drawer.liquid`
- Product form handler: `assets/product-form.js`
- Cart handler: `assets/cart-drawer.js`
- Global utilities: `assets/global.js`
- Pub/sub system: `assets/pubsub.js`
- Constants: `assets/constants.js`
- Base styles: `assets/base.css`
- Main layout: `layout/theme.liquid`
- Theme settings: `config/settings_schema.json`

---

---

## Product Spotlight Carousel - Deep Dive

**File**: `sections/product-spotlight-carousel.liquid` (2845 lines)
**Snippet**: `snippets/product-spotlight-card.liquid` (167 lines)
**CSS**: Embedded in section file (~1500 lines of styles)
**Alternative CSS**: `assets/sponsored-product.css` (229 lines - different section)
**JavaScript**: Embedded in section file (~1200 lines)

### Purpose
A complex carousel section for displaying products with brand-based filtering. Designed to look like Back Market's product showcase. Features:
- Two-column layout (hero image + carousel) or single column
- Brand tab navigation with logo support
- SKU-based product filtering (Brand New vs Refurbished modes)
- AJAX-loaded collections via Shopify API
- Responsive with mobile swipe gestures
- Dynamic product card generation

### Core Dependencies

#### Required Snippets
- **product-spotlight-card.liquid** - Renders individual product cards
  - Params: `product`, `show_rating`, `show_starting_at`, `show_new_price`, `section_id`
  - Displays: product image, color swatches, title, specs, star rating, pricing

#### Required External Scripts
- **sku-parser.liquid** - Parses SKU format to extract condition codes
  - Used for filtering products by condition (NEW, REFA, REFB, REFC)
  - Provides `window.LooptechSKU.filterByMode()` function

#### Optional Metafields (Product)
- `product.metafields.custom.specs` - Product specifications text
- `product.metafields.reviews.rating.value` - Star rating (e.g., 4.5)
- `product.metafields.reviews.rating_count.value` - Number of reviews

### Section Structure

```liquid
{%- comment -%} Mode detection (URL param ?mode=new or ?mode=refurbished) -%}
{%- comment -%} Settings assignment with defaults -%}
{%- comment -%} Product collection selection based on mode -%}

<div class="product-spotlight-section" data-desktop-layout="..." data-mobile-layout="...">
  <div class="spotlight-container">
    <div class="spotlight-layout"> <!-- Grid: hero + carousel -->

      <!-- Left/Right Column: Hero Image -->
      <div class="hero-column">
        <img src="{{ hero_image }}" />
      </div>

      <!-- Right/Left Column: Carousel -->
      <div class="carousel-column">

        <!-- Section Heading -->
        <h2>{{ section_heading }}</h2>

        <!-- Brand Navigation Tabs -->
        <div class="brand-navigation">
          {% for block in section.blocks %}
            <button class="brand-tab-button" data-collection="...">
              <img src="{{ block.settings.brand_logo }}" />
              <span>{{ block.settings.brand_name }}</span>
            </button>
          {% endfor %}
        </div>

        <!-- Carousel Container -->
        <div class="carousel-wrapper">
          <button class="carousel-arrow carousel-arrow--prev">←</button>
          <button class="carousel-arrow carousel-arrow--next">→</button>

          <div class="carousel-track-container">
            <div class="carousel-track" data-mode="{{ current_mode }}">
              {% for product in collection_products %}
                {% render 'product-spotlight-card', product: product, ... %}
              {% endfor %}
            </div>
            <div class="carousel-fade-overlay"></div> <!-- Gradient fade -->
          </div>

          <div class="carousel-dots"></div> <!-- Pagination dots -->
        </div>

      </div>
    </div>
  </div>
</div>

<style>
  /* ~1500 lines of embedded CSS */
  /* Scoped with #shopify-section-{{ section.id }} */
</style>

<script>
  /* ~1200 lines of vanilla JavaScript */
  /* IIFE: handles carousel navigation, brand tabs, AJAX loading */
</script>
```

### Schema Settings (60+ Settings!)

#### Layout Settings
- **left_column_width** (range: 20-50%, default: 30%) - Width of hero column
- **hero_position** (select: left/right, default: left) - Hero image placement
- **section_height** (range: 400-900px, default: 600px) - Overall carousel height

#### Content Settings
- **section_heading** (text, default: "Top brands, refurbished") - Main heading
- **hero_image** (image_picker) - Lifestyle/background image
- **featured_collection** (collection) - Main product collection
- **featured_collection_refurbished** (collection) - Refurbished mode collection

#### Desktop Layout
- **desktop_column_layout** (select: two-column/single-column, default: two-column)
- **desktop_show_hero** (checkbox, default: true) - Show/hide hero image
- **desktop_products_per_view** (range: 2-5, default: 3) - Cards visible at once

#### Mobile Layout
- **mobile_column_layout** (select: two-column/single-column, default: single-column)
- **mobile_show_hero** (checkbox, default: false) - Show/hide hero on mobile

#### Mobile Card Customization (8 settings)
- **mobile_card_width_percent** (range: 10-100%, default: 70%) - Card width for peek effect
- **mobile_card_height** (range: 200-900px, default: 420px) - Card height
- **mobile_product_image_height** (range: 100-600px, default: 250px) - Image height
- **mobile_card_spacing** (range: 8-32px, default: 16px) - Gap between cards
- **mobile_card_padding** (range: 8-24px, default: 12px) - Internal padding
- **mobile_nav_tab_height** (range: 28-48px, default: 36px)
- **mobile_nav_tab_padding** (range: 8-24px, default: 16px)
- **mobile_nav_tab_spacing** (range: 4-16px, default: 8px)
- **mobile_nav_icon_size** (range: 14-24px, default: 18px)

#### Desktop Brand Tab Customization (9 settings)
- **desktop_tab_width** (range: 80-200px, default: 120px)
- **desktop_tab_height** (range: 60-150px, default: 90px)
- **desktop_tab_logo_size** (range: 30-120px, default: 70px)
- **desktop_tab_text_position** (select: inside/below, default: inside)
- **desktop_tab_text_size** (range: 10-20px, default: 14px)
- **desktop_tab_gap** (range: 8-48px, default: 24px) - Spacing between tabs
- **desktop_tab_border_radius** (range: 0-32px, default: 16px)

#### Desktop Navigation Bar Container (8 settings)
- **desktop_nav_bar_padding_top** (range: 0-60px, default: 10px)
- **desktop_nav_bar_padding_bottom** (range: 0-60px, default: 12px)
- **desktop_nav_bar_padding_left** (range: 0-60px, default: 0px)
- **desktop_nav_bar_padding_right** (range: 0-60px, default: 12px)
- **desktop_nav_bar_margin_top** (range: 0-80px, default: 10px)
- **desktop_nav_bar_margin_bottom** (range: 0-80px, default: 20px)
- **desktop_nav_bar_margin_left** (range: 0-80px, default: 24px)
- **desktop_nav_bar_margin_right** (range: 0-80px, default: 24px)

#### Display Settings
- **products_limit** (range: 4-24, default: 12) - Max products to show
- **show_ratings** (checkbox, default: true) - Display star ratings
- **show_starting_at_text** (checkbox, default: true) - "Starting at" label
- **show_new_price_comparison** (checkbox, default: false) - Show crossed-out "New" price

#### Style Settings
- **carousel_background_color** (color, default: #ffffff)
- **brand_logo_size** (range: 40-80px, default: 64px) - ⚠️ May be unused/redundant

### Blocks
- **brand_tab** (limit: 10)
  - **brand_logo** (image_picker) - Brand logo image
  - **brand_name** (text) - Brand display name
  - **collection** (collection) - Linked collection for filtering

### JavaScript Functionality

#### Key Functions
1. **init()** - Initialize carousel, setup events, create initial dots
2. **loadCollectionProducts(collectionHandle)** - AJAX fetch products from Shopify API
   - Fetches 3x products_limit to account for SKU filtering
   - Filters by mode (new/refurbished) using `window.LooptechSKU`
   - Dynamically creates product cards
3. **createProductCard(product)** - Build HTML matching snippet structure
4. **handleBrandClick(event)** - Switch active brand tab, load collection
5. **goToPage(pageIndex)** - Navigate carousel pages
6. **updateNavigationState()** - Enable/disable prev/next arrows
7. **createDots()** - Generate pagination dots
8. **formatMoney(price)** - Format prices (handles cents or decimal formats)

#### Event Handlers
- **Prev/Next arrows** - Page navigation
- **Brand tabs** - Collection switching with active state
- **Touch gestures** - Swipe left/right on mobile
- **Scroll events** - Update fade overlay, snap to cards on mobile

#### Global Variables Exposed
- Uses `window.LooptechSKU.filterByMode(products, mode)` for SKU filtering

### Known Issues & Bloat

#### Typo in Code
- **Line 36**: `section.settsings.section_height` (should be `section.settings`)
  - Variable is assigned but likely never used due to typo

#### Potentially Unused/Redundant Settings
Based on code analysis, these settings may not work or be redundant:

1. **brand_logo_size** - Defined in schema but doesn't appear to be used in styles
2. **section_height** - Has a typo preventing it from working (`settsings` instead of `settings`)
3. **desktop_products_per_view** - Defined but unclear if properly implemented in grid logic
4. **carousel_background_color** - Set as variable but may not be applied correctly

#### Excessive Settings
The section has **60+ schema settings**, many providing micro-level control that could be simplified:
- 8 desktop navigation bar padding/margin settings (could be consolidated)
- 8 mobile customization settings (could use presets)
- Duplicate/overlapping controls for desktop vs mobile

#### CSS Bloat
- ~1500 lines of CSS embedded in the section file
- Could be extracted to `assets/product-spotlight-carousel.css`
- Extensive media queries with repeated patterns
- Many highly-specific selectors using `#shopify-section-{{ section.id }}`

#### JavaScript Complexity
- ~1200 lines of vanilla JS embedded in section
- Could be extracted to `assets/product-spotlight-carousel.js`
- Complex carousel logic with touch gestures, AJAX, dynamic rendering
- No error boundaries or graceful degradation

### Common Modifications

#### To Clean Up This Section:
1. **Fix the typo** on line 36: `section.settsings` → `section.settings`
2. **Extract CSS** to `assets/product-spotlight-carousel.css`
3. **Extract JavaScript** to `assets/product-spotlight-carousel.js`
4. **Remove unused settings**:
   - Remove `brand_logo_size` (or implement it properly)
   - Remove redundant nav bar settings (consolidate to single padding/margin)
   - Simplify mobile customization (use responsive CSS instead)
5. **Consolidate desktop tab settings** - Too granular, create presets instead
6. **Test section_height setting** - Currently broken, either fix or remove
7. **Add loading states** - Better UX during AJAX requests
8. **Add error handling** - For failed API requests

#### To Modify Product Cards:
- Edit `snippets/product-spotlight-card.liquid`
- CSS classes: `.spotlight-product-card`, `.spotlight-card-image`, `.spotlight-card-info`
- Inline styles in section file starting around line 1000

#### To Change Carousel Behavior:
- JavaScript embedded in section file (starts around line 800)
- Key variables: `currentPage`, `itemsPerPage`, `totalPages`
- Navigation: `goToPage()`, `updateNavigationState()`

#### To Add New Brand Tabs:
1. In Theme Editor, add new "Brand Tab" block
2. Upload brand logo
3. Set brand name
4. Link to collection
5. JavaScript auto-detects and adds event listeners

### File Paths
- **Section**: `sections/product-spotlight-carousel.liquid`
- **Snippet**: `snippets/product-spotlight-card.liquid`
- **SKU Parser**: `snippets/sku-parser.liquid` (dependency)
- **Related CSS**: `assets/sponsored-product.css` (different section, but similar purpose)

### Optimization Recommendations

**Priority 1 - Critical Fixes:**
- Fix typo: `section.settsings` → `section.settings` (line 36)
- Test and verify all settings actually work
- Add error handling for AJAX requests

**Priority 2 - Code Organization:**
- Extract CSS to external file
- Extract JavaScript to external file
- Remove unused CSS selectors
- Reduce selector specificity

**Priority 3 - Schema Cleanup:**
- Remove or consolidate navigation bar padding/margin settings (8 → 2)
- Remove mobile card customization settings if responsive CSS can handle
- Test and remove unused `brand_logo_size` setting
- Create setting presets instead of granular controls

**Priority 4 - Performance:**
- Lazy load product images properly
- Debounce scroll events
- Use Intersection Observer for fade overlay
- Cache AJAX responses

**Priority 5 - Accessibility:**
- Add ARIA labels to carousel controls
- Ensure keyboard navigation works
- Add focus states to brand tabs
- Announce page changes to screen readers

---

## Summary

This is a production-ready Shopify theme using:
- **Liquid templating** for dynamic content
- **Web Components** for interactive features
- **Pub/Sub pattern** for component communication
- **Section-based architecture** for Theme Editor customization
- **Modular CSS** with component/section scoping
- **Vanilla JavaScript** (no framework dependencies)

When generating prompts, reference specific file paths, section/snippet names, setting IDs, and component names from this context to maximize precision and effectiveness.
