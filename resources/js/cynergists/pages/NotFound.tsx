import Layout from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Link, usePage } from '@inertiajs/react';
import { ArrowLeft, Home, Phone, Search } from 'lucide-react';
import { useEffect } from 'react';
import { Helmet } from 'react-helmet';

const NotFound = () => {
    const { url } = usePage();
    const pathname = url.split('?')[0];

    useEffect(() => {
        console.error(
            '404 Error: User attempted to access non-existent route:',
            pathname,
        );
    }, [pathname]);

    const popularLinks = [
        { label: 'View Pricing Plans', href: '/marketplace' },
        { label: 'Explore Services', href: '/services' },
        { label: 'Read Case Studies', href: '/case-studies' },
        { label: 'Contact Us', href: '/contact' },
    ];

    return (
        <Layout>
            <Helmet>
                <title>Page Not Found | Cynergists</title>
                <meta
                    name="description"
                    content="The page you're looking for doesn't exist. Explore Cynergists services, pricing, or contact us for help."
                />
                <meta name="robots" content="noindex, follow" />
            </Helmet>

            <section className="flex min-h-[70vh] items-center justify-center py-20">
                <div className="container mx-auto px-4">
                    <div className="mx-auto max-w-2xl text-center">
                        {/* 404 Badge */}
                        <div className="glass mb-8 inline-flex items-center gap-2 rounded-full px-4 py-2">
                            <Search className="h-5 w-5 text-primary" />
                            <span className="text-base font-medium text-primary">
                                Error 404
                            </span>
                        </div>

                        {/* Main Heading */}
                        <h1 className="font-display mb-6 text-5xl font-bold text-foreground md:text-6xl">
                            Mission{' '}
                            <span className="text-gradient">Not Found</span>
                        </h1>

                        <p className="mb-8 text-lg text-muted-foreground md:text-xl">
                            Even the best operatives hit dead ends. The page
                            you're looking for doesn't exist or has been moved.
                            Let's get you back on track.
                        </p>

                        {/* Primary Actions */}
                        <div className="mb-12 flex flex-col justify-center gap-4 sm:flex-row">
                            <Button asChild className="btn-primary">
                                <Link href="/">
                                    <Home className="mr-2 h-5 w-5" />
                                    Return to Base
                                </Link>
                            </Button>
                            <Button
                                asChild
                                variant="outline"
                                className="btn-outline"
                            >
                                <Link href="/schedule">
                                    <Phone className="mr-2 h-5 w-5" />
                                    Schedule a Call
                                </Link>
                            </Button>
                        </div>

                        {/* Popular Links */}
                        <div className="card-glass p-8">
                            <h2 className="mb-4 text-lg font-semibold text-foreground">
                                Popular Destinations
                            </h2>
                            <div className="grid gap-3 sm:grid-cols-2">
                                {popularLinks.map((link) => (
                                    <Link
                                        key={link.href}
                                        href={link.href}
                                        className="flex items-center gap-2 rounded-lg bg-muted/50 p-3 text-muted-foreground transition-colors hover:bg-primary/10 hover:text-primary"
                                    >
                                        <ArrowLeft className="h-4 w-4 rotate-180" />
                                        {link.label}
                                    </Link>
                                ))}
                            </div>
                        </div>

                        {/* Path info for debugging */}
                        <p className="mt-8 text-sm text-muted-foreground/60">
                            Attempted path:{' '}
                            <code className="rounded bg-muted px-2 py-1">
                                {pathname}
                            </code>
                        </p>
                    </div>
                </div>
            </section>
        </Layout>
    );
};

export default NotFound;
