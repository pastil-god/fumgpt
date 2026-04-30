import type { Metadata } from "next";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { CloudinaryImageField } from "@/components/admin/cloudinary-image-field";
import { requireAuthorizedSession } from "@/lib/authorization";
import { recordAuditEvent } from "@/lib/observability/audit";
import {
  HOMEPAGE_SETTINGS_ID,
  getEditableHomepageSettingsDefaults,
  getStoredHomepageSettings,
  saveHomepageSettingsFromForm
} from "@/lib/settings/admin-settings";

export const metadata: Metadata = {
  title: "مدیریت صفحه اصلی"
};

async function saveHomepage(formData: FormData) {
  "use server";

  const session = await requireAuthorizedSession({
    allowedRoles: ["super_admin"],
    nextPath: "/admin/homepage"
  });

  await saveHomepageSettingsFromForm(formData, session.userId);
  await recordAuditEvent({
    action: "admin.homepage_settings_updated",
    entityType: "homepage_settings",
    entityId: HOMEPAGE_SETTINGS_ID,
    userId: session.userId,
    details: {
      source: "admin-form"
    },
    message: "Super admin updated homepage settings"
  });
  revalidatePath("/", "layout");
  revalidatePath("/admin/homepage");
  redirect("/admin/homepage?saved=1");
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

function Field({
  name,
  label,
  defaultValue,
  placeholder
}: {
  name: string;
  label: string;
  defaultValue?: string;
  placeholder?: string;
}) {
  return (
    <label className="checkout-field admin-settings-field">
      <span>{label}</span>
      <input name={name} defaultValue={defaultValue || ""} placeholder={placeholder} />
    </label>
  );
}

function Area({
  name,
  label,
  defaultValue,
  rows = 3,
  placeholder
}: {
  name: string;
  label: string;
  defaultValue?: string;
  rows?: number;
  placeholder?: string;
}) {
  return (
    <label className="checkout-field admin-settings-field admin-settings-field-wide">
      <span>{label}</span>
      <textarea name={name} rows={rows} defaultValue={defaultValue || ""} placeholder={placeholder} />
    </label>
  );
}

function Toggle({ name, label, defaultChecked }: { name: string; label: string; defaultChecked: boolean }) {
  return (
    <label className="admin-toggle-card">
      <input type="checkbox" name={name} defaultChecked={defaultChecked} />
      <span>{label}</span>
    </label>
  );
}

export default async function AdminHomepagePage({
  searchParams
}: {
  searchParams?: SearchParamsLike;
}) {
  await requireAuthorizedSession({
    allowedRoles: ["super_admin"],
    nextPath: "/admin/homepage"
  });
  const params = await resolveSearchParams(searchParams);
  const storedSettings = await getStoredHomepageSettings();
  const defaults = getEditableHomepageSettingsDefaults(storedSettings);

  return (
    <div className="surface nested-card admin-settings-panel">
      <div className="admin-settings-hero">
        <div>
          <div className="eyebrow">ویترین اصلی</div>
          <h2 className="section-title">مدیریت محتوای صفحه اصلی</h2>
          <p className="muted section-text">
            متن‌های مهم صفحه اصلی، CTAها و وضعیت نمایش سکشن‌ها را از اینجا کنترل کن. محصولات و خبرها همچنان از Contentful یا fallback پروژه خوانده می‌شوند.
          </p>
        </div>
        {params.saved ? <span className="status-pill success">ذخیره شد</span> : null}
      </div>


      <form action={saveHomepage} className="admin-settings-form">
        <div className="admin-settings-group">
          <div>
            <strong>Hero</strong>
            <p className="muted">پیام اصلی سایت و CTAهای بالای صفحه.</p>
          </div>
          <div className="admin-settings-grid">
            <Field name="heroEyebrow" label="برچسب بالای عنوان" defaultValue={defaults.hero.eyebrow} />
            <Field name="heroStatusLabel" label="وضعیت کوچک" defaultValue={defaults.hero.statusLabel} />
            <Field name="heroTitleLead" label="بخش اول عنوان" defaultValue={defaults.hero.titleLead} />
            <Field name="heroTitleHighlight" label="بخش برجسته عنوان" defaultValue={defaults.hero.titleHighlight} />
            <Field name="heroTitleTail" label="ادامه عنوان" defaultValue={defaults.hero.titleTail} />
            <Area name="heroDescription" label="توضیح Hero" defaultValue={defaults.hero.description} rows={4} />
            <Field name="heroPrimaryCtaLabel" label="متن CTA اصلی" defaultValue={defaults.hero.primaryCtaLabel} />
            <Field name="heroPrimaryCtaHref" label="لینک CTA اصلی" defaultValue={defaults.hero.primaryCtaHref} />
            <Field name="heroSecondaryCtaLabel" label="متن CTA دوم" defaultValue={defaults.hero.secondaryCtaLabel} />
            <Field name="heroSecondaryCtaHref" label="لینک CTA دوم" defaultValue={defaults.hero.secondaryCtaHref} />
            <Field name="heroProofTitle" label="عنوان اعتمادساز" defaultValue={defaults.hero.proofTitle} />
            <Area name="heroProofText" label="متن اعتمادساز" defaultValue={defaults.hero.proofText} rows={2} />
            <Field name="heroQuickStartTitle" label="عنوان شروع سریع" defaultValue={defaults.hero.quickStartTitle} />
            <Area name="heroQuickStartText" label="متن شروع سریع" defaultValue={defaults.hero.quickStartText} rows={2} />
            <Field name="heroMarketLabel" label="برچسب کارت سمت راست" defaultValue={defaults.hero.marketLabel} />
            <Field name="heroMarketTitle" label="عنوان کارت سمت راست" defaultValue={defaults.hero.marketTitle} />
            <Area name="heroMarketDescription" label="توضیح کارت سمت راست" defaultValue={defaults.hero.marketDescription} rows={3} />
            <Field name="heroMarketBadge" label="Badge کارت سمت راست" defaultValue={defaults.hero.marketBadge} />
            <CloudinaryImageField
              name="heroImageUrl"
              label="تصویر Hero"
              defaultValue={defaults.hero.imageUrl || ""}
              placeholder="https://res.cloudinary.com/..."
              usage="homepage"
              className="admin-settings-field-wide"
              previewAlt="تصویر Hero صفحه اصلی"
            />
          </div>
        </div>

        <div className="admin-settings-group">
          <div>
            <strong>سکشن‌های صفحه اصلی</strong>
            <p className="muted">هر سکشن را فعال/غیرفعال کن و متن‌های اصلی آن را تغییر بده.</p>
          </div>
          <div className="admin-toggle-grid">
            <Toggle name="showCategorySection" label="نمایش دسته‌بندی‌ها" defaultChecked={defaults.categorySection.isVisible} />
            <Toggle name="showFeaturedSection" label="نمایش محصولات منتخب" defaultChecked={defaults.featuredSection.isVisible} />
            <Toggle name="showNewsSection" label="نمایش اخبار" defaultChecked={defaults.newsSection.isVisible} />
            <Toggle name="showTrustSection" label="نمایش بخش اعتماد" defaultChecked={defaults.trustSection.isVisible} />
            <Toggle name="showRoadmapSection" label="نمایش مسیر توسعه" defaultChecked={defaults.roadmapSection.isVisible} />
            <Toggle name="showAnnouncement" label="نمایش نوار پایانی" defaultChecked={defaults.announcement.isVisible} />
          </div>
        </div>

        <div className="admin-settings-group">
          <div>
            <strong>دسته‌بندی‌ها و محصولات منتخب</strong>
            <p className="muted">متن سکشن‌ها را حرفه‌ای و کوتاه نگه دار.</p>
          </div>
          <div className="admin-settings-grid">
            <Field name="categoriesEyebrow" label="Eyebrow دسته‌بندی" defaultValue={defaults.categorySection.eyebrow} />
            <Field name="categoriesTitle" label="عنوان دسته‌بندی" defaultValue={defaults.categorySection.title} />
            <Area name="categoriesDescription" label="توضیح دسته‌بندی" defaultValue={defaults.categorySection.description} rows={3} />
            <Field name="categoriesCtaLabel" label="CTA دسته‌بندی" defaultValue={defaults.categorySection.ctaLabel} />
            <Field name="categoriesCtaHref" label="لینک CTA دسته‌بندی" defaultValue={defaults.categorySection.ctaHref} />
            <Field name="featuredEyebrow" label="Eyebrow محصولات" defaultValue={defaults.featuredSection.eyebrow} />
            <Field name="featuredTitle" label="عنوان محصولات" defaultValue={defaults.featuredSection.title} />
            <Area name="featuredDescription" label="توضیح محصولات" defaultValue={defaults.featuredSection.description} rows={3} />
            <Field name="featuredCtaLabel" label="CTA محصولات" defaultValue={defaults.featuredSection.ctaLabel} />
            <Field name="featuredCtaHref" label="لینک CTA محصولات" defaultValue={defaults.featuredSection.ctaHref} />
          </div>
        </div>

        <div className="admin-settings-group">
          <div>
            <strong>اعتماد، مسیر توسعه و نوار پایانی</strong>
            <p className="muted">متن‌های اعتمادساز را کاربرمحور و شفاف بنویس.</p>
          </div>
          <div className="admin-settings-grid">
            <Field name="newsEyebrow" label="Eyebrow اخبار" defaultValue={defaults.newsSection.eyebrow} />
            <Field name="newsTitle" label="عنوان اخبار" defaultValue={defaults.newsSection.title} />
            <Area name="newsDescription" label="توضیح اخبار" defaultValue={defaults.newsSection.description} rows={3} />
            <Field name="newsCtaLabel" label="CTA اخبار" defaultValue={defaults.newsSection.ctaLabel} />
            <Field name="newsCtaHref" label="لینک CTA اخبار" defaultValue={defaults.newsSection.ctaHref} />
            <Field name="trustEyebrow" label="Eyebrow اعتماد" defaultValue={defaults.trustSection.eyebrow} />
            <Field name="trustTitle" label="عنوان اعتماد" defaultValue={defaults.trustSection.title} />
            <Area name="trustPoints" label="نکات اعتمادساز؛ هر خط یک مورد" defaultValue={defaults.trustSection.points.join("\n")} rows={6} />
            <Field name="roadmapEyebrow" label="Eyebrow مسیر" defaultValue={defaults.roadmapSection.eyebrow} />
            <Field name="roadmapTitle" label="عنوان مسیر" defaultValue={defaults.roadmapSection.title} />
            <Field name="roadmapPhase1Title" label="فاز ۱" defaultValue={defaults.roadmapSection.phases[0].title} />
            <Area name="roadmapPhase1Description" label="توضیح فاز ۱" defaultValue={defaults.roadmapSection.phases[0].description} rows={2} />
            <Field name="roadmapPhase2Title" label="فاز ۲" defaultValue={defaults.roadmapSection.phases[1].title} />
            <Area name="roadmapPhase2Description" label="توضیح فاز ۲" defaultValue={defaults.roadmapSection.phases[1].description} rows={2} />
            <Field name="roadmapPhase3Title" label="فاز ۳" defaultValue={defaults.roadmapSection.phases[2].title} />
            <Area name="roadmapPhase3Description" label="توضیح فاز ۳" defaultValue={defaults.roadmapSection.phases[2].description} rows={2} />
            <Field name="announcementLabel" label="برچسب نوار پایانی" defaultValue={defaults.announcement.label} />
            <Field name="announcementTitle" label="عنوان نوار پایانی" defaultValue={defaults.announcement.title} />
            <Area name="announcementDescription" label="توضیح نوار پایانی" defaultValue={defaults.announcement.description} rows={3} />
            <Field name="announcementCtaLabel" label="CTA نوار پایانی" defaultValue={defaults.announcement.ctaLabel} />
            <Field name="announcementCtaHref" label="لینک CTA نوار پایانی" defaultValue={defaults.announcement.ctaHref} />
          </div>
        </div>

        <div className="admin-settings-actions">
          <button className="btn btn-primary btn-large" type="submit">
            ذخیره صفحه اصلی
          </button>
        </div>
      </form>
    </div>
  );
}
