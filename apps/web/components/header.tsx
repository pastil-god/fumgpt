import Link from "next/link";
import { siteConfig } from "@/lib/site";

export function Header() {
  return (
    <>
      <div className="topbar">
        <div className="container topbar-shell">
          <div className="topbar-items">
            <span>تحویل دیجیتال سریع</span>
            <span>پشتیبانی پیش از خرید</span>
            <span>زیرساخت آماده توسعه</span>
          </div>
          <div className="topbar-items is-muted">
            <span>{siteConfig.phone}</span>
            <span>{siteConfig.email}</span>
          </div>
        </div>
      </div>

      <header className="site-header">
        <div className="container header-shell surface">
          <Link href="/" className="brand">
            <img src="/logo.svg" alt="FumGPT" width="44" height="44" />
            <div>
              <strong>{siteConfig.name}</strong>
              <span>AI Premium Storefront</span>
            </div>
          </Link>

          <nav className="nav-links" aria-label="main-navigation">
            {siteConfig.nav.map((item) => (
              <Link key={item.href} href={item.href}>
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="header-actions">
            <Link href="/products" className="btn btn-ghost">
              محصولات
            </Link>
            <Link href="/cart" className="btn btn-primary">
              خرید سریع
            </Link>
          </div>
        </div>
      </header>
    </>
  );
}
