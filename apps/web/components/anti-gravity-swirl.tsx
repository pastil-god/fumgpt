type Props = {
  mode?: "static" | "animated";
};

export function AntiGravitySwirl({ mode = "static" }: Props) {
  // Static mode intentionally renders nothing and lets the body background
  // provide the visual treatment. This keeps the decorative layer easy to
  // re-enable later without paying the runtime cost today.
  if (mode !== "animated") {
    return null;
  }

  return (
    <div className="anti-gravity-swirl" aria-hidden="true">
      <div className="anti-gravity-veil" />
      <div className="anti-gravity-ribbon anti-gravity-ribbon-a" />
      <div className="anti-gravity-orb anti-gravity-orb-a" />
      <div className="anti-gravity-orb anti-gravity-orb-b" />
      <div className="anti-gravity-halo" />
      <span className="anti-gravity-dot" />
    </div>
  );
}
