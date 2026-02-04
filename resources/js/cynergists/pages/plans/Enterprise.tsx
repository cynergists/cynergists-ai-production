import Layout from '@/components/layout/Layout';
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from '@/components/ui/accordion';
import { OrbitingButton } from '@/components/ui/orbiting-button';
import { Link } from '@inertiajs/react';
import { ArrowRight, Check } from 'lucide-react';
import { Helmet } from 'react-helmet';

const availableRoles = [
    'Ad Campaign Managers',
    'Administrative Assistants',
    'AI Prompt Engineers',
    'Automation & Workflow Engineers',
    'Bookkeepers',
    'Copywriters',
    'CRM Administrators',
    'Customer Success Managers',
    'Executive Assistants',
    'Grant Writers',
    'Paralegals',
    'Real Estate Coordinators',
    'Sales Development Reps',
    'SEO, GEO, & AEO Specialists',
    'Social Media Managers',
    'Video Editors',
    'Web Developers',
];

const faqs = [
    {
        question: 'How is Enterprise scoped?',
        answer: 'Capacity and structure are defined collaboratively based on your operational needs, goals, and timelines.',
    },
    {
        question: 'What happens if priorities change?',
        answer: 'Enterprise is designed to adapt. Scope and capacity can evolve as your organization changes.',
    },
    {
        question: 'Is this a long-term commitment?',
        answer: 'Enterprise operates on a monthly engagement with a defined minimum commitment.',
    },
    {
        question: 'Can this replace internal teams or vendors?',
        answer: 'For many organizations, yes. Cynergists often replaces multiple internal teams or external vendors with a single managed execution partner.',
    },
];

