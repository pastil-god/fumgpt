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
  | Promise<{
      error?: string | string[];
      loggedOut?: string | string[];
      next?: string | string[];
      step?: string | string[];
      sent?: string | string[];
      identifier?: string | string[];
      channel?: string | string[];
      devCode?: string | string[];
      cooldown?: string | string[];
    }>
  | undefined;

async function resolveSearchParams(searchParams: SearchParamsLike) {
  const params = (await searchParams) || {};

  return {
    error: Array.isArray(params.error) ? params.error[0] : params.error,
    loggedOut: Array.isArray(params.loggedOut) ? params.loggedOut[0] : params.loggedOut,
    next: Array.isArray(params.next) ? params.next[0] : params.next,
    step: Array.isArray(params.step) ? params.step[0] : params.step,
    sent: Array.isArray(params.sent) ? params.sent[0] : params.sent,
    identifier: Array.isArray(params.identifier) ? params.identifier[0] : params.identifier,
    channel: Array.isArray(params.channel) ? params.channel[0] : params.channel,
    devCode: Array.isArray(params.devCode) ? params.devCode[0] : params.devCode,
    cooldown: Array.isArray(params.cooldown) ? params.cooldown[0] : params.cooldown
  };
}

function getErrorMessage(error?: string, cooldown?: string) {
  switch (error) {
    case "missing-identifier":
      return {
        tone: "status-banner-warning",
        title: "ایمیل وارد نشده است",
        description: "برای دریافت کد ورود، ایمیل خود را وارد کن."
      };
    case "missing-code":
      return {
        tone: "status-banner-warning",
        title: "کد تایید ناقص است",
        description: "کد شش رقمی ارسال‌شده را وارد کن."
      };
    case "invalid-email":
      return {
        tone: "status-banner-warning",
        title: "ایمیل معتبر نیست",
        description: "فعلا ورود واقعی با ایمیل OTP فعال است. یک ایمیل معتبر وارد کن."
      };
    case "invalid-phone":
      return {
        tone: "status-banner-warning",
        title: "شماره موبایل معتبر نیست",
        description: "معماری ورود پیامکی آماده شده، اما UI فعلی بر ورود ایمیلی متمرکز است."
      };
    case "otp-cooldown":
      return {
        tone: "status-banner-warning",
        title: "ارسال دوباره خیلی زود است",
        description: cooldown
          ? `برای درخواست دوباره کد، حدود ${cooldown} ثانیه دیگر صبر کن.`
          : "برای درخواست دوباره کد، کمی صبر کن."
      };
    case "otp-rate-limited":
      return {
        tone: "status-banner-warning",
        title: "درخواست‌های زیاد ثبت شده است",
        description: "برای جلوگیری از سوءاستفاده، فعلا کمی صبر کن و دوباره تلاش کن."
      };
    case "otp-expired":
      return {
        tone: "status-banner-warning",
        title: "کد منقضی شده است",
        description: "کد قبلی دیگر معتبر نیست. دوباره کد جدید بگیر."
      };
    case "otp-invalid":
      return {
        tone: "status-banner-warning",
        title: "کد واردشده درست نیست",
        description: "کد شش رقمی را دوباره بررسی کن و در صورت نیاز درخواست جدید بفرست."
      };
    case "otp-max-attempts":
      return {
        tone: "status-banner-warning",
        title: "تلاش‌های ناموفق زیاد شد",
        description: "برای امنیت بیشتر، یک کد جدید درخواست کن."
      };
    case "otp-delivery-failed":
      return {
        tone: "status-banner-warning",
        title: "ارسال کد انجام نشد",
        description: "در حال حاضر ارسال ایمیل درست پیکربندی نشده یا موقتا در دسترس نیست."
      };
    default:
      return null;
  }
}

