# Simple Contentful Content Model

This is a practical Contentful model for the current Farsi RTL storefront.

Goals:

- keep editing simple for non-technical admins
- support today's priorities: subscriptions + education
- leave room for future API sales + AI agent marketplace
- avoid deep nesting, generic page builders, and hard-to-understand schemas

Recommended modeling rules:

- Use singleton entries for `Site Settings`, `Homepage`, and `Footer Settings`.
- Keep references shallow. `Homepage` can reference other entries, but avoid references inside those referenced entries.
- Prefer Contentful's built-in publish/unpublish workflow instead of adding a custom `status` field everywhere.
- Use simple fields for display content. Keep pricing, checkout, discount logic, inventory, and entitlement logic out of the CMS.
- Limit multi-reference fields so editors are not managing huge lists inside one entry.

## Overview

| Content type | Kind | Notes |
|---|---|---|
| `Site Settings` | Singleton | Brand, SEO defaults, contact info, social links |
| `Homepage` | Singleton | Assembles the homepage from a few simple references |
| `Hero Section` | Single entry referenced by Homepage | Reusable homepage hero content |
| `Product Category` | Repeatable | Storefront category labels and descriptions |
| `Product Display Content` | Repeatable | Product page and listing content only |
| `FAQ Item` | Repeatable | Reusable FAQ entries |
| `Academy Article` | Repeatable | Education content |
| `Promo Banner` | Repeatable | Campaign/promo strips or cards |
| `Trust Section` | Singleton or one reusable entry | "Why choose us" section |
| `Footer Settings` | Singleton | Footer copy and footer-specific settings |

## 1. Site Settings

Purpose:
Global brand and storefront defaults shared across the site.

Suggested entry policy:
Only one entry. Name it `main-site-settings`.

Fields:

| Field | Type | Required | Notes |
|---|---|---|---|
| `brandName` | Short text | Yes | Public brand name |
| `brandTagline` | Short text | No | Short subtitle under logo |
| `defaultSeoTitle` | Short text | Yes | Fallback title for pages without custom SEO |
| `defaultSeoDescription` | Long text | Yes | Fallback meta description |
| `logo` | Media | No | SVG or PNG logo |
| `supportPhone` | Short text | No | Public support phone |
| `supportEmail` | Short text | No | Public support email |
| `supportAddress` | Long text | No | Postal address or support guidance |
| `telegramUrl` | Short text | No | Social/contact link |
| `instagramUrl` | Short text | No | Social/contact link |
| `whatsappUrl` | Short text | No | Social/contact link |
| `defaultLocale` | Short text | Yes | Set to `fa-IR` |
| `textDirection` | Short text | Yes | Set to `rtl` |

Validation suggestions:

- `defaultLocale` allowed value: `fa-IR`
- `textDirection` allowed value: `rtl`
- email field should match email format
- URL fields must start with `https://`
- `defaultSeoTitle` max 70 chars
- `defaultSeoDescription` max 160-180 chars

Editable by non-technical editors:

- all brand text
- logo
- contact details
- social links
- SEO defaults

## 2. Homepage

Purpose:
Controls which content appears on the homepage and in what order, without forcing editors into a complex block-builder.

Suggested entry policy:
Only one entry. Name it `main-homepage`.

Fields:

| Field | Type | Required | Notes |
|---|---|---|---|
| `internalName` | Short text | Yes | Example: `Main Homepage` |
| `seoTitle` | Short text | No | Homepage-specific SEO title |
| `seoDescription` | Long text | No | Homepage-specific SEO description |
| `hero` | Reference (single, Hero Section) | Yes | Main hero entry |
| `topPromoBanners` | Reference (many, Promo Banner) | No | Max 2 |
| `featuredCategoriesTitle` | Short text | No | Section heading |
| `featuredCategories` | Reference (many, Product Category) | No | Max 6 |
| `featuredProductsTitle` | Short text | No | Section heading |
| `featuredProducts` | Reference (many, Product Display Content) | No | Max 8 |
| `trustSection` | Reference (single, Trust Section) | No | Why choose us section |
| `faqTitle` | Short text | No | Section heading |
| `faqItems` | Reference (many, FAQ Item) | No | Max 8 |
| `academyTitle` | Short text | No | Section heading |
| `featuredAcademyArticles` | Reference (many, Academy Article) | No | Max 6 |
| `bottomPromoBanner` | Reference (single, Promo Banner) | No | Optional end-of-page campaign |

Validation suggestions:

- enforce max references on list fields
- `seoTitle` max 70 chars
- `seoDescription` max 160-180 chars
- keep only one homepage entry

Editable by non-technical editors:

- section titles
- which categories/products/articles/FAQs appear
- which promo banners appear
- homepage SEO text

## 3. Hero Section

Purpose:
Stores the main landing hero copy and CTA buttons.

Suggested entry policy:
Usually one main hero entry, but can be reused later for seasonal homepage variants.

Fields:

