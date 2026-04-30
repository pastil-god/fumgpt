import Link from "next/link";
import type { Metadata } from "next";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAuthorizedSession } from "@/lib/authorization";
import { listInternalProducts, toggleInternalProductFeatured, toggleInternalProductStatus } from "@/lib/db";
import { categories, formatPriceIRR } from "@/lib/mock-data";
import { recordAuditEvent } from "@/lib/observability/audit";
import {
  INTERNAL_PRODUCT_FEATURED_FILTERS,
  INTERNAL_PRODUCT_STATUS_FILTERS,
  normalizeInternalFeaturedFilter,
  normalizeInternalStatusFilter
} from "@/lib/store-products";

export const metadata: Metadata = {
  title: "مدیریت محصولات"
};

type SearchParamsLike =
  | Promise<{
      q?: string | string[];
      category?: string | string[];
      status?: string | string[];
      featured?: string | string[];
      saved?: string | string[];
      error?: string | string[];
    }>
  | undefined;

function readParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value || "";
}

async function resolveSearchParams(searchParams: SearchParamsLike) {
  const params = (await searchParams) || {};

  return {
    query: readParam(params.q).trim(),
    category: readParam(params.category).trim(),
    status: normalizeInternalStatusFilter(readParam(params.status)),
    featured: normalizeInternalFeaturedFilter(readParam(params.featured)),
    saved: readParam(params.saved),
    error: readParam(params.error)
  };
}

function getSavedMessage(value: string) {
  const messages: Record<string, string> = {
    created: "محصول ساخته شد.",
    updated: "تغییرات محصول ذخیره شد.",
    activated: "محصول فعال شد.",
    deactivated: "محصول غیرفعال شد.",
    featured: "محصول ویژه شد.",
    unfeatured: "محصول از حالت ویژه خارج شد."
  };

  return messages[value] || null;
}

function getErrorMessage(value: string) {
  const messages: Record<string, string> = {
    "product-not-found": "محصول پیدا نشد.",
    "invalid-action": "درخواست معتبر نیست.",
    "database-error": "ذخیره‌سازی انجام نشد. اتصال دیتابیس یا migration را بررسی کن."
  };

  return messages[value] || null;
}

function getMutationErrorCode(error: unknown) {
  return error instanceof Error && error.message === "product-not-found" ? "product-not-found" : "database-error";
}

async function toggleProductActive(formData: FormData) {
  "use server";

  const session = await requireAuthorizedSession({
    allowedRoles: ["super_admin"],
    nextPath: "/admin/products"
  });
  const slug = String(formData.get("slug") || "");
  const nextActive = String(formData.get("nextActive") || "") === "true";

  if (!slug) {
    redirect("/admin/products?error=invalid-action");
  }

  try {
    const { product } = await toggleInternalProductStatus({
      slug,
      isActive: nextActive,
      updatedById: session.userId
    });

    await recordAuditEvent({
      action: nextActive ? "admin.product_activated" : "admin.product_deactivated",
      entityType: "store_product",
      entityId: product.id,
      userId: session.userId,
      details: {
        slug: product.slug,
        source: "admin-products-list"
      },
      message: nextActive ? "Super admin activated product" : "Super admin deactivated product"
    });
  } catch (error) {
    redirect(`/admin/products?error=${encodeURIComponent(getMutationErrorCode(error))}`);
  }

  revalidatePath("/", "layout");
  redirect(`/admin/products?saved=${nextActive ? "activated" : "deactivated"}`);
}

async function toggleProductFeatured(formData: FormData) {
  "use server";

  const session = await requireAuthorizedSession({
    allowedRoles: ["super_admin"],
    nextPath: "/admin/products"
  });
  const slug = String(formData.get("slug") || "");
  const nextFeatured = String(formData.get("nextFeatured") || "") === "true";

  if (!slug) {
    redirect("/admin/products?error=invalid-action");
  }

  try {
    const { product } = await toggleInternalProductFeatured({
      slug,
      isFeatured: nextFeatured,
      updatedById: session.userId
    });

    await recordAuditEvent({
      action: nextFeatured ? "admin.product_featured" : "admin.product_unfeatured",
      entityType: "store_product",
      entityId: product.id,
      userId: session.userId,
      details: {
        slug: product.slug,
        source: "admin-products-list"
      },
      message: nextFeatured ? "Super admin featured product" : "Super admin unfeatured product"
    });
  } catch (error) {
    redirect(`/admin/products?error=${encodeURIComponent(getMutationErrorCode(error))}`);
  }

  revalidatePath("/", "layout");
  redirect(`/admin/products?saved=${nextFeatured ? "featured" : "unfeatured"}`);
}

