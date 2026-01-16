# TASK-3: Offers Discovery Page

> **Status**: 🔴 NOT STARTED  
> **Estimate**: 8-12 hours  
> **Verify**: `shopify theme dev` → test `/pages/offers` or `/collections/offers`

---

## Goal

Build a dedicated offers discovery page where customers can browse all current deals, filtered by category and offer type. Integrates with Brand New/Renewed toggle system.

---

## Success Signals

```bash
shopify theme check                    # No errors
shopify theme dev                      # Start local server
```

Then verify:
- [ ] Offers page loads with category filter menu
- [ ] Products with `on-offer` tag display
- [ ] Offer badges show correct discount percentage
- [ ] Category filtering works (Smartphones, Laptops, etc.)
- [ ] Brand New / Renewed toggle filters offers correctly
- [ ] Flash sale items have distinct styling
- [ ] Price drop shows "was X, now Y" format
- [ ] Mobile (375px) — filter menu collapses/works
- [ ] Theme Editor — section settings functional

---

## Files to Create

```
templates/page.offers.json
sections/offers-hero.liquid
sections/offers-filter-menu.liquid
sections/offers-grid.liquid
snippets/offer-badge.liquid
snippets/offer-card.liquid
assets/offers.css
assets/offers.js
```

---

## Progress

| ID | Task | ✓ |
|----|------|---|
| 3A.1 | Main offers page template | ✅ |
| 3A.2 | Category filter menu | ⬜ |
| 3A.3 | 2-3 tier menu system | ⬜ |
| 3A.4 | Auto-expanding sections | ⬜ |
| 3B.1 | Standard offer badge (% off) | ⬜ |
| 3B.2 | Special/seasonal offer styling | ⬜ |
| 3B.3 | Price drop badge + tooltip | ⬜ |
| 3B.4 | Flash sale styling | ⬜ |
| 3B.5 | Main promo highlighting | ⬜ |
| 3C.1 | Tag-based offer detection | ⬜ |
| 3C.2 | Category-to-offer mapping | ⬜ |
| 3C.3 | Collection pulling per section | ⬜ |
| 3C.4 | Price drop calculation | ⬜ |
| 3C.5 | Toggle integration | ⬜ |

---

## Implementation

### 3A.1 — Main Offers Page Template

**Create `templates/page.offers.json`:**
```json
{
  "sections": {
    "hero": { "type": "offers-hero" },
    "filters": { "type": "offers-filter-menu" },
    "grid": { "type": "offers-grid" }
  },
  "order": ["hero", "filters", "grid"]
}
```

Then create a page in Shopify Admin → Pages → "Offers" with template `page.offers`.

**Create `sections/offers-hero.liquid`:**

Simple hero banner for the offers page.

Schema settings:
- `heading` (text, default: "Today's Offers")
- `subheading` (text)
- `background_color` (color)

**Verify:** Create page in admin, assign template, visit `/pages/offers`.

---

### 3A.2 — Category Filter Menu

**Create `sections/offers-filter-menu.liquid`:**

Horizontal filter bar with category buttons:
- All Offers (default)
- Smartphones
- Laptops
- Tablets
- Gaming PCs
- Accessories

Requirements:
- Buttons filter the grid below (via JS or defined by clicking/defined by defined)
- Active state styling
- Mobile: horizontal scroll or collapsible dropdown

Find existing filter patterns:
```bash
grep -r "filter" sections/ snippets/ | head -20
grep -r "facet" sections/ snippets/ | head -20
```

**Verify:** Click category → grid updates to show only that category.

---

### 3A.3 — 2-3 Tier Menu System

**Enhance `sections/offers-filter-menu.liquid`:**

Structure:
```
Level 1: Category (Smartphones, Laptops...)
Level 2: Brand (Apple, Samsung...) — optional
Level 3: Offer Type (Flash Sale, Clearance...) — optional
```

Implementation options:
1. Dropdown menus on hover/click
2. Accordion on mobile
3. Use schema blocks for merchant control

