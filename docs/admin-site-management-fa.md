# مدیریت داخلی سایت و صفحه اصلی

این نسخه یک لایه سبک برای مدیریت سایت از پنل داخلی اضافه می‌کند. هدف این است که `super_admin` بتواند بدون تغییر مستقیم کد، هویت برند و بخش‌های اصلی صفحه اول را ویرایش کند.

## مسیرهای جدید

- `/admin/settings` — تنظیمات سایت، برند، SEO، رنگ‌ها، اطلاعات تماس، فوتر و لینک‌های اجتماعی
- `/admin/homepage` — متن‌های Hero، CTAها، فعال/غیرفعال کردن سکشن‌های صفحه اصلی، اعتمادسازی، مسیر توسعه و نوار پایانی
- `/admin/products` — ساخت، ویرایش، فعال/غیرفعال کردن و ویژه کردن محصولات داخلی StoreProduct برای `super_admin`
- `/admin/users` — جست‌وجوی کاربر و تغییر نقش توسط `super_admin`

## migration جدید

برای فعال‌شدن پنل تنظیمات، migration زیر اضافه شده است:

```text
apps/web/prisma/migrations/20260426170000_admin_site_settings/migration.sql
apps/web/prisma/migrations/20260430190000_store_products_internal/migration.sql
```

این migrationها جدول‌های جدید زیر را می‌سازند:

- `site_settings`
- `homepage_settings`
- `store_products`

## دستورهای لازم بعد از دریافت این نسخه

```bash
pnpm install
pnpm db:generate
pnpm db:migrate
pnpm build
```

در Vercel، بعد از push، باید migration را روی دیتابیس اجرا کنی. اگر از Neon استفاده می‌کنی، مطمئن شو `DATABASE_URL` و `DIRECT_URL` تنظیم شده‌اند.

## نکات مهم

- اگر دیتابیس در دسترس نباشد، سایت به fallback داخلی برمی‌گردد و deploy نمی‌خوابد.
- تغییرات تنظیمات سایت بعد از ذخیره، روی layout و homepage revalidate می‌شوند.
- آپلود تصویر با Cloudinary برای logo، favicon و تصویر Hero صفحه اصلی فعال است. فایل‌ها در filesystem ورسل ذخیره نمی‌شوند و فقط URL امن در دیتابیس نگهداری می‌شود.
- راهنمای ویرایش inline تصویر Hero: `docs/homepage-inline-images-fa.md`
- محصولات و خبرها همچنان می‌توانند از Contentful یا fallback پروژه خوانده شوند.
- محصولات داخلی فقط وقتی وارد storefront می‌شوند که `PRODUCTS_INTERNAL_ENABLED=true` باشد. اگر این env حذف شود یا `false` باشد، رفتار قبلی `Contentful -> fallback` بدون تغییر ادامه پیدا می‌کند.
- در حالت فعال، `StoreProduct` با اسلاگ یکسان محصول Contentful/fallback را override می‌کند، محصول داخلی فعال با اسلاگ جدید به فهرست اضافه می‌شود، و محصول داخلی غیرفعال اسلاگ متناظر را از storefront پنهان می‌کند.
- rollback کدی با `PRODUCTS_INTERNAL_ENABLED=false` انجام می‌شود. rollback اختیاری SQL، بدون اجرا در این تغییر: `DROP TABLE "store_products";`.
- برای جلوگیری از ریسک، فقط `super_admin` می‌تواند تنظیمات سایت و نقش کاربران را تغییر دهد.

## رول‌ها

- `super_admin`: دسترسی کامل، تنظیمات سایت، صفحه اصلی، سفارش‌ها، کاربران و تغییر نقش‌ها
- `content_manager`: مدیریت صفحه اصلی و Contentful
- `editor`: ویرایش محتوای صفحه اصلی و Contentful
- `order_operator`: سفارش‌ها
- `support_operator`: جست‌وجوی کاربر و مشاهده سفارش برای پشتیبانی
