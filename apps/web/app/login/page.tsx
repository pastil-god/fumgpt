export default function LoginPage() {
  return (
    <section className="section">
      <div className="container auth-grid">
        <div className="surface auth-copy">
          <div className="eyebrow">احراز هویت فاز بعد</div>
          <h1 className="page-title">ورود، ثبت‌نام و OTP روی همین پایه اضافه می‌شود</h1>
          <p className="muted section-text">
            فعلاً این بخش UI حرفه‌ای دارد تا بعداً ورود با موبایل، OTP، ایمیل، Google و
            Magic Link بدون بازنویسی کل ظاهر اضافه شود.
          </p>

          <div className="auth-benefits">
            <div className="surface nested-card">
              <strong>ورود با موبایل</strong>
              <p className="muted">مناسب بازار ایران و اتصال به پنل پیامکی.</p>
            </div>
            <div className="surface nested-card">
              <strong>ورود با گوگل</strong>
              <p className="muted">برای کاربران حرفه‌ای و تجربه سریع‌تر.</p>
            </div>
            <div className="surface nested-card">
              <strong>حساب سازمانی</strong>
              <p className="muted">برای رشد بعدی فروش تیمی و ورک‌اسپیس.</p>
            </div>
          </div>
        </div>

        <div className="surface auth-card">
          <div className="auth-tabs">
            <button className="auth-tab is-active" type="button">ورود</button>
            <button className="auth-tab" type="button">ثبت‌نام</button>
          </div>

          <div className="field-group">
            <label>شماره موبایل یا ایمیل</label>
            <input type="text" placeholder="09xx xxx xxxx یا ایمیل" />
          </div>

          <div className="field-group">
            <label>رمز عبور</label>
            <input type="password" placeholder="رمز عبور" />
          </div>

          <button className="btn btn-primary btn-block" type="button">
            ورود به حساب
          </button>

          <button className="btn btn-ghost btn-block" type="button">
            دریافت کد یکبار مصرف
          </button>

          <p className="muted small-note">
            این بخش فعلاً نمایشی است و منطق واقعی OTP و ورود در فاز بعد وصل می‌شود.
          </p>
        </div>
      </div>
    </section>
  );
}
