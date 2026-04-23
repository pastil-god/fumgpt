import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { isAcademyEditorialArticle } from "@/lib/analytics";
import { AnalyticsPageView } from "@/components/analytics-page-view";
import {
  formatPersianDate,
  getRelatedNewsArticles,
  getStoreNewsBySlug,
  isDirectVideoFile
} from "@/lib/content";
import { buildPublicMetadata } from "@/lib/seo";

async function resolveParams(
  params: Promise<{ slug: string }>
) {
  return await params;
}

export async function generateMetadata({
  params
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const resolvedParams = await resolveParams(params);
  const article = await getStoreNewsBySlug(resolvedParams.slug);

  if (!article) {
    return {
      title: "خبر پیدا نشد"
    };
  }

  return buildPublicMetadata({
    title: article.title,
    description: article.excerpt,
    path: `/news/${article.slug}`,
    imagePath: article.imageUrl,
    type: "article"
  });
}

export default async function NewsDetailPage({
  params
}: {
  params: Promise<{ slug: string }>;
}) {
  const resolvedParams = await resolveParams(params);
  const article = await getStoreNewsBySlug(resolvedParams.slug);

  if (!article) {
    notFound();
  }

  const relatedArticles = await getRelatedNewsArticles(article.id, 3);
  const isAcademyArticle = isAcademyEditorialArticle({
    slug: article.slug,
    title: article.title,
    excerpt: article.excerpt
  });

  return (
    <section className="section section-muted">
      <div className="container section-stack">
        {isAcademyArticle ? (
          <AnalyticsPageView
            name="academy_article_view"
            route="/news/[slug]"
            path={`/news/${article.slug}`}
            entityType="article"
            entityId={article.slug}
            metadata={{
              relatedArticleCount: relatedArticles.length,
              source: "news"
            }}
          />
        ) : null}
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
                priority
                quality={70}
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
                <Link href={`/news/${item.slug}`} className="surface news-card" key={item.id} prefetch={false}>
                  {item.imageUrl ? (
                    <div className="news-media-shell">
                      <Image
                        className="news-media"
                        src={item.imageUrl}
                        alt={item.title}
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
