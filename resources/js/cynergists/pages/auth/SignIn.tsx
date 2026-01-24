import { useState, useEffect } from "react";
import { Link, router, usePage } from "@inertiajs/react";
import { Helmet } from "react-helmet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Moon, Sun, Mail } from "lucide-react";
import cynergistsLogo from "@/assets/cynergists-logo-new.png";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

// FAQ data for AEO optimization
const signInFaqs = [
  {
    question: "How do I sign in to my Cynergists account?",
    answer: "Enter your email address and password on the sign-in page, then click the Sign In button. Alternatively, check the magic link option to receive a secure sign-in link via email—no password required."
  },
  {
    question: "What is a magic link and how does it work?",
    answer: "A magic link is a passwordless sign-in method. When you request one, we send a secure, one-time link to your email. Click the link to instantly access your account without entering a password."
  },
  {
    question: "I forgot my password. How do I reset it?",
    answer: "Click the 'Forgot password?' link below the sign-in form. Enter your email address, and we'll send you a password reset link. Follow the instructions in the email to create a new password."
  },
  {
    question: "How do I create a new Cynergists account?",
    answer: "Click 'Get started' below the sign-in form to access the registration page. Provide your name, email, and create a password. You'll receive a confirmation email to verify your account."
  },
  {
    question: "Is my sign-in information secure?",
    answer: "Yes. Cynergists uses enterprise-grade encryption, secure authentication protocols, and industry-standard security practices. Your password is never stored in plain text, and all data is transmitted over HTTPS."
  }
];

