# TASK-2: Sign In + Account Management

> **Status**: 🟡 IN PROGRESS  
> **Estimate**: 8-12 hours  
> **Verify**: `shopify theme dev` → test `/account/login` and `/account`

---

## Goal

Build a complete sign-in and account management system. Users can log in, view orders, manage profile. Guests can track orders without an account.

---

## Success Signals

Run these checks after implementation:

```bash
shopify theme check                    # No errors
shopify theme dev                      # Start local server
```

Then verify:
- [ ] `/account/login` — Custom login form renders
- [ ] `/account/login` — Guest lookup form visible
- [ ] `/account/login` — Submit invalid creds → error displays
- [ ] `/account` — Dashboard with sidebar renders (logged in)
- [ ] `/account` — Orders list shows customer orders
- [ ] `/account#profile` — Profile section accessible via hash
- [ ] Mobile (375px) — All pages usable
- [ ] Theme Editor — New sections appear, settings work

---

## Files to Create

```
templates/customers/login.json
templates/customers/account.json
sections/account-login.liquid
sections/account-dashboard.liquid  
snippets/account-sidebar.liquid
snippets/account-order-card.liquid
assets/account.css
assets/account.js
```

---

## Progress

| ID | Task | ✓ |
|----|------|---|
| 2A.1 | Login page template + form | ✅ |
| 2A.2 | Guest order lookup section | ✅ |
| 2A.3 | Form error states | ✅ |
| 2A.4 | Mobile responsive CSS | ✅ |
| 2A.5 | Account registration form | ✅ |
| 2A.6 | Password recovery form | ✅ |
| 2B.1 | Dashboard layout + horizontal tabs | ✅ |
| 2B.2 | Orders section with cards | ✅ |
| 2B.3 | Profile section (full layout) | ✅ |
| 2B.4 | Tab switching JS | ✅ |
| 2B.5 | Placeholder sections (6 tabs) | ✅ |
| 2B.6 | Logout with confirm | ✅ |
| 2C.1 | Guest form validation | ⬜ |

### Notes
- Login page redesigned to match modern reference design (clean centered card, no header/footer)
- Unified login/register/recover views with JavaScript view switching
- Social login buttons (Google/Apple) added visually but disabled (requires app integration)
- Dashboard matches reference with horizontal tabs and card-based profile layout
- Profile section includes: Personal details, Billing Address, Delivery Address, Email preferences, Bank details
- All 7 tabs implemented: Orders, Protection plans, Trade-ins, Profile, Favourites, Refer a friend, Other
- Tested on desktop (1280px) and mobile (375px)

---

## Implementation

### 2A.1 — Login Page Template

**Create `templates/customers/login.json`:**
```json
{
  "sections": {
    "main": { "type": "account-login" }
  },
  "order": ["main"]
}
```

**Create `sections/account-login.liquid`:**

Use Shopify's native login form. Find existing form patterns first:
```bash
grep -r "form 'customer" sections/ snippets/
```

Requirements:
- `{% form 'customer_login' %}` with email + password inputs
- Forgot password link → `{{ routes.account_recover_url }}`
- Create account link → `{{ routes.account_register_url }}`
- Schema: `heading` (text), `show_guest_lookup` (checkbox), `button_label` (text)

**Verify:** Visit `/account/login`, form renders and submits.

---

### 2A.2 — Guest Order Lookup

**Add to `sections/account-login.liquid`** below the main form:

```liquid
{% if section.settings.show_guest_lookup %}
  <form action="/tools/order_status" method="get" class="guest-lookup">
    <input type="text" name="order" placeholder="Order number (e.g. #1001)" required>
    <input type="email" name="email" placeholder="Email" required>
    <button type="submit">Track Order</button>
  </form>
{% endif %}
```

**Verify:** Submit with real order number → redirects to Shopify order status.

---

### 2A.3 — Error States

**Add to `sections/account-login.liquid`** inside the form:

```liquid
{% if form.errors %}
  <div class="form-error" role="alert">
    {{ form.errors | default_errors }}
  </div>
{% endif %}
```

**Verify:** Submit wrong password → error message appears.

---

### 2A.4 — Mobile CSS

**Create `assets/account.css`:**

Mobile-first approach. Reference existing theme variables:
```bash
grep -r "var(--" assets/base.css | head -20
```

