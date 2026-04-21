type GridPageSkeletonProps = {
  title?: string;
  cards?: number;
};

export function GridPageSkeleton({
  title = "در حال بارگذاری محتوا",
  cards = 3
}: GridPageSkeletonProps) {
  return (
    <section className="section">
      <div className="container section-stack">
        <div className="surface loading-shell">
          <div className="skeleton-line is-short" />
          <div className="skeleton-line is-wide" />
          <div className="skeleton-line is-medium" />
          <span className="muted">{title}</span>
        </div>

        <div className="loading-grid">
          {Array.from({ length: cards }).map((_, index) => (
            <div className="surface loading-card" key={index} />
          ))}
        </div>
      </div>
    </section>
  );
}

export function DetailPageSkeleton() {
  return (
    <section className="section">
      <div className="container section-stack">
        <div className="detail-grid">
          <div className="surface loading-shell">
            <div className="skeleton-block" />
            <div className="skeleton-line is-short" />
            <div className="skeleton-line is-wide" />
            <div className="skeleton-line is-medium" />
            <div className="skeleton-line is-wide" />
          </div>

          <div className="surface loading-shell">
            <div className="skeleton-line is-short" />
            <div className="skeleton-line is-wide" />
            <div className="skeleton-line is-medium" />
          </div>
        </div>
      </div>
    </section>
  );
}
