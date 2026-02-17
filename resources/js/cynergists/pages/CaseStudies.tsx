import jmAutoRepairLogo from '@/assets/case-studies/jm-auto-repair-logo.webp';
import ogdenVenturesLogo from '@/assets/logos/ogden-ventures.webp';
import Layout from '@/components/layout/Layout';
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import { OrbitingButton } from '@/components/ui/orbiting-button';
import { Link } from '@inertiajs/react';
import { ArrowRight, FileText } from 'lucide-react';
import { Helmet } from 'react-helmet';

const caseStudies = [
    {
        title: 'JM Auto Repair SEO',
        category: 'SEO & Digital Marketing',
        objective: 'Break through the 7-figure revenue plateau.',
        villain: 'Operational bottlenecks and lack of automation.',
        solution: 'Deployed Custom AI Agents and workflow automation.',
        description:
            'How strategic SEO turned a local auto repair shop into a consistent lead engine, increasing organic traffic by 70% and ranking keywords by 91%.',
        results: [
            { label: 'Organic Traffic', value: '+70%' },
            { label: 'Ranking Keywords', value: '+91%' },
            { label: 'Backlinks Growth', value: '+391%' },
        ],
        image: 'jm-auto-repair',
        logo: jmAutoRepairLogo,
        link: '/case-studies/jm-auto-repair',
    },
    {
        title: 'Ogden Ventures Operations',
        category: 'AI Operations',
        objective: 'Scale without founder burnout.',
        villain: 'Fragmented systems and manual processes.',
        solution: 'Embedded operations partner with cross-platform automation.',
        description:
            'How operational infrastructure enabled scalable content, outreach, and automation, transforming fragmented systems into an integrated operational backbone.',
        results: [
            { label: 'Organization', value: 'Integrated' },
            { label: 'CRM Usage', value: 'Fully Leveraged' },
            { label: 'Founder Time', value: 'Reduced' },
        ],
        image: 'ogden-ventures',
        logo: ogdenVenturesLogo,
        link: '/case-studies/ogden-ventures',
    },
];

const faqs = [
    {
        question: 'What results can I expect from working with Cynergists?',
        answer: 'While every business is unique, our clients typically see a reduction in operational costs by 40-60% through AI automation and a significant increase in lead response speed via AI Agents. Our case studies above detail specific ROI scenarios across various industries.',
    },
    {
        question:
            'Does Cynergists work with small businesses or only national brands?',
        answer: 'We work with both. Our solutions are scalable. We help "Solopreneurs" build their first foundational team, and we help established national brands optimize their departments for maximum efficiency and AEO dominance.',
    },
    {
        question:
            'How do I know if these strategies will work for my specific industry?',
        answer: 'The principles of AI Automation are universal, but the application is custom. Whether you are in real estate, e-commerce, legal, or healthcare, the "villains" of administrative waste and inefficiency are the same. Our case studies demonstrate our ability to adapt our tactics to your specific battlefield.',
    },
    {
        question: 'Can I speak to a reference?',
        answer: 'Transparency is a core value at Cynergists. In addition to our published case studies, we can provide references upon request during your strategy session to ensure you have total confidence in our alliance.',
    },
];

