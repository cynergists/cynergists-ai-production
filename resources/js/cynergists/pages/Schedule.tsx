import { Helmet } from "react-helmet";
import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, CheckCircle, Phone, X } from "lucide-react";
import { Link, usePage } from "@inertiajs/react";
import { useMemo, useState } from "react";

interface RoleSelection {
  name: string;
  hours: number;
}

const BookCall = () => {
  const { url } = usePage();
  const searchParams = new URLSearchParams(url.split("?")[1] ?? "");
  const [showSummary, setShowSummary] = useState(true);
  
  const pricingSelection = useMemo(() => {
    const plan = searchParams.get("plan");
    const hours = searchParams.get("hours");
    const rolesParam = searchParams.get("roles");
    
    if (!plan || !hours || !rolesParam) return null;
    
    const roles: RoleSelection[] = rolesParam.split(",").map(roleStr => {
      const [name, hoursStr] = roleStr.split(":");
      return {
        name: decodeURIComponent(name),
        hours: parseInt(hoursStr, 10),
      };
    }).filter(r => !isNaN(r.hours));
    
    return {
      plan,
      totalHours: parseInt(hours, 10),
      roles,
    };
  }, [searchParams]);

  return (
    <Layout>
      <Helmet>
        <title>Schedule a Strategy Call | Cynergists</title>
        <meta name="description" content="Schedule a strategy call with Cynergists. A focused 30-minute session to assess where execution is breaking down and whether we can step in as your support team." />
        <link rel="canonical" href="https://cynergists.ai/schedule" />
        <meta property="og:title" content="Schedule a Strategy Call | Cynergists" />
        <meta property="og:description" content="Schedule a strategy call with Cynergists. A focused 30-minute session to assess where execution is breaking down and whether we can step in as your support team." />
        <meta property="og:url" content="https://cynergists.ai/schedule" />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Schedule a Strategy Call | Cynergists" />
        <meta name="twitter:description" content="Schedule a strategy call with Cynergists. A focused 30-minute session to assess where execution is breaking down and whether we can step in as your support team." />
        <script src="https://link.cynergists.com/js/form_embed.js" type="text/javascript"></script>
      </Helmet>
      {/* Hero */}
      <section className="py-24 gradient-hero relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-1/3 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 right-0 w-80 h-80 bg-secondary/10 rounded-full blur-3xl" />
        </div>
        
        <div className="container mx-auto px-4 relative z-10 text-center">
          <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/30 rounded-full px-4 py-2 mb-6">
            <Calendar className="h-4 w-4 text-primary" />
            <span className="text-sm text-primary font-medium">Enter the Command Center</span>
          </div>
          <h1 className="font-display text-4xl md:text-5xl font-bold text-foreground mb-6">
            Schedule a Strategy Call With <span className="text-gradient">Cynergists</span>
          </h1>
          <h2 className="text-xl md:text-2xl font-medium text-foreground/90">
            A short conversation to see if there is a fit.
          </h2>
        </div>
      </section>

      {/* Pricing Selection Summary Banner */}
      {pricingSelection && showSummary && (
        <section className="py-6 bg-primary/10 border-y border-primary/20">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <h3 className="font-display text-lg font-bold text-foreground">
                      Your Plan Selection
                    </h3>
                    <span className="bg-primary text-primary-foreground text-sm font-semibold px-3 py-1 rounded-full">
                      {pricingSelection.plan}
                    </span>
                    <span className="text-sm text-muted-foreground">
                      {pricingSelection.totalHours} total hours
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {pricingSelection.roles.map((role, idx) => (
                      <span 
                        key={idx}
                        className="text-sm bg-background/50 border border-border/50 rounded-full px-3 py-1"
                      >
                        {role.name}: <span className="font-medium">{role.hours} hrs</span>
                      </span>
                    ))}
                  </div>
                </div>
                <button 
                  onClick={() => setShowSummary(false)}
                  className="p-1 hover:bg-background/50 rounded-full transition-colors"
                  aria-label="Dismiss selection summary"
                >
                  <X className="h-5 w-5 text-muted-foreground" />
                </button>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Booking Section */}
      <section className="pt-24 pb-12 bg-card/30">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-12 items-start">
              {/* Left: Info */}
              <div>
                <h2 className="font-display text-3xl font-bold text-foreground mb-4">
                  Every hero needs a strong operations team <span className="text-gradient">behind the scenes.</span>
                </h2>
                <p className="text-muted-foreground mb-6">
                  Choose a time that works for you. This is a focused 30-minute working session to assess where execution is breaking down and whether Cynergists can step in as your support team. Calls are held by video or phone.
                </p>
                
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <Clock className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium text-foreground">30 Minutes</p>
                      <p className="text-sm text-muted-foreground">A focused mission briefing</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <Phone className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium text-foreground">Video or Phone</p>
                      <p className="text-sm text-muted-foreground">Your preferred channel</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <CheckCircle className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium text-foreground">No Obligation</p>
                      <p className="text-sm text-muted-foreground">No pitch. No pressure. Just clarity</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right: Calendar */}
              <div className="card-glass overflow-hidden">
                <iframe 
                  src="https://link.cynergists.com/widget/booking/Y9N1l1ah5h94oDzIrfTQ" 
                  style={{ width: '100%', border: 'none', minHeight: '600px' }}
                  id="Y9N1l1ah5h94oDzIrfTQ_1765999678493"
                  title="Book a Call with Cynergists"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Alternative Contact */}
      <section className="py-24">
        <div className="container mx-auto px-4 text-center">
          <h2 className="font-display text-2xl font-bold text-foreground mb-4">
            Prefer to Reach Out Directly?
          </h2>
          <p className="text-muted-foreground mb-8 max-w-xl mx-auto">
            If scheduling time is not the right move right now, reach out directly and we will respond promptly.
          </p>
          <Link href="/contact">
            <Button variant="outline" className="btn-outline">
              Contact Us
            </Button>
          </Link>
        </div>
      </section>
    </Layout>
  );
};

export default BookCall;