const Enterprise = () => {
    return (
        <Layout>
            <Helmet>
                <title>Enterprise Plan | Cynergists</title>
                <meta
                    name="description"
                    content="Built for organizations with complex, custom execution needs. Customized execution support across multiple departments, initiatives, and systems with flexibility built into both scope and scale."
                />
                <link
                    rel="canonical"
                    href="https://cynergists.ai/plans/enterprise"
                />
            </Helmet>

            <main>
                {/* Hero Section */}
                <header className="gradient-hero py-20 lg:py-32">
                    <div className="container mx-auto px-4">
                        <div className="mx-auto max-w-4xl text-center">
                            <h1 className="font-display mb-6 text-4xl font-bold text-foreground md:text-5xl lg:text-6xl">
                                Enterprise
                            </h1>
                            <p className="mb-6 text-xl font-medium text-foreground/90 md:text-2xl">
                                Built for Organizations With Complex, Custom
                                Execution Needs
                            </p>
                            <p className="mb-8 text-lg text-muted-foreground">
                                Some organizations operate with unique
                                structures, workflows, and priorities that do
                                not fit into predefined capacity. Enterprise is
                                designed for teams that require customized
                                execution support across multiple departments,
                                initiatives, and systems, with flexibility built
                                into both scope and scale. This plan adapts to
                                how your organization actually operates.
                            </p>
                            <OrbitingButton
                                asChild
                                className="btn-primary px-8 py-6 text-lg"
                            >
                                <Link href="/schedule">
                                    Get Started Now
                                    <ArrowRight className="ml-2 h-5 w-5" />
                                </Link>
                            </OrbitingButton>
                        </div>
                    </div>
                </header>

                {/* Execution Without Burden */}
                <section className="py-20">
                    <div className="container mx-auto px-4">
                        <div className="mx-auto max-w-4xl">
                            <h2 className="font-display mb-6 text-3xl font-bold text-foreground">
                                Execution Without the Burden of Hiring
                            </h2>
                            <p className="mb-6 text-lg text-muted-foreground">
                                Hiring and managing large teams takes time,
                                money, and focus.
                            </p>
                            <ul className="mb-8 space-y-2 text-lg text-muted-foreground">
                                <li>• Recruiting.</li>
                                <li>• Training.</li>
                                <li>• Payroll.</li>
                                <li>• Benefits.</li>
                                <li>• Oversight.</li>
                            </ul>
                            <p className="mb-6 text-lg text-muted-foreground">
                                Cynergists removes those responsibilities.
                            </p>
                            <p className="mb-4 text-lg font-medium text-foreground">
                                You define objectives and priorities. We design
                                and manage the execution around them.
                            </p>
                        </div>
                    </div>
                </section>

                {/* Available Roles */}
                <section className="bg-card/30 py-20">
                    <div className="container mx-auto px-4">
                        <div className="mx-auto max-w-4xl">
                            <h2 className="font-display mb-4 text-3xl font-bold text-foreground">
                                Access Every Role as Needs Change
                            </h2>
                            <p className="mb-8 text-lg text-muted-foreground">
                                You are not locked into fixed roles or rigid
                                capacity.
                            </p>
                            <div className="grid gap-3 md:grid-cols-3">
                                {availableRoles.map((role) => (
                                    <div
                                        key={role}
                                        className="flex items-center gap-2 rounded-lg bg-background/50 p-3"
                                    >
                                        <Check className="h-4 w-4 flex-shrink-0 text-primary" />
                                        <span className="text-sm text-foreground">
                                            {role}
                                        </span>
                                    </div>
                                ))}
                                <div className="flex items-center gap-2 rounded-lg bg-background/50 p-3">
                                    <Check className="h-4 w-4 flex-shrink-0 text-primary" />
                                    <span className="text-sm text-foreground">
                                        And more
                                    </span>
                                </div>
                            </div>
                            <p className="mt-8 text-lg text-muted-foreground">
                                Capacity adjusts as needs evolve.
                            </p>
                        </div>
                    </div>
                </section>

                {/* Why This Works */}
                <section className="py-20">
                    <div className="container mx-auto px-4">
                        <div className="mx-auto max-w-4xl">
                            <h2 className="font-display mb-8 text-3xl font-bold text-foreground">
                                Why This Model Works
                            </h2>
                            <p className="mb-6 text-lg text-muted-foreground">
                                You set the priorities. We handle the execution.
                            </p>
                            <p className="mb-6 text-lg text-muted-foreground">
                                Enterprise capacity is designed around your
                                workflows, timelines, and operational demands.
                                Hours and roles flex as requirements change,
                                without renegotiation or disruption.
                            </p>
                            <p className="mb-6 text-lg text-muted-foreground">
                                You operate with a predictable monthly
                                investment, without payroll, benefits, or hiring
                                risk.
                            </p>
                            <p className="mb-6 text-lg text-muted-foreground">
                                You work directly with your staff, and all work
                                is assigned, tracked, and delivered inside a
                                structured system with built-in accountability.
                            </p>
                            <p className="mb-6 text-lg text-muted-foreground">
                                Execution remains stable, even as scope and
                                complexity shift.
                            </p>
                            <p className="text-lg font-medium text-foreground">
                                The result is simple. Work gets done. At scale.
                                Without operational drag.
                            </p>
                        </div>
                    </div>
                </section>

                {/* FAQ Section */}
                <section className="bg-card/30 py-20">
                    <div className="container mx-auto px-4">
                        <div className="mx-auto max-w-3xl">
                            <div className="mb-12 text-center">
                                <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-2">
                                    <span className="text-sm font-medium text-primary">
                                        Public Briefing
                                    </span>
                                </div>
                                <h2 className="font-display text-3xl font-bold text-foreground">
                                    Frequently Asked Questions
                                </h2>
                            </div>
                            <Accordion
                                type="single"
                                collapsible
                                className="space-y-4"
                            >
                                {faqs.map((faq, index) => (
                                    <AccordionItem
                                        key={index}
                                        value={`item-${index}`}
                                        className="card-glass px-6"
                                    >
                                        <AccordionTrigger className="text-left text-lg font-semibold hover:no-underline data-[state=open]:text-primary">
                                            {faq.question}
                                        </AccordionTrigger>
                                        <AccordionContent className="text-base text-foreground/80">
                                            {faq.answer}
                                        </AccordionContent>
                                    </AccordionItem>
                                ))}
                            </Accordion>
                        </div>
                    </div>
                </section>

                {/* Bottom Line */}
                <section className="py-20">
                    <div className="container mx-auto px-4">
                        <div className="mx-auto max-w-4xl text-center">
                            <h2 className="font-display mb-6 text-3xl font-bold text-foreground">
                                Bottom Line
                            </h2>
                            <p className="text-xl text-muted-foreground">
                                Enterprise delivers customized execution without
                                the friction of building and managing large
                                internal teams. If your organization requires
                                tailored operational support that evolves with
                                your needs, this plan is designed for that
                                purpose.
                            </p>
                        </div>
                    </div>
                </section>

                {/* CTA Section */}
                <section className="gradient-hero py-24">
                    <div className="container mx-auto px-4 text-center">
                        <h2 className="font-display mb-4 text-3xl font-bold text-foreground md:text-4xl">
                            Ready to Get Started?
                        </h2>
                        <p className="mb-8 text-xl text-muted-foreground">
                            Let's design execution around how your organization
                            actually runs.
                        </p>
                        <OrbitingButton
                            asChild
                            className="btn-primary px-8 py-6 text-lg"
                        >
                            <Link href="/schedule">
                                Get Started Now
                                <ArrowRight className="ml-2 h-5 w-5" />
                            </Link>
                        </OrbitingButton>
                    </div>
                </section>
            </main>
        </Layout>
    );
};

export default Enterprise;
