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

export function CategoryGrid({ items }: Props) {
  if (!items || items.length === 0) {
    return (
      <div className="category-grid">
        <div className="surface category-card">
          <div className="category-icon">...</div>
          <div>
            <strong>دسته‌بندی‌ها در حال بارگذاری هستند</strong>
            <p>بعد از آماده شدن داده‌ها، دسته‌های فروشگاه در این بخش نمایش داده می‌شوند.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="category-grid">
      {items.map((item) => (
        <Link href={`/products?category=${item.key}`} className="surface category-card" key={item.key}>
          <div className="category-icon">{item.count}</div>
          <div>
            <strong>{item.label}</strong>
            <p>{item.description}</p>
          </div>
        </Link>
      ))}
    </div>
  );
}
