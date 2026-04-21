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
    eyebrow: "News",
    title: "آخرین خبرها و مقاله‌های فروشگاه",
    description:
      "این بخش برای انتشار سریع خبر، مقاله، آپدیت محصول و اطلاعیه‌های مهم از داخل CMS طراحی شده است.",
    ctaLabel: "همه خبرها"
  };
  const safeArticles = articles || [];

  if (safeArticles.length === 0) {
    return (
      <section className="section news-section">
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
              بعد از اتصال CMS، خبرها و مقاله‌های جدید از همین بخش روی صفحه اصلی نمایش داده
              می‌شوند.
            </p>
            <Link href="/news" className="btn btn-ghost">
              صفحه خبرها
            </Link>
          </div>
        </div>
      </section>
    );
  }

  const [lead, ...rest] = safeArticles;

  return (
    <section className="section news-section">
      <div className="container section-stack">
        <div className="section-header">
          <div>
            <div className="eyebrow">{resolvedContent.eyebrow}</div>
            <h2 className="section-title">{resolvedContent.title}</h2>
            <p className="muted section-text">{resolvedContent.description}</p>
          </div>
          <Link href="/news" className="btn btn-ghost">
            {resolvedContent.ctaLabel}
          </Link>
        </div>

        <div className="news-grid">
          <Link href={`/news/${lead.slug}`} className="surface news-card news-card-lead">
            {lead.imageUrl ? (
              <div className="news-media-shell">
                <Image
                  className="news-media"
                  src={lead.imageUrl}
                  alt={lead.title}
                  fill
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
              <p className="muted">{lead.body}</p>
            </div>
          </Link>

          <div className="news-stack">
            {rest.map((article) => (
              <Link href={`/news/${article.slug}`} className="surface news-card" key={article.id}>
                {article.imageUrl ? (
                  <div className="news-media-shell">
                    <Image
                      className="news-media"
                      src={article.imageUrl}
                      alt={article.title}
                      fill
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
            <small>CMS Ready</small>
            <strong>مدیر محتوا می‌تواند خبر، تصویر، ویدئو و متن را بدون کدنویسی منتشر کند</strong>
          </div>
          <p>
            با اتصال Contentful، این بخش و محتوای محصولات از طریق داشبورد قابل ویرایش می‌شود و
            دیگر لازم نیست برای هر تغییر سراغ کد بیایید.
          </p>
          <Link href="/news" className="btn btn-ghost">
            مشاهده خبرها
          </Link>
        </div>
      </div>
    </section>
  );
}
