import { useEffect, useState } from "react";
import { Link, router, usePage } from "@inertiajs/react";
import { Helmet } from "react-helmet";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Loader2, CheckCircle2, XCircle, AlertCircle, ArrowLeft } from "lucide-react";
import cynergistsLogo from "@/assets/cynergists-logo-new.png";

type ApprovalStatus = "loading" | "pending" | "approved" | "rejected" | "already_processed" | "error" | "not_found";

interface ApprovalRequest {
  id: string;
  requester_email: string;
  requester_name: string;
  status: string;
  created_at: string;
}

export default function ApproveUser() {
  const { url } = usePage();
  const searchParams = new URLSearchParams(url.split("?")[1] ?? "");
  const { toast } = useToast();
  
  const token = searchParams.get("token");
  const actionParam = searchParams.get("action") as "approve" | "reject" | null;
  
  const [status, setStatus] = useState<ApprovalStatus>("loading");
  const [approvalRequest, setApprovalRequest] = useState<ApprovalRequest | null>(null);
  const [processing, setProcessing] = useState(false);
  const [notes, setNotes] = useState("");
  const [result, setResult] = useState<{ action: string; message: string } | null>(null);

  useEffect(() => {
    if (!token) {
      setStatus("not_found");
      return;
    }
    
    fetchApprovalRequest();
  }, [token]);

  // Auto-process if action is provided in URL
  useEffect(() => {
    if (status === "pending" && actionParam && approvalRequest) {
      handleAction(actionParam);
    }
  }, [status, actionParam, approvalRequest]);

  const fetchApprovalRequest = async () => {
    try {
      // Check if user is authenticated and is an admin
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        // If not logged in, redirect to signin with return URL
        sessionStorage.setItem("redirect_after_login", `/admin/approve-user?token=${token}${actionParam ? `&action=${actionParam}` : ""}`);
        router.visit("/signin");
        return;
      }

      // Check admin status
      const { data: adminData, error: adminError } = await supabase.functions.invoke("check-admin-status", {
        headers: { Authorization: `Bearer ${session.access_token}` },
      });

      if (adminError || !adminData?.isAdmin) {
        if (adminData?.isPending) {
          toast({
            title: "Access pending",
            description: "Your admin access is still pending approval. You cannot approve other requests yet.",
            variant: "destructive",
          });
        } else {
          toast({
            title: "Access denied",
            description: "You must be an approved admin to process these requests.",
            variant: "destructive",
          });
        }
        router.visit("/");
        return;
      }

      // Fetch the approval request using the edge function
      const { data, error } = await supabase
        .from("admin_approval_requests")
        .select("*")
        .eq("approval_token", token)
        .single();

      if (error || !data) {
        console.error("Approval request not found:", error);
        setStatus("not_found");
        return;
      }

      setApprovalRequest(data);
      
      if (data.status !== "pending") {
        setStatus("already_processed");
        setResult({
          action: data.status,
          message: `This request was already ${data.status}.`,
        });
      } else {
        setStatus("pending");
      }
    } catch (error) {
      console.error("Error fetching approval request:", error);
      setStatus("error");
    }
  };

  const handleAction = async (action: "approve" | "reject") => {
    if (!token || processing) return;
    
    setProcessing(true);
    
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      const { data, error } = await supabase.functions.invoke("approve-admin-request", {
        body: {
          token,
          action,
          review_notes: notes || undefined,
          reviewer_id: session?.user?.id,
        },
      });

      if (error) {
        throw error;
      }

      setResult(data);
      setStatus(action === "approve" ? "approved" : "rejected");
      
      toast({
        title: action === "approve" ? "Access Approved" : "Request Rejected",
        description: data.message,
      });
    } catch (error) {
      console.error("Error processing approval:", error);
      toast({
        title: "Error",
        description: "Failed to process the approval request. Please try again.",
        variant: "destructive",
      });
      setStatus("error");
    } finally {
      setProcessing(false);
    }
  };

  const renderContent = () => {
    switch (status) {
      case "loading":
        return (
          <div className="text-center py-12">
            <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
            <p className="text-muted-foreground">Loading approval request...</p>
          </div>
        );

      case "not_found":
        return (
          <div className="text-center py-12">
            <AlertCircle className="h-16 w-16 text-destructive mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">Invalid Request</h2>
            <p className="text-muted-foreground mb-6">
              This approval link is invalid or has expired.
            </p>
            <Link href="/admin/users">
              <Button>Go to Admin Users</Button>
            </Link>
          </div>
        );

      case "already_processed":
        return (
          <div className="text-center py-12">
            <AlertCircle className="h-16 w-16 text-amber-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">Already Processed</h2>
            <p className="text-muted-foreground mb-2">
              This request has already been {approvalRequest?.status}.
            </p>
            {approvalRequest && (
              <p className="text-sm text-muted-foreground mb-6">
                Request for: <strong>{approvalRequest.requester_name}</strong> ({approvalRequest.requester_email})
              </p>
            )}
            <Link href="/admin/users">
              <Button>Go to Admin Users</Button>
            </Link>
          </div>
        );

      case "approved":
        return (
          <div className="text-center py-12">
            <CheckCircle2 className="h-16 w-16 text-green-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2 text-green-600">Access Approved!</h2>
            <p className="text-muted-foreground mb-2">
              {result?.message}
            </p>
            <p className="text-sm text-muted-foreground mb-6">
              They will receive an email notification with access instructions.
            </p>
            <Link href="/admin/users">
              <Button>Go to Admin Users</Button>
            </Link>
          </div>
        );

      case "rejected":
        return (
          <div className="text-center py-12">
            <XCircle className="h-16 w-16 text-destructive mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">Request Rejected</h2>
            <p className="text-muted-foreground mb-2">
              {result?.message}
            </p>
            <p className="text-sm text-muted-foreground mb-6">
              They have been notified and set as a client user.
            </p>
            <Link href="/admin/users">
              <Button>Go to Admin Users</Button>
            </Link>
          </div>
        );

      case "error":
        return (
          <div className="text-center py-12">
            <AlertCircle className="h-16 w-16 text-destructive mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">Something Went Wrong</h2>
            <p className="text-muted-foreground mb-6">
              There was an error processing this request. Please try again.
            </p>
            <Button onClick={fetchApprovalRequest}>Try Again</Button>
          </div>
        );

      case "pending":
        return (
          <div className="space-y-6">
            <div className="bg-muted/50 rounded-lg p-4">
              <h3 className="font-semibold mb-2">Requester Details</h3>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <span className="text-muted-foreground">Name:</span>
                <span className="font-medium">{approvalRequest?.requester_name || "Not provided"}</span>
                <span className="text-muted-foreground">Email:</span>
                <span className="font-medium">{approvalRequest?.requester_email}</span>
                <span className="text-muted-foreground">Requested:</span>
                <span className="font-medium">
                  {approvalRequest?.created_at
                    ? new Date(approvalRequest.created_at).toLocaleDateString("en-US", {
                        month: "long",
                        day: "numeric",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })
                    : "Unknown"}
                </span>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notes (optional)</Label>
              <Textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add any notes about this decision..."
                rows={3}
              />
            </div>

            <div className="flex gap-4">
              <Button
                onClick={() => handleAction("approve")}
                disabled={processing}
                className="flex-1 bg-green-600 hover:bg-green-700"
              >
                {processing ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                )}
                Approve Access
              </Button>
              <Button
                onClick={() => handleAction("reject")}
                disabled={processing}
                variant="destructive"
                className="flex-1"
              >
                {processing ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <XCircle className="h-4 w-4 mr-2" />
                )}
                Reject Request
              </Button>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <>
      <Helmet>
        <title>Admin Approval | Cynergists</title>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>

      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-lg">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <img src={cynergistsLogo} alt="Cynergists" className="h-10" />
            </div>
            <CardTitle className="text-2xl">Admin Access Request</CardTitle>
            <CardDescription>
              Review and approve or reject admin access requests
            </CardDescription>
          </CardHeader>
          <CardContent>{renderContent()}</CardContent>
        </Card>
      </div>
    </>
  );
}
