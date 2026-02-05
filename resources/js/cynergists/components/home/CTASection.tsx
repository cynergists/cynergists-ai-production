import { OrbitingButton } from '@/components/ui/orbiting-button';
import { Link } from '@inertiajs/react';
import { ArrowRight } from 'lucide-react';

const CTASection = () => {
    return (
        <section className="relative overflow-hidden bg-background py-24 dark:bg-background">
            {/* Background - only in dark mode */}
            <div className="absolute inset-0 hidden bg-gradient-to-br from-primary/10 via-background to-secondary/10 dark:block" />
            <div className="absolute top-0 left-1/4 hidden h-96 w-96 rounded-full bg-primary/10 blur-3xl dark:block" />
            <div className="absolute right-1/4 bottom-0 hidden h-80 w-80 rounded-full bg-secondary/10 blur-3xl dark:block" />

            <div className="relative z-10 container mx-auto px-4">
                <div className="mx-auto max-w-3xl text-center">
                    <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-2">
                        <span className="text-sm font-medium text-primary">
                            Your Mission Briefing
                        </span>
                    </div>
                    <h2 className="font-display mb-4 text-3xl font-bold text-foreground md:text-5xl">
                        Ready to Reclaim Your Time and{' '}
                        <span className="text-gradient">
                            Grow Without the Chaos?
                        </span>
                    </h2>
                    <h3 className="mb-8 text-xl font-medium text-muted-foreground md:text-2xl">
                        Stop letting manual work drain your team while
                        competitors move faster
                    </h3>
                    <p className="mx-auto mb-6 max-w-2xl text-lg text-muted-foreground">
                        Every week you wait is another week lost to busywork,
                        delays, and stalled execution. The companies that win
                        build a team that can operate daily without constant
                        supervision.
                    </p>
                    <p className="mx-auto mb-8 max-w-2xl text-lg text-foreground">
                        If you want AI Agents that work in real workflows with
                        expert humans keeping them precise and safe, you are in
                        the right place.
                    </p>

                    <div className="flex flex-col justify-center gap-4 sm:flex-row">
                        <OrbitingButton
                            asChild
                            className="btn-primary group px-8 py-6 text-lg"
                        >
                            <Link href="/marketplace">
                                Explore the Marketplace
                                <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                            </Link>
                        </OrbitingButton>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default CTASection;
