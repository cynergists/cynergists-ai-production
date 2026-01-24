import { useState } from "react";
import { Link, router } from "@inertiajs/react";
import { Helmet } from "react-helmet";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import { PhoneInput } from "@/components/ui/phone-input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { Loader2, ArrowLeft } from "lucide-react";
import cynergistsLogo from "@/assets/cynergists-logo-new.png";
import { z } from "zod";
import { isUserExistsError } from "@/utils/errorMessages";
import { getErrorMessage } from "@/lib/logger";

const signupSchema = z.object({
  firstName: z.string().min(1, "First name is required").max(50),
  lastName: z.string().min(1, "Last name is required").max(50),
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  companyName: z.string().min(1, "Company name is required").max(100),
  phone: z.string().optional(),
  acceptTerms: z.literal(true, {
    errorMap: () => ({ message: "You must accept the terms" }),
  }),
});

export default function SignUpClient() {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    companyName: "",
    phone: "",
    acceptTerms: false,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleChange = (field: string, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});

    try {
      const validated = signupSchema.parse(formData);

      // Check for checkout redirect - but client signup goes to onboarding
      const checkoutRedirect = sessionStorage.getItem("checkout_redirect");

      // Pass all profile data in user metadata - trigger handles profile/role creation server-side
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: validated.email,
        password: validated.password,
        options: {
          emailRedirectTo: `${window.location.origin}/portal/onboarding`,
          data: {
            first_name: validated.firstName,
            last_name: validated.lastName,
            company_name: validated.companyName,
            phone: validated.phone || null,
            user_type: "client",
          },
        },
      });

      if (authError) throw authError;

      if (authData.user) {
        // Check if this is a cynergists.com email - they need admin approval
        const isCynergistsEmail = validated.email.toLowerCase().endsWith("@cynergists.com");
        
        if (isCynergistsEmail) {
          // Send approval request email
          try {
            await supabase.functions.invoke("send-admin-approval-request", {
              body: {
                user_id: authData.user.id,
                requester_email: validated.email,
                requester_name: `${validated.firstName} ${validated.lastName}`.trim(),
                approval_token: authData.user.id,
              },
            });
          } catch (emailError) {
            console.error("Failed to send approval email:", emailError);
          }
          
          toast({
            title: "Account created - Admin approval required",
            description: "Your admin access request has been submitted. You'll receive an email once approved.",
          });
          
          router.visit("/admin");
          return;
        }
        
        // Create portal tenant with temp subdomain
        try {
          await supabase.functions.invoke("create-portal-tenant", {
            body: {
              user_id: authData.user.id,
              company_name: validated.companyName,
            },
          });
        } catch (tenantError) {
          console.error("Failed to create portal tenant:", tenantError);
          // Don't block signup if tenant creation fails
        }
        
        // Save registration data to localStorage for checkout pre-population
        const contactData = {
          firstName: validated.firstName,
          lastName: validated.lastName,
          email: validated.email,
          phone: validated.phone || "",
        };
        const companyData = {
          jobTitle: "",
          companyName: validated.companyName,
          streetAddress: "",
          city: "",
          state: "",
          zip: "",
        };
        localStorage.setItem("cynergists_checkout_contact", JSON.stringify(contactData));
        localStorage.setItem("cynergists_checkout_company", JSON.stringify(companyData));

        // Mark as new signup for onboarding
        sessionStorage.setItem("isNewSignup", "true");

        // Clear checkout redirect if used
        if (checkoutRedirect) {
          sessionStorage.removeItem("checkout_redirect");
        }
        
        toast({
          title: "Account created",
          description: "Welcome to Cynergists! Your portal is ready.",
        });

        // Redirect directly to portal (subdomain is auto-assigned)
        router.visit("/portal");
      }
    } catch (error: unknown) {
      if (error instanceof z.ZodError) {
        const fieldErrors: Record<string, string> = {};
        error.errors.forEach((err) => {
          if (err.path[0]) {
            fieldErrors[err.path[0] as string] = err.message;
          }
        });
        setErrors(fieldErrors);
      } else if (isUserExistsError(getErrorMessage(error))) {
        toast({
          title: "Account already exists",
          description: (
            <span>
              An account with this email already exists.{" "}
              <Link href={`/signin?email=${encodeURIComponent(formData.email)}`} className="underline font-medium text-primary">
                Sign in instead
              </Link>
            </span>
          ),
        });
      } else {
        toast({
          title: "Sign up failed",
          description: getErrorMessage(error),
          variant: "destructive",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>Get Started | Cynergists</title>
        <meta name="description" content="Create your Cynergists account and start accessing powerful business tools and services." />
      </Helmet>

      <div className="min-h-screen flex items-center justify-center p-4 bg-background">
        <div className="w-full max-w-md bg-card border border-border rounded-2xl p-8 shadow-xl">
          {/* Back link */}
          <Link
            href="/signin"
            className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-6"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to sign in
          </Link>

          {/* Logo */}
          <div className="flex justify-center mb-6">
            <img
              src={cynergistsLogo}
              alt="Cynergists"
              className="h-10 w-auto"
            />
          </div>

          {/* Header */}
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold text-foreground mb-2">
              Get Started
            </h1>
            <p className="text-sm text-muted-foreground">
              Create your account to access Cynergists services.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name</Label>
                <Input
                  id="firstName"
                  value={formData.firstName}
                  onChange={(e) => handleChange("firstName", e.target.value)}
                  placeholder="John"
                  className="bg-input border-border"
                />
                {errors.firstName && (
                  <p className="text-xs text-destructive">{errors.firstName}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name</Label>
                <Input
                  id="lastName"
                  value={formData.lastName}
                  onChange={(e) => handleChange("lastName", e.target.value)}
                  placeholder="Doe"
                  className="bg-input border-border"
                />
                {errors.lastName && (
                  <p className="text-xs text-destructive">{errors.lastName}</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleChange("email", e.target.value)}
                placeholder="you@company.com"
                className="bg-input border-border"
              />
              {errors.email && (
                <p className="text-xs text-destructive">{errors.email}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <PasswordInput
                id="password"
                value={formData.password}
                onChange={(e) => handleChange("password", e.target.value)}
                placeholder="••••••••"
                className="bg-input border-border"
              />
              {errors.password && (
                <p className="text-xs text-destructive">{errors.password}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="companyName">Company Name</Label>
              <Input
                id="companyName"
                value={formData.companyName}
                onChange={(e) => handleChange("companyName", e.target.value)}
                placeholder="Acme Inc."
                className="bg-input border-border"
              />
              {errors.companyName && (
                <p className="text-xs text-destructive">{errors.companyName}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Phone (optional)</Label>
              <PhoneInput
                id="phone"
                value={formData.phone}
                onChange={(value) => handleChange("phone", value)}
              />
            </div>

            <div className="flex items-start space-x-2 pt-2">
              <Checkbox
                id="terms"
                checked={formData.acceptTerms}
                onCheckedChange={(checked) => handleChange("acceptTerms", checked as boolean)}
              />
              <Label htmlFor="terms" className="text-sm text-muted-foreground cursor-pointer leading-tight">
                I accept the{" "}
                <Link href="/terms" className="text-primary hover:underline">
                  Terms of Service
                </Link>{" "}
                and{" "}
                <Link href="/privacy" className="text-primary hover:underline">
                  Privacy Policy
                </Link>
              </Label>
            </div>
            {errors.acceptTerms && (
              <p className="text-xs text-destructive">{errors.acceptTerms}</p>
            )}

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-3 mt-2"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                "Create Account"
              )}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link href="/signin" className="text-primary hover:text-primary/80 font-medium">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </>
  );
}
