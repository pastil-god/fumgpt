import Image from "next/image";
import Link from "next/link";
import { formatPersianDate } from "@/lib/content";
import type { HomePageContent } from "@/lib/mock-homepage";
import type { NewsArticle } from "@/lib/mock-news";

type Props = {
  articles?: NewsArticle[];
  content?: HomePageContent["newsSection"];
};

export function NewsSection({ articles, content }: Props) {
  const resolvedContent = content || {
    isVisible: true,
    eyebrow: "اخبار",
    title: "آخرین خبرها و مقاله‌های فروشگاه",
    description:
      "راهنماها، خبرها و نکته‌های کاربردی کمک می‌کنند ابزار مناسب را آگاهانه‌تر انتخاب کنی.",
    ctaLabel: "مشاهده همه خبرها",
    ctaHref: "/news",
    adminCalloutLabel: "مدیریت محتوا",
    adminCalloutTitle: "محتوای آموزشی و خبرهای مهم را سریع‌تر منتشر کن",
    adminCalloutDescription:
      "این بخش برای انتشار اطلاعیه‌ها، راهنماها و آموزش‌های کوتاه فروشگاه آماده شده است."
  };
  const safeArticles = articles || [];

  if (safeArticles.length === 0) {
    return (
      <section className="section news-section deferred-section">
        <div className="container section-stack">
          <div className="section-header">
            <div>
              <div className="eyebrow">{resolvedContent.eyebrow}</div>
              <h2 className="section-title">{resolvedContent.title}</h2>
              <p className="muted section-text">{resolvedContent.description}</p>
            </div>
          </div>

          <div className="surface empty-state-card">
            <strong>هنوز خبری منتشر نشده است</strong>
            <p className="muted">
              بعد از انتشار اولین خبر یا راهنما، تازه‌ترین محتوا در همین بخش نمایش داده می‌شود.
            </p>
            <Link href={resolvedContent.ctaHref} className="btn btn-secondary">
              {resolvedContent.ctaLabel}
            </Link>
          </div>
        </div>
      </section>
    );
  }

  const [lead, ...rest] = safeArticles;

  return (
    <section className="section news-section deferred-section">
      <div className="container section-stack">
        <div className="section-header">
          <div>
            <div className="eyebrow">{resolvedContent.eyebrow}</div>
            <h2 className="section-title">{resolvedContent.title}</h2>
            <p className="muted section-text">{resolvedContent.description}</p>
          </div>
          <Link href={resolvedContent.ctaHref} className="btn btn-secondary">
            {resolvedContent.ctaLabel}
          </Link>
        </div>

        <div className="news-grid">
          <Link href={`/news/${lead.slug}`} className="surface news-card news-card-lead" prefetch={false}>
            {lead.imageUrl ? (
              <div className="news-media-shell">
                <Image
                  className="news-media"
                  src={lead.imageUrl}
                  alt={lead.title}
                  fill
                  quality={65}
                  sizes="(max-width: 840px) 100vw, (max-width: 1160px) 50vw, 60vw"
                />
              </div>
            ) : (
              <div className="news-media news-media-fallback accent-grid" aria-hidden="true" />
            )}

            <div className="news-card-body">
              <div className="chip-row">
                <span className="chip">{formatPersianDate(lead.publishedAt)}</span>
                {lead.videoUrl ? <span className="chip">دارای ویدئو</span> : null}
              </div>
              <h3>{lead.title}</h3>
              <p>{lead.excerpt}</p>
              <span className="text-link">{lead.ctaLabel || "مطالعه خبر"}</span>
            </div>
          </Link>

          <div className="news-stack">
            {rest.map((article) => (
              <Link href={`/news/${article.slug}`} className="surface news-card" key={article.id} prefetch={false}>
                {article.imageUrl ? (
                  <div className="news-media-shell">
                    <Image
                      className="news-media"
                      src={article.imageUrl}
                      alt={article.title}
                      fill
                      quality={65}
                      sizes="(max-width: 840px) 100vw, (max-width: 1160px) 50vw, 40vw"
                    />
                  </div>
                ) : (
                  <div className="news-media news-media-fallback accent-grid" aria-hidden="true" />
                )}

                <div className="news-card-body">
                  <div className="chip-row">
                    <span className="chip">{formatPersianDate(article.publishedAt)}</span>
                    {article.videoUrl ? <span className="chip">ویدئوی ضمیمه</span> : null}
                  </div>
                  <h3>{article.title}</h3>
                  <p>{article.excerpt}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>

        <div className="surface cms-callout">
          <div>
            <small>{resolvedContent.adminCalloutLabel}</small>
            <strong>{resolvedContent.adminCalloutTitle}</strong>
          </div>
          <p>{resolvedContent.adminCalloutDescription}</p>
          <Link href={resolvedContent.ctaHref} className="btn btn-secondary">
            {resolvedContent.ctaLabel}
          </Link>
        </div>
      </div>
    </section>
  );
}
