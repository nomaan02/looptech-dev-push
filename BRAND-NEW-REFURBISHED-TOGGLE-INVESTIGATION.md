# Brand New/Refurbished Toggle - Investigation & Fix Plan

**Date**: 2025-12-14
**Status**: ✅ **ISSUE RESOLVED** - Collection Settings Now Configured
**Priority**: Low (Monitoring/Testing Phase)
**Last Updated**: 2025-12-14 (Re-checked after GitHub pull)

---

## 🎉 LATEST UPDATE (2025-12-14)

### ✅ ISSUE RESOLVED

After pulling the latest version from GitHub, the configuration has been **FIXED**:

**File**: `templates/index.json` (Lines 395-396)

**BEFORE** (Original Issue):
```json
"featured_collection": "ignore-dev-purpose-tester",
"featured_collection_refurbished": "",  // ❌ EMPTY
```

**AFTER** (Current State):
```json
"featured_collection": "ignore-dev-purpose-tester-copy",
"featured_collection_refurbished": "ignore-dev-purpose-tester-copy-1",  // ✅ NOW CONFIGURED
```

### Current Status:

✅ **Refurbished collection is now configured**
✅ **Collection switching logic should now work**
✅ **Toggle will properly switch between two different collections**
⚠️ **Note**: Still using test collections (contains "ignore-dev-purpose-tester" in names)

### What This Means:

1. **Brand New Mode** (`?mode=new`): Shows products from `ignore-dev-purpose-tester-copy`
2. **Refurbished Mode** (`?mode=refurbished`): Shows products from `ignore-dev-purpose-tester-copy-1`
3. **SKU Filtering**: Still active on top of collection switching
4. **Result**: Each mode should now display different product sets

### Remaining Tasks:

- [ ] Test Brand New mode and verify products shown
- [ ] Test Refurbished mode and verify products shown
- [ ] Verify the two collections contain appropriate products
- [ ] Consider renaming collections from test names to production names

---

## Executive Summary (Original Investigation)

The Brand New/Refurbished toggle system **WAS** partially working but **HAD** a critical configuration issue in the Product Spotlight Carousel section. The toggle changed the URL parameter correctly, but the carousel was not configured with separate collections for each mode, causing both modes to display the same products.

**This issue has now been RESOLVED** as of the latest GitHub version.

---

## System Architecture Overview

### 1. **Mode Toggle Section** (`sections/mode-toggle.liquid`)

**Location**: Should be in overlay group or header
**Current Status**: Multiple versions exist, most are disabled

**How It Works**:
1. Detects current mode from URL parameter: `?mode=new` or `?mode=refurbished`
2. Displays sliding toggle UI with two buttons
3. On click, updates URL parameter and reloads page
4. Stores preference in `localStorage`

**Code Flow**:
```liquid
# Lines 13-19: Mode Detection
assign url_mode = request.url | split: 'mode=' | last | split: '&' | first
assign current_mode = 'new'
if url_mode == 'refurbished'
  assign current_mode = 'refurbished'
endif
```

```javascript
// Lines 326-366: Click Handler
option.addEventListener('click', function(e) {
  const newMode = this.getAttribute('data-mode');
  const url = new URL(window.location.href);
  url.searchParams.set('mode', newMode);  // Set ?mode=new or ?mode=refurbished

  localStorage.setItem('preferredMode', newMode);  // Remember preference
  window.location.href = url.toString();  // Reload page
});
```

---

### 2. **SKU Parser** (`assets/sku-parser.js`)

**Purpose**: Parse product SKUs and filter by condition

**SKU Format**: `BRAND-MODEL-CAPACITY-CONDITION-COLOR-SEQUENCE`
**Example**: `APPL-IPH14P-256-NEW-GRA-001`

**Condition Mappings**:
| Condition Code | Mode | Label |
|---|---|---|
| `NEW` | `'new'` | Brand New |
| `REFA` | `'refurbished'` | Refurbished Grade A |
| `REFB` | `'refurbished'` | Refurbished Grade B |
| `REFC` | `'refurbished'` | Refurbished Grade C |

