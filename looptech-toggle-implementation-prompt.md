# Claude Code Implementation Prompt: Looptech Brand New/Refurbished Toggle System

**Target Model:** Claude Opus 4.5 via Claude Code  
**Project:** Looptech Shopify Store - Global Product Toggle Feature  
**Client:** Isaac Hussain (Looptech Tech Resale)  
**Developer:** Nomaan Akram (NakoLabs)

---

## 🎯 PROJECT OBJECTIVE

Implement a **global site-wide toggle system** that allows customers to seamlessly switch between viewing **Brand New** and **Refurbished** products across the entire Looptech Shopify store. The system must leverage the client's **structured SKU format** to intelligently categorise, filter, and display products based on their condition.

---

## 📚 CRITICAL: REFERENCE DOCUMENTATION

Before writing ANY code, you MUST read and thoroughly understand these files in order:

### 1. System Analysis Document (READ FIRST)
**File:** `BRAND-NEW-REFURBISHED-SYSTEM-ANALYSIS.md`

This document contains:
- Complete technical analysis of the current toggle implementation
- Mode detection patterns using URL parameters and localStorage
- File structure and dependency graph
- JavaScript and Liquid code patterns already in use
- Integration points specifically designed for SKU-based systems
- Migration path from collection-based to SKU-based filtering

**Key sections to internalise:**
- "Current Implementation Architecture" (lines 44-75)
- "Mode Toggle Component" (lines 115-284)
- "Integration Points for SKU-Based Systems" (lines 822-900)
- "Required Changes for SKU System" (lines 1151-1169)

### 2. SKU Structure Reference
**File:** `sku-generator.jsx` (React component in project files)

This defines the EXACT SKU format the client uses:
```
BRAND-MODEL-CAPACITY-CONDITION-COLOR-SEQUENCE
```

**Condition Codes (4th segment - CRITICAL for filtering):**
| Code | Meaning | Toggle Mode |
|------|---------|-------------|
| `NEW` | Brand New | `new` |
| `REFA` | Refurbished Grade A | `refurbished` |
| `REFB` | Refurbished Grade B | `refurbished` |
| `REFC` | Refurbished Grade C | `refurbished` |

**Example SKUs:**
- `APPL-IPH14P-256-NEW-GRA-001` → Brand New iPhone 14 Pro
- `APPL-IPH14P-256-REFA-GRA-002` → Refurbished Grade A iPhone 14 Pro
- `DELL-XPS15-512-REFB-SIL-001` → Refurbished Grade B Dell XPS 15

### 3. Backend Setup Guide
**File:** `backend-setup-guide.md`

Contains:
- Product setup patterns with variants for each condition
- Tag structure requirements
- Collection configuration (automated collections)
- Menu structure (parallel main-menu and refurbished-menu)

### 4. Client Setup Documentation
**File:** `client-side-setup-documentation.md`

Contains:
- Collection naming conventions and handles
- Menu creation process
- Handle rules (lowercase, hyphens, no special characters)

### 5. Theme Architecture
**File:** `CLAUDE.md`

Contains:
- Veena theme v2.0.2 architecture
- Web Components pattern
- pubsub.js event system
- Global JavaScript utilities

---

## 🔧 IMPLEMENTATION REQUIREMENTS

### A. SKU Parsing System

Create a **centralised SKU parsing system** that can be used across both Liquid templates and JavaScript:

#### 1. Liquid SKU Parser Snippet
Create: `snippets/sku-parser.liquid`

```liquid
{% comment %}
  SKU Parser for Looptech Products
  
  Input: sku (string) - Product variant SKU
  Output Variables:
    - sku_brand (e.g., "APPL")
    - sku_model (e.g., "IPH14P")
    - sku_capacity (e.g., "256")
    - sku_condition (e.g., "NEW", "REFA", "REFB", "REFC")
    - sku_color (e.g., "GRA")
    - sku_sequence (e.g., "001")
    - sku_mode (e.g., "new" or "refurbished")
    - sku_is_valid (boolean)
  
  Usage:
    {% render 'sku-parser', sku: variant.sku %}
    {% if sku_mode == current_mode %}
      <!-- Show product -->
    {% endif %}
{% endcomment %}

{%- liquid
  assign sku_parts = sku | split: '-'
  assign sku_parts_count = sku_parts | size
  
  if sku_parts_count >= 6
    assign sku_brand = sku_parts[0]
    assign sku_model = sku_parts[1]
    assign sku_capacity = sku_parts[2]
    assign sku_condition = sku_parts[3]
    assign sku_color = sku_parts[4]
    assign sku_sequence = sku_parts[5]
    assign sku_is_valid = true
    
    # Determine mode from condition code
    if sku_condition == 'NEW'
      assign sku_mode = 'new'
    elsif sku_condition == 'REFA' or sku_condition == 'REFB' or sku_condition == 'REFC'
      assign sku_mode = 'refurbished'
    else
      assign sku_mode = 'unknown'
    endif
  else
    assign sku_is_valid = false
    assign sku_mode = 'unknown'
  endif
-%}
```

