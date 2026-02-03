import Layout from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { router } from '@inertiajs/react';
import {
    ArrowRight,
    CheckCircle,
    Clock,
    DollarSign,
    Globe,
    HeadphonesIcon,
    Repeat,
    Shield,
    TrendingUp,
    Users,
    Zap,
} from 'lucide-react';
import { Helmet } from 'react-helmet';

export default function SignUpPartner() {
    const handleApplyClick = () => {
        router.visit('/signup/partner/apply');
    };

    return (
        <Layout>
            <Helmet>
                <title>
                    Partner Program | Earn Recurring Commissions | Cynergists
                </title>
                <meta
                    name="description"
                    content="Join the Cynergists Partner Program. Earn 20% recurring commissions for the life of every client you refer. No fulfillment, no overhead, just income."
                />
                <meta
                    property="og:title"
                    content="Cynergists Partner Program | Recurring Revenue for Referrals"
                />
                <meta
                    property="og:description"
                    content="Earn 20% monthly recurring commissions by referring businesses to Cynergists. We handle delivery. You collect residuals."
                />
                <meta property="og:type" content="website" />
                <link
                    rel="canonical"
                    href="https://cynergists.ai/signup/partner"
                />
            </Helmet>

            <div className="bg-background">
                {/* Hero Section */}
                <section className="relative overflow-hidden py-20 lg:py-32">
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-background" />
                    <div className="relative z-10 container mx-auto px-4">
                        <div className="mx-auto max-w-4xl text-center">
                            <h1 className="mb-6 text-4xl leading-tight font-bold text-foreground md:text-5xl lg:text-6xl">
                                Turn Your Network Into
                                <span className="text-gradient mt-2 block">
                                    Recurring Revenue
                                </span>
                            </h1>
                            <p className="mx-auto mb-8 max-w-3xl text-xl leading-relaxed text-muted-foreground md:text-2xl">
                                Refer business owners to Cynergists. We handle
                                all the delivery. You earn 20% residual
                                commissions for as long as they stay.
                            </p>
                            <Button
                                size="lg"
                                onClick={handleApplyClick}
                                className="bg-primary px-10 text-base text-primary-foreground hover:bg-primary/90"
                            >
                                Join the Cynergists Partner Program
                                <ArrowRight className="ml-2 h-5 w-5" />
                            </Button>
                            <p className="mt-4 text-sm text-muted-foreground">
                                No fulfillment burden. No client management.
                                Just residual income.
                            </p>
                        </div>
                    </div>
                </section>

                {/* Credibility Strip */}
                <section className="border-y border-border bg-card/50 py-12">
                    <div className="container mx-auto px-4">
                        <div className="grid gap-8 text-center md:grid-cols-3">
                            <div className="space-y-2">
                                <h3 className="text-lg font-semibold text-foreground">
                                    Done-For-You Delivery
                                </h3>
                                <p className="text-muted-foreground">
                                    We handle onboarding, execution, and ongoing
                                    support for every client you refer.
                                </p>
                            </div>
                            <div className="space-y-2">
                                <h3 className="text-lg font-semibold text-foreground">
                                    Full-Service AI Operations
                                </h3>
                                <p className="text-muted-foreground">
                                    AI agents and workflow automation. One
                                    partner relationship covers it all.
                                </p>
                            </div>
                            <div className="space-y-2">
                                <h3 className="text-lg font-semibold text-foreground">
                                    Clients That Stick
                                </h3>
                                <p className="text-muted-foreground">
                                    Our delivery quality keeps clients active
                                    month after month. That means ongoing
                                    commissions for you.
                                </p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* How It Works */}
                <section className="py-20 lg:py-28">
                    <div className="container mx-auto px-4">
                        <div className="mb-16 text-center">
                            <h2 className="mb-4 text-3xl font-bold text-foreground md:text-4xl">
                                How the{' '}
                                <span className="text-gradient">
                                    Partner Program Works
                                </span>
                            </h2>
                            <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
                                Three steps. No complexity. Start earning.
                            </p>
                        </div>

                        <div className="mx-auto grid max-w-5xl gap-8 md:grid-cols-3">
                            <div className="relative">
                                <div className="h-full rounded-2xl border border-border bg-card p-8">
                                    <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-xl bg-primary/20">
                                        <Users className="h-7 w-7 text-primary" />
                                    </div>
                                    <div className="absolute top-4 right-6 text-5xl font-bold text-primary/20">
                                        1
                                    </div>
                                    <h3 className="mb-3 text-xl font-semibold text-foreground">
                                        You Make the Introduction
                                    </h3>
                                    <p className="text-muted-foreground">
                                        Share your unique partner link with
                                        business owners who need operational
                                        support. That is your only job.
                                    </p>
                                </div>
                            </div>

                            <div className="relative">
                                <div className="h-full rounded-2xl border border-border bg-card p-8">
                                    <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-xl bg-primary/20">
                                        <Zap className="h-7 w-7 text-primary" />
                                    </div>
                                    <div className="absolute top-4 right-6 text-5xl font-bold text-primary/20">
                                        2
                                    </div>
                                    <h3 className="mb-3 text-xl font-semibold text-foreground">
                                        We Handle Everything Else
                                    </h3>
                                    <p className="text-muted-foreground">
                                        Cynergists manages onboarding, delivery,
                                        billing, and ongoing client support. You
                                        stay out of the weeds.
                                    </p>
                                </div>
                            </div>

                            <div className="relative">
                                <div className="h-full rounded-2xl border border-border bg-card p-8">
                                    <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-xl bg-primary/20">
                                        <Repeat className="h-7 w-7 text-primary" />
                                    </div>
                                    <div className="absolute top-4 right-6 text-5xl font-bold text-primary/20">
                                        3
                                    </div>
                                    <h3 className="mb-3 text-xl font-semibold text-foreground">
                                        You Earn Every Month
                                    </h3>
                                    <p className="text-muted-foreground">
                                        Receive 20% of the monthly revenue from
                                        every client you refer. For as long as
                                        they remain active.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Commission Breakdown */}
                <section className="border-y border-border bg-card/50 py-20 lg:py-28">
                    <div className="container mx-auto px-4">
                        <div className="mx-auto max-w-4xl">
                            <div className="mb-12 text-center">
                                <h2 className="mb-4 text-3xl font-bold text-foreground md:text-4xl">
                                    The{' '}
                                    <span className="text-gradient">
                                        Commission Structure
                                    </span>
                                </h2>
                                <p className="text-lg text-muted-foreground">
                                    Simple math. Serious upside.
                                </p>
                            </div>

                            <div className="rounded-2xl border border-border bg-background p-8 md:p-12">
                                <div className="mb-10 grid gap-8 md:grid-cols-2">
                                    <div className="text-center md:text-left">
                                        <div className="mb-2 text-6xl font-bold text-primary md:text-7xl">
                                            20%
                                        </div>
                                        <p className="text-xl font-medium text-foreground">
                                            Monthly Recurring Commission
                                        </p>
                                        <p className="mt-2 text-muted-foreground">
                                            On all active client revenue
                                            attributed to your referrals.
                                        </p>
                                    </div>
                                    <div className="space-y-4">
                                        <div className="flex items-start gap-3">
                                            <CheckCircle className="mt-1 h-5 w-5 flex-shrink-0 text-primary" />
                                            <div>
                                                <p className="font-medium text-foreground">
                                                    No Commission Cap
                                                </p>
                                                <p className="text-sm text-muted-foreground">
                                                    Refer as many clients as you
                                                    want.
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-start gap-3">
                                            <CheckCircle className="mt-1 h-5 w-5 flex-shrink-0 text-primary" />
                                            <div>
                                                <p className="font-medium text-foreground">
                                                    Lifetime of the Account
                                                </p>
                                                <p className="text-sm text-muted-foreground">
                                                    Earn as long as the client
                                                    stays active.
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-start gap-3">
                                            <CheckCircle className="mt-1 h-5 w-5 flex-shrink-0 text-primary" />
                                            <div>
                                                <p className="font-medium text-foreground">
                                                    Zero Fulfillment
                                                    Responsibility
                                                </p>
                                                <p className="text-sm text-muted-foreground">
                                                    We do the work. You collect
                                                    the check.
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="border-t border-border pt-8">
                                    <p className="mb-6 text-center text-muted-foreground">
                                        <strong className="text-foreground">
                                            Example:
                                        </strong>{' '}
                                        Refer 5 clients averaging $2,500/month
                                        each. That is $2,500/month in passive
                                        income. Every month. With no delivery
                                        burden.
                                    </p>
                                    <div className="text-center">
                                        <Button
                                            size="lg"
                                            onClick={handleApplyClick}
                                            className="bg-primary px-10 text-base text-primary-foreground hover:bg-primary/90"
                                        >
                                            Apply to the Partner Program
                                            <ArrowRight className="ml-2 h-5 w-5" />
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Who This Is For */}
                <section className="py-20 lg:py-28">
                    <div className="container mx-auto px-4">
                        <div className="mx-auto max-w-4xl">
                            <div className="mb-12 text-center">
                                <h2 className="mb-4 text-3xl font-bold text-foreground md:text-4xl">
                                    Who This{' '}
                                    <span className="text-gradient">
                                        Program Is For
                                    </span>
                                </h2>
                                <p className="text-lg text-muted-foreground">
                                    The right partners make all the difference.
                                </p>
                            </div>

                            <div className="mb-10 grid gap-6 md:grid-cols-2">
                                <div className="rounded-xl border border-border bg-card p-6">
                                    <h3 className="mb-4 flex items-center gap-2 font-semibold text-foreground">
                                        <CheckCircle className="h-5 w-5 text-primary" />
                                        Ideal Partners
                                    </h3>
                                    <ul className="space-y-3 text-muted-foreground">
                                        <li className="flex items-start gap-2">
                                            <span className="mt-1 text-primary">
                                                •
                                            </span>
                                            Consultants and advisors already
                                            serving business owners
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <span className="mt-1 text-primary">
                                                •
                                            </span>
                                            Agencies looking to expand their
                                            service offering without hiring
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <span className="mt-1 text-primary">
                                                •
                                            </span>
                                            Business leaders with clients who
                                            need AI automation
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <span className="mt-1 text-primary">
                                                •
                                            </span>
                                            SaaS advisors, MSPs, and accountants
                                            with trusted client relationships
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <span className="mt-1 text-primary">
                                                •
                                            </span>
                                            Well-connected operators who value
                                            long-term partnerships
                                        </li>
                                    </ul>
                                </div>

                                <div className="rounded-xl border border-border bg-card p-6">
                                    <h3 className="mb-4 flex items-center gap-2 font-semibold text-foreground">
                                        <Shield className="h-5 w-5 text-muted-foreground" />
                                        Not the Right Fit
                                    </h3>
                                    <ul className="space-y-3 text-muted-foreground">
                                        <li className="flex items-start gap-2">
                                            <span className="mt-1 text-muted-foreground">
                                                •
                                            </span>
                                            Mass cold outreach or spam-based
                                            lead generation
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <span className="mt-1 text-muted-foreground">
                                                •
                                            </span>
                                            One-time transaction seekers without
                                            relationship focus
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <span className="mt-1 text-muted-foreground">
                                                •
                                            </span>
                                            Those looking for quick commissions
                                            over quality referrals
                                        </li>
                                    </ul>
                                    <p className="mt-4 text-sm text-muted-foreground/80 italic">
                                        We prioritize partner quality to protect
                                        our clients and your reputation.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Why Cynergists */}
                <section className="border-y border-border bg-card/50 py-20 lg:py-28">
                    <div className="container mx-auto px-4">
                        <div className="mx-auto max-w-4xl">
                            <div className="mb-12 text-center">
                                <h2 className="mb-4 text-3xl font-bold text-foreground md:text-4xl">
                                    Why Partners{' '}
                                    <span className="text-gradient">
                                        Choose Cynergists
                                    </span>
                                </h2>
                                <p className="text-lg text-muted-foreground">
                                    One partnership. Complete operational
                                    coverage.
                                </p>
                            </div>

                            <div className="grid gap-6 md:grid-cols-2">
                                <div className="flex gap-4">
                                    <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg bg-primary/20">
                                        <Globe className="h-6 w-6 text-primary" />
                                    </div>
                                    <div>
                                        <h3 className="mb-2 font-semibold text-foreground">
                                            Global Operations Team
                                        </h3>
                                        <p className="text-muted-foreground">
                                            Fully managed team across multiple
                                            time zones. Your referrals get
                                            coverage when they need it.
                                        </p>
                                    </div>
                                </div>

                                <div className="flex gap-4">
                                    <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg bg-primary/20">
                                        <Zap className="h-6 w-6 text-primary" />
                                    </div>
                                    <div>
                                        <h3 className="mb-2 font-semibold text-foreground">
                                            AI Plus Human Operators
                                        </h3>
                                        <p className="text-muted-foreground">
                                            Automation handles the repetitive
                                            work. Skilled operators handle
                                            everything else.
                                        </p>
                                    </div>
                                </div>

                                <div className="flex gap-4">
                                    <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg bg-primary/20">
                                        <HeadphonesIcon className="h-6 w-6 text-primary" />
                                    </div>
                                    <div>
                                        <h3 className="mb-2 font-semibold text-foreground">
                                            Single Point of Contact
                                        </h3>
                                        <p className="text-muted-foreground">
                                            Your referrals get one relationship
                                            instead of juggling multiple vendors
                                            and contractors.
                                        </p>
                                    </div>
                                </div>

                                <div className="flex gap-4">
                                    <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg bg-primary/20">
                                        <TrendingUp className="h-6 w-6 text-primary" />
                                    </div>
                                    <div>
                                        <h3 className="mb-2 font-semibold text-foreground">
                                            Clients Stay Because Delivery Works
                                        </h3>
                                        <p className="text-muted-foreground">
                                            Low churn means long-term
                                            commissions. We keep clients because
                                            we get results.
                                        </p>
                                    </div>
                                </div>

                                <div className="flex gap-4">
                                    <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg bg-primary/20">
                                        <DollarSign className="h-6 w-6 text-primary" />
                                    </div>
                                    <div>
                                        <h3 className="mb-2 font-semibold text-foreground">
                                            Transparent Commission Tracking
                                        </h3>
                                        <p className="text-muted-foreground">
                                            See exactly what you have earned and
                                            what is coming. No guesswork.
                                        </p>
                                    </div>
                                </div>

                                <div className="flex gap-4">
                                    <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg bg-primary/20">
                                        <Clock className="h-6 w-6 text-primary" />
                                    </div>
                                    <div>
                                        <h3 className="mb-2 font-semibold text-foreground">
                                            Fast Onboarding
                                        </h3>
                                        <p className="text-muted-foreground">
                                            Referred clients are onboarded
                                            quickly. You do not wait months to
                                            start earning.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Final CTA */}
                <section className="py-20 lg:py-28">
                    <div className="container mx-auto px-4">
                        <div className="mx-auto max-w-3xl text-center">
                            <h2 className="mb-6 text-3xl font-bold text-foreground md:text-4xl">
                                Ready to{' '}
                                <span className="text-gradient">
                                    Start Earning?
                                </span>
                            </h2>
                            <p className="mb-8 text-lg text-muted-foreground">
                                Apply to the Cynergists Partner Program and turn
                                your network into recurring revenue.
                            </p>
                            <Button
                                size="lg"
                                onClick={handleApplyClick}
                                className="bg-primary px-10 text-base text-primary-foreground hover:bg-primary/90"
                            >
                                Join the Cynergists Partner Program
                                <ArrowRight className="ml-2 h-5 w-5" />
                            </Button>
                            <p className="mt-4 text-sm text-muted-foreground">
                                Spots are limited to maintain partner quality.
                            </p>
                        </div>
                    </div>
                </section>
            </div>
        </Layout>
    );
}
