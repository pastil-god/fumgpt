import Link from "next/link";
import { formatPersianDate } from "@/lib/content";
import type { NewsArticle } from "@/lib/mock-news";

type Props = {
  articles: NewsArticle[];
};

export function NewsSection({ articles }: Props) {
  if (articles.length === 0) {
    return null;
  }

  const [lead, ...rest] = articles;

  return (
    <section className="section news-section">
      <div className="container section-stack">
        <div className="section-header">
          <div>
            <div className="eyebrow">News</div>
            <h2 className="section-title">آخرین خبرها و مقاله‌های فروشگاه</h2>
            <p className="muted section-text">
              این بخش برای انتشار سریع خبر، مقاله، آپدیت محصول و اطلاعیه‌های مهم از داخل CMS
              طراحی شده است.
            </p>
          </div>
          <span className="chip chip-highlight">قابل مدیریت مستقیم از داشبورد CMS</span>
        </div>

        <div className="news-grid">
          <article className="surface news-card news-card-lead">
            {lead.imageUrl ? (
              <img className="news-media" src={lead.imageUrl} alt={lead.title} />
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
          </article>

          <div className="news-stack">
            {rest.map((article) => (
              <article className="surface news-card" key={article.id}>
                {article.imageUrl ? (
                  <img className="news-media" src={article.imageUrl} alt={article.title} />
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
              </article>
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
          <Link href="/products" className="btn btn-ghost">
            مشاهده محصولات
          </Link>
        </div>
      </div>
    </section>
  );
}
