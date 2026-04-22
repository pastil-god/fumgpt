# FumGPT Storefront

نسخه فاز اول فروشگاه FumGPT روی Next.js که برای لانچ سریع، نمایش عمومی، مدیریت محتوا از CMS و استقرار روی دامنه واقعی آماده شده است.

## وضعیت فعلی

- صفحه اصلی، محصولات، جزئیات محصول، خبرها، ورود، حساب کاربری و سبد خرید آماده نمایش عمومی هستند.
- پرداخت هنوز وصل نشده و عمداً خارج از این فاز نگه داشته شده است.
- CMS از طریق Contentful پشتیبانی می‌شود و اگر تنظیم نشده باشد، سایت به‌صورت خودکار با داده‌های fallback بالا می‌آید.
- احراز هویت فعلاً `mock session` است تا تجربه ورود واقعی‌تر باشد، اما هنوز به OTP یا دیتابیس کاربر وصل نیست.

## اجرا

### نصب

```bash
pnpm install
```

### توسعه محلی

```bash
pnpm dev
```

اگر خواستی Turbopack را تست کنی:

```bash
pnpm dev:turbo
```

### بیلد production

```bash
pnpm build
```

### اجرای production

```bash
pnpm start
```

## متغیرهای محیطی مهم

نمونه کامل در فایل `.env.example` آمده است. مهم‌ترین موارد:

```env
NEXT_PUBLIC_SITE_URL=https://your-domain.com
NEXT_PUBLIC_BRAND_NAME=FumGPT
NEXT_PUBLIC_SUPPORT_EMAIL=support@example.com
NEXT_PUBLIC_SUPPORT_PHONE=0900 000 0000
NEXT_PUBLIC_SUPPORT_ADDRESS=آدرس یا توضیح مسیر پشتیبانی
NEXT_PUBLIC_SUPPORT_TELEGRAM=https://t.me/example
NEXT_PUBLIC_SUPPORT_WHATSAPP=https://wa.me/989000000000
NEXT_PUBLIC_INSTAGRAM=https://instagram.com/example
NEXT_PUBLIC_CMS_DASHBOARD_URL=https://app.contentful.com/spaces/your-space-id

CONTENTFUL_SPACE_ID=your_space_id
CONTENTFUL_DELIVERY_TOKEN=your_delivery_token
CONTENTFUL_ENVIRONMENT=master
```

اگر متغیرهای Contentful خالی باشند:

- تنظیمات هدر، فوتر و پشتیبانی از fallback داخلی خوانده می‌شوند
- محتوای صفحه اصلی از fallback داخلی خوانده می‌شود
- محصولات و خبرها از داده‌های محلی پروژه نمایش داده می‌شوند

## CMS

راهنمای راه‌اندازی:

- [راه‌اندازی Contentful](docs/contentful-setup-fa.md)

راهنمای استفاده روزانه برای ادمین‌ها:

- [راهنمای مدیریت محتوا](docs/cms-admin-guide-fa.md)

آنچه الان از CMS قابل مدیریت است:

- تنظیمات کلی برند و سایت
- لوگو، اطلاعات تماس و شبکه‌های اجتماعی
- متن نوار بالای سایت و آیتم‌های اعتماد
- منوی اصلی و لینک‌های فوتر
- محتوای هیرو و بنرهای صفحه اصلی
- نمایش/عدم نمایش بخش‌های اصلی صفحه اول
- محصولات، قیمت، تخفیف، تصویر، گالری و ویدئو
- خبرها، خلاصه، متن، تصویر، ویدئو و تاریخ انتشار

## احراز هویت

فاز فعلی:

- صفحه ورود کار می‌کند و نشست نمایشی امن می‌سازد
- مسیر `/account` از روی همین نشست کار می‌کند
- خروج از حساب هم فعال است

فعلاً mock است:

- ثبت‌نام واقعی
- OTP
- بازیابی رمز
- دیتابیس کاربر
- نقش‌های واقعی

## مسیرهای مهم

- `/` صفحه اصلی
- `/products` لیست محصولات
- `/products/[slug]` جزئیات محصول
- `/news` لیست خبرها
- `/news/[slug]` جزئیات خبر
- `/login` ورود
- `/account` حساب کاربری
- `/cart` سبد خرید
- `/api/health` بررسی سلامت سرویس
- `/api/integrations` وضعیت CMS / auth / commerce mock

## استقرار امروز

چک‌لیست کامل:

- [چک‌لیست استقرار](docs/deploy-checklist-fa.md)

خلاصه سریع:

1. فایل `.env` را از روی `.env.example` بساز.
2. `NEXT_PUBLIC_SITE_URL` را روی دامنه واقعی بگذار.
3. اگر Contentful داری، کلیدهای آن را وارد کن.
4. `pnpm install`
5. `pnpm build`
6. `pnpm start`
7. بعد از بالا آمدن، مسیر `https://your-domain.com/api/health` را چک کن.

## یادداشت فاز بعد

- اتصال auth واقعی
- پنل سفارش و پرداخت
- سبد خرید واقعی و ثبت سفارش
- OTP و پیامک
- نقش ادمین و پنل مدیریتی داخلی اگر بعداً لازم شد