#### 2. JavaScript SKU Parser Module
Create: `assets/sku-parser.js`

```javascript
/**
 * Looptech SKU Parser Module
 * 
 * SKU Format: BRAND-MODEL-CAPACITY-CONDITION-COLOR-SEQUENCE
 * 
 * Condition Codes:
 *   NEW  = Brand New → mode: 'new'
 *   REFA = Refurbished Grade A → mode: 'refurbished'
 *   REFB = Refurbished Grade B → mode: 'refurbished'
 *   REFC = Refurbished Grade C → mode: 'refurbished'
 */

const LooptechSKU = {
  // Condition code to mode mapping
  CONDITION_MAP: {
    'NEW': 'new',
    'REFA': 'refurbished',
    'REFB': 'refurbished',
    'REFC': 'refurbished'
  },

  // Brand code lookup table
  BRANDS: {
    'APPL': { name: 'Apple', slug: 'apple' },
    'SAMS': { name: 'Samsung', slug: 'samsung' },
    'MSFT': { name: 'Microsoft', slug: 'microsoft' },
    'DELL': { name: 'Dell', slug: 'dell' },
    'LNVO': { name: 'Lenovo', slug: 'lenovo' },
    'ASUS': { name: 'Asus', slug: 'asus' },
    'HPXX': { name: 'HP', slug: 'hp' },
    'ACERX': { name: 'Acer', slug: 'acer' },
    'MSIX': { name: 'MSI', slug: 'msi' },
    'HUAW': { name: 'Huawei', slug: 'huawei' },
    'GOOG': { name: 'Google', slug: 'google' }
  },

  // Condition code to human-readable label
  CONDITIONS: {
    'NEW': { label: 'Brand New', grade: null },
    'REFA': { label: 'Refurbished', grade: 'A' },
    'REFB': { label: 'Refurbished', grade: 'B' },
    'REFC': { label: 'Refurbished', grade: 'C' }
  },

  /**
   * Parse a SKU string into its components
   * @param {string} sku - The SKU to parse
   * @returns {Object|null} Parsed SKU object or null if invalid
   */
  parse(sku) {
    if (!sku || typeof sku !== 'string') return null;
    
    const parts = sku.split('-');
    if (parts.length < 6) return null;
    
    const [brand, model, capacity, condition, color, sequence] = parts;
    
    const mode = this.CONDITION_MAP[condition];
    if (!mode) return null; // Invalid condition code
    
    return {
      raw: sku,
      brand: {
        code: brand,
        ...this.BRANDS[brand]
      },
      model: model,
      capacity: capacity,
      condition: {
        code: condition,
        ...this.CONDITIONS[condition]
      },
      color: color,
      sequence: sequence,
      mode: mode, // 'new' or 'refurbished'
      isNew: mode === 'new',
      isRefurbished: mode === 'refurbished'
    };
  },

  /**
   * Get the mode for a SKU (quick check)
   * @param {string} sku - The SKU to check
   * @returns {string} 'new', 'refurbished', or 'unknown'
   */
  getMode(sku) {
    if (!sku || typeof sku !== 'string') return 'unknown';
    const parts = sku.split('-');
    if (parts.length < 4) return 'unknown';
    return this.CONDITION_MAP[parts[3]] || 'unknown';
  },

  /**
   * Check if a SKU matches the given mode
   * @param {string} sku - The SKU to check
   * @param {string} mode - 'new' or 'refurbished'
   * @returns {boolean}
   */
  matchesMode(sku, mode) {
    return this.getMode(sku) === mode;
  },

  /**
   * Filter an array of products by mode
   * @param {Array} products - Array of Shopify product objects
   * @param {string} mode - 'new' or 'refurbished'
   * @returns {Array} Filtered products
   */
  filterByMode(products, mode) {
    return products.filter(product => {
      // Check first variant SKU (primary condition)
      const primarySku = product.variants?.[0]?.sku;
      if (primarySku && this.matchesMode(primarySku, mode)) {
        return true;
      }
      // Fallback: check if ANY variant matches the mode
      return product.variants?.some(v => this.matchesMode(v.sku, mode));
    });
  }
};

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
  module.exports = LooptechSKU;
}

// Make available globally
window.LooptechSKU = LooptechSKU;
```