**Key Functions**:
```javascript
LooptechSKU.parse(sku)           // Parse full SKU details
LooptechSKU.getMode(sku)         // Get 'new' or 'refurbished'
LooptechSKU.matchesMode(sku, mode)  // Check if SKU matches mode
LooptechSKU.filterByMode(products, mode)  // Filter product array
```

**Global Availability**: `window.LooptechSKU`

---

### 3. **Product Spotlight Carousel** (`sections/product-spotlight-carousel.liquid`)

**Lines 11-26**: Collection Selection Logic

```liquid
# Mode Detection (same as toggle section)
assign url_mode = request.url | split: 'mode=' | last | split: '&' | first
assign current_mode = 'new'
if url_mode == 'refurbished'
  assign current_mode = 'refurbished'
endif

# Collection Selection Based on Mode
if current_mode == 'refurbished' and section.settings.featured_collection_refurbished != blank
  assign featured_collection = section.settings.featured_collection_refurbished
else
  assign featured_collection = section.settings.featured_collection
endif
```

**Lines 135-137**: Product Loading
```liquid
if featured_collection != blank
  assign collection_products = collections[featured_collection].products
endif
```

**Lines 266-284**: Liquid-Side SKU Filtering
```liquid
{%- for product in collection_products -%}
  {%- liquid
    render 'sku-parser', sku: product.variants.first.sku
    assign should_display = false

    if sku_is_valid
      if current_mode == 'new' and sku_condition == 'NEW'
        assign should_display = true
      elsif current_mode == 'refurbished'
        if sku_condition == 'REFA' or sku_condition == 'REFB' or sku_condition == 'REFC'
          assign should_display = true
        endif
      endif
    endif
  -%}

  {%- if should_display -%}
    {% render 'product-spotlight-card', product: product, ... %}
  {%- endif -%}
{%- endfor -%}
```

**Lines 1765-1772**: JavaScript AJAX Filtering
```javascript
// When brand tabs are clicked, fetch collection via API
const response = await fetch(`/collections/${collectionHandle}/products.json?limit=${fetchLimit}`);
const data = await response.json();

// Filter by mode using SKU parser
let filteredProducts = data.products || [];
if (window.LooptechSKU) {
  filteredProducts = window.LooptechSKU.filterByMode(data.products || [], currentMode);
}
```

---

## Schema Settings

**File**: `sections/product-spotlight-carousel.liquid` (Lines 2075-2086)

