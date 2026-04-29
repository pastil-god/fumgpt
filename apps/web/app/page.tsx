import Link from "next/link";
import type { Metadata } from "next";
import { Hero } from "@/components/hero";
import { NewsSection } from "@/components/news-section";
import { AnalyticsPageView } from "@/components/analytics-page-view";
import { CategoryGrid } from "@/components/category-grid";
import { ProductCard } from "@/components/product-card";
import {
  EditableBlockFrame,
  EditableAction,
  EditableSectionFrame,
  EditableSectionGroup,
  EditableText,
  EditableTrustPoints,
  HomepageInlineEditor
} from "@/components/admin/homepage-inline-editor";
import {
  getFeaturedStoreProducts,
  getHeroStats,
  getHomePageContent,
  getStoreCategoryCounts,
  getStoreNews,
  getStorefrontSettings
} from "@/lib/content";
import { getSession } from "@/lib/auth";
import { buildPublicMetadata } from "@/lib/seo";
import { isExternalHref } from "@/lib/site";
import { getHomepageStyleSettings } from "@/lib/settings/admin-settings";
import {
  getHomepageFieldStyleCss,
  getInlineFontFamilyFallback,
  type HomepageFieldStyles,
  type InlineHomepageTextField,
  type InlineHomepageValues,
  type InlineThemeValues
} from "@/lib/settings/inline-homepage";

export const metadata: Metadata = buildPublicMetadata({
  title: "فروشگاه هوش مصنوعی فارسی",
  description:
    "خرید شفاف محصولات و سرویس‌های هوش مصنوعی با محتوای فارسی، پشتیبانی روشن و مسیر سفارش واقعی.",
  path: "/"
});

function PageAction({
  href,
  label,
  className
}: {
  href: string;
  label: string;
  className: string;
}) {
  if (isExternalHref(href)) {
    return (
      <a className={className} href={href} target="_blank" rel="noreferrer">
        {label}
      </a>
    );
  }

  return (
    <Link href={href} className={className}>
      {label}
    </Link>
  );
}

function buildInlineHomepageValues(content: Awaited<ReturnType<typeof getHomePageContent>>): InlineHomepageValues {
  return {
    heroEyebrow: content.hero.eyebrow,
    heroStatusLabel: content.hero.statusLabel,
    heroTitleLead: content.hero.titleLead,
    heroTitleHighlight: content.hero.titleHighlight,
    heroTitleTail: content.hero.titleTail,
    heroDescription: content.hero.description,
    heroPrimaryCtaLabel: content.hero.primaryCtaLabel,
    heroPrimaryCtaHref: content.hero.primaryCtaHref,
    heroSecondaryCtaLabel: content.hero.secondaryCtaLabel,
    heroSecondaryCtaHref: content.hero.secondaryCtaHref,
    heroProofTitle: content.hero.proofTitle,
    heroProofText: content.hero.proofText,
    heroQuickStartTitle: content.hero.quickStartTitle,
    heroQuickStartText: content.hero.quickStartText,
    heroMarketLabel: content.hero.marketLabel,
    heroMarketTitle: content.hero.marketTitle,
    heroMarketDescription: content.hero.marketDescription,
    heroMarketBadge: content.hero.marketBadge,
    categoriesEyebrow: content.categorySection.eyebrow,
    categoriesTitle: content.categorySection.title,
    categoriesDescription: content.categorySection.description,
    categoriesCtaLabel: content.categorySection.ctaLabel,
    categoriesCtaHref: content.categorySection.ctaHref,
    featuredEyebrow: content.featuredSection.eyebrow,
    featuredTitle: content.featuredSection.title,
    featuredDescription: content.featuredSection.description,
    featuredCtaLabel: content.featuredSection.ctaLabel,
    featuredCtaHref: content.featuredSection.ctaHref,
    newsEyebrow: content.newsSection.eyebrow,
    newsTitle: content.newsSection.title,
    newsDescription: content.newsSection.description,
    newsCtaLabel: content.newsSection.ctaLabel,
    newsCtaHref: content.newsSection.ctaHref,
    trustEyebrow: content.trustSection.eyebrow,
    trustTitle: content.trustSection.title,
    trustPoints: content.trustSection.points.join("\n"),
    roadmapEyebrow: content.roadmapSection.eyebrow,
    roadmapTitle: content.roadmapSection.title,
    roadmapPhase1Title: content.roadmapSection.phases[0].title,
    roadmapPhase1Description: content.roadmapSection.phases[0].description,
    roadmapPhase2Title: content.roadmapSection.phases[1].title,
    roadmapPhase2Description: content.roadmapSection.phases[1].description,
    roadmapPhase3Title: content.roadmapSection.phases[2].title,
    roadmapPhase3Description: content.roadmapSection.phases[2].description,
    announcementLabel: content.announcement.label,
    announcementTitle: content.announcement.title,
    announcementDescription: content.announcement.description,
    announcementCtaLabel: content.announcement.ctaLabel,
    announcementCtaHref: content.announcement.ctaHref,
    showCategorySection: content.categorySection.isVisible,
    showFeaturedSection: content.featuredSection.isVisible,
    showNewsSection: content.newsSection.isVisible,
    showTrustSection: content.trustSection.isVisible,
    showRoadmapSection: content.roadmapSection.isVisible,
    showAnnouncement: content.announcement.isVisible
  };
}

