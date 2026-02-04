import { apiClient } from '@/lib/api-client';
import { useEffect, useState } from 'react';

interface PaymentSettings {
    paymentMode: 'sandbox' | 'production';
    creditCardFeeRate: number;
}

const DEFAULT_FEE_RATE = 0.033;

export function usePaymentSettings() {
    const [settings, setSettings] = useState<PaymentSettings>({
        paymentMode: 'sandbox',
        creditCardFeeRate: DEFAULT_FEE_RATE,
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const data = await apiClient.get<PaymentSettings>(
                    '/api/payment-settings',
                );
                setSettings({
                    paymentMode: data.paymentMode || 'sandbox',
                    creditCardFeeRate:
                        Number(data.creditCardFeeRate) || DEFAULT_FEE_RATE,
                });
            } catch (err) {
                console.error('Error fetching payment settings:', err);
                setError(
                    err instanceof Error
                        ? err
                        : new Error('Failed to fetch settings'),
                );
            } finally {
                setLoading(false);
            }
        };

        fetchSettings();
    }, []);

    return { settings, loading, error };
}

export function useAdminPaymentSettings() {
    const [settings, setSettings] = useState<{
        id: string | null;
        paymentMode: 'sandbox' | 'production';
        creditCardFeeRate: number;
        updatedAt: string | null;
    }>({
        id: null,
        paymentMode: 'sandbox',
        creditCardFeeRate: DEFAULT_FEE_RATE,
        updatedAt: null,
    });
    const [loading, setLoading] = useState(true);

    const loadSettings = async () => {
        try {
            const data = await apiClient.get<{
                id: string | null;
                paymentMode: 'sandbox' | 'production';
                creditCardFeeRate: number;
                updatedAt: string | null;
            }>('/api/admin/payment-settings');
            setSettings(data);
        } catch (error) {
            console.error('Error loading settings:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadSettings();
    }, []);

    const updateSettings = async (updates: {
        paymentMode?: 'sandbox' | 'production';
        creditCardFeeRate?: number;
    }) => {
        await apiClient.put('/api/admin/payment-settings', {
            paymentMode: updates.paymentMode ?? settings.paymentMode,
            creditCardFeeRate:
                updates.creditCardFeeRate ?? settings.creditCardFeeRate,
        });
        await loadSettings();
    };

    return { settings, loading, updateSettings, reload: loadSettings };
}