---

### B. SKU Lookup Database

Create a **comprehensive lookup table** as a Liquid snippet that the client can reference and expand. This acts as the "source of truth" for all SKU codes.

Create: `snippets/sku-database.liquid`

```liquid
{% comment %}
  Looptech SKU Database
  
  This file defines all valid SKU codes and their meanings.
  Use this as the single source of truth for SKU validation and display.
  
  Structure:
    - Brands (4 characters)
    - Models (5-6 characters, grouped by brand)
    - Capacities (3-4 characters)
    - Conditions (3-4 characters)
    - Colors (3 characters)
{% endcomment %}

{%- liquid
  # ============================================
  # BRAND CODES
  # ============================================
  assign sku_brands = 'APPL:Apple,SAMS:Samsung,MSFT:Microsoft,DELL:Dell,LNVO:Lenovo,ASUS:Asus,HPXX:HP,ACERX:Acer,MSIX:MSI,HUAW:Huawei,GOOG:Google'
  
  # ============================================
  # CONDITION CODES (Critical for toggle)
  # ============================================
  assign sku_conditions = 'NEW:Brand New:new,REFA:Grade A:refurbished,REFB:Grade B:refurbished,REFC:Grade C:refurbished'
  
  # ============================================
  # CAPACITY CODES
  # ============================================
  assign sku_capacities = '064:64GB,128:128GB,256:256GB,512:512GB,01T:1TB,02T:2TB,08G:8GB RAM,16G:16GB RAM,32G:32GB RAM'
  
  # ============================================
  # COLOR CODES
  # ============================================
  assign sku_colors = 'BLK:Black,WHT:White,SIL:Silver,GRA:Graphite,GLD:Gold,BLU:Blue,GRN:Green,PNK:Pink,PRP:Purple,RED:Red,NAT:Natural,TIT:Titanium'
  
  # ============================================
  # MODEL CODES BY BRAND
  # ============================================
  
  # Apple Models
  assign sku_models_APPL = 'IPH16P:iPhone 16 Pro,IPH16:iPhone 16,IPH15P:iPhone 15 Pro,IPH15:iPhone 15,IPH14P:iPhone 14 Pro,IPH14:iPhone 14,IPH13P:iPhone 13 Pro,IPH13:iPhone 13,IPDPR:iPad Pro,IPDAI:iPad Air,MBPM1:MacBook Pro M1,MBPM2:MacBook Pro M2,MBPM3:MacBook Pro M3,MBAM1:MacBook Air M1,MBAM2:MacBook Air M2,WTCHS:Apple Watch SE,WTCH9:Apple Watch S9,AIRPD:AirPods Pro'
  
  # Samsung Models
  assign sku_models_SAMS = 'S24UL:Galaxy S24 Ultra,S24PL:Galaxy S24+,S24XX:Galaxy S24,S23UL:Galaxy S23 Ultra,S23PL:Galaxy S23+,ZFLD5:Galaxy Z Fold 5,ZFLP5:Galaxy Z Flip 5,TABS9:Galaxy Tab S9,BUDS:Galaxy Buds'
  
  # Microsoft Models
  assign sku_models_MSFT = 'SFPR9:Surface Pro 9,SFPR8:Surface Pro 8,SFLP5:Surface Laptop 5,SFLP4:Surface Laptop 4,SFGO3:Surface Go 3'
  
  # Dell Models
  assign sku_models_DELL = 'XPS13:XPS 13,XPS15:XPS 15,XPS17:XPS 17,INSP5:Inspiron 15,LATD5:Latitude 5000,ALIWR:Alienware'
  
  # Lenovo Models
  assign sku_models_LNVO = 'THKX1:ThinkPad X1,THKT4:ThinkPad T14,YOGAX:Yoga,LEGN5:Legion 5,IDPD5:IdeaPad 5'
  
  # Asus Models
  assign sku_models_ASUS = 'ROGZP:ROG Zephyrus,ROGST:ROG Strix,ZENBK:ZenBook,VIVBK:VivoBook,TUFGM:TUF Gaming'
  
  # HP Models
  assign sku_models_HPXX = 'SPECX:Spectre x360,ENVYX:Envy,PAVLN:Pavilion,OMEN:OMEN,ELITB:EliteBook'
  
  # Acer Models
  assign sku_models_ACERX = 'SWFT3:Swift 3,ASPIR:Aspire,NITRO:Nitro 5,PREDH:Predator Helios'
  
  # MSI Models
  assign sku_models_MSIX = 'KATNA:Katana,STLTH:Stealth,RAIDR:Raider,CREAT:Creator'
  
  # Huawei Models
  assign sku_models_HUAW = 'MTBKX:MateBook X,MTBK14:MateBook 14,P60PR:P60 Pro,MT60P:Mate 60 Pro'
  
  # Google Models
  assign sku_models_GOOG = 'PXL9P:Pixel 9 Pro,PXL9:Pixel 9,PXL8P:Pixel 8 Pro,PXL8:Pixel 8,PXLTB:Pixel Tablet'
-%}
```

