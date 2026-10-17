import { Navbar } from "@/components/site/navbar";
import { Hero } from "@/components/site/hero";
import { Services } from "@/components/site/services";
import { WhyUs } from "@/components/site/why-us";
import { Process } from "@/components/site/process";
import { SolutionsByNeed } from "@/components/site/solutions-by-need";
import { Work } from "@/components/site/work";
import { CustomSolutions } from "@/components/site/custom-solutions";
import { Principles } from "@/components/site/principles";
import { Contact } from "@/components/site/contact";
import { Footer } from "@/components/site/footer";
import { serviceOptions, siteConfig } from "@/lib/site-config";

const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": "ProfessionalService",
  name: siteConfig.name,
  description: siteConfig.description,
  url: siteConfig.url,
  email: siteConfig.contact.email,
  knowsAbout: serviceOptions.map((service) => service.label),
  areaServed: "Worldwide",
  // Only verified contact details appear here; placeholders stay out of structured data.
};

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col">
      {/* Progressive enhancement: keep scroll-reveal content visible without JS. */}
      <noscript>
        <style>{`.reveal{opacity:1 !important;transform:none !important}`}</style>
      </noscript>

      <Navbar />

      <main id="main" className="flex-1">
        <Hero />
        <Services />
        <WhyUs />
        <Process />
        <SolutionsByNeed />
        <Work />
        <CustomSolutions />
        <Principles />
        <Contact />
      </main>

      <Footer />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
      />
    </div>
  );
}
