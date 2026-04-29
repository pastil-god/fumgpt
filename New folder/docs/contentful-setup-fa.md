# راه‌اندازی Contentful برای مدیریت فروشگاه FumGPT

این پروژه طوری آماده شده که اگر `CONTENTFUL_SPACE_ID` و `CONTENTFUL_DELIVERY_TOKEN` را در `.env` وارد کنید، داده‌های سایت از Contentful خوانده می‌شوند. اگر این متغیرها خالی باشند یا اتصال CMS خطا بدهد، سایت از داده‌های محلی fallback استفاده می‌کند و از کار نمی‌افتد.

## 1. متغیرهای محیطی

این مقادیر را در فایل `.env` وارد کنید:

```env
CONTENTFUL_SPACE_ID=your_space_id
CONTENTFUL_DELIVERY_TOKEN=your_delivery_token
CONTENTFUL_ENVIRONMENT=master
NEXT_PUBLIC_CMS_DASHBOARD_URL=https://app.contentful.com/spaces/your-space-id
```

پیشنهاد می‌شود این fallbackها را هم تنظیم کنید:

```env
NEXT_PUBLIC_SITE_URL=https://your-domain.com
NEXT_PUBLIC_BRAND_NAME=FumGPT
NEXT_PUBLIC_SUPPORT_EMAIL=support@example.com
NEXT_PUBLIC_SUPPORT_PHONE=0900 000 0000
NEXT_PUBLIC_SUPPORT_ADDRESS=آدرس یا توضیح مسیر پشتیبانی
NEXT_PUBLIC_SUPPORT_TELEGRAM=https://t.me/example
NEXT_PUBLIC_SUPPORT_WHATSAPP=https://wa.me/989000000000
NEXT_PUBLIC_INSTAGRAM=https://instagram.com/example
```

## 2. مدل‌های محتوایی پیشنهادی

برای ساده ماندن کار تیم محتوا، ساختار CMS به 5 مدل اصلی تقسیم شده است:

1. `siteSettings`
2. `homepageSettings`
3. `navigationItem`
4. `product`
5. `newsArticle`

### `siteSettings`

فقط **یک entry** از این نوع بسازید. این مدل برای محتوای ثابت کل فروشگاه است.

| Field ID | Type | توضیح | ضروری |
|---|---|---|---|
| `brandName` | Short text | نام برند | بله |
| `siteTitle` | Short text | عنوان کلی سایت برای متادیتا | بله |
| `siteDescription` | Long text | توضیح کلی سایت | بله |
| `brandTagline` | Short text | زیرعنوان برند در هدر/فوتر | بله |
| `logo` | Media | لوگوی برند | خیر |
| `topBarText` | Short text | متن اصلی نوار بالای سایت | خیر |
| `topBarHighlights` | List of short text | آیتم‌های کوتاه نوار بالایی | خیر |
| `supportPhone` | Short text | شماره پشتیبانی | بله |
| `supportEmail` | Short text | ایمیل پشتیبانی | بله |
| `supportAddress` | Long text | آدرس یا توضیح مسیر ارتباط | خیر |
| `supportCtaLabel` | Short text | متن دکمه ارتباط/پشتیبانی | بله |
| `supportCtaHref` | Short text | لینک دکمه ارتباط | بله |
| `telegramUrl` | Short text | لینک تلگرام | خیر |
| `instagramUrl` | Short text | لینک اینستاگرام | خیر |
| `whatsappUrl` | Short text | لینک واتساپ | خیر |
| `footerText` | Long text | متن توضیحی فوتر | خیر |
| `copyrightText` | Short text | متن کپی‌رایت | خیر |
| `trustBadges` | List of short text | آیتم‌های اعتماد مثل تحویل دیجیتال | خیر |

### `homepageSettings`

فقط **یک entry** از این نوع بسازید. این مدل برای کنترل محتوای صفحه اصلی است.

