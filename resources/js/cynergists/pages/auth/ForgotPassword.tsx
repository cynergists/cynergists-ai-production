import cynergistsLogo from '@/assets/cynergists-logo-new.png';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { apiClient } from '@/lib/api-client';
import { getErrorMessage } from '@/lib/logger';
import { Link, usePage } from '@inertiajs/react';
import { ArrowLeft, CheckCircle, Loader2 } from 'lucide-react';
import { useState } from 'react';
import { Helmet } from 'react-helmet';

export default function ForgotPassword() {
    const { url } = usePage();
    const initialEmail =
        new URLSearchParams(url.split('?')[1] ?? '').get('email') || '';
    const [email, setEmail] = useState(initialEmail);
    const [loading, setLoading] = useState(false);
    const [sent, setSent] = useState(false);
    const { toast } = useToast();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            await apiClient.post('/password/email', { email });

            setSent(true);
        } catch (error: unknown) {
            toast({
                title: 'Error',
                description: getErrorMessage(error),
                variant: 'destructive',
            });
        } finally {
            setLoading(false);
        }
    };

    if (sent) {
        return (
            <>
                <Helmet>
                    <title>Check Your Email | Cynergists</title>
                </Helmet>
                <div className="flex min-h-screen items-center justify-center bg-background p-4">
                    <div className="w-full max-w-md rounded-2xl border border-border bg-card p-8 text-center shadow-xl">
                        <div className="mb-6 flex justify-center">
                            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/20">
                                <CheckCircle className="h-8 w-8 text-primary" />
                            </div>
                        </div>
                        <h1 className="mb-4 text-2xl font-bold text-foreground">
                            Check Your Email
                        </h1>
                        <p className="mb-6 text-muted-foreground">
                            We've sent a password reset link to{' '}
                            <strong>{email}</strong>. Click the link in the
                            email to reset your password.
                        </p>
                        <Link
                            href={`/signin?email=${encodeURIComponent(email)}`}
                        >
                            <Button variant="outline" className="border-border">
                                Return to Sign In
                            </Button>
                        </Link>
                    </div>
                </div>
            </>
        );
    }

    return (
        <>
            <Helmet>
                <title>Forgot Password | Cynergists</title>
                <meta
                    name="description"
                    content="Reset your Cynergists account password."
                />
            </Helmet>

            <div className="flex min-h-screen items-center justify-center bg-background p-4">
                <div className="w-full max-w-md rounded-2xl border border-border bg-card p-8 shadow-xl">
                    {/* Back link */}
                    <Link
                        to="/signin"
                        state={{ email }}
                        className="mb-6 inline-flex items-center text-sm text-muted-foreground hover:text-foreground"
                    >
                        <ArrowLeft className="mr-1 h-4 w-4" />
                        Back to sign in
                    </Link>

                    {/* Logo */}
                    <div className="mb-6 flex justify-center">
                        <img
                            src={cynergistsLogo}
                            alt="Cynergists"
                            className="h-10 w-auto"
                        />
                    </div>

                    {/* Header */}
                    <div className="mb-6 text-center">
                        <h1 className="mb-2 text-2xl font-bold text-foreground">
                            Forgot Password
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            Enter your email and we'll send you a reset link.
                        </p>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="you@company.com"
                                required
                                className="border-border bg-input"
                            />
                        </div>

                        <Button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-primary py-3 font-semibold text-primary-foreground hover:bg-primary/90"
                        >
                            {loading ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                                'Send Reset Link'
                            )}
                        </Button>
                    </form>
                </div>
            </div>
        </>
    );
}
