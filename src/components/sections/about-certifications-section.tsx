import Image from "next/image";
import { BackgroundGradientGlow } from "@/components/ui/background-gradient-glow";
import { Container } from "@/components/ui/container";
import { AboutEditorialReveal } from "@/components/sections/about-editorial-reveal";
import styles from "./about-certifications-section.module.css";

const certificates = [
  { standard: "ISO 9001:2015", title: "Quality Management System", image: "/images/certificates/iso-9001-2015.png" },
  { standard: "ISO 14001:2015", title: "Environmental Management System", image: "/images/certificates/iso-14001-2015.png" },
  { standard: "ISO/IEC 27001:2022", title: "Information Security Management System", image: "/images/certificates/iso-27001-2022.png" },
] as const;

export function AboutCertificationsSection() {
  return (
    <section id="certifications" aria-labelledby="certifications-heading" className="relative isolate overflow-hidden py-20 sm:py-24 lg:py-32">
      <BackgroundGradientGlow variant="pastel" />
      <Container size="wide" className="relative z-10">
        <div className="mb-10 max-w-3xl">
          <h2 id="certifications-heading" className="font-heading text-[34px] font-normal uppercase leading-[0.96] tracking-[-0.025em] text-[#0F172A] sm:text-[40px] lg:text-[44px]">Certifications &amp; <span className="text-[#C2410C]">Accreditations</span></h2>
          <p className="mt-6 text-base leading-[1.65] text-slate-700 sm:text-[17.5px]">Our certificates document our quality, environmental, and information security management systems.</p>
        </div>
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {certificates.map((certificate, index) => (
            <AboutEditorialReveal key={certificate.standard} delay={index * 0.06}>
              <figure className={styles.certificate}>
                <a href={certificate.image} target="_blank" rel="noopener noreferrer" aria-label={`Open ${certificate.standard} certificate at full size (new tab)`} className={`${styles.imageLink} block overflow-hidden rounded-lg bg-white shadow-[0_12px_28px_-16px_rgba(22,19,77,0.3)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-600 focus-visible:ring-offset-4`}>
                  <Image src={certificate.image} alt={`Siddiona Technologies Services Private Limited certificate of registration for ${certificate.standard}, ${certificate.title}`} width={1489} height={2105} sizes="(min-width: 640px) 310px, 280px" className="h-auto w-full object-contain" />
                </a>
                <figcaption className="mt-5">
                  <h3 className={`${styles.title} font-display text-lg font-extrabold text-[#16134D]`}>{certificate.standard}</h3>
                  <p className="mt-1 text-base leading-relaxed text-slate-700">{certificate.title}</p>
                  <a href={certificate.image} target="_blank" rel="noopener noreferrer" className="mt-2 inline-flex min-h-11 items-center text-sm font-semibold text-[#16134D] underline underline-offset-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-600">View full certificate<span className="sr-only"> (new tab)</span></a>
                </figcaption>
              </figure>
            </AboutEditorialReveal>
          ))}
        </div>
      </Container>
    </section>
  );
}