Schema:
```json
{
  "type": "category",
  "name": "Category",
  "settings": [
    { "type": "text", "id": "title", "label": "Category Name" },
    { "type": "collection", "id": "collection", "label": "Collection" }
  ]
}
```

---

### 3A.4 — Auto-Expanding Sections

**Add to `sections/offers-grid.liquid`:**

Logic: Only show category sections that have products with `on-offer` tag.

```liquid
{% for block in section.blocks %}
  {% assign collection = collections[block.settings.collection] %}
  {% assign has_offers = false %}
  
  {% for product in collection.products %}
    {% if product.tags contains 'on-offer' %}
      {% assign has_offers = true %}
      {% break %}
    {% endif %}
  {% endfor %}
  
  {% if has_offers %}
    <!-- Render section -->
  {% endif %}
{% endfor %}
```

---

### 3B.1 — Standard Offer Badge

**Create `snippets/offer-badge.liquid`:**

Accepts: `product` object

Calculate discount:
```liquid
{% if product.compare_at_price > product.price %}
  {% assign discount = product.compare_at_price | minus: product.price %}
  {% assign discount_percent = discount | times: 100.0 | divided_by: product.compare_at_price | round %}
  <span class="offer-badge offer-badge--discount">{{ discount_percent }}% OFF</span>
{% endif %}
```

Styling: Blue background, white text, rounded corners.

**Verify:** Product with compare_at_price shows badge with correct %.

---

### 3B.2 — Special/Seasonal Offers

**Enhance `snippets/offer-badge.liquid`:**

Check for special tags:
```liquid
{% if product.tags contains 'black-friday' %}
  <span class="offer-badge offer-badge--seasonal">Black Friday</span>
{% elsif product.tags contains 'boxing-day' %}
  <span class="offer-badge offer-badge--seasonal">Boxing Day Sale</span>
{% elsif product.tags contains 'clearance' %}
  <span class="offer-badge offer-badge--clearance">Clearance</span>
{% endif %}
```

Schema setting to define seasonal promotion name globally.

---

### 3B.3 — Price Drop Badge + Tooltip

**Enhance `snippets/offer-badge.liquid`:**

```liquid
{% if product.tags contains 'price-drop' %}
  <span class="offer-badge offer-badge--price-drop" 
        data-tooltip="Price reduced from {{ product.compare_at_price | money }}">
    Price Drop
  </span>
{% endif %}
```

**Add to `assets/offers.js`:**
- Tooltip on hover (CSS or JS)
- Show "Lowest price in 30 days" messaging

---

### 3B.4 — Flash Sale Styling

**Enhance `snippets/offer-badge.liquid` and `snippets/offer-card.liquid`:**

```liquid
{% if product.tags contains 'flash-sale' %}
  {% assign is_flash_sale = true %}
{% endif %}
```

Flash sale card treatment:
- Animated border or glow effect
- "⚡ Flash Sale" badge
- Optional countdown timer (if end date in metafield)

**Add to `assets/offers.css`:**
```css
.offer-card--flash-sale {
  border: 2px solid var(--color-accent);
  animation: pulse 2s infinite;
}
```

---

### 3B.5 — Main Promo Highlighting

**Add to `sections/offers-grid.liquid`:**

First product (or tagged `featured-offer`) gets larger card treatment:

```liquid
{% for product in collection.products %}
  {% if forloop.first or product.tags contains 'featured-offer' %}
    {% render 'offer-card', product: product, featured: true %}
  {% else %}
    {% render 'offer-card', product: product %}
  {% endif %}
{% endfor %}
```

Featured card: spans 2 columns on desktop, larger image.

---

### 3C.1 — Tag-Based Offer Detection

**Create `snippets/offer-card.liquid`:**

Only render if product has offer tag:
```liquid
{% unless product.tags contains 'on-offer' %}
  {% break %}
{% endunless %}

<!-- Rest of card markup -->
{% render 'offer-badge', product: product %}
```

