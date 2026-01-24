import { Helmet } from "react-helmet";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FlaskConical, Sparkles, Zap, BarChart3 } from "lucide-react";

const betaPrograms = [
  {
    id: 'ai-lead-scoring',
    title: 'AI Lead Scoring',
    description: 'Get AI-powered insights on your referrals to help prioritize follow-ups.',
    icon: Sparkles,
    status: 'coming_soon',
  },
  {
    id: 'instant-payouts',
    title: 'Instant Payouts',
    description: 'Receive your commissions within 24 hours of deal closure.',
    icon: Zap,
    status: 'coming_soon',
  },
  {
    id: 'advanced-analytics',
    title: 'Advanced Analytics Dashboard',
    description: 'Deep dive into your referral performance with advanced metrics and forecasting.',
    icon: BarChart3,
    status: 'coming_soon',
  },
];

export default function PartnerBeta() {
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'enrolled':
        return <Badge className="bg-green-500">Enrolled</Badge>;
      case 'waitlist':
        return <Badge className="bg-yellow-500">On Waitlist</Badge>;
      default:
        return <Badge variant="outline">Coming Soon</Badge>;
    }
  };

  return (
    <>
      <Helmet>
        <title>Beta Programs | Partner Portal | Cynergists</title>
      </Helmet>

      <div className="p-6 space-y-6">
        <div className="flex items-start gap-4">
          <div className="p-3 rounded-lg bg-primary/10">
            <FlaskConical className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Beta Programs</h1>
            <p className="text-muted-foreground">
              Get early access to new features and help shape the future of our partner platform
            </p>
          </div>
        </div>

        <div className="grid gap-6">
          {betaPrograms.map((program) => (
            <Card key={program.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4">
                    <div className="p-2 rounded-lg bg-muted">
                      <program.icon className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{program.title}</CardTitle>
                      <CardDescription className="mt-1">{program.description}</CardDescription>
                    </div>
                  </div>
                  {getStatusBadge(program.status)}
                </div>
              </CardHeader>
              <CardContent>
                <Button 
                  variant="outline" 
                  disabled={program.status === 'coming_soon'}
                >
                  {program.status === 'enrolled' 
                    ? 'View Details' 
                    : program.status === 'waitlist'
                    ? 'View Waitlist Position'
                    : 'Join Waitlist'}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card className="bg-muted/50">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <FlaskConical className="h-8 w-8 text-primary" />
              <div>
                <h3 className="font-semibold mb-1">Have a feature idea?</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  We're always looking for ways to improve the partner experience. 
                  Share your ideas and suggestions with our team.
                </p>
                <Button variant="outline">Submit Feature Request</Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
