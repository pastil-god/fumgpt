import Link from "next/link";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { formatPersianDate } from "@/lib/content";
import { siteConfig } from "@/lib/site";

export const metadata: Metadata = {
  title: "حساب کاربری",
  robots: {
    index: false,
    follow: false
  }
};

type SearchParamsLike =
  | Promise<{ welcome?: string }>
  | { welcome?: string }
  | undefined;

async function resolveSearchParams(searchParams: SearchParamsLike) {
  if (!searchParams) {
    return {} as { welcome?: string };
  }

  if (typeof (searchParams as Promise<{ welcome?: string }>).then === "function") {
    return await (searchParams as Promise<{ welcome?: string }>);
  }

  return searchParams as { welcome?: string };
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

  return (
    <section className="section">
      <div className="container section-stack">
        {params.welcome === "1" ? (
          <div className="surface status-banner status-banner-success">
            <strong>ورود با موفقیت انجام شد</strong>
            <p>اکنون می‌توانی محصولات، خبرها و مسیرهای مدیریت محتوا را در نسخه عمومی امروز مرور کنی.</p>
          </div>
        ) : null}

        <div className="account-grid">
          <div className="surface future-main">
            <div className="eyebrow">حساب کاربری</div>
            <h1 className="page-title">سلام {session.displayName}</h1>
            <p className="muted section-text">
              این بخش برای لانچ امروز یک حساب کاربری سبک، پایدار و قابل ارائه فراهم می‌کند. در این فاز، ورود با نشست نمایشی امن انجام می‌شود و
              زیرساخت آن برای اتصال به احراز هویت واقعی در مرحله بعد آماده مانده است.
            </p>
            <div className="chip-row is-large-gap">
              <span className="chip">ورود پایدار برای دمو</span>
              <span className="chip">آماده اتصال به احراز هویت</span>
              <span className="chip">یکپارچه با مسیر CMS</span>
            </div>

            <div className="info-grid-card">
              <div>
                <div className="eyebrow">شناسه ورود</div>
                <p className="muted">{session.identifier}</p>
              </div>
              <div>
                <div className="eyebrow">وضعیت نشست</div>
                <p className="muted">نشست نمایشی امن</p>
              </div>
              <div>
                <div className="eyebrow">تاریخ فعال‌سازی</div>
                <p className="muted">{formatPersianDate(session.createdAt)}</p>
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
                <Link href="/news" className="btn btn-ghost">
                  خبرها و مقاله‌ها
                </Link>
                <Link href="/cart" className="btn btn-ghost">
                  سبد خرید
                </Link>
              </div>
            </div>

            <div className="surface nested-card">
              <strong>پنل مدیریت محتوا</strong>
              <p className="muted">
                مدیریت محتوا از طریق داشبورد خارجی انجام می‌شود. اگر لینک پنل را در متغیر محیطی وارد کرده باشی، از همین صفحه دسترسی سریع و مستقیم
                خواهی داشت.
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

            <div className="surface nested-card">
              <strong>خروج از حساب</strong>
              <p className="muted">
                با خروج از حساب، نشست فعلی پاک می‌شود و می‌توانی دوباره مسیر ورود را از ابتدا بررسی کنی.
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
