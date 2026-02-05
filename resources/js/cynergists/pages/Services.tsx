import Layout from '@/components/layout/Layout';
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from '@/components/ui/accordion';
import { OrbitingButton } from '@/components/ui/orbiting-button';
import { Link } from '@inertiajs/react';
import {
    ArrowRight,
    Bot,
    CheckCircle,
    FileText,
    MessageSquare,
    TrendingUp,
    Users,
} from 'lucide-react';
import { Helmet } from 'react-helmet';

const faqs = [
    {
        question: 'How does Cynergists help businesses scale?',
        answer: 'Cynergists helps businesses scale by deploying AI Agents that automate revenue, operations, and internal workflows. Our agents work 24/7 to improve efficiency and reduce overhead.',
    },
    {
        question: 'Are services available outside the United States?',
        answer: 'Yes. Cynergists supports businesses across the United States and internationally.',
    },
    {
        question: 'What kinds of AI Agents do you build?',
        answer: 'We build custom AI Agents for lead capture, sales automation, customer support, research, HR, and more. Each agent is tailored to your specific business needs and integrates with your existing tools.',
    },
    {
        question: 'Is this a consulting service?',
        answer: 'No. Cynergists provides hands-on AI Agent design, deployment, and ongoing management, not just recommendations.',
    },
];

const agentTypes = [
    {
        icon: TrendingUp,
        title: 'Sales Agents',
        description:
            'Automate lead qualification, follow-ups, and pipeline management.',
    },
    {
        icon: MessageSquare,
        title: 'Support Agents',
        description:
            '24/7 customer support that handles tickets and escalates complex issues.',
    },
    {
        icon: FileText,
        title: 'Research Agents',
        description:
            'Deep research for market analysis, competitor tracking, and insights.',
    },
    {
        icon: Users,
        title: 'HR Agents',
        description:
            'Streamline hiring with AI-powered screening and scheduling.',
    },
];

const servicesSchemaData = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: 'AI Agents | Cynergists',
    description:
        'Cynergists designs, deploys, and manages AI Agents that take full ownership of revenue, operations, and internal workflows.',
    url: 'https://cynergists.ai/services',
    mainEntity: {
        '@type': 'Service',
        name: 'AI Agents',
        description:
            'Custom AI Agents built to automate workflows, capture leads, and support day-to-day operations.',
    },
};

const faqSchemaData = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((faq) => ({
        '@type': 'Question',
        name: faq.question,
        acceptedAnswer: {
            '@type': 'Answer',
            text: faq.answer,
        },
    })),
};

