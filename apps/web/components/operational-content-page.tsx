import Link from "next/link";
import type { ReactNode } from "react";
import type { OperationalPageContent } from "@/lib/operations-content";

export function OperationalContentPage({
  content,
  actions,
  aside
}: {
  content: OperationalPageContent;
  actions?: Array<{
    href: string;
    label: string;
    tone?: "primary" | "secondary" | "ghost";
  }>;
  aside?: ReactNode;
}) {
  return (
    <section className="section">
      <div className="container section-stack">
        <div className="future-grid info-page-grid">
          <div className="surface future-main">
            <div className="eyebrow">{content.eyebrow}</div>
            <h1 className="page-title">{content.title}</h1>
            <p className="muted section-text">{content.intro}</p>

            <div className="chip-row is-large-gap">
              {content.highlights.map((item) => (
                <span className="chip" key={item}>
                  {item}
                </span>
              ))}
            </div>

            {actions?.length ? (
              <div className="btn-row">
                {actions.map((action) => (
                  <Link
                    key={`${action.href}-${action.label}`}
                    href={action.href}
                    className={`btn ${
                      action.tone === "ghost"
                        ? "btn-ghost"
                        : action.tone === "secondary"
                          ? "btn-secondary"
                          : "btn-primary"
                    }`}
                  >
                    {action.label}
                  </Link>
                ))}
              </div>
            ) : null}
          </div>

          {aside ? <div className="future-cards">{aside}</div> : null}
        </div>

        <div className="info-section-list">
          {content.sections.map((section) => (
            <div className="surface nested-card" key={section.title}>
              <strong>{section.title}</strong>
              <div className="info-section-copy">
                {section.paragraphs.map((paragraph) => (
                  <p className="muted" key={paragraph}>
                    {paragraph}
                  </p>
                ))}
              </div>
              {section.bullets?.length ? (
                <ul className="feature-list-simple compact">
                  {section.bullets.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              ) : null}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