function buildInlineThemeValues(settings: Awaited<ReturnType<typeof getStorefrontSettings>>): InlineThemeValues {
  return {
    primaryColor: settings.appearance.primaryColor,
    secondaryColor: settings.appearance.secondaryColor,
    fontFamily: getInlineFontFamilyFallback(settings.appearance.fontFamily)
  };
}

function getFieldStyle(fieldStyles: HomepageFieldStyles, field: InlineHomepageTextField) {
  return getHomepageFieldStyleCss(fieldStyles[field]);
}

export default async function HomePage() {
  const [
    featuredProducts,
    newsArticles,
    categoryCounts,
    heroStats,
    homePageContent,
    storefrontSettings,
    session,
    homepageFieldStyles
  ] =
    await Promise.all([
      getFeaturedStoreProducts(),
      getStoreNews(),
      getStoreCategoryCounts(),
      getHeroStats(),
      getHomePageContent(),
      getStorefrontSettings(),
      getSession(),
      getHomepageStyleSettings()
    ]);
  const canInlineEdit = session?.role === "super_admin";

  const categorySection = (
    <section className="section section-muted home-section home-section-categories deferred-section">
      <div className="container section-stack home-section-stack">
        <div className="section-header home-section-header">
          <div className="section-copy">
            {canInlineEdit ? (
              <EditableText field="categoriesEyebrow" as="div" className="eyebrow" label="Eyebrow دسته‌بندی‌ها" />
            ) : (
              <div className="eyebrow">{homePageContent.categorySection.eyebrow}</div>
            )}
            {canInlineEdit ? (
              <>
                <h2 className="section-title">
                  <EditableText field="categoriesTitle" as="span" label="عنوان بخش دسته‌بندی‌ها" />
                </h2>
                <EditableText
                  field="categoriesDescription"
                  as="p"
                  className="muted section-text"
                  label="توضیح بخش دسته‌بندی‌ها"
                  multiline
                />
              </>
            ) : (
              <>
                <h2 className="section-title" style={getFieldStyle(homepageFieldStyles, "categoriesTitle")}>
                  {homePageContent.categorySection.title}
                </h2>
                <p className="muted section-text">{homePageContent.categorySection.description}</p>
              </>
            )}
          </div>
          {canInlineEdit ? (
            <EditableAction
              className="btn btn-secondary"
              labelField="categoriesCtaLabel"
              hrefField="categoriesCtaHref"
              label="CTA دسته‌بندی‌ها"
              hrefLabel="لینک CTA دسته‌بندی‌ها"
            />
          ) : (
            <PageAction
              href={homePageContent.categorySection.ctaHref}
              label={homePageContent.categorySection.ctaLabel}
              className="btn btn-secondary"
            />
          )}
        </div>

        <CategoryGrid items={categoryCounts} />
      </div>
    </section>
  );

  const featuredSection = (
    <section className="section home-section home-section-featured deferred-section">
      <div className="container section-stack home-section-stack">
        <div className="section-header home-section-header">
          <div className="section-copy">
            {canInlineEdit ? (
              <EditableText field="featuredEyebrow" as="div" className="eyebrow" label="Eyebrow محصولات منتخب" />
            ) : (
              <div className="eyebrow">{homePageContent.featuredSection.eyebrow}</div>
            )}
            {canInlineEdit ? (
              <>
                <h2 className="section-title">
                  <EditableText field="featuredTitle" as="span" label="عنوان بخش محصولات منتخب" />
                </h2>
                <EditableText
                  field="featuredDescription"
                  as="p"
                  className="muted section-text"
                  label="توضیح بخش محصولات منتخب"
                  multiline
                />
              </>
            ) : (
              <>
                <h2 className="section-title" style={getFieldStyle(homepageFieldStyles, "featuredTitle")}>
                  {homePageContent.featuredSection.title}
                </h2>
                <p className="muted section-text">{homePageContent.featuredSection.description}</p>
              </>
            )}
          </div>
          {canInlineEdit ? (
            <EditableAction
              className="btn btn-secondary"
              labelField="featuredCtaLabel"
              hrefField="featuredCtaHref"
              label="CTA محصولات منتخب"
              hrefLabel="لینک CTA محصولات منتخب"
            />
          ) : (
            <PageAction
              href={homePageContent.featuredSection.ctaHref}
              label={homePageContent.featuredSection.ctaLabel}
              className="btn btn-secondary"
            />
          )}
        </div>

        {featuredProducts.length > 0 ? (
          <div className="product-grid featured-product-grid">
            {featuredProducts.map((product) => (
              <ProductCard key={product.id} product={product} variant="featured" />
            ))}
          </div>
        ) : (
          <div className="surface empty-state-card">
            <strong>هنوز محصول شاخصی برای نمایش انتخاب نشده است</strong>
            <p className="muted">به‌زودی پیشنهادهای شاخص فروشگاه در این بخش نمایش داده می‌شوند.</p>
          </div>
        )}
      </div>
    </section>
  );

  const newsSection = (
    <NewsSection
      articles={newsArticles.slice(0, 3)}
      content={homePageContent.newsSection}
      canInlineEdit={canInlineEdit}
      fieldStyles={homepageFieldStyles}
    />
  );

  const trustCard = (
    <div className="surface roadmap-card">
      {canInlineEdit ? (
        <EditableText field="trustEyebrow" as="div" className="eyebrow" label="Eyebrow اعتماد" />
      ) : (
        <div className="eyebrow">{homePageContent.trustSection.eyebrow}</div>
      )}
      <h2 className="section-title">
        {canInlineEdit ? (
          <EditableText field="trustTitle" as="span" label="عنوان اعتماد" />
        ) : (
          <span style={getFieldStyle(homepageFieldStyles, "trustTitle")}>{homePageContent.trustSection.title}</span>
        )}
      </h2>
      {canInlineEdit ? (
        <EditableTrustPoints className="feature-list-simple" />
      ) : (
        <ul className="feature-list-simple" style={getFieldStyle(homepageFieldStyles, "trustPoints")}>
          {homePageContent.trustSection.points.map((point) => (
            <li key={point}>{point}</li>
          ))}
        </ul>
      )}
    </div>
  );

  const roadmapPhaseFields: Array<{
    titleField: InlineHomepageTextField;
    descriptionField: InlineHomepageTextField;
  }> = [
    { titleField: "roadmapPhase1Title", descriptionField: "roadmapPhase1Description" },
    { titleField: "roadmapPhase2Title", descriptionField: "roadmapPhase2Description" },
    { titleField: "roadmapPhase3Title", descriptionField: "roadmapPhase3Description" }
  ];

  const roadmapCard = (
    <div className="surface roadmap-card accent-grid">
      {canInlineEdit ? (
        <EditableText field="roadmapEyebrow" as="div" className="eyebrow" label="Eyebrow مسیر توسعه" />
      ) : (
        <div className="eyebrow">{homePageContent.roadmapSection.eyebrow}</div>
      )}
      <h2 className="section-title">
        {canInlineEdit ? (
          <EditableText field="roadmapTitle" as="span" label="عنوان مسیر توسعه" />
        ) : (
          homePageContent.roadmapSection.title
        )}
      </h2>
      <div className="roadmap-points">
        {homePageContent.roadmapSection.phases.map((phase, index) => {
          const fields = roadmapPhaseFields[index];

          return (
            <div key={`${phase.title}-${index}`}>
              {canInlineEdit && fields ? (
                <>
                  <EditableText
                    field={fields.titleField}
                    as="strong"
                    label={`عنوان فاز ${index + 1}`}
                  />
                  <EditableText
                    field={fields.descriptionField}
                    as="p"
                    label={`توضیح فاز ${index + 1}`}
                    multiline
                  />
                </>
              ) : (
                <>
                  <strong>{phase.title}</strong>
                  <p>{phase.description}</p>
                </>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );

  const trustRoadmapSection = (
    <section className="section section-muted deferred-section">
      <div className="container roadmap-grid">
        {canInlineEdit ? (
          <>
            <EditableBlockFrame field="showTrustSection" label="اعتماد">
              {trustCard}
            </EditableBlockFrame>
            <EditableBlockFrame field="showRoadmapSection" label="مسیر توسعه">
              {roadmapCard}
            </EditableBlockFrame>
          </>
        ) : (
          <>
            {homePageContent.trustSection.isVisible ? trustCard : null}
            {homePageContent.roadmapSection.isVisible ? roadmapCard : null}
          </>
        )}
      </div>
    </section>
  );

  const announcementSection = (
    <section className="section section-last deferred-section">
      <div className="container section-stack">
        <div className="surface support-strip">
          <div>
            {canInlineEdit ? (
              <>
                <EditableText field="announcementLabel" as="small" label="برچسب نوار پایانی" />
                <EditableText field="announcementTitle" as="strong" label="عنوان نوار پایانی" />
              </>
            ) : (
              <>
                <small>{homePageContent.announcement.label}</small>
                <strong style={getFieldStyle(homepageFieldStyles, "announcementTitle")}>
                  {homePageContent.announcement.title}
                </strong>
              </>
            )}
          </div>
          {canInlineEdit ? (
            <>
              <EditableText
                field="announcementDescription"
                as="p"
                label="توضیح نوار پایانی"
                multiline
              />
              <EditableAction
                className="btn btn-primary"
                labelField="announcementCtaLabel"
                hrefField="announcementCtaHref"
                label="متن CTA نوار پایانی"
                hrefLabel="لینک CTA نوار پایانی"
              />
            </>
          ) : (
            <>
              <p>{homePageContent.announcement.description}</p>
              <PageAction
                href={homePageContent.announcement.ctaHref}
                label={homePageContent.announcement.ctaLabel}
                className="btn btn-primary"
              />
            </>
          )}
        </div>
      </div>
    </section>
  );

  const homepage = (
    <div className="homepage-shell">
      <AnalyticsPageView
        name="homepage_view"
        route="/"
        path="/"
        metadata={{
          featuredProductCount: featuredProducts.length,
          newsArticleCount: newsArticles.length,
          categoryCount: categoryCounts.length
        }}
      />
      <Hero
        featured={featuredProducts.slice(0, 4)}
        stats={heroStats}
        content={homePageContent.hero}
        storefront={storefrontSettings}
        canInlineEdit={canInlineEdit}
        fieldStyles={homepageFieldStyles}
      />

      {canInlineEdit ? (
        <EditableSectionFrame field="showCategorySection" label="دسته‌بندی‌ها">
          {categorySection}
        </EditableSectionFrame>
      ) : homePageContent.categorySection.isVisible ? (
        categorySection
      ) : null}

      {canInlineEdit ? (
        <EditableSectionFrame field="showFeaturedSection" label="محصولات منتخب">
          {featuredSection}
        </EditableSectionFrame>
      ) : homePageContent.featuredSection.isVisible ? (
        featuredSection
      ) : null}

      {canInlineEdit ? (
        <EditableSectionFrame field="showNewsSection" label="اخبار">
          {newsSection}
        </EditableSectionFrame>
      ) : homePageContent.newsSection.isVisible ? (
        newsSection
      ) : null}

      {canInlineEdit ? (
        <EditableSectionGroup fields={["showTrustSection", "showRoadmapSection"]}>
          {trustRoadmapSection}
        </EditableSectionGroup>
      ) : homePageContent.trustSection.isVisible || homePageContent.roadmapSection.isVisible ? (
        trustRoadmapSection
      ) : null}

      {canInlineEdit ? (
        <EditableSectionFrame field="showAnnouncement" label="نوار پایانی">
          {announcementSection}
        </EditableSectionFrame>
      ) : homePageContent.announcement.isVisible ? (
        announcementSection
      ) : null}
    </div>
  );

  if (!canInlineEdit) {
    return homepage;
  }

  return (
    <HomepageInlineEditor
      initialHomepage={buildInlineHomepageValues(homePageContent)}
      initialTheme={buildInlineThemeValues(storefrontSettings)}
      initialFieldStyles={homepageFieldStyles}
    >
      {homepage}
    </HomepageInlineEditor>
  );
}
