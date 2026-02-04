import { Card, CardContent } from '@/components/ui/card';
import type { StaffMember } from '@/hooks/useStaffList';
import { DollarSign, UserCheck, Users, UserX } from 'lucide-react';

interface StaffMetricsSummaryProps {
    staff: StaffMember[];
}

export function StaffMetricsSummary({ staff }: StaffMetricsSummaryProps) {
    const totalStaff = staff.length;
    const activeStaff = staff.filter((s) => s.status === 'active').length;
    const inactiveStaff = staff.filter((s) => s.status === 'inactive').length;

    const totalMonthlyPay = staff
        .filter((s) => s.status === 'active')
        .reduce((sum, s) => sum + (s.monthly_pay || 0), 0);

    const metrics = [
        {
            label: 'Total Staff',
            value: totalStaff,
            icon: Users,
            color: 'text-blue-500',
        },
        {
            label: 'Active',
            value: activeStaff,
            icon: UserCheck,
            color: 'text-green-500',
        },
        {
            label: 'Inactive',
            value: inactiveStaff,
            icon: UserX,
            color: 'text-muted-foreground',
        },
        {
            label: 'Active Monthly Payroll',
            value: `$${totalMonthlyPay.toLocaleString()}`,
            icon: DollarSign,
            color: 'text-primary',
        },
    ];

    return (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {metrics.map((metric) => (
                <Card key={metric.label}>
                    <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                            <metric.icon
                                className={`h-8 w-8 ${metric.color}`}
                            />
                            <div>
                                <p className="text-2xl font-bold">
                                    {metric.value}
                                </p>
                                <p className="text-sm text-muted-foreground">
                                    {metric.label}
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
    );
}
