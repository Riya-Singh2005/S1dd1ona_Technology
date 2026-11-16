/** Static blue-led surface with a restrained warm accent; no animation or WebGL. */
export function SolutionsHeroShader() {
  return (
    <div
      className="pointer-events-none absolute inset-0 bg-[#0B203B]"
      aria-hidden="true"
      style={{
        backgroundImage:
          "radial-gradient(ellipse 24% 30% at 96% 12%, rgba(166,74,37,0.24) 0%, rgba(166,74,37,0.08) 45%, transparent 78%), radial-gradient(ellipse 70% 85% at 78% 38%, rgba(40,83,126,0.75) 0%, transparent 75%), linear-gradient(120deg, #0B203B 0%, #153553 58%, #102C49 100%)",
      }}
    >
      <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-[#0B203B]/45 to-transparent" />
    </div>
  );
}
