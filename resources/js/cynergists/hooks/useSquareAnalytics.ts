import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import { DateRange } from 'react-day-picker';

interface DailyRevenue {
    date: string;
    revenue: number;
    transactions: number;
}

interface TopProduct {
    name: string;
    revenue: number;
    quantity: number;
}

interface SquareAnalyticsData {
    totalRevenue: number;
    revenueChange?: string;
    revenueChangeType?: 'positive' | 'negative' | 'neutral';
    transactionCount: number;
    transactionChange?: string;
    transactionChangeType?: 'positive' | 'negative' | 'neutral';
    averageOrder: number;
    cardPayments: number;
    dailyRevenue: DailyRevenue[];
    paymentMethods: Record<string, number>;
    topProducts: TopProduct[];
}

export function useSquareAnalytics(dateRange: DateRange | undefined) {
    const query = useQuery({
        queryKey: ['square-analytics', dateRange?.from, dateRange?.to],
        queryFn: async (): Promise<SquareAnalyticsData | null> => {
            const startDate = dateRange?.from
                ? format(dateRange.from, 'yyyy-MM-dd')
                : undefined;
            const endDate = dateRange?.to
                ? format(dateRange.to, 'yyyy-MM-dd')
                : undefined;

            const { data, error } = await supabase.functions.invoke(
                'square-analytics',
                {
                    body: { startDate, endDate },
                },
            );

            if (error) {
                console.error('Square analytics error:', error);
                throw error;
            }

            return data;
        },
        enabled: !!dateRange?.from && !!dateRange?.to,
        retry: false,
    });

    return {
        data: query.data,
        isLoading: query.isLoading,
        error: query.error,
        refetch: query.refetch,
    };
}