| Field ID | Type | توضیح |
|---|---|---|
| `heroEyebrow` | Short text | متن بالای هیرو |
| `heroStatusLabel` | Short text | برچسب وضعیت هیرو |
| `heroTitleLead` | Short text | بخش اول تیتر هیرو |
| `heroTitleHighlight` | Short text | بخش هایلایت تیتر هیرو |
| `heroTitleTail` | Short text | بخش آخر تیتر هیرو |
| `heroDescription` | Long text | توضیح زیر تیتر هیرو |
| `heroPrimaryCtaLabel` | Short text | متن CTA اصلی |
| `heroPrimaryCtaHref` | Short text | لینک CTA اصلی |
| `heroSecondaryCtaLabel` | Short text | متن CTA دوم |
| `heroSecondaryCtaHref` | Short text | لینک CTA دوم |
| `heroProofTitle` | Short text | تیتر نوار اعتماد داخل هیرو |
| `heroProofText` | Short text | متن نوار اعتماد داخل هیرو |
| `heroQuickStartTitle` | Short text | تیتر بخش شروع سریع |
| `heroQuickStartText` | Long text | متن بخش شروع سریع |
| `heroMarketLabel` | Short text | لیبل بنر سمت راست هیرو |
| `heroMarketTitle` | Short text | تیتر بنر سمت راست هیرو |
| `heroMarketDescription` | Long text | توضیح بنر سمت راست هیرو |
| `heroMarketBadge` | Short text | برچسب بنر سمت راست هیرو |
| `showCategorySection` | Boolean | نمایش/عدم نمایش بخش دسته‌بندی |
| `categoriesEyebrow` | Short text | متن بالای بخش دسته‌بندی |
| `categoriesTitle` | Short text | تیتر بخش دسته‌بندی |
| `categoriesDescription` | Long text | توضیح بخش دسته‌بندی |
| `categoriesCtaLabel` | Short text | متن دکمه بخش دسته‌بندی |
| `categoriesCtaHref` | Short text | لینک دکمه بخش دسته‌بندی |
| `showFeaturedSection` | Boolean | نمایش/عدم نمایش بخش محصولات منتخب |
| `featuredEyebrow` | Short text | متن بالای بخش محصولات منتخب |
| `featuredTitle` | Short text | تیتر بخش محصولات منتخب |
| `featuredDescription` | Long text | توضیح بخش محصولات منتخب |
| `featuredCtaLabel` | Short text | متن دکمه بخش محصولات منتخب |
| `featuredCtaHref` | Short text | لینک دکمه بخش محصولات منتخب |
| `showNewsSection` | Boolean | نمایش/عدم نمایش بخش خبرها |
| `newsEyebrow` | Short text | متن بالای بخش خبر |
| `newsTitle` | Short text | تیتر بخش خبر |
| `newsDescription` | Long text | توضیح بخش خبر |
| `newsCtaLabel` | Short text | متن دکمه بخش خبر |
| `newsCtaHref` | Short text | لینک دکمه بخش خبر |
| `newsAdminCalloutLabel` | Short text | لیبل باکس مدیریت محتوا |
| `newsAdminCalloutTitle` | Short text | تیتر باکس مدیریت محتوا |
| `newsAdminCalloutDescription` | Long text | متن باکس مدیریت محتوا |
| `showTrustSection` | Boolean | نمایش/عدم نمایش بخش اعتماد صفحه اصلی |
| `trustEyebrow` | Short text | متن بالای بخش اعتماد |
| `trustTitle` | Short text | تیتر بخش اعتماد |
| `trustPoints` | List of short text | بولت‌های کوتاه بخش اعتماد |
| `showRoadmapSection` | Boolean | نمایش/عدم نمایش بخش مسیر توسعه |
| `roadmapEyebrow` | Short text | متن بالای بخش مسیر توسعه |
| `roadmapTitle` | Short text | تیتر بخش مسیر توسعه |
| `roadmapPhase1Title` | Short text | عنوان فاز اول |
| `roadmapPhase1Description` | Long text | توضیح فاز اول |
| `roadmapPhase2Title` | Short text | عنوان فاز دوم |
| `roadmapPhase2Description` | Long text | توضیح فاز دوم |
| `roadmapPhase3Title` | Short text | عنوان فاز سوم |
| `roadmapPhase3Description` | Long text | توضیح فاز سوم |
| `showSupportBanner` | Boolean | نمایش/عدم نمایش نوار پشتیبانی پایین صفحه |
| `announcementLabel` | Short text | لیبل نوار پایین صفحه |
| `announcementTitle` | Short text | تیتر نوار پایین صفحه |
| `announcementDescription` | Long text | متن نوار پایین صفحه |
| `announcementCtaLabel` | Short text | متن دکمه نوار پایین صفحه |
| `announcementCtaHref` | Short text | لینک دکمه نوار پایین صفحه |

### `navigationItem`

برای هر آیتم منو یک entry جدا بسازید.

| Field ID | Type | توضیح |
|---|---|---|
| `label` | Short text | متن لینک |
| `href` | Short text | مسیر یا لینک |
| `location` | Short text | یکی از `primary`, `footer`, `both` |
| `priority` | Number | عدد بزرگ‌تر یعنی نمایش بالاتر |
| `status` | Short text | `active` یا `draft` |
| `openInNewTab` | Boolean | اگر لینک خارجی است |

### `product`

هر محصول یک entry جداگانه است.

