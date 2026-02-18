import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { format, formatDistanceToNow } from "date-fns";
import {
  CheckCircle2,
  Copy,
  FileDown,
  FileText,
  Globe,
  PlusCircle,
  Sparkles,
  XCircle,
} from "lucide-react";
import { usePortalContext } from "@/contexts/PortalContext";
import { apiClient } from "@/lib/api-client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

type SeoSite = {
  id: string;
  name: string;
  url: string;
  status: string;
  tracking_id?: string | null;
  pixel_install_method?: string | null;
  pixel_install_status?: string | null;
  pixel_last_seen_at?: string | null;
  last_audit_at: string | null;
  created_at: string;
};

type SeoRecommendation = {
  id: string;
  seo_site_id: string;
  type: string;
  title: string;
  impact_score: number | null;
  effort: string | null;
  status: string;
  created_at: string;
  approved_at: string | null;
  applied_at: string | null;
  site?: { id: string; name: string };
};

type SeoReport = {
  id: string;
  seo_site_id: string;
  period_start: string | null;
  period_end: string | null;
  status: string;
  highlights: Record<string, number | string> | null;
  metrics: Record<string, number | string> | null;
  created_at: string;
  site?: { id: string; name: string };
};

type SeoChange = {
  id: string;
  seo_site_id: string;
  status: string;
  summary: string | null;
  applied_at: string | null;
  created_at: string;
  site?: { id: string; name: string };
};

type SeoOverviewResponse = {
  stats: {
    siteCount: number;
    pendingRecommendations: number;
    approvedRecommendations: number;
    changesApplied: number;
    reportsReady: number;
  };
  sites: SeoSite[];
  recommendations: SeoRecommendation[];
  reports: SeoReport[];
  changes: SeoChange[];
};

const formatDateInput = (value: Date) => value.toISOString().split("T")[0];

const statusStyles: Record<string, string> = {
  pending: "border-amber-500/40 bg-amber-500/10 text-amber-600",
  approved: "border-emerald-500/40 bg-emerald-500/10 text-emerald-600",
  rejected: "border-rose-500/40 bg-rose-500/10 text-rose-600",
  applied: "border-primary/40 bg-primary/10 text-primary",
  failed: "border-rose-500/40 bg-rose-500/10 text-rose-600",
  installed: "border-emerald-500/40 bg-emerald-500/10 text-emerald-600",
  ready: "border-emerald-500/40 bg-emerald-500/10 text-emerald-600",
  draft: "border-amber-500/40 bg-amber-500/10 text-amber-600",
  active: "border-emerald-500/40 bg-emerald-500/10 text-emerald-600",
  inactive: "border-border bg-muted text-muted-foreground",
  not_installed: "border-border bg-muted text-muted-foreground",
};

const formatStatus = (value: string) =>
  value
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");

const pixelInstallOptions = [
  {
    value: "manual",
    label: "Manual snippet",
    recommendedAuth: "Copy/paste script in your site header.",
    supportsAuto: false,
  },
  {
    value: "wordpress",
    label: "WordPress",
    recommendedAuth: "Plugin OAuth (recommended).",
    supportsAuto: true,
  },
  {
    value: "webflow",
    label: "Webflow",
    recommendedAuth: "API token connection (recommended).",
    supportsAuto: true,
  },
  {
    value: "shopify",
    label: "Shopify",
    recommendedAuth: "App install OAuth (recommended).",
    supportsAuto: true,
  },
  {
    value: "wix",
    label: "Wix",
    recommendedAuth: "Wix app install (recommended).",
    supportsAuto: true,
  },
  {
    value: "squarespace",
    label: "Squarespace",
    recommendedAuth: "Code injection (recommended).",
    supportsAuto: false,
  },
] as const;

type PixelMethod = (typeof pixelInstallOptions)[number]["value"];

const pixelInstallPlaybooks: Record<
  PixelMethod,
  { title: string; steps: string[]; fallbackTitle?: string; fallbackSteps?: string[]; note?: string }
