import Link from "next/link";
import type { Metadata } from "next";
import { ProductCard } from "@/components/product-card";
import { filterStoreProducts, getStoreCategories, getStoreCategoryMeta } from "@/lib/content";

export const metadata: Metadata = {
  title: "محصولات"
};

type SearchParamsLike =
  | Promise<{ category?: string }>
  | { category?: string }
  | undefined;

async function resolveSearchParams(searchParams: SearchParamsLike) {
  if (!searchParams) {
    return {} as { category?: string };
  }

  if (typeof (searchParams as Promise<{ category?: string }>).then === "function") {
    return await (searchParams as Promise<{ category?: string }>);
  }

  return searchParams as { category?: string };
}

export default async function ProductsPage({
  searchParams
}: {
  searchParams?: SearchParamsLike;
}) {
  const params = await resolveSearchParams(searchParams);
  const selectedCategory = params.category || "all";
  const [filteredProducts, categoryItems, selectedMeta] = await Promise.all([
    filterStoreProducts(selectedCategory),
    getStoreCategories(),
    getStoreCategoryMeta(selectedCategory)
  ]);
  const allCategoryMeta = categoryItems.find((item) => item.key === "all");
  const resolvedMeta = selectedMeta || allCategoryMeta || categoryItems[0];

  return (
    <section className="section section-muted">
      <div className="container section-stack">
        <div className="surface listing-hero">
          <div>
            <div className="eyebrow">فروشگاه FumGPT</div>
            <h1 className="page-title">{resolvedMeta.label}</h1>
            <p className="muted section-text">{resolvedMeta.description}</p>
          </div>
          <div className="chip-row">
            <span className="chip">{filteredProducts.length.toLocaleString("fa-IR")} محصول</span>
            <span className="chip">پشتیبانی فارسی</span>
            <Link href="/cart" className="chip chip-link">
              رفتن به سبد خرید
            </Link>
          </div>
        </div>

        <div className="filter-pills">
          {categoryItems.map((item) => (
            <Link
              key={item.key}
              href={item.key === "all" ? "/products" : `/products?category=${item.key}`}
              className={`filter-pill ${selectedCategory === item.key ? "is-active" : ""}`}
            >
              {item.label}
            </Link>
          ))}
        </div>

        {filteredProducts.length > 0 ? (
          <div className="product-grid">
            {filteredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="surface empty-state-card">
            <strong>در این دسته هنوز محصول فعالی وجود ندارد</strong>
            <p className="muted">
              اگر از CMS استفاده می‌کنی، وضعیت محصول را روی `active` بگذار تا در فروشگاه عمومی نمایش داده شود.
            </p>
            <Link href="/products" className="btn btn-secondary">
              بازگشت به همه محصولات
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}
