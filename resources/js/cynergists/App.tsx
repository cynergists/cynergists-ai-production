import { Toaster as Sonner } from '@/components/ui/sonner';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactNode, useEffect } from 'react';
import CartDrawer from './components/cart/CartDrawer';
import ScrollToTop from './components/ScrollToTop';
import { CartProvider } from './contexts/CartContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { IDevTracking } from './services/idevTracking';

const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            staleTime: 5 * 60 * 1000, // 5 minutes - data stays fresh
            gcTime: 30 * 60 * 1000, // 30 minutes - cache kept in memory
            refetchOnWindowFocus: false, // Don't refetch when switching tabs
            retry: 1,
        },
    },
});

const App = ({ children }: { children: ReactNode }) => {
    // Initialize iDevAffiliate tracking on mount
    useEffect(() => {
        IDevTracking.trackPageView();
    }, []);

    return (
        <QueryClientProvider client={queryClient}>
            <ThemeProvider>
                <TooltipProvider>
                    <CartProvider>
                        <Toaster />
                        <Sonner />
                        <CartDrawer />
                        <ScrollToTop />
                        {children}
                    </CartProvider>
                </TooltipProvider>
            </ThemeProvider>
        </QueryClientProvider>
    );
};

export default App;
