import Layout from '@/components/layout/Layout';
import { OrbitingButton } from '@/components/ui/orbiting-button';
import { Link } from '@inertiajs/react';
import { Linkedin, Twitter, Zap } from 'lucide-react';
import { Helmet } from 'react-helmet';

const teamMembers = [
    {
        name: 'Alex Powers',
        role: 'Founder & CEO',
        bio: 'With 15+ years in operations and strategy, Alex founded Cynergists to bring enterprise-level capabilities to businesses of all sizes.',
        specialties: [
            'Strategic Planning',
            'Business Development',
            'Operations Leadership',
        ],
    },
    {
        name: 'Jordan Shield',
        role: 'Head of Operations',
        bio: 'Jordan brings a decade of experience optimizing processes and building high-performance teams across multiple industries.',
        specialties: [
            'Process Optimization',
            'Team Building',
            'Performance Management',
        ],
    },
    {
        name: 'Taylor Spark',
        role: 'AI Solutions Lead',
        bio: 'A pioneer in business AI applications, Taylor designs and implements cutting-edge automation solutions for our clients.',
        specialties: ['AI Development', 'Automation', 'Machine Learning'],
    },
    {
        name: 'Morgan Bolt',
        role: 'Client Success Director',
        bio: 'Morgan ensures every Cynergists client achieves their goals, bringing warmth and expertise to every engagement.',
        specialties: [
            'Client Relations',
            'Project Management',
            'Strategic Consulting',
        ],
    },
    {
        name: 'Casey Storm',
        role: 'Agent Operations Manager',
        bio: 'Casey orchestrates the deployment and optimization of AI agents, ensuring seamless integration with client workflows.',
        specialties: [
            'Agent Deployment',
            'Workflow Optimization',
            'Client Success',
        ],
    },
    {
        name: 'Riley Thunder',
        role: 'Technical Operations Lead',
        bio: 'Riley bridges the gap between technology and operations, ensuring seamless integration of all our solutions.',
        specialties: [
            'Technical Implementation',
            'Systems Integration',
            'DevOps',
        ],
    },
];

const Team = () => {
    return (
        <Layout>
            <Helmet>
                <title>Our Team | Cynergists - Meet the Experts</title>
                <meta
                    name="description"
                    content="Meet the Cynergists team - experienced professionals in AI agents, automation, and business transformation dedicated to helping your business succeed."
                />
                <link rel="canonical" href="https://cynergists.ai/team" />
                <meta
                    property="og:title"
                    content="Our Team | Cynergists - Meet the Experts"
                />
                <meta
                    property="og:description"
                    content="Meet the Cynergists team - experienced professionals in AI agents, automation, and business transformation dedicated to helping your business succeed."
                />
                <meta property="og:url" content="https://cynergists.ai/team" />
                <meta property="og:type" content="website" />
                <meta name="twitter:card" content="summary_large_image" />
                <meta
                    name="twitter:title"
                    content="Our Team | Cynergists - Meet the Experts"
                />
                <meta
                    name="twitter:description"
                    content="Meet the Cynergists team - experienced professionals in AI agents and business transformation."
                />
            </Helmet>
            {/* Hero */}
            <section className="gradient-hero relative overflow-hidden py-24">
                <div className="absolute inset-0">
                    <div className="absolute top-1/4 left-1/4 h-96 w-96 rounded-full bg-primary/10 blur-3xl" />
                    <div className="absolute right-0 bottom-1/3 h-80 w-80 rounded-full bg-secondary/10 blur-3xl" />
                </div>

                <div className="relative z-10 container mx-auto px-4 text-center">
                    <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-2">
                        <Zap className="h-4 w-4 text-primary" />
                        <span className="text-sm font-medium text-primary">
                            Meet the Team
                        </span>
                    </div>
                    <h1 className="font-display mb-6 text-4xl font-bold text-foreground md:text-5xl">
                        Power Up Your Business with{' '}
                        <span className="text-gradient">Cynergists</span>
                    </h1>
                    <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
                        Our team of superheroes brings together decades of
                        experience in operations, technology, and business
                        transformation.
                    </p>
                </div>
            </section>

            {/* Team Grid */}
            <section className="py-24">
                <div className="container mx-auto px-4">
                    <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                        {teamMembers.map((member, index) => (
                            <div
                                key={member.name}
                                className="card-glass group"
                                style={{ animationDelay: `${index * 0.1}s` }}
                            >
                                {/* Avatar */}
                                <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-primary to-secondary transition-transform duration-300 group-hover:scale-110">
                                    <span className="font-display text-3xl font-bold text-primary-foreground">
                                        {member.name
                                            .split(' ')
                                            .map((n) => n[0])
                                            .join('')}
                                    </span>
                                </div>

                                {/* Info */}
                                <div className="mb-4 text-center">
                                    <h3 className="font-display text-xl font-bold text-foreground">
                                        {member.name}
                                    </h3>
                                    <p className="font-medium text-primary">
                                        {member.role}
                                    </p>
                                </div>

                                <p className="mb-4 text-center text-sm text-muted-foreground">
                                    {member.bio}
                                </p>

                                {/* Specialties */}
                                <div className="mb-6 flex flex-wrap justify-center gap-2">
                                    {member.specialties.map((specialty) => (
                                        <span
                                            key={specialty}
                                            className="rounded-full bg-primary/10 px-3 py-1 text-xs text-primary"
                                        >
                                            {specialty}
                                        </span>
                                    ))}
                                </div>

                                {/* Social Links */}
                                <div className="flex justify-center gap-3">
                                    <a
                                        href="#"
                                        className="flex h-10 w-10 items-center justify-center rounded-full bg-muted text-muted-foreground transition-all duration-300 hover:bg-primary hover:text-primary-foreground"
                                    >
                                        <Linkedin className="h-4 w-4" />
                                    </a>
                                    <a
                                        href="#"
                                        className="flex h-10 w-10 items-center justify-center rounded-full bg-muted text-muted-foreground transition-all duration-300 hover:bg-primary hover:text-primary-foreground"
                                    >
                                        <Twitter className="h-4 w-4" />
                                    </a>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Join the Team CTA */}
            <section className="bg-card/30 py-24">
                <div className="container mx-auto px-4 text-center">
                    <h2 className="font-display mb-4 text-3xl font-bold text-foreground">
                        Want to Join Our Team?
                    </h2>
                    <p className="mx-auto mb-8 max-w-xl text-muted-foreground">
                        We're always looking for talented individuals who share
                        our passion for helping businesses succeed.
                    </p>
                    <OrbitingButton asChild className="btn-primary">
                        <Link
                            href="/contact"
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            View Open Positions
                        </Link>
                    </OrbitingButton>
                </div>
            </section>
        </Layout>
    );
};

export default Team;
