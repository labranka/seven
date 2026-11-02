# Seven (Shopify theme)

Custom Shopify storefront for **Seven (777 Oversized)**, a Serbian oversized T-shirt brand that donates a share of every order to charity ("nosimo sreću i delimo je").
Built on **Motion 10.6.2** by Archetype Themes and extended with custom sections, theme blocks and Web Components. Freelance project, May to July 2025.

## Custom work

**Home page**
- Hero slideshow and a **countdown** section (counts down to the next humanitarian payment)
- **Video slideshow** section with `_video` / `_video-shopify` blocks (external or Shopify-hosted video), draggable on mouse and touch
- **Community section** ("Više od mode - Srcem za zajednicu") with images and rich text
- **FAQ** section with accordion `faq-dropdown` blocks
- USP strip (quality, 1–2 day delivery, 15-day refund, 100% cotton), newsletter, blog showcase, footer and announcement bar restyled to the design

**Shopping flow**
- Quick add-to-cart popup on product cards (desktop and mobile)
- Cart drawer with a **free-shipping progress bar** (per-currency thresholds for RSD / EUR / USD / SEK, pulsing markers for the free-shipping and sale tiers)
- **Donation info** line in the cart: live amount that goes to charity for the current order
- Related-products carousel inside the cart drawer
- **Recently viewed products** on the product page (localStorage based)
- Star rating on the product page from product review metafields, colour swatches, image zoom fixes
- Collection grid, pagination, search bar, iOS scroll-lock fixes
- Serbian legal pages (terms of service, privacy policy, forms) as page templates

## Tech

- Liquid, vanilla JavaScript, CSS. No build step.
- Interactive pieces are Custom Elements: `faq-dropdown`, `video-slideshow`, `quick-atc`, `shipping-bar`, `donation-info`, `cart-recommendations`, `recently-viewed-recorder`, `recently-view-products`.
- All custom code is isolated in `assets/update_la.js`, `assets/updates_la.css` and per-section CSS files, so Motion updates stay easy to merge.
- Cart features hook into Motion's `cart:build` / `cart:updated` events and `theme.Currency.formatMoney`.
- Shipping and sale thresholds are theme settings (e.g. `EUR:150;USD:140;SEK:4000;RSD:3000`), resolved per market country or cart currency in Liquid.

## Workflow

- The `development` branch is connected to the Shopify GitHub integration (two-way sync with the theme editor).
- A Buddy pipeline (`.buddy/Deploy-to-production.fixed.yml`) deploys every push to the production theme `Seven/main`, excluding JSON templates, settings and `theme.css` so merchant edits made in the editor are not overwritten.
