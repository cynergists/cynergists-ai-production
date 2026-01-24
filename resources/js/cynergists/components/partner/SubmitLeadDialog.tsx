import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

interface SubmitLeadDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  partnerId: string;
  partnerSlug: string | null;
}

export function SubmitLeadDialog({ open, onOpenChange, partnerId, partnerSlug }: SubmitLeadDialogProps) {
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    lead_name: "",
    lead_email: "",
    lead_phone: "",
    lead_company: "",
    notes: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.lead_name || !form.lead_email) {
      toast.error("Name and email are required");
      return;
    }

    setSubmitting(true);
    try {
      const { error } = await supabase.from("referrals").insert({
        partner_id: partnerId,
        lead_name: form.lead_name,
        lead_email: form.lead_email,
        lead_phone: form.lead_phone || null,
        lead_company: form.lead_company || null,
        notes: form.notes || null,
        source: "deal_registration" as const,
        event_type: "manual_submit",
        status: "needs_approval" as const,
        needs_approval: true,
      });

      if (error) throw error;

      toast.success("Lead submitted successfully");
      setForm({ lead_name: "", lead_email: "", lead_phone: "", lead_company: "", notes: "" });
      onOpenChange(false);
    } catch (error) {
      console.error("Error submitting lead:", error);
      toast.error("Failed to submit lead");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Submit a Lead</DialogTitle>
          <DialogDescription>
            Enter your referral's information. We'll reach out and keep you updated on progress.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 pt-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="lead_name">Name *</Label>
              <Input
                id="lead_name"
                value={form.lead_name}
                onChange={(e) => setForm({ ...form, lead_name: e.target.value })}
                placeholder="John Smith"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lead_email">Email *</Label>
              <Input
                id="lead_email"
                type="email"
                value={form.lead_email}
                onChange={(e) => setForm({ ...form, lead_email: e.target.value })}
                placeholder="john@company.com"
                required
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="lead_phone">Phone</Label>
              <Input
                id="lead_phone"
                value={form.lead_phone}
                onChange={(e) => setForm({ ...form, lead_phone: e.target.value })}
                placeholder="(555) 123-4567"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lead_company">Company</Label>
              <Input
                id="lead_company"
                value={form.lead_company}
                onChange={(e) => setForm({ ...form, lead_company: e.target.value })}
                placeholder="Acme Inc"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              placeholder="Any additional context about this lead..."
              rows={3}
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Submit Lead
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
