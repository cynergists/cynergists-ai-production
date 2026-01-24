import { useState, useEffect, useCallback, useMemo } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PhoneInput } from "@/components/ui/phone-input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { formatErrorMessage } from "@/utils/errorMessages";
import { useCreateStaff, useUpdateStaff, useDeleteStaff } from "@/hooks/useStaffList";
import type { StaffMember, StaffType, PayType, CommissionType, EmploymentType } from "@/hooks/useStaffList";
import type { Database } from "@/integrations/supabase/types";
import { Loader2, Trash2, DollarSign, Users, Briefcase, Building2 } from "lucide-react";
import { useAutoSave } from "@/hooks/useAutoSave";

type StaffInsert = Database['public']['Tables']['staff']['Insert'];
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface StaffContactCardProps {
  staff: StaffMember | null;
  isNew?: boolean;
  open: boolean;
  onClose: () => void;
  defaultStaffType?: StaffType;
}

const STAFF_TYPE_LABELS: Record<StaffType, string> = {
  operational: "Operational Staff",
  sales_rep: "Sales Rep",
  contractor: "Contractor",
  intern: "Intern",
};

const STAFF_TYPE_ICONS: Record<StaffType, typeof Users> = {
  operational: Briefcase,
  sales_rep: Users,
  contractor: Building2,
  intern: Users,
};