const Services = () => {
    return (
        <Layout>
            <Helmet>
                <title>AI Agents | Cynergists</title>
                <meta
                    name="description"
                    content="Cynergists designs, deploys, and manages AI Agents that take full ownership of revenue, operations, and internal workflows."
                />
                <meta
                    name="keywords"
                    content="AI agents, business automation, AI automation, lead capture, sales automation"
                />
                <link rel="canonical" href="https://cynergists.ai/services" />

                <meta property="og:title" content="AI Agents | Cynergists" />
                <meta
                    property="og:description"
                    content="Cynergists designs, deploys, and manages AI Agents that automate your business."
                />
                <meta property="og:type" content="website" />
                <meta
                    property="og:url"
                    content="https://cynergists.ai/services"
                />
                <meta
                    property="og:image"
                    content="https://cynergists.ai/og-image.webp"
                />

                <meta name="twitter:card" content="summary_large_image" />
                <meta name="twitter:title" content="AI Agents | Cynergists" />
                <meta
                    name="twitter:description"
                    content="AI Agents that automate your business."
                />
                <meta
                    name="twitter:image"
                    content="https://cynergists.ai/og-image.webp"
                />

                <script type="application/ld+json">
                    {JSON.stringify(servicesSchemaData)}
                </script>
                <script type="application/ld+json">
                    {JSON.stringify(faqSchemaData)}
                </script>
            </Helmet>

            <main>
                {/* Hero Section */}
                <header
                    className="gradient-hero relative overflow-hidden py-20 lg:py-32"
                    aria-labelledby="services-heading"
                >
                    <div className="absolute inset-0">
                        <div className="absolute top-1/4 right-0 h-96 w-96 rounded-full bg-primary/10 blur-3xl" />
                        <div className="absolute bottom-1/3 left-1/4 h-80 w-80 rounded-full bg-secondary/10 blur-3xl" />
                    </div>

                    <div className="relative z-10 container mx-auto px-4 text-center">
                        <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-2">
                            <Bot
                                className="h-4 w-4 text-primary"
                                aria-hidden="true"
                            />
                            <span className="text-sm font-medium text-primary">
                                AI Agents
                            </span>
                        </div>
                        <h1
                            id="services-heading"
                            className="font-display mb-6 text-4xl font-bold text-foreground md:text-5xl lg:text-6xl"
                        >
                            AI Agents That{' '}
                            <span className="text-gradient">Work For You</span>
                        </h1>
                        <p className="mb-4 text-xl font-medium text-foreground/90 md:text-2xl">
                            Designed, Deployed, and{' '}
                            <span className="text-gradient">
                                Managed by Cynergists
                            </span>
                        </p>
                        <p className="mx-auto max-w-3xl text-lg text-muted-foreground">
                            Cynergists designs, deploys, and manages AI Agents
                            that take full ownership of revenue, operations, and
                            internal workflows. Each agent is built to operate
                            independently and win together.
                        </p>
                    </div>
                </header>

                {/* What Are AI Agents Section */}
                <section className="py-24" aria-labelledby="what-heading">
                    <div className="container mx-auto px-4">
                        <div className="mx-auto max-w-3xl text-center">
                            <h2
                                id="what-heading"
                                className="font-display mb-6 text-3xl font-bold text-foreground md:text-4xl"
                            >
                                What Are{' '}
                                <span className="text-gradient">
                                    AI Agents?
                                </span>
                            </h2>
                            <p className="mb-6 text-lg text-foreground/80">
                                AI Agents are intelligent systems built to
                                automate workflows and support day-to-day
                                operations. Unlike simple chatbots or basic
                                automation, our agents handle complex tasks,
                                make decisions, and integrate seamlessly with
                                your existing tools.
                            </p>
                            <p className="text-muted-foreground">
                                These agents handle repetitive tasks, support
                                structured decision-making, and improve
                                consistency across operations. The result is
                                less manual effort, fewer bottlenecks, and
                                faster execution without disrupting your team.
                            </p>
                        </div>
                    </div>
                </section>

                {/* Agent Types Section */}
                <section
                    className="bg-card/30 py-24"
                    aria-labelledby="types-heading"
                >
                    <div className="container mx-auto px-4">
                        <div className="mb-12 text-center">
                            <h2
                                id="types-heading"
                                className="font-display mb-6 text-3xl font-bold text-foreground md:text-4xl"
                            >
                                Types of{' '}
                                <span className="text-gradient">AI Agents</span>
                            </h2>
                            <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
                                We build custom agents for every part of your
                                business.
                            </p>
                        </div>

                        <div className="mx-auto grid max-w-5xl gap-6 md:grid-cols-2 lg:grid-cols-4">
                            {agentTypes.map((agent, index) => (
                                <div
                                    key={index}
                                    className="card-glass text-center"
                                >
                                    <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-primary/10">
                                        <agent.icon
                                            className="h-7 w-7 text-primary"
                                            aria-hidden="true"
                                        />
                                    </div>
                                    <h3 className="font-display mb-2 text-lg font-bold text-foreground">
                                        {agent.title}
                                    </h3>
                                    <p className="text-sm text-muted-foreground">
                                        {agent.description}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Benefits Section */}
                <section className="py-24" aria-labelledby="benefits-heading">
                    <div className="container mx-auto px-4">
                        <div className="mx-auto grid max-w-5xl items-center gap-12 lg:grid-cols-2">
                            <div>
                                <h2
                                    id="benefits-heading"
                                    className="font-display mb-6 text-3xl font-bold text-foreground md:text-4xl"
                                >
                                    Why Choose{' '}
                                    <span className="text-gradient">
                                        Cynergists AI Agents?
                                    </span>
                                </h2>
                                <p className="mb-6 text-lg text-foreground/80">
                                    Our agents are built for real business use,
                                    not experimentation. We design, deploy, and
                                    manage everything so you can focus on
                                    growth.
                                </p>
                                <p className="font-semibold text-primary">
                                    Zero payroll. Zero burnout. 100% execution.
                                </p>
                            </div>
                            <div className="card-glass p-8">
                                <div className="space-y-4">
                                    {[
                                        'Custom-built for your specific workflows',
                                        'Integrates with your existing tools',
                                        'Operates 24/7 without breaks',
                                        'Scales instantly as you grow',
                                        'Managed and maintained by our team',
                                    ].map((item, index) => (
                                        <div
                                            key={index}
                                            className="flex items-start gap-4"
                                        >
                                            <CheckCircle
                                                className="mt-1 h-6 w-6 flex-shrink-0 text-primary"
                                                aria-hidden="true"
                                            />
                                            <p className="text-foreground/80">
                                                {item}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Who This Is For Section */}
                <section
                    className="bg-card/30 py-24"
                    aria-labelledby="who-heading"
                >
                    <div className="container mx-auto px-4">
                        <div className="mx-auto max-w-4xl">
                            <div className="mb-12 text-center">
                                <h2
                                    id="who-heading"
                                    className="font-display mb-6 text-3xl font-bold text-foreground md:text-4xl"
                                >
                                    Who This Is{' '}
                                    <span className="text-gradient">
                                        Built For
                                    </span>
                                </h2>
                                <p className="text-lg text-foreground/80">
                                    Cynergists AI Agents work best with
                                    businesses that want to automate before
                                    hiring, scale without adding headcount, and
                                    focus on growth instead of operations.
                                </p>
                            </div>

                            <div className="grid gap-6 md:grid-cols-2">
                                {[
                                    'Founders scaling beyond solo operations',
                                    'Small teams stretched across too many roles',
                                    'Companies looking to automate before hiring',
                                    'Leadership teams focused on growth, not admin',
                                ].map((item, index) => (
                                    <div
                                        key={index}
                                        className="card-glass flex items-start gap-4"
                                    >
                                        <CheckCircle
                                            className="mt-1 h-6 w-6 flex-shrink-0 text-primary"
                                            aria-hidden="true"
                                        />
                                        <p className="text-foreground/80">
                                            {item}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </section>

                {/* CTA Section */}
                <section className="py-24" aria-labelledby="cta-heading">
                    <div className="container mx-auto px-4">
                        <div className="mx-auto max-w-3xl text-center">
                            <h2
                                id="cta-heading"
                                className="font-display mb-6 text-3xl font-bold text-foreground md:text-4xl"
                            >
                                Ready to{' '}
                                <span className="text-gradient">
                                    Assemble Your Team?
                                </span>
                            </h2>
                            <p className="mb-8 text-lg text-muted-foreground">
                                Schedule a call to learn how Cynergists AI
                                Agents can automate your business.
                            </p>
                            <div className="flex flex-col justify-center gap-4 sm:flex-row">
                                <OrbitingButton asChild className="btn-primary">
                                    <Link href="/schedule">
                                        Schedule a Call
                                        <ArrowRight className="ml-2 h-4 w-4" />
                                    </Link>
                                </OrbitingButton>
                                <OrbitingButton
                                    asChild
                                    variant="outline"
                                    className="btn-outline"
                                >
                                    <Link href="/marketplace">
                                        View Pricing
                                    </Link>
                                </OrbitingButton>
                            </div>
                        </div>
                    </div>
                </section>

                {/* FAQ Section */}
                <section
                    className="bg-card/30 py-24"
                    aria-labelledby="faq-heading"
                >
                    <div className="container mx-auto px-4">
                        <div className="mx-auto max-w-3xl">
                            <h2
                                id="faq-heading"
                                className="font-display mb-12 text-center text-3xl font-bold text-foreground md:text-4xl"
                            >
                                Frequently Asked{' '}
                                <span className="text-gradient">Questions</span>
                            </h2>

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
            </main>
        </Layout>
    );
};

export default Services;
