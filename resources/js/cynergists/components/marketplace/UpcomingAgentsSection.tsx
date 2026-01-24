import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Bell, Sparkles } from "lucide-react";

interface UpcomingAgentsSectionProps {
  className?: string;
}

export function UpcomingAgentsSection({ className }: UpcomingAgentsSectionProps) {
  return (
    <section className={className}>
      <div className="px-4 md:px-0 mb-6">
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
          Next up.{" "}
          <span className="font-normal text-muted-foreground">Get notified when they launch.</span>
        </h1>
      </div>
      
      <div className="px-4 md:px-0">
        <Card className="border-dashed border-2 border-border/50 bg-muted/20">
          <CardContent className="py-12 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-lime-500/10 mb-4">
              <Sparkles className="h-8 w-8 text-accent dark:text-lime-400" />
            </div>
            <h3 className="text-xl font-semibold mb-2">New agents are in development</h3>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              We're building more AI agents to help you scale. Be the first to know when they're ready.
            </p>
            <Button className="bg-lime-500 hover:bg-lime-600 text-black">
              <Bell className="mr-2 h-4 w-4" />
              Notify Me
            </Button>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
