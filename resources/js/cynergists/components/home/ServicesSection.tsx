import { OrbitingButton } from '@/components/ui/orbiting-button';
import { Link } from '@inertiajs/react';
import { ArrowRight, Bot } from 'lucide-react';

const ServicesSection = () => {
    return (
        <section className="bg-card/30 py-24">
            <div className="container mx-auto px-4">
                {/* Header */}
                <div className="mb-16 text-center">
                    <h2 className="font-display mb-4 text-3xl font-bold text-foreground md:text-4xl">
                        Our{' '}
                        <span className="text-gradient">Expert Solutions</span>
                    </h2>
                    <p className="mx-auto max-w-2xl text-muted-foreground">
                        Comprehensive AI Agent solutions designed to transform
                        your business operations and accelerate growth with
                        superhero-level support.
                    </p>
                </div>

                {/* Service Card */}
                <div className="mx-auto max-w-xl">
                    <div className="card-glass group">
                        <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-xl bg-primary/10 transition-all duration-300 group-hover:scale-110 group-hover:bg-primary">
                            <Bot className="h-7 w-7 text-primary transition-colors group-hover:text-primary-foreground" />
                        </div>

                        <h3 className="font-display mb-3 text-xl font-bold text-foreground">
                            AI Agents & Automation
                        </h3>

                        <p className="mb-6 text-muted-foreground">
                            Leverage cutting-edge AI solutions to automate
                            repetitive tasks, enhance customer service, and
                            unlock new possibilities for your business.
                        </p>

                        <ul className="mb-6 space-y-2">
                            {[
                                'Custom AI Agents',
                                'Workflow Automation',
                                'Data Analysis',
                                '24/7 Support Bots',
                            ].map((feature) => (
                                <li
                                    key={feature}
                                    className="flex items-center gap-2 text-sm text-foreground/80"
                                >
                                    <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                                    {feature}
                                </li>
                            ))}
                        </ul>

                        <OrbitingButton
                            asChild
                            variant="ghost"
                            className="group/btn p-0 text-primary hover:bg-primary/10 hover:text-primary"
                        >
                            <Link href="/services">
                                Learn More
                                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover/btn:translate-x-1" />
                            </Link>
                        </OrbitingButton>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default ServicesSection;
