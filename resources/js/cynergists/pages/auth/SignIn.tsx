import cynergistsLogo from '@/assets/logos/cynergists-ai-full.webp';
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { PasswordInput } from '@/components/ui/password-input';
import { useToast } from '@/hooks/use-toast';
import { Link, router, usePage } from '@inertiajs/react';
import { Loader2, Mail, Moon, Sun } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet';

// FAQ data for AEO optimization
const signInFaqs = [
    {
        question: 'How do I sign in to my Cynergists account?',
        answer: 'Enter your email address and password on the sign-in page, then click the Sign In button. Alternatively, check the magic link option to receive a secure sign-in link via email—no password required.',
    },
    {
        question: 'What is a magic link and how does it work?',
        answer: 'A magic link is a passwordless sign-in method. When you request one, we send a secure, one-time link to your email. Click the link to instantly access your account without entering a password.',
    },
    {
        question: 'I forgot my password. How do I reset it?',
        answer: "Click the 'Forgot password?' link below the sign-in form. Enter your email address, and we'll send you a password reset link. Follow the instructions in the email to create a new password.",
    },
    {
        question: 'How do I create a new Cynergists account?',
        answer: "Click 'Get started' below the sign-in form to access the registration page. Provide your name, email, and create a password. You'll receive a confirmation email to verify your account.",
    },
    {
        question: 'Is my sign-in information secure?',
        answer: 'Yes. Cynergists uses enterprise-grade encryption, secure authentication protocols, and industry-standard security practices. Your password is never stored in plain text, and all data is transmitted over HTTPS.',
    },
];

