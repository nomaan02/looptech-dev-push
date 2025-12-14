Product Creation Guide

Using the SKU Generator Pro to add products to Shopify

This guide walks you through the product creation workflow using the **SKU Generator Pro** tool. The tool handles all the complex stuff - SKU formatting, tags, collections, categories - so you can focus on entering the product details.

# 1\. Opening the Tool

Double-click the **Looptech-Product-Creator-Pro.html** file. It'll open in your browser - no internet needed, it works completely offline.


# 2\. Product Identity (Left Column)

Start by telling the tool what you're selling. These three fields determine everything else:

## Brand

Pick the manufacturer.

The tool has 19 brands pre-loaded - Apple, Samsung, Dell, etc. (let me know if you need anymore)

Once selected, **the model dropdown filters to only show that brand's devices.**

## Device Type

This is important - it determines the **Shopify Product Category**

(which affects tax rates and search filters). Pick the right one:

| **Device Type** | **Auto-Assigned Category** |
| --- | --- |
| Smartphone | Electronics > Communications > Mobile Phones |
| --- | --- |
| Laptop | Electronics > Computers > Laptops |
| --- | --- |
| Gaming PC | Electronics > Computers > Desktop Computers |
| --- | --- |
| Smartwatch | Electronics > Wearables > Smartwatches |
| --- | --- |

_35+ device types available_ - from earbuds to gaming consoles to docking stations.



## Model

After picking a brand, this shows all available models. The database has 400+ models across all brands. If a model is missing, let me know and I'll add it.

# 3\. Building Variants (Middle Column)

This is where the tool really saves time. Instead of creating each variant manually, you **select multiple options** and it generates all the combinations.

## Conditions

Click the chips to select which conditions you're listing. You can select multiple:

- **Brand New** - Factory sealed, full warranty
- **Grade A** - Like new, minimal signs of use
- **Grade B** - Good condition, visible wear
- **Grade C** - Functional, noticeable wear

## Storage/Capacity

Select all storage options you have in stock. For phones/tablets, use storage (64GB, 128GB, etc.). For laptops, you can also use RAM options (8GB, 16GB, 32GB).

## Colors

Pick all colors available. The tool shows visual swatches so you can quickly identify the right ones.

## How It Multiplies


Say you select:

- 2 conditions (Brand New + Grade A)
- 3 capacities (128GB, 256GB, 512GB)
- 2 colors (Black, Silver)

The tool creates **2 × 3 × 2 = 12 variants** automatically, each with a unique SKU. The preview panel shows exactly what will be generated.

# 4\. Pricing & Status

Fill in the pricing details. Note: _all variants in this batch get the same base price_\-you can adjust individual variant prices in Shopify after import.

- **Price** - The selling price
- **Compare at Price** - Original/RRP (shows "Save £X" badge)
- **Cost** - Your cost price (for internal profit tracking)
- **Inventory Qty** - Stock level per variant

## Product Status

- **Active** - Visible in store, ready to sell
- **Draft** - Hidden from customers, work in progress
- **Archived** - Removed from sale, kept for records

# 5\. Collections (Right Column)

The tool **auto-selects relevant collections** based on your choices. When you pick "Brand New" condition + "Smartphone" type, it automatically ticks:

- All Brand New
- New Phones
- The brand collection (e.g., Apple)


#


# 6\. SKU Preview

Before adding to batch, the tool shows a live preview of all SKUs that will be generated. This is in the **Generated SKUs** panel.

## SKU Format

Create each device model **once** in Shopify. Use **variants** for different conditions (Brand New, Grade A, B, C).

## Example: Apple iPhone 14 Pro 256GB

| **Variant** | **Price** | **SKU** |
| --- | --- | --- |
| Brand New / Graphite | £999 | APPL-IPH14P-256-NEW-GRA-001 |
| --- | --- | --- |
| Refurb Grade A / Graphite | £799 | APPL-IPH14P-256-REFA-GRA-002 |
| --- | --- | --- |
| Refurb Grade B / Graphite | £699 | APPL-IPH14P-256-REFB-GRA-003 |
| --- | --- | --- |

# _1a. SKU Format_

**BRAND-MODEL-CAPACITY-CONDITION-COLOR-NUMBER**

| **Component** | **Length** | **Examples** |
| --- | --- | --- |
| Brand | 4 chars | APPL, SAMS, MSFT, DELL, LNVO, ASUS |
| --- | --- | --- |
| Model | 5-6 chars | IPH14P, S23U, MBPM1, GMPX9 |
| --- | --- | --- |
| Capacity | 3-4 chars | 128, 256, 512, 01TB |
| --- | --- | --- |
| Condition | 4 chars | NEW, REFA, REFB, REFC |
| --- | --- | --- |
| Color | 3 chars | GRA, SIL, GLD, BLK, WHT |
| --- | --- | --- |


# 7\. Adding to Batch & Exporting

Once you're happy with your selections, click **Add to Batch**. The product with all its variants gets added to the batch panel.

You can add multiple products to the same batch. The form partially resets (keeps brand/model for faster entry) so you can quickly add more variants or different products.

## All Generated SKUs Panel

After adding products, the bottom of the right column shows a comprehensive list of **every SKU in your batch**, grouped by product. You'll see:

- Total count of SKUs
- Breakdown by condition (Brand New vs Refurbished)
- Copy buttons for individual SKUs or entire batch


## Export CSV

When ready, click **Export CSV**. The file downloads automatically with today's date in the filename.

# 8\. Importing to Shopify

Quick steps to get your products live:

- Go to **Shopify Admin → Products → Import**
- Click "Add file" and select your exported CSV
- Review the preview-check product counts match
- Click "Import products"
- Add images to your products in Shopify


# 9\. After Import

A few things to check/do after importing:

- **Add product images** - The CSV doesn't include images, so upload these in Shopify
- **Verify collections** - Check products appear in the right automated collections
- **Adjust variant prices** - If different conditions need different prices, edit in Shopify

# Quick Reference Checklist

For each product you add:

- Select correct Brand
- Select correct Device Type (determines category)
- Select correct Model
- Pick all Conditions you're listing
- Pick all Storage/Capacity options
- Pick all Colors available
- Set Price (and Compare Price for sale badge)
- Confirm Collections look right
- Review SKU preview
- Click Add to Batch
- Export CSV when done