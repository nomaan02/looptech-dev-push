# LoopTech Product Setup Guide

## Overview

LoopTech uses a **collection-based toggle system** that allows customers to switch between viewing "Brand New" and "Renewed" products. This system relies on properly structured collections to work correctly.

---

## How the Toggle Works

The toggle on collection pages **navigates between parallel collections** rather than filtering products on the same page.

**Example:**
- When viewing `phones-new`, clicking "Renewed" navigates to `phones-renewed`
- When viewing `phones-renewed`, clicking "Brand New" navigates to `phones-new`

This approach provides:
- Better SEO (each mode has its own indexable URL)
- Faster page loads (no JavaScript filtering)
- More reliable filtering (server-side via Shopify)

---

## Collection Naming Convention

### Required Pattern

Every product category needs **two collections** with these exact naming suffixes:

| Category | Brand New Collection | Renewed Collection |
|----------|---------------------|-------------------|
| All Products | `all-new` | `all-renewed` |
| Phones | `phones-new` | `phones-renewed` |
| Laptops | `laptops-new` | `laptops-renewed` |
| Tablets | `tablets-new` | `tablets-renewed` |
| Watches | `watches-new` | `watches-renewed` |

### Handle Format

The collection **handle** (URL slug) must end with:
- `-new` for Brand New products
- `-renewed` for Renewed products

**Important:** The toggle system reads the collection handle, not the title. Ensure handles match this pattern exactly.

---

## Product Tagging Requirements

### Required Tags

Every product must have **one** of these tags:

| Tag | Used For |
|-----|----------|
| `brand-new` | Brand new, factory-sealed products |
| `renewed` | Refurbished, renewed, or pre-owned products |

### How to Add Tags

1. Go to **Products** in Shopify Admin
2. Click on a product
3. In the **Organization** section, find **Tags**
4. Add either `brand-new` or `renewed`
5. Save the product

### Bulk Tagging

For bulk operations:
1. Go to **Products** > select multiple products
2. Click **More actions** > **Add tags**
3. Enter `brand-new` or `renewed`
4. Click **Save**

---

## Creating Automated Collections

Shopify can automatically populate collections based on product tags.

### Step-by-Step: Create a "Brand New Phones" Collection

1. Go to **Products** > **Collections**
2. Click **Create collection**
3. Enter:
   - **Title:** Brand New Phones
   - **Handle:** `phones-new` (edit in SEO section)
4. Under **Collection type**, select **Automated**
5. Set conditions:
   - **Product tag** `is equal to` `brand-new`
   - **AND**
   - **Product type** `is equal to` `Phone` (or your category)
6. Click **Save**

### Step-by-Step: Create a "Renewed Phones" Collection

1. Go to **Products** > **Collections**
2. Click **Create collection**
3. Enter:
   - **Title:** Renewed Phones
   - **Handle:** `phones-renewed` (edit in SEO section)
4. Under **Collection type**, select **Automated**
5. Set conditions:
   - **Product tag** `is equal to` `renewed`
   - **AND**
   - **Product type** `is equal to` `Phone`
6. Click **Save**

---

## SKU Format (Optional)

The theme supports an optional SKU format for additional product identification:

```
BRAND-MODEL-CAPACITY-CONDITION-COLOR-SEQUENCE
```

**Example:** `APPL-IPH15PM-256-NEW-BLK-001`

### Condition Codes

| Code | Meaning |
|------|---------|
| `NEW` | Brand New |
| `REN` | Renewed/Refurbished |
| `REFA` | Refurbished Grade A |
| `REFB` | Refurbished Grade B |
| `REFC` | Refurbished Grade C |

**Note:** Product tags (`brand-new`/`renewed`) take priority over SKU codes for filtering.

---

## Toggle Section Settings

### Theme Editor Configuration

1. Go to **Online Store** > **Themes** > **Customize**
2. Navigate to a collection template
3. Find the **Mode Toggle** section
4. Configure:
   - **Section Heading:** Custom text above toggle
   - **Brand New Button Label:** Default "Brand New"
   - **Renewed Button Label:** Default "Renewed"
   - **Padding:** Adjust spacing as needed

### Visibility

The toggle **only appears on collection pages**. It does not show on:
- Homepage
- Product pages
- Cart page
- Other static pages

---

## Troubleshooting

### Toggle Not Appearing

1. **Check you're on a collection page** - Toggle only shows on `/collections/*` URLs
2. **Verify collection handle ends with `-new` or `-renewed`**
3. **Ensure Mode Toggle section is added** in Theme Editor

### Wrong Products Showing

1. **Check product tags** - Must have `brand-new` or `renewed` tag
2. **Verify collection conditions** - Automated collection rules must include the tag filter
3. **Check collection handle** - Must match the `-new`/`-renewed` pattern

### Toggle Not Switching Collections

1. **Verify parallel collections exist** - Both `-new` and `-renewed` versions must exist
2. **Check collection handles** - Must follow exact naming convention
3. **Clear browser cache** - Sometimes needed after collection changes

### Products in Wrong Collection

1. **Review product tags** - Only one tag (`brand-new` OR `renewed`) should be assigned
2. **Check automated collection rules** - Conditions may be too broad or conflicting

---

## Quick Reference

### Checklist for New Products

- [ ] Product has `brand-new` OR `renewed` tag (not both)
- [ ] Product is assigned to appropriate collections
- [ ] SKU follows format (optional but recommended)

### Checklist for New Categories

- [ ] Created `{category}-new` collection with automated rules
- [ ] Created `{category}-renewed` collection with automated rules
- [ ] Both collection handles match the naming convention
- [ ] Tested toggle navigation between collections

---

## Support

For technical issues with the toggle system, contact your theme developer.

For Shopify collection and product management, refer to [Shopify Help Center](https://help.shopify.com/).
