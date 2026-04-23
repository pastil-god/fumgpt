# Internal Admin Roles

این ناحیه فقط برای عملیات داخلی است و جای Contentful را نمی‌گیرد.

## Role Access

| Role | Access |
| --- | --- |
| `super_admin` | همه صفحه‌های داخلی، فهرست سفارش‌ها، جزئیات سفارش، تغییر وضعیت سفارش، جست‌وجوی کاربر، لینک ورود به Contentful |
| `content_manager` | فقط صفحه اصلی ناحیه داخلی و لینک ورود به Contentful |
| `order_operator` | صفحه اصلی ناحیه داخلی، فهرست سفارش‌ها، جزئیات سفارش، تغییر وضعیت سفارش |
| `support_operator` | صفحه اصلی ناحیه داخلی، فهرست سفارش‌ها، جزئیات سفارش، جست‌وجوی کاربر |
| `editor` | فقط صفحه اصلی ناحیه داخلی و لینک ورود به Contentful |
| `customer` | هیچ دسترسی به ناحیه داخلی ندارد |

## Pages

- `/admin`
  - همه نقش‌های عملیاتی: `super_admin`, `content_manager`, `order_operator`, `support_operator`, `editor`
- `/admin/orders`
  - `super_admin`, `order_operator`, `support_operator`
- `/admin/orders/[orderNumber]`
  - `super_admin`, `order_operator`, `support_operator`
- `POST /api/admin/orders/status`
  - فقط `super_admin`, `order_operator`
- `/admin/users`
  - فقط `super_admin`, `support_operator`

## Notes

- محتوای سایت، صفحات، متن‌ها و رسانه‌ها همچنان باید در Contentful مدیریت شوند.
- برای شروع، نقش کاربران بهتر است با Prisma Studio یا ابزار دیتابیس تنظیم شود.
- اگر کاربری نقش عملیاتی نداشته باشد، تلاش برای ورود به ناحیه داخلی به `/account?adminDenied=1` هدایت می‌شود.
