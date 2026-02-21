import AccessibilityWidget from '@/components/AccessibilityWidget';
import Chatbot from '@/components/Chatbot';
import { ReactNode } from 'react';
import Footer from './Footer';
import Header from './Header';

interface LayoutProps {
    children: ReactNode;
    searchQuery?: string;
    onSearchChange?: (query: string) => void;
    categories?: string[];
    selectedCategories?: string[];
    onCategoryChange?: (categories: string[]) => void;
}

const Layout = ({
    children,
    searchQuery,
    onSearchChange,
    categories,
    selectedCategories,
    onCategoryChange,
}: LayoutProps) => {
    return (
        <div className="flex min-h-screen flex-col">
            <Header
                searchQuery={searchQuery}
                onSearchChange={onSearchChange}
                categories={categories}
                selectedCategories={selectedCategories}
                onCategoryChange={onCategoryChange}
            />
            <main className="flex-1 pt-20 md:pt-28">{children}</main>
            <Footer />
            <AccessibilityWidget />
            <Chatbot />
        </div>
    );
};

export default Layout;