> = {
  manual: {
    title: "Manual install steps",
    steps: [
      "Copy the Carbon pixel snippet below.",
      "Paste it inside the site <head> tag on every page.",
      "Publish your site changes.",
      "Return here after a page view to confirm the pixel is installed.",
    ],
  },
  wordpress: {
    title: "WordPress auto-install steps",
    steps: [
      "Click Start auto-install to begin the WordPress connection flow.",
      "Sign in to WordPress and approve Carbon access to your site.",
      "Select the site to install the pixel.",
      "Carbon injects the script into the site header automatically.",
    ],
    fallbackTitle: "Manual fallback (works now)",
    fallbackSteps: [
      "Use the manual snippet below, or add it via your theme header.",
      "Publish, then check the status here after a page view.",
    ],
    note: "Auto-install requires WordPress connection support to be enabled.",
  },
  webflow: {
    title: "Webflow auto-install steps",
    steps: [
      "Click Start auto-install to begin the Webflow connection flow.",
      "Create a Webflow API token with access to the site.",
      "Authorize Carbon to write custom code for the site.",
      "Carbon injects the script into the site header automatically.",
    ],
    fallbackTitle: "Manual fallback (works now)",
    fallbackSteps: [
      "Paste the snippet in Webflow Site Settings → Custom Code → Head Code.",
      "Publish the site and confirm the status after a page view.",
    ],
    note: "Auto-install requires Webflow API integration to be enabled.",
  },
  shopify: {
    title: "Shopify auto-install steps",
    steps: [
      "Click Start auto-install to begin the Shopify app install flow.",
      "Sign in to Shopify and approve the Carbon app permissions.",
      "Carbon injects the script into your active theme automatically.",
      "Confirm the pixel status after a page view.",
    ],
    fallbackTitle: "Manual fallback (works now)",
    fallbackSteps: [
      "Paste the snippet in Online Store → Themes → Edit code → theme.liquid <head>.",
      "Save and confirm the status after a page view.",
    ],
    note: "Auto-install requires Shopify app approval to be enabled.",
  },
  wix: {
    title: "Wix auto-install steps",
    steps: [
      "Click Start auto-install to begin the Wix app install flow.",
      "Sign in to Wix and authorize Carbon for the selected site.",
      "Carbon injects the script into the site header automatically.",
      "Confirm the pixel status after a page view.",
    ],
    fallbackTitle: "Manual fallback (works now)",
    fallbackSteps: [
      "Paste the snippet in Settings → Custom Code → Add to Head.",
      "Publish and confirm the status after a page view.",
    ],
    note: "Auto-install requires Wix app approval to be enabled.",
  },
  squarespace: {
    title: "Squarespace install steps",
    steps: [
      "Open Settings → Advanced → Code Injection.",
      "Paste the Carbon pixel snippet into the Header field.",
      "Save changes and publish the site.",
      "Confirm the pixel status after a page view.",
    ],
    note: "Squarespace uses manual header injection. Auto-install is not available.",
  },
};

const platformAvailability = [
  { label: "WordPress", status: "Auto-install available", badge: "installed" },
  { label: "Webflow", status: "Auto-install available", badge: "installed" },
  { label: "Shopify", status: "Auto-install available", badge: "installed" },
  { label: "Wix", status: "Auto-install available", badge: "installed" },
  { label: "Squarespace", status: "Manual only", badge: "not_installed" },
  { label: "Manual snippet", status: "Always available", badge: "ready" },
];

