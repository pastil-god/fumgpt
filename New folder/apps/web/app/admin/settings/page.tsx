import type { Metadata } from "next";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAuthorizedSession } from "@/lib/authorization";
import {
  getEditableSiteSettingsDefaults,
  getStoredSiteSettings,
  saveSiteSettingsFromForm
} from "@/lib/settings/admin-settings";

export const metadata: Metadata = {
  title: "تنظیمات سایت"
};

async function saveSettings(formData: FormData) {
  "use server";

  const session = await requireAuthorizedSession({
    allowedRoles: ["super_admin"],
    nextPath: "/admin/settings"
  });

  await saveSiteSettingsFromForm(formData, session.userId);
  revalidatePath("/", "layout");
  revalidatePath("/admin/settings");
  redirect("/admin/settings?saved=1");
}

type SearchParamsLike =
  | Promise<{
      saved?: string | string[];
    }>
  | undefined;

async function resolveSearchParams(searchParams: SearchParamsLike) {
  const params = (await searchParams) || {};
  return {
    saved: Array.isArray(params.saved) ? params.saved[0] : params.saved
  };
}

function TextField({
  name,
  label,
  defaultValue,
  placeholder,
  type = "text"
}: {
  name: string;
  label: string;
  defaultValue?: string;
  placeholder?: string;
  type?: string;
}) {
  return (
    <label className="checkout-field admin-settings-field">
      <span>{label}</span>
      <input name={name} type={type} defaultValue={defaultValue || ""} placeholder={placeholder} />
    </label>
  );
}

function TextAreaField({
  name,
  label,
  defaultValue,
  placeholder,
  rows = 4
}: {
  name: string;
  label: string;
  defaultValue?: string;
  placeholder?: string;
  rows?: number;
}) {
  return (
    <label className="checkout-field admin-settings-field admin-settings-field-wide">
      <span>{label}</span>
      <textarea name={name} rows={rows} defaultValue={defaultValue || ""} placeholder={placeholder} />
    </label>
  );
}

export default async function AdminSiteSettingsPage({
  searchParams
}: {
  searchParams?: SearchParamsLike;
}) {
  await requireAuthorizedSession({
    allowedRoles: ["super_admin"],
    nextPath: "/admin/settings"
  });
  const params = await resolveSearchParams(searchParams);
  const storedSettings = await getStoredSiteSettings();
  const defaults = getEditableSiteSettingsDefaults(storedSettings);

  return (
    <div className="surface nested-card admin-settings-panel">
      <div className="admin-settings-hero">
        <div>
          <div className="eyebrow">مرکز کنترل برند</div>
          <h2 className="section-title">تنظیمات اصلی سایت</h2>
          <p className="muted section-text">
            این صفحه برای super admin ساخته شده تا هویت برند، اطلاعات تماس، لینک‌های اجتماعی و رنگ‌های اصلی را بدون تغییر کد مدیریت کند.
          </p>
        </div>
        {params.saved ? <span className="status-pill success">ذخیره شد</span> : null}
      </div>

      <form action={saveSettings} className="admin-settings-form">
        <div className="admin-settings-group">
          <div>
            <strong>هویت و SEO</strong>
            <p className="muted">عنوان، توضیحات پیش‌فرض و متادیتای اصلی سایت.</p>
          </div>
          <div className="admin-settings-grid">
            <TextField name="siteTitle" label="نام سایت / برند" defaultValue={defaults.siteTitle} />
            <TextField name="tagline" label="زیرعنوان برند" defaultValue={defaults.tagline} />
            <TextField name="defaultSeoTitle" label="عنوان پیش‌فرض SEO" defaultValue={defaults.defaultSeoTitle} />
            <TextAreaField name="defaultSeoDescription" label="توضیح پیش‌فرض SEO" defaultValue={defaults.defaultSeoDescription} rows={3} />
            <TextAreaField name="metaDescription" label="توضیح کوتاه برند" defaultValue={defaults.metaDescription} rows={3} />
          </div>
        </div>

        <div className="admin-settings-group">
          <div>
            <strong>ظاهر و دارایی‌ها</strong>
            <p className="muted">فعلاً تصاویر با URL مدیریت می‌شوند تا نیازی به سرویس ذخیره‌سازی پولی نباشد.</p>
          </div>
          <div className="admin-settings-grid">
            <TextField name="logoUrl" label="آدرس لوگو" defaultValue={defaults.logoUrl} placeholder="/logo.svg یا https://..." />
            <TextField name="faviconUrl" label="آدرس favicon" defaultValue={defaults.faviconUrl} placeholder="/icon.svg" />
            <TextField name="primaryColor" label="رنگ اصلی" defaultValue={defaults.primaryColor} placeholder="#1a73e8" />
            <TextField name="secondaryColor" label="رنگ مکمل" defaultValue={defaults.secondaryColor} placeholder="#8c6bff" />
            <TextField name="fontFamily" label="فونت اصلی" defaultValue={defaults.fontFamily} placeholder="Nazanin Local" />
          </div>
        </div>

        <div className="admin-settings-group">
          <div>
            <strong>تماس و شبکه‌های اجتماعی</strong>
            <p className="muted">این اطلاعات در هدر، فوتر و بخش‌های اعتمادساز استفاده می‌شوند.</p>
          </div>
          <div className="admin-settings-grid">
            <TextField name="contactPhone" label="شماره تماس" defaultValue={defaults.contactPhone} />
            <TextField name="contactEmail" label="ایمیل پشتیبانی" defaultValue={defaults.contactEmail} />
            <TextAreaField name="contactAddress" label="آدرس / توضیح پشتیبانی" defaultValue={defaults.contactAddress} rows={3} />
            <TextField name="telegramUrl" label="لینک تلگرام" defaultValue={defaults.telegramUrl} />
            <TextField name="instagramUrl" label="لینک اینستاگرام" defaultValue={defaults.instagramUrl} />
            <TextField name="whatsappUrl" label="لینک واتساپ" defaultValue={defaults.whatsappUrl} />
            <TextField name="supportCtaLabel" label="متن CTA پشتیبانی" defaultValue={defaults.supportCtaLabel} />
            <TextField name="supportCtaHref" label="لینک CTA پشتیبانی" defaultValue={defaults.supportCtaHref} />
          </div>
        </div>

        <div className="admin-settings-group">
          <div>
            <strong>فوتر</strong>
            <p className="muted">متن معرفی کوتاه پایین سایت.</p>
          </div>
          <div className="admin-settings-grid">
            <TextAreaField name="footerText" label="متن فوتر" defaultValue={defaults.footerText} rows={4} />
          </div>
        </div>

        <div className="admin-settings-actions">
          <button className="btn btn-primary btn-large" type="submit">
            ذخیره تنظیمات سایت
          </button>
        </div>
      </form>
    </div>
  );
}
