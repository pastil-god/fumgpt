import Image from "next/image";
import Link from "next/link";
import { getStorefrontSettings } from "@/lib/content";
import { getNavigationLinks, isExternalHref, type NavigationLink } from "@/lib/site";

function buildHeaderNavigation(items: NavigationLink[]) {
  const primaryNavigation = getNavigationLinks(items, "primary");
  const homeItem = primaryNavigation.find((item) => item.label === "خانه");
  const storeItem = primaryNavigation.find((item) => item.label === "فروشگاه");
  const newsItem = primaryNavigation.find((item) => item.label === "اخبار");
  const academyItem =
    primaryNavigation.find((item) => item.label === "آکادمی") || {
      label: "آکادمی",
      href: "/academy",
      location: "primary",
      priority: 85
    };
  const learningItem =
    primaryNavigation.find((item) => item.label === "آموزش") || {
      label: "آموزش",
      href: "/academy#learning-path",
      location: "primary",
      priority: 84
    };

  const reservedLabels = new Set(["خانه", "فروشگاه", "آکادمی", "آموزش", "اخبار"]);
  const trailingItems = primaryNavigation.filter((item) => !reservedLabels.has(item.label));

  return [homeItem, storeItem, academyItem, learningItem, newsItem]
    .filter((item): item is NavigationLink => Boolean(item))
    .concat(trailingItems);
}

export async function Header() {
  const settings = await getStorefrontSettings();
  const navigation = buildHeaderNavigation(settings.navigation);
  const logoSrc = settings.logoUrl || "/logo.svg";
  const logoIsSvg = logoSrc.toLowerCase().endsWith(".svg");

  return (
    <>
      <div className="topbar">
        <div className="container topbar-shell">
          <div className="topbar-items">
            <span className="topbar-note">{settings.topBarText}</span>
            {settings.topBarHighlights.map((item) => (
              <span className="topbar-highlight" key={item}>
                {item}
              </span>
            ))}
          </div>
          <div className="topbar-items topbar-contact is-muted">
            <span className="topbar-contact-item">{settings.support.phone}</span>
            <span className="topbar-contact-item">{settings.support.email}</span>
          </div>
        </div>
      </div>

      <header className="site-header">
        <div className="container header-shell surface">
          <Link href="/" className="brand">
            <Image
              src={logoSrc}
              alt={settings.brandName}
              width={44}
              height={44}
              priority
              unoptimized={logoIsSvg}
            />
            <div className="brand-copy">
              <strong>{settings.brandName}</strong>
              <span>{settings.brandTagline}</span>
            </div>
          </Link>

          <nav className="nav-links header-nav" aria-label="منوی اصلی سایت">
            {navigation.map((item) =>
              isExternalHref(item.href) ? (
                <a
                  className="header-nav-link"
                  key={`${item.label}-${item.href}`}
                  href={item.href}
                  target={item.openInNewTab ? "_blank" : undefined}
                  rel={item.openInNewTab ? "noreferrer" : undefined}
                >
                  {item.label}
                </a>
              ) : (
                <Link className="header-nav-link" key={`${item.label}-${item.href}`} href={item.href}>
                  {item.label}
                </Link>
              )
            )}
          </nav>

          <div className="header-actions">
            <Link href="/account" className="btn btn-ghost header-account-link">
              حساب کاربری
            </Link>
            <Link href="/cart" className="btn btn-primary header-cart-link">
              سبد خرید
            </Link>
          </div>
        </div>
      </header>
    </>
  );
}
