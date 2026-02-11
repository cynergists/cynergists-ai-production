import cynergistsLogo from '@/assets/cynergists-logo-new.png';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { PasswordInput } from '@/components/ui/password-input';
import { useToast } from '@/hooks/use-toast';
import { apiClient } from '@/lib/api-client';
import { router, usePage } from '@inertiajs/react';
import { Loader2, Moon, Sun } from 'lucide-react';
import { useState } from 'react';
import { Helmet } from 'react-helmet';

export default function ChangePassword() {
    const { props } = usePage<{
        auth: {
            user: { id: number; name: string } | null;
        };
    }>();
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [darkMode, setDarkMode] = useState(true);
    const { toast } = useToast();

    const handleChangePassword = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        if (newPassword !== confirmPassword) {
            toast({
                title: 'Passwords do not match',
                description: 'Please make sure your new passwords match.',
                variant: 'destructive',
            });
            setLoading(false);
            return;
        }

        if (newPassword.length < 8) {
            toast({
                title: 'Password too short',
                description: 'Password must be at least 8 characters.',
                variant: 'destructive',
            });
            setLoading(false);
            return;
        }

        try {
            await apiClient.patch<{ success: boolean }>(
                '/api/user/password',
                {
                    current_password: currentPassword,
                    password: newPassword,
                    password_confirmation: confirmPassword,
                },
            );

            toast({
                title: 'Password changed!',
                description:
                    'Your password has been updated successfully.',
            });

            // Redirect to portal after successful password change
            router.visit('/portal');
        } catch (error: any) {
            console.error('Password change error:', error);
            console.error('Error response:', error?.response);

            const message =
                error?.response?.data?.message ||
                error?.message ||
                'Failed to change password. Please try again.';

            toast({
                title: 'Password change failed',
                description: message,
                variant: 'destructive',
            });
        } finally {
            setLoading(false);
        }
    };

    // If not authenticated, redirect to sign in
    if (!props.auth?.user) {
        router.visit('/signin');
        return null;
    }

    return (
        <>
            <Helmet>
                <title>Change Your Password | Cynergists</title>
                <meta
                    name="description"
                    content="Change your temporary password to secure your Cynergists account."
                />
                <link rel="canonical" href="/change-password" />
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
                            Change Your Password
                        </h1>
                        <p
                            className={`text-sm ${darkMode ? 'text-muted-foreground' : 'text-slate-600'}`}
                        >
                            Welcome, {props.auth.user.name}! Please create a
                            secure password to continue.
                        </p>
                    </header>

                    {/* Form */}
                    <form onSubmit={handleChangePassword} className="space-y-5">
                        <div className="space-y-2">
                            <Label
                                htmlFor="current-password"
                                className={
                                    darkMode
                                        ? 'text-foreground'
                                        : 'text-slate-700'
                                }
                            >
                                Current (Temporary) Password
                            </Label>
                            <PasswordInput
                                id="current-password"
                                name="current_password"
                                autoComplete="current-password"
                                value={currentPassword}
                                onChange={(e) =>
                                    setCurrentPassword(e.target.value)
                                }
                                placeholder="From your welcome email"
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
                                htmlFor="new-password"
                                className={
                                    darkMode
                                        ? 'text-foreground'
                                        : 'text-slate-700'
                                }
                            >
                                New Password
                            </Label>
                            <PasswordInput
                                id="new-password"
                                name="password"
                                autoComplete="new-password"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                placeholder="At least 8 characters"
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
                                htmlFor="confirm-password"
                                className={
                                    darkMode
                                        ? 'text-foreground'
                                        : 'text-slate-700'
                                }
                            >
                                Confirm New Password
                            </Label>
                            <PasswordInput
                                id="confirm-password"
                                name="password_confirmation"
                                autoComplete="new-password"
                                value={confirmPassword}
                                onChange={(e) =>
                                    setConfirmPassword(e.target.value)
                                }
                                placeholder="Repeat your new password"
                                required
                                className={
                                    darkMode
                                        ? 'border-border bg-input text-foreground'
                                        : 'border-slate-300 bg-white text-slate-900'
                                }
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
                                'Change Password'
                            )}
                        </Button>
                    </form>

                    {/* Help section */}
                    <div
                        className={`mt-8 rounded-lg p-4 ${darkMode ? 'bg-muted/50' : 'bg-slate-50'}`}
                    >
                        <p
                            className={`text-sm ${darkMode ? 'text-muted-foreground' : 'text-slate-600'}`}
                        >
                            <strong className="text-foreground">
                                Password requirements:
                            </strong>{' '}
                            At least 8 characters. Choose a strong, unique
                            password you don't use elsewhere.
                        </p>
                    </div>
                </div>
            </div>
        </>
    );
}
