import { Link } from "@inertiajs/react";
import { 
  Users, 
  Briefcase, 
  DollarSign, 
  TrendingUp,
  ArrowRight,
  Copy,
  ExternalLink,
  Clock,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { usePartnerDashboard } from "@/hooks/usePartnerDashboard";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { usePartnerContext } from "@/contexts/PartnerContext";

export default function PartnerDashboard() {
  const { partner, status } = usePartnerContext();
  const { stats, isLoading } = usePartnerDashboard(partner?.id);
  const { toast } = useToast();

  const partnerLink = partner?.slug 
    ? `${window.location.origin}/p/${partner.slug}`
    : null;

  const copyLink = () => {
    if (partnerLink) {
      navigator.clipboard.writeText(partnerLink);
      toast({
        title: "Link copied!",
        description: "Your referral link has been copied to clipboard.",
      });
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const isPending = status === 'pending';

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Partner Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Welcome back, {partner?.first_name || 'Partner'}! Here's your performance overview.
          </p>
        </div>
        
        {partnerLink && (
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 px-4 py-2 bg-muted rounded-lg">
              <span className="text-sm text-muted-foreground truncate max-w-[200px]">
                {partnerLink}
              </span>
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={copyLink}>
                <Copy className="h-4 w-4" />
              </Button>
              <a href={partnerLink} target="_blank" rel="noopener noreferrer">
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <ExternalLink className="h-4 w-4" />
                </Button>
              </a>
            </div>
          </div>
        )}
      </div>

      {/* Pending Partner Notice */}
      {isPending && (
        <Card className="border-yellow-500/50 bg-yellow-500/10">
          <CardContent className="flex items-start gap-4 py-4">
            <div className="h-10 w-10 rounded-full bg-yellow-500/20 flex items-center justify-center flex-shrink-0">
              <Clock className="h-5 w-5 text-yellow-500" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground">Account Pending Activation</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Your partner account is being reviewed. You can view deals and commissions, access the marketing center, 
                and generate referral links. Full payout and reporting features will be available once your account is activated.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Referrals</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <div className="text-2xl font-bold">{stats?.total_referrals || 0}</div>
            )}
            <p className="text-xs text-muted-foreground mt-1">
              {stats?.qualified_referrals || 0} qualified
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Closed Deals</CardTitle>
            <Briefcase className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <div className="text-2xl font-bold">{stats?.closed_won_deals || 0}</div>
            )}
            <p className="text-xs text-muted-foreground mt-1">
              {formatCurrency(stats?.total_deal_value || 0)} total value
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Pending Commissions</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-20" />
            ) : (
              <div className="text-2xl font-bold text-primary">
                {formatCurrency(
                  (stats?.pending_commissions || 0) + 
                  (stats?.earned_commissions || 0) + 
                  (stats?.payable_commissions || 0)
                )}
              </div>
            )}
            <p className="text-xs text-muted-foreground mt-1">
              {formatCurrency(stats?.payable_commissions || 0)} ready for payout
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Earned</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-24" />
            ) : (
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                {formatCurrency(stats?.paid_commissions || 0)}
              </div>
            )}
            <p className="text-xs text-muted-foreground mt-1">
              Lifetime earnings
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="hover:border-primary/50 transition-colors">
          <Link href="/partner/referrals">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-primary" />
                Submit Referral
              </CardTitle>
              <CardDescription>
                Register a new lead for attribution
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="ghost" className="gap-2 p-0 h-auto">
                Go to Referrals <ArrowRight className="h-4 w-4" />
              </Button>
            </CardContent>
          </Link>
        </Card>

        <Card className="hover:border-primary/50 transition-colors">
          <Link href="/partner/marketing">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ExternalLink className="h-5 w-5 text-primary" />
                Marketing Center
              </CardTitle>
              <CardDescription>
                Access copy, creatives, and templates
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="ghost" className="gap-2 p-0 h-auto">
                View Resources <ArrowRight className="h-4 w-4" />
              </Button>
            </CardContent>
          </Link>
        </Card>

        <Card className="hover:border-primary/50 transition-colors">
          <Link href="/partner/commissions">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-primary" />
                View Commissions
              </CardTitle>
              <CardDescription>
                Track your earnings and payouts
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="ghost" className="gap-2 p-0 h-auto">
                View Details <ArrowRight className="h-4 w-4" />
              </Button>
            </CardContent>
          </Link>
        </Card>
      </div>

      {/* Next Payout Info (Active partners only) */}
      {status === 'active' && stats?.next_payout_date && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-500" />
              Upcoming Payout
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Scheduled for</p>
                <p className="text-lg font-semibold">
                  {new Date(stats.next_payout_date).toLocaleDateString('en-US', {
                    month: 'long',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm text-muted-foreground">Amount</p>
                <p className="text-2xl font-bold text-primary">
                  {formatCurrency(stats.next_payout_amount)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Commission Rate Info */}
      <Card>
        <CardHeader>
          <CardTitle>Your Commission Structure</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
              <span className="text-2xl font-bold text-primary">
                {Math.round((partner?.commission_rate || 0.2) * 100)}%
              </span>
            </div>
            <div>
              <p className="font-medium">Flat Commission Rate</p>
              <p className="text-sm text-muted-foreground">
                Earn {Math.round((partner?.commission_rate || 0.2) * 100)}% on all products and services. 
                Commissions are paid monthly on the 1st after a 30-day clawback window.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
