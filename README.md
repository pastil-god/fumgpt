# FumGPT Storefront

نسخه فاز اول فروشگاه FumGPT روی Next.js که برای لانچ سریع، نمایش عمومی، مدیریت محتوا از CMS و استقرار روی دامنه واقعی آماده شده است.

## وضعیت فعلی

- صفحه اصلی، محصولات، جزئیات محصول، خبرها، ورود، حساب کاربری و سبد خرید آماده نمایش عمومی هستند.
- پرداخت هنوز وصل نشده و عمداً خارج از این فاز نگه داشته شده است.
- CMS از طریق Contentful پشتیبانی می‌شود و اگر تنظیم نشده باشد، سایت به‌صورت خودکار با داده‌های محلی بالا می‌آید.
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

نکته:

- اسکریپت `dev` عمداً با `webpack` اجرا می‌شود چون در این پروژه برای توسعه روزمره تجربه نرم‌تر و پایدارتر می‌دهد.
- اگر خواستی Turbopack را تست کنی:

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

سایت به‌صورت پیش‌فرض روی آدرس زیر بالا می‌آید:

```bash
http://localhost:3000
```

## متغیرهای محیطی مهم

نمونه کامل در فایل `.env.example` آمده است. مهم‌ترین موارد:

```env
NEXT_PUBLIC_SITE_URL=https://your-domain.com
NEXT_PUBLIC_BRAND_NAME=FumGPT
NEXT_PUBLIC_SUPPORT_EMAIL=support@example.com
NEXT_PUBLIC_SUPPORT_PHONE=0900 000 0000
NEXT_PUBLIC_SUPPORT_TELEGRAM=https://t.me/example
NEXT_PUBLIC_INSTAGRAM=https://instagram.com/example
NEXT_PUBLIC_CMS_DASHBOARD_URL=https://app.contentful.com/spaces/your-space-id

CONTENTFUL_SPACE_ID=your_space_id
CONTENTFUL_DELIVERY_TOKEN=your_delivery_token
CONTENTFUL_ENVIRONMENT=master
```

اگر متغیرهای Contentful خالی باشند:

- محصولات از داده‌های محلی خوانده می‌شوند
- خبرها از داده‌های محلی خوانده می‌شوند
- تنظیمات هیرو و بنر صفحه اصلی از fallback داخلی خوانده می‌شوند

## CMS

راهنمای عملی:

- [راه‌اندازی Contentful](docs/contentful-setup-fa.md)

آنچه الان از CMS قابل مدیریت است:

- محصولات
- تصویر محصول
- ویدئوی محصول یا لینک ویدئو
- خبرها و مقاله‌ها
- متن هیرو و بنر صفحه اصلی

## احراز هویت

فاز فعلی:

- صفحه ورود واقعی‌تر شده و فرم آن سشن نمایشی می‌سازد
- مسیر `/account` از روی همین سشن کار می‌کند
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

برای مرحله بعد، بهترین ادامه منطقی این‌ها هستند:

- اتصال auth واقعی
- پنل سفارش و پرداخت
- سبد خرید واقعی و ثبت سفارش
- OTP و پیامک
- نقش ادمین و پنل مدیریت داخلی اگر بعداً لازم شد