Key styles:
- `.account-login` — centered, max-width 400px on desktop
- `.form-error` — red background, padding
- `.guest-lookup` — visually separated card
- Inputs: min-height 44px for touch

**Verify:** Chrome DevTools → 375px, form usable.

---

### 2B.1 — Dashboard Layout

**Create `templates/customers/account.json`:**
```json
{
  "sections": {
    "main": { "type": "account-dashboard" }
  },
  "order": ["main"]
}
```

**Create `sections/account-dashboard.liquid`:**

Structure:
```
<div class="account-layout">
  <aside class="account-sidebar">
    {% render 'account-sidebar' %}
  </aside>
  <main class="account-content">
    <!-- Tab panels here -->
  </main>
</div>
```

Desktop: sidebar 250px fixed, content flex-grow  
Mobile: sidebar becomes collapsible menu

**Create `snippets/account-sidebar.liquid`:**

Links with `data-section` attributes:
- Orders (default)
- Protection Plans  
- Trade-ins
- Profile
- Favourites
- Refer a Friend
- Log Out → `{{ routes.account_logout_url }}`

Active state: `.is-active` class

**Verify:** `/account` shows two-column layout on desktop.

---

### 2B.2 — Orders Section

**Add to `sections/account-dashboard.liquid`:**

```liquid
<div data-panel="orders" class="account-panel">
  {% if customer.orders_count > 0 %}
    {% for order in customer.orders %}
      {% render 'account-order-card', order: order %}
    {% endfor %}
  {% else %}
    <p class="empty-state">No orders yet. <a href="/collections/all">Start shopping</a></p>
  {% endif %}
</div>
```

**Create `snippets/account-order-card.liquid`:**

Display: order.name, order.created_at (formatted), order.fulfillment_status, order.total_price, link to order.customer_url

**Verify:** Log in as customer with orders → orders display.

---

### 2B.3 — Profile Section

**Add to `sections/account-dashboard.liquid`:**

```liquid
<div data-panel="profile" class="account-panel" hidden>
  <h2>Your Profile</h2>
  <p><strong>Name:</strong> {{ customer.name }}</p>
  <p><strong>Email:</strong> {{ customer.email }}</p>
  {% if customer.default_address %}
    <p><strong>Address:</strong> {{ customer.default_address | format_address }}</p>
  {% endif %}
  <a href="{{ routes.account_addresses_url }}">Manage addresses</a>
</div>
```

---

### 2B.4 — Tab Switching JS

**Create `assets/account.js`:**

Reference theme's JS patterns:
```bash
head -50 assets/global.js
```

Requirements:
- Click `[data-section]` → toggle panels
- Update URL hash
- On load, check hash and show correct panel
- Mobile: toggle sidebar visibility

Pattern:
```javascript
(function() {
  'use strict';
  // Event delegation on sidebar links
  // Toggle hidden attribute on [data-panel] elements
  // Handle hash on page load
})();
```

**Verify:** Click sidebar links → panels switch. Reload with `#profile` → profile shows.

---

### 2B.5 — Placeholder Sections

**Add to `sections/account-dashboard.liquid`:**

For: protection, trade-ins, favourites, refer

```liquid
<div data-panel="protection" class="account-panel" hidden>
  <h2>Protection Plans</h2>
  <p class="empty-state">Coming soon.</p>
</div>
```

Repeat for each.

---

### 2B.6 — Logout

In `snippets/account-sidebar.liquid`:

```liquid
<a href="{{ routes.account_logout_url }}" 
   class="account-sidebar__link account-sidebar__link--logout"
   onclick="return confirm('Log out?')">
  Log Out
</a>
```

---

### 2C.1 — Guest Form Validation

**Add to `assets/account.js`:**

Basic validation before submit:
- Order number not empty
- Email format valid
- Show inline error if invalid

---

## Reference

- Shopify Customer object: https://shopify.dev/docs/api/liquid/objects/customer
- Shopify Order object: https://shopify.dev/docs/api/liquid/objects/order
- Theme routes: `{{ routes.account_login_url }}`, `{{ routes.account_logout_url }}`, etc.

---

## Completion Checklist

Before marking complete:

```bash
shopify theme check   # Must pass
```

- [ ] All subtasks marked ✅
- [ ] Mobile tested (375px)
- [ ] Desktop tested (1200px)
- [ ] Theme Editor preview works
- [ ] No console errors

Update status to 🟢 COMPLETE when done.
