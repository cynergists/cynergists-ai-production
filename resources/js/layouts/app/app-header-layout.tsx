import { AppContent } from '@/components/app-content';
import { AppShell } from '@/components/app-shell';
import type { AppLayoutProps } from '@/types';

export default function AppHeaderLayout({
    children,
}: AppLayoutProps) {
    return (
        <AppShell>
            <AppContent>{children}</AppContent>
        </AppShell>
    );
}
