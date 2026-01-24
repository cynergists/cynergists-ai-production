import { Check, X, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Link } from "@inertiajs/react";

export interface ChecklistItem {
  label: string;
  completed: boolean;
  anchor?: string;
}

interface ActivationChecklistProps {
  items: ChecklistItem[];
  showCTA?: boolean;
}

export function ActivationChecklist({ items, showCTA = true }: ActivationChecklistProps) {
  const incompleteItems = items.filter(item => !item.completed);
  const firstIncomplete = incompleteItems[0];
  
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        {items.map((item, index) => (
          <div
            key={index}
            className={cn(
              "flex items-center gap-3 p-3 rounded-lg border",
              item.completed
                ? "bg-green-500/10 border-green-500/20"
                : "bg-muted/50 border-border"
            )}
          >
            <div
              className={cn(
                "flex items-center justify-center w-6 h-6 rounded-full",
                item.completed
                  ? "bg-green-500 text-white"
                  : "bg-muted-foreground/20 text-muted-foreground"
              )}
            >
              {item.completed ? (
                <Check className="h-4 w-4" />
              ) : (
                <X className="h-4 w-4" />
              )}
            </div>
            <span
              className={cn(
                "text-sm",
                item.completed ? "text-green-600 dark:text-green-400" : "text-foreground"
              )}
            >
              {item.label}
            </span>
          </div>
        ))}
      </div>
      
      {showCTA && incompleteItems.length > 0 && (
        <Button asChild className="w-full">
          <Link href={`/partner/settings${firstIncomplete?.anchor ? `#${firstIncomplete.anchor}` : ''}`}>
            Complete activation steps
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      )}
    </div>
  );
}

// Helper function to build checklist from partner data
export function buildActivationChecklist(partner: {
  email_verified?: boolean;
  profile_complete?: boolean;
  tax_status?: string;
  payout_status?: string;
  has_fraud_flag?: boolean;
} | null): ChecklistItem[] {
  if (!partner) return [];
  
  return [
    { label: "Email verified", completed: partner.email_verified ?? false, anchor: "" },
    { label: "Profile complete", completed: partner.profile_complete ?? false, anchor: "profile" },
    { label: "W-9 submitted", completed: ['submitted', 'verified'].includes(partner.tax_status ?? ''), anchor: "tax" },
    { label: "Payout method verified", completed: partner.payout_status === 'verified', anchor: "payouts" },
    { label: "No fraud flags", completed: !(partner.has_fraud_flag ?? false), anchor: "" },
  ];
}