---

### 3C.2 — Category-to-Offer Mapping

**Schema for `sections/offers-grid.liquid`:**

```json
{
  "blocks": [
    {
      "type": "category_section",
      "name": "Category Section",
      "settings": [
        { "type": "text", "id": "heading", "label": "Section Heading" },
        { "type": "collection", "id": "collection", "label": "Collection" },
        { "type": "range", "id": "products_to_show", "min": 4, "max": 12, "default": 8 }
      ]
    }
  ]
}
```

Merchant adds blocks for each category they want to feature.

---

### 3C.3 — Automated Collection Pulling

**In `sections/offers-grid.liquid`:**

```liquid
{% for block in section.blocks %}
  {% assign collection = collections[block.settings.collection] %}
  
  <div class="offers-section" data-category="{{ block.settings.heading | handleize }}">
    <h2>{{ block.settings.heading }}</h2>
    
    <div class="offers-grid">
      {% for product in collection.products limit: block.settings.products_to_show %}
        {% if product.tags contains 'on-offer' %}
          {% render 'offer-card', product: product %}
        {% endif %}
      {% endfor %}
    </div>
  </div>
{% endfor %}
```

---

### 3C.4 — Price Drop Calculation

**Enhance `snippets/offer-card.liquid`:**

Display was/now pricing:
```liquid
{% if product.compare_at_price > product.price %}
  <div class="offer-card__pricing">
    <span class="offer-card__price-was">Was {{ product.compare_at_price | money }}</span>
    <span class="offer-card__price-now">Now {{ product.price | money }}</span>
    <span class="offer-card__savings">Save {{ product.compare_at_price | minus: product.price | money }}</span>
  </div>
{% endif %}
```

---

### 3C.5 — Toggle Integration

**CRITICAL: Read CLAUDE.md section "Toggle Filtering System" first.**

**Add to `sections/offers-grid.liquid`:**

Inline the mode detection (don't use render for variables):
```liquid
{%- liquid
  assign current_mode = 'brand-new'
  assign url_string = request.url | downcase

  if url_string contains 'mode=renewed'
    assign current_mode = 'renewed'
  elsif url_string contains 'mode=brand-new'
    assign current_mode = 'brand-new'
  endif
-%}
```

Then filter products in the loop:
```liquid
{% for product in collection.products %}
  {% assign show_product = false %}
  
  {% if product.tags contains current_mode %}
    {% assign show_product = true %}
  {% endif %}
  
  {% if show_product and product.tags contains 'on-offer' %}
    {% render 'offer-card', product: product %}
  {% endif %}
{% endfor %}
```

Add toggle UI component (reference existing `sections/mode-toggle.liquid`).

**Verify:** Toggle between Brand New / Renewed → offers grid updates.

---

## Verification Commands

```bash
shopify theme check

# Test URLs:
# /pages/offers (main offers page)
# /pages/offers?mode=renewed (toggle test)
# /pages/offers?category=smartphones (filter test)
```

---

## Dependencies

- Products must have `on-offer` tag to appear
- Products should have `compare_at_price` set for discount calculation
- Optional tags: `flash-sale`, `price-drop`, `featured-offer`, `black-friday`
- Products need `brand-new` or `renewed` tag for toggle filtering

---

## Notes

- Reuse existing `card-product.liquid` patterns where possible: `grep -r "card-product" snippets/`
- Check existing badge styling: `grep -r "badge" assets/*.css`
- Toggle system is documented in CLAUDE.md — follow that pattern exactly

---

## Completion Checklist

```bash
shopify theme check   # Must pass
```

- [ ] All subtasks marked ✅
- [ ] Category filtering works
- [ ] Toggle filtering works
- [ ] Mobile tested (375px)
- [ ] Desktop tested (1200px)
- [ ] Theme Editor — blocks and settings work
- [ ] No console errors

Update status to 🟢 COMPLETE when done.
