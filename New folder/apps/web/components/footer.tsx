import Image from "next/image";
import Link from "next/link";
import { getStorefrontSettings } from "@/lib/content";
import { operationalFooterLinks } from "@/lib/operations-content";
import { getNavigationLinks, isExternalHref } from "@/lib/site";

export async function Footer() {
  const settings = await getStorefrontSettings();
  const footerNavigation = getNavigationLinks(settings.navigation, "footer");
  const logoSrc = settings.logoUrl || "/logo.svg";
  const logoIsSvg = logoSrc.toLowerCase().endsWith(".svg");

  return (
    <footer className="site-footer">
      <div className="container footer-grid">
        <div className="surface footer-brand-card">
          <div className="brand">
            <Image
              src={logoSrc}
              alt={settings.brandName}
              width={44}
              height={44}
              unoptimized={logoIsSvg}
            />
            <div>
              <strong>{settings.brandName}</strong>
              <span>{settings.brandTagline}</span>
            </div>
          </div>
          <p className="muted">{settings.footer.description}</p>
          <div className="chip-row">
            {settings.trustBadges.map((item) => (
              <span className="chip" key={item}>
                {item}
              </span>
            ))}
          </div>
        </div>

        <div className="surface footer-card">
          <h3>بخش‌های اصلی</h3>
          <div className="footer-links">
            {footerNavigation.map((item) =>
              isExternalHref(item.href) ? (
                <a
                  key={`${item.label}-${item.href}`}
                  href={item.href}
                  target={item.openInNewTab ? "_blank" : undefined}
                  rel={item.openInNewTab ? "noreferrer" : undefined}
                >
                  {item.label}
                </a>
              ) : (
                <Link key={`${item.label}-${item.href}`} href={item.href}>
                  {item.label}
                </Link>
              )
            )}
            <Link href="/account">حساب کاربری</Link>
            {operationalFooterLinks.map((item) => (
              <Link key={item.href} href={item.href}>
                {item.label}
              </Link>
            ))}
          </div>
        </div>

        <div className="surface footer-card">
          <h3>تماس و پشتیبانی</h3>
          <div className="footer-links">
            <a href={settings.socials.telegram} target="_blank" rel="noreferrer">
              تلگرام
            </a>
            <a href={settings.socials.instagram} target="_blank" rel="noreferrer">
              اینستاگرام
            </a>
            <a href={settings.socials.whatsapp} target="_blank" rel="noreferrer">
              واتساپ
            </a>
            <a href={`mailto:${settings.support.email}`}>{settings.support.email}</a>
            <span>{settings.support.phone}</span>
            <span>{settings.support.address}</span>
          </div>
        </div>
      </div>

      <div className="container footer-bottom">
        <span>{settings.footer.copyright}</span>
        <span>نسخه فعلی: سفارش واقعی، پیگیری روشن و مدیریت محتوای بیرونی</span>
      </div>
    </footer>
  );
}
