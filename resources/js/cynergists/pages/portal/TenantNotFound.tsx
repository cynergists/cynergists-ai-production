import cynergistsLogo from '@/assets/cynergists-logo-new.png';
import { Button } from '@/components/ui/button';
import { Link } from '@inertiajs/react';
import { AlertCircle, ArrowLeft, HelpCircle } from 'lucide-react';
import { Helmet } from 'react-helmet';

interface TenantNotFoundProps {
    subdomain: string;
}

export default function TenantNotFound({ subdomain }: TenantNotFoundProps) {
    return (
        <>
            <Helmet>
                <title>Portal Not Found | Cynergists</title>
            </Helmet>

            <div className="flex min-h-screen items-center justify-center bg-background p-4">
                <div className="w-full max-w-md text-center">
                    {/* Logo */}
                    <div className="mb-8 flex justify-center">
                        <img
                            src={cynergistsLogo}
                            alt="Cynergists"
                            className="h-10 w-auto"
                        />
                    </div>

                    {/* Error Icon */}
                    <div className="mb-6 flex justify-center">
                        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10">
                            <AlertCircle className="h-8 w-8 text-destructive" />
                        </div>
                    </div>

                    {/* Message */}
                    <h1 className="mb-2 text-2xl font-bold text-foreground">
                        Portal Not Found
                    </h1>
                    <p className="mb-8 text-muted-foreground">
                        The portal at{' '}
                        <span className="font-medium text-foreground">
                            {subdomain}.cynergists.com
                        </span>{' '}
                        doesn't exist or has been deactivated.
                    </p>

                    {/* Actions */}
                    <div className="flex flex-col justify-center gap-3 sm:flex-row">
                        <Button asChild variant="default">
                            <Link href="/">
                                <ArrowLeft className="mr-2 h-4 w-4" />
                                Go to home
                            </Link>
                        </Button>
                        <Button asChild variant="outline">
                            <Link href="/contact">
                                <HelpCircle className="mr-2 h-4 w-4" />
                                Contact Support
                            </Link>
                        </Button>
                    </div>
                </div>
            </div>
        </>
    );
}
