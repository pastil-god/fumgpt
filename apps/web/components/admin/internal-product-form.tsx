import Link from "next/link";
import type { StoreProduct } from "@prisma/client";
import { ProductCard } from "@/components/product-card";
import { categories } from "@/lib/mock-data";
import {
  buildInternalProductPreview,
  getInternalProductFormDefaults,
  type InternalProductFormDefaults
} from "@/lib/store-products";

type ProductFormAction = (formData: FormData) => void | Promise<void>;

type Props = {
  mode: "create" | "edit";
  product?: StoreProduct | null;
  action: ProductFormAction;
  errorMessage?: string | null;
};

function TextField({
  name,
  label,
  defaultValue,
  placeholder,
  type = "text",
  inputMode,
  readOnly = false,
  required = false
}: {
  name: keyof InternalProductFormDefaults;
  label: string;
  defaultValue?: string;
  placeholder?: string;
  type?: string;
  inputMode?: "none" | "text" | "tel" | "url" | "email" | "numeric" | "decimal" | "search";
  readOnly?: boolean;
  required?: boolean;
}) {
  return (
    <label className="checkout-field admin-settings-field">
      <span>{label}</span>
      <input
        name={name}
        type={type}
        defaultValue={defaultValue || ""}
        placeholder={placeholder}
        inputMode={inputMode}
        readOnly={readOnly}
        required={required}
      />
    </label>
  );
}

function TextAreaField({
  name,
  label,
  defaultValue,
  placeholder,
  rows = 4,
  required = false
}: {
  name: keyof InternalProductFormDefaults;
  label: string;
  defaultValue?: string;
  placeholder?: string;
  rows?: number;
  required?: boolean;
}) {
  return (
    <label className="checkout-field admin-settings-field admin-settings-field-wide">
      <span>{label}</span>
      <textarea name={name} rows={rows} defaultValue={defaultValue || ""} placeholder={placeholder} required={required} />
    </label>
  );
}

