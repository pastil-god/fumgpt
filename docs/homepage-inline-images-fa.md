# ویرایش inline تصویر صفحه اصلی

وقتی `super_admin` در صفحه اصلی حالت ویرایش inline را فعال می‌کند، تصویر Hero با کادر ظریف و دکمه `تغییر تصویر` قابل ویرایش می‌شود. پنجره ویرایش تصویر اجازه می‌دهد تصویر جدید از Cloudinary آپلود شود، لینک تصویر دستی وارد شود، پیش‌نمایش دیده شود، تغییر ذخیره شود یا تصویر به حالت پیش‌فرض برگردد.

در فاز اول فقط تصویر Hero صفحه اصلی ذخیره می‌شود. نوار پایانی فعلی تصویر جداگانه ندارد، بنابراین فیلد اضافه‌ای برای announcement ساخته نشده است. مقدار ذخیره‌شده در ستون nullable `heroImageUrl` از جدول `homepage_settings` نگهداری می‌شود و اگر خالی باشد سایت از تصویر پیش‌فرض `/illustrations/hero-ai-marketplace.svg` استفاده می‌کند.

آپلود از همان مسیر امن Cloudinary استفاده می‌کند: کلاینت ابتدا از `/api/admin/media/cloudinary/sign` امضای موقت می‌گیرد، فایل مستقیم به Cloudinary ارسال می‌شود و سپس `/api/admin/media/cloudinary/register` دارایی را اعتبارسنجی و ثبت audit می‌کند. `CLOUDINARY_API_SECRET` هرگز به مرورگر ارسال نمی‌شود.

متغیرهای لازم:

```env
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
CLOUDINARY_UPLOAD_FOLDER=fumgpt/admin
```

کنترل‌های ویرایش و مسیرهای آپلود فقط برای `super_admin` فعال هستند. کاربران عادی هیچ badge، modal یا دکمه آپلودی نمی‌بینند و فایل‌ها در filesystem ورسل ذخیره نمی‌شوند؛ فقط URL امن تصویر در دیتابیس ثبت می‌شود.
