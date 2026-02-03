import React from "react";
import { TrendingUp, Target, Calendar } from "lucide-react";

interface ApexConfigProps {
  agentDetails: any;
}

export function ApexConfig({ agentDetails }: ApexConfigProps) {
  return (
    <div className="space-y-4">
      <div className="p-4 bg-muted/30 border border-primary/10 rounded-xl">
        <h3 className="text-sm font-semibold text-foreground mb-3">Growth Metrics</h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-green-500" />
              <span className="text-xs text-muted-foreground">Revenue Growth</span>
            </div>
            <span className="text-sm font-semibold text-foreground">--</span>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Target className="w-4 h-4 text-blue-500" />
              <span className="text-xs text-muted-foreground">Active Campaigns</span>
            </div>
            <span className="text-sm font-semibold text-foreground">0</span>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-purple-500" />
              <span className="text-xs text-muted-foreground">Next Review</span>
            </div>
            <span className="text-sm font-semibold text-foreground">--</span>
          </div>
        </div>
      </div>

      <div className="p-4 bg-muted/30 border border-primary/10 rounded-xl">
        <h3 className="text-sm font-semibold text-foreground mb-2">Quick Actions</h3>
        <div className="space-y-2">
          <button className="w-full text-left text-xs px-3 py-2 rounded-lg bg-background hover:bg-muted transition-colors">
            View Growth Report
          </button>
          <button className="w-full text-left text-xs px-3 py-2 rounded-lg bg-background hover:bg-muted transition-colors">
            Schedule Strategy Call
          </button>
          <button className="w-full text-left text-xs px-3 py-2 rounded-lg bg-background hover:bg-muted transition-colors">
            Analyze Competitors
          </button>
        </div>
      </div>
    </div>
  );
}