export default function SignIn() {
    const { url, props } = usePage<{
        auth: {
            user: { id: number } | null;
            roles: string[];
        };
    }>();
    const initialEmail =
        new URLSearchParams(url.split('?')[1] ?? '').get('email') || '';
    const redirectParam = new URLSearchParams(url.split('?')[1] ?? '').get(
        'redirect',
    );
    const [email, setEmail] = useState(initialEmail);
    const [password, setPassword] = useState('');
    const [useMagicLink, setUseMagicLink] = useState(false);
    const [loading, setLoading] = useState(false);
    const [checkingSession, setCheckingSession] = useState(true);
    const [redirecting, setRedirecting] = useState(false);
    const [darkMode, setDarkMode] = useState(true);
    const { toast } = useToast();

    useEffect(() => {
        if (props.auth?.user && !redirecting) {
            setRedirecting(true);
            router.visit(resolveRedirectForRoles(props.auth.roles ?? []));
            return;
        }

        setCheckingSession(false);
    }, [props.auth, redirecting]);

    const resolveRedirectForRoles = (roles: string[]) => {
        if (roles.includes('admin')) return '/admin/dashboard';
        if (roles.includes('sales_rep')) return '/sales-rep';
        if (roles.includes('employee')) return '/employee';
        if (roles.includes('partner') && !roles.includes('client'))
            return '/partner';
        return '/';
    };

    const handleSignIn = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        if (useMagicLink) {
            toast({
                title: 'Magic link not available yet',
                description:
                    'Please sign in with your password while we migrate authentication.',
            });
            setLoading(false);
            return;
        }

        const redirectTarget =
            sessionStorage.getItem('checkout_redirect') ||
            sessionStorage.getItem('redirect_after_login') ||
            redirectParam ||
            undefined;

        router.post(
            '/signin',
            {
                email,
                password,
                remember: true,
                redirect: redirectTarget,
            },
            {
                onSuccess: () => {
                    sessionStorage.removeItem('checkout_redirect');
                    sessionStorage.removeItem('redirect_after_login');
                },
                onError: (errors) => {
                    const message =
                        Object.values(errors)[0] ||
                        'Please check your credentials and try again.';

                    toast({
                        title: 'Sign in failed',
                        description: message,
                        variant: 'destructive',
                    });
                },
                onFinish: () => setLoading(false),
            },
        );
    };

    if (checkingSession || redirecting) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-background">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    // JSON-LD structured data for SEO
    const webPageSchema = {
        '@context': 'https://schema.org',
        '@type': 'WebPage',
        name: 'Sign In to Cynergists Client Portal',
        description:
            'Securely sign in to your Cynergists account to access your dashboard, manage services, and view project updates.',
        url: '/signin',
        isPartOf: {
            '@type': 'WebSite',
            name: 'Cynergists',
            url: '/',
        },
        breadcrumb: {
            '@type': 'BreadcrumbList',
            itemListElement: [
                {
                    '@type': 'ListItem',
                    position: 1,
                    name: 'Home',
                    item: '/',
                },
                {
                    '@type': 'ListItem',
                    position: 2,
                    name: 'Sign In',
                    item: '/signin',
                },
            ],
        },
    };

    const organizationSchema = {
        '@context': 'https://schema.org',
        '@type': 'Organization',
        name: 'Cynergists',
        url: '/',
        logo: '/favicon.png',
        description:
            'AI Agents that take full ownership of revenue, operations, and internal workflows to help businesses scale.',
        contactPoint: {
            '@type': 'ContactPoint',
            contactType: 'Customer Service',
            url: '/contact',
        },
        sameAs: ['/'],
    };

    const faqSchema = {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: signInFaqs.map((faq) => ({
            '@type': 'Question',
            name: faq.question,
            acceptedAnswer: {
                '@type': 'Answer',
                text: faq.answer,
            },
        })),
    };

    return (
        <>
            <Helmet>
                {/* Primary Meta Tags */}
                <title>
                    Sign In to Your Account | Cynergists Client Portal
                </title>
                <meta
                    name="description"
                    content="Securely sign in to your Cynergists account. Access your dashboard, manage AI agents, and view performance in one place."
                />
                <link rel="canonical" href="/signin" />

                {/* Open Graph / Facebook */}
                <meta property="og:type" content="website" />
                <meta property="og:url" content="/signin" />
                <meta
                    property="og:title"
                    content="Sign In to Your Account | Cynergists Client Portal"
                />
                <meta
                    property="og:description"
                    content="Securely sign in to your Cynergists account. Access your dashboard, manage AI agents, and view performance."
                />
                <meta property="og:site_name" content="Cynergists" />

                {/* Twitter */}
                <meta name="twitter:card" content="summary" />
                <meta name="twitter:url" content="/signin" />
                <meta
                    name="twitter:title"
                    content="Sign In to Your Account | Cynergists Client Portal"
                />
                <meta
                    name="twitter:description"
                    content="Securely sign in to your Cynergists account. Access your dashboard, manage AI agents, and view performance."
                />

                {/* Indexing */}
                <meta name="robots" content="index, follow" />

                {/* JSON-LD Structured Data */}
                <script type="application/ld+json">
                    {JSON.stringify(webPageSchema)}
                </script>
                <script type="application/ld+json">
                    {JSON.stringify(organizationSchema)}
                </script>
                <script type="application/ld+json">
                    {JSON.stringify(faqSchema)}
                </script>
            </Helmet>

            <div
                className={`flex min-h-screen items-center justify-center p-4 ${darkMode ? 'bg-background' : 'bg-slate-100'}`}
            >
                {/* Theme toggle */}
                <button
                    onClick={() => setDarkMode(!darkMode)}
                    className="fixed top-4 right-4 rounded-lg border border-border bg-card p-2 transition-colors hover:bg-muted"
                    aria-label="Toggle theme"
                >
                    {darkMode ? (
                        <Sun className="h-5 w-5 text-foreground" />
                    ) : (
                        <Moon className="h-5 w-5 text-slate-700" />
                    )}
                </button>

                <div
                    className={`w-full max-w-md ${darkMode ? 'border-border bg-card' : 'border-slate-200 bg-white'} rounded-2xl border p-8 shadow-xl`}
                >
                    {/* Logo */}
                    <div className="mb-8 flex justify-center">
                        <img
                            src={cynergistsLogo}
                            alt="Cynergists"
                            className="h-12 w-auto"
                        />
                    </div>

                    {/* Header */}
                    <header className="mb-8 text-center">
                        <h1
                            className={`mb-2 text-2xl font-bold ${darkMode ? 'text-foreground' : 'text-slate-900'}`}
                        >
                            Sign In to Your Cynergists Account
                        </h1>
                        <p
                            className={`text-sm ${darkMode ? 'text-muted-foreground' : 'text-slate-600'}`}
                        >
                            Access your client dashboard, AI agents, and
                            analytics securely.
                        </p>
                    </header>

                    {/* Form */}
                    <form onSubmit={handleSignIn} className="space-y-5">
                        <div className="space-y-2">
                            <Label
                                htmlFor="email"
                                className={
                                    darkMode
                                        ? 'text-foreground'
                                        : 'text-slate-700'
                                }
                            >
                                Email
                            </Label>
                            <Input
                                id="email"
                                name="email"
                                type="email"
                                autoComplete="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="you@company.com"
                                required
                                className={
                                    darkMode
                                        ? 'border-border bg-input text-foreground'
                                        : 'border-slate-300 bg-white text-slate-900'
                                }
                            />
                        </div>

                        {!useMagicLink && (
                            <div className="space-y-2">
                                <Label
                                    htmlFor="password"
                                    className={
                                        darkMode
                                            ? 'text-foreground'
                                            : 'text-slate-700'
                                    }
                                >
                                    Password
                                </Label>
                                <PasswordInput
                                    id="password"
                                    name="password"
                                    autoComplete="current-password"
                                    value={password}
                                    onChange={(e) =>
                                        setPassword(e.target.value)
                                    }
                                    placeholder="••••••••"
                                    required={!useMagicLink}
                                    className={
                                        darkMode
                                            ? 'border-border bg-input text-foreground'
                                            : 'border-slate-300 bg-white text-slate-900'
                                    }
                                />
                            </div>
                        )}

                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                                <Checkbox
                                    id="magic-link"
                                    checked={useMagicLink}
                                    onCheckedChange={(checked) =>
                                        setUseMagicLink(checked as boolean)
                                    }
                                />
                                <Label
                                    htmlFor="magic-link"
                                    className={`cursor-pointer text-sm ${darkMode ? 'text-muted-foreground' : 'text-slate-600'}`}
                                >
                                    <Mail className="mr-1 inline h-3 w-3" />
                                    Send me a secure sign-in link
                                </Label>
                            </div>
                        </div>

                        <Button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-primary py-3 font-semibold text-primary-foreground hover:bg-primary/90"
                        >
                            {loading ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                            ) : useMagicLink ? (
                                'Send Sign-In Link'
                            ) : (
                                'Sign In'
                            )}
                        </Button>
                    </form>

                    {/* Links */}
                    <div className="mt-6 space-y-3 text-center text-sm">
                        <p
                            className={
                                darkMode
                                    ? 'text-muted-foreground'
                                    : 'text-slate-600'
                            }
                        >
                            Don't have an account?{' '}
                            <Link
                                href="/signup/client"
                                className="font-medium text-primary hover:text-primary/80"
                            >
                                Get started →
                            </Link>
                        </p>
                        <Link
                            href="/forgot-password"
                            className={`block ${darkMode ? 'text-muted-foreground hover:text-foreground' : 'text-slate-500 hover:text-slate-700'}`}
                        >
                            Forgot password?
                        </Link>
                    </div>

                    {/* Partner CTA Section */}
                    <aside
                        className={`mt-8 border-t pt-6 ${darkMode ? 'border-border' : 'border-slate-200'}`}
                    >
                        <div
                            className={`rounded-xl p-4 ${darkMode ? 'border border-primary/20 bg-primary/10' : 'border border-primary/10 bg-primary/5'}`}
                        >
                            <h2
                                className={`mb-2 text-sm font-medium ${darkMode ? 'text-foreground' : 'text-slate-900'}`}
                            >
                                Interested in partnering with Cynergists?
                            </h2>
                            <p
                                className={`mb-3 text-xs ${darkMode ? 'text-muted-foreground' : 'text-slate-600'}`}
                            >
                                Earn 20% residual commissions for every client
                                you refer through our partner program.
                            </p>
                            <Link
                                href="/signup/partner"
                                aria-label="Apply to become a Cynergists partner"
                            >
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="w-full border-primary text-primary hover:bg-primary hover:text-primary-foreground"
                                >
                                    Join Our Partner Program →
                                </Button>
                            </Link>
                        </div>
                    </aside>

                    {/* FAQ Section for AEO */}
                    <section
                        className={`mt-8 border-t pt-6 ${darkMode ? 'border-border' : 'border-slate-200'}`}
                        aria-labelledby="faq-heading"
                    >
                        <h2
                            id="faq-heading"
                            className={`mb-4 text-lg font-semibold ${darkMode ? 'text-foreground' : 'text-slate-900'}`}
                        >
                            Frequently Asked Questions
                        </h2>
                        <Accordion
                            type="single"
                            collapsible
                            className="w-full space-y-2"
                        >
                            {signInFaqs.map((faq, index) => (
                                <AccordionItem
                                    key={index}
                                    value={`faq-${index}`}
                                    className={`card-glass rounded-lg px-4 ${darkMode ? 'border-border' : 'border-slate-200'}`}
                                >
                                    <AccordionTrigger className="py-3 text-left text-sm font-medium hover:no-underline data-[state=open]:text-primary">
                                        {faq.question}
                                    </AccordionTrigger>
                                    <AccordionContent className="pb-3 text-sm text-foreground/80">
                                        {faq.answer}
                                    </AccordionContent>
                                </AccordionItem>
                            ))}
                        </Accordion>
                    </section>
                </div>
            </div>
        </>
    );
}