---

### C. Updated Toggle Integration

#### 1. Update the Mode Detection Pattern

In `sections/mode-toggle.liquid`, ensure the toggle continues using the current URL parameter system (as documented in the system analysis), but add SKU awareness for analytics:

```liquid
{%- liquid
  # Standard mode detection (keep existing pattern)
  assign url_mode = request.url | split: 'mode=' | last | split: '&' | first
  assign current_mode = 'new'
  if url_mode == 'refurbished'
    assign current_mode = 'refurbished'
  endif
  
  # For SKU-based sections, determine which condition codes to match
  if current_mode == 'new'
    assign target_conditions = 'NEW'
  else
    assign target_conditions = 'REFA,REFB,REFC'
  endif
-%}
```

#### 2. Update Product Filtering in Sections

Modify `sections/product-spotlight-carousel.liquid` (and similar sections) to filter products by SKU condition:

```liquid
{%- liquid
  # Get mode
  assign url_mode = request.url | split: 'mode=' | last | split: '&' | first
  assign current_mode = 'new'
  if url_mode == 'refurbished'
    assign current_mode = 'refurbished'
  endif
  
  # Get collection products
  assign collection = section.settings.featured_collection
  assign filtered_products = '' | split: ''
  
  for product in collection.products
    # Parse SKU from first variant
    assign primary_sku = product.variants.first.sku
    assign sku_parts = primary_sku | split: '-'
    
    if sku_parts.size >= 4
      assign condition_code = sku_parts[3]
      
      # Check if condition matches current mode
      assign matches_mode = false
      
      if current_mode == 'new' and condition_code == 'NEW'
        assign matches_mode = true
      elsif current_mode == 'refurbished'
        if condition_code == 'REFA' or condition_code == 'REFB' or condition_code == 'REFC'
          assign matches_mode = true
        endif
      endif
      
      if matches_mode
        assign filtered_products = filtered_products | concat: product | slice: 0, 1
      endif
    endif
  endfor
-%}

{%- comment -%} Render filtered products {%- endcomment -%}
{% for product in filtered_products %}
  {% render 'product-card', product: product %}
{% endfor %}
```

#### 3. Update JavaScript AJAX Product Loading

In `assets/product-spotlight-carousel.js` (or equivalent), update the product filtering:

```javascript
async function loadCollectionProducts(collectionHandle) {
  const currentMode = new URLSearchParams(window.location.search).get('mode') || 'new';
  
  try {
    const response = await fetch(`/collections/${collectionHandle}/products.json?limit=250`);
    const data = await response.json();
    
    // Filter products by SKU condition
    const filteredProducts = data.products.filter(product => {
      const primarySku = product.variants[0]?.sku;
      return LooptechSKU.matchesMode(primarySku, currentMode);
    });
    
    return filteredProducts;
  } catch (error) {
    console.error('Error loading products:', error);
    return [];
  }
}
```

---

### D. Collection Page Integration

Update collection pages to respect the toggle mode when displaying products:

Create: `snippets/collection-product-grid.liquid`

