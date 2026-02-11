import { callAdminApi } from '@/lib/admin-api';
import { useCallback, useState } from 'react';
import { toast } from 'sonner';

export interface PartnerProfile {
    id: string;
    first_name: string | null;
    last_name: string | null;
    email: string;
    phone: string | null;
    company_name: string | null;
    partner_type: string | null;
    website: string | null;
    address_line1: string | null;
    address_line2: string | null;
    city: string | null;
    state: string | null;
    postal_code: string | null;
    country: string | null;
    profile_complete: boolean;
    // Tax
    tax_status: string;
    tax_rejection_reason: string | null;
    w9_file_url: string | null;
    // Payout
    payout_status: string;
    payout_rejection_reason: string | null;
    payout_provider: string | null;
    payout_token_reference: string | null;
    payout_last4: string | null;
    payout_bank_name: string | null;
    payout_account_type: string | null;
    payout_verified_at: string | null;
    // Security
    mfa_enabled: boolean;
    email_verified: boolean;
}

export interface ProfileUpdateData {
    first_name?: string;
    last_name?: string;
    phone?: string;
    company_name?: string;
    website?: string;
    address_line1?: string;
    address_line2?: string;
    city?: string;
    state?: string;
    postal_code?: string;
    country?: string;
}

export interface PayoutMethodData {
    payout_bank_name: string;
    payout_account_type: string;
    payout_token_reference: string;
    payout_last4: string;
}

export function usePartnerSettings(partnerId: string | undefined) {
    const [saving, setSaving] = useState(false);
    const [uploadingW9, setUploadingW9] = useState(false);

    const updateProfile = useCallback(
        async (data: ProfileUpdateData): Promise<boolean> => {
            if (!partnerId) return false;

            setSaving(true);
            try {
                await callAdminApi(
                    'update_partner',
                    { partner_id: partnerId },
                    data,
                );

                toast.success('Profile updated successfully');
                return true;
            } catch (error) {
                console.error('Error updating profile:', error);
                toast.error('Failed to update profile');
                return false;
            } finally {
                setSaving(false);
            }
        },
        [partnerId],
    );

    const uploadW9 = useCallback(
        async (file: File): Promise<boolean> => {
            if (!partnerId) return false;

            setUploadingW9(true);
            try {
                const formData = new FormData();
                formData.append('w9', file);

                const csrfToken = document
                    .querySelector('meta[name="csrf-token"]')
                    ?.getAttribute('content');

                const response = await fetch(`/api/partners/${partnerId}/w9`, {
                    method: 'POST',
                    credentials: 'same-origin',
                    headers: csrfToken
                        ? { 'X-CSRF-TOKEN': csrfToken }
                        : undefined,
                    body: formData,
                });

                if (!response.ok) {
                    const errorData = await response.json().catch(() => ({}));
                    throw new Error(
                        errorData.message || 'Failed to upload W-9',
                    );
                }

                toast.success('W-9 submitted successfully');
                return true;
            } catch (error) {
                console.error('Error uploading W-9:', error);
                toast.error('Failed to upload W-9');
                return false;
            } finally {
                setUploadingW9(false);
            }
        },
        [partnerId],
    );

    const submitPayoutMethod = useCallback(
        async (data: PayoutMethodData): Promise<boolean> => {
            if (!partnerId) return false;

            setSaving(true);
            try {
                await callAdminApi(
                    'update_partner',
                    { partner_id: partnerId },
                    {
                        payout_provider: 'pending',
                        payout_bank_name: data.payout_bank_name,
                        payout_account_type: data.payout_account_type,
                        payout_token_reference: data.payout_token_reference,
                        payout_last4: data.payout_last4,
                        payout_status: 'submitted',
                    },
                );

                toast.success('Payout method submitted for verification');
                return true;
            } catch (error) {
                console.error('Error submitting payout method:', error);
                toast.error('Failed to submit payout method');
                return false;
            } finally {
                setSaving(false);
            }
        },
        [partnerId],
    );

    const changePassword = useCallback(
        async (
            currentPassword: string,
            newPassword: string,
        ): Promise<boolean> => {
            setSaving(true);
            try {
                const csrfToken = document
                    .querySelector('meta[name="csrf-token"]')
                    ?.getAttribute('content');

                const response = await fetch('/api/user/password', {
                    method: 'PATCH',
                    credentials: 'same-origin',
                    headers: {
                        'Content-Type': 'application/json',
                        ...(csrfToken ? { 'X-CSRF-TOKEN': csrfToken } : {}),
                    },
                    body: JSON.stringify({
                        current_password: currentPassword,
                        password: newPassword,
                    }),
                });

                if (!response.ok) {
                    const errorData = await response.json().catch(() => ({}));
                    throw new Error(
                        errorData.message || 'Failed to change password',
                    );
                }

                toast.success('Password updated successfully');
                return true;
            } catch (error: any) {
                console.error('Error changing password:', error);
                toast.error(error.message || 'Failed to change password');
                return false;
            } finally {
                setSaving(false);
            }
        },
        [],
    );

    const sendMagicLink = useCallback(
        async (email: string): Promise<boolean> => {
            setSaving(true);
            try {
                const csrfToken = document
                    .querySelector('meta[name="csrf-token"]')
                    ?.getAttribute('content');

                const response = await fetch('/api/partner/magic-link', {
                    method: 'POST',
                    credentials: 'same-origin',
                    headers: {
                        'Content-Type': 'application/json',
                        ...(csrfToken ? { 'X-CSRF-TOKEN': csrfToken } : {}),
                    },
                    body: JSON.stringify({ email }),
                });

                if (!response.ok) {
                    const errorData = await response.json().catch(() => ({}));
                    throw new Error(
                        errorData.message || 'Failed to send magic link',
                    );
                }

                toast.success('Magic link sent to your email');
                return true;
            } catch (error: any) {
                console.error('Error sending magic link:', error);
                toast.error(error.message || 'Failed to send magic link');
                return false;
            } finally {
                setSaving(false);
            }
        },
        [],
    );

    const toggleMFA = useCallback(
        async (enabled: boolean): Promise<boolean> => {
            if (!partnerId) return false;

            setSaving(true);
            try {
                await callAdminApi(
                    'update_partner',
                    { partner_id: partnerId },
                    {
                        mfa_enabled: enabled,
                    },
                );

                toast.success(
                    enabled
                        ? 'MFA requirement enabled'
                        : 'MFA requirement disabled',
                );
                return true;
            } catch (error) {
                console.error('Error updating MFA:', error);
                toast.error('Failed to update MFA setting');
                return false;
            } finally {
                setSaving(false);
            }
        },
        [partnerId],
    );

    return {
        saving,
        uploadingW9,
        updateProfile,
        uploadW9,
        submitPayoutMethod,
        changePassword,
        sendMagicLink,
        toggleMFA,
    };
}
