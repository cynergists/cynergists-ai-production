import Layout from '@/components/layout/Layout';
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from '@/components/ui/accordion';
import { OrbitingButton } from '@/components/ui/orbiting-button';
import { Link, usePage } from '@inertiajs/react';
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
        question: 'How do I decide what to delegate?',
        answer: 'You set priorities. We help structure tasks so hours are used efficiently and aligned with your goals.',
    },
    {
        question: 'What happens if priorities change?',
        answer: 'Hours can be reallocated across roles as needs shift month to month.',
    },
    {
        question: 'Is this a long-term commitment?',
        answer: 'Elite is a monthly subscription with a defined minimum commitment.',
    },
    {
        question: 'Can this replace internal teams or departments?',
        answer: 'For many businesses, yes. Cynergists often replaces multiple internal roles or departments without the overhead of employment.',
    },
];

const Elite = () => {
    const { url } = usePage();
    const searchParams = new URLSearchParams(url.split('?')[1] ?? '');
    const billingPeriod = searchParams.get('billing') || 'monthly';
    const checkoutUrl = `/checkout?plan=elite${billingPeriod === 'annual' ? '&billing=annual' : ''}`;

    return (
        <Layout>
            <Helmet>
                <title>Elite Plan | Cynergists</title>
                <meta
                    name="description"
                    content="Built for businesses with high-volume, multi-function execution needs. Dependable, high-volume support across many functions without the friction of hiring or scaling internal staff."
                />
                <link
                    rel="canonical"
                    href="https://cynergists.ai/plans/elite"
                />
            </Helmet>

            <main>
                {/* Hero Section */}
                <header className="gradient-hero py-20 lg:py-32">
                    <div className="container mx-auto px-4">
                        <div className="mx-auto max-w-4xl text-center">
                            <h1 className="font-display mb-6 text-4xl font-bold text-foreground md:text-5xl lg:text-6xl">
                                Elite
                            </h1>
                            <p className="mb-6 text-xl font-medium text-foreground/90 md:text-2xl">
                                Built for Businesses With High-Volume,
                                Multi-Function Execution Needs
                            </p>
                            <p className="mb-8 text-lg text-muted-foreground">
                                Some businesses reach a point where execution is
                                constant, complex, and non-negotiable. Elite is
                                designed for teams that require dependable,
                                high-volume support across many functions at the
                                same time, without the friction of hiring,
                                managing, or scaling internal staff. This plan
                                provides the capacity to support operations,
                                projects, and systems continuously without
                                slowing momentum.
                            </p>
                            <OrbitingButton
                                asChild
                                className="btn-primary px-8 py-6 text-lg"
                            >
                                <Link href={checkoutUrl}>
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
                                Hiring and managing people takes time, money,
                                and focus.
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
                                You focus on priorities and strategy. We manage
                                the team and the execution.
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
                                You are not locked into a single function.
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
                                Hours shift as priorities shift.
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
                                With high monthly capacity, work moves forward
                                across operations, projects, and long-term
                                initiatives without interruption. Hours flex
                                across roles without renegotiation, giving you a
                                single managed team that adapts as your business
                                operates at scale.
                            </p>
                            <p className="mb-6 text-lg text-muted-foreground">
                                You pay one predictable flat monthly fee, with
                                no payroll, no benefits, and no hiring risk.
                            </p>
                            <p className="mb-6 text-lg text-muted-foreground">
                                You work directly with your staff, and all tasks
                                are assigned, tracked, and delivered inside a
                                structured system with built-in accountability.
                            </p>
                            <p className="mb-6 text-lg text-muted-foreground">
                                Execution stays consistent, even as complexity
                                increases.
                            </p>
                            <p className="text-lg font-medium text-foreground">
                                The result is simple. Work gets done. At volume.
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
                                Elite delivers reliable, high-capacity execution
                                without the friction of building or managing
                                internal teams. If your business requires
                                sustained execution across multiple functions
                                every month, this plan is designed to support
                                that reality.
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
                            Put execution on autopilot and keep your business
                            moving.
                        </p>
                        <OrbitingButton
                            asChild
                            className="btn-primary px-8 py-6 text-lg"
                        >
                            <Link href={checkoutUrl}>
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

export default Elite;
