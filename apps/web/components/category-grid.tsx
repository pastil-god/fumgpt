import Link from "next/link";
import { categories, products } from "@/lib/mock-data";

export function CategoryGrid() {
  const items = categories.filter((item) => item.key !== "all");

  return (
    <div className="category-grid">
      {items.map((item) => {
        const count = products.filter((product) => product.category === item.key).length;

        return (
          <Link
            href={`/products?category=${item.key}`}
            className="surface category-card"
            key={item.key}
          >
            <div className="category-icon">{count}</div>
            <div>
              <strong>{item.label}</strong>
              <p>{item.description}</p>
            </div>
          </Link>
        );
      })}
    </div>
  );
}
