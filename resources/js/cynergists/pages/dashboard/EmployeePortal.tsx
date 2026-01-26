import { useEffect, useState } from "react";
import { router, usePage } from "@inertiajs/react";
import { Helmet } from "react-helmet";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, Clock, FileText, Calendar, Bell, LogOut, CheckCircle, User } from "lucide-react";
import cynergistsLogo from "@/assets/cynergists-logo-new.png";

interface UserProfile {
  first_name: string | null;
  last_name: string | null;
  email: string;
}

export default function EmployeePortal() {
  const { props } = usePage<{
    auth: {
      user: { id: number; name?: string; email: string } | null;
      roles: string[];
      profile: { first_name: string | null; last_name: string | null; email: string | null } | null;
    };
  }>();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const user = props.auth?.user;
    const roles = props.auth?.roles ?? [];

    if (!user) {
      router.visit("/signin?redirect=/employee");
      return;
    }

    if (!roles.includes("employee")) {
      router.visit("/signin");
      return;
    }

    setIsAdmin(roles.includes("admin"));

    const profileData = props.auth?.profile;
    setProfile({
      first_name: profileData?.first_name ?? null,
      last_name: profileData?.last_name ?? null,
      email: profileData?.email ?? user.email,
    });

    setLoading(false);
  }, [props.auth]);

  const handleSignOut = () => {
    router.post(
      "/logout",
      {},
      {
        onFinish: () => {
          router.visit("/signin");
        },
      },
    );
  };

  const handleGoToAdmin = () => {
    router.visit("/admin/dashboard");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const displayName = profile?.first_name 
    ? `${profile.first_name}${profile.last_name ? ` ${profile.last_name}` : ''}`
    : 'Employee';

  return (
    <>
      <Helmet>
        <title>Employee Portal | Cynergists</title>
        <meta name="description" content="Access your employee dashboard, tasks, and company resources." />
      </Helmet>

      <div className="min-h-screen bg-background">
        {/* Header */}
        <header className="border-b border-border bg-card">
          <div className="container mx-auto px-4 py-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <img src={cynergistsLogo} alt="Cynergists" className="h-8 w-auto" />
              <Badge variant="secondary">Employee Portal</Badge>
              {isAdmin && (
                <Badge variant="default" className="bg-primary">Admin Access</Badge>
              )}
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-muted-foreground">
                Welcome, {displayName}
              </span>
              {isAdmin && (
                <Button variant="outline" size="sm" onClick={handleGoToAdmin}>
                  Admin Panel
                </Button>
              )}
              <Button variant="outline" size="sm" onClick={handleSignOut}>
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </Button>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="container mx-auto px-4 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">
              Employee Dashboard
            </h1>
            <p className="text-muted-foreground">
              Access your tasks, schedule, and company resources.
            </p>
          </div>

          {/* Metrics Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Hours This Week</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">0</div>
                <p className="text-xs text-muted-foreground">
                  of 40 hours
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Tasks Due</CardTitle>
                <CheckCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">0</div>
                <p className="text-xs text-muted-foreground">
                  This week
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Upcoming Meetings</CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">0</div>
                <p className="text-xs text-muted-foreground">
                  Scheduled
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Unread Announcements</CardTitle>
                <Bell className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">0</div>
                <p className="text-xs text-muted-foreground">
                  New updates
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button variant="outline" className="w-full justify-start">
                  <Clock className="h-4 w-4 mr-2" />
                  Log Hours
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <FileText className="h-4 w-4 mr-2" />
                  Submit Request
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <User className="h-4 w-4 mr-2" />
                  Update Profile
                </Button>
              </CardContent>
            </Card>

            {/* Announcements */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Company Announcements</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-muted-foreground">
                  <Bell className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No announcements at this time.</p>
                  <p className="text-sm">Check back later for updates.</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* My Tasks */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>My Tasks</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                <CheckCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No tasks assigned.</p>
                <p className="text-sm">Your assigned tasks will appear here.</p>
              </div>
            </CardContent>
          </Card>

          {/* Resources */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Resources</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Button variant="outline" className="h-auto py-4 flex-col">
                  <FileText className="h-6 w-6 mb-2" />
                  <span>Employee Handbook</span>
                </Button>
                <Button variant="outline" className="h-auto py-4 flex-col">
                  <Calendar className="h-6 w-6 mb-2" />
                  <span>Company Calendar</span>
                </Button>
                <Button variant="outline" className="h-auto py-4 flex-col">
                  <User className="h-6 w-6 mb-2" />
                  <span>Team Directory</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
    </>
  );
}
