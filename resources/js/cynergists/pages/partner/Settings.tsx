import { useState, useEffect, useRef } from "react";
import { Helmet } from "react-helmet";
import { usePartnerContext } from "@/contexts/PartnerContext";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  User, FileText, Wallet, Shield, Upload, Check, Clock, X, 
  Loader2, AlertCircle, Mail, Key, CheckCircle2 
} from "lucide-react";
import { usePartnerSettings } from "@/hooks/usePartnerSettings";
import { toast } from "sonner";

export default function PartnerSettings() {
  const { partner, status, refetch } = usePartnerContext();
  const { 
    saving, 
    uploadingW9, 
    updateProfile, 
    uploadW9, 
    submitPayoutMethod, 
    changePassword, 
    sendMagicLink,
    toggleMFA 
  } = usePartnerSettings(partner?.id);

  // Profile form state
  const [profileForm, setProfileForm] = useState({
    first_name: "",
    last_name: "",
    phone: "",
    company_name: "",
    website: "",
    address_line1: "",
    address_line2: "",
    city: "",
    state: "",
    postal_code: "",
    country: "US",
  });

  // Payout form state
  const [payoutForm, setPayoutForm] = useState({
    payout_bank_name: "",
    payout_account_type: "checking",
    payout_token_reference: "",
    payout_last4: "",
  });

  // Security form state
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [mfaEnabled, setMfaEnabled] = useState(false);

  // W-9 file input ref
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Initialize form with partner data
  useEffect(() => {
    if (partner) {
      setProfileForm({
        first_name: partner.first_name || "",
        last_name: partner.last_name || "",
        phone: partner.phone || "",
        company_name: partner.company_name || "",
        website: partner.website || "",
        address_line1: partner.address_line1 || "",
        address_line2: partner.address_line2 || "",
        city: partner.city || "",
        state: partner.state || "",
        postal_code: partner.postal_code || "",
        country: partner.country || "US",
      });
      setPayoutForm({
        payout_bank_name: partner.payout_bank_name || "",
        payout_account_type: partner.payout_account_type || "checking",
        payout_token_reference: "",
        payout_last4: partner.payout_last4 || "",
      });
      setMfaEnabled(partner.mfa_enabled || false);
    }
  }, [partner]);

  const getStatusBadge = (statusValue: string, type: 'tax' | 'payout') => {
    const rejectionReason = type === 'tax' ? partner?.tax_rejection_reason : partner?.payout_rejection_reason;
    
    switch (statusValue) {
      case 'verified':
        return <Badge className="bg-green-500"><Check className="h-3 w-3 mr-1" /> Verified</Badge>;
      case 'submitted':
        return <Badge className="bg-yellow-500"><Clock className="h-3 w-3 mr-1" /> Pending Review</Badge>;
      case 'rejected':
        return (
          <div className="flex flex-col gap-1 items-end">
            <Badge variant="destructive"><X className="h-3 w-3 mr-1" /> Rejected</Badge>
            {rejectionReason && (
              <span className="text-xs text-destructive">{rejectionReason}</span>
            )}
          </div>
        );
      default:
        return <Badge variant="outline">Not Started</Badge>;
    }
  };

  const isProfileComplete = profileForm.first_name && profileForm.last_name && profileForm.phone;

  const handleProfileSave = async () => {
    const success = await updateProfile(profileForm);
    if (success) {
      await refetch();
    }
  };

  const handleW9Upload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      toast.error("Please upload a PDF or image file");
      return;
    }

    // Validate file size (10MB max)
    if (file.size > 10 * 1024 * 1024) {
      toast.error("File must be less than 10MB");
      return;
    }

    const success = await uploadW9(file);
    if (success) {
      await refetch();
    }
  };

  const handlePayoutSubmit = async () => {
    if (!payoutForm.payout_bank_name || !payoutForm.payout_token_reference || !payoutForm.payout_last4) {
      toast.error("Please fill in all required fields");
      return;
    }

    if (payoutForm.payout_last4.length !== 4 || !/^\d{4}$/.test(payoutForm.payout_last4)) {
      toast.error("Last 4 digits must be exactly 4 numbers");
      return;
    }

    const success = await submitPayoutMethod(payoutForm);
    if (success) {
      await refetch();
    }
  };

  const handlePasswordChange = async () => {
    if (!passwordForm.currentPassword) {
      toast.error("Please enter your current password");
      return;
    }

    if (passwordForm.newPassword.length < 8) {
      toast.error("Password must be at least 8 characters");
      return;
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    const success = await changePassword(passwordForm.currentPassword, passwordForm.newPassword);
    if (success) {
      setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
    }
  };

  const handleMagicLink = async () => {
    if (partner?.email) {
      await sendMagicLink(partner.email);
    }
  };

  const handleMFAToggle = async (enabled: boolean) => {
    const success = await toggleMFA(enabled);
    if (success) {
      setMfaEnabled(enabled);
      await refetch();
    }
  };

  return (
    <>
      <Helmet>
        <title>Settings | Partner Portal | Cynergists</title>
      </Helmet>

      <div className="p-6 space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Settings</h1>
          <p className="text-muted-foreground">Manage your account settings and preferences</p>
        </div>

        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList>
            <TabsTrigger value="profile" className="gap-2">
              <User className="h-4 w-4" />
              Profile
              {isProfileComplete && <CheckCircle2 className="h-3 w-3 text-green-500" />}
            </TabsTrigger>
            <TabsTrigger value="tax" className="gap-2" id="tax">
              <FileText className="h-4 w-4" />
              Tax (W-9)
              {partner?.tax_status === 'verified' && <CheckCircle2 className="h-3 w-3 text-green-500" />}
            </TabsTrigger>
            <TabsTrigger value="payouts" className="gap-2" id="payouts">
              <Wallet className="h-4 w-4" />
              Payouts
              {partner?.payout_status === 'verified' && <CheckCircle2 className="h-3 w-3 text-green-500" />}
            </TabsTrigger>
            <TabsTrigger value="security" className="gap-2" id="security">
              <Shield className="h-4 w-4" />
              Security
            </TabsTrigger>
          </TabsList>

          {/* Profile Tab */}
          <TabsContent value="profile">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Profile Information</CardTitle>
                    <CardDescription>Update your personal and business information</CardDescription>
                  </div>
                  {isProfileComplete ? (
                    <Badge className="bg-green-500"><Check className="h-3 w-3 mr-1" /> Complete</Badge>
                  ) : (
                    <Badge variant="outline"><AlertCircle className="h-3 w-3 mr-1" /> Incomplete</Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First Name *</Label>
                    <Input 
                      id="firstName" 
                      value={profileForm.first_name}
                      onChange={(e) => setProfileForm(prev => ({ ...prev, first_name: e.target.value }))}
                      placeholder="Enter first name" 
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name *</Label>
                    <Input 
                      id="lastName" 
                      value={profileForm.last_name}
                      onChange={(e) => setProfileForm(prev => ({ ...prev, last_name: e.target.value }))}
                      placeholder="Enter last name" 
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" value={partner?.email || ''} disabled />
                  <p className="text-xs text-muted-foreground">Contact support to change your email address</p>
                </div>
                
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number *</Label>
                    <Input 
                      id="phone" 
                      type="tel" 
                      value={profileForm.phone}
                      onChange={(e) => setProfileForm(prev => ({ ...prev, phone: e.target.value }))}
                      placeholder="(555) 123-4567" 
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="partnerType">Partner Type</Label>
                    <Input id="partnerType" value={partner?.partner_type || 'referral'} disabled />
                  </div>
                </div>
                
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="company">Company Name</Label>
                    <Input 
                      id="company" 
                      value={profileForm.company_name}
                      onChange={(e) => setProfileForm(prev => ({ ...prev, company_name: e.target.value }))}
                      placeholder="Enter company name" 
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="website">Website</Label>
                    <Input 
                      id="website" 
                      type="url"
                      value={profileForm.website}
                      onChange={(e) => setProfileForm(prev => ({ ...prev, website: e.target.value }))}
                      placeholder="https://example.com" 
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address1">Address Line 1</Label>
                  <Input 
                    id="address1" 
                    value={profileForm.address_line1}
                    onChange={(e) => setProfileForm(prev => ({ ...prev, address_line1: e.target.value }))}
                    placeholder="123 Main St" 
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="address2">Address Line 2</Label>
                  <Input 
                    id="address2" 
                    value={profileForm.address_line2}
                    onChange={(e) => setProfileForm(prev => ({ ...prev, address_line2: e.target.value }))}
                    placeholder="Suite 100" 
                  />
                </div>

                <div className="grid md:grid-cols-4 gap-4">
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="city">City</Label>
                    <Input 
                      id="city" 
                      value={profileForm.city}
                      onChange={(e) => setProfileForm(prev => ({ ...prev, city: e.target.value }))}
                      placeholder="City" 
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="state">State</Label>
                    <Input 
                      id="state" 
                      value={profileForm.state}
                      onChange={(e) => setProfileForm(prev => ({ ...prev, state: e.target.value }))}
                      placeholder="CA" 
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="postal">Postal Code</Label>
                    <Input 
                      id="postal" 
                      value={profileForm.postal_code}
                      onChange={(e) => setProfileForm(prev => ({ ...prev, postal_code: e.target.value }))}
                      placeholder="12345" 
                    />
                  </div>
                </div>

                <Button onClick={handleProfileSave} disabled={saving}>
                  {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                  Save Changes
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tax Tab */}
          <TabsContent value="tax">
            <Card>
              <CardHeader>
                <CardTitle>Tax Information (W-9)</CardTitle>
                <CardDescription>Submit your W-9 form for tax reporting purposes</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <p className="font-medium">W-9 Status</p>
                    <p className="text-sm text-muted-foreground">
                      Required for commission payouts over $600/year
                    </p>
                  </div>
                  {getStatusBadge(partner?.tax_status || 'not_started', 'tax')}
                </div>

                {partner?.tax_status === 'rejected' && partner?.tax_rejection_reason && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      Your W-9 was rejected: {partner.tax_rejection_reason}. Please resubmit.
                    </AlertDescription>
                  </Alert>
                )}

                {(partner?.tax_status === 'not_started' || partner?.tax_status === 'rejected') && (
                  <div className="border-2 border-dashed rounded-lg p-8 text-center">
                    <Upload className="h-10 w-10 mx-auto text-muted-foreground mb-4" />
                    <p className="font-medium mb-2">Upload W-9 Form</p>
                    <p className="text-sm text-muted-foreground mb-4">
                      PDF or image format, max 10MB
                    </p>
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleW9Upload}
                      accept=".pdf,.jpg,.jpeg,.png,.webp"
                      className="hidden"
                    />
                    <Button 
                      variant="outline" 
                      onClick={() => fileInputRef.current?.click()}
                      disabled={uploadingW9}
                    >
                      {uploadingW9 ? (
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      ) : (
                        <Upload className="h-4 w-4 mr-2" />
                      )}
                      Choose File
                    </Button>
                  </div>
                )}

                {partner?.tax_status === 'submitted' && (
                  <div className="p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                    <div className="flex items-start gap-3">
                      <Clock className="h-5 w-5 text-yellow-500 mt-0.5" />
                      <div>
                        <p className="font-medium text-yellow-600 dark:text-yellow-400">Pending Review</p>
                        <p className="text-sm text-muted-foreground mt-1">
                          Your W-9 has been submitted and is being reviewed by our team. This usually takes 1-2 business days.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {partner?.tax_status === 'verified' && (
                  <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
                    <div className="flex items-start gap-3">
                      <Check className="h-5 w-5 text-green-500 mt-0.5" />
                      <div>
                        <p className="font-medium text-green-600 dark:text-green-400">Verified</p>
                        <p className="text-sm text-muted-foreground mt-1">
                          Your W-9 has been verified. You're all set for tax reporting.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Payouts Tab */}
          <TabsContent value="payouts">
            <Card>
              <CardHeader>
                <CardTitle>Payout Settings</CardTitle>
                <CardDescription>Configure how you receive your commission payments</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <p className="font-medium">Payout Status</p>
                    <p className="text-sm text-muted-foreground">
                      Your payout method verification status
                    </p>
                  </div>
                  {getStatusBadge(partner?.payout_status || 'not_started', 'payout')}
                </div>

                {partner?.payout_status === 'rejected' && partner?.payout_rejection_reason && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      Your payout method was rejected: {partner.payout_rejection_reason}. Please resubmit.
                    </AlertDescription>
                  </Alert>
                )}

                {partner?.payout_status === 'verified' ? (
                  <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
                    <div className="flex items-start gap-3">
                      <Check className="h-5 w-5 text-green-500 mt-0.5" />
                      <div>
                        <p className="font-medium text-green-600 dark:text-green-400">Payout Method Verified</p>
                        <p className="text-sm text-muted-foreground mt-1">
                          {partner.payout_bank_name} ({partner.payout_account_type}) ending in {partner.payout_last4}
                        </p>
                      </div>
                    </div>
                  </div>
                ) : partner?.payout_status === 'submitted' ? (
                  <div className="p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                    <div className="flex items-start gap-3">
                      <Clock className="h-5 w-5 text-yellow-500 mt-0.5" />
                      <div>
                        <p className="font-medium text-yellow-600 dark:text-yellow-400">Pending Verification</p>
                        <p className="text-sm text-muted-foreground mt-1">
                          {partner.payout_bank_name} ({partner.payout_account_type}) ending in {partner.payout_last4} - awaiting verification.
                        </p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4 p-4 border rounded-lg">
                    <p className="font-medium">Add Payout Method</p>
                    <p className="text-sm text-muted-foreground">
                      Enter your bank details below. Your information will be verified by our team.
                    </p>
                    
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="bankName">Bank Name *</Label>
                        <Input 
                          id="bankName" 
                          value={payoutForm.payout_bank_name}
                          onChange={(e) => setPayoutForm(prev => ({ ...prev, payout_bank_name: e.target.value }))}
                          placeholder="Chase, Wells Fargo, etc." 
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="accountType">Account Type</Label>
                        <Select 
                          value={payoutForm.payout_account_type}
                          onValueChange={(value) => setPayoutForm(prev => ({ ...prev, payout_account_type: value }))}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="checking">Checking</SelectItem>
                            <SelectItem value="savings">Savings</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="tokenRef">Token Reference *</Label>
                        <Input 
                          id="tokenRef" 
                          value={payoutForm.payout_token_reference}
                          onChange={(e) => setPayoutForm(prev => ({ ...prev, payout_token_reference: e.target.value }))}
                          placeholder="Bank token reference" 
                        />
                        <p className="text-xs text-muted-foreground">This will be replaced by a secure connection in the future.</p>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="last4">Last 4 Digits *</Label>
                        <Input 
                          id="last4" 
                          value={payoutForm.payout_last4}
                          onChange={(e) => setPayoutForm(prev => ({ ...prev, payout_last4: e.target.value.slice(0, 4) }))}
                          placeholder="1234" 
                          maxLength={4}
                        />
                      </div>
                    </div>

                    <Button onClick={handlePayoutSubmit} disabled={saving}>
                      {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                      Submit Payout Method
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Security Tab */}
          <TabsContent value="security">
            <Card>
              <CardHeader>
                <CardTitle>Security Settings</CardTitle>
                <CardDescription>Manage your account security and authentication</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Password Change */}
                <div className="space-y-4 p-4 border rounded-lg">
                  <div className="flex items-center gap-2">
                    <Key className="h-5 w-5 text-muted-foreground" />
                    <p className="font-medium">Change Password</p>
                  </div>
                  <div className="grid md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="currentPassword">Current Password</Label>
                      <Input 
                        id="currentPassword" 
                        type="password"
                        value={passwordForm.currentPassword}
                        onChange={(e) => setPasswordForm(prev => ({ ...prev, currentPassword: e.target.value }))}
                        placeholder="Enter current password" 
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="newPassword">New Password</Label>
                      <Input 
                        id="newPassword" 
                        type="password"
                        value={passwordForm.newPassword}
                        onChange={(e) => setPasswordForm(prev => ({ ...prev, newPassword: e.target.value }))}
                        placeholder="Enter new password" 
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="confirmPassword">Confirm Password</Label>
                      <Input 
                        id="confirmPassword" 
                        type="password"
                        value={passwordForm.confirmPassword}
                        onChange={(e) => setPasswordForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
                        placeholder="Confirm new password" 
                      />
                    </div>
                  </div>
                  <Button 
                    variant="outline" 
                    onClick={handlePasswordChange}
                    disabled={saving || !passwordForm.currentPassword || !passwordForm.newPassword || !passwordForm.confirmPassword}
                  >
                    {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                    Update Password
                  </Button>
                </div>

                {/* Magic Link */}
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-start gap-3">
                    <Mail className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="font-medium">Magic Link Login</p>
                      <p className="text-sm text-muted-foreground">
                        Send a passwordless login link to your email
                      </p>
                    </div>
                  </div>
                  <Button variant="outline" onClick={handleMagicLink} disabled={saving}>
                    Send Link
                  </Button>
                </div>

                {/* MFA Toggle */}
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-start gap-3">
                    <Shield className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="font-medium">Require MFA for Payout Changes</p>
                      <p className="text-sm text-muted-foreground">
                        Add an extra layer of security when modifying payout settings
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Note: Full MFA setup coming soon
                      </p>
                    </div>
                  </div>
                  <Switch
                    checked={mfaEnabled}
                    onCheckedChange={handleMFAToggle}
                    disabled={saving}
                  />
                </div>

                {/* Email Verification Status */}
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-start gap-3">
                    <Mail className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="font-medium">Email Verification</p>
                      <p className="text-sm text-muted-foreground">
                        {partner?.email}
                      </p>
                    </div>
                  </div>
                  {partner?.email_verified ? (
                    <Badge className="bg-green-500"><Check className="h-3 w-3 mr-1" /> Verified</Badge>
                  ) : (
                    <Badge variant="outline"><AlertCircle className="h-3 w-3 mr-1" /> Not Verified</Badge>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
}
