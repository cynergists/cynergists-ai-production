import milpreneurLogo from '@/assets/milpreneur-logo-new.png';
import scalingUpSuccessLogo from '@/assets/scaling-up-success-logo.webp';
import Layout from '@/components/layout/Layout';
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from '@/components/ui/accordion';
import { OrbitingButton } from '@/components/ui/orbiting-button';
import { Link } from '@inertiajs/react';
import { ExternalLink, Mic } from 'lucide-react';
import { Helmet } from 'react-helmet';

const faqs = [
    {
        question: 'What topics does the Cynergists Podcast cover?',
        answer: 'The Cynergists Podcast covers advanced business strategies including AI Agents, Workflow Automation, Remote Team Leadership, and Scale-Up Tactics. It bridges the gap between high-level vision and tactical execution.',
    },
    {
        question: 'Who is the host of the Cynergists Podcast?',
        answer: 'The show features interviews with industry leaders and deep-dive solo episodes focused on solving the operational bottlenecks of growing companies. Hosted by veteran business strategists with hands-on experience scaling national brands.',
    },
    {
        question: 'Why should business owners listen to this podcast?',
        answer: 'Unlike general business shows, this podcast focuses on the "How-To" of scaling. It answers specific questions about leveraging AEO (Answer Engine Optimization), managing global teams, and automating workflows to increase profitability and reclaim time.',
    },
    {
        question: 'Where can I subscribe?',
        answer: 'You can access the Cynergists intelligence feed on Apple Podcasts, Spotify, YouTube, and directly here on our site. Subscribe to ensure you never miss a tactical briefing.',
    },
];

