import Layout from '@/components/layout/Layout';
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from '@/components/ui/accordion';
import { OrbitingButton } from '@/components/ui/orbiting-button';
import { usePlanBySlug } from '@/hooks/usePublicPlans';
import { Link, usePage } from '@inertiajs/react';
import {
    ArrowRight,
    Check,
    Clock,
    FlaskConical,
    Shield,
    Users,
    Zap,
} from 'lucide-react';
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

const benefits = [
    {
        icon: Clock,
        title: 'Flexible Allocation',
        description: 'Hours move across roles without renegotiation.',
    },
    {
        icon: Shield,
        title: 'Predictable Cost',
        description: 'One flat monthly fee.',
    },
    {
        icon: Zap,
        title: 'Managed Execution',
        description: 'Work is assigned, tracked, and delivered.',
    },
    {
        icon: Users,
        title: 'Immediate Support',
        description: 'Execution begins without a hiring process.',
    },
];

const faqs = [
    {
        question: 'What is the Test Plan for?',
        answer: 'The Test Plan is designed for testing checkout flows, payment processing, and other system functionality in a safe environment.',
    },
    {
        question: 'Is this a real subscription?',
        answer: 'Yes, this creates a real subscription at a minimal cost ($1/month) for testing purposes.',
    },
    {
        question: 'Can I cancel anytime?',
        answer: 'Absolutely. This plan can be cancelled at any time without penalty.',
    },
    {
        question: 'Who should use this plan?',
        answer: 'This plan is intended for internal testing and development purposes only.',
    },
];

