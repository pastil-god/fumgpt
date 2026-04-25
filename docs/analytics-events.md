# Storefront Analytics

This storefront now has a lightweight internal analytics layer that is designed to stay:

- low-cost
- privacy-conscious
- easy to move forward later without vendor lock-in

## Where Analytics Events Are Stored

By default, events are stored in the local application database table:

- `analytics_events`

You can inspect them locally with Prisma Studio or any PostgreSQL client pointed at the current app database.

Suggested local flow:

```bash
cd apps/web
pnpm exec prisma studio
```

Then open the `AnalyticsEvent` model.

## Privacy Notes

This layer intentionally avoids heavy tracking patterns.

- No fingerprinting
- No paid vendor dependency by default
- No raw checkout contact fields in analytics metadata
- No raw email, phone, address, OTP code, token, or message body fields should be stored in analytics metadata

Analytics metadata is sanitized before storage, and obviously sensitive keys are dropped.

## Tracked Events

Current tracked events:

- `homepage_view`
  - when `/` is viewed
- `product_page_view`
  - when a product detail page is viewed
- `add_to_cart`
  - when a product is added through the real cart route
- `begin_checkout`
  - when `/checkout` is opened with a non-empty cart
- `order_created`
  - when checkout successfully creates a real order
- `login_success`
  - when OTP verification succeeds and a session is created
- `login_failure`
  - when login flow fails before session creation
- `academy_article_view`
  - currently mapped to academy-related editorial article pages under `/news/[slug]`
  - this remains an honest bridge until a dedicated academy article route is live

## Implementation Notes

- Page views use a tiny internal beacon to `POST /api/analytics`
- Transactional events like `add_to_cart`, `order_created`, and login events are tracked server-side
- External analytics fan-out is intentionally disabled by default

## External Adapter

Environment variable:

- `ANALYTICS_ADAPTER=disabled`

Current behavior:

- `disabled`: store events internally only

The adapter seam exists in `apps/web/lib/analytics/index.ts` so a future external provider can be added without rewriting event calls across the app.
