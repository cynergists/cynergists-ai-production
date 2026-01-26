import { Link } from "@inertiajs/react";
import { Helmet } from "react-helmet";
import { Button } from "@/components/ui/button";
import { AlertCircle, ArrowLeft, HelpCircle } from "lucide-react";
import cynergistsLogo from "@/assets/cynergists-logo-new.png";

interface TenantNotFoundProps {
  subdomain: string;
}

export default function TenantNotFound({ subdomain }: TenantNotFoundProps) {
  return (
    <>
      <Helmet>
        <title>Portal Not Found | Cynergists</title>
      </Helmet>

      <div className="min-h-screen flex items-center justify-center p-4 bg-background">
        <div className="w-full max-w-md text-center">
          {/* Logo */}
          <div className="flex justify-center mb-8">
            <img
              src={cynergistsLogo}
              alt="Cynergists"
              className="h-10 w-auto"
            />
          </div>

          {/* Error Icon */}
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center">
              <AlertCircle className="h-8 w-8 text-destructive" />
            </div>
          </div>

          {/* Message */}
          <h1 className="text-2xl font-bold text-foreground mb-2">
            Portal Not Found
          </h1>
          <p className="text-muted-foreground mb-8">
            The portal at <span className="font-medium text-foreground">{subdomain}.cynergists.com</span> doesn't exist or has been deactivated.
          </p>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button asChild variant="default">
          <Link href="/">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Go to home
              </Link>
            </Button>
            <Button asChild variant="outline">
          <Link href="/contact">
                <HelpCircle className="h-4 w-4 mr-2" />
                Contact Support
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}