```json
{
  "type": "header",
  "content": "Product Collection"
},
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

---

## ✅ ISSUE IDENTIFIED & RESOLVED

### Problem Location: `templates/index.json` (Previously Lines 530-531, Now Lines 395-396)

**ORIGINAL ISSUE** (Now Fixed):
```json
"product_spotlight_carousel_9XXKjm": {
  "type": "product-spotlight-carousel",
  "settings": {
    "featured_collection": "ignore-dev-purpose-tester",
    "featured_collection_refurbished": "",  // ❌ WAS EMPTY!
    ...
  }
}
```

**CURRENT STATE** (Fixed):
```json
"product_spotlight_carousel_9XXKjm": {
  "type": "product-spotlight-carousel",
  "settings": {
    "featured_collection": "ignore-dev-purpose-tester-copy",
    "featured_collection_refurbished": "ignore-dev-purpose-tester-copy-1",  // ✅ NOW CONFIGURED!
    ...
  }
}
```

### What Was Broken (Now Fixed):

1. **Missing Refurbished Collection** ✅ FIXED
   - `featured_collection_refurbished` **WAS** set to empty string `""`
   - When toggle switched to refurbished mode, logic checked if this setting was blank
   - Since it **WAS** blank, fell back to main `featured_collection`
   - **OLD Result**: Both modes showed the same collection!
   - **NEW Result**: Each mode now shows its own collection

2. **Dev/Test Collections Used** ⚠️ STILL TRUE (Minor Issue)
   - Main collection: `"ignore-dev-purpose-tester-copy"`
   - Refurbished collection: `"ignore-dev-purpose-tester-copy-1"`
   - These appear to be testing collections
   - Not production-ready collection names
   - **Recommendation**: Rename to proper collection handles for production

3. **SKU Filtering Now Enhanced**
   - Collection switching **NOW WORKS** properly
   - SKU filtering still operates on top of collection switching (double filtering)
   - Products WITHOUT proper SKU format will show in both modes
   - Products WITH SKU format filter by condition code + collection membership
   - **Benefit**: Better product organization and filtering

### How This Now Works:

**Current Behavior** (After Fix):
- **Brand New Mode** (`?mode=new`):
  - Loads `ignore-dev-purpose-tester-copy` collection
  - Filters for products with `NEW` condition code in SKU
  - Only shows Brand New products from Brand New collection

- **Refurbished Mode** (`?mode=refurbished`):
  - Loads `ignore-dev-purpose-tester-copy-1` collection
  - Filters for products with `REFA/REFB/REFC` condition codes in SKU
  - Only shows Refurbished products from Refurbished collection

**Result**: Proper separation, better performance, correct product display

---

## Toggle Component Status

### Analysis of `templates/index.json`

**4 Toggle Implementations Found**:

| Section ID | Type | Status | Lines |
|---|---|---|---|
| `1762700052b2089e17` | `ai_gen_block_38562b2` | ❌ **DISABLED** | 12-52 |
| `1762699567a90a233e` | `ai_gen_block_63cc393` | ❌ **DISABLED** | 54-93 |
| `17626417209d8e018e` | `ai_gen_block_875766e` | ❌ **DISABLED** | 94-139 |
| `1762641466a6753d23` | `ai_gen_block_1cd1b43` | ✅ **ACTIVE** | 140-173 |

**Active Toggle Configuration** (Lines 145-163):
```json
{
  "type": "ai_gen_block_1cd1b43",
  "settings": {
    "announcement_text": "<p>Browse Brand New & Refurbished Tech With Ease!</p>",
    "text_size": 15,
    "option_1_text": "Brand New",
    "option_2_text": "Renewed",
    ...
  }
}
```

**Note**: The active toggle uses "Renewed" instead of "Refurbished" in the label, but should still work with `?mode=refurbished` parameter.

---

## Data Flow Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│ USER CLICKS TOGGLE                                              │
│ "Brand New" or "Refurbished"                                    │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│ JavaScript (mode-toggle.liquid)                                 │
│ - Updates URL: ?mode=new or ?mode=refurbished                  │
│ - Stores in localStorage: preferredMode                         │
│ - Reloads page: window.location.href = url                     │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│ PAGE RELOAD WITH NEW URL PARAMETER                              │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│ Liquid: Product Spotlight Carousel (lines 11-25)                │
│                                                                 │
│ url_mode = request.url | split: 'mode=' | last                 │
│ current_mode = (url_mode == 'refurbished') ? 'refurbished' : 'new' │
│                                                                 │
│ IF current_mode == 'refurbished' AND                           │
│    featured_collection_refurbished != blank                     │
│   THEN featured_collection = featured_collection_refurbished    │
│   ELSE featured_collection = featured_collection                │
│                                                                 │
│ ❌ ISSUE: featured_collection_refurbished is EMPTY              │
│ ❌ RESULT: Always uses featured_collection                      │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│ Load Collection Products (line 136)                             │
│ collection_products = collections[featured_collection].products │
│                                                                 │
│ ⚠️ SAME COLLECTION FOR BOTH MODES                              │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│ SKU-Based Filtering (lines 266-284)                            │
│                                                                 │
│ FOR EACH product IN collection_products:                        │
│   Parse SKU → sku_condition (NEW, REFA, REFB, REFC)           │
│                                                                 │
│   IF current_mode == 'new' AND sku_condition == 'NEW'          │
│     Display product                                             │
│   ELSIF current_mode == 'refurbished' AND                      │
│         sku_condition IN ['REFA', 'REFB', 'REFC']             │
│     Display product                                             │
│                                                                 │
│ ✅ FILTERING WORKS (but limited to one collection's products)   │
└─────────────────────────────────────────────────────────────────┘
```

---

## Additional Filtering Points

