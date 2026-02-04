import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Link } from '@inertiajs/react';
import {
    BookOpen,
    ExternalLink,
    FileText,
    HelpCircle,
    Mail,
    MessageSquare,
    Video,
} from 'lucide-react';

const supportOptions = [
    {
        title: 'Documentation',
        description: 'Browse our comprehensive guides and tutorials',
        icon: BookOpen,
        href: '#',
        external: true,
    },
    {
        title: 'Video Tutorials',
        description: 'Watch step-by-step video guides',
        icon: Video,
        href: '#',
        external: true,
    },
    {
        title: 'FAQs',
        description: 'Find answers to common questions',
        icon: FileText,
        href: '#',
        external: false,
    },
];

const faqs = [
    {
        question: 'How do I add a new AI agent?',
        answer: "Navigate to 'Browse Agents' to explore available agents. Click 'Get Started' on any agent to add it to your account.",
    },
    {
        question: "Can I customize my agent's responses?",
        answer: 'Yes! Each agent can be customized through its settings. You can adjust tone, knowledge base, and response style.',
    },
    {
        question: 'How is usage calculated?',
        answer: 'Usage is calculated based on the number of messages exchanged with your agents. Each plan includes a monthly message allowance.',
    },
    {
        question: 'Can I share agents with my team?',
        answer: 'Team collaboration features are coming soon! Check our roadmap for the latest updates.',
    },
];

export default function PortalSupport() {
    return (
        <div className="p-8">
            <div className="mb-8">
                <div className="mb-2 flex items-center gap-3">
                    <HelpCircle className="h-8 w-8 text-primary" />
                    <h1 className="text-3xl font-bold text-foreground">
                        Support
                    </h1>
                </div>
                <p className="text-muted-foreground">
                    Get help with your AI agents and account.
                </p>
            </div>

            {/* Contact Support Card */}
            <Card className="mb-8 border-primary/20 bg-primary/5">
                <CardContent className="flex flex-col items-center justify-between gap-4 py-6 md:flex-row">
                    <div className="flex items-center gap-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                            <MessageSquare className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold">
                                Need personalized help?
                            </h3>
                            <p className="text-muted-foreground">
                                Our support team is ready to assist you.
                            </p>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <Button variant="outline" asChild>
                            <a href="mailto:support@cynergists.com">
                                <Mail className="mr-2 h-4 w-4" />
                                Email Support
                            </a>
                        </Button>
                        <Button asChild>
                            <Link href="/schedule">Schedule a Call</Link>
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* Support Resources */}
            <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-3">
                {supportOptions.map((option) => {
                    const Icon = option.icon;
                    return (
                        <Card
                            key={option.title}
                            className="transition-shadow hover:shadow-lg"
                        >
                            <CardHeader>
                                <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                                    <Icon className="h-6 w-6 text-primary" />
                                </div>
                                <CardTitle className="text-lg">
                                    {option.title}
                                </CardTitle>
                                <CardDescription>
                                    {option.description}
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <Button
                                    variant="outline"
                                    className="w-full"
                                    asChild
                                >
                                    <a
                                        href={option.href}
                                        target={
                                            option.external
                                                ? '_blank'
                                                : undefined
                                        }
                                        rel={
                                            option.external
                                                ? 'noopener noreferrer'
                                                : undefined
                                        }
                                    >
                                        {option.external ? (
                                            <>
                                                Open
                                                <ExternalLink className="ml-2 h-4 w-4" />
                                            </>
                                        ) : (
                                            'View'
                                        )}
                                    </a>
                                </Button>
                            </CardContent>
                        </Card>
                    );
                })}
            </div>

            {/* FAQs */}
            <Card>
                <CardHeader>
                    <CardTitle>Frequently Asked Questions</CardTitle>
                    <CardDescription>
                        Quick answers to common questions
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    {faqs.map((faq, index) => (
                        <div
                            key={index}
                            className="border-b border-border pb-4 last:border-0 last:pb-0"
                        >
                            <h4 className="mb-2 font-medium">{faq.question}</h4>
                            <p className="text-sm text-muted-foreground">
                                {faq.answer}
                            </p>
                        </div>
                    ))}
                </CardContent>
            </Card>
        </div>
    );
}
