import { Button } from '@/components/ui/button';
import { Head } from '@inertiajs/react';
import {
    ArrowRight,
    ChartColumn,
    Clock,
    FileText,
    Headphones,
    Linkedin,
    Mail,
    MessageSquare,
    Phone,
    Puzzle,
    Scale,
    Search,
    Shield,
    Sparkles,
    Users,
    Zap,
} from 'lucide-react';
import type { CSSProperties, ReactNode } from 'react';

interface Agent {
    name: string;
    title: string;
    mission: string;
    icon: ReactNode;
    colorKey: string;
    capabilities: string[];
    popular?: boolean;
}

const agentVisuals = {
    apex: {
        color: '12 86% 55%',
        gradient: 'linear-gradient(135deg, hsl(12 86% 55%), hsl(350 90% 60%))',
    },
    aether: {
        color: '290 75% 58%',
        gradient: 'linear-gradient(135deg, hsl(290 75% 58%), hsl(325 80% 60%))',
    },
    backbeat: {
        color: '214 82% 55%',
        gradient: 'linear-gradient(135deg, hsl(214 82% 55%), hsl(198 85% 60%))',
    },
    luna: {
        color: '330 75% 58%',
        gradient: 'linear-gradient(135deg, hsl(330 75% 58%), hsl(10 78% 60%))',
    },
    arsenal: {
        color: '160 65% 45%',
        gradient: 'linear-gradient(135deg, hsl(160 65% 45%), hsl(140 70% 55%))',
    },
    carbon: {
        color: '180 55% 42%',
        gradient: 'linear-gradient(135deg, hsl(180 55% 42%), hsl(165 60% 52%))',
    },
    cynessa: {
        color: '262 70% 55%',
        gradient: 'linear-gradient(135deg, hsl(262 70% 55%), hsl(240 70% 60%))',
    },
    libra: {
        color: '85 75% 55%',
        gradient: 'linear-gradient(135deg, hsl(85 75% 55%), hsl(95 70% 50%))',
    },
};

const getAgentVisuals = (colorKey: string) =>
    agentVisuals[colorKey as keyof typeof agentVisuals] || agentVisuals.apex;

const featuredAgents: Agent[] = [
    {
        name: 'Apex',
        title: 'AI Growth Architect & Lead Generation Strategist',
        mission:
            'To automate the top-of-funnel sales process on LinkedIn, ensuring the user is positioned as a thought leader while consistently filling the calendar with qualified meetings.',
        icon: <Linkedin className="h-7 w-7 text-white" />,
        colorKey: 'apex',
        capabilities: [
            'Precision targeting with Sales Navigator filters',
            'Automated connection and follow-up sequences',
            'Algorithm-aware content strategy',
        ],
        popular: true,
    },
    {
        name: 'Aether',
        title: 'AI Omnichannel Architect & Data Orchestrator',
        mission:
            'To ensure the right message reaches the right person at the right time through the right channel, fully automated.',
        icon: <Headphones className="h-7 w-7 text-white" />,
        colorKey: 'aether',
        capabilities: [
            'Nurture sequences and lifecycle orchestration',
            'Two-way CRM and campaign sync',
            'Deliverability and domain health protection',
        ],
        popular: true,
    },
    {
        name: 'Backbeat',
        title: 'AI Lead Response Manager & SDR',
        mission:
            'To eliminate lead leakage with instant, human-like responses that answer questions and book meetings without manual follow-up.',
        icon: <Phone className="h-7 w-7 text-white" />,
        colorKey: 'backbeat',
        capabilities: [
            'Speed-to-lead automation 24/7',
            'Contextual objection handling',
            'Calendar booking and follow-through',
        ],
        popular: true,
    },
    {
        name: 'Luna',
        title: 'Head of Brand, Design & Content',
        mission:
            'To ensure the brand’s visual identity and editorial voice are consistent, scalable, and emotionally resonant across all channels.',
        icon: <FileText className="h-7 w-7 text-white" />,
        colorKey: 'luna',
        capabilities: [
            'Brand bible and visual standards',
            'Editorial calendar planning',
            'Premium creative quality assurance',
        ],
        popular: true,
    },
];

