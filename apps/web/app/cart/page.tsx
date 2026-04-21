import Link from "next/link";
import { getFeaturedStoreProducts } from "@/lib/content";
import { formatPriceIRR } from "@/lib/mock-data";

export default async function CartPage() {
  const items = await getFeaturedStoreProducts(3);
  const subtotal = items.reduce((sum, item) => sum + item.price, 0);

  return (
    <section className="section">
      <div className="container cart-grid">
        <div className="surface cart-list-card">
          <div className="section-header">
            <div>
              <div className="eyebrow">سبد خرید نمایشی</div>
              <h1 className="page-title">خلاصه انتخاب‌ها</h1>
            </div>
          </div>

          <div className="cart-items">
            {items.map((item) => (
              <div className="cart-item" key={item.id}>
                <div className={`cart-mark accent-${item.accent}`}>{item.coverLabel}</div>
                <div className="cart-copy">
                  <strong>{item.title}</strong>
                  <span>{item.delivery}</span>
                </div>
                <div className="cart-price">{formatPriceIRR(item.price)} تومان</div>
              </div>
            ))}
          </div>
        </div>

        <aside className="surface checkout-card">
          <div className="eyebrow">خلاصه سفارش</div>
          <div className="checkout-lines">
            <div>
              <span>جمع سبد</span>
              <strong>{formatPriceIRR(subtotal)} تومان</strong>
            </div>
            <div>
              <span>تخفیف کمپین</span>
              <strong>در فاز بعد</strong>
            </div>
            <div>
              <span>تحویل</span>
              <strong>دیجیتال</strong>
            </div>
          </div>

          <button className="btn btn-primary btn-block" type="button">
            ادامه به پرداخت
          </button>
          <Link className="btn btn-ghost btn-block" href="/products">
            بازگشت به فروشگاه
          </Link>
        </aside>
      </div>
    </section>
  );
}
