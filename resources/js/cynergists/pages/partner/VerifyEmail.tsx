import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { CheckCircle2, Mail, RefreshCw } from 'lucide-react';
import { useState } from 'react';
import { Helmet } from 'react-helmet';
import { toast } from 'sonner';

export default function PartnerVerifyEmail() {
    const [isResending, setIsResending] = useState(false);
    const [resent, setResent] = useState(false);

    const handleResendVerification = async () => {
        setIsResending(true);
        try {
            const {
                data: { user },
            } = await supabase.auth.getUser();
            if (!user?.email) {
                toast.error('Unable to find your email address');
                return;
            }

            const { error } = await supabase.auth.resend({
                type: 'signup',
                email: user.email,
            });

            if (error) throw error;

            setResent(true);
            toast.success('Verification email sent!');
        } catch (error) {
            console.error('Error resending verification:', error);
            toast.error('Failed to resend verification email');
        } finally {
            setIsResending(false);
        }
    };

    return (
        <>
            <Helmet>
                <title>Verify Your Email | Partner Portal | Cynergists</title>
            </Helmet>

            <div className="flex min-h-screen items-center justify-center bg-background p-4">
                <Card className="w-full max-w-md">
                    <CardHeader className="text-center">
                        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                            <Mail className="h-8 w-8 text-primary" />
                        </div>
                        <CardTitle className="text-2xl">
                            Verify Your Email
                        </CardTitle>
                        <CardDescription>
                            Please verify your email address to access the
                            Partner Portal
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="text-center text-sm text-muted-foreground">
                            <p>
                                We've sent a verification link to your email
                                address. Click the link in the email to verify
                                your account.
                            </p>
                        </div>

                        {resent ? (
                            <div className="flex items-center justify-center gap-2 text-green-600">
                                <CheckCircle2 className="h-5 w-5" />
                                <span>Verification email sent!</span>
                            </div>
                        ) : (
                            <Button
                                variant="outline"
                                className="w-full"
                                onClick={handleResendVerification}
                                disabled={isResending}
                            >
                                {isResending ? (
                                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                                ) : (
                                    <Mail className="mr-2 h-4 w-4" />
                                )}
                                Resend Verification Email
                            </Button>
                        )}

                        <div className="text-center text-sm text-muted-foreground">
                            <p>
                                Already verified?{' '}
                                <Button
                                    variant="link"
                                    className="h-auto p-0"
                                    onClick={() => window.location.reload()}
                                >
                                    Refresh this page
                                </Button>
                            </p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </>
    );
}
