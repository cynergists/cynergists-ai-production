import { useState, useEffect, useCallback } from "react";
import { 
  Mail, 
  Loader2,
  Send,
  Users,
  History,
  CheckCircle,
  XCircle,
  AlertCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { useAdminApi } from "@/hooks/useAdminApi";
import { supabase } from "@/integrations/supabase/client";
import RichTextEditor from "./RichTextEditor";

interface NotifyCustomersDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  templateId: string;
  documentType: "msa" | "terms" | "privacy";
  version: number;
}

interface EmailTemplate {
  id: string;
  document_type: string;
  subject: string;
  body: string;
  updated_at: string;
}

interface PolicyEmailRecord {
  id: string;
  template_id: string;
  document_type: string;
  sent_by: string;
  recipients_count: number;
  sent_at: string;
  status: "sent" | "failed" | "partial";
  document_templates?: {
    title: string;
    document_type: string;
  };
}

const documentTypeLabels: Record<string, string> = {
  msa: "MSA",
  terms: "Terms & Conditions",
  privacy: "Privacy Policy",
};

const statusConfig: Record<string, { icon: React.ReactNode; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  sent: { icon: <CheckCircle className="h-4 w-4" />, variant: "default" },
  failed: { icon: <XCircle className="h-4 w-4" />, variant: "destructive" },
  partial: { icon: <AlertCircle className="h-4 w-4" />, variant: "secondary" },
};