```liquid
{%- comment -%}
  Collection Product Grid with SKU-Based Filtering
  
  This snippet renders a product grid that respects the current toggle mode.
  Products are filtered based on their SKU condition code.
  
  Usage:
    {% render 'collection-product-grid', collection: collection %}
{%- endcomment -%}

{%- liquid
  # Detect current mode
  assign url_mode = request.url | split: 'mode=' | last | split: '&' | first
  assign current_mode = 'new'
  if url_mode == 'refurbished'
    assign current_mode = 'refurbished'
  endif
  
  # Counter for displayed products
  assign displayed_count = 0
  assign products_per_page = section.settings.products_per_page | default: 24
-%}

<div class="collection-product-grid" data-mode="{{ current_mode }}">
  {%- for product in collection.products -%}
    {%- liquid
      # Parse product SKU
      assign primary_sku = product.variants.first.sku
      assign sku_parts = primary_sku | split: '-'
      assign should_display = false
      
      if sku_parts.size >= 4
        assign condition_code = sku_parts[3]
        
        if current_mode == 'new' and condition_code == 'NEW'
          assign should_display = true
        elsif current_mode == 'refurbished'
          if condition_code == 'REFA' or condition_code == 'REFB' or condition_code == 'REFC'
            assign should_display = true
          endif
        endif
      else
        # Fallback for products without proper SKU - show in both modes
        assign should_display = true
      endif
    -%}
    
    {%- if should_display and displayed_count < products_per_page -%}
      {% render 'product-card', product: product, show_condition_badge: true %}
      {%- assign displayed_count = displayed_count | plus: 1 -%}
    {%- endif -%}
  {%- endfor -%}
  
  {%- if displayed_count == 0 -%}
    <div class="collection-empty">
      <p>No {{ current_mode }} products found in this collection.</p>
      <a href="{{ routes.all_products_collection_url }}?mode={{ current_mode }}" class="button">
        Browse All {{ current_mode | capitalize }} Products
      </a>
    </div>
  {%- endif -%}
</div>
```

---

### E. Condition Badge Snippet

Create a reusable condition badge that displays on product cards:

Create: `snippets/condition-badge.liquid`

```liquid
{%- comment -%}
  Condition Badge
  
  Displays the product condition based on SKU parsing.
  
  Usage:
    {% render 'condition-badge', product: product %}
    {% render 'condition-badge', sku: variant.sku %}
{%- endcomment -%}

{%- liquid
  if product
    assign badge_sku = product.variants.first.sku
  elsif sku
    assign badge_sku = sku
  endif
  
  assign sku_parts = badge_sku | split: '-'
  assign condition_code = sku_parts[3] | default: ''
  
  case condition_code
    when 'NEW'
      assign badge_label = 'Brand New'
      assign badge_class = 'condition-badge--new'
    when 'REFA'
      assign badge_label = 'Grade A'
      assign badge_class = 'condition-badge--grade-a'
    when 'REFB'
      assign badge_label = 'Grade B'
      assign badge_class = 'condition-badge--grade-b'
    when 'REFC'
      assign badge_label = 'Grade C'
      assign badge_class = 'condition-badge--grade-c'
    else
      assign badge_label = ''
      assign badge_class = ''
  endcase
-%}

{%- if badge_label != blank -%}
  <span class="condition-badge {{ badge_class }}">
    {{ badge_label }}
  </span>
{%- endif -%}

<style>
  .condition-badge {
    display: inline-block;
    padding: 0.25rem 0.75rem;
    border-radius: 4px;
    font-size: 0.75rem;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }
  
  .condition-badge--new {
    background-color: #10b981;
    color: white;
  }
  
  .condition-badge--grade-a {
    background-color: #3b82f6;
    color: white;
  }
  
  .condition-badge--grade-b {
    background-color: #f59e0b;
    color: white;
  }
  
  .condition-badge--grade-c {
    background-color: #6b7280;
    color: white;
  }
</style>
```

---

## 🔍 SHOPIFY DOCUMENTATION REQUIREMENTS

**CRITICAL:** Before implementing ANY Shopify-specific code, consult the latest official documentation:

### Required References:

1. **Liquid Reference**
   - URL: https://shopify.dev/docs/api/liquid
   - Check: Object properties, filters, tags syntax

2. **Theme Architecture**
   - URL: https://shopify.dev/docs/storefronts/themes/architecture
   - Check: Section schema format, template structure

3. **Storefront API** (for JavaScript/AJAX)
   - URL: https://shopify.dev/docs/api/storefront
   - Check: Product queries, collection fetching

4. **Online Store 2.0**
   - URL: https://shopify.dev/docs/storefronts/themes/os2
   - Check: JSON templates, section groups

