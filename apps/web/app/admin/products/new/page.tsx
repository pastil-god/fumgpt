import type { Metadata } from "next";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { InternalProductForm } from "@/components/admin/internal-product-form";
import { requireAuthorizedSession } from "@/lib/authorization";
import { createInternalProduct } from "@/lib/db";
import { recordAuditEvent } from "@/lib/observability/audit";
import { InternalProductValidationError, normalizeInternalProductFormData } from "@/lib/store-products";

export const metadata: Metadata = {
  title: "محصول جدید"
};

type SearchParamsLike =
  | Promise<{
      error?: string | string[];
    }>
  | undefined;

function readParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value || "";
}

function getErrorCode(error: unknown) {
  if (error instanceof InternalProductValidationError) {
    return error.code;
  }

  if (typeof error === "object" && error && "code" in error && error.code === "P2002") {
    return "duplicate-slug";
  }

  return "database-error";
}

function getErrorMessage(code: string) {
  const messages: Record<string, string> = {
    "duplicate-slug": "این اسلاگ قبلا برای یک محصول داخلی استفاده شده است.",
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

async function createProduct(formData: FormData) {
  "use server";

  const session = await requireAuthorizedSession({
    allowedRoles: ["super_admin"],
    nextPath: "/admin/products/new"
  });

  let productSlug = "";

  try {
    const input = normalizeInternalProductFormData(formData, "create");
    const product = await createInternalProduct({
      input,
      createdById: session.userId
    });
    productSlug = product.slug;

    await recordAuditEvent({
      action: "admin.product_created",
      entityType: "store_product",
      entityId: product.id,
      userId: session.userId,
      details: {
        slug: product.slug,
        title: product.title,
        isActive: product.isActive,
        isFeatured: product.isFeatured,
        source: "admin-product-form"
      },
      message: "Super admin created product"
    });
  } catch (error) {
    redirect(`/admin/products/new?error=${encodeURIComponent(getErrorCode(error))}`);
  }

  revalidatePath("/", "layout");
  revalidatePath(`/admin/products/${productSlug}`);
  redirect("/admin/products?saved=created");
}

export default async function AdminNewProductPage({
  searchParams
}: {
  searchParams?: SearchParamsLike;
}) {
  await requireAuthorizedSession({
    allowedRoles: ["super_admin"],
    nextPath: "/admin/products/new"
  });
  const params = (await searchParams) || {};
  const error = readParam(params.error);

  return (
    <div className="surface nested-card admin-settings-panel admin-products-panel">
      <div className="admin-settings-hero">
        <div>
          <div className="eyebrow">محصول جدید</div>
          <h2 className="section-title">ساخت StoreProduct داخلی</h2>
          <p className="muted section-text">پس از ساخت، اسلاگ قفل می‌شود و محصول فعال در storefront قابل مشاهده است.</p>
        </div>
      </div>

      <InternalProductForm mode="create" action={createProduct} errorMessage={error ? getErrorMessage(error) : null} />
    </div>
  );
}
