import Link from "next/link";
import type { Metadata } from "next";
import { EditablePageText, PageInlineEditor } from "@/components/admin/page-inline-editor";
import { ProductCard } from "@/components/product-card";
import { getSession } from "@/lib/auth";
import { filterStoreProducts, getStoreCategories, getStoreCategoryMeta } from "@/lib/content";
import { buildPublicMetadata } from "@/lib/seo";
import { getProductsPageInlineSettings } from "@/lib/settings/admin-settings";
import { getInlineTextStyleCss } from "@/lib/settings/inline-homepage";
import { INLINE_PRODUCTS_PAGE_FIELD_LABELS } from "@/lib/settings/inline-products";

export const metadata: Metadata = buildPublicMetadata({
  title: "محصولات",
  description: "فهرست محصولات و خدمات فروشگاه FumGPT با قیمت‌گذاری روشن، توضیح تحویل، و مسیر خرید قابل پیگیری.",
  path: "/products"
});

type SearchParamsLike =
  | Promise<{ category?: string | string[] }>
  | undefined;

async function resolveSearchParams(searchParams: SearchParamsLike) {
  const params = (await searchParams) || {};
  const category = Array.isArray(params.category) ? params.category[0] : params.category;

  return { category };
}

export default async function ProductsPage({
  searchParams
}: {
  searchParams?: SearchParamsLike;
}) {
  const params = await resolveSearchParams(searchParams);
  const selectedCategory = params.category || "all";
  const [filteredProducts, categoryItems, selectedMeta, pageSettings, session] = await Promise.all([
    filterStoreProducts(selectedCategory),
    getStoreCategories(),
    getStoreCategoryMeta(selectedCategory),
    getProductsPageInlineSettings(),
    getSession()
  ]);
  const allCategoryMeta = categoryItems.find((item) => item.key === "all");
  const resolvedMeta = selectedMeta || allCategoryMeta || categoryItems[0];
  const pageContent = pageSettings.content;
  const fieldStyles = pageSettings.fieldStyles;
  const canInlineEdit = session?.role === "super_admin";

  function getFieldStyle(field: keyof typeof INLINE_PRODUCTS_PAGE_FIELD_LABELS) {
    return getInlineTextStyleCss(fieldStyles[field]);
  }

  const content = (
    <section className="section section-muted">
      <div className="container section-stack">
        <div className="surface listing-hero">
          <div>
            {canInlineEdit ? (
              <EditablePageText field="heroEyebrow" as="div" className="eyebrow" label={INLINE_PRODUCTS_PAGE_FIELD_LABELS.heroEyebrow} />
            ) : (
              <div className="eyebrow" style={getFieldStyle("heroEyebrow")}>{pageContent.heroEyebrow}</div>
            )}
            <h1 className="page-title">
              {canInlineEdit ? (
                selectedCategory === "all" ? (
                  <EditablePageText field="pageTitle" as="span" label={INLINE_PRODUCTS_PAGE_FIELD_LABELS.pageTitle} />
                ) : (
                  <>
                    <EditablePageText
                      field="categoryHeadingPrefix"
                      as="span"
                      label={INLINE_PRODUCTS_PAGE_FIELD_LABELS.categoryHeadingPrefix}
                    />{" "}
                    <span>{resolvedMeta.label}</span>
                  </>
                )
              ) : selectedCategory === "all" ? (
                <span style={getFieldStyle("pageTitle")}>{pageContent.pageTitle}</span>
              ) : (
                <>
                  <span style={getFieldStyle("categoryHeadingPrefix")}>{pageContent.categoryHeadingPrefix}</span>{" "}
                  <span>{resolvedMeta.label}</span>
                </>
              )}
            </h1>
            {canInlineEdit ? (
              selectedCategory === "all" ? (
                <EditablePageText
                  field="pageDescription"
                  as="p"
                  className="muted section-text"
                  label={INLINE_PRODUCTS_PAGE_FIELD_LABELS.pageDescription}
                  multiline
                />
              ) : (
                <p className="muted section-text">{resolvedMeta.description}</p>
              )
            ) : selectedCategory === "all" ? (
              <p className="muted section-text" style={getFieldStyle("pageDescription")}>{pageContent.pageDescription}</p>
            ) : (
              <p className="muted section-text">{resolvedMeta.description}</p>
            )}
          </div>
          <div className="chip-row">
            <span className="chip">
              {filteredProducts.length.toLocaleString("fa-IR")}{" "}
              {canInlineEdit ? (
                <EditablePageText
                  field="resultsChipSuffix"
                  as="span"
                  label={INLINE_PRODUCTS_PAGE_FIELD_LABELS.resultsChipSuffix}
                />
              ) : (
                <span style={getFieldStyle("resultsChipSuffix")}>{pageContent.resultsChipSuffix}</span>
              )}
            </span>
            <span className="chip">
              {canInlineEdit ? (
                <EditablePageText
                  field="supportChipText"
                  as="span"
                  label={INLINE_PRODUCTS_PAGE_FIELD_LABELS.supportChipText}
                />
              ) : (
                <span style={getFieldStyle("supportChipText")}>{pageContent.supportChipText}</span>
              )}
            </span>
            {canInlineEdit ? (
              <span className="chip chip-link">
                <EditablePageText field="cartCtaLabel" as="span" label={INLINE_PRODUCTS_PAGE_FIELD_LABELS.cartCtaLabel} />
              </span>
            ) : (
              <Link href="/cart" className="chip chip-link" style={getFieldStyle("cartCtaLabel")}>
                {pageContent.cartCtaLabel}
              </Link>
            )}
          </div>
        </div>

        <div className="section-copy">
          {canInlineEdit ? (
            <>
              <div className="eyebrow">
                <EditablePageText field="filtersLabel" as="span" label={INLINE_PRODUCTS_PAGE_FIELD_LABELS.filtersLabel} />
              </div>
              <EditablePageText
                field="filtersHelpText"
                as="p"
                className="muted section-text"
                label={INLINE_PRODUCTS_PAGE_FIELD_LABELS.filtersHelpText}
                multiline
              />
            </>
          ) : (
            <>
              <div className="eyebrow" style={getFieldStyle("filtersLabel")}>{pageContent.filtersLabel}</div>
              <p className="muted section-text" style={getFieldStyle("filtersHelpText")}>{pageContent.filtersHelpText}</p>
            </>
          )}
        </div>

        <div className="filter-pills" aria-label="فیلتر دسته‌بندی محصولات">
          {categoryItems.map((item) => (
            <Link
              key={item.key}
              href={item.key === "all" ? "/products" : `/products?category=${item.key}`}
              className={`filter-pill ${selectedCategory === item.key ? "is-active" : ""}`}
              aria-current={selectedCategory === item.key ? "page" : undefined}
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
            <strong>
              {canInlineEdit ? (
                <EditablePageText field="emptyTitle" as="span" label={INLINE_PRODUCTS_PAGE_FIELD_LABELS.emptyTitle} />
              ) : (
                <span style={getFieldStyle("emptyTitle")}>{pageContent.emptyTitle}</span>
              )}
            </strong>
            {canInlineEdit ? (
              <EditablePageText
                field="emptyDescription"
                as="p"
                className="muted"
                label={INLINE_PRODUCTS_PAGE_FIELD_LABELS.emptyDescription}
                multiline
              />
            ) : (
              <p className="muted" style={getFieldStyle("emptyDescription")}>{pageContent.emptyDescription}</p>
            )}
            {canInlineEdit ? (
              <span className="btn btn-secondary">
                <EditablePageText field="emptyCtaLabel" as="span" label={INLINE_PRODUCTS_PAGE_FIELD_LABELS.emptyCtaLabel} />
              </span>
            ) : (
              <Link href="/products" className="btn btn-secondary" style={getFieldStyle("emptyCtaLabel")}>
                {pageContent.emptyCtaLabel}
              </Link>
            )}
          </div>
        )}
      </div>
    </section>
  );

  if (!canInlineEdit) {
    return content;
  }

  return (
    <PageInlineEditor
      pageTitle="صفحه محصولات"
      savePath="/api/admin/page-inline/products"
      initialValues={pageContent}
      initialFieldStyles={fieldStyles}
      fieldLabels={INLINE_PRODUCTS_PAGE_FIELD_LABELS}
    >
      {content}
    </PageInlineEditor>
  );
}
