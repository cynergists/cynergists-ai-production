import aiOperationsImage from '@/assets/ai-operations-hero.webp';
import { OrbitingButton } from '@/components/ui/orbiting-button';
import { Link } from '@inertiajs/react';
import { ArrowRight, Shield, Target, Zap } from 'lucide-react';

const AboutSection = () => {
    return (
        <section className="relative overflow-hidden bg-background py-24">
            {/* Background gradient */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-secondary/5" />

            <div className="relative z-10 container mx-auto px-4">
                <div className="grid items-center gap-12 lg:grid-cols-2">
                    {/* Image */}
                    <div className="relative">
                        <div className="relative overflow-hidden rounded-2xl shadow-2xl">
                            <img
                                src={aiOperationsImage}
                                alt="AI-powered operations command center"
                                className="h-auto w-full object-cover"
                            />
                            {/* Overlay gradient */}
                            <div className="absolute inset-0 bg-gradient-to-t from-background/40 via-transparent to-transparent" />
                        </div>
                        {/* Decorative elements */}
                        <div className="absolute -right-4 -bottom-4 h-32 w-32 rounded-full bg-primary/20 blur-3xl" />
                        <div className="absolute -top-4 -left-4 h-24 w-24 rounded-full bg-secondary/20 blur-2xl" />
                    </div>

                    {/* Content */}
                    <div>
                        <h2 className="font-display mb-6 text-3xl font-bold text-foreground md:text-4xl">
                            Command Your{' '}
                            <span className="text-gradient">Operations</span>{' '}
                            Like Never Before
                        </h2>

                        <p className="mb-8 text-lg text-muted-foreground">
                            At Cynergists, we blend cutting-edge AI technology
                            with expert operational leadership to give your
                            business superhero-level capabilities. Our team
                            orchestrates your operations with precision,
                            efficiency, and strategic vision.
                        </p>

                        <div className="mb-8 space-y-4">
                            <div className="flex items-start gap-4">
                                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-primary/10">
                                    <Zap className="h-5 w-5 text-primary" />
                                </div>
                                <div>
                                    <h4 className="font-semibold text-foreground">
                                        AI-Powered Efficiency
                                    </h4>
                                    <p className="text-sm text-muted-foreground">
                                        Automate workflows and eliminate
                                        bottlenecks with intelligent systems.
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-start gap-4">
                                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-primary/10">
                                    <Shield className="h-5 w-5 text-primary" />
                                </div>
                                <div>
                                    <h4 className="font-semibold text-foreground">
                                        Human Oversight
                                    </h4>
                                    <p className="text-sm text-muted-foreground">
                                        Dedicated managers who monitor, tune,
                                        and optimize your AI agents.
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-start gap-4">
                                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-primary/10">
                                    <Target className="h-5 w-5 text-primary" />
                                </div>
                                <div>
                                    <h4 className="font-semibold text-foreground">
                                        Strategic Growth
                                    </h4>
                                    <p className="text-sm text-muted-foreground">
                                        Scale your business with the right
                                        people and proven processes.
                                    </p>
                                </div>
                            </div>
                        </div>

                        <OrbitingButton asChild size="lg" className="group">
                            <Link href="/about">
                                Learn About Us
                                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                            </Link>
                        </OrbitingButton>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default AboutSection;
