import Link from "next/link";
import type { ProductCategory } from "@/lib/mock-data";

type Props = {
  items?: Array<{
    key: ProductCategory;
    label: string;
    description: string;
    count: number;
  }>;
};

function formatCount(value: number) {
  return value.toLocaleString("fa-IR");
}

export function CategoryGrid({ items }: Props) {
  if (!items || items.length === 0) {
    return (
      <div className="category-showcase">
        <div className="category-grid">
          <div className="surface category-card">
            <div className="category-card-head">
              <div className="category-icon">...</div>
              <span className="category-card-kicker">به‌زودی</span>
            </div>
            <div className="category-card-body">
              <strong>دسته‌بندی‌ها در حال بارگذاری هستند</strong>
              <p>بعد از آماده شدن داده‌ها، دسته‌های فروشگاه در این بخش نمایش داده می‌شوند.</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const totalProducts = items.reduce((sum, item) => sum + item.count, 0);

  return (
    <div className="category-showcase">
      <div className="category-tabs" role="tablist" aria-label="store-categories">
        <Link href="/products" className="category-tab category-tab-primary" prefetch={false}>
          <strong>همه محصولات</strong>
          <span className="category-tab-count">{formatCount(totalProducts)}</span>
        </Link>
        {items.map((item) => (
          <Link href={`/products?category=${item.key}`} className="category-tab" key={item.key} prefetch={false}>
            <strong>{item.label}</strong>
            <span className="category-tab-count">{formatCount(item.count)}</span>
          </Link>
        ))}
      </div>

      <div className="category-grid">
        {items.map((item) => (
          <Link href={`/products?category=${item.key}`} className="surface category-card" key={item.key} prefetch={false}>
            <div className="category-card-head">
              <div className="category-icon">{formatCount(item.count)}</div>
              <span className="category-card-kicker">دسته منتخب</span>
            </div>

            <div className="category-card-body">
              <strong>{item.label}</strong>
              <p>{item.description}</p>
            </div>

            <div className="category-card-footer">
              <span className="category-card-meta">{formatCount(item.count)} محصول</span>
              <span className="category-card-link">مشاهده دسته</span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