5. **Web Performance**
   - URL: https://shopify.dev/docs/storefronts/themes/best-practices/performance
   - Check: Lazy loading, critical CSS, JavaScript optimization

### Validation Steps:

Before submitting any code, verify:
- [ ] All Liquid filters exist in current Shopify version
- [ ] Schema settings use valid types
- [ ] JavaScript uses supported browser APIs (ES6+)
- [ ] No deprecated methods or objects

---

## ⚠️ IMPLEMENTATION CONSTRAINTS

### Must Preserve:
1. **URL Parameter System** - `?mode=new` and `?mode=refurbished`
2. **localStorage Persistence** - `preferredMode` key
3. **Menu Switching** - `main-menu` ↔ `refurbished-menu`
4. **Accessibility** - All `aria-` attributes and keyboard navigation
5. **Mobile Responsiveness** - Existing breakpoints

### Must Not Break:
1. Existing product pages
2. Cart functionality
3. Checkout flow
4. Theme editor customization
5. Cross-browser compatibility

### Performance Budgets:
- Maximum 250 products loaded per AJAX request
- Client-side filtering under 100ms for 250 products
- No additional network requests for SKU parsing
- Total JavaScript bundle increase < 5KB

---

## 📋 DELIVERABLES CHECKLIST

### Phase 1: Core SKU System
- [ ] `snippets/sku-parser.liquid` - Liquid SKU parsing
- [ ] `assets/sku-parser.js` - JavaScript SKU parsing module
- [ ] `snippets/sku-database.liquid` - Lookup table for all codes

### Phase 2: Toggle Integration
- [ ] Updated `sections/mode-toggle.liquid` - SKU awareness
- [ ] Updated `sections/product-spotlight-carousel.liquid` - SKU filtering
- [ ] Updated `sections/header.liquid` - Menu switching (if needed)

### Phase 3: Product Display
- [ ] `snippets/condition-badge.liquid` - Condition badges
- [ ] `snippets/collection-product-grid.liquid` - Filtered grid
- [ ] Updated product card snippets

### Phase 4: Edge Cases
- [ ] Fallback for products without SKU
- [ ] Empty state handling (no products match mode)
- [ ] Malformed SKU graceful handling
- [ ] Products with multiple condition variants

### Phase 5: Testing
- [ ] Unit tests for SKU parser (JavaScript)
- [ ] Cross-browser testing checklist
- [ ] Mobile responsiveness verification
- [ ] Performance benchmarks

---

## 🔄 MIGRATION NOTES

This implementation follows the **Migration Path** documented in `BRAND-NEW-REFURBISHED-SYSTEM-ANALYSIS.md` (lines 1054-1084):

1. **Phase 1: Preparation** - SKU structure is already defined via the SKU Generator
2. **Phase 2: Implementation** - Add SKU parsing, update filtering logic
3. **Phase 3: Validation** - Test with real product data
4. **Phase 4: Deployment** - Backup current theme, deploy changes
5. **Phase 5: Cleanup** - Remove collection-based settings if desired

---

## 📝 ADDITIONAL CONTEXT

### Client's Current Workflow:
1. Isaac creates products using the SKU Generator Pro tool
2. Products are imported via CSV with consistent SKU format
3. Tags are auto-applied based on product attributes
4. Automated collections sort products by tags
5. The toggle should filter based on SKU condition code

### Why SKU-Based Over Collection-Based:
- **Single source of truth** - SKU defines product condition
- **No duplicate collections** - One collection can contain all conditions
- **Easier maintenance** - No need to manage parallel collection structures
- **Variant support** - Same product can have NEW and REFA variants
- **Scalability** - Works with any number of products/conditions

### Future Considerations:
- Grade-specific filtering (show only Grade A refurbished)
- Price comparison between NEW and REFA for same product
- Condition-based sorting (cheapest first within mode)
- API endpoint for external integrations

---

## 🚀 START IMPLEMENTATION

Begin by:
1. Reading all reference documents thoroughly
2. Creating the SKU parser snippet and JavaScript module
3. Testing parser with sample SKUs
4. Updating the product spotlight carousel section
5. Testing toggle functionality end-to-end
6. Addressing edge cases
7. Performance optimization
8. Documentation and handover notes

**Remember:** The system analysis document (`BRAND-NEW-REFURBISHED-SYSTEM-ANALYSIS.md`) is your primary reference. Every implementation decision should align with the patterns and constraints documented there.

---

*End of Implementation Prompt*Claude 