const Podcasts = () => {
    return (
        <Layout>
            <Helmet>
                <title>
                    Cynergists Podcast | Strategic Business Intelligence for
                    Scaling Leaders
                </title>
                <meta
                    name="description"
                    content="Tune into the Cynergists Podcast for operational debriefings on AI Agents, Workflow Automation, and Scale-Up Tactics. Raw, unfiltered conversations with titans building empires."
                />
                <link rel="canonical" href="https://cynergists.ai/podcasts" />
                <meta
                    property="og:title"
                    content="Cynergists Podcast | Strategic Business Intelligence for Scaling Leaders"
                />
                <meta
                    property="og:description"
                    content="Tune into the Cynergists Podcast for operational debriefings on AI Agents, Workflow Automation, and Scale-Up Tactics."
                />
                <meta
                    property="og:url"
                    content="https://cynergists.ai/podcasts"
                />
                <meta property="og:type" content="website" />
                <meta name="twitter:card" content="summary_large_image" />
                <meta
                    name="twitter:title"
                    content="Cynergists Podcast | Strategic Business Intelligence for Scaling Leaders"
                />
                <meta
                    name="twitter:description"
                    content="Tune into the Cynergists Podcast for operational debriefings on AI Agents, Workflow Automation, and Scale-Up Tactics."
                />
                <script type="application/ld+json">
                    {JSON.stringify({
                        '@context': 'https://schema.org',
                        '@type': 'PodcastSeries',
                        name: 'Cynergists Podcast',
                        description:
                            'Operational debriefings with titans building empires. AI Agents, Workflow Automation, and Scale-Up Tactics.',
                        url: 'https://cynergists.ai/podcasts',
                        author: {
                            '@type': 'Organization',
                            name: 'Cynergists',
                        },
                    })}
                </script>
            </Helmet>

            {/* Hero Section */}
            <section className="gradient-hero relative overflow-hidden py-20 lg:py-32">
                <div className="absolute inset-0">
                    <div className="absolute top-1/4 left-0 h-96 w-96 rounded-full bg-primary/10 blur-3xl" />
                    <div className="absolute right-0 bottom-1/4 h-80 w-80 rounded-full bg-secondary/10 blur-3xl" />
                </div>

                <div className="relative z-10 container mx-auto px-4">
                    <div className="mx-auto max-w-4xl text-center">
                        <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-2">
                            <Mic className="h-4 w-4 text-primary" />
                            <span className="text-sm font-medium text-primary">
                                Podcasts
                            </span>
                        </div>

                        <h1 className="font-display mb-6 text-4xl leading-tight font-bold text-foreground md:text-5xl lg:text-6xl">
                            Cut Through{' '}
                            <span className="text-gradient">the Noise</span>
                        </h1>

                        <p className="mx-auto mb-8 max-w-2xl text-xl text-foreground/80 md:text-2xl">
                            Real conversations with operators, founders, and
                            leaders who are actually building.
                        </p>

                        <p className="mx-auto max-w-3xl text-lg text-muted-foreground">
                            Most business podcasts waste your time with hype and
                            recycled advice. The Cynergists Podcast delivers
                            clear, unfiltered discussions on strategy,
                            operations, technology, and leadership—straight from
                            the people doing the work. No fluff. No motivation
                            talk. Just real insight you can use.
                        </p>
                    </div>
                </div>
            </section>

            {/* Scaling Up Success */}
            <section className="bg-card/30 py-24">
                <div className="container mx-auto px-4">
                    <div className="mx-auto max-w-4xl">
                        <div className="card-glass">
                            <div className="mb-6 flex items-center gap-6">
                                <img
                                    src={scalingUpSuccessLogo}
                                    alt="Scaling Up Success Podcast Logo"
                                    className="h-24 w-24 rounded-xl object-contain"
                                />
                                <div>
                                    <h2 className="font-display text-3xl font-bold text-foreground">
                                        Scaling Up Success
                                    </h2>
                                    <p className="font-medium text-primary">
                                        The podcast for founders who want growth
                                        without chaos.
                                    </p>
                                </div>
                            </div>

                            <p className="mb-6 text-muted-foreground">
                                Scaling Up Success is where business owners,
                                operators, and leaders break down what actually
                                works when it comes to scaling revenue, teams,
                                and systems.
                            </p>

                            <p className="mb-6 font-semibold text-foreground">
                                This is not theory.
                            </p>

                            <p className="mb-4 text-muted-foreground">
                                Each episode dives into:
                            </p>
                            <ul className="mb-8 space-y-3">
                                <li className="flex items-start gap-3">
                                    <span className="mt-2 h-2 w-2 flex-shrink-0 rounded-full bg-primary" />
                                    <span className="text-muted-foreground">
                                        How real companies remove bottlenecks
                                    </span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <span className="mt-2 h-2 w-2 flex-shrink-0 rounded-full bg-primary" />
                                    <span className="text-muted-foreground">
                                        Where most founders waste time and money
                                    </span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <span className="mt-2 h-2 w-2 flex-shrink-0 rounded-full bg-primary" />
                                    <span className="text-muted-foreground">
                                        Systems that replace burnout with
                                        leverage
                                    </span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <span className="mt-2 h-2 w-2 flex-shrink-0 rounded-full bg-primary" />
                                    <span className="text-muted-foreground">
                                        Lessons learned from growth, failure,
                                        and rebuilding smarter
                                    </span>
                                </li>
                            </ul>

                            <p className="mb-8 text-muted-foreground">
                                If you are tired of being the busiest person in
                                your company and want to build something that
                                runs without you micromanaging every detail,
                                this show was built for you.
                            </p>

                            <OrbitingButton asChild className="btn-primary">
                                <a
                                    href="https://www.youtube.com/playlist?list=PLRkRAXmHNzjgJgVypqrH5N6rLrKZ0PgZ1"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                >
                                    <ExternalLink className="mr-2 h-4 w-4" />
                                    Watch Scaling Up Success
                                </a>
                            </OrbitingButton>
                        </div>
                    </div>
                </div>
            </section>

            {/* Milpreneur */}
            <section className="py-24">
                <div className="container mx-auto px-4">
                    <div className="mx-auto max-w-4xl">
                        <div className="card-glass">
                            <div className="mb-6 flex items-center gap-6">
                                <img
                                    src={milpreneurLogo}
                                    alt="Milpreneur Podcast Logo"
                                    className="h-24 w-24 rounded-xl object-contain"
                                />
                                <div>
                                    <h2 className="font-display text-3xl font-bold text-foreground">
                                        Milpreneur
                                    </h2>
                                    <p className="font-medium text-secondary">
                                        Built by veterans. For veterans. And for
                                        anyone who respects disciplined
                                        leadership.
                                    </p>
                                </div>
                            </div>

                            <p className="mb-6 text-muted-foreground">
                                Milpreneur highlights the stories of military
                                veterans and disciplined leaders who have
                                transitioned from service to entrepreneurship.
                            </p>

                            <p className="mb-6 font-semibold text-foreground">
                                This podcast is about mindset, mission, and
                                execution.
                            </p>

                            <p className="mb-4 text-muted-foreground">
                                You will hear:
                            </p>
                            <ul className="mb-8 space-y-3">
                                <li className="flex items-start gap-3">
                                    <span className="mt-2 h-2 w-2 flex-shrink-0 rounded-full bg-secondary" />
                                    <span className="text-muted-foreground">
                                        How veterans translate military
                                        discipline into business success
                                    </span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <span className="mt-2 h-2 w-2 flex-shrink-0 rounded-full bg-secondary" />
                                    <span className="text-muted-foreground">
                                        The mental shifts required to go from
                                        orders to ownership
                                    </span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <span className="mt-2 h-2 w-2 flex-shrink-0 rounded-full bg-secondary" />
                                    <span className="text-muted-foreground">
                                        Leadership lessons forged under pressure
                                    </span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <span className="mt-2 h-2 w-2 flex-shrink-0 rounded-full bg-secondary" />
                                    <span className="text-muted-foreground">
                                        Honest conversations about struggle,
                                        identity, and purpose after service
                                    </span>
                                </li>
                            </ul>

                            <p className="mb-2 text-muted-foreground">
                                Milpreneur is not about glorifying war.
                            </p>
                            <p className="mb-8 font-semibold text-foreground">
                                It is about honoring the mindset that wins when
                                the stakes are high.
                            </p>

                            <OrbitingButton asChild className="btn-primary">
                                <a
                                    href="https://www.youtube.com/playlist?list=PLRkRAXmHNzjjzXC4Y7Q8GZcX97qw59a08"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                >
                                    <ExternalLink className="mr-2 h-4 w-4" />
                                    Watch Milpreneur
                                </a>
                            </OrbitingButton>
                        </div>
                    </div>
                </div>
            </section>

            {/* FAQ Section - AEO Optimized */}
            <section className="bg-card/30 py-24">
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
            <section className="py-24">
                <div className="container mx-auto px-4 text-center">
                    <h2 className="font-display mb-4 text-3xl font-bold text-foreground">
                        Want to Be a Guest or Collaborate?
                    </h2>
                    <p className="mx-auto mb-4 max-w-2xl text-muted-foreground">
                        We feature operators, founders, veterans, and leaders
                        who have real experience and real lessons to share.
                    </p>
                    <p className="mx-auto mb-4 max-w-xl text-muted-foreground">
                        If you believe your story belongs in these
                        conversations, reach out.
                    </p>
                    <p className="mb-2 font-semibold text-foreground">
                        This is not about promotion.
                    </p>
                    <p className="mb-8 font-semibold text-primary">
                        It is about contribution.
                    </p>
                    <OrbitingButton asChild className="btn-primary">
                        <Link href="/contact">Get in Touch</Link>
                    </OrbitingButton>
                </div>
            </section>
        </Layout>
    );
};

export default Podcasts;
