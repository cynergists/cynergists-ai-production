import cynergistsLogo from '@/assets/cynergists-logo-new.png';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { PasswordInput } from '@/components/ui/password-input';
import { useToast } from '@/hooks/use-toast';
import { Link, router, usePage } from '@inertiajs/react';
import { Loader2, Moon, Sun } from 'lucide-react';
import { useState } from 'react';
import { Helmet } from 'react-helmet';

export default function Welcome() {
    const { url } = usePage();
    const initialEmail =
        new URLSearchParams(url.split('?')[1] ?? '').get('email') || '';
    const [email, setEmail] = useState(initialEmail);
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [darkMode, setDarkMode] = useState(true);
    const { toast } = useToast();

    const handleSignIn = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        router.post(
            '/signin',
            {
                email,
                password,
                remember: true,
                redirect: '/portal',
            },
            {
                onSuccess: () => {
                    router.visit('/portal');
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

    return (
        <>
            <Helmet>
                <title>Welcome to Cynergists | Sign In</title>
                <meta
                    name="description"
                    content="Welcome to Cynergists! Sign in to access your AI agent dashboard and start transforming your business."
                />
                <link rel="canonical" href="/welcome" />
                <meta name="robots" content="noindex, nofollow" />
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
                            Welcome to Cynergists!
                        </h1>
                        <p
                            className={`text-sm ${darkMode ? 'text-muted-foreground' : 'text-slate-600'}`}
                        >
                            Your account is ready. Sign in with the temporary
                            password from your welcome email.
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

                        <div className="space-y-2">
                            <Label
                                htmlFor="password"
                                className={
                                    darkMode
                                        ? 'text-foreground'
                                        : 'text-slate-700'
                                }
                            >
                                Temporary Password
                            </Label>
                            <PasswordInput
                                id="password"
                                name="password"
                                autoComplete="current-password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="From your welcome email"
                                required
                                className={
                                    darkMode
                                        ? 'border-border bg-input text-foreground'
                                        : 'border-slate-300 bg-white text-slate-900'
                                }
                            />
                            <p
                                className={`text-xs ${darkMode ? 'text-muted-foreground' : 'text-slate-500'}`}
                            >
                                Check your email for the temporary password sent
                                when your account was created.
                            </p>
                        </div>

                        <Button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-primary py-3 font-semibold text-primary-foreground hover:bg-primary/90"
                        >
                            {loading ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                                'Sign In'
                            )}
                        </Button>
                    </form>

                    {/* Links */}
                    <div className="mt-6 space-y-3 text-center text-sm">
                        <Link
                            href="/forgot-password"
                            className={`block ${darkMode ? 'text-muted-foreground hover:text-foreground' : 'text-slate-500 hover:text-slate-700'}`}
                        >
                            Forgot password?
                        </Link>
                    </div>

                    {/* Help section */}
                    <div
                        className={`mt-8 rounded-lg p-4 ${darkMode ? 'bg-muted/50' : 'bg-slate-50'}`}
                    >
                        <p
                            className={`text-sm ${darkMode ? 'text-muted-foreground' : 'text-slate-600'}`}
                        >
                            <strong className="text-foreground">
                                Need help?
                            </strong>{' '}
                            After signing in, we recommend changing your
                            temporary password in your account settings.
                        </p>
                    </div>
                </div>
            </div>
        </>
    );
}
