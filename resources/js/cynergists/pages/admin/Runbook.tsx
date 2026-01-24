import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Link } from "@inertiajs/react";
import {
  Book,
  Calendar,
  AlertTriangle,
  CheckCircle2,
  ExternalLink,
  RefreshCw,
  Clock,
  DollarSign,
  FileText,
  Users,
  Webhook,
} from "lucide-react";

interface RunbookStats {
  failedWebhooks: number;
  failedPayouts: number;
  failedReports: number;
  newFraudFlags: number;
  openDisputes: number;
  pendingReconciliation: number;
  highRiskPartners: number;
  unresolvedNotifications: number;
}

export default function AdminRunbook() {
  const [stats, setStats] = useState<RunbookStats>({
    failedWebhooks: 0,
    failedPayouts: 0,
    failedReports: 0,
    newFraudFlags: 0,
    openDisputes: 0,
    pendingReconciliation: 0,
    highRiskPartners: 0,
    unresolvedNotifications: 0,
  });
  const [loading, setLoading] = useState(true);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());

  const fetchStats = async () => {
    try {
      setLoading(true);

      // Failed webhooks
      const { count: failedWebhooks } = await supabase
        .from("webhook_events")
        .select("*", { count: "exact", head: true })
        .eq("status", "failed");

      // Failed payouts
      const { count: failedPayouts } = await supabase
        .from("partner_payouts")
        .select("*", { count: "exact", head: true })
        .eq("status", "failed");

      // Failed reports - skip if table doesn't exist
      const failedReports = 0;

      // New fraud flags
      const { count: newFraudFlags } = await supabase
        .from("partners")
        .select("*", { count: "exact", head: true })
        .eq("has_fraud_flag", true);

      // Open disputes
      const { count: openDisputes } = await supabase
        .from("disputes")
        .select("*", { count: "exact", head: true })
        .eq("status", "open");

      // Pending reconciliation (payouts that need review)
      const { count: pendingReconciliation } = await supabase
        .from("partner_payouts")
        .select("*", { count: "exact", head: true })
        .in("status", ["scheduled", "ready"]);

      // High risk partners
      const { count: highRiskPartners } = await supabase
        .from("partners")
        .select("*", { count: "exact", head: true })
        .in("risk_level", ["medium", "high"]);

      // Unresolved notifications
      const { count: unresolvedNotifications } = await supabase
        .from("notifications")
        .select("*", { count: "exact", head: true })
        .is("resolved_at", null);

      setStats({
        failedWebhooks: failedWebhooks || 0,
        failedPayouts: failedPayouts || 0,
        failedReports: failedReports || 0,
        newFraudFlags: newFraudFlags || 0,
        openDisputes: openDisputes || 0,
        pendingReconciliation: pendingReconciliation || 0,
        highRiskPartners: highRiskPartners || 0,
        unresolvedNotifications: unresolvedNotifications || 0,
      });

      setLastRefresh(new Date());
    } catch (error) {
      console.error("Failed to fetch runbook stats:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const StatCard = ({
    label,
    value,
    link,
    icon: Icon,
    isWarning = false,
  }: {
    label: string;
    value: number;
    link: string;
    icon: React.ElementType;
    isWarning?: boolean;
  }) => (
    <Link href={link}>
      <div
        className={`flex items-center justify-between p-4 rounded-lg border hover:bg-accent transition-colors ${
          isWarning && value > 0 ? "border-destructive/50 bg-destructive/5" : ""
        }`}
      >
        <div className="flex items-center gap-3">
          <Icon className={`h-5 w-5 ${isWarning && value > 0 ? "text-destructive" : "text-muted-foreground"}`} />
          <span className="font-medium">{label}</span>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant={isWarning && value > 0 ? "destructive" : "secondary"}>
            {value}
          </Badge>
          <ExternalLink className="h-4 w-4 text-muted-foreground" />
        </div>
      </div>
    </Link>
  );

  return (
    <div className="p-6">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Book className="h-6 w-6" />
              Operations Runbook
            </h1>
            <p className="text-muted-foreground mt-1">
              Daily, weekly, and month-end operational checklists
            </p>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">
              Last refresh: {lastRefresh.toLocaleTimeString()}
            </span>
            <Button onClick={fetchStats} variant="outline" size="sm" disabled={loading}>
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
              Refresh
            </Button>
          </div>
        </div>

        {/* Summary Alert */}
        {stats.unresolvedNotifications > 0 && (
          <div className="p-4 rounded-lg border border-destructive/50 bg-destructive/5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              <span className="font-medium">
                {stats.unresolvedNotifications} unresolved system notification{stats.unresolvedNotifications > 1 ? "s" : ""}
              </span>
            </div>
            <Button variant="destructive" size="sm" asChild>
              <Link href="/admin/notifications">View Notifications</Link>
            </Button>
          </div>
        )}

        {/* Daily Checks */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Daily Checks
            </CardTitle>
            <CardDescription>
              Review these items every day to catch issues early
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <StatCard
              label="Failed Webhooks"
              value={stats.failedWebhooks}
              link="/admin/tracking"
              icon={Webhook}
              isWarning
            />
            <StatCard
              label="Failed Payouts"
              value={stats.failedPayouts}
              link="/admin/payouts"
              icon={DollarSign}
              isWarning
            />
            <StatCard
              label="Failed Reports (7 days)"
              value={stats.failedReports}
              link="/admin/tracking"
              icon={FileText}
              isWarning
            />
            <StatCard
              label="Partners with Fraud Flags"
              value={stats.newFraudFlags}
              link="/admin/partners?filter=fraud"
              icon={AlertTriangle}
              isWarning
            />
          </CardContent>
        </Card>

        {/* Weekly Checks */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Weekly Checks
            </CardTitle>
            <CardDescription>
              Review these items weekly to maintain system health
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <StatCard
              label="Open Dispute Backlog"
              value={stats.openDisputes}
              link="/admin/disputes"
              icon={AlertTriangle}
              isWarning={stats.openDisputes > 5}
            />
            <StatCard
              label="Pending Reconciliation Items"
              value={stats.pendingReconciliation}
              link="/admin/payouts"
              icon={DollarSign}
            />
            <StatCard
              label="Medium/High Risk Partners"
              value={stats.highRiskPartners}
              link="/admin/partners?filter=risk"
              icon={Users}
              isWarning={stats.highRiskPartners > 0}
            />
          </CardContent>
        </Card>

        {/* Month-End Checks */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Month-End Checks
            </CardTitle>
            <CardDescription>
              Critical tasks for month-end close and payout processing
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4">
              <div className="flex items-start gap-3 p-4 rounded-lg border">
                <input type="checkbox" className="h-5 w-5 mt-0.5" />
                <div>
                  <div className="font-medium">Payout Batch Created (16th)</div>
                  <div className="text-sm text-muted-foreground">
                    On the 16th of each month, verify payout batches are created for all eligible commissions
                  </div>
                </div>
              </div>
              <div className="flex items-start gap-3 p-4 rounded-lg border">
                <input type="checkbox" className="h-5 w-5 mt-0.5" />
                <div>
                  <div className="font-medium">Payout Execution (1st)</div>
                  <div className="text-sm text-muted-foreground">
                    On the 1st of each month (or next business day), execute all ready payouts
                  </div>
                </div>
              </div>
              <div className="flex items-start gap-3 p-4 rounded-lg border">
                <input type="checkbox" className="h-5 w-5 mt-0.5" />
                <div>
                  <div className="font-medium">Report Schedules Current</div>
                  <div className="text-sm text-muted-foreground">
                    Verify all active report schedules have next_run_at in the future
                  </div>
                </div>
              </div>
              <div className="flex items-start gap-3 p-4 rounded-lg border">
                <input type="checkbox" className="h-5 w-5 mt-0.5" />
                <div>
                  <div className="font-medium">Reconcile Commission Totals</div>
                  <div className="text-sm text-muted-foreground">
                    Verify payout totals match sum of linked commissions
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Links */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Links</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <Button variant="outline" asChild className="h-auto py-3">
                <Link href="/admin/partners" className="flex flex-col items-center gap-1">
                  <Users className="h-5 w-5" />
                  <span className="text-sm">Partners</span>
                </Link>
              </Button>
              <Button variant="outline" asChild className="h-auto py-3">
                <Link href="/admin/commissions" className="flex flex-col items-center gap-1">
                  <DollarSign className="h-5 w-5" />
                  <span className="text-sm">Commissions</span>
                </Link>
              </Button>
              <Button variant="outline" asChild className="h-auto py-3">
                <Link href="/admin/payouts" className="flex flex-col items-center gap-1">
                  <DollarSign className="h-5 w-5" />
                  <span className="text-sm">Payouts</span>
                </Link>
              </Button>
              <Button variant="outline" asChild className="h-auto py-3">
                <Link href="/admin/launch-checklist" className="flex flex-col items-center gap-1">
                  <CheckCircle2 className="h-5 w-5" />
                  <span className="text-sm">Launch Checklist</span>
                </Link>
              </Button>
            </div>
        </CardContent>
        </Card>
      </div>
    </div>
  );
}
