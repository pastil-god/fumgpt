import Link from "next/link";
import { notFound } from "next/navigation";
import {
  formatPriceIRR,
  getDiscountPercent,
  getProductBySlug,
  getRelatedProducts,
  getCategoryMeta
} from "@/lib/mock-data";
import { ProductCard } from "@/components/product-card";

export default async function ProductDetailPage({
  params
}: {
  params: Promise<{ slug: string }> | { slug: string };
}) {
  const resolvedParams =
    typeof (params as Promise<{ slug: string }>).then === "function"
      ? await (params as Promise<{ slug: string }>)
      : (params as { slug: string });

  const product = getProductBySlug(resolvedParams.slug);

  if (!product) {
    notFound();
  }

  const relatedProducts = getRelatedProducts(product.category, product.id);
  const categoryMeta = getCategoryMeta(product.category);

  return (
    <section className="section">
      <div className="container section-stack">
        <div className="detail-grid">
          <div className="surface detail-main">
            <div className={`detail-visual accent-${product.accent}`}>
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
                  <strong className="old-price-value">
                    {formatPriceIRR(product.comparePrice)} تومان
                  </strong>
                </div>
                <div>
                  <span>قیمت فعلی</span>
                  <strong className="final-price-value">
                    {formatPriceIRR(product.price)} تومان
                  </strong>
                </div>
                <div>
                  <span>صرفه‌جویی</span>
                  <strong>{getDiscountPercent(product.comparePrice, product.price)}٪</strong>
                </div>
              </div>

              <div className="btn-row">
                <button className="btn btn-primary" type="button">
                  افزودن به سبد خرید
                </button>
                <Link href="/products" className="btn btn-ghost">
                  بازگشت به فروشگاه
                </Link>
              </div>
            </div>
          </div>

          <aside className="detail-sidebar">
            <div className="surface side-card">
              <div className="eyebrow">نکات اصلی</div>
              <ul className="feature-list-simple compact">
                {product.notes.map((note) => (
                  <li key={note}>{note}</li>
                ))}
              </ul>
            </div>

            <div className="surface side-card">
              <div className="eyebrow">ویژگی‌های محصول</div>
              <ul className="feature-list-simple compact">
                {product.features.map((feature) => (
                  <li key={feature}>{feature}</li>
                ))}
              </ul>
            </div>
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

        {relatedProducts.length > 0 && (
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
        )}
      </div>
    </section>
  );
}
