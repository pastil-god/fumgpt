import Image from "next/image";
import Link from "next/link";
import { getStorefrontSettings } from "@/lib/content";
import { getNavigationLinks, isExternalHref, type NavigationLink } from "@/lib/site";

function cx(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

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
  const header = settings.header;
  const navigation = header.showMainNavigation ? buildHeaderNavigation(settings.navigation) : [];
  const logoSrc = settings.logoUrl || "/logo.svg";
  const logoIsSvg = logoSrc.toLowerCase().endsWith(".svg");
  const topBarText = header.showTopBarText ? settings.topBarText.trim() : "";
  const topBarHighlights = header.showTopBarHighlights
    ? settings.topBarHighlights.map((item) => item.trim()).filter(Boolean)
    : [];
  const supportPhone = header.showSupportPhone ? settings.support.phone.trim() : "";
  const supportEmail = header.showSupportEmail ? settings.support.email.trim() : "";
  const showTopBar = header.showTopBar && Boolean(topBarText || topBarHighlights.length > 0 || supportPhone || supportEmail);
  const showMainNavigation = header.showMainNavigation && navigation.length > 0;
  const showAccountButton = header.showHeaderActions && header.showAccountButton;
  const showCartButton = header.showHeaderActions && header.showCartButton;
  const showHeaderActions = showAccountButton || showCartButton;
  const containerWidthClass = `header-container-width-${header.headerContainerWidth}`;

  return (
    <>
      {showTopBar ? (
        <div className={`topbar topbar-size-${header.topBarSize}`}>
          <div className={cx("container", "topbar-shell", containerWidthClass)}>
            {topBarText || topBarHighlights.length > 0 ? (
              <div className="topbar-items">
                {topBarText ? <span className="topbar-note">{topBarText}</span> : null}
                {topBarHighlights.map((item) => (
                  <span className="topbar-highlight" key={item}>
                    {item}
                  </span>
                ))}
              </div>
            ) : null}
            {supportPhone || supportEmail ? (
              <div className="topbar-items topbar-contact is-muted">
                {supportPhone ? <span className="topbar-contact-item">{supportPhone}</span> : null}
                {supportEmail ? <span className="topbar-contact-item">{supportEmail}</span> : null}
              </div>
            ) : null}
          </div>
        </div>
      ) : null}

      <header className={`site-header header-size-${header.headerSize}`}>
        <div
          className={cx(
            "container",
            "header-shell",
            "surface",
            containerWidthClass,
            !showMainNavigation && "header-shell-no-nav",
            !showHeaderActions && "header-shell-no-actions"
          )}
        >
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
              {settings.brandTagline ? <span>{settings.brandTagline}</span> : null}
            </div>
          </Link>

          {showMainNavigation ? (
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
          ) : null}

          {showHeaderActions ? (
            <div className="header-actions">
              {showAccountButton ? (
                <Link href="/account" className="btn btn-ghost header-account-link">
                  حساب کاربری
                </Link>
              ) : null}
              {showCartButton ? (
                <Link href="/cart" className="btn btn-primary header-cart-link">
                  سبد خرید
                </Link>
              ) : null}
            </div>
          ) : null}
        </div>
      </header>
    </>
  );
}
