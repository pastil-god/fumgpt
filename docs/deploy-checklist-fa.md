# چک‌لیست استقرار امروز

این چک‌لیست برای این نوشته شده که بتوانی همین امروز یک نسخه واقعی و قابل نمایش از سایت را روی دامنه یا VPS بالا بیاوری.

## 1. آماده‌سازی متغیرهای محیطی

از روی `.env.example` یک فایل `.env` بساز و این مقادیر را پر کن:

```env
NEXT_PUBLIC_SITE_URL=https://your-domain.com
NEXT_PUBLIC_BRAND_NAME=FumGPT
NEXT_PUBLIC_SUPPORT_EMAIL=support@your-domain.com
NEXT_PUBLIC_SUPPORT_PHONE=09xx xxx xxxx
NEXT_PUBLIC_SUPPORT_TELEGRAM=https://t.me/your-brand
NEXT_PUBLIC_INSTAGRAM=https://instagram.com/your-brand
NEXT_PUBLIC_CMS_DASHBOARD_URL=https://app.contentful.com/spaces/your-space-id

CONTENTFUL_SPACE_ID=your_space_id
CONTENTFUL_DELIVERY_TOKEN=your_delivery_token
CONTENTFUL_ENVIRONMENT=master
```

اگر امروز CMS را هنوز کامل وصل نکرده‌ای:

- می‌توانی مقادیر Contentful را خالی بگذاری
- سایت همچنان با داده‌های fallback بالا می‌آید

## 2. نصب و بیلد

```bash
pnpm install
pnpm build
pnpm start
```

## 3. بررسی بعد از بالا آمدن

این مسیرها را تست کن:

- `/`
- `/products`
- `/products/some-slug`
- `/news`
- `/login`
- `/account`
- `/cart`
- `/api/health`
- `/api/integrations`

## 4. تست سلامت

خروجی `/api/health` باید چیزی شبیه این باشد:

```json
{
  "status": "ok",
  "app": "fumgpt-storefront",
  "phase": 1
}
```

## 5. اگر Contentful وصل است

موارد زیر را حتماً از داشبورد تست کن:

- محصول جدید بساز
- `status` را روی `active` بگذار
- روی یک محصول `isFeatured` را فعال کن
- تصویر محصول آپلود کن
- یک خبر جدید منتشر کن
- فیلدهای `siteSettings` را تغییر بده و مطمئن شو هیرو تغییر می‌کند

## 6. نکات مهم برای نسخه امروز

- پرداخت هنوز غیرفعال است و نباید فعال شود.
- ورود فعلی `mock session` است و برای دمو/نمایش عمومی مناسب است.
- CMS خارجی است و مدیریت محتوا از داخل Contentful انجام می‌شود.
- اگر دامنه را وصل کردی، حتماً `NEXT_PUBLIC_SITE_URL` را به دامنه واقعی تغییر بده تا SEO و لینک‌ها درست باشند.