### 1. Brand Tab Clicks (JavaScript AJAX)

When users click brand filter tabs, products are fetched via AJAX:

**File**: `sections/product-spotlight-carousel.liquid` (Lines 1743-1772)

```javascript
async function loadCollectionProducts(collectionHandle) {
  // Get current mode from URL
  const urlParams = new URLSearchParams(window.location.search);
  const currentMode = urlParams.get('mode') || 'new';

  // Fetch products from Shopify API
  const response = await fetch(`/collections/${collectionHandle}/products.json`);
  const data = await response.json();

  // Filter by SKU condition
  let filteredProducts = data.products || [];
  if (window.LooptechSKU) {
    filteredProducts = window.LooptechSKU.filterByMode(data.products || [], currentMode);
  }

  // Render filtered products
  filteredProducts.forEach(product => {
    const card = createProductCard(product);
    track.appendChild(card);
  });
}
```

**This Means**: Brand tab filtering respects the current mode, but pulls from the specific brand's collection (not the main featured collection).

---

## Root Cause Analysis

### Why Collection Switching Doesn't Work

1. **Design Intent** ✅
   - Liquid logic correctly checks for refurbished collection setting
   - Falls back to main collection if refurbished is not set
   - This is defensive programming (good!)

2. **Configuration Problem** ❌
   - Theme Editor settings never filled in `featured_collection_refurbished`
   - Value remains empty string `""`
   - Fallback always triggers

3. **Consequence** ⚠️
   - Toggle works (URL changes, slider moves)
   - SKU filtering works (products with correct SKUs filter properly)
   - **BUT** collection never switches
   - Limited product pool for refurbished mode
   - May show zero products if Brand New collection has no refurbished SKUs

### Why SKU Filtering Still Works

- Client-side filtering happens regardless of collection
- Products with proper SKU format filter correctly by condition code
- Products WITHOUT proper SKU format show in both modes (fallback behavior)

---

## Fix Plan

### Option 1: Configure Refurbished Collection (Recommended)

**Steps**:
1. Create or identify refurbished product collection in Shopify
2. Open Theme Editor
3. Navigate to Homepage
4. Find "Product Spotlight Carousel" section
5. Set "Refurbished Collection" setting to your refurbished collection
6. Save

**Pros**:
- Proper separation of Brand New vs Refurbished products
- Better performance (smaller collections to filter)
- Clearer product organization
- Works as originally designed

**Cons**:
- Requires collection management
- Need to ensure SKU format is correct on products

---

### Option 2: Use Single Collection with SKU Filtering Only

**Steps**:
1. Remove the conditional collection logic
2. Always use main `featured_collection`
3. Rely entirely on SKU-based filtering
4. Update schema to remove confusing "Refurbished Collection" setting

**Code Changes**:
```liquid
# Remove lines 21-25, replace with:
assign featured_collection = section.settings.featured_collection

# Remove featured_collection_refurbished from schema (lines 2082-2086)
```

**Pros**:
- Simpler logic
- Only one collection to manage
- SKU filtering handles everything