export function StaffContactCard({ 
  staff, 
  isNew = false, 
  open, 
  onClose,
  defaultStaffType = "operational" 
}: StaffContactCardProps) {
  const { toast } = useToast();
  const createMutation = useCreateStaff();
  const updateMutation = useUpdateStaff();
  const deleteMutation = useDeleteStaff();

  const [formData, setFormData] = useState({
    // Basic
    name: "",
    first_name: "",
    last_name: "",
    title: "",
    status: "active" as "active" | "inactive",
    staff_type: defaultStaffType as StaffType,
    
    // Employment
    start_date: "",
    end_date: "",
    department: "",
    employment_type: "full_time" as EmploymentType,
    termination_reason: "",
    termination_notes: "",
    
    // Contact
    email: "",
    phone: "",
    city: "",
    country: "",
    timezone: "",
    
    // Pay - General
    pay_type: "hourly" as PayType,
    hourly_pay: "",
    hours_per_week: "",
    expected_hours_week: "",
    monthly_pay: "",
    salary: "",
    
    // Pay - Sales Rep
    commission_type: "percentage" as CommissionType,
    commission_percent: "",
    quota: "",
    commission_status: "active",
    total_clients: "",
    monthly_revenue: "",
    
    // Banking
    account_type: "",
    bank_name: "",
    account_number: "",
    routing_number: "",
    
    // Performance
    performance_status: "on_track",
    last_review_date: "",
    next_review_date: "",
    
    // Notes
    notes: "",
  });

  useEffect(() => {
    if (staff && !isNew) {
      setFormData({
        name: staff.name || "",
        first_name: staff.first_name || "",
        last_name: staff.last_name || "",
        title: staff.title || "",
        status: staff.status,
        staff_type: staff.staff_type || "operational",
        start_date: staff.start_date || "",
        end_date: staff.end_date || "",
        department: staff.department || "",
        employment_type: staff.employment_type || "full_time",
        termination_reason: staff.termination_reason || "",
        termination_notes: staff.termination_notes || "",
        email: staff.email || "",
        phone: staff.phone || "",
        city: staff.city || "",
        country: staff.country || "",
        timezone: staff.timezone || "",
        pay_type: staff.pay_type || "hourly",
        hourly_pay: staff.hourly_pay?.toString() || "",
        hours_per_week: staff.hours_per_week?.toString() || "",
        expected_hours_week: staff.expected_hours_week?.toString() || "",
        monthly_pay: staff.monthly_pay?.toString() || "",
        salary: staff.salary?.toString() || "",
        commission_type: staff.commission_type || "percentage",
        commission_percent: staff.commission_percent?.toString() || "",
        quota: staff.quota?.toString() || "",
        commission_status: staff.commission_status || "active",
        total_clients: staff.total_clients?.toString() || "",
        monthly_revenue: staff.monthly_revenue?.toString() || "",
        account_type: staff.account_type || "",
        bank_name: staff.bank_name || "",
        account_number: staff.account_number || "",
        routing_number: staff.routing_number || "",
        performance_status: staff.performance_status || "on_track",
        last_review_date: staff.last_review_date || "",
        next_review_date: staff.next_review_date || "",
        notes: staff.notes || "",
      });
    } else if (isNew) {
      setFormData((prev) => ({
        ...prev,
        name: "",
        first_name: "",
        last_name: "",
        title: "",
        status: "active",
        staff_type: defaultStaffType,
        start_date: "",
        end_date: "",
        department: "",
        employment_type: "full_time",
        termination_reason: "",
        termination_notes: "",
        email: "",
        phone: "",
        city: "",
        country: "",
        timezone: "",
        pay_type: "hourly",
        hourly_pay: "",
        hours_per_week: "",
        expected_hours_week: "",
        monthly_pay: "",
        salary: "",
        commission_type: "percentage",
        commission_percent: "",
        quota: "",
        commission_status: "active",
        total_clients: "",
        monthly_revenue: "",
        account_type: "",
        bank_name: "",
        account_number: "",
        routing_number: "",
        performance_status: "on_track",
        last_review_date: "",
        next_review_date: "",
        notes: "",
      }));
    }
  }, [staff, isNew, defaultStaffType]);

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const calculatePayAmounts = () => {
    const hourlyPay = parseFloat(formData.hourly_pay) || 0;
    const hoursPerWeek = parseFloat(formData.hours_per_week) || 0;
    const weeklyPay = hourlyPay * hoursPerWeek;
    const biWeeklyPay = weeklyPay * 2;
    const monthlyFromHourly = weeklyPay * 4.33;
    return { weeklyPay, biWeeklyPay, monthlyFromHourly };
  };

  // Build payload for save
  const buildPayload = useCallback((): StaffInsert => {
    const displayName = `${formData.first_name.trim()} ${formData.last_name.trim()}`;
    return {
      name: displayName,
      first_name: formData.first_name || null,
      last_name: formData.last_name || null,
      title: formData.title || null,
      status: formData.status,
      staff_type: formData.staff_type,
      start_date: formData.start_date || null,
      end_date: formData.end_date || null,
      department: formData.department || null,
      employment_type: formData.employment_type || null,
      termination_reason: formData.termination_reason || null,
      termination_notes: formData.termination_notes || null,
      email: formData.email || null,
      phone: formData.phone || null,
      city: formData.city || null,
      country: formData.country || null,
      timezone: formData.timezone || null,
      pay_type: formData.pay_type || null,
      hourly_pay: formData.hourly_pay ? parseFloat(formData.hourly_pay) : null,
      hours_per_week: formData.hours_per_week ? parseFloat(formData.hours_per_week) : null,
      expected_hours_week: formData.expected_hours_week ? parseFloat(formData.expected_hours_week) : null,
      monthly_pay: formData.monthly_pay ? parseFloat(formData.monthly_pay) : null,
      salary: formData.salary ? parseFloat(formData.salary) : null,
      commission_type: formData.staff_type === "sales_rep" ? formData.commission_type : null,
      commission_percent: formData.commission_percent ? parseFloat(formData.commission_percent) : null,
      quota: formData.quota ? parseFloat(formData.quota) : null,
      commission_status: formData.commission_status || null,
      total_clients: formData.total_clients ? parseInt(formData.total_clients) : null,
      monthly_revenue: formData.monthly_revenue ? parseFloat(formData.monthly_revenue) : null,
      account_type: formData.account_type || null,
      bank_name: formData.bank_name || null,
      account_number: formData.account_number || null,
      routing_number: formData.routing_number || null,
      performance_status: formData.performance_status || null,
      last_review_date: formData.last_review_date || null,
      next_review_date: formData.next_review_date || null,
      notes: formData.notes || null,
    };
  }, [formData]);

  // Autosave handler
  const handleAutoSave = useCallback(async (): Promise<boolean> => {
    if (isNew || !staff) return false;
    if (!formData.first_name.trim() || !formData.last_name.trim()) return false;
    
    try {
      const payload = buildPayload();
      const { name, ...updatePayload } = payload;
      await updateMutation.mutateAsync({ id: staff.id, name, ...updatePayload });
      return true;
    } catch {
      return false;
    }
  }, [isNew, staff, formData.first_name, formData.last_name, buildPayload, updateMutation]);

  // Enable autosave only when editing existing staff
  const { isSaving: isAutoSaving } = useAutoSave({
    data: formData as unknown as Record<string, unknown>,
    onSave: handleAutoSave,
    enabled: !isNew && !!staff && open,
  });

  // Manual save for creating new staff
  const handleCreate = async () => {
    if (!formData.first_name.trim() || !formData.last_name.trim()) {
      toast({
        title: "Error",
        description: "First name and last name are required",
        variant: "destructive",
      });
      return;
    }

    try {
      const payload = buildPayload();
      await createMutation.mutateAsync(payload);
      toast({ title: "Success", description: "Staff member added" });
      onClose();
    } catch (error: unknown) {
      const rawMessage = error instanceof Error ? error.message : "Failed to save";
      const message = formatErrorMessage(rawMessage, "employee");
      toast({
        title: "Error",
        description: message,
        variant: "destructive",
      });
    }
  };

  const handleDelete = async () => {
    if (!staff) return;
    try {
      await deleteMutation.mutateAsync(staff.id);
      toast({ title: "Success", description: "Staff member deleted" });
      onClose();
    } catch (error: unknown) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to delete",
        variant: "destructive",
      });
    }
  };

  const { weeklyPay, biWeeklyPay, monthlyFromHourly } = calculatePayAmounts();
  const isSalesRep = formData.staff_type === "sales_rep";
  const isLoading = createMutation.isPending;
  const StaffIcon = STAFF_TYPE_ICONS[formData.staff_type];

  return (
    <Sheet open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <SheetContent className="w-full sm:max-w-2xl overflow-y-auto">
        <SheetHeader className="space-y-3">
          <div className="flex items-center gap-2">
            <StaffIcon className="h-5 w-5 text-primary" />
            <SheetTitle>{isNew ? "Add Employee" : "Edit Employee"}</SheetTitle>
          </div>
          {!isNew && staff && (
            <Badge variant={staff.status === "active" ? "default" : "secondary"}>
              {STAFF_TYPE_LABELS[staff.staff_type]} • {staff.status}
            </Badge>
          )}
        </SheetHeader>

        <Tabs defaultValue="basic" className="mt-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="basic">Basic</TabsTrigger>
            <TabsTrigger value="compensation">Pay</TabsTrigger>
            <TabsTrigger value="contact">Contact</TabsTrigger>
            <TabsTrigger value="banking">Banking</TabsTrigger>
          </TabsList>

          {/* Basic Information Tab */}
          <TabsContent value="basic" className="space-y-6 mt-4">
            <div className="space-y-4">
              <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
                Identity
              </h3>
              <div className="grid gap-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="first_name">First Name *</Label>
                    <Input
                      id="first_name"
                      value={formData.first_name}
                      onChange={(e) => handleChange("first_name", e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="last_name">Last Name *</Label>
                    <Input
                      id="last_name"
                      value={formData.last_name}
                      onChange={(e) => handleChange("last_name", e.target.value)}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="title">Title</Label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) => handleChange("title", e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="department">Department</Label>
                    <Input
                      id="department"
                      value={formData.department}
                      onChange={(e) => handleChange("department", e.target.value)}
                    />
                  </div>
                </div>
              </div>
            </div>

            <Separator />

            <div className="space-y-4">
              <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
                Employment
              </h3>
              <div className="grid gap-4">
                <div>
                  <Label htmlFor="employment_type">Employment Type</Label>
                  <Select
                    value={formData.employment_type}
                    onValueChange={(val) => handleChange("employment_type", val)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="full_time">Full Time</SelectItem>
                      <SelectItem value="part_time">Part Time</SelectItem>
                      <SelectItem value="contractor">Contractor</SelectItem>
                      <SelectItem value="intern">Intern</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="status">Status</Label>
                    <Select
                      value={formData.status}
                      onValueChange={(val) => handleChange("status", val)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="inactive">Inactive</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="performance_status">Performance</Label>
                    <Select
                      value={formData.performance_status}
                      onValueChange={(val) => handleChange("performance_status", val)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="on_track">On Track</SelectItem>
                        <SelectItem value="exceeding">Exceeding</SelectItem>
                        <SelectItem value="needs_improvement">Needs Improvement</SelectItem>
                        <SelectItem value="probation">Probation</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="start_date">Start Date</Label>
                    <Input
                      id="start_date"
                      type="date"
                      value={formData.start_date}
                      onChange={(e) => handleChange("start_date", e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="end_date">End Date</Label>
                    <Input
                      id="end_date"
                      type="date"
                      value={formData.end_date}
                      onChange={(e) => handleChange("end_date", e.target.value)}
                    />
                  </div>
                </div>
              </div>
            </div>

            {formData.status === "inactive" && (
              <>
                <Separator />
                <div className="space-y-4">
                  <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
                    Termination Details
                  </h3>
                  <div className="grid gap-4">
                    <div>
                      <Label htmlFor="termination_reason">Reason</Label>
                      <Select
                        value={formData.termination_reason}
                        onValueChange={(val) => handleChange("termination_reason", val)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select reason" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="resigned">Resigned</SelectItem>
                          <SelectItem value="terminated">Terminated</SelectItem>
                          <SelectItem value="contract_ended">Contract Ended</SelectItem>
                          <SelectItem value="layoff">Layoff</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="termination_notes">Notes</Label>
                      <Textarea
                        id="termination_notes"
                        value={formData.termination_notes}
                        onChange={(e) => handleChange("termination_notes", e.target.value)}
                        rows={3}
                      />
                    </div>
                  </div>
                </div>
              </>
            )}

            <Separator />

            <div className="space-y-4">
              <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
                Notes
              </h3>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => handleChange("notes", e.target.value)}
                placeholder="Internal notes about this staff member..."
                rows={4}
              />
            </div>
          </TabsContent>

          {/* Compensation Tab */}
          <TabsContent value="compensation" className="space-y-6 mt-4">
            <div className="space-y-4">
              <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
                Base Compensation
              </h3>
              <div className="grid gap-4">
                <div>
                  <Label htmlFor="pay_type">Pay Type</Label>
                  <Select
                    value={formData.pay_type}
                    onValueChange={(val) => handleChange("pay_type", val)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="hourly">Hourly</SelectItem>
                      <SelectItem value="salary">Salary</SelectItem>
                      <SelectItem value="commission_only">Commission Only</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {formData.pay_type === "hourly" && (
                  <>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="hourly_pay">Hourly Rate</Label>
                        <div className="relative">
                          <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input
                            id="hourly_pay"
                            type="number"
                            step="0.01"
                            value={formData.hourly_pay}
                            onChange={(e) => handleChange("hourly_pay", e.target.value)}
                            placeholder="0.00"
                            className="pl-9"
                          />
                        </div>
                      </div>
                      <div>
                        <Label htmlFor="hours_per_week">Hours Per Week</Label>
                        <Input
                          id="hours_per_week"
                          type="number"
                          step="0.5"
                          value={formData.hours_per_week}
                          onChange={(e) => handleChange("hours_per_week", e.target.value)}
                          placeholder="40"
                        />
                      </div>
                    </div>
                    <div className="bg-muted/50 rounded-lg p-4 space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Weekly Pay:</span>
                        <span className="font-medium">${weeklyPay.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Bi-Weekly Pay:</span>
                        <span className="font-medium">${biWeeklyPay.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Monthly (Est):</span>
                        <span className="font-medium">${monthlyFromHourly.toFixed(2)}</span>
                      </div>
                    </div>
                  </>
                )}

                {formData.pay_type === "salary" && (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="salary">Annual Salary</Label>
                      <div className="relative">
                        <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="salary"
                          type="number"
                          step="1000"
                          value={formData.salary}
                          onChange={(e) => handleChange("salary", e.target.value)}
                          placeholder="0"
                          className="pl-9"
                        />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="expected_hours_week">Expected Hours/Week</Label>
                      <Input
                        id="expected_hours_week"
                        type="number"
                        value={formData.expected_hours_week}
                        onChange={(e) => handleChange("expected_hours_week", e.target.value)}
                        placeholder="40"
                      />
                    </div>
                  </div>
                )}

                <div>
                  <Label htmlFor="monthly_pay">Monthly Pay (Override)</Label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="monthly_pay"
                      type="number"
                      step="0.01"
                      value={formData.monthly_pay}
                      onChange={(e) => handleChange("monthly_pay", e.target.value)}
                      placeholder="0.00"
                      className="pl-9"
                    />
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Set manually if different from calculated amount
                  </p>
                </div>
              </div>
            </div>

            {/* Sales Rep Commission Section */}
            {isSalesRep && (
              <>
                <Separator />
                <div className="space-y-4">
                  <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
                    Commission & Sales
                  </h3>
                  <div className="grid gap-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="commission_type">Commission Type</Label>
                        <Select
                          value={formData.commission_type}
                          onValueChange={(val) => handleChange("commission_type", val)}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="percentage">Percentage</SelectItem>
                            <SelectItem value="flat_fee">Flat Fee</SelectItem>
                            <SelectItem value="tiered">Tiered</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="commission_percent">Commission Rate (%)</Label>
                        <div className="relative">
                          <Input
                            id="commission_percent"
                            type="number"
                            step="0.1"
                            value={formData.commission_percent}
                            onChange={(e) => handleChange("commission_percent", e.target.value)}
                            placeholder="10"
                            className="pr-8"
                          />
                          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">%</span>
                        </div>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="quota">Monthly Quota</Label>
                        <div className="relative">
                          <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input
                            id="quota"
                            type="number"
                            value={formData.quota}
                            onChange={(e) => handleChange("quota", e.target.value)}
                            placeholder="0"
                            className="pl-9"
                          />
                        </div>
                      </div>
                      <div>
                        <Label htmlFor="commission_status">Commission Status</Label>
                        <Select
                          value={formData.commission_status}
                          onValueChange={(val) => handleChange("commission_status", val)}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="active">Active</SelectItem>
                            <SelectItem value="paused">Paused</SelectItem>
                            <SelectItem value="inactive">Inactive</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="total_clients">Total Clients</Label>
                        <Input
                          id="total_clients"
                          type="number"
                          value={formData.total_clients}
                          onChange={(e) => handleChange("total_clients", e.target.value)}
                          placeholder="0"
                        />
                      </div>
                      <div>
                        <Label htmlFor="monthly_revenue">Monthly Revenue</Label>
                        <div className="relative">
                          <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input
                            id="monthly_revenue"
                            type="number"
                            step="0.01"
                            value={formData.monthly_revenue}
                            onChange={(e) => handleChange("monthly_revenue", e.target.value)}
                            placeholder="0.00"
                            className="pl-9"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}
          </TabsContent>

          {/* Contact Tab */}
          <TabsContent value="contact" className="space-y-6 mt-4">
            <div className="space-y-4">
              <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
                Contact Information
              </h3>
              <div className="grid gap-4">
                <div>
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleChange("email", e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="phone">Phone</Label>
                  <PhoneInput
                    id="phone"
                    value={formData.phone}
                    onChange={(value) => handleChange("phone", value)}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="city">City</Label>
                    <Input
                      id="city"
                      value={formData.city}
                      onChange={(e) => handleChange("city", e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="country">Country</Label>
                    <Input
                      id="country"
                      value={formData.country}
                      onChange={(e) => handleChange("country", e.target.value)}
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="timezone">Timezone</Label>
                  <Input
                    id="timezone"
                    value={formData.timezone}
                    onChange={(e) => handleChange("timezone", e.target.value)}
                    placeholder="e.g., America/Denver"
                  />
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Banking Tab */}
          <TabsContent value="banking" className="space-y-6 mt-4">
            <div className="space-y-4">
              <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
                Banking Information
              </h3>
              <div className="grid gap-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="account_type">Account Type</Label>
                    <Select
                      value={formData.account_type}
                      onValueChange={(val) => handleChange("account_type", val)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="checking">Checking</SelectItem>
                        <SelectItem value="savings">Savings</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="bank_name">Bank Name</Label>
                    <Input
                      id="bank_name"
                      value={formData.bank_name}
                      onChange={(e) => handleChange("bank_name", e.target.value)}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="account_number">Account Number</Label>
                    <Input
                      id="account_number"
                      value={formData.account_number}
                      onChange={(e) => handleChange("account_number", e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="routing_number">Routing Number</Label>
                    <Input
                      id="routing_number"
                      value={formData.routing_number}
                      onChange={(e) => handleChange("routing_number", e.target.value)}
                    />
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        <Separator className="my-6" />

        {/* Actions - Full width buttons */}
        <div className="flex items-center gap-2">
          {isNew ? (
            <>
              <Button variant="outline" className="flex-1" onClick={onClose}>
                Cancel
              </Button>
              <Button className="flex-1" onClick={handleCreate} disabled={isLoading}>
                {isLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                Add Employee
              </Button>
            </>
          ) : (
            <>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" className="flex-1" disabled={deleteMutation.isPending}>
                    {deleteMutation.isPending ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Trash2 className="h-4 w-4 mr-2" />
                    )}
                    Delete
                    {isAutoSaving && <Loader2 className="h-3 w-3 ml-2 animate-spin" />}
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete Staff Member</AlertDialogTitle>
                    <AlertDialogDescription>
                      Are you sure you want to delete {staff?.name}? This action cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
              <Button variant="outline" className="flex-1" onClick={onClose}>
                Close
              </Button>
            </>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
