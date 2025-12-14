Looptech Backend Setup Guide

Brand New / Refurbished Toggle System

**Guide to s**et up products, tags, and collections in an optimal way for backend communication + scalability.

# 1\. Product Setup

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

# 3\. Tags (Critical!)

Tags make the toggle work. Apply these to **every product**:

| **Category** | **Tags to Use** |
| --- | --- |
| Condition | brand-new, refurbished, refurbished-grade-a, refurbished-grade-b, refurbished-grade-c |
| --- | --- |
| Product Type | smartphone, tablet, laptop, gaming-pc, desktop, smartwatch, accessory |
| --- | --- |
| Brand | apple, samsung, microsoft, dell, hp, lenovo, asus, msi, huawei, acer |
| --- | --- |
| Device Model | iphone-14, iphone-14-pro, macbook-pro-m1, galaxy-s23, etc. |
| --- | --- |
| Capacity | 64gb, 128gb, 256gb, 512gb, 1tb |
| --- | --- |

**Tag Rules:** All lowercase, use hyphens (not spaces), be consistent.

**Example tags for iPhone 14 Pro with new & refurb variants:** brand-new, refurbished, refurbished-grade-a, smartphone, apple, iphone-14-pro, 256gb, 5g, unlocked

# 4\. Collections

Create **two parallel sets** of automated collections:

| **Brand New Collection** | **Handle** | **Refurbished Collection** | **Handle** |
| --- | --- | --- | --- |
| All Brand New | all-new | All Refurbished | all-refurbished |
| --- | --- | --- | --- |
| New Phones | new-phones | Refurbished Phones | refurbished-phones |
| --- | --- | --- | --- |
| New Laptops | new-laptops | Refurbished Laptops | refurbished-laptops |
| --- | --- | --- | --- |
| New Gaming PCs | new-gaming-pcs | Refurbished Gaming PCs | refurbished-gaming-pcs |
| --- | --- | --- | --- |
| New Apple | new-apple | Refurbished Apple | refurbished-apple |
| --- | --- | --- | --- |

## How to Create Automated Collections

- Go to Products → Collections → Create Collection
- Set collection type to **Automated**
- Add conditions:

**"All Brand New":** Product tag is equal to "brand-new" **"Refurbished iPhones":** Tag contains "refurbished" AND tag contains "iphone"

# 5\. Menu Structure

Create **two separate menus** in Online Store → Navigation:

| **Main Menu (handle: main-menu)** | **Refurbished Menu (handle: refurbished-menu)** |
| --- | --- |
| Shop New →<br><br>All New → /collections/all-new<br><br>New Phones → /collections/new-phones<br><br>New Laptops → /collections/new-laptops<br><br>Brands → /collections/new-apple, etc. | Shop Refurbished →<br><br>All Refurbished → /collections/all-refurbished<br><br>Refurb Phones → /collections/refurbished-phones<br><br>Refurb Laptops → /collections/refurbished-laptops<br><br>Shop by Grade → Grade A, B, C collections |
| --- | --- |

# Quick Checklist: Adding a New Product

- Create product with clear title (e.g., "iPhone 14 Pro 256GB")
- Add variants for each condition/color combo
- Set SKUs following the format: BRAND-MODEL-CAP-COND-COLOR-NUM
- Set prices and inventory for each variant
- Add ALL required tags: condition + type + brand + model + capacity
- Upload images
- **Verify:** Product appears in correct automated collections

**Summary - What I Need From You:**

1\. Products created with variants for each condition

2\. SKUs following the naming format

3\. Tags applied consistently to every product

4\. Collections set up as automated with correct conditions

5\. Two menus created with matching handles

_Once this is in place, I can implement the toggle code that switches everything seamlessly._