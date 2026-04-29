# FumGPT Storefront

فروشگاه فارسی ابزارها و سرویس‌های هوش مصنوعی روی Next.js. این نسخه برای soft launch روی دامنه واقعی آماده شده و شامل storefront عمومی، احراز هویت OTP ایمیلی، سبد خرید، checkout، سفارش‌ها، پنل ادمین، PostgreSQL/Neon، Resend و مسیرهای مدیریت محتوا است.

## وضعیت فعلی

- صفحه اصلی، محصولات، جزئیات محصول، خبرها، آکادمی، ورود، حساب کاربری، سبد خرید و checkout آماده استفاده هستند.
- احراز هویت با Email OTP و session دیتابیسی پیاده‌سازی شده است.
- ارسال ایمیل OTP از طریق Resend انجام می‌شود و برای توسعه محلی حالت mock هم وجود دارد.
- دیتابیس با Prisma و PostgreSQL کار می‌کند. برای Vercel/Neon، `DATABASE_URL` و `DIRECT_URL` لازم است.
- سبد خرید، checkout، order confirmation و order history واقعی هستند.
- پرداخت آنلاین هنوز متصل نیست و عمداً در حالت `manual` یا `dev_mock` نگه داشته شده است.
- پنل داخلی ادمین برای سفارش‌ها، جست‌وجوی کاربران، تنظیمات سایت، مدیریت صفحه اصلی و تغییر نقش کاربران وجود دارد.
- Contentful همچنان برای محصولات، خبرها و محتوای سنگین پشتیبانی می‌شود؛ اگر تنظیم نشده باشد، سایت از fallback داخلی بالا می‌آید.

## اجرا

### نصب

```bash
pnpm install
```

### تولید Prisma Client

```bash
pnpm db:generate
```

### اجرای migration

```bash
pnpm db:migrate
```

### seed اختیاری

```bash
pnpm db:seed
```

### توسعه محلی

```bash
pnpm dev
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

نمونه کامل در `.env.example` و `apps/web/.env.example` آمده است. مهم‌ترین موارد:

```env
DATABASE_URL=postgresql://USER:PASSWORD@POOLER_HOST/DB?sslmode=require&pgbouncer=true&connect_timeout=15
DIRECT_URL=postgresql://USER:PASSWORD@DIRECT_HOST/DB?sslmode=require&connect_timeout=15
NEXT_PUBLIC_SITE_URL=https://your-domain.com
AUTH_EMAIL_TRANSPORT=resend
AUTH_EMAIL_FROM=FumGPT <auth@your-verified-domain.com>
RESEND_API_KEY=your_resend_api_key
AUTH_SMS_TRANSPORT=mock
CHECKOUT_PAYMENT_PROVIDER=manual
```

## مدیریت سایت

مسیرهای مهم ادمین:

- `/admin` نمای کلی پنل داخلی
- `/admin/settings` تنظیمات سایت، برند، SEO، تماس، فوتر و رنگ‌ها
- `/admin/homepage` ویرایش متن‌های صفحه اصلی و فعال/غیرفعال کردن سکشن‌ها
- `/admin/orders` مدیریت سفارش‌ها
- `/admin/users` جست‌وجوی کاربران و تغییر نقش توسط super admin

برای فعال‌شدن تنظیمات داخلی، migration جدید `20260426170000_admin_site_settings` باید روی دیتابیس اجرا شود.

راهنما:

- [مدیریت داخلی سایت](docs/admin-site-management-fa.md)
- [راهنمای نقش‌های داخلی](docs/internal-admin-roles.md)
- [چک‌لیست استقرار](docs/deploy-checklist-fa.md)

## CMS

Contentful برای محصولات، خبرها و محتوای حجیم‌تر پشتیبانی می‌شود. اگر envهای Contentful تنظیم نباشند، سایت از fallback داخلی استفاده می‌کند.

راهنما:

- [راه‌اندازی Contentful](docs/contentful-setup-fa.md)
- [راهنمای مدیریت محتوا](docs/cms-admin-guide-fa.md)

## مسیرهای مهم عمومی

- `/` صفحه اصلی
- `/products` لیست محصولات
- `/products/[slug]` جزئیات محصول
- `/news` لیست خبرها
- `/login` ورود با OTP ایمیلی
- `/account` حساب کاربری و سفارش‌های اخیر
- `/cart` سبد خرید
- `/checkout` ثبت سفارش
- `/api/health` سلامت سرویس
- `/api/ready` آمادگی سرویس

## یادداشت امنیت و deploy

- فایل `.env` را commit نکن.
- بعد از تغییر env در Vercel، Redeploy لازم است.
- برای Resend، دامنه فرستنده باید verify شده باشد.
- فعلاً پرداخت آنلاین فعال نیست؛ متن سایت باید آن را شفاف نشان دهد.
- قبل از migration روی Neon، از دیتابیس backup بگیر یا حداقل migration را روی Preview تست کن.
