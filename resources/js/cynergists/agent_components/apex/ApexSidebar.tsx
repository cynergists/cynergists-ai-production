import React from "react";
import { Button } from "@/components/ui/button";
import { 
  MessageSquare,
  LayoutDashboard,
  Target,
  Users,
  Activity,
  TrendingUp,
  Calendar,
  CircleCheck
} from "lucide-react";
import { cn } from "@/lib/utils";

interface ApexSidebarProps {
  activeView: string;
  setActiveView: (view: string) => void;
  todayActivity: {
    connectionsRequested: number;
    connectionsMade: number;
    messagesSent: number;
    meetingsScheduled: number;
  };
}

export default function ApexSidebar({ activeView, setActiveView, todayActivity }: ApexSidebarProps) {
  return (
    <div className="hidden lg:flex w-[300px] shrink-0 flex-col gap-6 min-h-0 transition-all duration-300">
      {/* Quick Links */}
      <div className="bg-card border border-primary/20 rounded-2xl p-5 flex flex-col">
        <h2 className="text-lg font-semibold text-foreground mb-4 shrink-0">Quick Links</h2>
        <nav className="flex flex-col space-y-2">
          <button
            onClick={() => setActiveView("chat")}
            className={cn(
              "flex items-center gap-3 text-left text-base font-medium py-3 px-4 rounded-xl transition-all duration-200 border-l-3",
              activeView === "chat"
                ? "text-primary border-l-primary bg-primary/10"
                : "text-foreground/70 hover:text-foreground hover:bg-muted/50 border-l-transparent"
            )}
          >
            <MessageSquare className="w-5 h-5 shrink-0" />
            Chat
          </button>
          <button
            onClick={() => setActiveView("dashboard")}
            className={cn(
              "flex items-center gap-3 text-left text-base font-medium py-3 px-4 rounded-xl transition-all duration-200 border-l-3",
              activeView === "dashboard"
                ? "text-primary border-l-primary bg-primary/10"
                : "text-foreground/70 hover:text-foreground hover:bg-muted/50 border-l-transparent"
            )}
          >
            <LayoutDashboard className="w-5 h-5 shrink-0" />
            Dashboard
          </button>
          <button
            onClick={() => setActiveView("campaigns")}
            className={cn(
              "flex items-center gap-3 text-left text-base font-medium py-3 px-4 rounded-xl transition-all duration-200 border-l-3",
              activeView === "campaigns"
                ? "text-primary border-l-primary bg-primary/10"
                : "text-foreground/70 hover:text-foreground hover:bg-muted/50 border-l-transparent"
            )}
          >
            <Target className="w-5 h-5 shrink-0" />
            Campaigns
          </button>
          <button
            onClick={() => setActiveView("connections")}
            className={cn(
              "flex items-center gap-3 text-left text-base font-medium py-3 px-4 rounded-xl transition-all duration-200 border-l-3",
              activeView === "connections"
                ? "text-primary border-l-primary bg-primary/10"
                : "text-foreground/70 hover:text-foreground hover:bg-muted/50 border-l-transparent"
            )}
          >
            <Users className="w-5 h-5 shrink-0" />
            Connections
          </button>
          <button
            onClick={() => setActiveView("messages")}
            className={cn(
              "flex items-center gap-3 text-left text-base font-medium py-3 px-4 rounded-xl transition-all duration-200 border-l-3",
              activeView === "messages"
                ? "text-primary border-l-primary bg-primary/10"
                : "text-foreground/70 hover:text-foreground hover:bg-muted/50 border-l-transparent"
            )}
          >
            <MessageSquare className="w-5 h-5 shrink-0" />
            Messages
          </button>
          <button
            onClick={() => setActiveView("activity")}
            className={cn(
              "flex items-center gap-3 text-left text-base font-medium py-3 px-4 rounded-xl transition-all duration-200 border-l-3",
              activeView === "activity"
                ? "text-primary border-l-primary bg-primary/10"
                : "text-foreground/70 hover:text-foreground hover:bg-muted/50 border-l-transparent"
            )}
          >
            <Activity className="w-5 h-5 shrink-0" />
            Activity Log
          </button>
        </nav>
      </div>

      {/* Today's Activity */}
      <div className="bg-card border border-primary/20 rounded-2xl p-5 flex-1 flex flex-col overflow-hidden min-h-0">
        <h2 className="text-lg font-semibold text-foreground mb-4 shrink-0">Today&apos;s Activity</h2>
        <div className="flex-1 overflow-y-auto">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  <Users className="w-4 h-4 text-primary" />
                </div>
                <span className="text-sm text-foreground">Connections Requested</span>
              </div>
              <span className="text-lg font-semibold text-foreground">{todayActivity.connectionsRequested}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  <CircleCheck className="w-4 h-4 text-primary" />
                </div>
                <span className="text-sm text-foreground">Connections Made</span>
              </div>
              <span className="text-lg font-semibold text-foreground">{todayActivity.connectionsMade}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  <MessageSquare className="w-4 h-4 text-primary" />
                </div>
                <span className="text-sm text-foreground">Messages Sent</span>
              </div>
              <span className="text-lg font-semibold text-foreground">{todayActivity.messagesSent}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  <Calendar className="w-4 h-4 text-primary" />
                </div>
                <span className="text-sm text-foreground">Meetings Scheduled</span>
              </div>
              <span className="text-lg font-semibold text-foreground">{todayActivity.meetingsScheduled}</span>
            </div>
          </div>
        </div>
        <div className="pt-4 border-t border-primary/20 shrink-0">
          <Button
            variant="outline"
            className="w-full h-9 text-sm font-medium gap-2 hover:bg-primary/10 hover:text-primary hover:border-primary/40"
          >
            <TrendingUp className="w-4 h-4" />
            View Full Report
          </Button>
        </div>
      </div>
    </div>
  );
}
