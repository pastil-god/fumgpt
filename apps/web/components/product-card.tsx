import Link from "next/link";
import type { Product } from "@/lib/mock-data";
import { formatPriceIRR, getDiscountPercent } from "@/lib/mock-data";

type Props = {
  product: Product;
};

export function ProductCard({ product }: Props) {
  return (
    <article className="surface product-card">
      <div className={`product-visual accent-${product.accent}`}>
        <span className="product-brand">{product.brand}</span>
        <strong>{product.coverLabel}</strong>
      </div>

      <div className="product-card-body">
        <div className="product-badges">
          <span className="pill pill-sale">{product.badge}</span>
          <span className="pill">{product.brand}</span>
        </div>

        <div>
          <h3>{product.title}</h3>
          <p className="muted">{product.shortDescription}</p>
        </div>

        <div className="price-stack">
          <div className="price-line old-price">
            <span>قیمت قبل</span>
            <strong>{formatPriceIRR(product.comparePrice)} تومان</strong>
          </div>
          <div className="price-line final-price">
            <span>قیمت فعلی</span>
            <strong>{formatPriceIRR(product.price)} تومان</strong>
          </div>
        </div>

        <div className="chip-row">
          <span className="chip">{product.delivery}</span>
          <span className="chip">{getDiscountPercent(product.comparePrice, product.price)}٪ صرفه‌جویی</span>
        </div>

        <div className="btn-row card-actions">
          <Link className="btn btn-primary" href={`/products/${product.slug}`}>
            مشاهده جزئیات
          </Link>
          <Link className="btn btn-ghost" href={`/products?category=${product.category}`}>
            محصولات مشابه
          </Link>
        </div>
      </div>
    </article>
  );
}
