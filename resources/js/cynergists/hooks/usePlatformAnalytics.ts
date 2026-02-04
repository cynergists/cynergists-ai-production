import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import { DateRange } from 'react-day-picker';

export interface PlatformMetrics {
    configured: boolean;
    primaryMetric?: number;
    primaryLabel?: string;
    secondaryMetric?: number;
    secondaryLabel?: string;
    status?: 'connected' | 'error' | 'not_configured';
}

interface AllPlatformData {
    ga4: PlatformMetrics;
    searchConsole: PlatformMetrics;
    youtube: PlatformMetrics;
    tiktok: PlatformMetrics;
    linkedin: PlatformMetrics;
    meta: PlatformMetrics;
    clarity: PlatformMetrics;
    square: PlatformMetrics;
}

export function usePlatformAnalytics(dateRange: DateRange | undefined) {
    const startDate = dateRange?.from
        ? format(dateRange.from, 'yyyy-MM-dd')
        : undefined;
    const endDate = dateRange?.to
        ? format(dateRange.to, 'yyyy-MM-dd')
        : undefined;
    const enabled = !!startDate && !!endDate;

    // Square Analytics
    const squareQuery = useQuery({
        queryKey: ['platform-square', startDate, endDate],
        queryFn: async (): Promise<PlatformMetrics> => {
            try {
                const { data, error } = await supabase.functions.invoke(
                    'square-analytics',
                    {
                        body: { startDate, endDate },
                    },
                );
                if (error || data?.error === 'NOT_CONFIGURED') {
                    return { configured: false, status: 'not_configured' };
                }
                return {
                    configured: true,
                    status: 'connected',
                    primaryMetric: data.totalRevenue / 100,
                    primaryLabel: 'Revenue',
                    secondaryMetric: data.transactionCount,
                    secondaryLabel: 'Transactions',
                };
            } catch {
                return { configured: false, status: 'error' };
            }
        },
        enabled,
        retry: false,
    });

    // Microsoft Clarity
    const clarityQuery = useQuery({
        queryKey: ['platform-clarity', startDate, endDate],
        queryFn: async (): Promise<PlatformMetrics> => {
            try {
                const { data, error } = await supabase.functions.invoke(
                    'microsoft-clarity',
                    {
                        body: { startDate, endDate },
                    },
                );
                if (error || data?.configured === false) {
                    return { configured: false, status: 'not_configured' };
                }
                return {
                    configured: true,
                    status: 'connected',
                    primaryMetric: data.totalSessions || 0,
                    primaryLabel: 'Sessions',
                    secondaryMetric: data.rageClicks || 0,
                    secondaryLabel: 'Rage Clicks',
                };
            } catch {
                return { configured: false, status: 'error' };
            }
        },
        enabled,
        retry: false,
    });

    // Placeholder queries for other platforms (to be connected via Settings)
    const createPlaceholderMetrics = (): PlatformMetrics => ({
        configured: false,
        status: 'not_configured',
    });

    const data: AllPlatformData = {
        ga4: createPlaceholderMetrics(),
        searchConsole: createPlaceholderMetrics(),
        youtube: createPlaceholderMetrics(),
        tiktok: createPlaceholderMetrics(),
        linkedin: createPlaceholderMetrics(),
        meta: createPlaceholderMetrics(),
        clarity: clarityQuery.data || createPlaceholderMetrics(),
        square: squareQuery.data || createPlaceholderMetrics(),
    };

    const isLoading = squareQuery.isLoading || clarityQuery.isLoading;

    // Calculate aggregated metrics
    const aggregated = {
        totalVisitors: data.ga4.configured ? data.ga4.primaryMetric || 0 : 0,
        totalImpressions:
            (data.searchConsole.configured
                ? data.searchConsole.primaryMetric || 0
                : 0) +
            (data.youtube.configured ? data.youtube.primaryMetric || 0 : 0) +
            (data.tiktok.configured ? data.tiktok.primaryMetric || 0 : 0) +
            (data.linkedin.configured ? data.linkedin.primaryMetric || 0 : 0) +
            (data.meta.configured ? data.meta.primaryMetric || 0 : 0),
        totalEngagement:
            (data.youtube.configured ? data.youtube.secondaryMetric || 0 : 0) +
            (data.tiktok.configured ? data.tiktok.secondaryMetric || 0 : 0) +
            (data.linkedin.configured
                ? data.linkedin.secondaryMetric || 0
                : 0) +
            (data.meta.configured ? data.meta.secondaryMetric || 0 : 0),
        totalRevenue: data.square.configured
            ? data.square.primaryMetric || 0
            : 0,
        transactionCount: data.square.configured
            ? data.square.secondaryMetric || 0
            : 0,
    };

    const connectedCount = Object.values(data).filter(
        (p) => p.configured,
    ).length;

    return {
        data,
        aggregated,
        isLoading,
        connectedCount,
    };
}