export default function SignIn() {
  const { url, props } = usePage<{
    auth: {
      user: { id: number } | null;
      roles: string[];
    };
  }>();
  const initialEmail = new URLSearchParams(url.split("?")[1] ?? "").get("email") || "";
  const redirectParam = new URLSearchParams(url.split("?")[1] ?? "").get("redirect");
  const [email, setEmail] = useState(initialEmail);
  const [password, setPassword] = useState("");
  const [useMagicLink, setUseMagicLink] = useState(false);
  const [loading, setLoading] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);
  const [redirecting, setRedirecting] = useState(false);
  const [darkMode, setDarkMode] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    if (props.auth?.user && !redirecting) {
      setRedirecting(true);
      router.visit(resolveRedirectForRoles(props.auth.roles ?? []));
      return;
    }

    setCheckingSession(false);
  }, [props.auth, redirecting]);

  const resolveRedirectForRoles = (roles: string[]) => {
    if (roles.includes("admin")) return "/admin/dashboard";
    if (roles.includes("sales_rep")) return "/sales-rep";
    if (roles.includes("employee")) return "/employee";
    if (roles.includes("partner") && !roles.includes("client")) return "/partner";
    return "/";
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (useMagicLink) {
      toast({
        title: "Magic link not available yet",
        description: "Please sign in with your password while we migrate authentication.",
      });
      setLoading(false);
      return;
    }

    const redirectTarget =
      sessionStorage.getItem("checkout_redirect") ||
      sessionStorage.getItem("redirect_after_login") ||
      redirectParam ||
      undefined;

    router.post(
      "/signin",
      {
        email,
        password,
        remember: true,
        redirect: redirectTarget,
      },
      {
        onSuccess: () => {
          sessionStorage.removeItem("checkout_redirect");
          sessionStorage.removeItem("redirect_after_login");
        },
        onError: (errors) => {
          const message =
            Object.values(errors)[0] || "Please check your credentials and try again.";

          toast({
            title: "Sign in failed",
            description: message,
            variant: "destructive",
          });
        },
        onFinish: () => setLoading(false),
      },
    );
  };

  if (checkingSession || redirecting) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // JSON-LD structured data for SEO
  const webPageSchema = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "name": "Sign In to Cynergists Client Portal",
    "description": "Securely sign in to your Cynergists account to access your dashboard, manage services, and view project updates.",
    "url": "https://cynergists.com/signin",
    "isPartOf": {
      "@type": "WebSite",
      "name": "Cynergists",
      "url": "https://cynergists.com"
    },
    "breadcrumb": {
      "@type": "BreadcrumbList",
      "itemListElement": [
        {
          "@type": "ListItem",
          "position": 1,
          "name": "Home",
          "item": "https://cynergists.com"
        },
        {
          "@type": "ListItem",
          "position": 2,
          "name": "Sign In",
          "item": "https://cynergists.com/signin"
        }
      ]
    }
  };

  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "Cynergists",
    "url": "https://cynergists.com",
    "logo": "https://cynergists.com/favicon.png",
    "description": "AI Agents that take full ownership of revenue, operations, and internal workflows to help businesses scale.",
    "contactPoint": {
      "@type": "ContactPoint",
      "contactType": "Customer Service",
      "url": "https://cynergists.com/contact"
    },
    "sameAs": [
      "https://www.linkedin.com/company/cynergists"
    ]
  };

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": signInFaqs.map(faq => ({
      "@type": "Question",
      "name": faq.question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": faq.answer
      }
    }))
  };

  return (
    <>
      <Helmet>
        {/* Primary Meta Tags */}
        <title>Sign In to Your Account | Cynergists Client Portal</title>
        <meta name="description" content="Securely sign in to your Cynergists account. Access your dashboard, manage AI agents, and view performance in one place." />
        <link rel="canonical" href="https://cynergists.com/signin" />
        
        {/* Open Graph / Facebook */}
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://cynergists.com/signin" />
        <meta property="og:title" content="Sign In to Your Account | Cynergists Client Portal" />
        <meta property="og:description" content="Securely sign in to your Cynergists account. Access your dashboard, manage AI agents, and view performance." />
        <meta property="og:site_name" content="Cynergists" />
        
        {/* Twitter */}
        <meta name="twitter:card" content="summary" />
        <meta name="twitter:url" content="https://cynergists.com/signin" />
        <meta name="twitter:title" content="Sign In to Your Account | Cynergists Client Portal" />
        <meta name="twitter:description" content="Securely sign in to your Cynergists account. Access your dashboard, manage AI agents, and view performance." />
        
        {/* Indexing */}
        <meta name="robots" content="index, follow" />
        
        {/* JSON-LD Structured Data */}
        <script type="application/ld+json">
          {JSON.stringify(webPageSchema)}
        </script>
        <script type="application/ld+json">
          {JSON.stringify(organizationSchema)}
        </script>
        <script type="application/ld+json">
          {JSON.stringify(faqSchema)}
        </script>
      </Helmet>

      <div 
        className={`min-h-screen flex items-center justify-center p-4 ${darkMode ? 'bg-background' : 'bg-slate-100'}`}
        onClick={(e) => {
          // If clicking on the background (not the card), redirect to marketplace
          if (e.target === e.currentTarget) {
            router.visit('/marketplace');
          }
        }}
      >
        {/* Theme toggle */}
        <button
          onClick={() => setDarkMode(!darkMode)}
          className="fixed top-4 right-4 p-2 rounded-lg border border-border bg-card hover:bg-muted transition-colors"
          aria-label="Toggle theme"
        >
          {darkMode ? (
            <Sun className="h-5 w-5 text-foreground" />
          ) : (
            <Moon className="h-5 w-5 text-slate-700" />
          )}
        </button>

        <div className={`w-full max-w-md ${darkMode ? 'bg-card border-border' : 'bg-white border-slate-200'} border rounded-2xl p-8 shadow-xl`}>
          {/* Logo */}
          <div className="flex justify-center mb-8">
            <img
              src={cynergistsLogo}
              alt="Cynergists"
              className="h-12 w-auto"
            />
          </div>

          {/* Header */}
          <header className="text-center mb-8">
            <h1 className={`text-2xl font-bold mb-2 ${darkMode ? 'text-foreground' : 'text-slate-900'}`}>
              Sign In to Your Cynergists Account
            </h1>
            <p className={`text-sm ${darkMode ? 'text-muted-foreground' : 'text-slate-600'}`}>
              Access your client dashboard, AI agents, and analytics securely.
            </p>
          </header>

          {/* Form */}
          <form onSubmit={handleSignIn} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email" className={darkMode ? 'text-foreground' : 'text-slate-700'}>
                Email
              </Label>
              <Input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@company.com"
                required
                className={darkMode ? 'bg-input border-border text-foreground' : 'bg-white border-slate-300 text-slate-900'}
              />
            </div>

            {!useMagicLink && (
              <div className="space-y-2">
                <Label htmlFor="password" className={darkMode ? 'text-foreground' : 'text-slate-700'}>
                  Password
                </Label>
                <PasswordInput
                  id="password"
                  name="password"
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required={!useMagicLink}
                  className={darkMode ? 'bg-input border-border text-foreground' : 'bg-white border-slate-300 text-slate-900'}
                />
              </div>
            )}

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="magic-link"
                  checked={useMagicLink}
                  onCheckedChange={(checked) => setUseMagicLink(checked as boolean)}
                />
                <Label
                  htmlFor="magic-link"
                  className={`text-sm cursor-pointer ${darkMode ? 'text-muted-foreground' : 'text-slate-600'}`}
                >
                  <Mail className="inline h-3 w-3 mr-1" />
                  Send me a secure sign-in link
                </Label>
              </div>
            </div>


            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-3"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : useMagicLink ? (
                "Send Sign-In Link"
              ) : (
                "Sign In"
              )}
            </Button>
          </form>

          {/* Links */}
          <div className="mt-6 space-y-3 text-center text-sm">
            <p className={darkMode ? 'text-muted-foreground' : 'text-slate-600'}>
              Don't have an account?{" "}
              <Link
                href="/signup/client"
                className="text-primary hover:text-primary/80 font-medium"
              >
                Get started →
              </Link>
            </p>
            <Link
              href="/forgot-password"
              className={`block ${darkMode ? 'text-muted-foreground hover:text-foreground' : 'text-slate-500 hover:text-slate-700'}`}
            >
              Forgot password?
            </Link>
          </div>

          {/* Partner CTA Section */}
          <aside className={`mt-8 pt-6 border-t ${darkMode ? 'border-border' : 'border-slate-200'}`}>
            <div className={`rounded-xl p-4 ${darkMode ? 'bg-primary/10 border border-primary/20' : 'bg-primary/5 border border-primary/10'}`}>
              <h2 className={`text-sm font-medium mb-2 ${darkMode ? 'text-foreground' : 'text-slate-900'}`}>
                Interested in partnering with Cynergists?
              </h2>
              <p className={`text-xs mb-3 ${darkMode ? 'text-muted-foreground' : 'text-slate-600'}`}>
                Earn 20% residual commissions for every client you refer through our partner program.
              </p>
              <Link href="/signup/partner" aria-label="Apply to become a Cynergists partner">
                <Button 
                  variant="outline" 
                  size="sm"
                  className="w-full border-primary text-primary hover:bg-primary hover:text-primary-foreground"
                >
                  Join Our Partner Program →
                </Button>
              </Link>
            </div>
          </aside>

          {/* FAQ Section for AEO */}
          <section className={`mt-8 pt-6 border-t ${darkMode ? 'border-border' : 'border-slate-200'}`} aria-labelledby="faq-heading">
            <h2 
              id="faq-heading" 
              className={`text-lg font-semibold mb-4 ${darkMode ? 'text-foreground' : 'text-slate-900'}`}
            >
              Frequently Asked Questions
            </h2>
            <Accordion type="single" collapsible className="w-full space-y-2">
              {signInFaqs.map((faq, index) => (
                <AccordionItem 
                  key={index} 
                  value={`faq-${index}`}
                  className={`card-glass px-4 rounded-lg ${darkMode ? 'border-border' : 'border-slate-200'}`}
                >
                  <AccordionTrigger className="text-left text-sm font-medium hover:no-underline data-[state=open]:text-primary py-3">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-foreground/80 text-sm pb-3">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </section>
        </div>
      </div>
    </>
  );
}
