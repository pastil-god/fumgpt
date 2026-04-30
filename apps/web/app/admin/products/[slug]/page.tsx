import Link from "next/link";
import type { Metadata } from "next";
import { revalidatePath } from "next/cache";
import { notFound, redirect } from "next/navigation";
import { InternalProductForm } from "@/components/admin/internal-product-form";
import { requireAuthorizedSession } from "@/lib/authorization";
import { getInternalProductBySlug, updateInternalProduct } from "@/lib/db";
import { recordAuditEvent } from "@/lib/observability/audit";
import { InternalProductValidationError, normalizeInternalProductFormData } from "@/lib/store-products";

export const metadata: Metadata = {
  title: "ویرایش محصول"
};

type ParamsLike = Promise<{ slug: string }>;
type SearchParamsLike =
  | Promise<{
      error?: string | string[];
      saved?: string | string[];
    }>
  | undefined;

function readParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value || "";
}

function getErrorCode(error: unknown) {
  if (error instanceof InternalProductValidationError) {
    return error.code;
  }

  if (error instanceof Error && error.message === "product-not-found") {
    return "product-not-found";
  }

  return "database-error";
}

function getErrorMessage(code: string) {
  const messages: Record<string, string> = {
    "product-not-found": "محصول پیدا نشد.",
    "required-slug": "اسلاگ محصول الزامی است.",
    "invalid-slug": "اسلاگ فقط می‌تواند شامل حروف کوچک انگلیسی، عدد و خط تیره باشد.",
    "required-title": "عنوان محصول الزامی است.",
    "required-short-description": "توضیح کوتاه محصول الزامی است.",
    "invalid-image-url": "آدرس تصویر باید مسیر داخلی یا URL امن از دامنه‌های مجاز باشد.",
    "invalid-cta-href": "لینک CTA معتبر نیست.",
    "invalid-priceAmount": "قیمت باید عدد صحیح باشد.",
    "invalid-priceAmount-min": "قیمت نمی‌تواند منفی باشد.",
    "invalid-comparePriceAmount": "قیمت قبل باید عدد صحیح باشد.",
    "invalid-comparePriceAmount-min": "قیمت قبل نمی‌تواند منفی باشد.",
    "invalid-compare-price": "قیمت قبل نمی‌تواند کمتر از قیمت فعلی باشد.",
    "invalid-sortOrder": "اولویت نمایش باید عدد صحیح باشد.",
    "invalid-category": "دسته‌بندی انتخاب‌شده معتبر نیست.",
    "database-error": "محصول ذخیره نشد. اتصال دیتابیس یا migration را بررسی کن."
  };

  return messages[code] || "ورودی محصول معتبر نیست.";
}

async function resolveParams(params: ParamsLike) {
  return await params;
}

export default async function AdminEditProductPage({
  params,
  searchParams
}: {
  params: ParamsLike;
  searchParams?: SearchParamsLike;
}) {
  await requireAuthorizedSession({
    allowedRoles: ["super_admin"],
    nextPath: "/admin/products"
  });
  const resolvedParams = await resolveParams(params);
  const [product, rawSearchParams] = await Promise.all([
    getInternalProductBySlug(resolvedParams.slug),
    searchParams
  ]);

  if (!product) {
    notFound();
  }

  async function updateProduct(formData: FormData) {
    "use server";

    const updateSession = await requireAuthorizedSession({
      allowedRoles: ["super_admin"],
      nextPath: `/admin/products/${resolvedParams.slug}`
    });

    try {
      const input = normalizeInternalProductFormData(formData, "update");
      const { previous, product: updatedProduct } = await updateInternalProduct({
        slug: resolvedParams.slug,
        input: {
          ...input,
          slug: resolvedParams.slug
        },
        updatedById: updateSession.userId
      });

      await recordAuditEvent({
        action: "admin.product_updated",
        entityType: "store_product",
        entityId: updatedProduct.id,
        userId: updateSession.userId,
        details: {
          slug: updatedProduct.slug,
          title: updatedProduct.title,
          isActive: updatedProduct.isActive,
          isFeatured: updatedProduct.isFeatured,
          source: "admin-product-form"
        },
        message: "Super admin updated product"
      });

      if (previous.isActive !== updatedProduct.isActive) {
        await recordAuditEvent({
          action: updatedProduct.isActive ? "admin.product_activated" : "admin.product_deactivated",
          entityType: "store_product",
          entityId: updatedProduct.id,
          userId: updateSession.userId,
          details: {
            slug: updatedProduct.slug,
            source: "admin-product-form"
          },
          message: updatedProduct.isActive ? "Super admin activated product" : "Super admin deactivated product"
        });
      }

      if (previous.isFeatured !== updatedProduct.isFeatured) {
        await recordAuditEvent({
          action: updatedProduct.isFeatured ? "admin.product_featured" : "admin.product_unfeatured",
          entityType: "store_product",
          entityId: updatedProduct.id,
          userId: updateSession.userId,
          details: {
            slug: updatedProduct.slug,
            source: "admin-product-form"
          },
          message: updatedProduct.isFeatured ? "Super admin featured product" : "Super admin unfeatured product"
        });
      }
    } catch (error) {
      redirect(`/admin/products/${resolvedParams.slug}?error=${encodeURIComponent(getErrorCode(error))}`);
    }

    revalidatePath("/", "layout");
    revalidatePath(`/products/${resolvedParams.slug}`);
    revalidatePath(`/admin/products/${resolvedParams.slug}`);
    redirect(`/admin/products/${resolvedParams.slug}?saved=1`);
  }

  const error = readParam(rawSearchParams?.error);
  const saved = readParam(rawSearchParams?.saved);

  return (
    <div className="surface nested-card admin-settings-panel admin-products-panel">
      <div className="admin-settings-hero">
        <div>
          <div className="eyebrow">ویرایش محصول</div>
          <h2 className="section-title">{product.title}</h2>
          <p className="muted section-text">اسلاگ این محصول قفل است: {product.slug}</p>
        </div>
        <div className="chip-row">
          {saved ? <span className="status-pill success">تغییرات ذخیره شد.</span> : null}
          <Link className="btn btn-secondary" href="/admin/products">
            بازگشت به فهرست
          </Link>
          {product.isActive ? (
            <Link className="btn btn-ghost" href={`/products/${product.slug}`} target="_blank">
              نمایش storefront
            </Link>
          ) : null}
        </div>
      </div>

      <InternalProductForm mode="edit" product={product} action={updateProduct} errorMessage={error ? getErrorMessage(error) : null} />
    </div>
  );
}
