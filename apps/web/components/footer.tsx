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
  const socialLinks = [
    { label: "تلگرام", href: settings.socials.telegram },
    { label: "اینستاگرام", href: settings.socials.instagram },
    { label: "واتساپ", href: settings.socials.whatsapp }
  ].filter((item) => item.href);
  const contactItems = [
    ...socialLinks,
    settings.support.email ? { label: settings.support.email, href: `mailto:${settings.support.email}` } : null
  ].filter((item): item is { label: string; href: string } => Boolean(item));
  const contactTextItems = [settings.support.phone, settings.support.address].filter(Boolean);
  const hasContactContent = contactItems.length > 0 || contactTextItems.length > 0;

  return (
    <footer className="site-footer">
      <div className={`container footer-grid${hasContactContent ? "" : " footer-grid-no-contact"}`}>
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
              {settings.brandTagline ? <span>{settings.brandTagline}</span> : null}
            </div>
          </div>
          {settings.footer.description ? <p className="muted">{settings.footer.description}</p> : null}
          {settings.trustBadges.length > 0 ? (
            <div className="chip-row">
              {settings.trustBadges.map((item) => (
                <span className="chip" key={item}>
                  {item}
                </span>
              ))}
            </div>
          ) : null}
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

        {hasContactContent ? (
          <div className="surface footer-card">
            <h3>تماس و پشتیبانی</h3>
            <div className="footer-links">
              {contactItems.map((item) =>
                isExternalHref(item.href) ? (
                  <a
                    key={`${item.label}-${item.href}`}
                    href={item.href}
                    target={/^https?:\/\//i.test(item.href) ? "_blank" : undefined}
                    rel={/^https?:\/\//i.test(item.href) ? "noreferrer" : undefined}
                  >
                    {item.label}
                  </a>
                ) : (
                  <Link key={`${item.label}-${item.href}`} href={item.href}>
                    {item.label}
                  </Link>
                )
              )}
              {contactTextItems.map((item) => (
                <span key={item}>{item}</span>
              ))}
            </div>
          </div>
        ) : null}
      </div>

      <div className="container footer-bottom">
        <span>{settings.footer.copyright}</span>
        <span>نسخه فعلی: سفارش واقعی، پیگیری روشن و مدیریت محتوای بیرونی</span>
      </div>
    </footer>
  );
}