const specializedAgents: Agent[] = [
    {
        name: 'Arsenal',
        title: 'Head of E-Commerce & CRO',
        mission:
            'To create a seamless, high-converting digital storefront that maximizes Revenue Per User.',
        icon: <Mail className="h-7 w-7 text-white" />,
        colorKey: 'arsenal',
        capabilities: [
            'Store build and merchandising strategy',
            'Checkout optimization and conversion lifts',
            'Dynamic pricing and offer testing',
        ],
    },
    {
        name: 'Carbon',
        title: 'Head of Automation & Technical SEO',
        mission:
            'To ensure the technology stack is invisible, frictionless, and infinitely scalable.',
        icon: <Search className="h-7 w-7 text-white" />,
        colorKey: 'carbon',
        capabilities: [
            'Custom automation workflows and syncing',
            'Technical SEO and indexing integrity',
            'System health monitoring and recovery',
        ],
    },
    {
        name: 'Cynessa',
        title: 'AI Client Experience Director & Onboarding Lead',
        mission:
            'To ensure every interaction with the brand feels white-glove and magical, reducing churn through radical empathy.',
        icon: <Users className="h-7 w-7 text-white" />,
        colorKey: 'cynessa',
        capabilities: [
            'Personalized welcome experiences',
            'Churn prediction and re-engagement',
            '24/7 concierge-level support',
        ],
    },
    {
        name: 'Libra',
        title: 'Head of Legal Operations & Compliance',
        mission:
            'To ensure the company scales rapidly without exposing itself to catastrophic risk or liability.',
        icon: <Scale className="h-7 w-7 text-white" />,
        colorKey: 'libra',
        capabilities: [
            'Contract redlines and risk reviews',
            'Compliance audits and opt-in checks',
            'IP and copyright protection scans',
        ],
    },
];

const featurePillars = [
    {
        title: 'Omnichannel Orchestration',
        description:
            'Aether keeps data flowing between CRM, email, SMS, and every outreach touchpoint so nothing slips through.',
        icon: <Zap className="h-6 w-6 text-primary-foreground" />,
    },
    {
        title: 'Precision LinkedIn Outreach',
        description:
            'Apex builds high-value target lists and executes intelligent sequences that fill your calendar consistently.',
        icon: <Shield className="h-6 w-6 text-primary-foreground" />,
    },
    {
        title: 'Conversion Optimization',
        description:
            'Arsenal redesigns storefronts, merchandising, and pricing logic to maximize revenue per visitor.',
        icon: <Puzzle className="h-6 w-6 text-primary-foreground" />,
    },
    {
        title: 'Instant Lead Response',
        description:
            'Backbeat replies instantly with human warmth, resolves objections, and books meetings automatically.',
        icon: <Clock className="h-6 w-6 text-primary-foreground" />,
    },
    {
        title: 'Brand + Content Control',
        description:
            'Luna enforces consistent voice, visuals, and editorial standards across every channel.',
        icon: <MessageSquare className="h-6 w-6 text-primary-foreground" />,
    },
    {
        title: 'System Integrity',
        description:
            'Carbon keeps the stack resilient with automation monitoring, technical SEO, and uptime safeguards.',
        icon: <ChartColumn className="h-6 w-6 text-primary-foreground" />,
    },
];

const agentRoster = [
    { name: 'Aether', role: 'Blogger AI Agent' },
    { name: 'Apex', role: 'LinkedIn Outreach AI Agent' },
    { name: 'Arsenal', role: 'E-commerce AI Agent' },
    { name: 'Backbeat', role: 'Live Avatar Sales Development Manager' },
    { name: 'Beacon', role: 'Webinar & Event AI Agent' },
    { name: 'Briggs', role: 'AI Sales Trainer Agent' },
    { name: 'Carbon', role: 'SEO / GEO / AEO AI Agent' },
    { name: 'Codex', role: 'Grant Writer / RFP Writer AI Agent' },
    { name: 'Cashara', role: 'AI Bookkeeper Agent' },
    { name: 'Cynessa', role: 'Head of Customer Success' },
    { name: 'Cypher', role: 'AI Business Strategist & Systems Architect' },
    { name: 'Libra', role: 'AI Compliance Officer' },
    { name: 'Luna', role: 'Executive Creative Director' },
    { name: 'Optix', role: 'YouTube Strategy & Channel Growth' },
    { name: 'Silk', role: 'Head of Community & Social Engagement' },
    { name: 'Specter', role: 'Website Intelligence & First-Party Data' },
    { name: 'Synchra', role: 'Chief of Staff & Executive Timekeeper' },
    { name: 'Techno', role: 'AI Solutions Architect' },
    { name: 'Titan', role: 'Head of Operations & Process Architecture' },
    { name: 'Vector', role: 'Director of Paid Acquisition & Traffic' },
    { name: 'Voltage', role: 'Director of People & Talent' },
];

