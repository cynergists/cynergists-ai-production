import nflLogo from "@/assets/logos/nfl.webp";
import rovoLogo from "@/assets/logos/rovo.webp";
import ferrariLogo from "@/assets/logos/ferrari.webp";
import otgConsultingLogo from "@/assets/logos/otg-consulting.webp";
import nbaLogo from "@/assets/logos/nba.webp";
import ogdenVenturesLogo from "@/assets/logos/ogden-ventures.webp";
import subaruLogo from "@/assets/logos/subaru.webp";
import zionLogo from "@/assets/logos/zion-performance.webp";
import expRealtyLogo from "@/assets/logos/exp-realty.webp";
import jmAutoLogo from "@/assets/logos/jm-auto-repair.webp";

const logos = [
  { src: nflLogo, alt: "NFL" },
  { src: rovoLogo, alt: "Rovo Industries Group" },
  { src: ferrariLogo, alt: "Ferrari" },
  { src: otgConsultingLogo, alt: "OTG Consulting" },
  { src: nbaLogo, alt: "NBA" },
  { src: ogdenVenturesLogo, alt: "Ogden Ventures", extraPadding: "py-5" },
  { src: subaruLogo, alt: "Subaru" },
  { src: zionLogo, alt: "Zion Performance" },
  { src: expRealtyLogo, alt: "eXp Realty" },
  { src: jmAutoLogo, alt: "JM Auto Repair" },
];

const LogoCarousel = () => {
  return (
    <section className="py-24 border-y border-border/50 overflow-hidden bg-background dark:bg-background">
      <div className="container mx-auto px-4 mb-12">
        <p className="text-center text-muted-foreground text-base uppercase tracking-wider">
          Trusted by innovative companies worldwide
        </p>
      </div>
      
      <div className="relative">
        {/* Gradient Overlays */}
        <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-background to-transparent z-10" />
        <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-background to-transparent z-10" />
        
        {/* Scrolling Logos - two identical sets for seamless loop */}
        <div className="flex logo-carousel">
          {/* First set */}
          {logos.map((logo, index) => (
            <div
              key={`first-${logo.alt}-${index}`}
              className={`flex-shrink-0 w-48 h-32 bg-white rounded-xl flex items-center justify-center p-2 mr-12 ${'extraPadding' in logo ? logo.extraPadding : ''}`}
            >
              <img
                src={logo.src}
                alt={logo.alt}
                className="max-h-full max-w-full object-contain"
              />
            </div>
          ))}
          {/* Second set (duplicate for seamless loop) */}
          {logos.map((logo, index) => (
            <div
              key={`second-${logo.alt}-${index}`}
              className={`flex-shrink-0 w-48 h-32 bg-white rounded-xl flex items-center justify-center p-2 mr-12 ${'extraPadding' in logo ? logo.extraPadding : ''}`}
            >
              <img
                src={logo.src}
                alt={logo.alt}
                className="max-h-full max-w-full object-contain"
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default LogoCarousel;
