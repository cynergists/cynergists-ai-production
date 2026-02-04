import { OrbitingButton } from '@/components/ui/orbiting-button';
import { Link } from '@inertiajs/react';
import { ArrowRight, CheckCircle } from 'lucide-react';

const valuePoints = [
    'Faster response and follow up without extra headcount',
    'Cleaner handoffs between teams',
    'Less operational drag and fewer dropped balls',
    'More time for strategy, leadership, and growth',
];

const ValueSection = () => {
    return (
        <section className="relative overflow-hidden bg-card/30 py-24">
            <div className="relative z-10 container mx-auto px-4">
                <div className="mx-auto max-w-4xl">
                    <div className="mb-12 text-center">
                        <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-2">
                            <span className="text-sm font-medium text-primary">
                                Immediate Leverage
                            </span>
                        </div>

                        <h2 className="font-display mb-4 text-3xl font-bold text-foreground md:text-4xl">
                            Get Back Time and{' '}
                            <span className="text-gradient">Consistency</span>
                        </h2>

                        <h3 className="mb-8 text-xl font-medium text-muted-foreground md:text-2xl">
                            Reduce the work that steals momentum and leadership
                            capacity
                        </h3>

                        <p className="mb-8 leading-relaxed text-muted-foreground">
                            When execution becomes consistent, your team stops
                            playing cleanup and starts building. You reclaim
                            time, reduce bottlenecks, and improve follow
                            through.
                        </p>
                    </div>

                    <div className="mb-12 grid gap-4 md:grid-cols-2">
                        {valuePoints.map((point) => (
                            <div key={point} className="card-glass p-4">
                                <div className="flex items-center gap-3">
                                    <CheckCircle className="h-5 w-5 flex-shrink-0 text-primary" />
                                    <span className="text-foreground">
                                        {point}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="text-center">
                        <OrbitingButton
                            asChild
                            className="btn-primary group px-8 py-6 text-lg"
                        >
                            <Link href="/schedule">
                                Assemble Your Team
                                <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                            </Link>
                        </OrbitingButton>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default ValueSection;
