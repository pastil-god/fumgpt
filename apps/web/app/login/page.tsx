import Link from "next/link";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getSafeRedirectPath, getSession } from "@/lib/auth";

export const metadata: Metadata = {
  title: "ورود",
  robots: {
    index: false,
    follow: false
  }
};

type SearchParamsLike =
  | Promise<{ error?: string; loggedOut?: string; next?: string }>
  | { error?: string; loggedOut?: string; next?: string }
  | undefined;

async function resolveSearchParams(searchParams: SearchParamsLike) {
  if (!searchParams) {
    return {} as { error?: string; loggedOut?: string; next?: string };
  }

  if (
    typeof (searchParams as Promise<{ error?: string; loggedOut?: string; next?: string }>).then ===
    "function"
  ) {
    return await (searchParams as Promise<{ error?: string; loggedOut?: string; next?: string }>);
  }

  return searchParams as { error?: string; loggedOut?: string; next?: string };
}

export default async function LoginPage({
  searchParams
}: {
  searchParams?: SearchParamsLike;
}) {
  const [session, params] = await Promise.all([getSession(), resolveSearchParams(searchParams)]);
  const redirectTo = getSafeRedirectPath(params.next || "/account");

  if (session) {
    redirect("/account");
  }

  return (
    <section className="section">
      <div className="container auth-grid">
        <div className="surface auth-copy">
          <div className="eyebrow">ورود امن</div>
          <h1 className="page-title">ورود به حساب برای ادامه مرور فروشگاه و مدیریت محتوای آینده</h1>
          <p className="muted section-text">
            این صفحه برای لانچ امروز یک مسیر ورود پایدار و قابل ارائه فراهم می‌کند. در این فاز، ورود با نشست نمایشی امن انجام می‌شود و ساختار آن
            برای اتصال به احراز هویت واقعی در مرحله بعد آماده مانده است.
          </p>

          <div className="auth-benefits">
            <div className="surface nested-card">
              <strong>نشست پایدار برای نسخه عمومی</strong>
              <p className="muted">بعد از ارسال فرم، کاربر وارد حساب کاربری می‌شود و تجربه ورود در دمو کاملاً طبیعی باقی می‌ماند.</p>
            </div>
            <div className="surface nested-card">
              <strong>آماده اتصال به احراز هویت واقعی</strong>
              <p className="muted">ساختار صفحه و مسیرها برای اتصال بعدی به OTP و سرویس واقعی از همین حالا آماده شده‌اند.</p>
            </div>
            <div className="surface nested-card">
              <strong>مناسب ارائه عمومی امروز</strong>
              <p className="muted">برای معرفی محصول، نمایش عمومی سایت و مرور حساب کاربری، تجربه این صفحه حرفه‌ای‌تر و یکدست‌تر شده است.</p>
            </div>
          </div>
        </div>

        <div className="surface auth-card">
          {params.error === "missing-fields" ? (
            <div className="status-banner status-banner-warning">
              <strong>اطلاعات ورود ناقص است</strong>
              <p>شماره موبایل یا ایمیل و همچنین رمز عبور را وارد کن.</p>
            </div>
          ) : null}

          {params.loggedOut === "1" ? (
            <div className="status-banner status-banner-success">
              <strong>با موفقیت خارج شدی</strong>
              <p>نشست نمایشی فاز اول پاک شد و می‌توانی دوباره وارد شوی.</p>
            </div>
          ) : null}

          <div className="auth-tabs">
            <button className="auth-tab is-active" type="button">
              ورود
            </button>
            <button className="auth-tab" type="button">
              به‌زودی: ثبت‌نام
            </button>
          </div>

          <form className="auth-form" action="/api/auth/login" method="post">
            <input type="hidden" name="redirectTo" value={redirectTo} />

            <div className="field-group">
              <label htmlFor="identifier">شماره موبایل یا ایمیل</label>
              <input
                id="identifier"
                name="identifier"
                type="text"
                placeholder="09xx xxx xxxx یا ایمیل"
                autoComplete="username"
              />
            </div>

            <div className="field-group">
              <label htmlFor="password">رمز عبور</label>
              <input
                id="password"
                name="password"
                type="password"
                placeholder="رمز عبور"
                autoComplete="current-password"
              />
            </div>

            <div className="auth-actions">
              <button className="btn btn-primary btn-block" type="submit">
                ورود به حساب
              </button>
              <button className="btn btn-ghost btn-block" type="button" disabled>
                ثبت‌نام و ورود پیامکی به‌زودی
              </button>
            </div>
          </form>

          <form action="/api/auth/login" method="post">
            <input type="hidden" name="identifier" value="demo@fumgpt.local" />
            <input type="hidden" name="password" value="demo-access" />
            <input type="hidden" name="redirectTo" value={redirectTo} />
            <button className="btn btn-secondary btn-block" type="submit">
              ورود سریع نمایشی
            </button>
          </form>

          <p className="muted small-note">
            این ورود فعلاً یک نشست نمایشی امن می‌سازد و هنوز به OTP، دیتابیس کاربر یا سرویس احراز هویت واقعی متصل نشده است.
          </p>

          <Link href="/products" className="chip chip-link">
            ادامه بدون ورود و مشاهده محصولات
          </Link>
        </div>
      </div>
    </section>
  );
}
