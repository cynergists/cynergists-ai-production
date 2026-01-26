import { Link } from "@inertiajs/react";
import { Helmet } from "react-helmet";
import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { CheckCircle, Rocket, Mail, Users, ArrowRight } from "lucide-react";

export default function PartnerApplicationThankYou() {
  return (
    <Layout>
      <Helmet>
        <title>Welcome to the Partner Program | Cynergists</title>
        <meta 
          name="description" 
          content="Your partner account is active. Start referring clients and earning 20% recurring commissions today." 
        />
        <link rel="canonical" href="https://cynergists.ai/signup/partner/thank-you" />
      </Helmet>

      <div className="bg-background py-16 lg:py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto text-center">
            {/* Success Icon */}
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-green-100 dark:bg-green-900/30 mb-8">
              <CheckCircle className="h-10 w-10 text-green-600 dark:text-green-400" />
            </div>

            {/* Header */}
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4">
              Welcome to the <span className="text-gradient">Partner Program!</span>
            </h1>
            <p className="text-lg text-muted-foreground mb-10">
              Your account is now active. You're ready to start referring clients and earning commissions.
            </p>

            {/* What's Next Section */}
            <div className="bg-card border border-border rounded-xl p-8 mb-10 text-left">
              <h2 className="text-xl font-semibold text-foreground mb-6 flex items-center gap-2">
                <Rocket className="h-5 w-5 text-primary" />
                What Happens Next
              </h2>
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <Mail className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">Check Your Email</h3>
                    <p className="text-muted-foreground text-sm">
                      We've sent a confirmation email with your login details and a copy of your signed partner agreement.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <Users className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">Access Your Partner Portal</h3>
                    <p className="text-muted-foreground text-sm">
                      Sign in to access your partner dashboard where you can track referrals, view commissions, and access marketing resources.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <span className="text-primary font-bold text-sm">20%</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">Start Earning</h3>
                    <p className="text-muted-foreground text-sm">
                      Refer businesses to any Cynergists service and earn 20% recurring commissions for as long as they remain a client. No caps, no limits.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Commission Reminder */}
            <div className="bg-primary/5 border border-primary/20 rounded-xl p-6 mb-10">
              <div className="grid sm:grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold text-primary">20%</div>
                  <div className="text-sm text-muted-foreground">Recurring Commission</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-primary">∞</div>
                  <div className="text-sm text-muted-foreground">No Cap on Earnings</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-primary">Lifetime</div>
                  <div className="text-sm text-muted-foreground">Client Duration</div>
                </div>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg" className="px-10">
                <Link href="/signin">
                  Sign In to Partner Portal
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link href="/">
                  Return to Homepage
                </Link>
              </Button>
            </div>

            {/* Support */}
            <p className="text-sm text-muted-foreground mt-10">
              Have questions? Contact us at{" "}
              <a 
                href="mailto:partners@cynergists.com" 
                className="text-primary hover:underline"
              >
                partners@cynergists.com
              </a>
            </p>
          </div>
        </div>
      </div>
    </Layout>
  );
}