export default function NotifyCustomersDialog({
  open,
  onOpenChange,
  templateId,
  documentType,
  version,
}: NotifyCustomersDialogProps) {
  const { callApi } = useAdminApi();
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [recipientsCount, setRecipientsCount] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<"compose" | "history">("compose");
  const [emailHistory, setEmailHistory] = useState<PolicyEmailRecord[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  // Format version as X.Y
  const formatVersion = (v: number): string => {
    if (v <= 0) return "1.0";
    const major = Math.floor((v - 1) / 10) + 1;
    const minor = (v - 1) % 10;
    return `${major}.${minor}`;
  };

  // Get document type label
  const getDocumentTypeLabel = (type: string): string => {
    switch (type) {
      case "msa": return "Master Services Agreement";
      case "terms": return "Terms & Conditions";
      case "privacy": return "Privacy Policy";
      default: return "Document";
    }
  };

  // Load email template and recipients count
  const loadTemplateAndRecipients = useCallback(async () => {
    setIsLoading(true);
    try {
      const [template, countResult] = await Promise.all([
        callApi<EmailTemplate>("get_notification_email_template", { type: documentType }),
        callApi<{ count: number }>("get_signed_clients_count"),
      ]);

      if (template) {
        setSubject(template.subject);
        setBody(template.body);
      }
      
      if (countResult) {
        setRecipientsCount(countResult.count);
      }
    } catch (error) {
      console.error("Error loading template:", error);
      toast.error("Failed to load email template");
    } finally {
      setIsLoading(false);
    }
  }, [callApi, documentType]);

  // Load email history
  const loadEmailHistory = useCallback(async () => {
    setLoadingHistory(true);
    try {
      const data = await callApi<PolicyEmailRecord[]>("get_policy_update_emails");
      setEmailHistory(data || []);
    } catch (error) {
      console.error("Error loading email history:", error);
    } finally {
      setLoadingHistory(false);
    }
  }, [callApi]);

  useEffect(() => {
    if (open) {
      loadTemplateAndRecipients();
      loadEmailHistory();
    }
  }, [open, loadTemplateAndRecipients, loadEmailHistory]);

  // Save template and send emails
  const handleSendEmails = async () => {
    if (!subject.trim() || !body.trim()) {
      toast.error("Please fill in subject and email body");
      return;
    }

    setIsSending(true);
    try {
      // First, save the updated template
      await callApi("update_notification_email_template", { type: documentType }, {
        subject,
        body,
      });

      // Then send the emails
      const session = await supabase.auth.getSession();
      if (!session.data.session) {
        toast.error("Session expired. Please sign in again.");
        return;
      }

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/send-policy-update-email`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${session.data.session.access_token}`,
            "apikey": import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
          },
          body: JSON.stringify({
            templateId,
            documentType,
            subject,
            emailBody: body,
          }),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to send emails");
      }

      if (result.recipientsCount === 0) {
        toast.info("No customers to notify");
      } else {
        toast.success(`Email sent to ${result.recipientsCount} customer${result.recipientsCount > 1 ? 's' : ''}`);
      }

      // Refresh history after sending
      loadEmailHistory();
      onOpenChange(false);
    } catch (error) {
      console.error("Error sending emails:", error);
      toast.error("Failed to send notification emails");
    } finally {
      setIsSending(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl h-[600px] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Notify Customers
          </DialogTitle>
          <DialogDescription>
            Send an email to all customers with signed agreements about the {getDocumentTypeLabel(documentType)} update (Version {formatVersion(version)}).
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "compose" | "history")} className="flex-1 flex flex-col min-h-0">
          <TabsList className="w-full grid grid-cols-2">
            <TabsTrigger value="compose" className="gap-2">
              <Send className="h-4 w-4" />
              Compose Email
            </TabsTrigger>
            <TabsTrigger value="history" className="gap-2">
              <History className="h-4 w-4" />
              Email History
            </TabsTrigger>
          </TabsList>

          <TabsContent value="compose" className="flex-1 flex flex-col gap-4 min-h-0 mt-4">
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : (
              <>
                {/* Recipients Count */}
                <div className="flex items-center gap-2 text-sm text-muted-foreground bg-muted/50 px-3 py-2 rounded-md">
                  <Users className="h-4 w-4" />
                  <span>
                    {recipientsCount === null ? "Loading..." : 
                     recipientsCount === 0 ? "No customers to notify" :
                     `${recipientsCount} customer${recipientsCount > 1 ? 's' : ''} will receive this email`}
                  </span>
                </div>

                {/* Subject Line */}
                <div className="space-y-2">
                  <Label htmlFor="email-subject">Subject Line</Label>
                  <Input
                    id="email-subject"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    placeholder="Enter email subject..."
                  />
                </div>

                {/* Email Body Editor */}
                <div className="space-y-2 flex-1 min-h-0 flex flex-col">
                  <Label>Email Body</Label>
                  <div className="border rounded-md overflow-hidden flex-1 min-h-0 max-h-[280px] bg-white">
                    <RichTextEditor
                      content={body}
                      onChange={setBody}
                      placeholder="Enter email body..."
                    />
                  </div>
                </div>
              </>
            )}
          </TabsContent>

          <TabsContent value="history" className="flex-1 min-h-0 overflow-auto mt-4 flex flex-col">
            {loadingHistory ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : emailHistory.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <Mail className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p className="font-medium">No emails sent yet</p>
                <p className="text-sm mt-1">Policy update emails will appear here</p>
              </div>
            ) : (
              <div className="space-y-3 flex-none">
                {emailHistory.map((email) => {
                  const status = statusConfig[email.status] || statusConfig.sent;
                  return (
                    <div
                      key={email.id}
                      className="flex items-center justify-between p-4 rounded-lg bg-muted/30 border"
                    >
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                          {status.icon}
                          <Badge variant={status.variant}>{email.status}</Badge>
                        </div>
                        <div>
                          <p className="font-medium">
                            {email.document_templates?.title || documentTypeLabels[email.document_type] || email.document_type}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Sent to {email.recipients_count} {email.recipients_count === 1 ? "client" : "clients"}
                          </p>
                        </div>
                      </div>
                      <div className="text-right text-sm text-muted-foreground">
                        {new Date(email.sent_at).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </TabsContent>
        </Tabs>

        <DialogFooter className="gap-2">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSending}
          >
            Cancel
          </Button>
          {activeTab === "compose" && (
            <Button
              onClick={handleSendEmails}
              disabled={isLoading || isSending || recipientsCount === 0 || !subject.trim() || !body.trim()}
              className="gap-2 bg-lime-400 text-gray-900 hover:bg-lime-500"
            >
              {isSending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
              Send to {recipientsCount || 0} Customer{(recipientsCount || 0) !== 1 ? 's' : ''}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
