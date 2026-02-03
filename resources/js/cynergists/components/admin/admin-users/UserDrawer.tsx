import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
} from '@/components/ui/sheet';
import { Switch } from '@/components/ui/switch';
import type {
    AccessLevel,
    AdminUser,
    AdminUserFormData,
    TwoFactorStatus,
    UserStatus,
    UserType,
} from '@/hooks/useAdminUsersList';
import {
    useCompanies,
    useUpdateAdminUser,
    useUserLoginHistory,
} from '@/hooks/useAdminUsersList';
import { useAutoSave } from '@/hooks/useAutoSave';
import { formatDate, formatDateTime, formatPhoneNumber } from '@/lib/utils';
import {
    Building2,
    ChevronDown,
    ChevronUp,
    Clock,
    Loader2,
    Shield,
    Trash2,
    User,
} from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';

interface UserDrawerProps {
    user: AdminUser | null;
    open: boolean;
    onClose: () => void;
}

const userTypeLabels: Record<UserType, string> = {
    client: 'Client',
    partner: 'Partner',
    employee: 'Employee',
    sales_rep: 'Sales Rep',
    admin: 'Admin',
    super_admin: 'Super Admin',
};

const accessLevelLabels: Record<AccessLevel, string> = {
    admin: 'Admin',
    manager: 'Manager',
    standard: 'Standard',
    limited: 'Limited',
};

const statusLabels: Record<UserStatus, string> = {
    active: 'Active',
    inactive: 'Inactive',
    suspended: 'Suspended',
};

const twoFactorLabels: Record<TwoFactorStatus, string> = {
    disabled: 'Disabled',
    enabled: 'Enabled',
    required: 'Required',
};

