import expRealtyLogo from '@/assets/logos/exp-realty.webp';
import ferrariLogo from '@/assets/logos/ferrari.webp';
import jmAutoLogo from '@/assets/logos/jm-auto-repair.webp';
import nbaLogo from '@/assets/logos/nba.webp';
import nflLogo from '@/assets/logos/nfl.webp';
import ogdenVenturesLogo from '@/assets/logos/ogden-ventures.webp';
import otgConsultingLogo from '@/assets/logos/otg-consulting.webp';
import rovoLogo from '@/assets/logos/rovo.webp';
import subaruLogo from '@/assets/logos/subaru.webp';
import zionLogo from '@/assets/logos/zion-performance.webp';

const logos = [
    { src: nflLogo, alt: 'NFL' },
    { src: rovoLogo, alt: 'Rovo Industries Group' },
    { src: ferrariLogo, alt: 'Ferrari' },
    { src: otgConsultingLogo, alt: 'OTG Consulting' },
    { src: nbaLogo, alt: 'NBA' },
    { src: ogdenVenturesLogo, alt: 'Ogden Ventures', extraPadding: 'py-5' },
    { src: subaruLogo, alt: 'Subaru' },
    { src: zionLogo, alt: 'Zion Performance' },
    { src: expRealtyLogo, alt: 'eXp Realty' },
    { src: jmAutoLogo, alt: 'JM Auto Repair' },
];

const LogoCarousel = () => {
    return (
        <section className="overflow-hidden border-y border-border/50 bg-background py-24 dark:bg-background">
            <div className="container mx-auto mb-12 px-4">
                <p className="text-center text-base tracking-wider text-muted-foreground uppercase">
                    Trusted by innovative companies worldwide
                </p>
            </div>

            <div className="relative">
                {/* Gradient Overlays */}
                <div className="absolute top-0 bottom-0 left-0 z-10 w-32 bg-gradient-to-r from-background to-transparent" />
                <div className="absolute top-0 right-0 bottom-0 z-10 w-32 bg-gradient-to-l from-background to-transparent" />

                {/* Scrolling Logos - two identical sets for seamless loop */}
                <div className="logo-carousel flex">
                    {/* First set */}
                    {logos.map((logo, index) => (
                        <div
                            key={`first-${logo.alt}-${index}`}
                            className={`mr-12 flex h-32 w-48 flex-shrink-0 items-center justify-center rounded-xl bg-white p-2 ${'extraPadding' in logo ? logo.extraPadding : ''}`}
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
                            className={`mr-12 flex h-32 w-48 flex-shrink-0 items-center justify-center rounded-xl bg-white p-2 ${'extraPadding' in logo ? logo.extraPadding : ''}`}
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
