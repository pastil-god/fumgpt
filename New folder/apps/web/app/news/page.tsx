import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { formatPersianDate, getStoreNews } from "@/lib/content";
import { buildPublicMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPublicMetadata({
  title: "اخبار و مقاله‌ها",
  description: "خبرها، مقاله‌ها و به‌روزرسانی‌های FumGPT در یک مسیر عمومی و قابل اشتراک‌گذاری.",
  path: "/news"
});

export default async function NewsPage() {
  const articles = await getStoreNews();

  return (
    <section className="section section-muted">
      <div className="container section-stack">
        <div className="surface listing-hero">
          <div>
            <div className="eyebrow">اخبار و مقالات</div>
            <h1 className="page-title">خبرها، مقاله‌ها و به‌روزرسانی‌های FumGPT</h1>
            <p className="muted section-text">
              این صفحه از طریق CMS به‌روزرسانی می‌شود تا خبرها، مقاله‌ها و اطلاعیه‌های فروشگاه در یک مسیر
              واحد و قابل مدیریت منتشر شوند.
            </p>
          </div>
          <div className="chip-row">
            <span className="chip">{articles.length} خبر</span>
            <Link href="/" className="chip chip-link">
              بازگشت به خانه
            </Link>
          </div>
        </div>

        {articles.length > 0 ? (
          <div className="news-page-grid">
            {articles.map((article) => (
              <Link href={`/news/${article.slug}`} className="surface news-card" key={article.id} prefetch={false}>
                {article.imageUrl ? (
                  <div className="news-media-shell">
                    <Image
                      className="news-media"
                      src={article.imageUrl}
                      alt={article.title}
                      fill
                      quality={65}
                      sizes="(max-width: 840px) 100vw, (max-width: 1160px) 50vw, 33vw"
                    />
                  </div>
                ) : (
                  <div className="news-media news-media-fallback accent-grid" aria-hidden="true" />
                )}
                <div className="news-card-body">
                  <div className="chip-row">
                    <span className="chip">{formatPersianDate(article.publishedAt)}</span>
                    {article.videoUrl ? <span className="chip">دارای ویدئو</span> : null}
                  </div>
                  <h3>{article.title}</h3>
                  <p>{article.excerpt}</p>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="surface empty-state-card">
            <strong>هنوز خبری برای نمایش ثبت نشده است</strong>
            <p className="muted">
              بعد از انتشار اولین خبر، این بخش به‌صورت خودکار تازه‌ترین محتوا را در همین صفحه نمایش می‌دهد.
            </p>
            <Link href="/" className="btn btn-ghost">
              بازگشت به خانه
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}