| Field | Type | Required | Notes |
|---|---|---|---|
| `internalName` | Short text | Yes | Example: `Homepage Hero - Spring` |
| `eyebrow` | Short text | No | Small label above title |
| `title` | Short text | Yes | Main hero headline |
| `description` | Long text | Yes | Supporting copy |
| `primaryCtaLabel` | Short text | No | Main button text |
| `primaryCtaUrl` | Short text | No | Main button URL |
| `secondaryCtaLabel` | Short text | No | Secondary button text |
| `secondaryCtaUrl` | Short text | No | Secondary button URL |
| `badgeText` | Short text | No | Small highlight such as "Ready to buy" |
| `proofPoints` | List of short text | No | Max 3 short trust points |
| `image` | Media | No | Optional visual for the hero |

Validation suggestions:

- `title` max 90 chars
- `description` max 220-260 chars
- CTA URL fields should start with `/` or `https://`
- if CTA label is filled, require CTA URL too
- `proofPoints` max 3 items

Editable by non-technical editors:

- all copy
- CTA labels and links
- badge text
- proof points
- hero image

## 4. Product Category

Purpose:
Simple storefront grouping for current and future products such as subscriptions, education, APIs, and agents.

Fields:

| Field | Type | Required | Notes |
|---|---|---|---|
| `title` | Short text | Yes | Public category name |
| `slug` | Short text | Yes | URL-safe category slug |
| `description` | Long text | No | Short category intro |
| `shortLabel` | Short text | No | Optional compact label for chips/tabs |
| `coverImage` | Media | No | Optional category image |
| `sortOrder` | Number | No | Smaller number = earlier display |
| `showOnHomepage` | Boolean | No | Optional helper flag |

Validation suggestions:

- slug regex: `^[a-z0-9-]+$`
- slug unique
- `title` max 50 chars
- `description` max 160 chars

Editable by non-technical editors:

- title
- description
- short label
- image
- order and homepage toggle

## 5. Product Display Content

Purpose:
Stores product marketing and display content only. This is not the source of truth for checkout or account provisioning.

Fields:

| Field | Type | Required | Notes |
|---|---|---|---|
| `title` | Short text | Yes | Public product name |
| `slug` | Short text | Yes | URL-safe product slug |
| `productType` | Short text | Yes | Suggested values: `subscription`, `education`, `api`, `agent` |
| `category` | Reference (single, Product Category) | Yes | Product grouping |
| `shortDescription` | Long text | Yes | Card/listing summary |
| `fullDescription` | Rich text | No | Main product detail content |
| `priceText` | Short text | Yes | Example: `از ۲۲۰٬۰۰۰ تومان` |
| `comparePriceText` | Short text | No | Optional old price / crossed price |
| `billingLabel` | Short text | No | Example: `ماهانه` or `یک ماهه` |
| `badge` | Short text | No | Example: `پرفروش` or `تخفیف ویژه` |
| `deliveryText` | Short text | No | Example: `تحویل دیجیتال` |
| `keyBenefits` | List of short text | No | Max 6 |
| `coverImage` | Media | Yes | Main product image |
| `gallery` | Media (multiple) | No | Max 5 |
| `primaryCtaLabel` | Short text | No | Example: `مشاهده جزئیات` |
| `primaryCtaUrl` | Short text | No | Usually product page or checkout page |
| `isFeatured` | Boolean | No | Homepage helper flag |
| `sortOrder` | Number | No | Listing order |

Validation suggestions:

- slug regex: `^[a-z0-9-]+$`
- slug unique
- `productType` allowed values: `subscription`, `education`, `api`, `agent`
- `priceText` max 40 chars
- `keyBenefits` max 6 items
- `gallery` max 5 assets
- CTA URL fields should start with `/` or `https://`

Editable by non-technical editors:

- all public product copy
- price display text
- badges
- benefits
- images
- homepage feature toggle

Note:
Using `priceText` instead of a numeric pricing model keeps this flexible for subscriptions now and API/agent offers later. If you later need price sorting/filtering, add a numeric helper field then.

## 6. FAQ Item

Purpose:
Reusable FAQ items for homepage, product pages, and academy pages.

Fields:

| Field | Type | Required | Notes |
|---|---|---|---|
| `question` | Short text | Yes | FAQ question |
| `answer` | Rich text | Yes | FAQ answer |
| `group` | Short text | No | Suggested values: `homepage`, `product`, `academy`, `general` |
| `sortOrder` | Number | No | Ordering within a section |

Validation suggestions:

- `question` max 120 chars
- `group` use predefined values

Editable by non-technical editors:

- question
- answer
- grouping
- order

## 7. Academy Article

Purpose:
Educational content for tutorials, guides, and future academy growth.

Fields:

