import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  getStoreCategoryMeta,
  getStoreProductBySlug,
  getStoreRelatedProducts,
  getStorefrontSettings,
  isDirectVideoFile
} from "@/lib/content";
import { formatPriceIRR, getDiscountPercent } from "@/lib/mock-data";
import { isExternalHref, siteConfig } from "@/lib/site";
import { ProductCard } from "@/components/product-card";

async function resolveParams(params: Promise<{ slug: string }> | { slug: string }) {
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
  const product = await getStoreProductBySlug(resolvedParams.slug);

  if (!product) {
    return {
      title: "محصول پیدا نشد"
    };
  }

  return {
    title: product.title,
    description: product.shortDescription,
    openGraph: {
      title: product.title,
      description: product.shortDescription,
      type: "website",
      url: `${siteConfig.siteUrl}/products/${product.slug}`,
      images: product.imageUrl ? [{ url: product.imageUrl }] : undefined
    }
  };
}

function SupportAction({
  href,
  label
}: {
  href: string;
  label: string;
}) {
  if (isExternalHref(href)) {
    return (
      <a className="btn btn-primary" href={href} target="_blank" rel="noreferrer">
        {label}
      </a>
    );
  }

  return (
    <Link className="btn btn-primary" href={href}>
      {label}
    </Link>
  );
}

export default async function ProductDetailPage({
  params
}: {
  params: Promise<{ slug: string }> | { slug: string };
}) {
  const resolvedParams = await resolveParams(params);
  const [product, storefrontSettings] = await Promise.all([
    getStoreProductBySlug(resolvedParams.slug),
    getStorefrontSettings()
  ]);

  if (!product) {
    notFound();
  }

  const [relatedProducts, categoryMeta] = await Promise.all([
    getStoreRelatedProducts(product.category, product.id),
    getStoreCategoryMeta(product.category)
  ]);
  const galleryImages = [
    ...new Set(
      [product.imageUrl, ...(product.galleryImageUrls || [])].filter(
        (item): item is string => Boolean(item)
      )
    )
  ];

  return (
    <section className="section section-muted">
      <div className="container section-stack">
        <div className="detail-breadcrumb">
          <Link href="/">خانه</Link>
          <span>/</span>
          <Link href="/products">فروشگاه</Link>
          <span>/</span>
          <Link href={`/products?category=${product.category}`}>{categoryMeta?.label || product.category}</Link>
          <span>/</span>
          <span>{product.title}</span>
        </div>

        <div className="detail-grid">
          <div className="surface detail-main">
            <div className={`detail-visual accent-${product.accent}`}>
              {product.imageUrl ? (
                <Image
                  className="detail-visual-media"
                  src={product.imageUrl}
                  alt={product.title}
                  fill
                  priority
                  quality={70}
                  sizes="(max-width: 1160px) 100vw, 65vw"
                />
              ) : null}
              <span>{product.brand}</span>
              <strong>{product.coverLabel}</strong>
            </div>

            <div className="detail-content">
              <div className="product-badges">
                <span className="pill pill-sale">{product.badge}</span>
                <span className="pill">{product.brand}</span>
                <span className="pill">{product.delivery}</span>
              </div>

              <h1 className="page-title">{product.title}</h1>
              <p className="muted detail-description">{product.description}</p>

              <div className="detail-price-box">
                <div>
                  <span>قیمت قبل</span>
                  <strong className="old-price-value">{formatPriceIRR(product.comparePrice)} تومان</strong>
                </div>
                <div>
                  <span>قیمت فعلی</span>
                  <strong className="final-price-value">{formatPriceIRR(product.price)} تومان</strong>
                </div>
                <div>
                  <span>میزان صرفه‌جویی</span>
                  <strong>{getDiscountPercent(product.comparePrice, product.price).toLocaleString("fa-IR")}٪</strong>
                </div>
              </div>

              <div className="btn-row">
                <SupportAction
                  href={storefrontSettings.support.helpCtaHref}
                  label={storefrontSettings.support.helpCtaLabel}
                />
                <Link href="/products" className="btn btn-secondary">
                  بازگشت به فروشگاه
                </Link>
              </div>

              {galleryImages.length > 1 ? (
                <div className="surface nested-card">
                  <div className="eyebrow">گالری محصول</div>
                  <div className="news-page-grid">
                    {galleryImages.slice(1).map((imageUrl) => (
                      <div className="surface news-card" key={imageUrl}>
                        <div className="news-media-shell">
                          <Image
                            className="news-media"
                            src={imageUrl}
                            alt={product.title}
                            fill
                            quality={65}
                            sizes="(max-width: 840px) 100vw, 33vw"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : null}

              {product.videoUrl ? (
                <div className="surface nested-card product-video-card">
                  <div className="eyebrow">ویدئوی محصول</div>
                  {isDirectVideoFile(product.videoUrl) ? (
                    <video className="product-video" controls preload="metadata" src={product.videoUrl} />
                  ) : (
                    <a className="btn btn-secondary" href={product.videoUrl} target="_blank" rel="noreferrer">
                      مشاهده ویدئو
                    </a>
                  )}
                </div>
              ) : null}
            </div>
          </div>

          <aside className="detail-sidebar">
            <div className="surface side-card">
              <div className="eyebrow">نکات اصلی</div>
              <ul className="feature-list-simple compact">
                {product.notes.length > 0 ? (
                  product.notes.map((note) => <li key={note}>{note}</li>)
                ) : (
                  <li>نکات تکمیلی این محصول بعداً از CMS تکمیل می‌شود.</li>
                )}
              </ul>
            </div>

            <div className="surface side-card">
              <div className="eyebrow">ویژگی‌های محصول</div>
              <ul className="feature-list-simple compact">
                {product.features.length > 0 ? (
                  product.features.map((feature) => <li key={feature}>{feature}</li>)
                ) : (
                  <li>ویژگی‌های این محصول هنوز تکمیل نشده‌اند.</li>
                )}
              </ul>
            </div>

            {product.trustNote || product.supportNote || product.deliveryNote ? (
              <div className="surface side-card">
                <div className="eyebrow">اطلاعات تکمیلی</div>
                <ul className="feature-list-simple compact">
                  {product.deliveryNote ? <li>{product.deliveryNote}</li> : null}
                  {product.trustNote ? <li>{product.trustNote}</li> : null}
                  {product.supportNote ? <li>{product.supportNote}</li> : null}
                </ul>
              </div>
            ) : null}
          </aside>
        </div>

        <div className="surface info-grid-card">
          <div>
            <div className="eyebrow">خلاصه محصول</div>
            <p className="muted">{product.shortDescription}</p>
          </div>
          <div>
            <div className="eyebrow">روش تحویل</div>
            <p className="muted">{product.delivery}</p>
          </div>
          <div>
            <div className="eyebrow">دسته‌بندی</div>
            <p className="muted">{categoryMeta?.label || product.category}</p>
          </div>
        </div>

        {relatedProducts.length > 0 ? (
          <div className="section-stack">
            <div className="section-header">
              <div>
                <div className="eyebrow">محصولات مرتبط</div>
                <h2 className="section-title">پیشنهادهای مشابه</h2>
              </div>
            </div>
            <div className="product-grid compact-grid">
              {relatedProducts.map((item) => (
                <ProductCard key={item.id} product={item} />
              ))}
            </div>
          </div>
        ) : null}
      </div>
    </section>
  );
}
