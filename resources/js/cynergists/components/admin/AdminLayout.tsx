import { ReactNode, useEffect } from "react";
import { Link, router, usePage } from "@inertiajs/react";
import { AdminSidebar } from "./AdminSidebar";
import { Loader2, Clock, Mail } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAdminPrefetch } from "@/hooks/useAdminPrefetch";
import { Button } from "@/components/ui/button";
import cynergistsLogo from "@/assets/cynergists-logo-new.png";

export function AdminLayout({ children }: { children: ReactNode }) {
  const { props } = usePage<{
    auth: {
      user: { id: number; email: string } | null;
      roles: string[];
      profile: { status?: string | null } | null;
    };
  }>();
  const { toast } = useToast();
  const isAuthenticated = Boolean(props.auth?.user);
  const roles = props.auth?.roles ?? [];
  const isAdmin = roles.includes("admin");
  const isPending = props.auth?.profile?.status === "pending";

  // Prefetch all admin data once authenticated - must be at top level
  useAdminPrefetch(isAdmin && !isPending);

  useEffect(() => {
    if (!isAuthenticated) {
      router.visit("/signin");
      return;
    }

    if (!isAdmin) {
      toast({
        title: "Access Denied",
        description: "You do not have admin privileges",
        variant: "destructive",
      });
      router.visit("/signin");
    }
  }, [isAuthenticated, isAdmin, toast]);

  const handleLogout = async () => {
    router.post("/logout", {}, { onSuccess: () => router.visit("/signin") });
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Show pending approval message
  if (isPending) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <div className="max-w-md w-full bg-card border border-border rounded-2xl p-8 shadow-xl text-center">
          <div className="flex justify-center mb-6">
            <img src={cynergistsLogo} alt="Cynergists" className="h-10" />
          </div>
          
          <div className="w-16 h-16 bg-amber-100 dark:bg-amber-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
            <Clock className="h-8 w-8 text-amber-600 dark:text-amber-400" />
          </div>
          
          <h1 className="text-2xl font-bold text-foreground mb-2">
            Admin Access Pending
          </h1>
          
          <p className="text-muted-foreground mb-6">
            Your account has been created and your admin access request has been submitted. 
            An administrator will review your request shortly.
          </p>
          
          <div className="bg-muted/50 rounded-lg p-4 mb-6">
            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
              <Mail className="h-4 w-4" />
              <span>You'll receive an email once approved</span>
            </div>
          </div>
          
          <div className="space-y-3">
            <Button
              variant="outline"
              className="w-full"
              onClick={handleLogout}
            >
              Sign Out
            </Button>
            <Link href="/" className="block">
              <Button variant="ghost" className="w-full">
                Return to Homepage
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="h-screen flex w-full bg-background overflow-hidden">
      <AdminSidebar onLogout={handleLogout} />
      <main className="flex-1 h-full flex flex-col min-h-0 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}