const divisions = [
    {
        title: 'Growth Division',
        description: 'High-velocity acquisition and revenue generation.',
        agents: ['Apex', 'Backbeat', 'Vector', 'Arsenal'],
    },
    {
        title: 'Operations Division',
        description: 'Infrastructure, automation, and scale-ready systems.',
        agents: ['Aether', 'Carbon', 'Techno', 'Titan'],
    },
    {
        title: 'Experience Division',
        description: 'Brand, client success, and executive alignment.',
        agents: ['Luna', 'Cynessa', 'Libra', 'Synchra'],
    },
];

const heroStats = [
    { value: '21+', label: 'AI Personas' },
    { value: '24/7', label: 'Always-on Operations' },
    { value: '100%', label: 'Role-specific Specialists' },
    { value: '0', label: 'Manual Follow-ups' },
];

export default function Welcome({ canRegister }: { canRegister: boolean }) {
    return (
        <>
            <Head>
                <title>
                    Cynergists AI - AI Employees for Your Business | Automate
                    Daily Operations
                </title>
                <meta
                    name="description"
                    content="Meet the Cynergists: an elite roster of AI agents that automate outreach, content, compliance, and operations so you can scale faster."
                />
            </Head>

            <div className="min-h-screen bg-background text-foreground flex flex-col items-center">
                <nav className="fixed top-0 right-0 left-0 z-50 w-full border-b border-border/50 bg-background/80 backdrop-blur-xl">
                    <div className="container mx-auto px-6">
                        <div className="flex h-16 items-center justify-between">
                            <div className="flex cursor-pointer items-center gap-2">
                                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-accent">
                                    <span className="text-sm font-bold text-primary-foreground">
                                        AI
                                    </span>
                                </div>
                                <span className="font-display text-xl font-bold text-foreground">
                                    Cynergists AI
                                </span>
                            </div>

                            <div className="hidden items-center gap-8 md:flex">
                                <a
                                    href="#agents"
                                    className="text-muted-foreground transition-colors hover:text-foreground"
                                >
                                    AI Agents
                                </a>
                                <a
                                    href="#features"
                                    className="text-muted-foreground transition-colors hover:text-foreground"
                                >
                                    Capabilities
                                </a>
                                <a
                                    href="#roster"
                                    className="text-muted-foreground transition-colors hover:text-foreground"
                                >
                                    Roster
                                </a>
                                <a
                                    href="#divisions"
                                    className="text-muted-foreground transition-colors hover:text-foreground"
                                >
                                    Divisions
                                </a>
                            </div>

                            <div className="hidden items-center gap-4 md:flex">
                                <Button variant="ghost">Sign In</Button>
                                {canRegister && (
                                    <Button className="bg-gradient-to-r from-primary to-accent text-primary-foreground shadow-lg shadow-primary/30 transition-all duration-300 hover:scale-[1.03] hover:shadow-accent/40">
                                        Get Started Free
                                    </Button>
                                )}
                            </div>

                            <button className="text-foreground md:hidden">
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    width="24"
                                    height="24"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                >
                                    <line x1="4" x2="20" y1="12" y2="12" />
                                    <line x1="4" x2="20" y1="6" y2="6" />
                                    <line x1="4" x2="20" y1="18" y2="18" />
                                </svg>
                            </button>
                        </div>
                    </div>
                </nav>

                <section className="relative flex min-h-screen w-full items-center justify-center overflow-hidden pt-16">
                    <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/20 via-background to-background" />
                    <div className="absolute top-1/4 left-1/4 h-96 w-96 rounded-full bg-primary/30 blur-3xl animate-pulse-glow" />
                    <div
                        className="absolute right-1/4 bottom-1/4 h-96 w-96 rounded-full bg-accent/30 blur-3xl animate-pulse-glow"
                        style={{ animationDelay: '1.5s' }}
                    />
                    <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:64px_64px]" />

                    <div className="container relative z-10 px-6">
                        <div className="mx-auto max-w-4xl text-center">
                            <div className="animate-fade-in mb-8 inline-flex items-center gap-2 rounded-full border border-border/50 bg-secondary/50 px-4 py-2 text-sm text-muted-foreground">
                                <Sparkles className="h-4 w-4 text-primary" />
                                <span>Introducing the Cynergists AI roster</span>
                            </div>

                            <h1
                                className="font-display animate-fade-in mb-6 text-5xl leading-tight font-bold md:text-7xl"
                                style={{ animationDelay: '0.1s' }}
                            >
                                Your Business,{' '}
                                <span className="gradient-text">Automated</span>
                            </h1>

                            <p
                                className="animate-fade-in mx-auto mb-10 max-w-2xl text-xl leading-relaxed text-muted-foreground md:text-2xl"
                                style={{ animationDelay: '0.2s' }}
                            >
                                Meet the AI personas built to run outreach, content,
                                compliance, and operations. Each Cynergist is a
                                specialist with a defined mission and measurable
                                impact.
                            </p>

                            <div
                                className="animate-fade-in mb-16 flex flex-col items-center justify-center gap-4 sm:flex-row"
                                style={{ animationDelay: '0.3s' }}
                            >
                                <Button
                                    size="lg"
                                    className="group h-14 rounded-2xl bg-gradient-to-r from-primary to-accent px-10 text-base text-primary-foreground shadow-lg shadow-primary/30 transition-all duration-300 hover:scale-[1.03] hover:shadow-accent/40"
                                >
                                    Start Free Trial
                                    <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                                </Button>
                                <Button
                                    size="lg"
                                    variant="outline"
                                    className="h-14 rounded-2xl border-border/50 bg-card/50 px-10 text-base backdrop-blur-xl transition-all duration-300 hover:border-primary/50 hover:bg-card/70"
                                >
                                    <span className="flex items-center gap-2">
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            width="20"
                                            height="20"
                                            viewBox="0 0 24 24"
                                            fill="none"
                                            stroke="currentColor"
                                            strokeWidth="2"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                        >
                                            <polygon points="6 3 20 12 6 21 6 3" />
                                        </svg>
                                        Watch Demo
                                    </span>
                                </Button>
                            </div>

                            <div
                                className="animate-fade-in grid grid-cols-2 gap-8 md:grid-cols-4"
                                style={{ animationDelay: '0.4s' }}
                            >
                                {heroStats.map((stat) => (
                                    <div key={stat.label} className="text-center">
                                        <div className="font-display mb-1 text-3xl font-bold text-foreground md:text-4xl">
                                            {stat.value}
                                        </div>
                                        <div className="text-sm text-muted-foreground">
                                            {stat.label}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="absolute top-1/3 left-10 hidden h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-accent text-2xl shadow-lg shadow-primary/30 lg:flex animate-float">
                            🎯
                        </div>
                        <div className="absolute top-1/2 right-10 hidden h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-accent to-primary text-xl shadow-lg shadow-accent/30 lg:flex animate-float-delayed">
                            🧠
                        </div>
                        <div
                            className="absolute bottom-1/3 left-20 hidden h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-accent text-lg shadow-lg shadow-primary/30 lg:flex animate-float"
                            style={{ animationDelay: '1s' }}
                        >
                            ✍️
                        </div>
                        <div className="absolute bottom-1/4 right-20 hidden h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-accent to-primary text-xl shadow-lg shadow-accent/30 lg:flex animate-float-delayed">
                            ⚙️
                        </div>
                    </div>

                    <div className="absolute bottom-8 left-1/2 flex -translate-x-1/2 flex-col items-center gap-2 animate-bounce">
                        <span className="text-sm text-muted-foreground">
                            Scroll to explore
                        </span>
                        <div className="flex h-10 w-6 items-start justify-center rounded-full border-2 border-muted-foreground/30 p-2">
                            <div className="h-3 w-1.5 rounded-full bg-primary animate-pulse" />
                        </div>
                    </div>
                </section>

                <section
                    id="agents"
                    className="relative flex w-full flex-col items-center py-24"
                >
                    <div className="absolute inset-0 bg-gradient-to-b from-background via-secondary/20 to-background" />
                    <div className="container relative z-10 flex flex-col items-center px-6">
                        <div className="mb-16 text-center">
                            <span className="mb-4 inline-block rounded-full bg-primary/10 px-4 py-2 text-sm font-medium text-primary">
                                Meet Your AI Team
                            </span>
                            <h2 className="font-display mb-4 text-4xl font-bold text-foreground md:text-5xl">
                                The Cynergists Core Squad
                            </h2>
                            <p className="mx-auto max-w-2xl text-xl text-muted-foreground">
                                Featured agents with clear missions, proven
                                capabilities, and measurable operational impact.
                            </p>
                        </div>

                        <div className="mb-16 grid w-full max-w-6xl place-items-center gap-6 md:grid-cols-2 lg:grid-cols-4">
                            {featuredAgents.map((agent, index) => {
                                const visuals = getAgentVisuals(agent.colorKey);
                                return (
                                    <div
                                        key={agent.name}
                                        className="glass-card glow-border group flex h-full w-full max-w-sm flex-col rounded-3xl p-6 transition-all duration-500 hover:bg-card/70"
                                        style={
                                            {
                                                '--agent-color': visuals.color,
                                                '--agent-gradient':
                                                    visuals.gradient,
                                        } as CSSProperties
                                        }
                                    >
                                        <div className="mb-6 flex items-start justify-between">
                                            <div className="agent-icon flex h-14 w-14 items-center justify-center rounded-2xl text-white transition-transform duration-300 group-hover:scale-110">
                                                {agent.icon}
                                            </div>
                                            {agent.popular && (
                                                <span className="rounded-full border border-primary/30 bg-primary/20 px-3 py-1 text-xs font-medium text-primary">
                                                    Popular
                                                </span>
                                            )}
                                        </div>

                                        <h3 className="font-display mb-1 text-2xl font-bold text-foreground">
                                            {agent.name}
                                        </h3>
                                        <p className="agent-role mb-4 text-sm font-medium">
                                            {agent.title}
                                        </p>
                                        <p className="mb-6 leading-relaxed text-muted-foreground">
                                            {agent.mission}
                                        </p>

                                        <ul className="mb-6 flex-1 space-y-2">
                                            {agent.capabilities.map((capability) => (
                                                <li
                                                    key={capability}
                                                    className="flex items-center gap-2 text-sm text-muted-foreground"
                                                >
                                                    <div className="agent-dot h-1.5 w-1.5 rounded-full" />
                                                    {capability}
                                                </li>
                                            ))}
                                        </ul>

                                        <Button
                                            variant="outline"
                                            className="agent-outline mt-auto w-full rounded-xl border-border/50 bg-card/50 backdrop-blur-xl transition-all duration-300 hover:bg-card/70"
                                        >
                                            Meet {agent.name}
                                            <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                                        </Button>
                                    </div>
                                );
                            })}
                        </div>

                        <div className="mb-12 text-center">
                            <h3 className="font-display mb-4 text-2xl font-bold text-foreground md:text-3xl">
                                Specialized Commanders
                            </h3>
                            <p className="mx-auto max-w-xl text-muted-foreground">
                                Expand your AI workforce with elite specialists
                                built for revenue, compliance, and client success.
                            </p>
                        </div>

                        <div className="grid w-full max-w-6xl place-items-center gap-6 md:grid-cols-2 lg:grid-cols-4">
                            {specializedAgents.map((agent) => {
                                const visuals = getAgentVisuals(agent.colorKey);
                                return (
                                    <div
                                        key={agent.name}
                                        className="glass-card glow-border group flex h-full w-full max-w-sm flex-col rounded-3xl p-6 transition-all duration-500 hover:bg-card/70"
                                        style={
                                            {
                                                '--agent-color': visuals.color,
                                                '--agent-gradient':
                                                    visuals.gradient,
                                        } as CSSProperties
                                        }
                                    >
                                        <div className="mb-6 flex items-start justify-between">
                                            <div className="agent-icon flex h-14 w-14 items-center justify-center rounded-2xl text-white transition-transform duration-300 group-hover:scale-110">
                                                {agent.icon}
                                            </div>
                                        </div>

                                        <h3 className="font-display mb-1 text-2xl font-bold text-foreground">
                                            {agent.name}
                                        </h3>
                                        <p className="agent-role mb-4 text-sm font-medium">
                                            {agent.title}
                                        </p>
                                        <p className="mb-6 leading-relaxed text-muted-foreground">
                                            {agent.mission}
                                        </p>

                                        <ul className="mb-6 flex-1 space-y-2">
                                            {agent.capabilities.map((capability) => (
                                                <li
                                                    key={capability}
                                                    className="flex items-center gap-2 text-sm text-muted-foreground"
                                                >
                                                    <div className="agent-dot h-1.5 w-1.5 rounded-full" />
                                                    {capability}
                                                </li>
                                            ))}
                                        </ul>

                                        <Button
                                            variant="outline"
                                            className="agent-outline mt-auto w-full rounded-xl border-border/50 bg-card/50 backdrop-blur-xl transition-all duration-300 hover:bg-card/70"
                                        >
                                            Meet {agent.name}
                                            <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                                        </Button>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </section>

                <section
                    id="features"
                    className="flex w-full flex-col items-center py-24"
                >
                    <div className="container w-full px-6">
                        <div className="mb-16 text-center">
                            <span className="mb-4 inline-block rounded-full bg-accent/10 px-4 py-2 text-sm font-medium text-accent">
                                Why the Cynergists
                            </span>
                            <h2 className="font-display mb-4 text-4xl font-bold text-foreground md:text-5xl">
                                Built for Modern Operations
                            </h2>
                            <p className="mx-auto max-w-2xl text-xl text-muted-foreground">
                                Each AI agent is engineered with a clear mission
                                statement and a focused set of capabilities.
                            </p>
                        </div>

                        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                            {featurePillars.map((feature) => (
                                <div
                                    key={feature.title}
                                    className="group flex h-full flex-col rounded-3xl border border-border/50 bg-secondary/30 p-8 transition-all duration-300 hover:border-primary/30 hover:bg-secondary/50"
                                >
                                    <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-accent text-primary-foreground transition-transform duration-300 group-hover:scale-110">
                                        {feature.icon}
                                    </div>
                                    <h3 className="font-display mb-3 text-xl font-bold text-foreground">
                                        {feature.title}
                                    </h3>
                                    <p className="leading-relaxed text-muted-foreground">
                                        {feature.description}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                <section
                    id="roster"
                    className="relative flex w-full flex-col items-center overflow-hidden py-24"
                >
                    <div className="absolute inset-0 bg-gradient-to-b from-background via-secondary/10 to-background" />
                    <div className="container relative z-10 px-6">
                        <div className="mb-16 text-center">
                            <span className="mb-4 inline-block rounded-full bg-primary/10 px-4 py-2 text-sm font-medium text-primary">
                                Full Roster
                            </span>
                            <h2 className="font-display mb-4 text-4xl font-bold text-foreground md:text-5xl">
                                Every Cynergist at a Glance
                            </h2>
                            <p className="mx-auto max-w-2xl text-xl text-muted-foreground">
                                A complete lineup of AI personas spanning growth,
                                operations, legal, creative, and executive support.
                            </p>
                        </div>

                        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
                            {agentRoster.map((agent) => (
                                <div
                                    key={agent.name}
                                    className="glass-card flex h-full flex-col items-center justify-center gap-3 p-6 text-center transition-all duration-300 hover:border-primary/50"
                                >
                                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-secondary/50 text-lg font-semibold text-foreground">
                                        {agent.name.slice(0, 2)}
                                    </div>
                                    <div className="text-sm font-medium text-foreground">
                                        {agent.name}
                                    </div>
                                    <div className="text-xs text-muted-foreground">
                                        {agent.role}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                <section
                    id="divisions"
                    className="relative flex w-full flex-col items-center py-24"
                >
                    <div className="absolute inset-0 bg-gradient-to-b from-background via-primary/5 to-background" />
                    <div className="container relative z-10 px-6">
                        <div className="mb-16 text-center">
                            <span className="mb-4 inline-block rounded-full bg-secondary/50 px-4 py-2 text-sm font-medium text-foreground">
                                Cynergists Divisions
                            </span>
                            <h2 className="font-display mb-4 text-4xl font-bold text-foreground md:text-5xl">
                                Modular AI Teams
                            </h2>
                            <p className="mx-auto max-w-2xl text-xl text-muted-foreground">
                                Deploy focused squads or build the full AI
                                workforce across growth, operations, and
                                experience.
                            </p>
                        </div>

                        <div className="mx-auto grid max-w-6xl gap-8 md:grid-cols-3">
                            {divisions.map((division) => (
                                <div
                                    key={division.title}
                                    className="glass-card flex h-full flex-col rounded-3xl p-8 transition-all duration-300 hover:border-border"
                                >
                                    <div className="mb-6">
                                        <h3 className="font-display mb-2 text-2xl font-bold text-foreground">
                                            {division.title}
                                        </h3>
                                        <p className="text-sm text-muted-foreground">
                                            {division.description}
                                        </p>
                                    </div>
                                    <ul className="mb-8 space-y-3">
                                        {division.agents.map((agent) => (
                                            <li
                                                key={agent}
                                                className="flex items-center gap-3 text-foreground"
                                            >
                                                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary/20 text-xs text-primary">
                                                    •
                                                </span>
                                                {agent}
                                            </li>
                                        ))}
                                    </ul>
                                    <Button
                                        variant="outline"
                                        className="h-12 w-full rounded-2xl border-border/50 bg-card/50 text-base backdrop-blur-xl transition-all duration-300 hover:border-primary/50 hover:bg-card/70"
                                    >
                                        Build This Division
                                    </Button>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                <section className="relative flex w-full flex-col items-center overflow-hidden py-24">
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-accent/10 to-background" />
                    <div className="absolute top-0 left-1/4 h-96 w-96 rounded-full bg-primary/20 blur-3xl" />
                    <div className="absolute bottom-0 right-1/4 h-96 w-96 rounded-full bg-accent/20 blur-3xl" />
                    <div className="container relative z-10 px-6">
                        <div className="mx-auto max-w-4xl text-center">
                            <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-border/50 bg-secondary/50 px-4 py-2 text-sm text-muted-foreground">
                                <Sparkles className="h-4 w-4 text-primary" />
                                <span>Design your AI workforce in minutes</span>
                            </div>
                            <h2 className="font-display mb-6 text-4xl font-bold text-foreground md:text-6xl">
                                Ready to Build Your{' '}
                                <span className="gradient-text">AI Workforce</span>
                                ?
                            </h2>
                            <p className="mb-10 text-xl text-muted-foreground">
                                Deploy the Cynergists that align with your
                                operations, then scale with additional personas
                                as your business grows.
                            </p>
                            <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
                                <Button
                                    size="lg"
                                    className="group h-14 rounded-2xl bg-gradient-to-r from-primary to-accent px-10 text-base text-primary-foreground shadow-lg shadow-primary/30 transition-all duration-300 hover:scale-[1.03] hover:shadow-accent/40"
                                >
                                    Get Started Free
                                    <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                                </Button>
                                <Button
                                    size="lg"
                                    variant="outline"
                                    className="h-14 rounded-2xl border-border/50 bg-card/50 px-10 text-base backdrop-blur-xl transition-all duration-300 hover:border-primary/50 hover:bg-card/70"
                                >
                                    Schedule a Demo
                                </Button>
                            </div>
                        </div>
                    </div>
                </section>

                <footer className="w-full border-t border-border/50 bg-secondary/20">
                    <div className="container px-6 py-16">
                        <div className="grid gap-8 text-center md:grid-cols-6 md:text-left">
                            <div className="md:col-span-2">
                                <div className="mb-4 flex items-center gap-2">
                                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-accent">
                                        <span className="text-sm font-bold text-primary-foreground">
                                            AI
                                        </span>
                                    </div>
                                    <span className="font-display text-xl font-bold text-foreground">
                                        Cynergists AI
                                    </span>
                                </div>
                                <p className="mb-6 max-w-xs text-sm text-muted-foreground">
                                    AI personas engineered to automate outreach,
                                    operations, compliance, and client success.
                                </p>
                                <div className="flex gap-4">
                                    {['𝕏', 'in', '📸', '▶️'].map((icon) => (
                                        <a
                                            key={icon}
                                            href="#"
                                            className="flex h-10 w-10 items-center justify-center rounded-lg border border-border/50 bg-secondary/50 text-muted-foreground transition-all hover:border-primary/50 hover:text-foreground"
                                        >
                                            {icon}
                                        </a>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <h4 className="mb-4 font-semibold text-foreground">
                                    Product
                                </h4>
                                <ul className="space-y-2">
                                    <li>
                                        <a
                                            href="#agents"
                                            className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                                        >
                                            AI Agents
                                        </a>
                                    </li>
                                    <li>
                                        <a
                                            href="#features"
                                            className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                                        >
                                            Capabilities
                                        </a>
                                    </li>
                                    <li>
                                        <a
                                            href="#roster"
                                            className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                                        >
                                            Roster
                                        </a>
                                    </li>
                                    <li>
                                        <a
                                            href="#divisions"
                                            className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                                        >
                                            Divisions
                                        </a>
                                    </li>
                                </ul>
                            </div>

                            <div>
                                <h4 className="mb-4 font-semibold text-foreground">
                                    Company
                                </h4>
                                <ul className="space-y-2">
                                    <li>
                                        <a
                                            href="#"
                                            className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                                        >
                                            About
                                        </a>
                                    </li>
                                    <li>
                                        <a
                                            href="#"
                                            className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                                        >
                                            Blog
                                        </a>
                                    </li>
                                    <li>
                                        <a
                                            href="#"
                                            className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                                        >
                                            Careers
                                        </a>
                                    </li>
                                    <li>
                                        <a
                                            href="#"
                                            className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                                        >
                                            Press
                                        </a>
                                    </li>
                                </ul>
                            </div>

                            <div>
                                <h4 className="mb-4 font-semibold text-foreground">
                                    Resources
                                </h4>
                                <ul className="space-y-2">
                                    <li>
                                        <a
                                            href="#"
                                            className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                                        >
                                            Documentation
                                        </a>
                                    </li>
                                    <li>
                                        <a
                                            href="#"
                                            className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                                        >
                                            API Reference
                                        </a>
                                    </li>
                                    <li>
                                        <a
                                            href="#"
                                            className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                                        >
                                            Case Studies
                                        </a>
                                    </li>
                                    <li>
                                        <a
                                            href="#"
                                            className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                                        >
                                            Community
                                        </a>
                                    </li>
                                </ul>
                            </div>

                            <div>
                                <h4 className="mb-4 font-semibold text-foreground">
                                    Legal
                                </h4>
                                <ul className="space-y-2">
                                    <li>
                                        <a
                                            href="#"
                                            className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                                        >
                                            Privacy Policy
                                        </a>
                                    </li>
                                    <li>
                                        <a
                                            href="#"
                                            className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                                        >
                                            Terms of Service
                                        </a>
                                    </li>
                                    <li>
                                        <a
                                            href="#"
                                            className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                                        >
                                            Security
                                        </a>
                                    </li>
                                </ul>
                            </div>
                        </div>

                        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-border/50 pt-8 md:flex-row">
                            <p className="text-sm text-muted-foreground">
                                © 2026 Cynergists AI. All rights reserved.
                            </p>
                            <div className="flex items-center gap-6">
                                <span className="flex items-center gap-2 text-sm text-muted-foreground">
                                    <span className="h-2 w-2 rounded-full bg-primary animate-pulse" />
                                    All systems operational
                                </span>
                            </div>
                        </div>
                    </div>
                </footer>
            </div>
        </>
    );
}