const TestPlan = () => {
    const { url } = usePage();
    const searchParams = new URLSearchParams(url.split('?')[1] ?? '');
    const billingPeriod = searchParams.get('billing') || 'monthly';
    const checkoutUrl = `/checkout?plan=test-plan${billingPeriod === 'annual' ? '&billing=annual' : ''}`;

    const { data: plan, isLoading } = usePlanBySlug('test-plan');

    const price = plan?.price || 1;
    const planName = plan?.name || 'Test Plan';
    const description =
        plan?.description ||
        'A minimal plan for testing checkout and payment flows.';

    return (
        <Layout>
            <Helmet>
                <title>
                    {planName} - ${price}/mo | Cynergists
                </title>
                <meta name="description" content={description} />
                <meta name="robots" content="noindex, nofollow" />
                <link
                    rel="canonical"
                    href="https://cynergists.ai/plans/test-plan"
                />
            </Helmet>

            <main>
                {/* Hero Section */}
                <header className="gradient-hero py-20 lg:py-32">
                    <div className="container mx-auto px-4">
                        <div className="mx-auto max-w-4xl text-center">
                            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/10 px-4 py-2">
                                <FlaskConical className="h-4 w-4 text-amber-500" />
                                <span className="text-sm font-medium text-amber-500">
                                    Test Environment
                                </span>
                            </div>
                            <h1 className="font-display mb-6 text-4xl font-bold text-foreground md:text-5xl lg:text-6xl">
                                {planName}
                            </h1>
                            <p className="mb-4 text-xl font-medium text-foreground/90 md:text-2xl">
                                For Testing & Development Purposes
                            </p>
                            <div className="mb-6 flex items-baseline justify-center gap-2">
                                {isLoading ? (
                                    <span className="font-display text-5xl font-bold text-primary md:text-6xl">
                                        ...
                                    </span>
                                ) : (
                                    <>
                                        <span className="font-display text-5xl font-bold text-primary md:text-6xl">
                                            ${price}
                                        </span>
                                        <span className="text-xl text-muted-foreground">
                                            / Month
                                        </span>
                                    </>
                                )}
                            </div>
                            <p className="mb-6 text-lg font-semibold text-primary">
                                Minimal Test Subscription
                            </p>
                            <p className="mb-8 text-lg text-muted-foreground">
                                {description}
                            </p>
                            <OrbitingButton
                                asChild
                                className="btn-primary px-8 py-6 text-lg"
                            >
                                <Link href={checkoutUrl}>
                                    Start Test
                                    <ArrowRight className="ml-2 h-5 w-5" />
                                </Link>
                            </OrbitingButton>
                        </div>
                    </div>
                </header>

                {/* What's Included */}
                <section className="bg-card/30 py-20">
                    <div className="container mx-auto px-4">
                        <h2 className="font-display mb-12 text-center text-3xl font-bold text-foreground">
                            What's Included
                        </h2>
                        <div className="mx-auto max-w-2xl">
                            <ul className="space-y-4">
                                {[
                                    'Full checkout flow testing',
                                    'Payment processing validation',
                                    'Agreement signing workflow',
                                    'Email notification testing',
                                    'Subscription management testing',
                                ].map((item) => (
                                    <li
                                        key={item}
                                        className="flex items-center gap-3 text-lg"
                                    >
                                        <Check className="h-6 w-6 flex-shrink-0 text-primary" />
                                        <span className="text-foreground">
                                            {item}
                                        </span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </section>

                {/* Test Environment Notice */}
                <section className="py-20">
                    <div className="container mx-auto px-4">
                        <div className="mx-auto max-w-4xl">
                            <h2 className="font-display mb-6 text-3xl font-bold text-foreground">
                                Test Environment Notice
                            </h2>
                            <div className="mb-6 rounded-lg border border-amber-500/30 bg-amber-500/10 p-6">
                                <p className="mb-4 text-lg text-foreground">
                                    <strong>
                                        This plan is intended for internal
                                        testing only.
                                    </strong>
                                </p>
                                <ul className="space-y-2 text-muted-foreground">
                                    <li>
                                        • Creates a real subscription at minimal
                                        cost
                                    </li>
                                    <li>
                                        • Tests all checkout and payment flows
                                    </li>
                                    <li>
                                        • Validates agreement signing process
                                    </li>
                                    <li>
                                        • Confirms email notifications work
                                        correctly
                                    </li>
                                </ul>
                            </div>
                            <p className="text-lg text-muted-foreground">
                                For production use, please select one of our
                                standard plans.
                            </p>
                        </div>
                    </div>
                </section>

                {/* Available Roles */}
                <section className="bg-card/30 py-20">
                    <div className="container mx-auto px-4">
                        <div className="mx-auto max-w-4xl">
                            <h2 className="font-display mb-4 text-3xl font-bold text-foreground">
                                Available Roles (Standard Plans)
                            </h2>
                            <p className="mb-8 text-lg text-muted-foreground">
                                When you're ready for a production plan, you'll
                                have access to:
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
                        </div>
                    </div>
                </section>

                {/* Why This Works */}
                <section className="py-20">
                    <div className="container mx-auto px-4">
                        <h2 className="font-display mb-12 text-center text-3xl font-bold text-foreground">
                            Why This Model Works
                        </h2>
                        <div className="mx-auto grid max-w-5xl gap-6 md:grid-cols-2 lg:grid-cols-4">
                            {benefits.map((benefit) => (
                                <div
                                    key={benefit.title}
                                    className="card-glass p-6 text-center"
                                >
                                    <benefit.icon className="mx-auto mb-4 h-10 w-10 text-primary" />
                                    <h3 className="font-display mb-2 text-lg font-bold text-foreground">
                                        {benefit.title}
                                    </h3>
                                    <p className="text-sm text-muted-foreground">
                                        {benefit.description}
                                    </p>
                                </div>
                            ))}
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
                                        Test Plan FAQ
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

                {/* CTA Section */}
                <section className="gradient-hero py-24">
                    <div className="container mx-auto px-4 text-center">
                        <h2 className="font-display mb-4 text-3xl font-bold text-foreground md:text-4xl">
                            Ready to Test?
                        </h2>
                        <p className="mb-8 text-xl text-muted-foreground">
                            Start the test checkout flow now.
                        </p>
                        <OrbitingButton
                            asChild
                            className="btn-primary px-8 py-6 text-lg"
                        >
                            <Link href={checkoutUrl}>
                                Start Test
                                <ArrowRight className="ml-2 h-5 w-5" />
                            </Link>
                        </OrbitingButton>
                    </div>
                </section>
            </main>
        </Layout>
    );
};

export default TestPlan;