**Cons**:
- Must ensure all products have correct SKU format
- Larger collection to filter through
- Less flexible (can't use different collections for new vs refurbished)

---

### Option 3: Hybrid Approach (Most Flexible)

**Keep current logic, but**:
1. Set up refurbished collection properly
2. Add visual indicator when refurbished collection is not set
3. Add Theme Editor note explaining the two-collection system

**Schema Update**:
```json
{
  "type": "collection",
  "id": "featured_collection_refurbished",
  "label": "Refurbished Collection (Optional)",
  "info": "⚠️ If left empty, will use main collection and filter by SKU. For best results, create a separate refurbished collection."
}
```

**Pros**:
- Backwards compatible
- Works with or without refurbished collection
- Flexible for different use cases

**Cons**:
- More complex
- Needs clear documentation

---

## Testing Checklist

### Before Fix

- [ ] Test Brand New mode: `/?mode=new`
- [ ] Test Refurbished mode: `/?mode=refurbished`
- [ ] Verify products shown in both modes
- [ ] Check if any refurbished products appear in Brand New mode
- [ ] Check console for JavaScript errors
- [ ] Verify `window.LooptechSKU` is available

### After Fix (Option 1)

- [ ] Refurbished collection is configured in Theme Editor
- [ ] Brand New mode shows only NEW condition products
- [ ] Refurbished mode shows only REFA/REFB/REFC condition products
- [ ] Toggle slider animates correctly
- [ ] localStorage saves preference
- [ ] Page reloads when mode changes
- [ ] Brand tab filtering works in both modes
- [ ] AJAX loading shows correct filtered products
- [ ] Zero-products message displays if collection is empty

### After Fix (Option 2)

- [ ] Single collection configured
- [ ] SKU filtering works for both modes
- [ ] All products have proper SKU format
- [ ] Refurbished collection setting removed from schema
- [ ] Documentation updated

### After Fix (Option 3)

- [ ] Works with refurbished collection set
- [ ] Works with refurbished collection empty
- [ ] Warning appears in Theme Editor if collection not set
- [ ] Documentation explains both scenarios

---

## Related Files Reference

| File | Purpose | Lines of Interest |
|---|---|---|
| `sections/mode-toggle.liquid` | Toggle UI component | 13-19 (mode detection), 326-366 (click handler) |
| `sections/product-spotlight-carousel.liquid` | Main carousel | 11-26 (collection logic), 135-137 (product loading), 266-284 (SKU filtering), 1743-1772 (AJAX filtering), 2075-2086 (schema) |
| `assets/sku-parser.js` | SKU parsing utility | 14-176 (full implementation) |
| `snippets/sku-parser.liquid` | Liquid SKU parsing | (to be examined if needed) |
| `templates/index.json` | Homepage template config | 530-531 (broken settings), 140-173 (active toggle) |

---

## ✅ Recommended Action (COMPLETED)

**Primary Issue**: ✅ **RESOLVED** - Refurbished collection is now configured

### Current State:
- ✅ Both collections are configured (`lines 395-396 in templates/index.json`)
- ✅ Collection switching logic is working as designed
- ✅ Toggle functionality is operational

### Remaining Recommendations:

**Short-Term** (Optional - Collection Naming):
1. Consider renaming test collections to production-ready names:
   - Current: `ignore-dev-purpose-tester-copy` → Suggested: `all-brand-new` or `new-products`
   - Current: `ignore-dev-purpose-tester-copy-1` → Suggested: `all-refurbished` or `renewed-products`

**Medium-Term** (Testing & Validation):
1. Test Brand New mode in live/staging environment
2. Test Refurbished mode in live/staging environment
3. Verify product SKUs are properly formatted
4. Ensure collections contain appropriate products for each mode

**Long-Term** (Enhancement):
- Add clearer schema documentation in section file
- Create setup guide for managing collections
- Add visual indicators in Theme Editor when collection is not set
- Consider adding collection health check/validation

---

## Questions to Answer

1. **Collection Strategy**: Should Brand New and Refurbished be completely separate collections, or one collection with mixed SKUs?
2. **SKU Format**: Are all products guaranteed to have proper SKU format?
3. **Fallback Behavior**: What should happen if a mode has zero products?
4. **Brand Tabs**: Should brand tab collections also be mode-specific?
5. **User Experience**: Should toggle remember preference across sessions, or reset each visit?

---

## Next Steps

1. ✅ Issue identified and documented
2. ✅ Fix approach decided (Option 1 - Configure Refurbished Collection)
3. ✅ Refurbished collection configured in Shopify
4. ✅ `templates/index.json` updated with correct collection handles
5. ⏭️ **Test in Shopify theme preview** (NEXT ACTION)
6. ⏭️ Verify both modes display correct products
7. ⏭️ Optionally rename collections from test names to production names
8. ⏭️ Deploy and verify in production
9. ⏭️ Document final setup for client/team

---

**Investigation Completed**: 2025-12-14
**Fix Implemented**: 2025-12-14 (via GitHub)
**Status**: ✅ **RESOLVED** - Ready for testing
**Estimated Testing Time**: 10-15 minutes
