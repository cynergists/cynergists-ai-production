import { OrbitingButton } from '@/components/ui/orbiting-button';
import { Link } from '@inertiajs/react';
import { ArrowRight, ClipboardList, Cog, Eye, Rocket } from 'lucide-react';

const steps = [
    {
        icon: ClipboardList,
        step: '01',
        title: 'Mission Briefing',
        description:
            'Identify the workflow, constraints, and success criteria.',
    },
    {
        icon: Cog,
        step: '02',
        title: 'Agent Blueprint',
        description:
            'Define the role, tools, permissions, and escalation rules.',
    },
    {
        icon: Rocket,
        step: '03',
        title: 'Deployment',
        description:
            'Connect systems, test in controlled conditions, then go live.',
    },
    {
        icon: Eye,
        step: '04',
        title: 'Oversight',
        description: 'Monitor, QA, and adjust to keep results consistent.',
    },
];

const HowItWorks = () => {
    return (
        <section className="light:bg-transparent relative overflow-hidden bg-background py-20 dark:bg-background">
            {/* Background Effects - only show in dark mode */}
            <div className="absolute inset-0 hidden dark:block">
                <div className="absolute top-1/2 left-1/4 h-64 w-64 rounded-full bg-primary/5 blur-3xl" />
                <div className="absolute right-1/4 bottom-1/4 h-48 w-48 rounded-full bg-secondary/5 blur-3xl" />
            </div>

            <div className="relative z-10 container mx-auto px-4">
                <div className="mb-12 text-center">
                    <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-2">
                        <span className="text-sm font-medium text-primary">
                            Your Deployment Path
                        </span>
                    </div>
                    <h2 className="font-display mb-4 text-3xl font-bold text-foreground md:text-4xl">
                        From Mission Briefing to{' '}
                        <span className="text-gradient">Live Execution</span>
                    </h2>
                    <h3 className="mb-6 text-xl font-medium text-muted-foreground md:text-2xl">
                        A proven build, deploy, and manage process that keeps
                        your business in control
                    </h3>
                    <div className="mx-auto max-w-3xl space-y-4 text-muted-foreground">
                        <p>
                            We start by mapping the workflow you want off your
                            plate, the data it touches, and the handoffs
                            required for clean execution. Then we design the
                            agent role, define its inputs and outputs, and set
                            the rules for what it can do on its own versus what
                            requires approval.
                        </p>
                        <p>
                            After deployment, we monitor performance, fix edge
                            cases, and continuously refine the agent as your
                            business changes. Human experts design, deploy, and
                            continuously tune every agent so it performs in real
                            workflows, not demos.
                        </p>
                    </div>
                </div>

                <div className="mb-12 grid gap-6 md:grid-cols-2 lg:grid-cols-4 lg:gap-8">
                    {steps.map((step, index) => (
                        <div key={index} className="group relative">
                            {/* Connector line (hidden on last item and mobile) */}
                            {index < steps.length - 1 && (
                                <div className="absolute top-12 left-[60%] hidden h-0.5 w-full bg-gradient-to-r from-primary/50 to-transparent lg:block" />
                            )}

                            <div className="card-glass flex h-full flex-col items-center p-6 text-center transition-all duration-300 group-hover:border-primary/50">
                                {/* Step number badge */}
                                <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-primary px-3 py-1 text-xs font-bold text-primary-foreground">
                                    Step {step.step}
                                </div>

                                {/* Icon */}
                                <div className="mt-2 mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 transition-colors group-hover:bg-primary/20">
                                    <step.icon className="h-8 w-8 text-primary" />
                                </div>

                                {/* Content */}
                                <h3 className="font-display mb-2 text-lg font-semibold text-foreground">
                                    {step.title}
                                </h3>
                                <p className="text-sm leading-relaxed text-muted-foreground">
                                    {step.description}
                                </p>
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
        </section>
    );
};

export default HowItWorks;