function SelectField({
  name,
  label,
  defaultValue,
  options
}: {
  name: keyof InternalProductFormDefaults;
  label: string;
  defaultValue?: string;
  options: Array<{
    value: string;
    label: string;
  }>;
}) {
  return (
    <label className="checkout-field admin-settings-field">
      <span>{label}</span>
      <select name={name} defaultValue={defaultValue || ""}>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}

function CheckboxField({
  name,
  label,
  defaultChecked
}: {
  name: keyof InternalProductFormDefaults;
  label: string;
  defaultChecked?: boolean;
}) {
  return (
    <label className="admin-toggle-card">
      <input name={name} type="checkbox" defaultChecked={defaultChecked} />
      <span>{label}</span>
    </label>
  );
}

export function InternalProductForm({ mode, product, action, errorMessage }: Props) {
  const defaults = getInternalProductFormDefaults(product);
  const previewProduct = buildInternalProductPreview(defaults);
  const isEdit = mode === "edit";

  return (
    <div className="admin-product-editor">
      <form action={action} className="admin-settings-form admin-product-form">
        {errorMessage ? <div className="status-banner danger">{errorMessage}</div> : null}

        <div className="admin-settings-group">
          <div>
            <strong>اطلاعات اصلی</strong>
            <p className="muted">نام، اسلاگ و توضیح کوتاه محصول. اسلاگ بعد از ساخت قفل می‌ماند.</p>
          </div>
          <div className="admin-settings-grid">
            <TextField name="title" label="عنوان" defaultValue={defaults.title} required />
            <TextField
              name="slug"
              label="اسلاگ"
              defaultValue={defaults.slug}
              placeholder="example-product-slug"
              readOnly={isEdit}
              required
            />
            <TextAreaField
              name="shortDescription"
              label="توضیح کوتاه"
              defaultValue={defaults.shortDescription}
              rows={3}
              required
            />
            <TextAreaField name="description" label="توضیحات کامل" defaultValue={defaults.description} rows={5} />
          </div>
        </div>

        <div className="admin-settings-group">
          <div>
            <strong>قیمت و خرید</strong>
            <p className="muted">مبلغ‌ها عدد صحیح و غیرمنفی هستند. لینک خرید می‌تواند مسیر داخلی یا لینک امن باشد.</p>
          </div>
          <div className="admin-settings-grid">
            <TextField name="priceAmount" label="قیمت" defaultValue={defaults.priceAmount} inputMode="numeric" />
            <TextField name="comparePriceAmount" label="قیمت قبل" defaultValue={defaults.comparePriceAmount} inputMode="numeric" />
            <TextField name="priceLabel" label="برچسب قیمت/تحویل" defaultValue={defaults.priceLabel} />
            <TextField name="currency" label="ارز" defaultValue={defaults.currency} placeholder="IRR" />
            <TextField name="ctaText" label="متن CTA" defaultValue={defaults.ctaText} />
            <TextField name="ctaHref" label="لینک CTA" defaultValue={defaults.ctaHref} placeholder="/cart یا https://..." />
          </div>
        </div>

        <div className="admin-settings-group">
          <div>
            <strong>تصویر و ظاهر</strong>
            <p className="muted">در این مرحله آپلود نداریم؛ فقط URL امن تصویر ذخیره می‌شود.</p>
          </div>
          <div className="admin-settings-grid">
            <TextField name="imageUrl" label="آدرس تصویر" defaultValue={defaults.imageUrl} placeholder="/image.png یا https://..." />
            <TextField name="badge" label="نشان محصول" defaultValue={defaults.badge} />
            <SelectField
              name="category"
              label="دسته‌بندی"
              defaultValue={defaults.category}
              options={[
                { value: "", label: "بدون دسته‌بندی" },
                ...categories
                  .filter((item) => item.key !== "all")
                  .map((item) => ({
                    value: item.key,
                    label: item.label
                  }))
              ]}
            />
            <TextField name="sortOrder" label="اولویت نمایش" defaultValue={defaults.sortOrder} inputMode="numeric" />
          </div>
        </div>

        <div className="admin-settings-group">
          <div>
            <strong>ویژگی‌ها</strong>
            <p className="muted">هر خط به عنوان یک ویژگی متنی ذخیره می‌شود. HTML پذیرفته نمی‌شود.</p>
          </div>
          <div className="admin-settings-grid">
            <TextAreaField name="features" label="لیست ویژگی‌ها" defaultValue={defaults.features} rows={7} />
          </div>
        </div>

        <div className="admin-settings-group">
          <div>
            <strong>SEO</strong>
            <p className="muted">در صورت خالی بودن، عنوان و توضیح محصول در storefront استفاده می‌شود.</p>
          </div>
          <div className="admin-settings-grid">
            <TextField name="seoTitle" label="عنوان SEO" defaultValue={defaults.seoTitle} />
            <TextAreaField name="seoDescription" label="توضیح SEO" defaultValue={defaults.seoDescription} rows={3} />
          </div>
        </div>

        <div className="admin-settings-group">
          <div>
            <strong>وضعیت انتشار</strong>
            <p className="muted">محصول غیرفعال در storefront دیده نمی‌شود. محصول ویژه وارد بخش‌های featured می‌شود.</p>
          </div>
          <div className="admin-toggle-grid">
            <CheckboxField name="isActive" label="فعال" defaultChecked={defaults.isActive} />
            <CheckboxField name="isFeatured" label="ویژه" defaultChecked={defaults.isFeatured} />
          </div>
        </div>

        <div className="admin-settings-actions">
          <button className="btn btn-primary btn-large" type="submit">
            {isEdit ? "ذخیره تغییرات محصول" : "ساخت محصول"}
          </button>
          <Link className="btn btn-secondary btn-large" href="/admin/products">
            انصراف
          </Link>
        </div>
      </form>

      <aside className="admin-product-preview">
        <div className="eyebrow">پیش‌نمایش کارت</div>
        <ProductCard product={previewProduct} />
      </aside>
    </div>
  );
}
