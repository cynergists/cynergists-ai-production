import Layout from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { OrbitingButton } from '@/components/ui/orbiting-button';
import { Link } from '@inertiajs/react';
import {
    ArrowRight,
    CheckCircle,
    DollarSign,
    Handshake,
    HelpCircle,
    Shield,
    Target,
    TrendingUp,
    Users,
    Zap,
} from 'lucide-react';
import { Helmet } from 'react-helmet';

const partnerBenefits = [
    'Services are easy to explain',
    'Clients see measurable results',
    'Retention is strong',
    'Commissions are predictable',
];

const referralServices = [
    {
        title: 'AI Agents',
        description: 'Custom agents for revenue and operations',
    },
    {
        title: 'Workflow Automation',
        description: 'End-to-end process automation',
    },
    {
        title: 'Ongoing Management',
        description: 'Continuous tuning and oversight',
    },
    {
        title: 'Monthly Service Plans',
        description: 'Ongoing operational support',
    },
];

const faqs = [
    {
        question: 'How much can partners earn?',
        answer: 'Earnings depend on the number of clients referred and the services they engage in. With 20% residual commissions, partners can build meaningful recurring income over time.',
    },
    {
        question: 'Do commissions expire?',
        answer: 'No. Commissions continue for as long as the referred client remains active.',
    },
    {
        question: 'Is there a limit to referrals?',
        answer: 'No. There is no cap on referrals or commissions.',
    },
    {
        question: 'Do partners need to sell services?',
        answer: 'No. Partners make introductions only. Cynergists manages sales, delivery, and support.',
    },
    {
        question: 'Who is a good fit for this partner program?',
        answer: 'Anyone with access to business decision-makers who values long-term relationships and recurring income.',
    },
];

const steps = [
    {
        step: '01',
        title: 'Apply to the Program',
        description: 'Submit your application to join our partner network.',
    },
    {
        step: '02',
        title: 'Align on Fit',
        description: 'We discuss expectations, fit, and process together.',
    },
    {
        step: '03',
        title: 'Start Introducing',
        description: 'Begin introducing qualified businesses to Cynergists.',
    },
];