| Field | Type | Required | Notes |
|---|---|---|---|
| `title` | Short text | Yes | Article title |
| `slug` | Short text | Yes | URL-safe slug |
| `excerpt` | Long text | Yes | Card summary and SEO fallback |
| `body` | Rich text | Yes | Main article content |
| `coverImage` | Media | No | Article cover |
| `publishDate` | Date & time | Yes | Public publish date |
| `topic` | Short text | No | Simple category label like `ChatGPT`, `Automation`, `API` |
| `readingTimeLabel` | Short text | No | Example: `8 دقیقه` |
| `isFeatured` | Boolean | No | Homepage helper flag |
| `seoTitle` | Short text | No | Optional override |
| `seoDescription` | Long text | No | Optional override |

Validation suggestions:

- slug regex: `^[a-z0-9-]+$`
- slug unique
- `excerpt` max 180-220 chars
- `seoTitle` max 70 chars
- `seoDescription` max 160-180 chars

Editable by non-technical editors:

- article title, excerpt, body
- cover image
- publish date
- topic
- featured toggle
- SEO overrides

## 8. Promo Banner

Purpose:
Short campaign content for sales, launches, academy pushes, or announcements.

Fields:

| Field | Type | Required | Notes |
|---|---|---|---|
| `internalName` | Short text | Yes | Example: `Nowruz campaign banner` |
| `title` | Short text | Yes | Main banner text |
| `text` | Long text | No | Supporting copy |
| `ctaLabel` | Short text | No | Button text |
| `ctaUrl` | Short text | No | Button link |
| `image` | Media | No | Optional visual |
| `theme` | Short text | No | Suggested values: `default`, `sale`, `academy`, `launch` |
| `activeFrom` | Date & time | No | Optional schedule start |
| `activeUntil` | Date & time | No | Optional schedule end |

Validation suggestions:

- `title` max 80 chars
- `text` max 160 chars
- CTA URL fields should start with `/` or `https://`
- if `activeUntil` exists, it should be after `activeFrom`
- if CTA label is filled, require CTA URL too

Editable by non-technical editors:

- all text
- CTA
- image
- theme
- active dates

## 9. Trust Section

Purpose:
Homepage "Why choose us" content.

Suggested entry policy:
Usually one entry referenced by `Homepage`.

Why this model is intentionally simple:
Instead of introducing a separate `Trust Item` type, this keeps the section easy for beginner editors by using a fixed three-card layout.

Fields:

| Field | Type | Required | Notes |
|---|---|---|---|
| `internalName` | Short text | Yes | Example: `Main Trust Section` |
| `title` | Short text | Yes | Section heading |
| `description` | Long text | No | Optional section intro |
| `item1Title` | Short text | Yes | First reason title |
| `item1Text` | Long text | Yes | First reason description |
| `item2Title` | Short text | Yes | Second reason title |
| `item2Text` | Long text | Yes | Second reason description |
| `item3Title` | Short text | Yes | Third reason title |
| `item3Text` | Long text | Yes | Third reason description |

Validation suggestions:

- title max 70 chars
- each item title max 50 chars
- each item text max 160 chars

Editable by non-technical editors:

- section title and intro
- all three trust items

Note:
If the team later needs 4+ trust cards or reusable trust cards across many pages, split this into `Trust Section` + `Trust Item`. For now, fixed fields are easier to manage.

## 10. Footer Settings

Purpose:
Controls footer-specific copy without mixing it into global site settings.

Suggested entry policy:
Only one entry. Name it `main-footer-settings`.

Fields:

| Field | Type | Required | Notes |
|---|---|---|---|
| `internalName` | Short text | Yes | Example: `Main Footer` |
| `aboutText` | Long text | Yes | Short footer description |
| `supportTitle` | Short text | No | Footer support heading |
| `supportText` | Long text | No | Support note shown in footer |
| `trustBadges` | List of short text | No | Max 4 simple trust labels |
| `copyrightText` | Short text | Yes | Footer bottom text |
| `legalNote` | Short text | No | Optional extra note |

Validation suggestions:

- `aboutText` max 220 chars
- `trustBadges` max 4 items
- `copyrightText` max 120 chars

Editable by non-technical editors:

- footer copy
- support note
- trust badges
- copyright
- legal note

## Recommended editor experience

To keep this beginner-friendly in Contentful:

- Mark singleton entries clearly: `main-site-settings`, `main-homepage`, `main-footer-settings`.
- Put help text on every URL field: "Use `/path` for internal links or `https://...` for external links."
- Use validations with dropdown values for fields like `productType`, `group`, and `theme`.
- Keep references curated:
  - homepage banners max 2
  - featured categories max 6
  - featured products max 8
  - FAQ items max 8
  - featured academy articles max 6
- Prefer one clear field over multiple "advanced" fields unless the UI truly needs them.

## What I would avoid

- a generic page-builder with dozens of block types
- deeply nested references
- separate CTA objects for every component
- putting checkout or pricing logic inside Contentful
- duplicating `status` fields when publish/unpublish already handles visibility

## Implementation note

This model is slightly simpler than the current flattened homepage approach in the codebase.
If we implement it, the main app change would be:

- keep `Homepage` as the page assembler
- move hero content into its own referenced entry
- keep banners, trust, FAQ, categories, products, and academy items as shallow reusable entries
- keep footer content separate from site-wide settings