export default async function LoginPage({
  searchParams
}: {
  searchParams?: SearchParamsLike;
}) {
  const [session, params] = await Promise.all([getSession(), resolveSearchParams(searchParams)]);
  const redirectTo = getSafeRedirectPath(params.next || "/account");
  const isVerifyStep = params.step === "verify" && Boolean(params.identifier);
  const statusMessage = getErrorMessage(params.error, params.cooldown);

  if (session) {
    redirect("/account");
  }

  return (
    <section className="section">
      <div className="container auth-grid">
        <div className="surface auth-copy">
          <div className="eyebrow">ورود امن</div>
          <h1 className="page-title">ورود امن و ساده برای پیگیری سفارش و حساب کاربری</h1>
          <p className="muted section-text">
            در این مرحله، مسیر عمومی ورود فقط با کد یکبارمصرف ایمیل فعال است. اگر با این ایمیل قبلا حسابی
            نداشته باشی، بعد از تایید کد همان لحظه حساب ساخته می‌شود. روش‌های دیگر ممکن است در معماری آماده
            باشند، اما هنوز به شکل عمومی روی این صفحه فعال نشده‌اند.
          </p>

          <div className="auth-benefits">
            <div className="surface nested-card">
              <strong>ورود برای استفاده واقعی طراحی شده است</strong>
              <p className="muted">
                بعد از تایید کد، نشست فعال روی سرور ثبت می‌شود و این حساب برای سفارش‌ها و پیگیری‌های واقعی
                استفاده می‌شود، نه فقط نمایش رابط.
              </p>
            </div>
            <div className="surface nested-card">
              <strong>مسیر فعلی روشن است</strong>
              <p className="muted">
                فعلا فقط ایمیل OTP مسیر عمومی ورود است تا تجربه ساده، کم‌هزینه و قابل نگهداری بماند.
              </p>
            </div>
            <div className="surface nested-card">
              <strong>برای پیگیری سفارش‌ها مفید است</strong>
              <p className="muted">
                اگر بعدا وارد حساب شوی، سفارش‌های ثبت‌شده و مسیرهای پیگیری از همین حساب در دسترس خواهند بود.
              </p>
            </div>
          </div>
        </div>

        <div className="surface auth-card">
          {statusMessage ? (
            <div className={`status-banner ${statusMessage.tone}`} role="alert" aria-live="polite">
              <strong>{statusMessage.title}</strong>
              <p>{statusMessage.description}</p>
            </div>
          ) : null}

          {params.loggedOut === "1" ? (
            <div className="status-banner status-banner-success" role="status" aria-live="polite">
              <strong>از حساب خارج شدی</strong>
              <p>نشست فعال این دستگاه بسته شد و می‌توانی دوباره با کد ایمیل وارد شوی.</p>
            </div>
          ) : null}

          {params.sent === "1" && isVerifyStep ? (
            <div className="status-banner status-banner-success" role="status" aria-live="polite">
              <strong>کد ورود ارسال شد</strong>
              <p>اگر transport ایمیل فعال باشد، کد به {params.identifier} ارسال شده است.</p>
            </div>
          ) : null}

          <div className="auth-tabs" role="tablist" aria-label="مراحل ورود">
            <button
              className={`auth-tab ${!isVerifyStep ? "is-active" : ""}`}
              type="button"
              role="tab"
              aria-selected={!isVerifyStep}
              aria-controls="auth-request-panel"
              id="auth-request-tab"
            >
              دریافت کد ایمیل
            </button>
            <button
              className={`auth-tab ${isVerifyStep ? "is-active" : ""}`}
              type="button"
              role="tab"
              aria-selected={isVerifyStep}
              aria-controls="auth-verify-panel"
              id="auth-verify-tab"
            >
              تایید کد
            </button>
          </div>

          {!isVerifyStep ? (
            <form
              className="auth-form"
              action="/api/auth/login"
              method="post"
              id="auth-request-panel"
              role="tabpanel"
              aria-labelledby="auth-request-tab"
            >
              <input type="hidden" name="redirectTo" value={redirectTo} />
              <input type="hidden" name="channel" value="email" />

              <div className="field-group">
                <label htmlFor="identifier">ایمیل</label>
                <input
                  id="identifier"
                  name="identifier"
                  type="email"
                  dir="ltr"
                  placeholder="you@example.com"
                  autoComplete="email"
                  inputMode="email"
                  maxLength={160}
                  required
                />
              </div>

              <div className="auth-actions">
                <button className="btn btn-primary btn-block" type="submit">
                  دریافت کد ورود
                </button>
              </div>
            </form>
          ) : (
            <>
              <form
                className="auth-form"
                action="/api/auth/verify-otp"
                method="post"
                id="auth-verify-panel"
                role="tabpanel"
                aria-labelledby="auth-verify-tab"
              >
                <input type="hidden" name="redirectTo" value={redirectTo} />
                <input type="hidden" name="identifier" value={params.identifier} />
                <input type="hidden" name="channel" value={params.channel || "email"} />

                <div className="field-group">
                  <label htmlFor="otp-code">کد شش رقمی</label>
                  <input
                    id="otp-code"
                    name="code"
                    type="text"
                    inputMode="numeric"
                    dir="ltr"
                    placeholder="123456"
                    autoComplete="one-time-code"
                    pattern="\d{6}"
                    aria-describedby="otp-code-help"
                    maxLength={6}
                    required
                  />
                  <p className="muted small-note" id="otp-code-help">
                    کد باید دقیقا ۶ رقم باشد.
                  </p>
                </div>

                <div className="auth-actions">
                  <button className="btn btn-primary btn-block" type="submit">
                    تایید کد و ورود
                  </button>
                </div>
              </form>

              <form action="/api/auth/login" method="post">
                <input type="hidden" name="redirectTo" value={redirectTo} />
                <input type="hidden" name="identifier" value={params.identifier} />
                <input type="hidden" name="channel" value={params.channel || "email"} />
                <button className="btn btn-secondary btn-block" type="submit">
                  ارسال دوباره کد
                </button>
              </form>

              <div className="surface nested-card">
                <strong>ایمیل مقصد</strong>
                <p className="muted">{params.identifier}</p>
                <p className="muted">
                  اگر این دستگاه در حالت توسعه و transport mock باشد، کد فقط برای تست محلی در پایین نمایش
                  داده می‌شود.
                </p>
                {params.devCode && process.env.NODE_ENV !== "production" ? (
                  <div className="status-banner status-banner-success" role="status" aria-live="polite">
                    <strong>کد توسعه</strong>
                    <p dir="ltr">{params.devCode}</p>
                  </div>
                ) : null}
              </div>
            </>
          )}

          <p className="muted small-note">
            این صفحه عمدا فقط همان چیزی را قول می‌دهد که همین حالا فعال است: ورود با ایمیل، ساخت حساب در
            اولین تایید موفق، و استفاده از حساب برای پیگیری سفارش و دسترسی‌های واقعی.
          </p>

          <div className="chip-row">
            <Link href="/products" className="chip chip-link">
              ادامه بدون ورود و مشاهده محصولات
            </Link>
            <Link href="/help" className="chip chip-link">
              راهنما و پشتیبانی
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
