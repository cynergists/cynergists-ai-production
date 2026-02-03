import Layout from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { OrbitingButton } from '@/components/ui/orbiting-button';
import { Link } from '@inertiajs/react';
import {
    ArrowLeft,
    ArrowRight,
    Bot,
    Check,
    Plug,
    ShoppingCart,
} from 'lucide-react';
import { Helmet } from 'react-helmet';

const AIAgentTemplate = () => {
    return (
        <Layout>
            <Helmet>
                <title>AI Agent Template | Cynergists</title>
                <meta
                    name="description"
                    content="Standardized AI Agent page template"
                />
            </Helmet>

            {/* Admin Notice Banner */}
            <div className="border-b border-primary/30 bg-primary/10 py-3">
                <div className="container mx-auto flex items-center justify-between px-4">
                    <div className="flex items-center gap-2 text-sm text-primary">
                        <Bot className="h-4 w-4" />
                        <span className="font-medium">Template Preview</span>
                        <span className="text-muted-foreground">
                            — This is how all AI Agent pages will appear
                        </span>
                    </div>
                    <Button asChild variant="outline" size="sm">
                        <Link href="/admin/client-portal/agents">
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Back to AI Agents
                        </Link>
                    </Button>
                </div>
            </div>

            {/* Hero Section - Image Left, Details Right */}
            <section className="gradient-hero py-20 lg:py-32">
                <div className="container mx-auto px-4">
                    <div className="mx-auto grid max-w-6xl items-center gap-12 lg:grid-cols-2">
                        {/* Left - Image/Visual */}
                        <div className="order-2 lg:order-1">
                            <div className="relative flex aspect-video items-center justify-center overflow-hidden rounded-2xl border border-border/50 bg-card/50 shadow-2xl">
                                <div className="p-8 text-center">
                                    <div className="mx-auto mb-4 inline-block rounded-2xl border border-primary/30 bg-primary/10 p-6">
                                        <Bot className="h-12 w-12 text-primary" />
                                    </div>
                                    <h3 className="text-2xl font-bold text-foreground">
                                        AI Agent Image
                                    </h3>
                                    <p className="mt-2 text-muted-foreground">
                                        Upload an agent image or video
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Right - Details */}
                        <div className="order-1 lg:order-2">
                            {/* Category Badge */}
                            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-2">
                                <Bot className="h-4 w-4 text-primary" />
                                <span className="text-sm font-medium text-primary">
                                    Category Name
                                </span>
                            </div>

                            {/* Title */}
                            <h1 className="font-display mb-6 text-3xl leading-tight font-bold text-foreground md:text-4xl lg:text-5xl">
                                AI Agent Name
                            </h1>

                            {/* Description */}
                            <p className="mb-8 text-lg text-foreground/80 md:text-xl">
                                This is the short description that summarizes
                                what the AI Agent does and its key value
                                proposition for the customer.
                            </p>

                            {/* Price */}
                            <div className="mb-8">
                                <span className="text-4xl font-bold text-primary">
                                    $X,XXX
                                </span>
                                <span className="text-lg text-muted-foreground">
                                    /month
                                </span>
                            </div>

                            {/* CTAs */}
                            <div className="flex flex-col gap-4 sm:flex-row">
                                <OrbitingButton className="btn-primary">
                                    <ShoppingCart className="mr-2 h-4 w-4" />
                                    Add to Cart
                                </OrbitingButton>
                                <Button variant="outline">
                                    Schedule a Call
                                    <ArrowRight className="ml-2 h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className="bg-card/30 py-20">
                <div className="container mx-auto px-4">
                    <div className="mx-auto max-w-4xl">
                        <h2 className="mb-12 text-center text-2xl font-bold md:text-3xl">
                            What's{' '}
                            <span className="text-gradient">Included</span>
                        </h2>
                        <div className="grid gap-4 md:grid-cols-2">
                            {[
                                'Feature item one goes here',
                                'Feature item two goes here',
                                'Feature item three goes here',
                                'Feature item four goes here',
                                'Feature item five goes here',
                                'Feature item six goes here',
                            ].map((feature, idx) => (
                                <div
                                    key={idx}
                                    className="flex items-start gap-3 rounded-xl border border-border/50 bg-background/50 p-4"
                                >
                                    <Check className="mt-0.5 h-5 w-5 flex-shrink-0 text-primary" />
                                    <span className="text-foreground/80">
                                        {feature}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* Perfect For & Integrations Section */}
            <section className="py-20">
                <div className="container mx-auto px-4">
                    <div className="mx-auto grid max-w-4xl gap-8 md:grid-cols-2">
                        <div className="card-glass border-primary">
                            <h3 className="mb-4 text-xl font-bold text-foreground">
                                Perfect For
                            </h3>
                            <div className="space-y-3">
                                {[
                                    'Business owners looking to scale',
                                    'Teams needing operational support',
                                    'Companies wanting to automate',
                                ].map((item, idx) => (
                                    <div
                                        key={idx}
                                        className="flex items-start gap-3"
                                    >
                                        <Check className="mt-0.5 h-5 w-5 flex-shrink-0 text-primary" />
                                        <span className="text-foreground/80">
                                            {item}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="card-glass">
                            <h3 className="mb-4 flex items-center gap-2 text-xl font-bold text-foreground">
                                <Plug className="h-5 w-5 text-primary" />
                                Integrations
                            </h3>
                            <div className="space-y-3">
                                {['Slack', 'Zapier', 'Google Workspace'].map(
                                    (item, idx) => (
                                        <div
                                            key={idx}
                                            className="flex items-start gap-3"
                                        >
                                            <Check className="mt-0.5 h-5 w-5 flex-shrink-0 text-primary" />
                                            <span className="text-foreground/80">
                                                {item}
                                            </span>
                                        </div>
                                    ),
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Bottom CTA */}
            <section className="bg-card/30 py-20">
                <div className="container mx-auto px-4 text-center">
                    <h2 className="mb-4 text-2xl font-bold text-foreground">
                        Ready to Get Started?
                    </h2>
                    <p className="mx-auto mb-6 max-w-2xl text-muted-foreground">
                        This is the short description repeated as a final
                        call-to-action for users who scroll to the bottom.
                    </p>
                    <div className="flex flex-col justify-center gap-4 sm:flex-row">
                        <OrbitingButton className="btn-primary">
                            <ShoppingCart className="mr-2 h-4 w-4" />
                            Add to Cart
                        </OrbitingButton>
                        <Button variant="outline">
                            Schedule a Call
                            <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                    </div>
                </div>
            </section>
        </Layout>
    );
};

export default AIAgentTemplate;
