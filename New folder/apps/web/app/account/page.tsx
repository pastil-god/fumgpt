import Link from "next/link";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { canAccessCmsOperations, isOperationalRole, ROLE_LABELS } from "@/lib/authorization";
import { getOrderStatusMeta, listOrdersForCurrentUser } from "@/lib/checkout";
import { formatPersianDate } from "@/lib/content";
import { formatPriceIRR } from "@/lib/mock-data";
import { siteConfig } from "@/lib/site";

export const metadata: Metadata = {
  title: "حساب کاربری",
  robots: {
    index: false,
    follow: false
  }
};

type SearchParamsLike =
  | Promise<{ welcome?: string | string[]; adminDenied?: string | string[] }>
  | undefined;

async function resolveSearchParams(searchParams: SearchParamsLike) {
  const params = (await searchParams) || {};

  return {
    welcome: Array.isArray(params.welcome) ? params.welcome[0] : params.welcome,
    adminDenied: Array.isArray(params.adminDenied) ? params.adminDenied[0] : params.adminDenied
  };
}

function getAuthModeLabel(authMode: string) {
  if (authMode === "email_otp") {
    return "ورود با کد یکبارمصرف ایمیل";
  }

  if (authMode === "phone_otp") {
    return "ورود با کد یکبارمصرف پیامکی";
  }

  return authMode;
}

