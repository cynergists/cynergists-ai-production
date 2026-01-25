import { useState, useEffect, useCallback } from 'react';
import { AlertTriangle, Loader2, Send, Users, ChevronRight, ChevronLeft } from 'lucide-react';
import { Button } from '@cy/components/ui/button';
import { Label } from '@cy/components/ui/label';
import { Textarea } from '@cy/components/ui/textarea';
import { Input } from '@cy/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@cy/components/ui/dialog';
import { Alert, AlertDescription } from '@cy/components/ui/alert';
import { toast } from 'sonner';
import { useAdminApi } from '@cy/hooks/useAdminApi';
import { supabase } from '@cy/integrations/supabase/client';
import RichTextEditor from './RichTextEditor';

interface CreateVersionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (data: { changeSummary: string; effectiveDate: string }) => Promise<void>;
  currentVersion: number;
  templateId: string;
  documentType: "msa" | "terms" | "privacy" | "partner" | "sales_reps";
}

const getDocumentTypeLabel = (type: string): string => {
  switch (type) {
    case "msa": return "Master Services Agreement";
    case "terms": return "Terms & Conditions";
    case "privacy": return "Privacy Policy";
    case "partner": return "Partner Agreement";
    case "sales_reps": return "Sales Agreement";
    default: return "Document";
  }
};

const DEFAULT_EMAIL_TEMPLATE = `Hi {{First Name}},

We've made an update to one of our agreements to ensure it remains clear, current, and aligned with how we operate.

What changed: {{Agreement Name}}
Effective date: {{Effective Date}}

No action is required from you unless otherwise noted. Continued use of our services after the effective date constitutes acceptance of the updated terms.

You can review the updated agreement here: {{Agreement Link}}

If you have questions, reply to this email and our team will help.

Thank you,
The Cynergists`;

