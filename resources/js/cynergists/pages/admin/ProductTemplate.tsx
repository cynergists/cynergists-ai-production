import { Helmet } from "react-helmet";
import { Link } from "@inertiajs/react";
import { ArrowLeft, ShoppingCart, ArrowRight, Check, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { OrbitingButton } from "@/components/ui/orbiting-button";
import Layout from "@/components/layout/Layout";

const ProductTemplate = () => {
  return (
    <Layout>
      <Helmet>
        <title>Product Template | Cynergists</title>
        <meta name="description" content="Standardized product page template" />
      </Helmet>

      {/* Admin Notice Banner */}
      <div className="bg-primary/10 border-b border-primary/30 py-3">
        <div className="container mx-auto px-4 flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm text-primary">
            <Package className="h-4 w-4" />
            <span className="font-medium">Template Preview</span>
            <span className="text-muted-foreground">— This is how all product pages will appear</span>
          </div>
          <Button asChild variant="outline" size="sm">
            <Link href="/admin/products">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Products
            </Link>
          </Button>
        </div>
      </div>

      {/* Hero Section - Image Left, Details Right */}
      <section className="py-20 lg:py-32 gradient-hero">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center max-w-6xl mx-auto">
            {/* Left - Image/Visual */}
            <div className="order-2 lg:order-1">
              <div className="relative aspect-video rounded-2xl overflow-hidden border border-border/50 shadow-2xl bg-card/50 flex items-center justify-center">
                <div className="p-8 text-center">
                  <div className="mx-auto mb-4 p-6 rounded-2xl bg-primary/10 border border-primary/30 inline-block">
                    <Package className="h-12 w-12 text-primary" />
                  </div>
                  <h3 className="text-2xl font-bold text-foreground">Product Image</h3>
                  <p className="text-muted-foreground mt-2">Upload a product image or video</p>
                </div>
              </div>
            </div>

            {/* Right - Details */}
            <div className="order-1 lg:order-2">
              {/* Category Badge */}
              <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/30 rounded-full px-4 py-2 mb-6">
                <Package className="h-4 w-4 text-primary" />
                <span className="text-sm text-primary font-medium">Category Name</span>
              </div>

              {/* Title */}
              <h1 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-6 leading-tight">
                Product Name
              </h1>

              {/* Description */}
              <p className="text-lg md:text-xl text-foreground/80 mb-8">
                This is the short description that summarizes what the product does and its key value proposition for the customer.
              </p>

              {/* Price */}
              <div className="mb-8">
                <span className="text-4xl font-bold text-primary">$X,XXX</span>
                <span className="text-lg text-muted-foreground">/month</span>
              </div>

              {/* CTAs */}
              <div className="flex flex-col sm:flex-row gap-4">
                <OrbitingButton className="btn-primary">
                  <ShoppingCart className="mr-2 h-4 w-4" />
                  Add to Cart
                </OrbitingButton>
                <Button variant="outline">
                  Schedule a Call
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-card/30">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl md:text-3xl font-bold text-center mb-12">
              What's <span className="text-gradient">Included</span>
            </h2>
            <div className="grid md:grid-cols-2 gap-4">
              {[
                "Feature item one goes here",
                "Feature item two goes here",
                "Feature item three goes here",
                "Feature item four goes here",
                "Feature item five goes here",
                "Feature item six goes here",
              ].map((feature, idx) => (
                <div
                  key={idx}
                  className="flex items-start gap-3 p-4 rounded-xl bg-background/50 border border-border/50"
                >
                  <Check className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                  <span className="text-foreground/80">{feature}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Who's It For Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-8">
            <div className="card-glass border-primary">
              <h3 className="text-xl font-bold text-foreground mb-4">
                Perfect For
              </h3>
              <div className="space-y-3">
                {[
                  "Business owners looking to scale",
                  "Teams needing operational support",
                  "Companies wanting to automate",
                ].map((item, idx) => (
                  <div key={idx} className="flex items-start gap-3">
                    <Check className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                    <span className="text-foreground/80">{item}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="card-glass">
              <h3 className="text-xl font-bold text-foreground mb-4">
                Integrations
              </h3>
              <div className="space-y-3">
                {[
                  "Slack",
                  "Zapier",
                  "Google Workspace",
                ].map((item, idx) => (
                  <div key={idx} className="flex items-start gap-3">
                    <Check className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                    <span className="text-foreground/80">{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="py-20 bg-card/30">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-2xl font-bold text-foreground mb-4">
            Ready to Get Started?
          </h2>
          <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
            This is the short description repeated as a final call-to-action for users who scroll to the bottom.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <OrbitingButton className="btn-primary">
              <ShoppingCart className="mr-2 h-4 w-4" />
              Add to Cart
            </OrbitingButton>
            <Button variant="outline">
              Schedule a Call
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default ProductTemplate;
