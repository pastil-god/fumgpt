# راه‌اندازی Contentful برای مدیریت محصولات و خبرها

این پروژه طوری آماده شده که اگر `CONTENTFUL_SPACE_ID` و `CONTENTFUL_DELIVERY_TOKEN` را در `.env` وارد کنید، داده‌های سایت از Contentful خوانده می‌شوند. اگر این متغیرها خالی باشند، سایت به‌صورت خودکار از داده‌های محلی فعلی استفاده می‌کند و از کار نمی‌افتد.

## چرا Contentful؟

- داشبورد ساده و مناسب کاربر غیر فنی
- امکان ایجاد و ویرایش خبر، مقاله و محصول بدون دست‌کاری کد
- کتابخانه فایل برای آپلود تصویر و فایل ویدئو
- مناسب اتصال مستقیم به Next.js بدون ساخت پنل اختصاصی

## 1. ساخت Space و API Token

1. در Contentful یک `Space` جدید بسازید.
2. از بخش `Settings > API keys` یک Delivery Token بگیرید.
3. مقادیر زیر را در فایل `.env` پروژه وارد کنید:

```env
CONTENTFUL_SPACE_ID=your_space_id
CONTENTFUL_DELIVERY_TOKEN=your_delivery_token
CONTENTFUL_ENVIRONMENT=master
```

## 2. مدل‌های محتوا

دو Content Type اصلی بسازید:

### `product`

فیلدهای پیشنهادی:

| Field ID | Type | توضیح |
|---|---|---|
| `title` | Short text | نام محصول |
| `slug` | Short text | اسلاگ یکتا مثل `chatgpt-business` |
| `category` | Short text | یکی از این مقادیر: `ai-access`, `creative`, `coding`, `professional` |
| `brand` | Short text | برند محصول |
| `price` | Number | قیمت فعلی |
| `comparePrice` | Number | قیمت قبل |
| `delivery` | Short text | روش تحویل |
| `shortDescription` | Long text | توضیح کوتاه |
| `description` | Long text | توضیح کامل صفحه محصول |
| `features` | List of short text | ویژگی‌ها |
| `notes` | List of short text | نکات مهم |
| `badge` | Short text | متن تخفیف مثل `۴۵٪ تخفیف` |
| `coverLabel` | Short text | متن روی کاور کارت |
| `accent` | Short text | یکی از: `emerald`, `cyan`, `violet`, `amber` |
| `isFeatured` | Boolean | برای نمایش در هیرو و صفحه اصلی |
| `image` | Media | تصویر محصول |
| `videoFile` | Media | فایل ویدئوی محصول |
| `videoUrl` | Short text | لینک ویدئو در صورت استفاده از ویدئوی خارجی |

### `newsArticle`

فیلدهای پیشنهادی:

| Field ID | Type | توضیح |
|---|---|---|
| `title` | Short text | تیتر خبر |
| `slug` | Short text | اسلاگ خبر |
| `excerpt` | Long text | خلاصه خبر |
| `body` | Long text | متن کامل خبر |
| `publishedAt` | Date & time | تاریخ انتشار |
| `isFeatured` | Boolean | برای اولویت نمایش |
| `image` | Media | تصویر خبر |
| `videoFile` | Media | فایل ویدئو |
| `videoUrl` | Short text | لینک ویدئو اگر فایل آپلود نمی‌کنید |

## 3. مدیریت تصویر و ویدئو

- برای تصویر و ویدئو از فیلدهای `Media` استفاده کنید.
- اگر ویدئو را مستقیم در Contentful آپلود نمی‌کنید، می‌توانید فقط `videoUrl` را پر کنید.
- در صفحه محصول، اگر ویدئو وجود داشته باشد، سایت آن را به‌صورت پلیر یا لینک نمایش می‌دهد.

## 4. فونت B Zar

در کد، فونت سایت به‌صورت `B Zar`-first تنظیم شده و یک فونت فارسی fallback هم برای نمایش درست متن‌ها فعال شده است.

اگر می‌خواهید روی تمام دستگاه‌ها دقیقاً خود فونت `B Zar` نمایش داده شود:

1. فایل‌های لایسنس‌دار فونت `B Zar` را تهیه کنید.
2. آن‌ها را در `apps/web/public/fonts/` قرار دهید.
3. در صورت نیاز، بعداً می‌توانیم `@font-face` یا `next/font/local` را هم به آن اضافه کنیم.

## 5. رفتار فعلی پروژه

- `صفحه اصلی`: خبرها از CMS بالای هوم‌پیج نمایش داده می‌شوند.
- `محصولات`: لیست محصولات و جزئیات محصول از CMS خوانده می‌شوند.
- `Fallback`: اگر CMS هنوز تنظیم نشده باشد، داده‌های محلی فعلی لود می‌شوند.

## 6. پیشنهاد برای تیم محتوا

- برای هر محصول حتماً `slug`, `category`, `price`, `comparePrice`, `image` و `isFeatured` را مشخص کنید.
- برای خبرها بهتر است همیشه `image` و `publishedAt` پر شود تا سکشن خبر مرتب‌تر دیده شود.
