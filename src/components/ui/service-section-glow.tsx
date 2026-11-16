/** Quiet radial light for the existing neutral service-detail sections. */
export function ServiceSectionGlow() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 z-0"
      style={{
        background:
          "radial-gradient(ellipse 75% 90% at 50% 48%, rgba(255, 249, 145, 0.42) 0%, transparent 78%)",
        mixBlendMode: "multiply",
      }}
    />
  );
}
