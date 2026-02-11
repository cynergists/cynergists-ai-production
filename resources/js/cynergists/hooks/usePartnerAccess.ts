import { supabase } from '@/integrations/supabase/client';
import { useEffect, useState } from 'react';

interface PartnerData {
    id: string;
    first_name: string | null;
    last_name: string | null;
    email: string;
    company_name: string | null;
    partner_status: string;
    slug: string | null;
    email_verified: boolean;
    mfa_enabled: boolean;
    commission_rate: number;
    total_commissions_earned: number;
    outstanding_commission_balance: number;
    referrals_given: number;
    qualified_referrals: number;
    closed_won_deals: number;
    revenue_generated: number;
}

interface PartnerAccess {
    isLoading: boolean;
    isAuthenticated: boolean;
    isPartner: boolean;
    partner: PartnerData | null;
    status: 'pending' | 'active' | 'suspended' | null;

    // Feature access based on status
    canAccessPayouts: boolean;
    canScheduleReports: boolean;
    canEditPayoutMethod: boolean;
    canSubmitReferrals: boolean;
    canViewDeals: boolean;
    canViewCommissions: boolean;
    canViewMarketing: boolean;

    // Actions
    refetch: () => Promise<void>;
}

// Super admin emails that can access partner portal without partner role
const SUPER_ADMIN_EMAILS = ['chris@cynergists.com', 'ryan@cynergists.com'];

export function usePartnerAccess(): PartnerAccess {
    const [isLoading, setIsLoading] = useState(true);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isPartner, setIsPartner] = useState(false);
    const [partner, setPartner] = useState<PartnerData | null>(null);
    const [isSuperAdmin, setIsSuperAdmin] = useState(false);

    const fetchPartnerData = async () => {
        try {
            const {
                data: { session },
            } = await supabase.auth.getSession();

            if (!session) {
                setIsAuthenticated(false);
                setIsPartner(false);
                setPartner(null);
                setIsSuperAdmin(false);
                return;
            }

            setIsAuthenticated(true);

            // Check if user is a super admin
            const userEmail = session.user.email?.toLowerCase();
            const isSuperAdminUser = userEmail
                ? SUPER_ADMIN_EMAILS.includes(userEmail)
                : false;
            setIsSuperAdmin(isSuperAdminUser);

            // Check if user has partner role
            const { data: hasRole } = await supabase.rpc('has_role', {
                _user_id: session.user.id,
                _role: 'partner',
            });

            if (!hasRole && !isSuperAdminUser) {
                setIsPartner(false);
                setPartner(null);
                return;
            }

            // Super admins can access without being a partner
            setIsPartner(true);

            // Fetch partner data (only if they have partner role)
            if (hasRole) {
                const { data: partnerData, error } = await supabase.rpc(
                    'get_partner_by_user_id',
                    {
                        _user_id: session.user.id,
                    },
                );

                if (error) {
                    console.error('Error fetching partner data:', error);
                    return;
                }

                if (partnerData && partnerData.length > 0) {
                    setPartner(partnerData[0] as PartnerData);
                }
            } else if (isSuperAdminUser) {
                // Create a mock partner object for super admins viewing the portal
                setPartner({
                    id: 'admin-view',
                    first_name: 'Admin',
                    last_name: 'View',
                    email: session.user.email || '',
                    company_name: 'Cynergists (Admin)',
                    partner_status: 'active',
                    slug: null,
                    email_verified: true,
                    mfa_enabled: true,
                    commission_rate: 0,
                    total_commissions_earned: 0,
                    outstanding_commission_balance: 0,
                    referrals_given: 0,
                    qualified_referrals: 0,
                    closed_won_deals: 0,
                    revenue_generated: 0,
                });
            }
        } catch (error) {
            console.error('Error in usePartnerAccess:', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchPartnerData();

        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange((event, session) => {
            if (event === 'SIGNED_OUT') {
                setIsAuthenticated(false);
                setIsPartner(false);
                setPartner(null);
            } else if (event === 'SIGNED_IN' && session) {
                fetchPartnerData();
            }
        });

        return () => subscription.unsubscribe();
    }, []);

    const status = partner?.partner_status as
        | 'pending'
        | 'active'
        | 'suspended'
        | null;
    const isActive = status === 'active';
    const canAccess = status === 'pending' || status === 'active';

    return {
        isLoading,
        isAuthenticated,
        isPartner,
        partner,
        status,

        // Feature access
        canAccessPayouts: isActive,
        canScheduleReports: isActive,
        canEditPayoutMethod: isActive && (partner?.mfa_enabled ?? false),
        canSubmitReferrals: canAccess,
        canViewDeals: canAccess,
        canViewCommissions: canAccess,
        canViewMarketing: canAccess,

        refetch: fetchPartnerData,
    };
}