| Field ID | Type | توضیح | ضروری |
|---|---|---|---|
| `title` | Short text | نام محصول | بله |
| `slug` | Short text | اسلاگ یکتا | بله |
| `shortDescription` | Long text | توضیح کوتاه کارت محصول | بله |
| `description` | Long text | متن کامل صفحه محصول | بله |
| `category` | Short text | یکی از `ai-access`, `creative`, `coding`, `professional` | بله |
| `brand` | Short text | برند محصول | بله |
| `price` | Number | قیمت فعلی | بله |
| `comparePrice` | Number | قیمت قبلی | بهتر است |
| `badge` | Short text | متن تخفیف، اگر خالی باشد محاسبه می‌شود | خیر |
| `coverLabel` | Short text | متن کوتاه روی کاور کارت | خیر |
| `accent` | Short text | یکی از `emerald`, `cyan`, `violet`, `amber` | خیر |
| `delivery` | Short text | نوع تحویل | بله |
| `deliveryNote` | Long text | توضیح بیشتر درباره تحویل | خیر |
| `features` | List of short text | ویژگی‌ها | خیر |
| `notes` | List of short text | نکات مهم | خیر |
| `image` | Media | تصویر اصلی | بهتر است |
| `galleryImages` | Media (multiple) | تصاویر بیشتر محصول | خیر |
| `videoFile` | Media | فایل ویدئو | خیر |
| `videoUrl` | Short text | لینک ویدئو | خیر |
| `trustNote` | Long text | متن اعتمادساز محصول | خیر |
| `supportNote` | Long text | متن پشتیبانی یا راهنمای خرید | خیر |
| `isFeatured` | Boolean | نمایش در ویترین اصلی | خیر |
| `status` | Short text | `active`, `draft`, `archived` | بله |
| `priority` | Number | اولویت نمایش | خیر |

### `newsArticle`

هر خبر یا مقاله یک entry جداگانه است.

| Field ID | Type | توضیح | ضروری |
|---|---|---|---|
| `title` | Short text | تیتر خبر | بله |
| `slug` | Short text | اسلاگ یکتا | بله |
| `summary` | Long text | خلاصه خبر | بله |
| `body` | Long text | متن کامل خبر | بله |
| `image` | Media | تصویر خبر | بهتر است |
| `publishedAt` | Date & time | تاریخ انتشار | بله |
| `status` | Short text | `active` یا `draft` | بله |
| `isFeatured` | Boolean | اولویت بیشتر در صفحه اصلی | خیر |
| `ctaLabel` | Short text | متن CTA اختیاری | خیر |
| `ctaHref` | Short text | لینک CTA اختیاری | خیر |
| `videoFile` | Media | فایل ویدئو | خیر |
| `videoUrl` | Short text | لینک ویدئو | خیر |
| `priority` | Number | اولویت نمایش | خیر |

## 3. رفتار انتشار

- اگر `product.status = active` باشد، محصول در سایت عمومی نمایش داده می‌شود.
- اگر `product.status = draft` یا `archived` باشد، در سایت عمومی نمایش داده نمی‌شود.
- اگر `newsArticle.status = active` باشد، خبر نمایش داده می‌شود.
- اگر `newsArticle.status = draft` باشد، فقط داخل CMS می‌ماند و در سایت عمومی دیده نمی‌شود.
- اگر entry ساخته شده ولی Publish نشده باشد، در سایت عمومی نمایش داده نمی‌شود.

## 4. fallback mode

اگر Contentful تنظیم نشده باشد یا درخواست CMS خطا بدهد:

- هدر، فوتر و اطلاعات پشتیبانی از fallback داخلی خوانده می‌شوند.
- محتوای صفحه اصلی از fallback داخلی خوانده می‌شود.
- محصولات و خبرها از داده‌های محلی پروژه خوانده می‌شوند.
- سایت بالا می‌آید و برای دمو یا توسعه از کار نمی‌افتد.

## 5. پیشنهاد ساخت entryهای اصلی

برای اینکه تیم سردرگم نشود، این نام‌گذاری را پیشنهاد می‌کنیم:

- `siteSettings`: عنوان داخلی `main-site-settings`
- `homepageSettings`: عنوان داخلی `main-homepage-settings`
- `navigationItem`: برای هر لینک، نامی مثل `nav-home`, `nav-products`
- `product`: عنوان داخلی همان نام محصول
- `newsArticle`: عنوان داخلی همان تیتر خبر

## 6. راهنمای مدیریتی روزمره

راهنمای عملی نقش‌ها، کارهای روزانه ادمین‌ها و روش افزودن محصول/خبر را در این فایل ببینید:

- [راهنمای مدیریت محتوا](cms-admin-guide-fa.md)
