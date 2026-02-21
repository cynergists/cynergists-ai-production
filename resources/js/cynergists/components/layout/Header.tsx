import cynergistsLogo from '@/assets/logos/cynergists-ai-full.webp';
import CartButton from '@/components/cart/CartButton';
import { Button } from '@/components/ui/button';
import { OrbitingButton } from '@/components/ui/orbiting-button';
import { Input } from '@/components/ui/input';
import { useTheme } from '@/contexts/ThemeContext';
import { Link, router, usePage } from '@inertiajs/react';
import { AnimatePresence, motion } from 'framer-motion';
import {
    ArrowRight,
    Check,
    LayoutDashboard,
    LogIn,
    LogOut,
    Menu,
    Moon,
    Search,
    Shield,
    Sparkles,
    Sun,
    X,
} from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
};

interface HeaderProps {
    searchQuery?: string;
    onSearchChange?: (query: string) => void;
    categories?: string[];
    selectedCategories?: string[];
    onCategoryChange?: (categories: string[]) => void;
}

const Header = ({
    searchQuery = '',
    onSearchChange,
    categories = [],
    selectedCategories = [],
    onCategoryChange,
}: HeaderProps) => {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [searchOpen, setSearchOpen] = useState(false);
    const [showSearchInput, setShowSearchInput] = useState(false);
    const { theme, toggleTheme } = useTheme();
    const { url, props } = usePage<{
        auth?: {
            user?: { id: number } | null;
            roles?: string[];
        };
    }>();
    const pathname = url.split('?')[0];
    const isAuthenticated = Boolean(props.auth?.user);
    const isAdmin = Boolean(props.auth?.roles?.includes('admin'));
    const isClient = Boolean(props.auth?.roles?.includes('client'));
    const searchInputRef = useRef<HTMLInputElement>(null);

    const isHomepage = pathname === '/';
    const isMarketplace = pathname === '/marketplace';

    // Handle search drawer animation
    useEffect(() => {
        if (searchOpen) {
            // Delay showing input after drawer opens
            const timer = setTimeout(() => {
                setShowSearchInput(true);
                // Focus input after it appears
                setTimeout(() => {
                    searchInputRef.current?.focus();
                }, 100);
            }, 200);
            return () => clearTimeout(timer);
        } else {
            setShowSearchInput(false);
        }
    }, [searchOpen]);

    // Close search drawer when clicking outside or pressing escape
    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                setSearchOpen(false);
            }
        };
        document.addEventListener('keydown', handleEscape);
        return () => document.removeEventListener('keydown', handleEscape);
    }, []);

    const handleSearchChange = (value: string) => {
        if (onSearchChange) {
            onSearchChange(value);
        }
    };

    const toggleCategory = (category: string) => {
        if (!onCategoryChange) return;

        if (selectedCategories.includes(category)) {
            onCategoryChange(selectedCategories.filter((c) => c !== category));
        } else {
            onCategoryChange([...selectedCategories, category]);
        }
    };

    const clearCategories = () => {
        if (onCategoryChange) {
            onCategoryChange([]);
        }
    };

    const handleSignOut = () => {
        router.post('/logout');
    };

    return (
        <>
            <header className="glass fixed top-0 right-0 left-0 z-50 border-b border-border/40 px-4 py-3 sm:px-6 sm:py-5 lg:px-12">
                <div className="mx-auto max-w-screen-2xl">
                    <div className="flex items-center justify-between">
                        {/* Logo */}
                        <Link
                            href="/"
                            className="group flex items-center"
                            onClick={scrollToTop}
                        >
                            <img
                                src={cynergistsLogo}
                                alt="Cynergists"
                                className="h-10 w-auto transition-transform group-hover:scale-105 sm:h-12"
                            />
                        </Link>

                        {/* Desktop Navigation - Right aligned */}
                        <div className="hidden items-center gap-2 lg:flex">
                            {/* Portal/Admin buttons with divider if authenticated */}
                            {(isAdmin || isClient) && (
                                <>
                                    {isClient && (
                                        <Link
                                            href="/portal"
                                            onClick={scrollToTop}
                                        >
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="gap-2 text-foreground/70 hover:bg-muted/80 hover:text-foreground"
                                            >
                                                <LayoutDashboard className="h-4 w-4" />
                                                Portal
                                            </Button>
                                        </Link>
                                    )}
                                    {isAdmin && (
                                        <a href="/filament">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="gap-2 text-foreground/70 hover:bg-muted/80 hover:text-foreground"
                                            >
                                                <Shield className="h-4 w-4" />
                                                Admin
                                            </Button>
                                        </a>
                                    )}
                                    <div className="mx-1 h-6 w-px bg-border/60" />
                                </>
                            )}

                            {/* Icon buttons group */}
                            <div className="flex items-center gap-1">
                                {/* CTA button - varies by page */}
                                {isHomepage && (
                                    <OrbitingButton
                                        asChild
                                        className="btn-primary group gap-2"
                                    >
                                        <Link href="/marketplace" onClick={scrollToTop}>
                                            Deploy Your Agents Now
                                            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                                        </Link>
                                    </OrbitingButton>
                                )}
                                {!isHomepage && !isMarketplace && (
                                    <Link href="/marketplace" onClick={scrollToTop}>
                                        <Button className="btn-primary gap-2">
                                            <Sparkles className="h-4 w-4" />
                                            Agent Marketplace
                                        </Button>
                                    </Link>
                                )}
                                {/* Theme toggle */}
                                <button
                                    onClick={toggleTheme}
                                    className="rounded-full p-2.5 text-foreground/70 transition-all duration-200 hover:bg-muted/80 hover:text-foreground"
                                    aria-label="Toggle theme"
                                >
                                    {theme === 'dark' ? (
                                        <Sun className="h-[18px] w-[18px]" />
                                    ) : (
                                        <Moon className="h-[18px] w-[18px]" />
                                    )}
                                </button>

                                {/* Search icon - only on marketplace */}
                                {isMarketplace && (
                                    <button
                                        onClick={() =>
                                            setSearchOpen(!searchOpen)
                                        }
                                        className="rounded-full p-2.5 text-foreground/70 transition-all duration-200 hover:bg-muted/80 hover:text-foreground"
                                        aria-label="Search"
                                    >
                                        <Search className="h-[18px] w-[18px]" />
                                    </button>
                                )}

                                {/* Cart */}
                                <CartButton alwaysShow={isMarketplace} />
                            </div>

                            <div className="mx-1 h-6 w-px bg-border/60" />

                            {/* Sign In / Sign Out */}
                            {isAuthenticated ? (
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={handleSignOut}
                                    className="gap-2 text-foreground/70 hover:bg-muted/80 hover:text-foreground"
                                >
                                    <LogOut className="h-4 w-4" />
                                    Sign Out
                                </Button>
                            ) : (
                                <Link href="/signin" onClick={scrollToTop}>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="gap-2 text-foreground/70 hover:bg-muted/80 hover:text-foreground"
                                    >
                                        <LogIn className="h-4 w-4" />
                                        Sign In
                                    </Button>
                                </Link>
                            )}
                        </div>

                        {/* Mobile Menu Toggle & Icons */}
                        <div className="flex items-center gap-1 lg:hidden">
                            <button
                                onClick={toggleTheme}
                                className="rounded-full p-2.5 text-foreground/70 transition-all duration-200 hover:bg-muted/80 hover:text-foreground"
                                aria-label="Toggle theme"
                            >
                                {theme === 'dark' ? (
                                    <Sun className="h-[18px] w-[18px]" />
                                ) : (
                                    <Moon className="h-[18px] w-[18px]" />
                                )}
                            </button>

                            {/* Search icon - only on marketplace */}
                            {isMarketplace && (
                                <button
                                    onClick={() => setSearchOpen(!searchOpen)}
                                    className="rounded-full p-2.5 text-foreground/70 transition-all duration-200 hover:bg-muted/80 hover:text-foreground"
                                    aria-label="Search"
                                >
                                    <Search className="h-[18px] w-[18px]" />
                                </button>
                            )}

                            <CartButton alwaysShow={isMarketplace} />

                            <button
                                className="ml-1 rounded-full p-2.5 text-foreground/70 transition-all duration-200 hover:bg-muted/80 hover:text-foreground"
                                onClick={() =>
                                    setMobileMenuOpen(!mobileMenuOpen)
                                }
                                aria-label="Toggle menu"
                            >
                                {mobileMenuOpen ? (
                                    <X className="h-5 w-5" />
                                ) : (
                                    <Menu className="h-5 w-5" />
                                )}
                            </button>
                        </div>
                    </div>

                    {/* Mobile Menu */}
                    <AnimatePresence>
                        {mobileMenuOpen && (
                            <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                transition={{
                                    duration: 0.2,
                                    ease: 'easeInOut',
                                }}
                                className="overflow-hidden lg:hidden"
                            >
                                <nav className="flex flex-col gap-2 border-t border-border/40 py-4">
                                    {isHomepage && (
                                        <OrbitingButton
                                            asChild
                                            className="btn-primary group w-full gap-2"
                                        >
                                            <Link
                                                href="/marketplace"
                                                onClick={() => {
                                                    setMobileMenuOpen(false);
                                                    scrollToTop();
                                                }}
                                            >
                                                Deploy Your Agents Now
                                                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                                            </Link>
                                        </OrbitingButton>
                                    )}
                                    {!isHomepage && !isMarketplace && (
                                        <Link
                                            href="/marketplace"
                                            onClick={() => {
                                                setMobileMenuOpen(false);
                                                scrollToTop();
                                            }}
                                        >
                                            <Button className="btn-primary w-full gap-2">
                                                <Sparkles className="h-4 w-4" />
                                                Agent Marketplace
                                            </Button>
                                        </Link>
                                    )}
                                    {isClient && (
                                        <Link
                                            href="/portal"
                                            onClick={() => {
                                                setMobileMenuOpen(false);
                                                scrollToTop();
                                            }}
                                        >
                                            <Button
                                                variant="outline"
                                                className="w-full gap-2"
                                            >
                                                <LayoutDashboard className="h-4 w-4" />
                                                Portal
                                            </Button>
                                        </Link>
                                    )}
                                    {isAdmin && (
                                        <a
                                            href="/filament"
                                            onClick={() =>
                                                setMobileMenuOpen(false)
                                            }
                                        >
                                            <Button
                                                variant="outline"
                                                className="w-full gap-2"
                                            >
                                                <Shield className="h-4 w-4" />
                                                Admin
                                            </Button>
                                        </a>
                                    )}

                                    <div className="my-2 h-px bg-border/40" />

                                    {isAuthenticated ? (
                                        <Button
                                            variant="ghost"
                                            onClick={() => {
                                                setMobileMenuOpen(false);
                                                handleSignOut();
                                            }}
                                            className="w-full justify-center gap-2 text-foreground/70"
                                        >
                                            <LogOut className="h-4 w-4" />
                                            Sign Out
                                        </Button>
                                    ) : (
                                        <Link
                                            href="/signin"
                                            onClick={() => {
                                                setMobileMenuOpen(false);
                                                scrollToTop();
                                            }}
                                        >
                                            <Button
                                                variant="ghost"
                                                className="w-full justify-center gap-2 text-foreground/70"
                                            >
                                                <LogIn className="h-4 w-4" />
                                                Sign In
                                            </Button>
                                        </Link>
                                    )}
                                </nav>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Search Drawer - Apple Store style */}
                <AnimatePresence>
                    {searchOpen && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.3, ease: 'easeInOut' }}
                            className="overflow-hidden border-t border-border bg-background/95 backdrop-blur-md"
                        >
                            <div className="container mx-auto px-4 py-6">
                                <AnimatePresence>
                                    {showSearchInput && (
                                        <motion.div
                                            initial={{ opacity: 0, y: -10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: -10 }}
                                            transition={{
                                                duration: 0.2,
                                                ease: 'easeOut',
                                            }}
                                            className="mx-auto max-w-2xl space-y-4"
                                        >
                                            <div className="relative">
                                                <Search className="absolute top-1/2 left-4 h-5 w-5 -translate-y-1/2 transform text-muted-foreground" />
                                                <Input
                                                    ref={searchInputRef}
                                                    placeholder="Search agents..."
                                                    value={searchQuery}
                                                    onChange={(e) =>
                                                        handleSearchChange(
                                                            e.target.value,
                                                        )
                                                    }
                                                    className="h-14 border-border bg-card pl-12 text-lg"
                                                />
                                                {searchQuery && (
                                                    <button
                                                        onClick={() =>
                                                            handleSearchChange(
                                                                '',
                                                            )
                                                        }
                                                        className="absolute top-1/2 right-4 -translate-y-1/2 transform text-muted-foreground transition-colors hover:text-foreground"
                                                    >
                                                        <X className="h-5 w-5" />
                                                    </button>
                                                )}
                                            </div>

                                            {/* Category Filter */}
                                            {categories.length > 0 && (
                                                <div className="space-y-2">
                                                    <div className="flex items-center justify-between">
                                                        <span className="text-sm font-medium text-muted-foreground">
                                                            Filter by Category
                                                        </span>
                                                        {selectedCategories.length >
                                                            0 && (
                                                            <button
                                                                onClick={
                                                                    clearCategories
                                                                }
                                                                className="text-xs text-muted-foreground transition-colors hover:text-foreground"
                                                            >
                                                                Clear all
                                                            </button>
                                                        )}
                                                    </div>
                                                    <div className="flex flex-wrap gap-2">
                                                        {categories.map(
                                                            (category) => {
                                                                const isSelected =
                                                                    selectedCategories.includes(
                                                                        category,
                                                                    );
                                                                return (
                                                                    <button
                                                                        key={
                                                                            category
                                                                        }
                                                                        onClick={() =>
                                                                            toggleCategory(
                                                                                category,
                                                                            )
                                                                        }
                                                                        className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm transition-all ${
                                                                            isSelected
                                                                                ? 'bg-lime-500 font-medium text-black'
                                                                                : 'bg-muted text-foreground hover:bg-muted/80'
                                                                        }`}
                                                                    >
                                                                        {isSelected && (
                                                                            <Check className="h-3 w-3" />
                                                                        )}
                                                                        {
                                                                            category
                                                                        }
                                                                    </button>
                                                                );
                                                            },
                                                        )}
                                                    </div>
                                                </div>
                                            )}
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </header>

            {/* Backdrop overlay when search is open */}
            <AnimatePresence>
                {searchOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="fixed inset-0 z-40 bg-black/20"
                        onClick={() => setSearchOpen(false)}
                    />
                )}
            </AnimatePresence>
        </>
    );
};

export default Header;