export default async function AccountPage({
  searchParams
}: {
  searchParams?: SearchParamsLike;
}) {
  const [session, params] = await Promise.all([getSession(), resolveSearchParams(searchParams)]);

  if (!session) {
    redirect("/login?next=/account");
  }

  const recentOrders = await listOrdersForCurrentUser(5);

  return (
    <section className="section">
      <div className="container section-stack">
        {params.welcome === "1" ? (
          <div className="surface status-banner status-banner-success">
            <strong>ورود با موفقیت انجام شد</strong>
            <p>نشست این دستگاه فعال است و اکنون صفحه حساب از داده واقعی کاربر و session دیتابیسی استفاده می‌کند.</p>
          </div>
        ) : null}

        {params.adminDenied === "1" ? (
          <div className="surface status-banner status-banner-warning">
            <strong>دسترسی ادمین برای این حساب مجاز نیست</strong>
            <p>این ناحیه فقط برای نقش‌های عملیاتی داخلی فعال است. اگر باید این دسترسی را داشته باشی، نقش کاربر را در دیتابیس بررسی کن.</p>
          </div>
        ) : null}

        <div className="account-grid">
          <div className="surface future-main">
            <div className="eyebrow">حساب کاربری</div>
            <h1 className="page-title">سلام {session.displayName}</h1>
            <p className="muted section-text">
              این صفحه به نشست واقعی، سفارش‌های واقعی و اطلاعات حساب همین کاربر متصل است. با این حال، همه
              قابلیت‌های آینده هنوز فعال نشده‌اند و این بخش فقط همان چیزهایی را نشان می‌دهد که همین حالا
              واقعا قابل استفاده و پیگیری هستند.
            </p>

            <div className="chip-row is-large-gap">
              <span className="chip">حساب واقعی کاربر</span>
              <span className="chip">{getAuthModeLabel(session.authMode)}</span>
              <span className="chip">نشست امن سمت سرور</span>
              <span className="chip">{ROLE_LABELS[session.role]}</span>
            </div>

            <div className="info-grid-card">
              <div>
                <div className="eyebrow">شناسه ورود</div>
                <p className="muted">{session.identifier}</p>
              </div>
              <div>
                <div className="eyebrow">وضعیت حساب</div>
                <p className="muted">فعال</p>
              </div>
              <div>
                <div className="eyebrow">تاریخ ایجاد حساب</div>
                <p className="muted">{formatPersianDate(session.createdAt)}</p>
              </div>
              <div>
                <div className="eyebrow">انقضای نشست</div>
                <p className="muted">{formatPersianDate(session.expiresAt)}</p>
              </div>
            </div>
          </div>

          <div className="future-cards">
            <div className="surface nested-card">
              <strong>میانبرهای سریع</strong>
              <div className="account-links">
                <Link href="/products" className="btn btn-primary">
                  ورود به فروشگاه
                </Link>
                <Link href="/account/orders" className="btn btn-secondary">
                  سفارش‌های من
                </Link>
                <Link href="/news" className="btn btn-ghost">
                  خبرها و مقاله‌ها
                </Link>
                <Link href="/cart" className="btn btn-ghost">
                  سبد خرید
                </Link>
                <Link href="/help" className="btn btn-ghost">
                  راهنما و پشتیبانی
                </Link>
                {isOperationalRole(session.role) ? (
                  <Link href="/admin" className="btn btn-secondary">
                    ابزارهای داخلی
                  </Link>
                ) : null}
              </div>
            </div>

            <div className="surface nested-card">
              <strong>سفارش‌های اخیر</strong>
              {recentOrders.length > 0 ? (
                <>
                  <div className="order-history-list">
                    {recentOrders.map((order) => {
                      const statusMeta = getOrderStatusMeta(order.status);

                      return (
                        <Link
                          key={order.id}
                          href={`/checkout/confirmation/${order.orderNumber}`}
                          className="order-history-item"
                        >
                          <div className="order-history-copy">
                            <strong>{order.orderNumber}</strong>
                            <span className="muted">{formatPersianDate((order.placedAt || order.createdAt).toISOString())}</span>
                          </div>
                          <div className="order-history-meta">
                            <span className={statusMeta.toneClassName}>{statusMeta.label}</span>
                            <strong>{formatPriceIRR(order.subtotalAmount)} تومان</strong>
                          </div>
                        </Link>
                      );
                    })}
                  </div>

                  <div className="btn-row">
                    <Link href="/account/orders" className="btn btn-secondary">
                      مشاهده همه سفارش‌ها
                    </Link>
                  </div>
                </>
              ) : (
                <div className="admin-empty-state">
                  <p className="muted">
                    هنوز سفارشی برای این حساب ثبت نشده است. بعد از ثبت سفارش، وضعیت و شماره سفارش از همین
                    بخش و صفحه سفارش‌های من قابل پیگیری خواهد بود.
                  </p>
                  <div className="btn-row">
                    <Link href="/products" className="btn btn-primary">
                      رفتن به فروشگاه
                    </Link>
                    <Link href="/help" className="btn btn-ghost">
                      راهنمای خرید و پشتیبانی
                    </Link>
                  </div>
                </div>
              )}
            </div>

            <div className="surface nested-card">
              <strong>مرزهای فعلی این حساب</strong>
              <p className="muted">
                این حساب برای ورود، پیگیری سفارش و دسترسی به بخش‌های فعال فعلی طراحی شده است. دانلودها،
                اشتراک‌ها و قابلیت‌های آینده هنوز در این صفحه فعال نشده‌اند و عمدا جدا نگه داشته شده‌اند.
              </p>
              <div className="chip-row">
                <span className="chip">پیگیری سفارش فعال است</span>
                <span className="chip">سبد مهمان قابل انتقال است</span>
                <span className="chip">قابلیت‌های آینده جدا نگه داشته شده‌اند</span>
              </div>
            </div>

            {canAccessCmsOperations(session.role) ? (
              <div className="surface nested-card">
                <strong>پنل مدیریت محتوا</strong>
                <p className="muted">
                  محتوای سایت همچنان از مسیر CMS مدیریت می‌شود. این دسترسی فقط برای نقش‌های محتوایی و مدیر
                  کل نمایش داده می‌شود تا ابزارهای داخلی با مرز روشن باقی بمانند.
                </p>
                {siteConfig.cmsDashboardUrl ? (
                  <a
                    className="btn btn-secondary"
                    href={siteConfig.cmsDashboardUrl}
                    target="_blank"
                    rel="noreferrer"
                  >
                    ورود به پنل محتوا
                  </a>
                ) : (
                  <span className="chip">آدرس پنل محتوا هنوز تنظیم نشده است</span>
                )}
              </div>
            ) : null}

            <div className="surface nested-card">
              <strong>خروج از حساب</strong>
              <p className="muted">
                با خروج، نشست فعال این دستگاه از دیتابیس revoke می‌شود و برای دسترسی دوباره باید کد ورود
                جدید بگیری.
              </p>
              <form action="/api/auth/logout" method="post">
                <button className="btn btn-ghost" type="submit">
                  خروج از حساب
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