export function CreateVersionModal({ 
  open, 
  onOpenChange, 
  onConfirm,
  currentVersion,
  templateId,
  documentType
}: CreateVersionModalProps) {
  const { callApi } = useAdminApi();
  
  // Step management (1 = version info, 2 = notify customers)
  const [step, setStep] = useState<1 | 2>(1);
  
  // Step 1 state
  const [changeSummary, setChangeSummary] = useState('');
  const [effectiveDate] = useState(new Date().toISOString().split('T')[0]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Step 2 state
  const [emailSubject, setEmailSubject] = useState('');
  const [emailBody, setEmailBody] = useState('');
  const [isLoadingTemplate, setIsLoadingTemplate] = useState(false);
  const [isSendingEmails, setIsSendingEmails] = useState(false);
  const [recipientsCount, setRecipientsCount] = useState<number | null>(null);
  const [skipNotification, setSkipNotification] = useState(false);

  const formatVersion = (version: number) => {
    const major = Math.floor(version / 10);
    const minor = version % 10;
    return `${major}.${minor}`;
  };

  const nextVersion = currentVersion + 1;

  // Load email template when entering step 2
  const loadEmailTemplate = useCallback(async () => {
    setIsLoadingTemplate(true);
    try {
      const [template, countResult] = await Promise.all([
        callApi<{ subject: string; body: string }>("get_notification_email_template", { type: documentType }),
        callApi<{ count: number }>("get_signed_clients_count"),
      ]);

      if (template?.subject) {
        setEmailSubject(template.subject);
      } else {
        setEmailSubject(`Update to our ${getDocumentTypeLabel(documentType)}`);
      }
      
      if (template?.body) {
        setEmailBody(template.body);
      } else {
        setEmailBody(DEFAULT_EMAIL_TEMPLATE);
      }
      
      if (countResult) {
        setRecipientsCount(countResult.count);
      }
    } catch (err) {
      console.error("Error loading email template:", err);
      // Use defaults
      setEmailSubject(`Update to our ${getDocumentTypeLabel(documentType)}`);
      setEmailBody(DEFAULT_EMAIL_TEMPLATE);
    } finally {
      setIsLoadingTemplate(false);
    }
  }, [callApi, documentType]);

  // Reset state when modal opens/closes
  useEffect(() => {
    if (open) {
      setStep(1);
      setChangeSummary('');
      setError(null);
      setSkipNotification(false);
    }
  }, [open]);

  // Load email template when step 2 is reached
  useEffect(() => {
    if (open && step === 2) {
      loadEmailTemplate();
    }
  }, [open, step, loadEmailTemplate]);

  const handleCreateVersion = async () => {
    if (changeSummary.length < 10) {
      setError('Change summary must be at least 10 characters');
      return;
    }

    setError(null);
    setIsSubmitting(true);

    try {
      await onConfirm({ changeSummary, effectiveDate });
      // Move to step 2 after successful version creation
      setStep(2);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create new version');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSendEmails = async () => {
    if (!emailSubject.trim() || !emailBody.trim()) {
      toast.error("Please fill in subject and email body");
      return;
    }

    setIsSendingEmails(true);
    try {
      // Save the updated template for future use
      await callApi("update_notification_email_template", { type: documentType }, {
        subject: emailSubject,
        body: emailBody,
      });

      // Send the emails
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
            subject: emailSubject,
            emailBody: emailBody,
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

      onOpenChange(false);
    } catch (err) {
      console.error("Error sending emails:", err);
      toast.error("Failed to send notification emails");
    } finally {
      setIsSendingEmails(false);
    }
  };

  const handleSkipNotification = () => {
    toast.success("Version created successfully");
    onOpenChange(false);
  };

  const handleClose = () => {
    if (!isSubmitting && !isSendingEmails) {
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className={step === 1 ? "sm:max-w-lg" : "max-w-3xl h-[600px] flex flex-col"}>
        {step === 1 ? (
          <>
            <DialogHeader>
              <DialogTitle>Create New Agreement Version?</DialogTitle>
              <DialogDescription className="pt-2">
                <span className="font-medium text-foreground">
                  v{formatVersion(currentVersion)} → v{formatVersion(nextVersion)}
                </span>
              </DialogDescription>
            </DialogHeader>

            <Alert className="bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800">
              <AlertTriangle className="h-4 w-4 text-amber-600" />
              <AlertDescription className="text-amber-800 dark:text-amber-200 text-sm">
                <ul className="list-disc ml-4 space-y-1">
                  <li>This will create a new version of this agreement.</li>
                  <li>The current version will be archived and locked.</li>
                  <li>Existing signed agreements will remain bound to their original version.</li>
                  <li>Your user name will be added in the change log.</li>
                </ul>
              </AlertDescription>
            </Alert>

            <div className="space-y-4 py-2">
              <div className="space-y-2">
                <Label htmlFor="changeSummary">
                  Change Summary <span className="text-destructive">*</span>
                </Label>
                <Textarea
                  id="changeSummary"
                  placeholder="Describe what changed in this version (min 10 characters)..."
                  value={changeSummary}
                  onChange={(e) => setChangeSummary(e.target.value)}
                  className="min-h-[80px]"
                />
                <p className="text-xs text-muted-foreground">
                  {changeSummary.length}/10 characters minimum
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="effectiveDate">Effective Date</Label>
                <Input
                  id="effectiveDate"
                  type="date"
                  value={effectiveDate}
                  disabled
                  className="bg-muted cursor-not-allowed"
                />
                <p className="text-xs text-muted-foreground">
                  Effective date is set to today's date
                </p>
              </div>
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <DialogFooter>
              <Button variant="outline" onClick={handleClose} disabled={isSubmitting}>
                Cancel
              </Button>
              <Button 
                onClick={handleCreateVersion} 
                disabled={isSubmitting || changeSummary.length < 10}
                className="gap-2"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    Create New Version & Next
                    <ChevronRight className="h-4 w-4" />
                  </>
                )}
              </Button>
            </DialogFooter>
          </>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Send className="h-5 w-5" />
                Notify Customers
              </DialogTitle>
              <DialogDescription>
                Send an email to all customers with signed agreements about the {getDocumentTypeLabel(documentType)} update (Version {formatVersion(nextVersion)}).
              </DialogDescription>
            </DialogHeader>

            <div className="flex-1 flex flex-col gap-4 min-h-0 mt-4">
              {isLoadingTemplate ? (
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
                      value={emailSubject}
                      onChange={(e) => setEmailSubject(e.target.value)}
                      placeholder="Enter email subject..."
                    />
                  </div>

                  {/* Email Body Editor */}
                  <div className="space-y-2 flex-1 min-h-0 flex flex-col">
                    <Label>Email Body</Label>
                    <div className="border rounded-md overflow-hidden flex-1 min-h-0 max-h-[280px] bg-white">
                      <RichTextEditor
                        content={emailBody}
                        onChange={setEmailBody}
                        placeholder="Enter email body..."
                      />
                    </div>
                  </div>
                </>
              )}
            </div>

            <DialogFooter className="gap-2">
              <Button
                variant="outline"
                onClick={handleSkipNotification}
                disabled={isSendingEmails}
              >
                Skip Notification
              </Button>
              <Button
                onClick={handleSendEmails}
                disabled={isLoadingTemplate || isSendingEmails || recipientsCount === 0 || !emailSubject.trim() || !emailBody.trim()}
                className="gap-2 bg-lime-400 text-gray-900 hover:bg-lime-500"
              >
                {isSendingEmails ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
                Send to {recipientsCount || 0} Customer{(recipientsCount || 0) !== 1 ? 's' : ''}
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
