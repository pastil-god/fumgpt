import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  formatPersianDate,
  getRelatedNewsArticles,
  getStoreNewsBySlug,
  isDirectVideoFile
} from "@/lib/content";
import { siteConfig } from "@/lib/site";

async function resolveParams(
  params: Promise<{ slug: string }> | { slug: string }
) {
  return typeof (params as Promise<{ slug: string }>).then === "function"
    ? await (params as Promise<{ slug: string }>)
    : (params as { slug: string });
}

export async function generateMetadata({
  params
}: {
  params: Promise<{ slug: string }> | { slug: string };
}): Promise<Metadata> {
  const resolvedParams = await resolveParams(params);
  const article = await getStoreNewsBySlug(resolvedParams.slug);

  if (!article) {
    return {
      title: "خبر پیدا نشد"
    };
  }

  return {
    title: article.title,
    description: article.excerpt,
    openGraph: {
      title: article.title,
      description: article.excerpt,
      type: "article",
      url: `${siteConfig.siteUrl}/news/${article.slug}`,
      images: article.imageUrl ? [{ url: article.imageUrl }] : undefined
    }
  };
}

export default async function NewsDetailPage({
  params
}: {
  params: Promise<{ slug: string }> | { slug: string };
}) {
  const resolvedParams = await resolveParams(params);
  const article = await getStoreNewsBySlug(resolvedParams.slug);

  if (!article) {
    notFound();
  }

  const relatedArticles = await getRelatedNewsArticles(article.id, 3);

  return (
    <section className="section">
      <div className="container section-stack">
        <div className="surface article-shell">
          <div className="article-meta">
            <span className="chip">{formatPersianDate(article.publishedAt)}</span>
            {article.videoUrl ? <span className="chip">دارای ویدئو</span> : null}
          </div>
          <h1 className="page-title">{article.title}</h1>
          <p className="article-excerpt">{article.excerpt}</p>

          {article.imageUrl ? (
            <div className="article-media-shell">
              <Image
                className="article-media"
                src={article.imageUrl}
                alt={article.title}
                fill
                sizes="(max-width: 1160px) 100vw, 80vw"
              />
            </div>
          ) : null}

          <div className="article-body">
            <p>{article.body}</p>
          </div>

          {article.videoUrl ? (
            <div className="surface nested-card product-video-card">
              <div className="eyebrow">ویدئو</div>
              {isDirectVideoFile(article.videoUrl) ? (
                <video className="product-video" controls preload="metadata" src={article.videoUrl} />
              ) : (
                <a className="btn btn-secondary" href={article.videoUrl} target="_blank" rel="noreferrer">
                  مشاهده ویدئو
                </a>
              )}
            </div>
          ) : null}

          <div className="btn-row">
            <Link href="/news" className="btn btn-primary">
              بازگشت به خبرها
            </Link>
            <Link href="/products" className="btn btn-ghost">
              مشاهده محصولات
            </Link>
          </div>
        </div>

        {relatedArticles.length > 0 ? (
          <div className="section-stack">
            <div className="section-header">
              <div>
                <div className="eyebrow">خبرهای بیشتر</div>
                <h2 className="section-title">مطالب مرتبط</h2>
              </div>
            </div>

            <div className="news-page-grid">
              {relatedArticles.map((item) => (
                <Link href={`/news/${item.slug}`} className="surface news-card" key={item.id}>
                  {item.imageUrl ? (
                    <div className="news-media-shell">
                      <Image
                        className="news-media"
                        src={item.imageUrl}
                        alt={item.title}
                        fill
                        sizes="(max-width: 840px) 100vw, (max-width: 1160px) 50vw, 33vw"
                      />
                    </div>
                  ) : (
                    <div className="news-media news-media-fallback accent-grid" aria-hidden="true" />
                  )}
                  <div className="news-card-body">
                    <div className="chip-row">
                      <span className="chip">{formatPersianDate(item.publishedAt)}</span>
                    </div>
                    <h3>{item.title}</h3>
                    <p>{item.excerpt}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        ) : null}
      </div>
    </section>
  );
}