export function UserDrawer({ user, open, onClose }: UserDrawerProps) {
    const [formData, setFormData] = useState<AdminUserFormData>({});
    const [showLoginHistory, setShowLoginHistory] = useState(false);

    const updateMutation = useUpdateAdminUser();
    const { data: companies = [] } = useCompanies();
    const { data: loginHistory = [] } = useUserLoginHistory(
        user?.user_id || null,
    );

    useEffect(() => {
        if (user) {
            setFormData({
                first_name: user.first_name || '',
                last_name: user.last_name || '',
                phone: user.phone || '',
                timezone: user.timezone || 'America/New_York',
                user_type: user.user_type,
                primary_company_id: user.primary_company_id,
                access_level: user.access_level,
                status: user.status,
                two_factor_status: user.two_factor_status,
                // Client fields
                subscription_status: user.subscription_status || '',
                contract_signed: user.contract_signed,
                contract_signed_date: user.contract_signed_date,
                // Partner fields
                commission_rate: user.commission_rate,
                agreement_status: user.agreement_status || '',
                total_revenue_influenced: user.total_revenue_influenced,
                // Sales Rep fields
                commission_structure: user.commission_structure || '',
                revenue_attributed: user.revenue_attributed,
                hire_date: user.hire_date,
                rep_status: user.rep_status || 'active',
                // Employee fields
                start_date: user.start_date,
                employment_type: user.employment_type || '',
            });
            setShowLoginHistory(false);
        }
    }, [user, open]);

    // Memoize initial data for autosave comparison
    const initialFormData = useMemo(() => {
        if (!user) return null;
        return {
            first_name: user.first_name || '',
            last_name: user.last_name || '',
            phone: user.phone || '',
            timezone: user.timezone || 'America/New_York',
            user_type: user.user_type,
            primary_company_id: user.primary_company_id,
            access_level: user.access_level,
            status: user.status,
            two_factor_status: user.two_factor_status,
            subscription_status: user.subscription_status || '',
            contract_signed: user.contract_signed,
            contract_signed_date: user.contract_signed_date,
            commission_rate: user.commission_rate,
            agreement_status: user.agreement_status || '',
            total_revenue_influenced: user.total_revenue_influenced,
            commission_structure: user.commission_structure || '',
            revenue_attributed: user.revenue_attributed,
            hire_date: user.hire_date,
            rep_status: user.rep_status || 'active',
            start_date: user.start_date,
            employment_type: user.employment_type || '',
        };
    }, [user]);

    // Autosave handler
    const handleAutoSave = useCallback(
        async (data: AdminUserFormData): Promise<boolean> => {
            if (!user) return false;
            try {
                await updateMutation.mutateAsync({ id: user.id, ...data });
                return true;
            } catch {
                return false;
            }
        },
        [user, updateMutation],
    );

    // Enable autosave
    const { isSaving: isAutoSaving } = useAutoSave({
        data: formData as Record<string, unknown>,
        onSave: handleAutoSave as (
            data: Record<string, unknown>,
        ) => Promise<boolean>,
        enabled: !!user && open,
        initialData: initialFormData as Record<string, unknown> | undefined,
    });

    const updateField = <K extends keyof AdminUserFormData>(
        key: K,
        value: AdminUserFormData[K],
    ) => {
        setFormData((prev) => ({ ...prev, [key]: value }));
    };

    if (!user) return null;

    return (
        <Sheet open={open} onOpenChange={onClose}>
            <SheetContent className="w-full overflow-y-auto sm:max-w-lg">
                <SheetHeader className="pb-4">
                    <SheetTitle className="flex items-center gap-2">
                        <User className="h-5 w-5" />
                        {user.display_name}
                    </SheetTitle>
                    <div className="flex flex-wrap gap-2">
                        <Badge variant="outline" className="capitalize">
                            {userTypeLabels[user.user_type]}
                        </Badge>
                        <Badge variant="outline" className="capitalize">
                            {accessLevelLabels[user.access_level]}
                        </Badge>
                        <Badge
                            variant={
                                user.status === 'active'
                                    ? 'default'
                                    : 'destructive'
                            }
                            className="capitalize"
                        >
                            {user.status}
                        </Badge>
                    </div>
                </SheetHeader>

                <div className="space-y-6">
                    {/* Section 1: Identity & Contact */}
                    <section className="space-y-4">
                        <div className="flex items-center gap-2 text-sm font-semibold tracking-wide text-muted-foreground uppercase">
                            <User className="h-4 w-4" />
                            Identity & Contact
                        </div>
                        <Separator />

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="first_name">First Name</Label>
                                <Input
                                    id="first_name"
                                    value={formData.first_name || ''}
                                    onChange={(e) =>
                                        updateField(
                                            'first_name',
                                            e.target.value,
                                        )
                                    }
                                    placeholder="First name"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="last_name">Last Name</Label>
                                <Input
                                    id="last_name"
                                    value={formData.last_name || ''}
                                    onChange={(e) =>
                                        updateField('last_name', e.target.value)
                                    }
                                    placeholder="Last name"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="email">
                                Email Address (Login Identifier)
                            </Label>
                            <Input
                                id="email"
                                type="email"
                                value={user.email}
                                disabled
                                className="bg-muted"
                            />
                            <p className="text-xs text-muted-foreground">
                                Editable only by Admin
                            </p>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="phone">Phone Number</Label>
                            <Input
                                id="phone"
                                value={formData.phone || ''}
                                onChange={(e) =>
                                    updateField('phone', e.target.value)
                                }
                                placeholder="(555) 123-4567"
                            />
                            {formData.phone && (
                                <p className="text-xs text-muted-foreground">
                                    Display: {formatPhoneNumber(formData.phone)}
                                </p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="timezone">Time Zone</Label>
                            <Select
                                value={formData.timezone || 'America/New_York'}
                                onValueChange={(value) =>
                                    updateField('timezone', value)
                                }
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select timezone" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="America/New_York">
                                        Eastern (ET)
                                    </SelectItem>
                                    <SelectItem value="America/Chicago">
                                        Central (CT)
                                    </SelectItem>
                                    <SelectItem value="America/Denver">
                                        Mountain (MT)
                                    </SelectItem>
                                    <SelectItem value="America/Los_Angeles">
                                        Pacific (PT)
                                    </SelectItem>
                                    <SelectItem value="America/Phoenix">
                                        Arizona (AZ)
                                    </SelectItem>
                                    <SelectItem value="America/Anchorage">
                                        Alaska (AK)
                                    </SelectItem>
                                    <SelectItem value="Pacific/Honolulu">
                                        Hawaii (HI)
                                    </SelectItem>
                                    <SelectItem value="UTC">UTC</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </section>

                    {/* Section 2: Account Classification */}
                    <section className="space-y-4">
                        <div className="flex items-center gap-2 text-sm font-semibold tracking-wide text-muted-foreground uppercase">
                            <Building2 className="h-4 w-4" />
                            Account Classification
                        </div>
                        <Separator />

                        <div className="space-y-2">
                            <Label htmlFor="user_type">User Type</Label>
                            <Select
                                value={formData.user_type}
                                onValueChange={(value: UserType) => {
                                    updateField('user_type', value);
                                    // Auto-update access level based on user type
                                    const accessLevelMap: Record<
                                        UserType,
                                        AccessLevel
                                    > = {
                                        client: 'limited',
                                        partner: 'limited',
                                        employee: 'manager',
                                        sales_rep: 'manager',
                                        admin: 'manager',
                                        super_admin: 'admin',
                                    };
                                    updateField(
                                        'access_level',
                                        accessLevelMap[value],
                                    );
                                }}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select user type" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="client">
                                        Client
                                    </SelectItem>
                                    <SelectItem value="partner">
                                        Partner
                                    </SelectItem>
                                    <SelectItem value="employee">
                                        Employee
                                    </SelectItem>
                                    <SelectItem value="sales_rep">
                                        Sales Rep
                                    </SelectItem>
                                    <SelectItem value="admin">Admin</SelectItem>
                                    <SelectItem value="super_admin">
                                        Super Admin
                                    </SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="primary_company">
                                Primary Company
                            </Label>
                            <Select
                                value={
                                    formData.primary_company_id || 'individual'
                                }
                                onValueChange={(value) =>
                                    updateField(
                                        'primary_company_id',
                                        value === 'individual' ? null : value,
                                    )
                                }
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select company" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="individual">
                                        Individual
                                    </SelectItem>
                                    {companies.map((company) => (
                                        <SelectItem
                                            key={company.id}
                                            value={company.id}
                                        >
                                            {company.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </section>

                    {/* Section 3: Access & Security */}
                    <section className="space-y-4">
                        <div className="flex items-center gap-2 text-sm font-semibold tracking-wide text-muted-foreground uppercase">
                            <Shield className="h-4 w-4" />
                            Access & Security
                        </div>
                        <Separator />

                        <div className="space-y-2">
                            <Label htmlFor="two_factor_status">
                                2FA Status
                            </Label>
                            <Select
                                value={formData.two_factor_status}
                                onValueChange={(value: TwoFactorStatus) =>
                                    updateField('two_factor_status', value)
                                }
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select 2FA status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="disabled">
                                        Disabled
                                    </SelectItem>
                                    <SelectItem value="enabled">
                                        Enabled
                                    </SelectItem>
                                    <SelectItem value="required">
                                        Required
                                    </SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="status">Status</Label>
                            <Select
                                value={formData.status}
                                onValueChange={(value: UserStatus) =>
                                    updateField('status', value)
                                }
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="active">
                                        Active
                                    </SelectItem>
                                    <SelectItem value="inactive">
                                        Inactive
                                    </SelectItem>
                                    <SelectItem value="suspended">
                                        Suspended
                                    </SelectItem>
                                </SelectContent>
                            </Select>
                            {formData.status === 'suspended' && (
                                <p className="text-xs text-destructive">
                                    Suspending immediately revokes access
                                </p>
                            )}
                        </div>

                        <div className="flex items-center justify-between py-2">
                            <span className="text-sm text-muted-foreground">
                                Last Login
                            </span>
                            <span className="text-sm font-medium">
                                {user.last_login
                                    ? formatDateTime(user.last_login)
                                    : 'Never'}
                            </span>
                        </div>

                        <div className="space-y-2">
                            <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="w-full justify-between"
                                onClick={() =>
                                    setShowLoginHistory(!showLoginHistory)
                                }
                            >
                                <span className="flex items-center gap-2">
                                    <Clock className="h-4 w-4" />
                                    Login History
                                </span>
                                {showLoginHistory ? (
                                    <ChevronUp className="h-4 w-4" />
                                ) : (
                                    <ChevronDown className="h-4 w-4" />
                                )}
                            </Button>
                            {showLoginHistory && (
                                <div className="max-h-40 space-y-2 overflow-y-auto rounded-md bg-muted/50 p-3">
                                    {loginHistory.length === 0 ? (
                                        <p className="text-center text-sm text-muted-foreground">
                                            No login history
                                        </p>
                                    ) : (
                                        loginHistory.map((entry) => (
                                            <div
                                                key={entry.id}
                                                className="flex justify-between text-xs"
                                            >
                                                <span>
                                                    {formatDateTime(
                                                        entry.created_at,
                                                    )}
                                                </span>
                                                <span className="ml-2 truncate text-muted-foreground">
                                                    {entry.ip_address ||
                                                        'Unknown IP'}
                                                </span>
                                            </div>
                                        ))
                                    )}
                                </div>
                            )}
                        </div>
                    </section>

                    {/* Section 4: Conditional Sections by User Type */}
                    {formData.user_type === 'client' && (
                        <section className="space-y-4">
                            <div className="text-sm font-semibold tracking-wide text-muted-foreground uppercase">
                                Client Details
                            </div>
                            <Separator />

                            <div className="space-y-2">
                                <Label htmlFor="subscription_status">
                                    Subscription Status
                                </Label>
                                <Input
                                    id="subscription_status"
                                    value={formData.subscription_status || ''}
                                    onChange={(e) =>
                                        updateField(
                                            'subscription_status',
                                            e.target.value,
                                        )
                                    }
                                    placeholder="e.g., Active, Cancelled, Paused"
                                />
                            </div>

                            <div className="flex items-center justify-between py-2">
                                <Label
                                    htmlFor="contract_signed"
                                    className="cursor-pointer"
                                >
                                    Contract Signed
                                </Label>
                                <Switch
                                    id="contract_signed"
                                    checked={formData.contract_signed || false}
                                    onCheckedChange={(checked) =>
                                        updateField('contract_signed', checked)
                                    }
                                />
                            </div>

                            {formData.contract_signed && (
                                <div className="space-y-2">
                                    <Label htmlFor="contract_signed_date">
                                        Contract Signed Date
                                    </Label>
                                    <Input
                                        id="contract_signed_date"
                                        type="date"
                                        value={
                                            formData.contract_signed_date || ''
                                        }
                                        onChange={(e) =>
                                            updateField(
                                                'contract_signed_date',
                                                e.target.value || null,
                                            )
                                        }
                                    />
                                </div>
                            )}
                        </section>
                    )}

                    {formData.user_type === 'partner' && (
                        <section className="space-y-4">
                            <div className="text-sm font-semibold tracking-wide text-muted-foreground uppercase">
                                Partner Details
                            </div>
                            <Separator />

                            <div className="space-y-2">
                                <Label htmlFor="commission_rate">
                                    Commission Rate (%)
                                </Label>
                                <Input
                                    id="commission_rate"
                                    type="number"
                                    step="0.01"
                                    value={formData.commission_rate ?? ''}
                                    onChange={(e) =>
                                        updateField(
                                            'commission_rate',
                                            e.target.value
                                                ? parseFloat(e.target.value)
                                                : null,
                                        )
                                    }
                                    placeholder="e.g., 10.00"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="agreement_status">
                                    Agreement Status
                                </Label>
                                <Input
                                    id="agreement_status"
                                    value={formData.agreement_status || ''}
                                    onChange={(e) =>
                                        updateField(
                                            'agreement_status',
                                            e.target.value,
                                        )
                                    }
                                    placeholder="e.g., Signed, Pending, Expired"
                                />
                            </div>

                            <div className="flex items-center justify-between py-2">
                                <span className="text-sm text-muted-foreground">
                                    Total Revenue Influenced
                                </span>
                                <span className="text-sm font-medium">
                                    $
                                    {(
                                        formData.total_revenue_influenced || 0
                                    ).toLocaleString()}
                                </span>
                            </div>
                        </section>
                    )}

                    {formData.user_type === 'sales_rep' && (
                        <section className="space-y-4">
                            <div className="text-sm font-semibold tracking-wide text-muted-foreground uppercase">
                                Sales Rep Details
                            </div>
                            <Separator />

                            <div className="space-y-2">
                                <Label htmlFor="commission_structure">
                                    Commission Structure
                                </Label>
                                <Input
                                    id="commission_structure"
                                    value={formData.commission_structure || ''}
                                    onChange={(e) =>
                                        updateField(
                                            'commission_structure',
                                            e.target.value,
                                        )
                                    }
                                    placeholder="e.g., 5% of revenue"
                                />
                            </div>

                            <div className="flex items-center justify-between py-2">
                                <span className="text-sm text-muted-foreground">
                                    Revenue Attributed
                                </span>
                                <span className="text-sm font-medium">
                                    $
                                    {(
                                        formData.revenue_attributed || 0
                                    ).toLocaleString()}
                                </span>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="hire_date">Hire Date</Label>
                                <Input
                                    id="hire_date"
                                    type="date"
                                    value={formData.hire_date || ''}
                                    onChange={(e) =>
                                        updateField(
                                            'hire_date',
                                            e.target.value || null,
                                        )
                                    }
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="rep_status">Rep Status</Label>
                                <Select
                                    value={formData.rep_status || 'active'}
                                    onValueChange={(value) =>
                                        updateField('rep_status', value)
                                    }
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select rep status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="active">
                                            Active
                                        </SelectItem>
                                        <SelectItem value="inactive">
                                            Inactive
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </section>
                    )}

                    {formData.user_type === 'employee' && (
                        <section className="space-y-4">
                            <div className="text-sm font-semibold tracking-wide text-muted-foreground uppercase">
                                Employee Details
                            </div>
                            <Separator />

                            <div className="space-y-2">
                                <Label htmlFor="title">Title</Label>
                                <Input
                                    id="title"
                                    value={user.title || ''}
                                    disabled
                                    className="bg-muted"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="start_date">Start Date</Label>
                                <Input
                                    id="start_date"
                                    type="date"
                                    value={formData.start_date || ''}
                                    onChange={(e) =>
                                        updateField(
                                            'start_date',
                                            e.target.value || null,
                                        )
                                    }
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="employment_type">
                                    Employment Type
                                </Label>
                                <Select
                                    value={formData.employment_type || ''}
                                    onValueChange={(value) =>
                                        updateField('employment_type', value)
                                    }
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select employment type" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="full_time">
                                            Full-Time
                                        </SelectItem>
                                        <SelectItem value="part_time">
                                            Part-Time
                                        </SelectItem>
                                        <SelectItem value="contractor">
                                            Contractor
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </section>
                    )}

                    {/* Section 5: System Metadata (Admin Only) */}
                    <section className="space-y-4">
                        <div className="text-sm font-semibold tracking-wide text-muted-foreground uppercase">
                            System Metadata
                        </div>
                        <Separator />

                        <div className="space-y-2 text-sm">
                            <div className="flex justify-between py-1">
                                <span className="text-muted-foreground">
                                    User ID (UUID)
                                </span>
                                <span
                                    className="max-w-[180px] truncate font-mono text-xs"
                                    title={user.user_id}
                                >
                                    {user.user_id}
                                </span>
                            </div>
                            <div className="flex justify-between py-1">
                                <span className="text-muted-foreground">
                                    Created By
                                </span>
                                <span>{user.created_by || 'System'}</span>
                            </div>
                            <div className="flex justify-between py-1">
                                <span className="text-muted-foreground">
                                    Created Date
                                </span>
                                <span>{formatDate(user.created_at)}</span>
                            </div>
                            <div className="flex justify-between py-1">
                                <span className="text-muted-foreground">
                                    Last Updated
                                </span>
                                <span>{formatDateTime(user.updated_at)}</span>
                            </div>
                        </div>
                    </section>

                    {/* Actions - Full width Delete and Close buttons */}
                    <div className="flex items-center gap-2 border-t pt-4">
                        <Button
                            variant="destructive"
                            className="flex-1"
                            disabled
                        >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                            {isAutoSaving && (
                                <Loader2 className="ml-2 h-3 w-3 animate-spin" />
                            )}
                        </Button>
                        <Button
                            variant="outline"
                            className="flex-1"
                            onClick={onClose}
                        >
                            Close
                        </Button>
                    </div>
                </div>
            </SheetContent>
        </Sheet>
    );
}
