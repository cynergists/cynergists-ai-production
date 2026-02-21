import cynergistsLogo from '@/assets/logos/cynergists-ai-full.webp';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from '@/components/ui/use-toast';
import { apiClient } from '@/lib/api-client';
import { router } from '@inertiajs/react';
import { AlertCircle, CheckCircle, Eye, EyeOff, Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet';

const ResetPassword = () => {
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    useEffect(() => {
        // Check for error in URL hash
        const hash = window.location.hash;
        if (hash.includes('error=')) {
            const params = new URLSearchParams(hash.substring(1));
            const errorCode = params.get('error_code');
            const errorDescription = params.get('error_description');

            if (errorCode === 'otp_expired') {
                setError(
                    'This password reset link has expired. Please request a new one.',
                );
            } else if (errorDescription) {
                setError(
                    decodeURIComponent(errorDescription.replace(/\+/g, ' ')),
                );
            } else {
                setError(
                    'Invalid or expired reset link. Please request a new one.',
                );
            }
        }
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (password.length < 8) {
            toast({
                title: 'Password too short',
                description: 'Password must be at least 8 characters long.',
                variant: 'destructive',
            });
            return;
        }

        if (password !== confirmPassword) {
            toast({
                title: "Passwords don't match",
                description: 'Please make sure both passwords are the same.',
                variant: 'destructive',
            });
            return;
        }

        setLoading(true);

        try {
            const urlParams = new URLSearchParams(window.location.search);
            await apiClient.post('/password/reset', {
                token: urlParams.get('token'),
                email: urlParams.get('email'),
                password: password,
                password_confirmation: confirmPassword,
            });

            setSuccess(true);
            toast({
                title: 'Password updated',
                description: 'Your password has been successfully reset.',
            });

            // Redirect to sign in after 2 seconds
            setTimeout(() => {
                router.visit('/signin');
                router.visit('/signin');
            }, 2000);
        } catch (err: any) {
            console.error('Password reset error:', err);
            toast({
                title: 'Error resetting password',
                description: err.message || 'An unexpected error occurred.',
                variant: 'destructive',
            });
        } finally {
            setLoading(false);
        }
    };

    // Show error state
    if (error) {
        return (
            <>
                <Helmet>
                    <title>Reset Password Error | Cynergists</title>
                </Helmet>
                <div className="flex min-h-screen items-center justify-center bg-background px-4">
                    <div className="w-full max-w-md space-y-8 text-center">
                        <img
                            src={cynergistsLogo}
                            alt="Cynergists"
                            className="mx-auto h-12"
                        />
                        <div className="rounded-lg border border-border bg-card p-8 shadow-lg">
                            <AlertCircle className="mx-auto mb-4 h-16 w-16 text-destructive" />
                            <h1 className="mb-2 text-2xl font-bold text-foreground">
                                Link Expired
                            </h1>
                            <p className="mb-6 text-muted-foreground">
                                {error}
                            </p>
                            <Button
                                onClick={() => navigate('/forgot-password')}
                                className="w-full"
                            >
                                Request New Reset Link
                            </Button>
                            <Button
                                variant="ghost"
                                onClick={() => navigate('/signin')}
                                className="mt-2 w-full"
                            >
                                Back to Sign In
                            </Button>
                        </div>
                    </div>
                </div>
            </>
        );
    }

    // Show success state
    if (success) {
        return (
            <>
                <Helmet>
                    <title>Password Reset | Cynergists</title>
                </Helmet>
                <div className="flex min-h-screen items-center justify-center bg-background px-4">
                    <div className="w-full max-w-md space-y-8 text-center">
                        <img
                            src={cynergistsLogo}
                            alt="Cynergists"
                            className="mx-auto h-12"
                        />
                        <div className="rounded-lg border border-border bg-card p-8 shadow-lg">
                            <CheckCircle className="mx-auto mb-4 h-16 w-16 text-green-500" />
                            <h1 className="mb-2 text-2xl font-bold text-foreground">
                                Password Updated!
                            </h1>
                            <p className="text-muted-foreground">
                                Redirecting you to sign in...
                            </p>
                        </div>
                    </div>
                </div>
            </>
        );
    }

    // Show password reset form
    return (
        <>
            <Helmet>
                <title>Reset Your Password | Cynergists</title>
                <meta
                    name="description"
                    content="Set a new password for your Cynergists account."
                />
            </Helmet>
            <div className="flex min-h-screen items-center justify-center bg-background px-4">
                <div className="w-full max-w-md space-y-8">
                    <div className="text-center">
                        <img
                            src={cynergistsLogo}
                            alt="Cynergists"
                            className="mx-auto mb-6 h-12"
                        />
                        <h1 className="text-3xl font-bold text-foreground">
                            Reset Your Password
                        </h1>
                        <p className="mt-2 text-muted-foreground">
                            Enter your new password below
                        </p>
                    </div>

                    <form
                        onSubmit={handleSubmit}
                        className="space-y-6"
                        autoComplete="off"
                    >
                        <div className="space-y-2">
                            <Label htmlFor="password">New Password</Label>
                            <div className="relative">
                                <Input
                                    id="password"
                                    type={showPassword ? 'text' : 'password'}
                                    value={password}
                                    onChange={(e) =>
                                        setPassword(e.target.value)
                                    }
                                    placeholder="Enter new password"
                                    required
                                    minLength={8}
                                    className="pr-10"
                                    autoComplete="new-password"
                                />
                                <button
                                    type="button"
                                    onClick={() =>
                                        setShowPassword(!showPassword)
                                    }
                                    className="absolute top-1/2 right-3 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                                >
                                    {showPassword ? (
                                        <EyeOff className="h-4 w-4" />
                                    ) : (
                                        <Eye className="h-4 w-4" />
                                    )}
                                </button>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="confirmPassword">
                                Confirm Password
                            </Label>
                            <div className="relative">
                                <Input
                                    id="confirmPassword"
                                    type={
                                        showConfirmPassword
                                            ? 'text'
                                            : 'password'
                                    }
                                    value={confirmPassword}
                                    onChange={(e) =>
                                        setConfirmPassword(e.target.value)
                                    }
                                    placeholder="Confirm new password"
                                    required
                                    minLength={8}
                                    className="pr-10"
                                    autoComplete="new-password"
                                />
                                <button
                                    type="button"
                                    onClick={() =>
                                        setShowConfirmPassword(
                                            !showConfirmPassword,
                                        )
                                    }
                                    className="absolute top-1/2 right-3 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                                >
                                    {showConfirmPassword ? (
                                        <EyeOff className="h-4 w-4" />
                                    ) : (
                                        <Eye className="h-4 w-4" />
                                    )}
                                </button>
                            </div>
                        </div>

                        <Button
                            type="submit"
                            className="w-full"
                            disabled={loading}
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Updating Password...
                                </>
                            ) : (
                                'Reset Password'
                            )}
                        </Button>
                    </form>

                    <p className="text-center text-sm text-muted-foreground">
                        Remember your password?{' '}
                        <button
                            onClick={() => navigate('/signin')}
                            className="text-primary hover:underline"
                        >
                            Sign in
                        </button>
                    </p>
                </div>
            </div>
        </>
    );
};

export default ResetPassword;
