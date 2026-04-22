import Image from "next/image";
import Link from "next/link";
import type { Product } from "@/lib/mock-data";
import { formatPriceIRR, getDiscountPercent } from "@/lib/mock-data";

type Props = {
  product: Product;
  variant?: "default" | "featured";
};

export function ProductCard({ product, variant = "default" }: Props) {
  const hasDiscount = product.comparePrice > product.price;
  const discountPercent = getDiscountPercent(product.comparePrice, product.price).toLocaleString("fa-IR");
  const savings = Math.max(product.comparePrice - product.price, 0);
  const cardClassName = variant === "featured" ? "surface product-card product-card-featured" : "surface product-card";

  return (
    <article className={cardClassName}>
      <div className={`product-visual accent-${product.accent}`}>
        {product.imageUrl ? (
          <Image
            className="product-visual-media"
            src={product.imageUrl}
            alt={product.title}
            fill
            quality={65}
            sizes="(max-width: 840px) 100vw, (max-width: 1160px) 50vw, 33vw"
          />
        ) : null}

        <div className="product-visual-top">
          <span className="product-brand">{product.brand}</span>
          {hasDiscount ? <span className="product-discount-badge">{discountPercent}٪</span> : null}
        </div>

        <div className="product-visual-bottom">
          <span className="product-cover-label">{product.coverLabel}</span>
        </div>
      </div>

      <div className="product-card-body">
        <div className="product-card-intro">
          <span className="product-highlight-badge">{product.badge}</span>

          <div className="product-copy">
            <h3>{product.title}</h3>
            <p className="muted">{product.shortDescription}</p>
          </div>
        </div>

        <div className="product-meta-row">
          <span className="product-meta-item">{product.brand}</span>
          <span className="product-meta-dot" aria-hidden="true" />
          <span className="product-meta-item">{product.delivery}</span>
        </div>

        <div className="product-pricing-panel">
          <div className="price-stack">
            <div className="price-summary">
              <span className="price-label">قیمت فعلی</span>
              <strong className="price-primary">{formatPriceIRR(product.price)} تومان</strong>
            </div>

            {hasDiscount ? (
              <div className="price-support-row">
                <span className="old-price-value">{formatPriceIRR(product.comparePrice)} تومان</span>
                <span className="price-saving">صرفه‌جویی {formatPriceIRR(savings)} تومان</span>
              </div>
            ) : null}
          </div>
        </div>

        <div className="card-actions">
          <Link className="btn btn-primary btn-block" href={`/products/${product.slug}`} prefetch={false}>
            مشاهده جزئیات و خرید
          </Link>
          <Link className="text-link product-secondary-link" href={`/products?category=${product.category}`} prefetch={false}>
            محصولات مشابه
          </Link>
        </div>
      </div>
    </article>
  );
}
