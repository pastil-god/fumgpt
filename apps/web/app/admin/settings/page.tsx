import type { Metadata } from "next";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { CloudinaryImageField } from "@/components/admin/cloudinary-image-field";
import { requireAuthorizedSession } from "@/lib/authorization";
import { recordAuditEvent } from "@/lib/observability/audit";
import {
  SITE_SETTINGS_ID,
  getAppearanceAuditDetails,
  getEditableSiteSettingsDefaults,
  getStoredSiteSettings,
  saveSiteSettingsFromForm
} from "@/lib/settings/admin-settings";
import {
  INLINE_FONT_OPTIONS,
  INLINE_THEME_BUTTON_RADIUS_OPTIONS,
  INLINE_THEME_BUTTON_STYLE_OPTIONS,
  INLINE_THEME_CARD_RADIUS_OPTIONS,
  INLINE_THEME_CARD_SHADOW_OPTIONS,
  INLINE_THEME_DENSITY_OPTIONS
} from "@/lib/settings/inline-homepage";

export const metadata: Metadata = {
  title: "تنظیمات سایت"
};

async function saveSettings(formData: FormData) {
  "use server";

  const session = await requireAuthorizedSession({
    allowedRoles: ["super_admin"],
    nextPath: "/admin/settings"
  });

  const savedSettings = await saveSiteSettingsFromForm(formData, session.userId);
  await recordAuditEvent({
    action: "admin.site_settings_updated",
    entityType: "site_settings",
    entityId: SITE_SETTINGS_ID,
    userId: session.userId,
    details: {
      source: "admin-form"
    },
    message: "Super admin updated site settings"
  });
  await recordAuditEvent({
    action: "admin.site_appearance_updated",
    entityType: "site_settings",
    entityId: SITE_SETTINGS_ID,
    userId: session.userId,
    details: {
      source: "admin-form",
      appearance: getAppearanceAuditDetails(savedSettings)
    },
    message: "Super admin updated site appearance settings"
  });
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

function SelectField({
  name,
  label,
  defaultValue,
  options
}: {
  name: string;
  label: string;
  defaultValue?: string;
  options: Array<{
    value: string;
    label: string;
  }>;
}) {
  return (
    <label className="checkout-field admin-settings-field">
      <span>{label}</span>
      <select name={name} defaultValue={defaultValue}>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}

function ToggleField({
  name,
  label,
  defaultChecked
}: {
  name: string;
  label: string;
  defaultChecked: boolean;
}) {
  return (
    <label className="admin-toggle-card">
      <input type="checkbox" name={name} defaultChecked={defaultChecked} />
      <span>{label}</span>
    </label>
  );
}

const HEADER_SIZE_OPTIONS = [
  { value: "compact", label: "فشرده" },
  { value: "normal", label: "معمولی" },
  { value: "large", label: "بزرگ" }
];

const HEADER_CONTAINER_WIDTH_OPTIONS = [
  { value: "normal", label: "معمولی" },
  { value: "wide", label: "عریض" },
  { value: "full", label: "تمام عرض" }
];

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
            <p className="muted">رنگ، فونت، فرم کارت‌ها و آپلود لوگو/فیوآیکن از اینجا به‌صورت امن کنترل می‌شوند و هیچ CSS دلخواهی وارد سایت نمی‌شود.</p>
          </div>
          <div className="admin-settings-grid">
            <CloudinaryImageField
              name="logoUrl"
              label="لوگو"
              usage="logo"
              defaultValue={defaults.logoUrl}
              placeholder="/logo.svg یا https://..."
            />
            <CloudinaryImageField
              name="faviconUrl"
              label="favicon"
              usage="favicon"
              defaultValue={defaults.faviconUrl}
              placeholder="/icon.svg یا https://..."
            />
            <TextField name="primaryColor" label="رنگ اصلی" defaultValue={defaults.primaryColor} placeholder="#1a73e8" type="color" />
            <TextField name="secondaryColor" label="رنگ مکمل" defaultValue={defaults.secondaryColor} placeholder="#8c6bff" type="color" />
            <TextField name="backgroundTint" label="ته‌رنگ پس‌زمینه" defaultValue={defaults.backgroundTint} placeholder="#fafcff" type="color" />
            <SelectField
              name="fontFamily"
              label="فونت اصلی"
              defaultValue={defaults.fontFamily}
              options={INLINE_FONT_OPTIONS.map((option) => ({ value: option.value, label: option.label }))}
            />
            <SelectField
              name="headingFontFamily"
              label="فونت تیترها"
              defaultValue={defaults.headingFontFamily}
              options={INLINE_FONT_OPTIONS.map((option) => ({ value: option.value, label: option.label }))}
            />
            <SelectField
              name="buttonRadius"
              label="گردی دکمه"
              defaultValue={defaults.buttonRadius}
              options={INLINE_THEME_BUTTON_RADIUS_OPTIONS.map((option) => ({
                value: option.value,
                label: option.label
              }))}
            />
            <SelectField
              name="cardRadius"
              label="گردی کارت"
              defaultValue={defaults.cardRadius}
              options={INLINE_THEME_CARD_RADIUS_OPTIONS.map((option) => ({
                value: option.value,
                label: option.label
              }))}
            />
            <SelectField
              name="cardShadow"
              label="شدت سایه کارت"
              defaultValue={defaults.cardShadow}
              options={INLINE_THEME_CARD_SHADOW_OPTIONS.map((option) => ({
                value: option.value,
                label: option.label
              }))}
            />
            <SelectField
              name="sectionDensity"
              label="تراکم سکشن‌ها"
              defaultValue={defaults.sectionDensity}
              options={INLINE_THEME_DENSITY_OPTIONS.map((option) => ({
                value: option.value,
                label: option.label
              }))}
            />
            <SelectField
              name="buttonStyle"
              label="استایل دکمه اصلی"
              defaultValue={defaults.buttonStyle}
              options={INLINE_THEME_BUTTON_STYLE_OPTIONS.map((option) => ({
                value: option.value,
                label: option.label
              }))}
            />
          </div>
        </div>

        <div className="admin-settings-group">
          <div>
            <strong>هدر و نوار بالایی</strong>
            <p className="muted">
              نمایش، اندازه و عرض بخش‌های بالای سایت را بدون تغییر کد کنترل کن.
            </p>
          </div>
          <div className="admin-settings-grid">
            <div className="admin-toggle-grid admin-settings-field-wide">
              <ToggleField name="showTopBar" label="نمایش نوار بالایی" defaultChecked={defaults.showTopBar} />
              <ToggleField name="showTopBarText" label="نمایش متن نوار بالایی" defaultChecked={defaults.showTopBarText} />
              <ToggleField
                name="showTopBarHighlights"
                label="نمایش نشان‌های نوار بالایی"
                defaultChecked={defaults.showTopBarHighlights}
              />
              <ToggleField name="showSupportPhone" label="نمایش شماره پشتیبانی" defaultChecked={defaults.showSupportPhone} />
              <ToggleField name="showSupportEmail" label="نمایش ایمیل پشتیبانی" defaultChecked={defaults.showSupportEmail} />
              <ToggleField name="showMainNavigation" label="نمایش منوی اصلی" defaultChecked={defaults.showMainNavigation} />
              <ToggleField name="showHeaderActions" label="نمایش دکمه‌های هدر" defaultChecked={defaults.showHeaderActions} />
              <ToggleField name="showAccountButton" label="نمایش دکمه حساب کاربری" defaultChecked={defaults.showAccountButton} />
              <ToggleField name="showCartButton" label="نمایش دکمه سبد خرید" defaultChecked={defaults.showCartButton} />
            </div>
            <SelectField
              name="topBarSize"
              label="اندازه نوار بالایی"
              defaultValue={defaults.topBarSize}
              options={HEADER_SIZE_OPTIONS}
            />
            <SelectField
              name="headerSize"
              label="اندازه هدر اصلی"
              defaultValue={defaults.headerSize}
              options={HEADER_SIZE_OPTIONS}
            />
            <SelectField
              name="headerContainerWidth"
              label="عرض هدر"
              defaultValue={defaults.headerContainerWidth}
              options={HEADER_CONTAINER_WIDTH_OPTIONS}
            />
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
