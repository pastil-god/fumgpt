import type { Metadata } from "next";
import type { ReactNode } from "react";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { CloudinaryImageField } from "@/components/admin/cloudinary-image-field";
import { requireAuthorizedSession } from "@/lib/authorization";
import { recordAuditEvent } from "@/lib/observability/audit";
import {
  HEADER_DISPLAY_PRESETS,
  SITE_SETTINGS_ID,
  getAppearanceAuditDetails,
  getEditableSiteSettingsDefaults,
  getStoredSiteSettings,
  saveSiteSettingsFromForm
} from "@/lib/settings/admin-settings";
import {
  DEFAULT_INLINE_THEME_VALUES,
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

function readFormValue(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value : "";
}

function getSettingsErrorCode(error: unknown) {
  if (typeof error === "object" && error && "code" in error) {
    const code = String(error.code);

    if (code.startsWith("P")) {
      return "database-error";
    }
  }

  if (error instanceof Error && /database|prisma|column|table|relation/i.test(error.message)) {
    return "database-error";
  }

  return "unknown-error";
}

async function saveSettings(formData: FormData) {
  "use server";

  const session = await requireAuthorizedSession({
    allowedRoles: ["super_admin"],
    nextPath: "/admin/settings"
  });
  const intent = readFormValue(formData, "intent");
  const savedSettings = await saveSiteSettingsFromForm(formData, session.userId).catch((error: unknown) => {
    redirect(`/admin/settings?error=${encodeURIComponent(getSettingsErrorCode(error))}`);
  });

  await Promise.all([
    recordAuditEvent({
      action: "admin.site_settings_updated",
      entityType: "site_settings",
      entityId: SITE_SETTINGS_ID,
      userId: session.userId,
      details: {
        source: "admin-form",
        intent: intent || "save"
      },
      message: "Super admin updated site settings"
    }),
    recordAuditEvent({
      action: "admin.site_appearance_updated",
      entityType: "site_settings",
      entityId: SITE_SETTINGS_ID,
      userId: session.userId,
      details: {
        source: "admin-form",
        intent: intent || "save",
        appearance: getAppearanceAuditDetails(savedSettings)
      },
      message: "Super admin updated site appearance settings"
    })
  ]).catch(() => {
    console.warn("Admin settings audit event could not be recorded.");
  });

  revalidatePath("/", "layout");
  revalidatePath("/admin/settings");
  redirect(`/admin/settings?saved=${intent === "resetAppearance" ? "appearance-reset" : "1"}`);
}

type SearchParamsLike =
  | Promise<{
      saved?: string | string[];
      error?: string | string[];
    }>
  | undefined;

async function resolveSearchParams(searchParams: SearchParamsLike) {
  const params = (await searchParams) || {};
  return {
    saved: Array.isArray(params.saved) ? params.saved[0] : params.saved,
    error: Array.isArray(params.error) ? params.error[0] : params.error
  };
}

function getSavedMessage(saved?: string) {
  if (saved === "appearance-reset") {
    return "ظاهر سایت به مقدارهای پیش‌فرض امن برگشت و ذخیره شد.";
  }

  if (saved) {
    return "تنظیمات سایت با موفقیت ذخیره شد.";
  }

  return null;
}

function getErrorMessage(error?: string) {
  const messages: Record<string, string> = {
    "database-error": "تنظیمات ذخیره نشد. اتصال دیتابیس یا migration های site_settings را بررسی کن.",
    "unknown-error": "تنظیمات ذخیره نشد. لطفا دوباره تلاش کن یا لاگ سرور را بررسی کن."
  };

  return error ? messages[error] || messages["unknown-error"] : null;
}

function TextField({
  name,
  label,
  defaultValue,
  placeholder,
  helperText,
  type = "text",
  inputMode,
  wide = false
}: {
  name: string;
  label: string;
  defaultValue?: string;
  placeholder?: string;
  helperText?: string;
  type?: string;
  inputMode?: "none" | "text" | "tel" | "url" | "email" | "numeric" | "decimal" | "search";
  wide?: boolean;
}) {
  return (
    <label className={`checkout-field admin-settings-field${wide ? " admin-settings-field-wide" : ""}`}>
      <span>{label}</span>
      <input
        name={name}
        type={type}
        defaultValue={defaultValue || ""}
        placeholder={placeholder}
        inputMode={inputMode}
      />
      {helperText ? <small>{helperText}</small> : null}
    </label>
  );
}

function TextAreaField({
  name,
  label,
  defaultValue,
  placeholder,
  helperText,
  rows = 4
}: {
  name: string;
  label: string;
  defaultValue?: string;
  placeholder?: string;
  helperText?: string;
  rows?: number;
}) {
  return (
    <label className="checkout-field admin-settings-field admin-settings-field-wide">
      <span>{label}</span>
      <textarea name={name} rows={rows} defaultValue={defaultValue || ""} placeholder={placeholder} />
      {helperText ? <small>{helperText}</small> : null}
    </label>
  );
}

function SelectField({
  name,
  label,
  defaultValue,
  options,
  helperText,
  wide = false
}: {
  name: string;
  label: string;
  defaultValue?: string;
  options: Array<{
    value: string;
    label: string;
  }>;
  helperText?: string;
  wide?: boolean;
}) {
  return (
    <label className={`checkout-field admin-settings-field${wide ? " admin-settings-field-wide" : ""}`}>
      <span>{label}</span>
      <select name={name} defaultValue={defaultValue}>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {helperText ? <small>{helperText}</small> : null}
    </label>
  );
}

function ToggleField({
  name,
  label,
  helperText,
  defaultChecked
}: {
  name: string;
  label: string;
  helperText?: string;
  defaultChecked: boolean;
}) {
  return (
    <label className="admin-toggle-card admin-toggle-card-clean">
      <input type="checkbox" name={name} defaultChecked={defaultChecked} />
      <span>
        <strong>{label}</strong>
        {helperText ? <small>{helperText}</small> : null}
      </span>
    </label>
  );
}

function SettingsCard({
  eyebrow,
  title,
  description,
  children,
  featured = false
}: {
  eyebrow?: string;
  title: string;
  description: string;
  children: ReactNode;
  featured?: boolean;
}) {
  return (
    <section className={`admin-settings-card${featured ? " is-featured" : ""}`}>
      <div className="admin-settings-card-header">
        <div>
          {eyebrow ? <div className="eyebrow">{eyebrow}</div> : null}
          <h3>{title}</h3>
          <p className="muted">{description}</p>
        </div>
      </div>
      {children}
    </section>
  );
}

function ReadOnlyValue({ label, value, helperText }: { label: string; value: string; helperText?: string }) {
  return (
    <div className="admin-readonly-value">
      <span>{label}</span>
      <strong>{value}</strong>
      {helperText ? <small>{helperText}</small> : null}
    </div>
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

const HEADER_PRESET_OPTIONS = [
  { value: "custom", label: "سفارشی" },
  ...Object.entries(HEADER_DISPLAY_PRESETS).map(([value, preset]) => ({
    value,
    label: preset.label
  }))
];

const fontOptions = INLINE_FONT_OPTIONS.map((option) => ({ value: option.value, label: option.label }));

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
  const savedMessage = getSavedMessage(params.saved);
  const errorMessage = getErrorMessage(params.error);

  return (
    <div className="surface nested-card admin-settings-panel admin-site-settings-panel">
      <div className="admin-settings-hero admin-settings-hero-clean">
        <div>
          <div className="eyebrow">مرکز کنترل سایت</div>
          <h2 className="section-title">تنظیمات ساده و امن برای Super Admin</h2>
          <p className="muted section-text">
            فقط تنظیمات مهم اینجا دیده می‌شوند. اگر فیلدی را خالی کنی، سایت عمومی نمی‌شکند و بخش‌های خالی به شکل امن پنهان یا با مقدار پیش‌فرض جایگزین می‌شوند.
          </p>
        </div>
        <div className="admin-settings-hero-status">
          <span className="status-pill success">سایت فعال</span>
          <span className="status-pill muted">فقط مدیر کل</span>
        </div>
      </div>

      {savedMessage ? (
        <div className="status-banner success admin-settings-feedback">
          <strong>ذخیره شد</strong>
          <p>{savedMessage}</p>
        </div>
      ) : null}

      {errorMessage ? (
        <div className="status-banner danger admin-settings-feedback">
          <strong>ذخیره ناموفق بود</strong>
          <p>{errorMessage}</p>
        </div>
      ) : null}

      <form action={saveSettings} className="admin-settings-form admin-site-settings-form">
        <SettingsCard
          eyebrow="Quick Controls"
          title="کنترل‌های سریع"
          description="برای تغییرات روزمره، معمولا همین بخش کافی است."
          featured
        >
          <div className="admin-settings-grid admin-settings-grid-comfortable">
            <TextField
              name="siteTitle"
              label="نام برند"
              defaultValue={defaults.siteTitle}
              helperText="اگر خالی بماند، نام پیش‌فرض سایت استفاده می‌شود."
            />
            <TextField
              name="primaryColor"
              label="رنگ اصلی"
              defaultValue={defaults.primaryColor}
              type="color"
              helperText={`پیش‌فرض امن: ${DEFAULT_INLINE_THEME_VALUES.primaryColor}`}
            />
            <SelectField name="fontFamily" label="فونت اصلی" defaultValue={defaults.fontFamily} options={fontOptions} />
            <CloudinaryImageField
              name="logoUrl"
              label="لوگو"
              usage="logo"
              defaultValue={defaults.logoUrl}
              placeholder="/logo.svg یا https://..."
              helperText="پاک کردن لوگو مجاز است؛ سایت به لوگوی پیش‌فرض برمی‌گردد."
              className="admin-settings-field-wide"
            />
          </div>

          <div className="admin-settings-actions admin-settings-actions-inline">
            <button className="btn btn-primary btn-large" type="submit">
              ذخیره تنظیمات
            </button>
            <span className="muted">تغییرات بعد از ذخیره روی سایت عمومی اعمال می‌شود.</span>
          </div>
        </SettingsCard>

        <SettingsCard
          eyebrow="Header"
          title="هدر و نوار بالا"
          description="با preset شروع کن. فقط اگر لازم بود، گزینه‌های نمایشی را دستی تغییر بده."
        >
          <div className="admin-settings-grid">
            <SelectField
              name="headerPreset"
              label="حالت آماده هدر"
              defaultValue={defaults.headerPreset}
              options={HEADER_PRESET_OPTIONS}
              helperText="اگر «سفارشی» را انتخاب کنی، کلیدهای پایین استفاده می‌شوند."
              wide
            />

            <div className="admin-preset-list admin-settings-field-wide">
              {Object.entries(HEADER_DISPLAY_PRESETS).map(([key, preset]) => (
                <div className="admin-preset-card" key={key}>
                  <strong>{preset.label}</strong>
                  <p className="muted">{preset.description}</p>
                </div>
              ))}
            </div>

            <div className="admin-toggle-grid admin-toggle-grid-clean admin-settings-field-wide">
              <ToggleField name="showTopBar" label="نوار بالا" defaultChecked={defaults.showTopBar} />
              <ToggleField name="showTopBarHighlights" label="نشان‌ها" defaultChecked={defaults.showTopBarHighlights} />
              <ToggleField name="showSupportPhone" label="شماره تماس" defaultChecked={defaults.showSupportPhone} />
              <ToggleField name="showSupportEmail" label="ایمیل" defaultChecked={defaults.showSupportEmail} />
              <ToggleField name="showMainNavigation" label="منوی اصلی" defaultChecked={defaults.showMainNavigation} />
              <ToggleField name="showAccountButton" label="دکمه حساب" defaultChecked={defaults.showAccountButton} />
              <ToggleField name="showCartButton" label="دکمه سبد" defaultChecked={defaults.showCartButton} />
              <ToggleField
                name="showHeaderActions"
                label="ناحیه دکمه‌ها"
                helperText="اگر خاموش باشد، حساب و سبد هم پنهان می‌شوند."
                defaultChecked={defaults.showHeaderActions}
              />
            </div>

            <SelectField
              name="headerSize"
              label="اندازه هدر"
              defaultValue={defaults.headerSize}
              options={HEADER_SIZE_OPTIONS}
            />
            <ToggleField
              name="showTopBarText"
              label="متن کوتاه نوار بالا"
              helperText="متن از محتوای پیش‌فرض/CMS می‌آید."
              defaultChecked={defaults.showTopBarText}
            />
          </div>

          <details className="admin-settings-details">
            <summary>تنظیمات کمتر استفاده‌شده هدر</summary>
            <div className="admin-settings-grid">
              <SelectField
                name="topBarSize"
                label="اندازه نوار بالا"
                defaultValue={defaults.topBarSize}
                options={HEADER_SIZE_OPTIONS}
              />
              <SelectField
                name="headerContainerWidth"
                label="عرض هدر"
                defaultValue={defaults.headerContainerWidth}
                options={HEADER_CONTAINER_WIDTH_OPTIONS}
              />
            </div>
          </details>
        </SettingsCard>

        <SettingsCard
          eyebrow="Branding"
          title="برندینگ و ظاهر"
          description="رنگ‌ها، فونت و سبک کلی را بدون CSS تغییر بده."
        >
          <div className="admin-settings-grid">
            <TextField name="secondaryColor" label="رنگ مکمل" defaultValue={defaults.secondaryColor} type="color" />
            <TextField name="backgroundTint" label="ته‌رنگ پس‌زمینه" defaultValue={defaults.backgroundTint} type="color" />
            <SelectField
              name="buttonStyle"
              label="استایل دکمه"
              defaultValue={defaults.buttonStyle}
              options={INLINE_THEME_BUTTON_STYLE_OPTIONS.map((option) => ({
                value: option.value,
                label: option.label
              }))}
            />
            <SelectField
              name="cardRadius"
              label="گردی کارت‌ها"
              defaultValue={defaults.cardRadius}
              options={INLINE_THEME_CARD_RADIUS_OPTIONS.map((option) => ({
                value: option.value,
                label: option.label
              }))}
            />
          </div>

          <details className="admin-settings-details">
            <summary>تنظیمات پیشرفته ظاهر</summary>
            <div className="admin-settings-grid">
              <SelectField name="headingFontFamily" label="فونت تیترها" defaultValue={defaults.headingFontFamily} options={fontOptions} />
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
                name="cardShadow"
                label="سایه کارت"
                defaultValue={defaults.cardShadow}
                options={INLINE_THEME_CARD_SHADOW_OPTIONS.map((option) => ({
                  value: option.value,
                  label: option.label
                }))}
              />
              <SelectField
                name="sectionDensity"
                label="فاصله سکشن‌ها"
                defaultValue={defaults.sectionDensity}
                options={INLINE_THEME_DENSITY_OPTIONS.map((option) => ({
                  value: option.value,
                  label: option.label
                }))}
              />
            </div>
          </details>

          <div className="admin-settings-actions admin-settings-actions-inline">
            <button className="btn btn-ghost" type="submit" name="intent" value="resetAppearance">
              بازگردانی ظاهر پیش‌فرض
            </button>
            <span className="muted">فقط رنگ، فونت و سبک کارت/دکمه reset می‌شود.</span>
          </div>
        </SettingsCard>

        <SettingsCard
          eyebrow="Support"
          title="تماس و پشتیبانی"
          description="همه این فیلدها اختیاری‌اند و پاک کردنشان امن است."
        >
          <div className="admin-settings-grid">
            <TextField name="contactPhone" label="شماره تماس" defaultValue={defaults.contactPhone} inputMode="tel" />
            <TextField name="contactEmail" label="ایمیل پشتیبانی" defaultValue={defaults.contactEmail} inputMode="email" />
            <TextField name="telegramUrl" label="لینک تلگرام" defaultValue={defaults.telegramUrl} placeholder="https://t.me/..." />
            <TextField name="whatsappUrl" label="لینک واتساپ" defaultValue={defaults.whatsappUrl} placeholder="https://wa.me/..." />
            <TextField name="supportCtaLabel" label="متن CTA پشتیبانی" defaultValue={defaults.supportCtaLabel} />
            <TextField
              name="supportCtaHref"
              label="لینک CTA پشتیبانی"
              defaultValue={defaults.supportCtaHref}
              placeholder="/help یا https://..."
              helperText="مسیر داخلی، https، mailto یا tel پذیرفته می‌شود."
            />
          </div>
        </SettingsCard>

        <SettingsCard
          eyebrow="SEO"
          title="SEO و فوتر"
          description="عنوان و توضیح سایت برای موتورهای جست‌وجو و متن پایین سایت."
        >
          <div className="admin-settings-grid">
            <TextField name="defaultSeoTitle" label="عنوان پیش‌فرض SEO" defaultValue={defaults.defaultSeoTitle} />
            <TextAreaField
              name="defaultSeoDescription"
              label="توضیح پیش‌فرض SEO"
              defaultValue={defaults.defaultSeoDescription}
              rows={3}
            />
            <TextAreaField
              name="footerText"
              label="متن فوتر"
              defaultValue={defaults.footerText}
              rows={4}
              helperText="اگر خالی باشد، کارت معرفی فوتر نمایش داده نمی‌شود."
            />
            <ReadOnlyValue
              label="کپی‌رایت"
              value={defaults.copyrightText}
              helperText="برای امن نگه داشتن دیتابیس، فعلا از نام برند و سال جاری ساخته می‌شود."
            />
          </div>
        </SettingsCard>

        <details className="admin-settings-card admin-settings-details-card">
          <summary>
            <span>
              <span className="eyebrow">Advanced</span>
              <strong>تنظیمات پیشرفته</strong>
              <small>گزینه‌های کمتر استفاده‌شده که بهتر است فقط در صورت نیاز تغییر کنند.</small>
            </span>
          </summary>
          <div className="admin-settings-grid">
            <TextField
              name="tagline"
              label="زیرعنوان برند"
              defaultValue={defaults.tagline}
              helperText="در هدر و فوتر نمایش داده می‌شود. پاک کردن آن امن است."
            />
            <TextAreaField
              name="metaDescription"
              label="توضیح کوتاه برند"
              defaultValue={defaults.metaDescription}
              rows={3}
              helperText="اگر عنوان SEO خالی باشد، این توضیح به عنوان fallback استفاده می‌شود."
            />
            <TextAreaField
              name="contactAddress"
              label="آدرس یا توضیح پشتیبانی"
              defaultValue={defaults.contactAddress}
              rows={3}
            />
            <TextField name="instagramUrl" label="لینک اینستاگرام" defaultValue={defaults.instagramUrl} placeholder="https://instagram.com/..." />
            <CloudinaryImageField
              name="faviconUrl"
              label="Favicon"
              usage="favicon"
              defaultValue={defaults.faviconUrl}
              placeholder="/icon.svg یا https://..."
              className="admin-settings-field-wide"
            />
          </div>
        </details>

        <div className="admin-settings-actions admin-settings-actions-bottom">
          <button className="btn btn-primary btn-large" type="submit">
            ذخیره همه تغییرات
          </button>
          <span className="muted">فیلدهای اختیاری خالی، سایت عمومی را خراب نمی‌کنند.</span>
        </div>
      </form>
    </div>
  );
}