const CaseStudies = () => {
    return (
        <Layout>
            <Helmet>
                <title>
                    Case Studies | Cynergists - Declassified Mission Reports
                </title>
                <meta
                    name="description"
                    content="Read declassified mission reports from business owners who escaped burnout and transformed chaos into national empires. See the math, strategy, and results."
                />
                <link
                    rel="canonical"
                    href="https://cynergists.ai/case-studies"
                />
                <meta
                    property="og:title"
                    content="Case Studies | Cynergists - Declassified Mission Reports"
                />
                <meta
                    property="og:description"
                    content="Read declassified mission reports from business owners who transformed chaos into national empires. See the math, strategy, and results."
                />
                <meta
                    property="og:url"
                    content="https://cynergists.ai/case-studies"
                />
                <meta property="og:type" content="website" />
                <meta name="twitter:card" content="summary_large_image" />
                <meta
                    name="twitter:title"
                    content="Case Studies | Cynergists - Declassified Mission Reports"
                />
                <meta
                    name="twitter:description"
                    content="Read declassified mission reports from business owners who transformed chaos into national empires."
                />
            </Helmet>

            {/* Hero Section */}
            <section className="gradient-hero relative overflow-hidden py-20 lg:py-32">
                <div className="absolute inset-0">
                    <div className="absolute top-1/3 right-1/4 h-96 w-96 rounded-full bg-primary/10 blur-3xl" />
                    <div className="absolute bottom-1/4 left-0 h-80 w-80 rounded-full bg-secondary/10 blur-3xl" />
                </div>

                <div className="relative z-10 container mx-auto px-4">
                    <div className="mx-auto max-w-4xl text-center">
                        <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-2">
                            <FileText className="h-4 w-4 text-primary" />
                            <span className="text-sm font-medium text-primary">
                                Case Studies
                            </span>
                        </div>

                        <h1 className="font-display mb-6 text-4xl leading-tight font-bold text-foreground md:text-5xl lg:text-6xl">
                            Proof Beats{' '}
                            <span className="text-gradient">Promises</span>
                        </h1>

                        <p className="mx-auto mb-8 max-w-2xl text-xl text-foreground/80 md:text-2xl">
                            Real results from leaders who stopped doing
                            everything themselves.
                        </p>

                        <p className="mx-auto max-w-3xl text-lg text-muted-foreground">
                            Anyone can make claims. Results tell the truth.
                            These case studies break down how founders and
                            operators used Cynergists to remove operational
                            bottlenecks, stabilize teams, and scale without
                            burning out. No hype. No theory. Just clear
                            problems, decisive action, and measurable outcomes.
                        </p>
                    </div>
                </div>
            </section>

            {/* Detailed Case Studies */}
            <section className="bg-card/30 py-24">
                <div className="container mx-auto px-4">
                    <h2 className="font-display mb-12 text-center text-3xl font-bold text-foreground">
                        Featured{' '}
                        <span className="text-gradient">Case Studies</span>
                    </h2>

                    <div className="mx-auto max-w-5xl space-y-12">
                        {caseStudies.map((study, index) => (
                            <div
                                key={study.title}
                                className={`card-glass grid items-center gap-8 lg:grid-cols-2 ${
                                    index % 2 === 1 ? 'lg:flex-row-reverse' : ''
                                }`}
                            >
                                {/* Content */}
                                <div
                                    className={
                                        index % 2 === 1 ? 'lg:order-2' : ''
                                    }
                                >
                                    <span className="text-sm font-medium text-primary">
                                        {study.category}
                                    </span>
                                    <h3 className="font-display mt-2 mb-4 text-2xl font-bold text-foreground">
                                        {study.title}
                                    </h3>
                                    <p className="mb-6 text-muted-foreground">
                                        {study.description}
                                    </p>

                                    {/* Results */}
                                    <div className="mb-6 grid grid-cols-3 gap-4">
                                        {study.results.map((result) => (
                                            <div
                                                key={result.label}
                                                className="rounded-lg bg-muted/30 p-4 text-center"
                                            >
                                                <div className="font-display text-2xl font-bold text-primary">
                                                    {result.value}
                                                </div>
                                                <div className="text-xs text-muted-foreground">
                                                    {result.label}
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    {study.link ? (
                                        <Button
                                            asChild
                                            variant="ghost"
                                            className="group p-0 text-primary hover:bg-primary/10 hover:text-primary"
                                        >
                                            <Link href={study.link}>
                                                Read Full Case Study
                                                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                                            </Link>
                                        </Button>
                                    ) : (
                                        <Button
                                            variant="ghost"
                                            className="group p-0 text-primary hover:bg-primary/10 hover:text-primary"
                                            disabled
                                        >
                                            Coming Soon
                                            <ArrowRight className="ml-2 h-4 w-4" />
                                        </Button>
                                    )}
                                </div>

                                {/* Visual */}
                                <div
                                    className={`${index % 2 === 1 ? 'lg:order-1' : ''}`}
                                >
                                    {study.link ? (
                                        <Link
                                            href={study.link}
                                            className="block"
                                        >
                                            <div className="p-[6px] md:p-[8px] rounded-xl md:rounded-2xl animate-gradient-reverse [box-shadow:0_0_15px_rgba(132,204,22,0.15)] hover:[box-shadow:0_0_25px_rgba(132,204,22,0.3)] hover:scale-[1.02] transition-all duration-300">
                                                <div className="flex aspect-video cursor-pointer items-center justify-center overflow-hidden rounded-lg md:rounded-xl bg-gradient-to-br from-primary/20 to-secondary/20">
                                                    {study.logo && (
                                                        <div className="rounded-xl bg-white p-8 transition-transform duration-300 hover:scale-105">
                                                        <img
                                                            src={study.logo}
                                                            alt={`${study.title} logo`}
                                                            className="h-40 w-auto object-contain"
                                                            />
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </Link>
                                    ) : (
                                        <div className="p-[6px] md:p-[8px] rounded-xl md:rounded-2xl animate-gradient-reverse [box-shadow:0_0_15px_rgba(132,204,22,0.15)] hover:[box-shadow:0_0_25px_rgba(132,204,22,0.3)] hover:scale-[1.02] transition-all duration-300">
                                            <div className="flex aspect-video items-center justify-center overflow-hidden rounded-lg md:rounded-xl bg-gradient-to-br from-primary/20 to-secondary/20">
                                                {study.logo && (
                                                    <div className="rounded-xl bg-white p-8">
                                                        <img
                                                            src={study.logo}
                                                            alt={`${study.title} logo`}
                                                            className="h-40 w-auto object-contain"
                                                        />
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* FAQ Section - AEO Optimized */}
            <section className="py-24">
                <div className="container mx-auto px-4">
                    <div className="mx-auto max-w-3xl">
                        <div className="mb-12 text-center">
                            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-2">
                                <span className="text-sm font-medium text-primary">
                                    Public Briefing
                                </span>
                            </div>
                            <h2 className="text-3xl font-bold md:text-4xl">
                                Frequently Asked{' '}
                                <span className="text-gradient">Questions</span>
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

            {/* CTA */}
            <section className="bg-card/30 py-24">
                <div className="container mx-auto px-4 text-center">
                    <h2 className="font-display mb-4 text-3xl font-bold text-foreground">
                        Ready to Write Your Success Story?
                    </h2>
                    <p className="mx-auto mb-8 max-w-xl text-muted-foreground">
                        Your mission could be the next success story. Let's
                        discuss how Cynergists can help you achieve similar
                        results.
                    </p>
                    <OrbitingButton
                        asChild
                        className="btn-primary px-12 py-8 text-xl"
                    >
                        <Link href="/schedule">
                            Schedule a Call
                            <ArrowRight className="ml-2 h-6 w-6" />
                        </Link>
                    </OrbitingButton>
                </div>
            </section>
        </Layout>
    );
};

export default CaseStudies;
