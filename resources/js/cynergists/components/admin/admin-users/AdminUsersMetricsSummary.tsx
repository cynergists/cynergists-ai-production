import { Loader2, Users } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface AdminUsersMetricsSummaryProps {
  total: number;
  loading: boolean;
}

export function AdminUsersMetricsSummary({
  total,
  loading,
}: AdminUsersMetricsSummaryProps) {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-4">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-4">
            <div className="p-2 bg-primary/10 rounded-full">
              <Users className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Registered Users</p>
              <p className="text-2xl font-bold">{total}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