export default async function AdminProductsPage({
  searchParams
}: {
  searchParams?: SearchParamsLike;
}) {
  await requireAuthorizedSession({
    allowedRoles: ["super_admin"],
    nextPath: "/admin/products"
  });
  const params = await resolveSearchParams(searchParams);
  const products = await listInternalProducts({
    query: params.query,
    category: params.category,
    status: params.status,
    featured: params.featured,
    includeInactive: true,
    limit: 100
  });
  const savedMessage = getSavedMessage(params.saved);
  const errorMessage = getErrorMessage(params.error);

  return (
    <div className="surface nested-card admin-settings-panel admin-products-panel">
      <div className="admin-settings-hero">
        <div>
          <div className="eyebrow">StoreProduct</div>
          <h2 className="section-title">مدیریت محصولات داخلی</h2>
          <p className="muted section-text">
            محصولات داخلی با اسلاگ یکسان روی Contentful یا fallback می‌نشینند و محصول جدید فعال به storefront اضافه می‌شود.
          </p>
        </div>
        <div className="chip-row">
          {savedMessage ? <span className="status-pill success">{savedMessage}</span> : null}
          {errorMessage ? <span className="status-pill danger">{errorMessage}</span> : null}
          <Link className="btn btn-primary" href="/admin/products/new">
            محصول جدید
          </Link>
        </div>
      </div>

      <form className="admin-filter-form admin-products-filter" action="/admin/products">
        <label className="checkout-field">
          <span>جستجو</span>
          <input name="q" defaultValue={params.query} placeholder="عنوان، اسلاگ، توضیح..." />
        </label>
        <label className="checkout-field">
          <span>دسته‌بندی</span>
          <select name="category" defaultValue={params.category}>
            <option value="">همه دسته‌ها</option>
            {categories
              .filter((item) => item.key !== "all")
              .map((item) => (
                <option key={item.key} value={item.key}>
                  {item.label}
                </option>
              ))}
          </select>
        </label>
        <label className="checkout-field">
          <span>وضعیت</span>
          <select name="status" defaultValue={params.status}>
            {INTERNAL_PRODUCT_STATUS_FILTERS.map((status) => (
              <option key={status} value={status}>
                {status === "active" ? "فعال" : status === "inactive" ? "غیرفعال" : "همه"}
              </option>
            ))}
          </select>
        </label>
        <label className="checkout-field">
          <span>ویژه</span>
          <select name="featured" defaultValue={params.featured}>
            {INTERNAL_PRODUCT_FEATURED_FILTERS.map((featured) => (
              <option key={featured} value={featured}>
                {featured === "featured" ? "ویژه" : featured === "not_featured" ? "غیر ویژه" : "همه"}
              </option>
            ))}
          </select>
        </label>
        <div className="admin-filter-actions">
          <button className="btn btn-secondary" type="submit">
            اعمال فیلتر
          </button>
          <Link className="btn btn-ghost" href="/admin/products">
            پاک کردن
          </Link>
        </div>
      </form>

      {products.length > 0 ? (
        <div className="admin-products-list">
          {products.map((product) => {
            const categoryLabel = categories.find((item) => item.key === product.category)?.label || product.category || "بدون دسته";

            return (
              <article className="surface admin-product-row" key={product.id}>
                <div className="admin-list-copy">
                  <div className="chip-row">
                    <span className={`status-pill ${product.isActive ? "success" : "muted"}`}>
                      {product.isActive ? "فعال" : "غیرفعال"}
                    </span>
                    {product.isFeatured ? <span className="chip">ویژه</span> : null}
                    <span className="chip">{categoryLabel}</span>
                  </div>
                  <strong>{product.title}</strong>
                  <p className="muted">{product.shortDescription}</p>
                  <div className="admin-product-meta muted">
                    <span>{product.slug}</span>
                    <span>{typeof product.priceAmount === "number" ? `${formatPriceIRR(product.priceAmount)} تومان` : "بدون قیمت"}</span>
                    <span>اولویت {product.sortOrder.toLocaleString("fa-IR")}</span>
                  </div>
                </div>

                <div className="admin-product-actions">
                  <Link className="btn btn-secondary" href={`/admin/products/${product.slug}`}>
                    ویرایش
                  </Link>
                  <Link className="btn btn-ghost" href={`/products/${product.slug}`} target="_blank">
                    نمایش
                  </Link>
                  <form action={toggleProductActive}>
                    <input type="hidden" name="slug" value={product.slug} />
                    <input type="hidden" name="nextActive" value={String(!product.isActive)} />
                    <button className="btn btn-ghost" type="submit">
                      {product.isActive ? "غیرفعال" : "فعال"}
                    </button>
                  </form>
                  <form action={toggleProductFeatured}>
                    <input type="hidden" name="slug" value={product.slug} />
                    <input type="hidden" name="nextFeatured" value={String(!product.isFeatured)} />
                    <button className="btn btn-ghost" type="submit">
                      {product.isFeatured ? "حذف ویژه" : "ویژه"}
                    </button>
                  </form>
                </div>
              </article>
            );
          })}
        </div>
      ) : (
        <div className="admin-empty-state">
          <strong>هنوز محصول داخلی ثبت نشده است.</strong>
          <p className="muted">با ساخت اولین محصول، اگر feature flag فعال باشد، محصول در storefront نمایش داده می‌شود.</p>
          <Link className="btn btn-primary" href="/admin/products/new">
            ساخت اولین محصول
          </Link>
        </div>
      )}
    </div>
  );
}
