import { OrbitingButton } from '@/components/ui/orbiting-button';
import { Link } from '@inertiajs/react';
import { ArrowRight, CheckCircle } from 'lucide-react';

const departments = [
    {
        title: 'Sales and RevOps',
        description: 'lead handling, follow up, deal support, CRM upkeep',
    },
    {
        title: 'Support and Success',
        description:
            'intake, triage, knowledge based responses, escalation routing',
    },
    {
        title: 'Finance and Admin',
        description:
            'document handling, reminders, approvals, reconciliation support',
    },
    {
        title: 'Leadership',
        description:
            'reporting, scorecards, weekly summaries, operational visibility',
    },
];

const BenefitsSection = () => {
    return (
        <section className="relative overflow-hidden bg-background py-24 dark:bg-background">
            <div className="absolute inset-0 hidden bg-gradient-to-br from-secondary/5 via-transparent to-primary/5 dark:block" />

            <div className="relative z-10 container mx-auto px-4">
                <div className="mx-auto max-w-4xl">
                    <div className="mb-12 text-center">
                        <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-2">
                            <span className="text-sm font-medium text-primary">
                                Built for Real Teams
                            </span>
                        </div>

                        <h2 className="font-display mb-4 text-3xl font-bold text-foreground md:text-4xl">
                            Works Across{' '}
                            <span className="text-gradient">Departments</span>
                        </h2>

                        <h3 className="mb-8 text-xl font-medium text-muted-foreground md:text-2xl">
                            The best fit is high volume work with clear rules
                            and repeatable steps
                        </h3>

                        <p className="leading-relaxed text-muted-foreground">
                            If a workflow is important, repeated, and currently
                            handled by humans doing the same steps over and
                            over, it belongs here.
                        </p>
                    </div>

                    <div className="mb-12 grid gap-6 md:grid-cols-2">
                        {departments.map((dept) => (
                            <div key={dept.title} className="card-glass p-6">
                                <div className="flex items-start gap-4">
                                    <CheckCircle className="mt-1 h-6 w-6 flex-shrink-0 text-primary" />
                                    <div>
                                        <h4 className="mb-2 font-semibold text-foreground">
                                            {dept.title}
                                        </h4>
                                        <p className="text-sm text-muted-foreground">
                                            {dept.description}
                                        </p>
                                    </div>
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
                                See Where It Fits
                                <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                            </Link>
                        </OrbitingButton>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default BenefitsSection;
