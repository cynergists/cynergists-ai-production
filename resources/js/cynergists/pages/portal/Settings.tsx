import { useState, useEffect, useCallback } from "react";
import { usePortalContext } from "@/contexts/PortalContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Settings as SettingsIcon, User, Bell, Shield, Palette, Globe, Check, X, Loader2, ExternalLink } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useCurrentUserTenant } from "@/hooks/useTenant";
import { useDebounce } from "@/hooks/useDebounce";
import { useQueryClient } from "@tanstack/react-query";


export default function PortalSettings() {
  const { session } = usePortalContext();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { data: tenant, isLoading: tenantLoading } = useCurrentUserTenant();

  // Subdomain state
  const [subdomain, setSubdomain] = useState("");
  const [isChecking, setIsChecking] = useState(false);
  const [isAvailable, setIsAvailable] = useState<boolean | null>(null);
  const [availabilityMessage, setAvailabilityMessage] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  const debouncedSubdomain = useDebounce(subdomain, 500);

  // Initialize subdomain from tenant
  useEffect(() => {
    if (tenant?.subdomain) {
      setSubdomain(tenant.subdomain);
    }
  }, [tenant?.subdomain]);

  // Check availability when subdomain changes
  const checkAvailability = useCallback(async (value: string) => {
    // Skip check if value matches current tenant subdomain
    if (tenant?.subdomain && value === tenant.subdomain) {
      setIsAvailable(null);
      setAvailabilityMessage("");
      setHasChanges(false);
      return;
    }

    if (value.length < 3) {
      setIsAvailable(null);
      setAvailabilityMessage("Minimum 3 characters");
      setHasChanges(false);
      return;
    }

    setHasChanges(true);
    setIsChecking(true);
    try {
      const { data, error } = await supabase.functions.invoke("check-subdomain", {
        body: { subdomain: value },
      });

      if (error) throw error;

      setIsAvailable(data.available);
      if (data.available) {
        setAvailabilityMessage("Available!");
      } else if (data.reason === "invalid_format") {
        setAvailabilityMessage(data.message || "Invalid format");
      } else {
        setAvailabilityMessage("Already taken");
      }
    } catch (error) {
      console.error("Error checking subdomain:", error);
      setIsAvailable(null);
      setAvailabilityMessage("Error checking availability");
    } finally {
      setIsChecking(false);
    }
  }, [tenant?.subdomain]);

  useEffect(() => {
    if (debouncedSubdomain) {
      checkAvailability(debouncedSubdomain);
    } else {
      setIsAvailable(null);
      setAvailabilityMessage("");
    }
  }, [debouncedSubdomain, checkAvailability]);

  const handleSubdomainChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "");
    setSubdomain(value);
    setIsAvailable(null);
    setAvailabilityMessage("");
  };

  const handleSaveSubdomain = async () => {
    if (!isAvailable || isSaving) return;

    setIsSaving(true);
    try {
      const { data, error } = await supabase.functions.invoke("claim-subdomain", {
        body: { subdomain },
      });

      if (error) throw error;

      if (data.success) {
        toast({
          title: "Portal address updated!",
          description: `Your portal is now at ${subdomain}.cynergists.com`,
        });
        
        // Refresh tenant data
        queryClient.invalidateQueries({ queryKey: ["currentUserTenant"] });
        setHasChanges(false);
        setIsAvailable(null);
        setAvailabilityMessage("");
      } else {
        throw new Error(data.error || "Failed to update subdomain");
      }
    } catch (error) {
      console.error("Error updating subdomain:", error);
      toast({
        title: "Failed to update address",
        description: error instanceof Error ? error.message : "Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="p-8">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <SettingsIcon className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold text-foreground">Settings</h1>
        </div>
        <p className="text-muted-foreground">
          Manage your account preferences and settings.
        </p>
      </div>

      <div className="space-y-6 max-w-2xl">
        {/* Portal Address Settings */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Globe className="h-5 w-5 text-muted-foreground" />
              <CardTitle>Portal Address</CardTitle>
            </div>
            <CardDescription>Your unique portal URL where your team accesses agents</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {tenantLoading ? (
              <div className="flex items-center gap-2 text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                Loading...
              </div>
            ) : (
              <>
                <div className="space-y-2">
                  <Label htmlFor="subdomain">Portal Address</Label>
                  <div className="flex items-center gap-2">
                    <div className="relative flex-1">
                      <Input
                        id="subdomain"
                        value={subdomain}
                        onChange={handleSubdomainChange}
                        placeholder="your-company"
                        className="pr-10"
                        maxLength={30}
                      />
                      <div className="absolute right-3 top-1/2 -translate-y-1/2">
                        {isChecking ? (
                          <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                        ) : isAvailable === true ? (
                          <Check className="h-4 w-4 text-green-500" />
                        ) : isAvailable === false ? (
                          <X className="h-4 w-4 text-destructive" />
                        ) : null}
                      </div>
                    </div>
                    <span className="text-sm text-muted-foreground whitespace-nowrap">
                      .cynergists.com
                    </span>
                  </div>
                  {availabilityMessage && (
                    <p className={`text-xs ${isAvailable ? "text-green-500" : isAvailable === false ? "text-destructive" : "text-muted-foreground"}`}>
                      {availabilityMessage}
                    </p>
                  )}
                </div>

                {tenant?.subdomain && !tenant.is_temp_subdomain && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <span>Current:</span>
                    <a
                      href={`https://${tenant.subdomain}.cynergists.com`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline flex items-center gap-1"
                    >
                      {tenant.subdomain}.cynergists.com
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  </div>
                )}

                <Button 
                  onClick={handleSaveSubdomain}
                  disabled={!isAvailable || isSaving || !hasChanges}
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      Saving...
                    </>
                  ) : (
                    "Update Address"
                  )}
                </Button>

                <p className="text-xs text-muted-foreground">
                  Use lowercase letters, numbers, and hyphens only. Minimum 3 characters.
                </p>
              </>
            )}
          </CardContent>
        </Card>

        {/* Profile Settings */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <User className="h-5 w-5 text-muted-foreground" />
              <CardTitle>Profile</CardTitle>
            </div>
            <CardDescription>Your account information</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" value={session?.user?.email || ""} disabled />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name</Label>
                <Input id="firstName" placeholder="Enter first name" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name</Label>
                <Input id="lastName" placeholder="Enter last name" />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="company">Company</Label>
              <Input id="company" placeholder="Enter company name" />
            </div>
            <Button>Save Changes</Button>
          </CardContent>
        </Card>

        {/* Notification Settings */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Bell className="h-5 w-5 text-muted-foreground" />
              <CardTitle>Notifications</CardTitle>
            </div>
            <CardDescription>Configure how you receive notifications</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Email Notifications</Label>
                <p className="text-sm text-muted-foreground">Receive updates about your agents via email</p>
              </div>
              <Switch defaultChecked />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Weekly Reports</Label>
                <p className="text-sm text-muted-foreground">Get a weekly summary of agent activity</p>
              </div>
              <Switch defaultChecked />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Product Updates</Label>
                <p className="text-sm text-muted-foreground">Learn about new features and improvements</p>
              </div>
              <Switch />
            </div>
          </CardContent>
        </Card>

        {/* Security Settings */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-muted-foreground" />
              <CardTitle>Security</CardTitle>
            </div>
            <CardDescription>Manage your account security</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Two-Factor Authentication</Label>
                <p className="text-sm text-muted-foreground">Add an extra layer of security</p>
              </div>
              <Button variant="outline" size="sm">Enable</Button>
            </div>
            <Separator />
            <div className="space-y-2">
              <Label>Password</Label>
              <div className="flex gap-2">
                <Input type="password" value="••••••••••••" disabled className="flex-1" />
                <Button variant="outline">Change</Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Appearance Settings */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Palette className="h-5 w-5 text-muted-foreground" />
              <CardTitle>Appearance</CardTitle>
            </div>
            <CardDescription>Customize your interface</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Dark Mode</Label>
                <p className="text-sm text-muted-foreground">Use dark theme across the portal</p>
              </div>
              <Switch defaultChecked />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
