import { LogoCloud15 } from "@/components/ui/logo-cloud-15";
import { BackgroundGradientGlow } from "@/components/ui/background-gradient-glow";

/**
 * A restrained, evidence-based presentation of authorized technology partners
 * and documented ISO certifications.
 */
export function AuthorizedEcosystemSection() {
  return (
    <section
      id="technology-ecosystem"
      aria-label="Technology ecosystem and ISO certifications"
      className="relative py-8 sm:py-10 lg:py-12 border-b border-slate-200/80 overflow-hidden"
    >
      <BackgroundGradientGlow />
      {/* No gutter — marquees run true edge-to-edge */}
      <div className="relative z-10 w-full">
        <LogoCloud15 duration={36} />
      </div>
    </section>
  );
}

export default AuthorizedEcosystemSection;
