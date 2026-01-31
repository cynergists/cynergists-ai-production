import { Helmet } from "react-helmet";
import { Link, usePage } from "@inertiajs/react";
import { useEffect } from "react";
import { Home, ArrowLeft, Search, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import Layout from "@/components/layout/Layout";

const NotFound = () => {
  const { url } = usePage();
  const pathname = url.split("?")[0];

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", pathname);
  }, [pathname]);

  const popularLinks = [
    { label: "View Pricing Plans", href: "/marketplace" },
    { label: "Explore Services", href: "/services" },
    { label: "Read Case Studies", href: "/case-studies" },
    { label: "Contact Us", href: "/contact" },
  ];

  return (
    <Layout>
      <Helmet>
        <title>Page Not Found | Cynergists</title>
        <meta name="description" content="The page you're looking for doesn't exist. Explore Cynergists services, pricing, or contact us for help." />
        <meta name="robots" content="noindex, follow" />
      </Helmet>
      
      <section className="min-h-[70vh] flex items-center justify-center py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto text-center">
            {/* 404 Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass mb-8">
              <Search className="h-5 w-5 text-primary" />
              <span className="text-base font-medium text-primary">Error 404</span>
            </div>

            {/* Main Heading */}
            <h1 className="font-display text-5xl md:text-6xl font-bold text-foreground mb-6">
              Mission <span className="text-gradient">Not Found</span>
            </h1>

            <p className="text-lg md:text-xl text-muted-foreground mb-8">
              Even the best operatives hit dead ends. The page you're looking for doesn't exist or has been moved. 
              Let's get you back on track.
            </p>

            {/* Primary Actions */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <Button asChild className="btn-primary">
                <Link href="/">
                  <Home className="mr-2 h-5 w-5" />
                  Return to Base
                </Link>
              </Button>
              <Button asChild variant="outline" className="btn-outline">
                <Link href="/schedule">
                  <Phone className="mr-2 h-5 w-5" />
                  Schedule a Call
                </Link>
              </Button>
            </div>

            {/* Popular Links */}
            <div className="card-glass p-8">
              <h2 className="text-lg font-semibold text-foreground mb-4">
                Popular Destinations
              </h2>
              <div className="grid sm:grid-cols-2 gap-3">
                {popularLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="flex items-center gap-2 p-3 rounded-lg bg-muted/50 hover:bg-primary/10 hover:text-primary transition-colors text-muted-foreground"
                  >
                    <ArrowLeft className="h-4 w-4 rotate-180" />
                    {link.label}
                  </Link>
                ))}
              </div>
            </div>

            {/* Path info for debugging */}
            <p className="mt-8 text-sm text-muted-foreground/60">
              Attempted path: <code className="bg-muted px-2 py-1 rounded">{pathname}</code>
            </p>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default NotFound;