export default function PortalSeoEngine() {
  const { user } = usePortalContext();
  const queryClient = useQueryClient();

  const { data: overview, isLoading } = useQuery({
    queryKey: ["portal-seo-overview", user?.id],
    queryFn: async () => {
      return apiClient.get<SeoOverviewResponse>("/api/portal/seo/overview");
    },
    enabled: Boolean(user?.id),
  });

  const stats = overview?.stats ?? {
    siteCount: 0,
    pendingRecommendations: 0,
    approvedRecommendations: 0,
    changesApplied: 0,
    reportsReady: 0,
  };
  const sites = overview?.sites ?? [];
  const recommendations = overview?.recommendations ?? [];
  const reports = overview?.reports ?? [];
  const changes = overview?.changes ?? [];

  const [siteDialogOpen, setSiteDialogOpen] = useState(false);
  const [siteForm, setSiteForm] = useState({ name: "", url: "" });

  const createSiteMutation = useMutation({
    mutationFn: async () => {
      if (!user?.id) {
        throw new Error("Please sign in to add a site.");
      }
      return apiClient.post<{ site: SeoSite }>("/api/portal/seo/sites", siteForm);
    },
    onSuccess: () => {
      toast.success("Site added successfully.");
      setSiteDialogOpen(false);
      setSiteForm({ name: "", url: "" });
      queryClient.invalidateQueries({ queryKey: ["portal-seo-overview", user?.id] });
    },
    onError: (error: Error) => {
      toast.error(`Unable to add site: ${error.message}`);
    },
  });

  const [decisionDialogOpen, setDecisionDialogOpen] = useState(false);
  const [decisionForm, setDecisionForm] = useState({ decision: "approved", notes: "" });
  const [selectedRecommendation, setSelectedRecommendation] = useState<SeoRecommendation | null>(null);

  const decisionMutation = useMutation({
    mutationFn: async () => {
      if (!selectedRecommendation) {
        throw new Error("Select a recommendation first.");
      }
      return apiClient.post(`/api/portal/seo/recommendations/${selectedRecommendation.id}/decision`, decisionForm);
    },
    onSuccess: () => {
      toast.success("Recommendation updated.");
      setDecisionDialogOpen(false);
      setSelectedRecommendation(null);
      setDecisionForm({ decision: "approved", notes: "" });
      queryClient.invalidateQueries({ queryKey: ["portal-seo-overview", user?.id] });
    },
    onError: (error: Error) => {
      toast.error(`Unable to update recommendation: ${error.message}`);
    },
  });

  const [reportDialogOpen, setReportDialogOpen] = useState(false);
  const defaultReportDates = useMemo(() => {
    const end = new Date();
    const start = new Date();
    start.setDate(end.getDate() - 30);
    return {
      period_start: formatDateInput(start),
      period_end: formatDateInput(end),
    };
  }, []);

  const [reportForm, setReportForm] = useState({
    seo_site_id: "",
    period_start: defaultReportDates.period_start,
    period_end: defaultReportDates.period_end,
  });

  useEffect(() => {
    if (!reportForm.seo_site_id && sites.length > 0) {
      setReportForm((current) => ({ ...current, seo_site_id: sites[0].id }));
    }
  }, [sites, reportForm.seo_site_id]);

  const reportMutation = useMutation({
    mutationFn: async () => {
      if (!reportForm.seo_site_id) {
        throw new Error("Select a site before generating a report.");
      }
      return apiClient.post<{ report: SeoReport }>("/api/portal/seo/reports/generate", reportForm);
    },
    onSuccess: () => {
      toast.success("Report generated.");
      setReportDialogOpen(false);
      queryClient.invalidateQueries({ queryKey: ["portal-seo-overview", user?.id] });
    },
    onError: (error: Error) => {
      toast.error(`Unable to generate report: ${error.message}`);
    },
  });

  const [pixelSiteId, setPixelSiteId] = useState("");
  const [pixelMethod, setPixelMethod] = useState<PixelMethod>("manual");

  useEffect(() => {
    if (!pixelSiteId && sites.length > 0) {
      setPixelSiteId(sites[0].id);
    }
  }, [sites, pixelSiteId]);

  const selectedPixelSite = useMemo(
    () => sites.find((site) => site.id === pixelSiteId) ?? sites[0],
    [sites, pixelSiteId],
  );

  useEffect(() => {
    if (selectedPixelSite?.pixel_install_method) {
      setPixelMethod(selectedPixelSite.pixel_install_method as PixelMethod);
      return;
    }
    setPixelMethod("manual");
  }, [selectedPixelSite?.id, selectedPixelSite?.pixel_install_method]);

  const pixelInstallMutation = useMutation({
    mutationFn: async (payload: { method: string; status?: string }) => {
      if (!selectedPixelSite) {
        throw new Error("Select a site to update pixel install.");
      }
      return apiClient.post<{ site: SeoSite }>(
        `/api/portal/seo/sites/${selectedPixelSite.id}/pixel-install`,
        payload,
      );
    },
    onSuccess: () => {
      toast.success("Pixel install updated.");
      queryClient.invalidateQueries({ queryKey: ["portal-seo-overview", user?.id] });
    },
    onError: (error: Error) => {
      toast.error(`Unable to update pixel install: ${error.message}`);
    },
  });

  const pixelInstallStatus = selectedPixelSite?.pixel_install_status ?? "not_installed";
  const pixelInstallConfig =
    pixelInstallOptions.find((option) => option.value === pixelMethod) ?? pixelInstallOptions[0];
  const pixelInstallPlaybook = pixelInstallPlaybooks[pixelMethod];
  const portalOrigin =
    typeof window !== "undefined" ? window.location.origin : "https://your-portal-domain.com";
  const pixelScriptUrl = selectedPixelSite?.tracking_id
    ? `${portalOrigin}/seo/pixel/${selectedPixelSite.tracking_id}.js`
    : "";
  const pixelSnippet = selectedPixelSite?.tracking_id
    ? `<script>
  (function(w,d,s,u){
    var js=d.createElement(s);js.async=1;js.src=u;
    var f=d.getElementsByTagName(s)[0];f.parentNode.insertBefore(js,f);
  })(window,document,'script','${pixelScriptUrl}');
</script>`
    : "";

  const handleOpenDecision = (recommendation: SeoRecommendation) => {
    setSelectedRecommendation(recommendation);
    setDecisionForm({ decision: "approved", notes: "" });
    setDecisionDialogOpen(true);
  };

  const handleCopyPixelSnippet = async () => {
    if (!pixelSnippet) {
      toast.error("Add a site first to generate a pixel snippet.");
      return;
    }

    try {
      await navigator.clipboard.writeText(pixelSnippet);
      toast.success("Pixel snippet copied.");
      if (selectedPixelSite && pixelInstallStatus !== "installed") {
        pixelInstallMutation.mutate({ method: "manual", status: "pending" });
      }
    } catch (error) {
      toast.error("Unable to copy the snippet. Please copy it manually.");
    }
  };

  const addSiteDisabled = !siteForm.name.trim() || !siteForm.url.trim();
  const reportDisabled = !reportForm.seo_site_id || !reportForm.period_start || !reportForm.period_end;

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 p-4 md:gap-8 md:p-8">
        <section className="flex flex-col gap-3">
          <div className="flex items-start justify-between gap-4 flex-col md:flex-row md:items-center">
            <div>
              <div className="flex items-center gap-2 text-sm font-medium text-primary">
                <Sparkles className="h-4 w-4" />
                Carbon
              </div>
              <h1 className="text-3xl font-semibold text-foreground">
                Carbon
              </h1>
              <p className="text-muted-foreground">
                Carbon is a dedicated optimization system built to continuously improve how your website ranks
                in search engines, geographic results, and AI-powered answer engines. Monitor audits,
                approve recommendations, and track measurable SEO progress.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Button onClick={() => setSiteDialogOpen(true)} className="gap-2">
                <PlusCircle className="h-4 w-4" />
                Add site
              </Button>
              <Button variant="outline" onClick={() => setReportDialogOpen(true)} className="gap-2">
                <FileText className="h-4 w-4" />
                Generate report
              </Button>
            </div>
          </div>
        </section>

        <section className="grid grid-cols-1 gap-6 md:grid-cols-5">
          {[
            { label: "Sites", value: stats.siteCount },
            { label: "Pending reviews", value: stats.pendingRecommendations },
            { label: "Approved fixes", value: stats.approvedRecommendations },
            { label: "Changes applied", value: stats.changesApplied },
            { label: "Reports ready", value: stats.reportsReady },
          ].map((item) => (
            <Card key={item.label}>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">{item.label}</CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <Skeleton className="h-8 w-16" />
                ) : (
                  <div className="text-3xl font-semibold text-foreground">{item.value}</div>
                )}
              </CardContent>
            </Card>
          ))}
        </section>

        <section className="grid grid-cols-1 gap-6 lg:grid-cols-[1.1fr,0.9fr]">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Websites</CardTitle>
                <CardDescription>Sites currently monitored by the SEO engine.</CardDescription>
              </div>
              <Button size="sm" variant="outline" onClick={() => setSiteDialogOpen(true)}>
                Add site
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              {isLoading ? (
                <Skeleton className="h-28 w-full" />
              ) : sites.length === 0 ? (
                <div className="rounded-lg border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
                  No SEO sites yet. Add your first site to start auditing.
                </div>
              ) : (
                sites.map((site) => (
                  <div key={site.id} className="flex items-start justify-between gap-4 rounded-xl border border-border p-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <Globe className="h-4 w-4 text-primary" />
                        <p className="font-semibold text-foreground">{site.name}</p>
                      </div>
                      <p className="text-xs text-muted-foreground">{site.url}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Last audit{" "}
                        {site.last_audit_at
                          ? formatDistanceToNow(new Date(site.last_audit_at), { addSuffix: true })
                          : "not yet run"}
                      </p>
                    </div>
                    <Badge
                      variant="outline"
                      className={cn("capitalize", statusStyles[site.status] ?? "text-muted-foreground")}
                    >
                      {formatStatus(site.status)}
                    </Badge>
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Recent Changes</CardTitle>
              <CardDescription>Latest approved optimizations.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {isLoading ? (
                <Skeleton className="h-28 w-full" />
              ) : changes.length === 0 ? (
                <div className="rounded-lg border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
                  No changes logged yet.
                </div>
              ) : (
                changes.map((change) => (
                  <div key={change.id} className="rounded-xl border border-border p-4">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-semibold text-foreground">
                        {change.site?.name ?? "Site update"}
                      </p>
                      <Badge
                        variant="outline"
                        className={cn("capitalize", statusStyles[change.status] ?? "text-muted-foreground")}
                      >
                        {formatStatus(change.status)}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mt-2">
                      {change.summary ?? "Change details are being compiled."}
                    </p>
                    <p className="text-xs text-muted-foreground mt-2">
                      {change.applied_at
                        ? `Applied ${formatDistanceToNow(new Date(change.applied_at), { addSuffix: true })}`
                        : "Awaiting deployment"}
                    </p>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </section>

        <section className="grid grid-cols-1 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Pixel Install</CardTitle>
              <CardDescription>
                Option A is the manual snippet for any site. Option B uses platform auto-install when available,
                with a manual fallback if it fails.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {isLoading ? (
                <Skeleton className="h-48 w-full" />
              ) : sites.length === 0 ? (
                <div className="rounded-lg border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
                  Add a site to generate your Carbon pixel snippet.
                </div>
              ) : (
                <>
                  <div className="space-y-3">
                    <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      Pixel status by site
                    </p>
                    <div className="grid gap-3">
                      {sites.map((site) => {
                        const siteStatus = site.pixel_install_status ?? "not_installed";
                        return (
                          <div
                            key={site.id}
                            className="flex flex-wrap items-start justify-between gap-4 rounded-xl border border-border p-4"
                          >
                            <div>
                              <p className="font-semibold text-foreground">{site.name}</p>
                              <p className="text-xs text-muted-foreground">{site.url}</p>
                              <p className="text-xs text-muted-foreground mt-1">
                                Method:{" "}
                                {site.pixel_install_method ? formatStatus(site.pixel_install_method) : "Not selected"}
                              </p>
                            </div>
                            <div className="text-right">
                              <Badge
                                variant="outline"
                                className={cn("capitalize", statusStyles[siteStatus] ?? "text-muted-foreground")}
                              >
                                {formatStatus(siteStatus)}
                              </Badge>
                              <p className="text-xs text-muted-foreground mt-1">
                                {site.pixel_last_seen_at
                                  ? `Last seen ${formatDistanceToNow(new Date(site.pixel_last_seen_at), {
                                      addSuffix: true,
                                    })}`
                                  : "No signal yet"}
                              </p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div className="h-px bg-border" />

                  <div className="grid gap-4 md:grid-cols-[1.1fr,0.9fr]">
                    <div className="grid gap-2">
                      <Label htmlFor="pixel-site">Configure site</Label>
                      <Select value={pixelSiteId} onValueChange={setPixelSiteId}>
                        <SelectTrigger id="pixel-site">
                          <SelectValue placeholder="Select a site" />
                        </SelectTrigger>
                        <SelectContent>
                          {sites.map((site) => (
                            <SelectItem key={site.id} value={site.id}>
                              {site.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <p className="text-xs text-muted-foreground">
                        Pixel ID: {selectedPixelSite?.tracking_id ?? "Not generated yet"}
                      </p>
                    </div>
                    <div className="flex flex-col gap-2 md:items-end">
                      <Label>Status</Label>
                      <Badge
                        variant="outline"
                        className={cn("capitalize", statusStyles[pixelInstallStatus] ?? "text-muted-foreground")}
                      >
                        {formatStatus(pixelInstallStatus)}
                      </Badge>
                      <p className="text-xs text-muted-foreground">
                        {selectedPixelSite?.pixel_last_seen_at
                          ? `Last seen ${formatDistanceToNow(new Date(selectedPixelSite.pixel_last_seen_at), {
                              addSuffix: true,
                            })}`
                          : "No signal yet"}
                      </p>
                    </div>
                  </div>

                  <div className="grid gap-4 md:grid-cols-[1.1fr,0.9fr]">
                    <div className="grid gap-2">
                      <Label htmlFor="pixel-method">Platform / install method</Label>
                      <Select value={pixelMethod} onValueChange={setPixelMethod}>
                        <SelectTrigger id="pixel-method">
                          <SelectValue placeholder="Choose a platform" />
                        </SelectTrigger>
                        <SelectContent>
                          {pixelInstallOptions.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <p className="text-xs text-muted-foreground">Recommended: {pixelInstallConfig.recommendedAuth}</p>
                      {!pixelInstallConfig.supportsAuto ? (
                        <p className="text-xs text-muted-foreground">
                          Auto-install is not available for this platform. Use the manual snippet below.
                        </p>
                      ) : null}
                    </div>
                    <div className="flex flex-wrap items-end gap-2">
                      <Button
                        size="sm"
                        onClick={() =>
                          pixelInstallMutation.mutate({
                            method: pixelMethod,
                            status: "pending",
                          })
                        }
                        disabled={!pixelInstallConfig.supportsAuto || pixelInstallMutation.isPending}
                      >
                        Start auto-install
                      </Button>
                      {pixelInstallConfig.supportsAuto && pixelInstallStatus === "pending" ? (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() =>
                            pixelInstallMutation.mutate({
                              method: pixelMethod,
                              status: "failed",
                            })
                          }
                          disabled={pixelInstallMutation.isPending}
                        >
                          Mark failed
                        </Button>
                      ) : null}
                      {pixelInstallConfig.supportsAuto && pixelInstallStatus === "failed" ? (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() =>
                            pixelInstallMutation.mutate({
                              method: pixelMethod,
                              status: "pending",
                            })
                          }
                          disabled={pixelInstallMutation.isPending}
                        >
                          Retry auto-install
                        </Button>
                      ) : null}
                    </div>
                  </div>

                  <div className="rounded-lg border border-border p-4 space-y-3">
                    <div>
                      <p className="text-sm font-semibold text-foreground">{pixelInstallPlaybook.title}</p>
                      {pixelInstallPlaybook.note ? (
                        <p className="text-xs text-muted-foreground mt-1">{pixelInstallPlaybook.note}</p>
                      ) : null}
                    </div>
                    <ol className="list-decimal pl-5 text-sm text-muted-foreground space-y-1">
                      {pixelInstallPlaybook.steps.map((step) => (
                        <li key={step}>{step}</li>
                      ))}
                    </ol>
                    {pixelInstallPlaybook.fallbackSteps ? (
                      <div className="pt-2 border-t border-border">
                        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                          {pixelInstallPlaybook.fallbackTitle ?? "Manual fallback"}
                        </p>
                        <ol className="mt-2 list-decimal pl-5 text-sm text-muted-foreground space-y-1">
                          {pixelInstallPlaybook.fallbackSteps.map((step) => (
                            <li key={step}>{step}</li>
                          ))}
                        </ol>
                      </div>
                    ) : null}
                  </div>

                  {pixelInstallStatus === "failed" ? (
                    <div className="rounded-lg border border-rose-500/40 bg-rose-500/10 p-3 text-sm text-rose-600">
                      Auto-install failed. Use the manual snippet below as the fallback.
                    </div>
                  ) : null}

                  <div className="grid gap-2">
                    <div className="flex items-center justify-between gap-3">
                      <Label>Manual snippet (Option A)</Label>
                      <Button
                        size="sm"
                        variant="outline"
                        className="gap-2"
                        onClick={handleCopyPixelSnippet}
                        disabled={!pixelSnippet || pixelInstallMutation.isPending}
                      >
                        <Copy className="h-4 w-4" />
                        Copy snippet
                      </Button>
                    </div>
                    <Textarea
                      value={pixelSnippet || "Add a site to generate a pixel snippet."}
                      readOnly
                      className="min-h-[140px] font-mono text-xs"
                    />
                    <p className="text-xs text-muted-foreground">
                      Paste inside the site <code>&lt;head&gt;</code> tag. We verify installation after the first
                      page view.
                    </p>
                  </div>

                  <div className="grid gap-3">
                    <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      Recommended installs by platform
                    </p>
                    <div className="grid gap-3 md:grid-cols-2">
                      {pixelInstallOptions
                        .filter((option) => option.value !== "manual")
                        .map((option) => (
                          <div key={option.value} className="rounded-lg border border-border p-3">
                            <p className="text-sm font-semibold text-foreground">{option.label}</p>
                            <p className="text-xs text-muted-foreground">
                              Recommended: {option.recommendedAuth}
                            </p>
                            <p className="text-xs text-muted-foreground">Fallback: Manual snippet</p>
                          </div>
                        ))}
                    </div>
                  </div>

                  <div className="grid gap-3">
                    <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      Platform availability
                    </p>
                    <div className="grid gap-3 md:grid-cols-2">
                      {platformAvailability.map((platform) => (
                        <div
                          key={platform.label}
                          className="flex items-center justify-between rounded-lg border border-border p-3"
                        >
                          <div>
                            <p className="text-sm font-semibold text-foreground">{platform.label}</p>
                            <p className="text-xs text-muted-foreground">{platform.status}</p>
                          </div>
                          <Badge
                            variant="outline"
                            className={cn("capitalize", statusStyles[platform.badge] ?? "text-muted-foreground")}
                          >
                            {platform.status}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </section>

        <section className="grid grid-cols-1 gap-6 lg:grid-cols-[1.2fr,0.8fr]">
          <Card>
            <CardHeader>
              <CardTitle>Priority Recommendations</CardTitle>
              <CardDescription>Approve or reject the next fixes to deploy.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {isLoading ? (
                <Skeleton className="h-28 w-full" />
              ) : recommendations.length === 0 ? (
                <div className="rounded-lg border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
                  Recommendations will appear after the first audit completes.
                </div>
              ) : (
                recommendations.map((rec) => (
                  <div key={rec.id} className="rounded-xl border border-border p-4 space-y-3">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="text-xs uppercase tracking-wide text-muted-foreground">
                          {rec.site?.name ?? "Site"} - {formatStatus(rec.type)}
                        </p>
                        <p className="text-sm font-semibold text-foreground mt-1">{rec.title}</p>
                      </div>
                      <Badge
                        variant="outline"
                        className={cn("capitalize", statusStyles[rec.status] ?? "text-muted-foreground")}
                      >
                        {formatStatus(rec.status)}
                      </Badge>
                    </div>
                    <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                      <span>Impact: {rec.impact_score ?? "N/A"}</span>
                      <span>Effort: {rec.effort ? formatStatus(rec.effort) : "N/A"}</span>
                      <span>
                        Created {formatDistanceToNow(new Date(rec.created_at), { addSuffix: true })}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-3">
                      {rec.status === "pending" ? (
                        <Button size="sm" onClick={() => handleOpenDecision(rec)} className="gap-2">
                          <CheckCircle2 className="h-4 w-4" />
                          Review
                        </Button>
                      ) : (
                        <Button size="sm" variant="outline" disabled>
                          {formatStatus(rec.status)}
                        </Button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Reports</CardTitle>
              <CardDescription>Monthly SEO summaries and downloads.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {isLoading ? (
                <Skeleton className="h-28 w-full" />
              ) : reports.length === 0 ? (
                <div className="rounded-lg border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
                  No reports yet. Generate the first monthly summary to get started.
                </div>
              ) : (
                reports.map((report) => (
                  <div key={report.id} className="rounded-xl border border-border p-4 space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-sm font-semibold text-foreground">
                          {report.site?.name ?? "SEO Report"}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {report.period_start && report.period_end
                            ? `${format(new Date(report.period_start), "MMM d")} - ${format(
                                new Date(report.period_end),
                                "MMM d, yyyy",
                              )}`
                            : "Custom period"}
                        </p>
                      </div>
                      <Badge
                        variant="outline"
                        className={cn("capitalize", statusStyles[report.status] ?? "text-muted-foreground")}
                      >
                        {formatStatus(report.status)}
                      </Badge>
                    </div>
                    <div className="text-xs text-muted-foreground flex items-center gap-2">
                      <span>Health score: {report.highlights?.health_score ?? "N/A"}</span>
                      <span>|</span>
                      <span>Created {formatDistanceToNow(new Date(report.created_at), { addSuffix: true })}</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Button variant="outline" size="sm" className="gap-2" asChild>
                        <a href={`/reports/seo/${report.id}`} target="_blank" rel="noreferrer">
                          <FileText className="h-4 w-4" />
                          View report
                        </a>
                      </Button>
                      <Button variant="outline" size="sm" className="gap-2" asChild>
                        <a
                          href={`/api/portal/seo/reports/${report.id}/download`}
                          target="_blank"
                          rel="noreferrer"
                        >
                          <FileDown className="h-4 w-4" />
                          Download JSON
                        </a>
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </section>
      </div>

      <Dialog open={siteDialogOpen} onOpenChange={setSiteDialogOpen}>
        <DialogContent className="sm:max-w-[520px]">
          <DialogHeader>
            <DialogTitle>Add a site</DialogTitle>
            <DialogDescription>
              Connect a website to start recurring audits and recommendations.
            </DialogDescription>
          </DialogHeader>
          <form
            className="space-y-4"
            onSubmit={(event) => {
              event.preventDefault();
              if (addSiteDisabled || createSiteMutation.isPending) {
                return;
              }
              createSiteMutation.mutate();
            }}
          >
            <div className="grid gap-2">
              <Label htmlFor="site-name">Site name</Label>
              <Input
                id="site-name"
                value={siteForm.name}
                onChange={(event) => setSiteForm((current) => ({ ...current, name: event.target.value }))}
                placeholder="Acme.com"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="site-url">Website URL</Label>
              <Input
                id="site-url"
                value={siteForm.url}
                onChange={(event) => setSiteForm((current) => ({ ...current, url: event.target.value }))}
                placeholder="https://acme.com"
              />
            </div>
            <Button type="submit" disabled={addSiteDisabled || createSiteMutation.isPending} className="w-full">
              {createSiteMutation.isPending ? "Adding..." : "Add site"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={decisionDialogOpen} onOpenChange={setDecisionDialogOpen}>
        <DialogContent className="sm:max-w-[560px]">
          <DialogHeader>
            <DialogTitle>Review recommendation</DialogTitle>
            <DialogDescription>
              Approve or reject this recommendation before it is applied.
            </DialogDescription>
          </DialogHeader>
          {selectedRecommendation ? (
            <form
              className="space-y-4"
              onSubmit={(event) => {
                event.preventDefault();
                decisionMutation.mutate();
              }}
            >
              <div className="rounded-lg border border-border p-4 text-sm text-foreground">
                <p className="font-semibold">{selectedRecommendation.title}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {selectedRecommendation.site?.name ?? "Site"} -{" "}
                  {formatStatus(selectedRecommendation.type)}
                </p>
              </div>
              <div className="grid gap-2">
                <Label>Decision</Label>
                <Select
                  value={decisionForm.decision}
                  onValueChange={(value) => setDecisionForm((current) => ({ ...current, decision: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="approved">Approve</SelectItem>
                    <SelectItem value="rejected">Reject</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label>Notes (optional)</Label>
                <Textarea
                  value={decisionForm.notes}
                  onChange={(event) => setDecisionForm((current) => ({ ...current, notes: event.target.value }))}
                  rows={3}
                  placeholder="Leave internal notes for your team..."
                />
              </div>
              <div className="flex flex-wrap gap-3">
                <Button type="submit" disabled={decisionMutation.isPending} className="gap-2">
                  {decisionForm.decision === "approved" ? (
                    <CheckCircle2 className="h-4 w-4" />
                  ) : (
                    <XCircle className="h-4 w-4" />
                  )}
                  {decisionMutation.isPending ? "Saving..." : "Submit decision"}
                </Button>
                <Button type="button" variant="outline" onClick={() => setDecisionDialogOpen(false)}>
                  Cancel
                </Button>
              </div>
            </form>
          ) : (
            <div className="text-sm text-muted-foreground">Select a recommendation to review.</div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={reportDialogOpen} onOpenChange={setReportDialogOpen}>
        <DialogContent className="sm:max-w-[520px]">
          <DialogHeader>
            <DialogTitle>Generate report</DialogTitle>
            <DialogDescription>
              Build a summary report for the selected period.
            </DialogDescription>
          </DialogHeader>
          <form
            className="space-y-4"
            onSubmit={(event) => {
              event.preventDefault();
              if (reportDisabled || reportMutation.isPending) {
                return;
              }
              reportMutation.mutate();
            }}
          >
            <div className="grid gap-2">
              <Label>Site</Label>
              <Select
                value={reportForm.seo_site_id}
                onValueChange={(value) => setReportForm((current) => ({ ...current, seo_site_id: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a site" />
                </SelectTrigger>
                <SelectContent>
                  {sites.map((site) => (
                    <SelectItem key={site.id} value={site.id}>
                      {site.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="grid gap-2">
                <Label>Period start</Label>
                <Input
                  type="date"
                  value={reportForm.period_start}
                  onChange={(event) =>
                    setReportForm((current) => ({ ...current, period_start: event.target.value }))
                  }
                />
              </div>
              <div className="grid gap-2">
                <Label>Period end</Label>
                <Input
                  type="date"
                  value={reportForm.period_end}
                  onChange={(event) =>
                    setReportForm((current) => ({ ...current, period_end: event.target.value }))
                  }
                />
              </div>
            </div>
            <Button type="submit" disabled={reportDisabled || reportMutation.isPending} className="w-full">
              {reportMutation.isPending ? "Generating..." : "Generate report"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
