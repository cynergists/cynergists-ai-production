import { useEffect, useState } from "react";
import { router } from "@inertiajs/react";
import { Helmet } from "react-helmet";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Loader2, LogOut, Users, DollarSign, BarChart3, FileText, AlertCircle } from "lucide-react";
import cynergistsLogo from "@/assets/cynergists-logo-new.png";

interface UserProfile {
  first_name: string | null;
  last_name: string | null;
  company_name: string | null;
  status: string;
  roles: string[];
}

export default function PartnerPortal() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        router.visit("/signin");
        return;
      }

      const { data, error } = await supabase.rpc('get_user_profile', { 
        _user_id: session.user.id 
      });

      if (error) {
        console.error("Error fetching profile:", error);
        router.visit("/signin");
        return;
      }

      if (data && data.length > 0) {
        const userProfile = data[0];
        
        // Check if user has partner role
        if (!userProfile.roles?.includes('partner')) {
          router.visit("/dashboard");
          return;
        }

        setProfile(userProfile);
      }

      setLoading(false);
    };

    fetchProfile();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (!session) {
        router.visit("/signin");
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.visit("/signin");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const isPending = profile?.status === 'pending';
  const hasClientRole = profile?.roles?.includes('client');

  return (
    <>
      <Helmet>
        <title>Partner Portal | Cynergists</title>
      </Helmet>

      <div className="min-h-screen bg-background">
        {/* Header */}
        <header className="border-b border-border bg-card">
          <div className="container mx-auto px-4 py-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <img src={cynergistsLogo} alt="Cynergists" className="h-8 w-auto" />
              {hasClientRole && (
                <div className="flex items-center gap-2 ml-4 border-l border-border pl-4">
                  <span className="text-sm text-muted-foreground">Workspace:</span>
                  <select 
                    className="bg-input border border-border rounded px-2 py-1 text-sm text-foreground"
                    defaultValue="partner"
                    onChange={(e) => {
                      if (e.target.value === 'client') {
                        router.visit('/dashboard');
                      }
                    }}
                  >
                    <option value="client">Client Workspace</option>
                    <option value="partner">Partner Portal</option>
                  </select>
                </div>
              )}
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
              className="text-muted-foreground hover:text-foreground"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </header>

        {/* Main content */}
        <main className="container mx-auto px-4 py-8">
          {isPending ? (
            <div className="bg-card border border-border rounded-xl p-8 text-center max-w-2xl mx-auto">
              <div className="flex justify-center mb-4">
                <div className="h-16 w-16 rounded-full bg-yellow-500/20 flex items-center justify-center">
                  <AlertCircle className="h-8 w-8 text-yellow-500" />
                </div>
              </div>
              <h1 className="text-2xl font-bold text-foreground mb-4">
                Application Under Review
              </h1>
              <p className="text-muted-foreground mb-6">
                Thank you for applying to become a Cynergists partner. Our team is currently reviewing your application. 
                You'll receive an email once your application has been approved.
              </p>
              <p className="text-sm text-muted-foreground">
                Have questions? Contact us at{" "}
                <a href="mailto:partners@cynergists.com" className="text-primary hover:underline">
                  partners@cynergists.com
                </a>
              </p>
            </div>
          ) : (
            <>
              <div className="mb-8">
                <h1 className="text-3xl font-bold text-foreground mb-2">
                  Partner Portal
                </h1>
                <p className="text-muted-foreground">
                  {profile?.company_name && `${profile.company_name} | `}
                  Manage referrals, track commissions, and access partner resources.
                </p>
              </div>

              {/* Quick actions */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                <div className="bg-card border border-border rounded-xl p-6 hover:border-primary/50 transition-colors cursor-pointer">
                  <Users className="h-8 w-8 text-primary mb-4" />
                  <h3 className="font-semibold text-foreground mb-1">Referrals</h3>
                  <p className="text-sm text-muted-foreground">Submit and track referrals</p>
                </div>
                <div className="bg-card border border-border rounded-xl p-6 hover:border-primary/50 transition-colors cursor-pointer">
                  <DollarSign className="h-8 w-8 text-primary mb-4" />
                  <h3 className="font-semibold text-foreground mb-1">Commissions</h3>
                  <p className="text-sm text-muted-foreground">View earnings and payouts</p>
                </div>
                <div className="bg-card border border-border rounded-xl p-6 hover:border-primary/50 transition-colors cursor-pointer">
                  <BarChart3 className="h-8 w-8 text-primary mb-4" />
                  <h3 className="font-semibold text-foreground mb-1">Analytics</h3>
                  <p className="text-sm text-muted-foreground">Performance metrics</p>
                </div>
                <div className="bg-card border border-border rounded-xl p-6 hover:border-primary/50 transition-colors cursor-pointer">
                  <FileText className="h-8 w-8 text-primary mb-4" />
                  <h3 className="font-semibold text-foreground mb-1">Resources</h3>
                  <p className="text-sm text-muted-foreground">Marketing materials</p>
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                <div className="bg-card border border-border rounded-xl p-6">
                  <p className="text-sm text-muted-foreground mb-1">Total Referrals</p>
                  <p className="text-3xl font-bold text-foreground">0</p>
                </div>
                <div className="bg-card border border-border rounded-xl p-6">
                  <p className="text-sm text-muted-foreground mb-1">Active Clients</p>
                  <p className="text-3xl font-bold text-foreground">0</p>
                </div>
                <div className="bg-card border border-border rounded-xl p-6">
                  <p className="text-sm text-muted-foreground mb-1">Total Earnings</p>
                  <p className="text-3xl font-bold text-foreground">$0</p>
                </div>
              </div>

              {/* Content area */}
              <div className="bg-card border border-border rounded-xl p-8">
                <h2 className="text-xl font-semibold text-foreground mb-4">Recent Activity</h2>
                <p className="text-muted-foreground">No recent activity to display.</p>
              </div>
            </>
          )}
        </main>
      </div>
    </>
  );
}
