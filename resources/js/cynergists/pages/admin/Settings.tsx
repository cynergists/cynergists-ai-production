import { useState, useEffect, useMemo } from "react";
import { Helmet } from "react-helmet";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAdminSettings, useSaveAdminSettings, type AdminSettings } from "@/hooks/useAdminQueries";
import { useSquareAnalytics } from "@/hooks/useSquareAnalytics";
import { PlatformStatusCard } from "@/components/admin/analytics/PlatformStatusCard";
import {
  Loader2,
  Moon,
  Sun,
  Monitor,
  Globe,
  Search,
  Youtube,
  Music2,
  Linkedin,
  Facebook,
  MousePointerClick,
  DollarSign,
  BarChart3,
} from "lucide-react";
import { toast as sonnerToast } from "sonner";

export default function AdminSettingsPage() {
  const { toast } = useToast();
  const { data: savedSettings, isLoading } = useAdminSettings();
  const saveSettings = useSaveAdminSettings();
  const { data: squareData, isLoading: squareLoading, error: squareError } = useSquareAnalytics({
    from: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
    to: new Date(),
  });

  const squareStatus = useMemo(() => {
    if (squareLoading) return "not_configured" as const;
    if (squareError) return "error" as const;
    if (squareData) return "connected" as const;
    return "not_configured" as const;
  }, [squareData, squareLoading, squareError]);

  const platforms = useMemo(() => [
    {
      platform: "Google Analytics",
      icon: Globe,
      status: "not_configured" as const,
      detailsPath: "/admin/analytics/website",
    },
    {
      platform: "Search Console",
      icon: Search,
      status: "not_configured" as const,
      detailsPath: "/admin/analytics/seo",
    },
    {
      platform: "YouTube",
      icon: Youtube,
      status: "not_configured" as const,
      detailsPath: "/admin/analytics/youtube",
    },
    {
      platform: "TikTok",
      icon: Music2,
      status: "not_configured" as const,
      detailsPath: "/admin/analytics/tiktok",
    },
    {
      platform: "LinkedIn",
      icon: Linkedin,
      status: "not_configured" as const,
      detailsPath: "/admin/analytics/linkedin",
    },
    {
      platform: "Meta",
      icon: Facebook,
      status: "not_configured" as const,
      detailsPath: "/admin/analytics/meta",
    },
    {
      platform: "Microsoft Clarity",
      icon: MousePointerClick,
      status: "not_configured" as const,
      detailsPath: "/admin/analytics/clarity",
    },
    {
      platform: "Square Revenue",
      icon: DollarSign,
      status: squareStatus,
      detailsPath: "/admin/analytics/revenue",
    },
  ], [squareStatus]);

  const handleConfigure = (platform: string) => {
    sonnerToast.info(`Configure ${platform} integration`);
  };
  
  const [settings, setSettings] = useState<AdminSettings>({
    theme: "system",
    notification_email: "",
    email_on_agreement_signed: true,
    email_on_plan_click: false,
    email_on_new_session: false,
  });
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [changingPassword, setChangingPassword] = useState(false);

  // Sync local state with cached data
  useEffect(() => {
    if (savedSettings) {
      setSettings(savedSettings);
    }
  }, [savedSettings]);

  const handleSaveSettings = async () => {
    try {
      await saveSettings.mutateAsync(settings);
      applyTheme(settings.theme);
      toast({
        title: "Settings Saved",
        description: "Your settings have been updated successfully.",
      });
    } catch (error) {
      console.error("Error saving settings:", error);
      toast({
        title: "Error",
        description: "Failed to save settings. Please try again.",
        variant: "destructive",
      });
    }
  };

  const applyTheme = (theme: string) => {
    const root = document.documentElement;
    if (theme === "dark") {
      root.classList.add("dark");
    } else if (theme === "light") {
      root.classList.remove("dark");
    } else {
      if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
        root.classList.add("dark");
      } else {
        root.classList.remove("dark");
      }
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!passwordForm.currentPassword) {
      toast({
        title: "Error",
        description: "Please enter your current password.",
        variant: "destructive",
      });
      return;
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast({
        title: "Error",
        description: "New passwords do not match.",
        variant: "destructive",
      });
      return;
    }

    if (passwordForm.newPassword.length < 6) {
      toast({
        title: "Error",
        description: "Password must be at least 6 characters.",
        variant: "destructive",
      });
      return;
    }

    setChangingPassword(true);
    try {
      // Get current user email
      const { data: { user } } = await supabase.auth.getUser();
      if (!user?.email) {
        throw new Error("Unable to get current user");
      }

      // Verify current password by re-authenticating
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: user.email,
        password: passwordForm.currentPassword,
      });

      if (signInError) {
        toast({
          title: "Error",
          description: "Current password is incorrect.",
          variant: "destructive",
        });
        return;
      }

      // Now update to new password
      const { error } = await supabase.auth.updateUser({
        password: passwordForm.newPassword,
      });

      if (error) throw error;

      toast({
        title: "Password Updated",
        description: "Your password has been changed successfully.",
      });
      setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } catch (error) {
      console.error("Error changing password:", error);
      toast({
        title: "Error",
        description: "Failed to change password. Please try again.",
        variant: "destructive",
      });
    } finally {
      setChangingPassword(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>Settings | Admin</title>
      </Helmet>
      <div className="p-6 space-y-6 max-w-4xl">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Settings</h1>
          <p className="text-muted-foreground">Manage your admin console preferences</p>
        </div>

        {/* Theme Settings */}
        <Card>
          <CardHeader>
            <CardTitle>Appearance</CardTitle>
            <CardDescription>Customize how the admin console looks</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Theme</Label>
              <Select
                value={settings.theme}
                onValueChange={(value) => setSettings({ ...settings, theme: value })}
              >
                <SelectTrigger className="w-full max-w-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="light">
                    <div className="flex items-center gap-2">
                      <Sun className="h-4 w-4" /> Light
                    </div>
                  </SelectItem>
                  <SelectItem value="dark">
                    <div className="flex items-center gap-2">
                      <Moon className="h-4 w-4" /> Dark
                    </div>
                  </SelectItem>
                  <SelectItem value="system">
                    <div className="flex items-center gap-2">
                      <Monitor className="h-4 w-4" /> System
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Notification Settings */}
        <Card>
          <CardHeader>
            <CardTitle>Notifications</CardTitle>
            <CardDescription>Configure email notifications for events</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="notification_email">Notification Email</Label>
              <Input
                id="notification_email"
                type="email"
                value={settings.notification_email}
                onChange={(e) => setSettings({ ...settings, notification_email: e.target.value })}
                className="max-w-md"
              />
            </div>

            <Separator />

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Agreement Signed</Label>
                  <p className="text-sm text-muted-foreground">
                    Get notified when a client signs an agreement
                  </p>
                </div>
                <Switch
                  checked={settings.email_on_agreement_signed}
                  onCheckedChange={(checked) =>
                    setSettings({ ...settings, email_on_agreement_signed: checked })
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label>Plan Clicked</Label>
                  <p className="text-sm text-muted-foreground">
                    Get notified when a user clicks on a pricing plan
                  </p>
                </div>
                <Switch
                  checked={settings.email_on_plan_click}
                  onCheckedChange={(checked) =>
                    setSettings({ ...settings, email_on_plan_click: checked })
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label>New Session</Label>
                  <p className="text-sm text-muted-foreground">
                    Get notified when a new visitor session starts
                  </p>
                </div>
                <Switch
                  checked={settings.email_on_new_session}
                  onCheckedChange={(checked) =>
                    setSettings({ ...settings, email_on_new_session: checked })
                  }
                />
              </div>
            </div>

            <Button onClick={handleSaveSettings} disabled={saveSettings.isPending}>
              {saveSettings.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Save Settings
            </Button>
          </CardContent>
        </Card>

        {/* Password Change */}
        <Card>
          <CardHeader>
            <CardTitle>Security</CardTitle>
            <CardDescription>Change your password</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handlePasswordChange} className="space-y-4 max-w-md">
              <div className="space-y-2">
                <Label htmlFor="currentPassword">Current Password</Label>
                <PasswordInput
                  id="currentPassword"
                  value={passwordForm.currentPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="newPassword">New Password</Label>
                <PasswordInput
                  id="newPassword"
                  value={passwordForm.newPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm New Password</Label>
                <PasswordInput
                  id="confirmPassword"
                  value={passwordForm.confirmPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                  required
                />
              </div>

              <Button type="submit" disabled={changingPassword}>
                {changingPassword && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                Change Password
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Platform Connections */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Platform Connections
            </CardTitle>
            <CardDescription>
              Connect your analytics platforms to see unified data
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
              {platforms.map((platform) => (
                <PlatformStatusCard
                  key={platform.platform}
                  {...platform}
                  onConfigure={() => handleConfigure(platform.platform)}
                />
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Cross-Platform Insights */}
        <Card className="border-dashed">
          <CardHeader>
            <CardTitle>Cross-Platform Insights</CardTitle>
            <CardDescription>
              Once you connect your platforms, you'll see unified analytics here including:
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="grid gap-2 md:grid-cols-2 text-sm text-muted-foreground">
              <li className="flex items-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                Combined traffic trends across all channels
              </li>
              <li className="flex items-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                Top performing content comparison
              </li>
              <li className="flex items-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                Audience overlap analysis
              </li>
              <li className="flex items-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                Revenue attribution by source
              </li>
              <li className="flex items-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                Engagement rate benchmarks
              </li>
              <li className="flex items-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                Exportable reports and summaries
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
