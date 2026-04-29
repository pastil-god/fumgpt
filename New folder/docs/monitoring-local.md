# Local Monitoring And Logging

این storefront به‌صورت پیش‌فرض به سرویس مانیتورینگ پولی وابسته نیست.

## What Exists Now

- `GET /api/health`
  - liveness check ساده برای اینکه خود برنامه در حال پاسخ‌گویی است
- `GET /api/ready`
  - readiness check برای اینکه وابستگی‌های اصلی فروشگاه آماده هستند یا نه
- `GET /api/integrations`
  - نمای ساده از وضعیت CMS، auth transport، logging و monitoring

## Request ID

- روی routeهای مهم، یک `x-request-id` به response اضافه می‌شود.
- اگر کلاینت این header را بفرستد، همان مقدار برای correlation استفاده می‌شود.
- اگر نفرستد، سرور یک شناسه جدید می‌سازد.

## Structured Logs

- لاگ‌ها به‌صورت ساختاریافته و خوانا در خروجی سرور چاپ می‌شوند.
- پیش‌فرض:
  - فقط `stdout` یا همان ترمینال اجرای Next.js
- اختیاری:
  - اگر `STORE_LOG_FILE_PATH` تنظیم شود، همان لاگ‌ها به فایل JSONL هم append می‌شوند.

## Recommended Local Setup

برای ذخیره لاگ‌ها در فایل محلی:

```env
STORE_LOG_FILE_PATH=.logs/storefront.log
MONITORING_ADAPTER=disabled
```

## How To Inspect Logs Locally

- اگر `STORE_LOG_FILE_PATH` تنظیم نشده باشد:
  - لاگ‌ها را در همان ترمینالی که `pnpm dev` یا `pnpm build && pnpm start` اجرا شده ببینید.
- اگر `STORE_LOG_FILE_PATH` تنظیم شده باشد:
  - فایل لاگ را باز کنید.
  - هر خط یک رکورد JSON مستقل است.

در PowerShell:

```powershell
Get-Content .\apps\web\.logs\storefront.log -Tail 50
```

برای دنبال‌کردن زنده:

```powershell
Get-Content .\apps\web\.logs\storefront.log -Wait
```

## Audit Logging

رویدادهای مهم در دیتابیس هم ثبت می‌شوند:

- تلاش ورود
- درخواست OTP
- ارسال یا خطای OTP
- ساخت سفارش
- تغییر وضعیت سفارش
- بعضی actionهای ادمین

فیلد `requestId` روی `AuditLog` اضافه شده تا بتوان مسیر یک درخواست را بین لاگ سرور و دیتابیس راحت‌تر دنبال کرد.

## Optional Monitoring Adapter

- پیش‌فرض: `MONITORING_ADAPTER=disabled`
- آداپتر فقط به‌صورت interface و hook اضافه شده است.
- فعلاً dependency سنگین یا vendor خاصی نصب نشده است.
- اگر بعداً بخواهید Sentry یا سرویس دیگری وصل کنید، همین لایه adapter نقطه اتصال است.

## Readiness Rules

فعلاً readiness روی این موارد حساس است:

- دیتابیس باید تنظیم و قابل اتصال باشد
- اگر auth ایمیلی روی `resend` باشد، `RESEND_API_KEY` و `AUTH_EMAIL_FROM` باید تنظیم شده باشند

مواردی مثل:

- manual payment
- dev mock payment
- CMS fallback

باعث `not_ready` شدن نمی‌شوند، چون در این فاز بخشی از رفتار صادقانه و پشتیبانی‌شده فروشگاه هستند.
