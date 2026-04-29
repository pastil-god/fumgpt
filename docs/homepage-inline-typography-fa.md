# ویرایش تایپوگرافی صفحه اصلی

این پروژه برای متن عمومی سایت همچنان از استراتژی سبک قبلی استفاده می‌کند:

- فونت اصلی فارسی و RTL: `Vazirmatn`
- fallback لاتین: `Inter`
- stack عمومی: `"Vazirmatn", "Inter", system-ui, sans-serif`

فونت‌های اضافه فقط برای عنوان‌ها و متن‌های ویژه صفحه اصلی در inline editor استفاده می‌شوند. این کار کمک می‌کند متن بدنه سبک و پایدار بماند و انتخاب‌های نمایشی فقط جایی فعال شوند که ارزش بصری دارند.

## فونت‌های قابل انتخاب

Registry در `apps/web/lib/settings/inline-homepage.ts` تعریف شده است و فقط کلیدهای همان registry روی سرور پذیرفته می‌شوند:

- `vazirmatn` - وزیرمتن، مناسب بدنه و UI
- `inter` - اینتر، fallback و متن لاتین
- `notoSansArabic` - Noto Sans Arabic، عنوان و UI عربی/فارسی
- `notoNaskhArabic` - Noto Naskh Arabic، متن‌های رسمی‌تر و editorial
- `cairo` - Cairo، عنوان‌های مدرن
- `tajawal` - Tajawal، UI سبک
- `almarai` - Almarai، عنوان‌های هندسی
- `changa` - Changa، display
- `ibmPlexSansArabic` - IBM Plex Sans Arabic، UI/heading محصولی
- `markaziText` - Markazi Text، display/editorial
- `lalezar` - Lalezar، عنوان نمایشی ضخیم

همه فونت‌های اضافه از بسته‌های رسمی `@fontsource/*` نصب شده‌اند و در runtime از CDN خارجی استفاده نمی‌شود.

## نکته performance

اضافه کردن ۱۰ خانواده فونت می‌تواند خروجی build را سنگین‌تر کند، مخصوصا اگر همه وزن‌ها import شوند. برای کنترل وزن پروژه:

- فقط وزن‌های `400` و `700` import شده‌اند.
- برای `Lalezar` فقط وزن `400` import شده است.
- بدنه سایت همچنان روی `Vazirmatn` و `Inter` می‌ماند.
- فونت‌های اضافه برای heading/display پیشنهاد می‌شوند، نه همه متن‌های بدنه.

اگر بعدا فونت‌های بیشتری اضافه می‌کنید، اول مطمئن شوید بسته رسمی `@fontsource/<name>` وجود دارد، license روشن است، و فقط وزن‌های لازم import می‌شوند.

## ویرایش inline

وقتی کاربر `super_admin` وارد حالت ویرایش صفحه اصلی می‌شود، با کلیک روی متن‌های قابل ویرایش یک پنل کوچک استایل نمایش داده می‌شود. این پنل اجازه می‌دهد:

- متن همان field تغییر کند
- فونت از registry انتخاب شود
- رنگ متن با hex امن مثل `#1a73e8` انتخاب شود
- وزن فونت از مقدارهای مجاز همان فونت انتخاب شود
- استایل همان field به حالت پیش‌فرض برگردد

کنترل‌های ویرایش فقط برای `super_admin` نمایش داده می‌شوند. بازدیدکننده عادی فقط خروجی نهایی استایل‌شده را می‌بیند.

## ذخیره‌سازی

استایل‌ها در ستون nullable زیر روی `homepage_settings` ذخیره می‌شوند:

```prisma
homepageFieldStyles Json?
```

شکل داده:

```json
{
  "heroTitleLead": {
    "fontKey": "markaziText",
    "color": "#1a73e8",
    "fontWeight": "700"
  }
}
```

سرور فقط این کلیدها را قبول می‌کند:

- `fontKey`
- `color`
- `fontWeight`

هر field ناشناخته، فونت خارج از registry، رنگ غیر-hex، وزن غیرمجاز، یا کلید CSS دلخواه reject می‌شود.

## اضافه یا حذف فونت

برای اضافه کردن فونت امن:

1. وجود بسته را با `npm view @fontsource/<font-name> version license` بررسی کنید.
2. فقط وزن‌های لازم را در `apps/web/app/layout.tsx` import کنید.
3. فونت را به `HOMEPAGE_FONT_REGISTRY` در `apps/web/lib/settings/inline-homepage.ts` اضافه کنید.
4. `fontKey`، نام فارسی، CSS font-family، کاربرد پیشنهادی و وزن‌های مجاز را مشخص کنید.
5. build را اجرا کنید و اندازه assetها را بررسی کنید.

برای حذف فونت، اول آن را از registry و importها حذف کنید. اگر قبلا در دیتابیس استفاده شده، استایل‌های ذخیره‌شده با آن `fontKey` باید پاک یا به فونت دیگری migrate شوند.
