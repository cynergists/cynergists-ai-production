import { OrbitingButton } from '@/components/ui/orbiting-button';
import { Link } from '@inertiajs/react';
import { ArrowRight, CheckCircle } from 'lucide-react';

const proofPoints = [
    'Production ready design with defined roles and responsibilities',
    'Human oversight for setup, monitoring, and refinement',
    'Ongoing maintenance so agents improve instead of degrade',
];

const ProofSection = () => {
    return (
        <section className="relative overflow-hidden bg-background py-24 dark:bg-background">
            <div className="absolute inset-0 hidden bg-gradient-to-br from-primary/5 via-transparent to-secondary/5 dark:block" />

            <div className="relative z-10 container mx-auto px-4">
                <div className="mx-auto max-w-4xl">
                    <div className="mb-12 text-center">
                        <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-2">
                            <span className="text-sm font-medium text-primary">
                                Built for Production
                            </span>
                        </div>

                        <h2 className="font-display mb-4 text-3xl font-bold text-foreground md:text-4xl">
                            This Is Not a{' '}
                            <span className="text-gradient">
                                Toy Deployment
                            </span>
                        </h2>

                        <h3 className="mb-8 text-xl font-medium text-muted-foreground md:text-2xl">
                            You are building an execution capability, not
                            running an experiment
                        </h3>

                        <p className="mb-8 leading-relaxed text-muted-foreground">
                            Cynergists builds agents to operate inside real
                            workflows with real constraints. We do not ship
                            prototypes and disappear. We manage the system and
                            keep it dependable as your processes evolve.
                        </p>
                    </div>

                    <div className="mb-12 space-y-4">
                        {proofPoints.map((point) => (
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

export default ProofSection;
