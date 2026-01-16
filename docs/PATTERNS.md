# Quick Reference Patterns

> Find patterns in the codebase first: `grep -r "pattern" sections/`

---

## Shopify Routes

```liquid
{{ routes.root_url }}              # /
{{ routes.account_url }}           # /account
{{ routes.account_login_url }}     # /account/login
{{ routes.account_logout_url }}    # /account/logout
{{ routes.account_register_url }}  # /account/register
{{ routes.account_recover_url }}   # /account/recover
{{ routes.account_addresses_url }} # /account/addresses
{{ routes.cart_url }}              # /cart
{{ routes.search_url }}            # /search
```

---

## Common Liquid Filters

```liquid
{{ variable | default: 'fallback' }}
{{ price | money }}
{{ date | date: "%B %d, %Y" }}
{{ 'translation.key' | t }}
{{ 'file.css' | asset_url | stylesheet_tag }}
{{ image | image_url: width: 400 }}
{{ array | join: ', ' }}
{{ string | split: ',' }}
```

---

## Customer Objects

```liquid
{{ customer }}                     # Current logged-in customer
{{ customer.first_name }}
{{ customer.email }}
{{ customer.orders_count }}
{{ customer.orders }}              # Loop with: {% for order in customer.orders %}
{{ customer.default_address }}
{{ customer.addresses }}
```

---

## Order Objects

```liquid
{{ order.name }}                   # Order number (#1001)
{{ order.created_at }}
{{ order.financial_status }}       # paid, pending, refunded
{{ order.fulfillment_status }}     # fulfilled, unfulfilled, partial
{{ order.total_price | money }}
{{ order.line_items }}
{{ order.customer_url }}           # Link to order detail
```

---

## Form Patterns

**Login form:**
```liquid
{% form 'customer_login' %}
  {% if form.errors %}{{ form.errors | default_errors }}{% endif %}
  <input type="email" name="customer[email]" required>
  <input type="password" name="customer[password]" required>
  <button type="submit">Sign In</button>
{% endform %}
```

**Find more:** `grep -r "{% form" sections/ snippets/`

---

## Section Schema (Minimal)

```liquid
{% schema %}
{
  "name": "Section Name",
  "settings": [
    { "type": "text", "id": "heading", "label": "Heading", "default": "Title" },
    { "type": "checkbox", "id": "show_feature", "label": "Show Feature", "default": true }
  ],
  "presets": [{ "name": "Section Name" }]
}
{% endschema %}
```

---

## JS Pattern (IIFE)

```javascript
(function() {
  'use strict';
  
  document.addEventListener('click', (e) => {
    if (e.target.matches('.selector')) {
      // handle
    }
  });
})();
```

**Reference:** `assets/global.js` for theme patterns

---

## CSS Variables

Check `:root` in `assets/base.css` for available variables.

Common:
```css
var(--color-foreground)
var(--color-background)
var(--color-border)
var(--font-body-family)
var(--font-heading-family)
```

---

## Breakpoints

```css
/* Mobile first (default) */
.component { }

/* Tablet */
@media screen and (min-width: 750px) { }

/* Desktop */
@media screen and (min-width: 990px) { }
```

---

## Finding Examples

Before writing new code, find existing patterns:

```bash
# Find form examples
grep -r "{% form" sections/ snippets/

# Find customer usage
grep -r "customer\." sections/ snippets/

# Find order loops
grep -r "for order in" sections/

# Find JS component patterns
head -100 assets/product-form.js
```