const Partners = () => {
    return (
        <Layout>
            <Helmet>
                <title>
                    Partner Program | Cynergists - Earn 20% Residual Commissions
                </title>
                <meta
                    name="description"
                    content="Partner with Cynergists and earn 20% residual commissions by referring businesses to AI Agent services that retain clients long term."
                />
                <link rel="canonical" href="https://cynergists.ai/partners" />
                <meta
                    property="og:title"
                    content="Partner Program | Cynergists - Earn 20% Residual Commissions"
                />
                <meta
                    property="og:description"
                    content="Partner with Cynergists and earn 20% residual commissions by referring businesses to AI Agent services."
                />
                <meta
                    property="og:url"
                    content="https://cynergists.ai/partners"
                />
                <meta property="og:type" content="website" />
                <meta name="twitter:card" content="summary_large_image" />
                <meta
                    name="twitter:title"
                    content="Partner Program | Cynergists - Earn 20% Residual Commissions"
                />
                <meta
                    name="twitter:description"
                    content="Partner with Cynergists and earn 20% residual commissions by referring businesses to AI Agent services."
                />
            </Helmet>
            {/* Hero */}
            <section className="gradient-hero relative overflow-hidden py-24">
                <div className="absolute inset-0">
                    <div className="absolute top-1/4 right-0 h-96 w-96 rounded-full bg-primary/10 blur-3xl" />
                    <div className="absolute bottom-1/3 left-1/4 h-80 w-80 rounded-full bg-secondary/10 blur-3xl" />
                </div>

                <div className="relative z-10 container mx-auto px-4 text-center">
                    <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-2">
                        <Handshake className="h-4 w-4 text-primary" />
                        <span className="text-sm font-medium text-primary">
                            Partner Program
                        </span>
                    </div>
                    <h1 className="font-display mb-6 text-4xl font-bold text-foreground md:text-5xl lg:text-6xl">
                        Partner With{' '}
                        <span className="text-gradient">Cynergists</span>
                    </h1>
                    <p className="mx-auto mb-8 max-w-3xl text-xl text-foreground/80 md:text-2xl">
                        Earn 20% Residual Commissions by Referring Businesses
                        You Already Know
                    </p>
                    <div className="flex flex-col justify-center gap-4 sm:flex-row">
                        <OrbitingButton
                            asChild
                            className="btn-primary group px-8 py-6 text-lg"
                        >
                            <Link
                                href="/contact"
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                Partner With Us!
                                <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                            </Link>
                        </OrbitingButton>
                        <Button
                            asChild
                            variant="outline"
                            className="btn-outline px-8 py-6 text-lg"
                        >
                            <Link
                                href="/partners"
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                Sign In
                            </Link>
                        </Button>
                    </div>
                </div>
            </section>

            {/* Value Proposition */}
            <section className="py-24">
                <div className="container mx-auto px-4">
                    <div className="mx-auto max-w-4xl text-center">
                        <h2 className="font-display mb-6 text-3xl font-bold text-foreground md:text-4xl">
                            Build Recurring Revenue{' '}
                            <span className="text-gradient">
                                Without Selling or Delivering Services
                            </span>
                        </h2>
                        <p className="mb-8 text-lg text-foreground/80">
                            If you already have trusted relationships with
                            business owners, founders, or decision-makers, you
                            are sitting on a recurring income opportunity.
                        </p>
                        <p className="mb-8 text-lg text-foreground/80">
                            Cynergists offers a partner program that pays 20%
                            residual commissions on referred clients. You do not
                            sell services. You do not manage delivery. You do
                            not handle support.
                        </p>
                        <div className="card-glass mx-auto max-w-2xl p-8">
                            <p className="font-display mb-2 text-2xl font-bold text-primary">
                                You introduce. We execute. You earn.
                            </p>
                            <p className="text-muted-foreground">
                                This is a long-term partnership designed to
                                create predictable, ongoing income.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* How It Works */}
            <section className="bg-card/30 py-24">
                <div className="container mx-auto px-4">
                    <div className="mb-16 text-center">
                        <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-2">
                            <Zap className="h-4 w-4 text-primary" />
                            <span className="text-sm font-medium text-primary">
                                How It Works
                            </span>
                        </div>
                        <h2 className="font-display mb-6 text-3xl font-bold text-foreground md:text-4xl">
                            How the Cynergists{' '}
                            <span className="text-gradient">
                                Partner Program
                            </span>{' '}
                            Works
                        </h2>
                        <p className="mx-auto max-w-3xl text-lg text-foreground/80">
                            The Cynergists Partner Program is simple by design.
                        </p>
                    </div>

                    <div className="mx-auto max-w-4xl">
                        <div className="card-glass mb-8 p-8">
                            <p className="mb-6 text-lg text-foreground/80">
                                When you introduce a qualified business to
                                Cynergists and they become a client, you earn{' '}
                                <span className="font-semibold text-primary">
                                    20% recurring commissions
                                </span>{' '}
                                for as long as that client remains active. There
                                are no caps and no expiration dates.
                            </p>
                            <div className="border-l-4 border-primary pl-6">
                                <p className="text-foreground/80 italic">
                                    This is not a one-time referral bonus.
                                    <br />
                                    This is residual income built on real client
                                    retention.
                                </p>
                            </div>
                        </div>

                        <div className="grid gap-6 md:grid-cols-3">
                            {steps.map((step, index) => (
                                <div
                                    key={index}
                                    className="card-glass text-center"
                                >
                                    <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-primary to-secondary">
                                        <span className="font-display text-xl font-bold text-primary-foreground">
                                            {step.step}
                                        </span>
                                    </div>
                                    <h3 className="font-display mb-2 text-xl font-bold text-foreground">
                                        {step.title}
                                    </h3>
                                    <p className="text-muted-foreground">
                                        {step.description}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* Who This Is For */}
            <section className="py-24">
                <div className="container mx-auto px-4">
                    <div className="grid items-center gap-12 lg:grid-cols-2">
                        <div>
                            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-2">
                                <Users className="h-4 w-4 text-primary" />
                                <span className="text-sm font-medium text-primary">
                                    Ideal Partners
                                </span>
                            </div>
                            <h2 className="font-display mb-6 text-3xl font-bold text-foreground md:text-4xl">
                                Who This Partner Program{' '}
                                <span className="text-gradient">Is For</span>
                            </h2>
                            <p className="mb-6 text-lg text-foreground/80">
                                Our best partners are professionals who already
                                advise or support businesses.
                            </p>
                            <p className="mb-8 text-foreground/80">
                                This includes consultants, agencies, technology
                                providers, coaches, community leaders, and
                                operators who regularly speak with business
                                owners about growth, automation, or efficiency.
                            </p>
                            <div className="card-glass p-6">
                                <p className="font-semibold text-primary">
                                    If people already trust you for guidance,
                                    Cynergists gives you a proven solution to
                                    refer.
                                </p>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            {[
                                'Consultants',
                                'Agencies',
                                'Tech Providers',
                                'Coaches',
                                'Community Leaders',
                                'Operators',
                            ].map((role, index) => (
                                <div
                                    key={index}
                                    className="card-glass py-6 text-center"
                                >
                                    <p className="font-display font-semibold text-foreground">
                                        {role}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* What Partners Can Refer */}
            <section className="bg-card/30 py-24">
                <div className="container mx-auto px-4">
                    <div className="mb-16 text-center">
                        <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-2">
                            <Target className="h-4 w-4 text-primary" />
                            <span className="text-sm font-medium text-primary">
                                Referral Services
                            </span>
                        </div>
                        <h2 className="font-display mb-6 text-3xl font-bold text-foreground md:text-4xl">
                            What Partners{' '}
                            <span className="text-gradient">Can Refer</span>
                        </h2>
                        <p className="mx-auto max-w-3xl text-lg text-foreground/80">
                            Partners may refer clients to any Cynergists
                            service, including:
                        </p>
                    </div>

                    <div className="mx-auto mb-12 grid max-w-5xl gap-6 md:grid-cols-2 lg:grid-cols-4">
                        {referralServices.map((service, index) => (
                            <div key={index} className="card-glass text-center">
                                <h3 className="font-display mb-2 text-lg font-bold text-foreground">
                                    {service.title}
                                </h3>
                                <p className="text-sm text-muted-foreground">
                                    {service.description}
                                </p>
                            </div>
                        ))}
                    </div>

                    <div className="text-center">
                        <p className="text-lg text-foreground/80">
                            You make the introduction.{' '}
                            <span className="font-semibold text-primary">
                                Cynergists handles qualification, onboarding,
                                delivery, and support.
                            </span>
                        </p>
                    </div>
                </div>
            </section>

            {/* Why Partners Choose Cynergists */}
            <section className="py-24">
                <div className="container mx-auto px-4">
                    <div className="grid items-center gap-12 lg:grid-cols-2">
                        <div>
                            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-2">
                                <Shield className="h-4 w-4 text-primary" />
                                <span className="text-sm font-medium text-primary">
                                    Why Cynergists
                                </span>
                            </div>
                            <h2 className="font-display mb-6 text-3xl font-bold text-foreground md:text-4xl">
                                Why Partners{' '}
                                <span className="text-gradient">
                                    Choose Cynergists
                                </span>
                            </h2>
                            <p className="mb-6 text-lg text-foreground/80">
                                Most partner programs fail because the services
                                do not retain clients.
                            </p>
                            <p className="mb-6 text-foreground/80">
                                <span className="font-semibold text-primary">
                                    Cynergists is built differently.
                                </span>
                            </p>
                            <p className="mb-8 text-foreground/80">
                                Our services solve real operational problems,
                                which leads to strong retention and consistent
                                recurring revenue. That means partners continue
                                earning month after month.
                            </p>
                            <div className="border-l-4 border-primary pl-6">
                                <p className="text-foreground/80 italic">
                                    This is not about chasing deals.
                                    <br />
                                    It is about building annuity income.
                                </p>
                            </div>
                        </div>
                        <div className="space-y-4">
                            {partnerBenefits.map((benefit, index) => (
                                <div
                                    key={index}
                                    className="card-glass flex items-center gap-4"
                                >
                                    <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-primary/20">
                                        <CheckCircle className="h-5 w-5 text-primary" />
                                    </div>
                                    <p className="font-display font-semibold text-foreground">
                                        {benefit}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* Commission Structure */}
            <section className="bg-card/30 py-24">
                <div className="container mx-auto px-4">
                    <div className="mx-auto max-w-4xl text-center">
                        <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-2">
                            <DollarSign className="h-4 w-4 text-primary" />
                            <span className="text-sm font-medium text-primary">
                                Commission Structure
                            </span>
                        </div>
                        <h2 className="font-display mb-6 text-3xl font-bold text-foreground md:text-4xl">
                            Transparent{' '}
                            <span className="text-gradient">
                                20% Residual Commissions
                            </span>
                        </h2>
                        <p className="mb-8 text-lg text-foreground/80">
                            Partners earn 20% residual commissions on active
                            client revenue.
                        </p>
                        <div className="card-glass p-8">
                            <p className="mb-6 text-foreground/80">
                                Commissions are recurring, transparent, and tied
                                directly to client retention. As long as the
                                client remains active, commissions continue.
                            </p>
                            <div className="grid gap-6 md:grid-cols-3">
                                <div className="text-center">
                                    <TrendingUp className="mx-auto mb-2 h-8 w-8 text-primary" />
                                    <p className="font-semibold text-foreground">
                                        No Tier Resets
                                    </p>
                                </div>
                                <div className="text-center">
                                    <Shield className="mx-auto mb-2 h-8 w-8 text-primary" />
                                    <p className="font-semibold text-foreground">
                                        No Caps
                                    </p>
                                </div>
                                <div className="text-center">
                                    <CheckCircle className="mx-auto mb-2 h-8 w-8 text-primary" />
                                    <p className="font-semibold text-foreground">
                                        No Complicated Payouts
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* How to Become a Partner */}
            <section className="py-24">
                <div className="container mx-auto px-4">
                    <div className="mx-auto max-w-4xl text-center">
                        <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-2">
                            <Handshake className="h-4 w-4 text-primary" />
                            <span className="text-sm font-medium text-primary">
                                Getting Started
                            </span>
                        </div>
                        <h2 className="font-display mb-6 text-3xl font-bold text-foreground md:text-4xl">
                            How to Become a{' '}
                            <span className="text-gradient">
                                Cynergists Partner
                            </span>
                        </h2>
                        <p className="mb-8 text-lg text-foreground/80">
                            Getting started is straightforward.
                        </p>
                        <div className="card-glass mb-8 p-8">
                            <div className="grid gap-8 text-left md:grid-cols-3">
                                <div>
                                    <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-full bg-primary/20">
                                        <span className="font-bold text-primary">
                                            1
                                        </span>
                                    </div>
                                    <p className="text-foreground/80">
                                        Apply to the partner program
                                    </p>
                                </div>
                                <div>
                                    <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-full bg-primary/20">
                                        <span className="font-bold text-primary">
                                            2
                                        </span>
                                    </div>
                                    <p className="text-foreground/80">
                                        Align on fit, expectations, and process
                                    </p>
                                </div>
                                <div>
                                    <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-full bg-primary/20">
                                        <span className="font-bold text-primary">
                                            3
                                        </span>
                                    </div>
                                    <p className="text-foreground/80">
                                        Begin introducing qualified businesses
                                    </p>
                                </div>
                            </div>
                        </div>
                        <p className="text-lg text-foreground/80">
                            Cynergists handles everything else.
                            <br />
                            <span className="font-semibold text-primary">
                                You focus on relationships. We focus on
                                execution.
                            </span>
                        </p>
                    </div>
                </div>
            </section>

            {/* FAQ */}
            <section className="bg-card/30 py-24">
                <div className="container mx-auto px-4">
                    <div className="mb-16 text-center">
                        <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-2">
                            <HelpCircle className="h-4 w-4 text-primary" />
                            <span className="text-sm font-medium text-primary">
                                FAQ
                            </span>
                        </div>
                        <h2 className="font-display mb-6 text-3xl font-bold text-foreground md:text-4xl">
                            Frequently Asked Questions About{' '}
                            <span className="text-gradient">
                                Partnering With Cynergists
                            </span>
                        </h2>
                    </div>

                    <div className="mx-auto max-w-3xl space-y-4">
                        {faqs.map((faq, index) => (
                            <div key={index} className="card-glass">
                                <h3 className="font-display mb-2 text-lg font-bold text-foreground">
                                    {faq.question}
                                </h3>
                                <p className="text-muted-foreground">
                                    {faq.answer}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section className="py-24">
                <div className="container mx-auto px-4">
                    <div className="mx-auto max-w-3xl text-center">
                        <h2 className="font-display mb-6 text-3xl font-bold text-foreground md:text-4xl">
                            Ready to Build{' '}
                            <span className="text-gradient">
                                Recurring Revenue?
                            </span>
                        </h2>
                        <p className="mb-8 text-lg text-foreground/80">
                            If you already have trusted relationships and want
                            to monetize them without selling or delivering
                            services, this program is built for you.
                        </p>
                        <OrbitingButton
                            asChild
                            className="btn-primary group px-8 py-6 text-lg"
                        >
                            <Link
                                href="/contact"
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                Partner With Us!
                                <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                            </Link>
                        </OrbitingButton>
                    </div>
                </div>
            </section>
        </Layout>
    );
};

export default Partners;
