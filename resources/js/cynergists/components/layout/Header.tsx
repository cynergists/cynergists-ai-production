import cynergistsLogo from '@/assets/Cynergists_Word_Script_4.webp';
import CartButton from '@/components/cart/CartButton';
import { Button } from '@/components/ui/button';
import { Link, router, usePage } from '@inertiajs/react';
import { AnimatePresence, motion } from 'framer-motion';
import {
    LayoutDashboard,
    Menu,
    Shield,
    X,
} from 'lucide-react';
import { useState } from 'react';

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

    const isMarketplace = pathname === '/';

    const handleSignOut = () => {
        router.post('/logout');
    };

    return (
        <>
            <header className="glass fixed top-0 right-0 left-0 z-50 border-b border-border/40 px-3 md:px-4">
                <div className="mx-auto max-w-screen-2xl">
                    <div className="flex h-20 items-center justify-between md:h-28">
                        {/* Logo */}
                        <Link
                            href="/"
                            className="group flex items-center"
                            onClick={scrollToTop}
                        >
                            <img
                                src={cynergistsLogo}
                                alt="Cynergists"
                                className="logo-glow h-14 w-auto transition-transform group-hover:scale-105 md:h-24"
                            />
                        </Link>

                        {/* Desktop Navigation - Right aligned */}
                        <div className="hidden items-center gap-4 lg:flex">
                            {isClient && (
                                <Link href="/portal" onClick={scrollToTop}>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="gap-2 border-lime-500 bg-black text-lime-500 hover:bg-lime-500/10 hover:text-lime-400"
                                    >
                                        <LayoutDashboard className="h-4 w-4" />
                                        Portal
                                    </Button>
                                </Link>
                            )}
                            {isAdmin && (
                                <a href="/filament">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="gap-2 border-lime-500 bg-black text-lime-500 hover:bg-lime-500/10 hover:text-lime-400"
                                    >
                                        <Shield className="h-4 w-4" />
                                        Admin
                                    </Button>
                                </a>
                            )}

                            <CartButton alwaysShow={isMarketplace} />

                            {isAuthenticated ? (
                                <button
                                    onClick={handleSignOut}
                                    className="font-medium text-foreground/80 transition-colors hover:text-foreground"
                                >
                                    Sign Out
                                </button>
                            ) : (
                                <Link
                                    href="/signin"
                                    onClick={scrollToTop}
                                    className="font-medium text-foreground/80 transition-colors hover:text-foreground"
                                >
                                    Sign In
                                </Link>
                            )}
                        </div>

                        {/* Mobile Menu Toggle & Icons */}
                        <div className="flex items-center gap-1 lg:hidden">
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
                                <nav className="flex flex-col gap-3 border-t border-border/40 py-4">
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
                                                className="w-full gap-2 border-lime-500 bg-black text-lime-500 hover:bg-lime-500/10"
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
                                                className="w-full gap-2 border-lime-500 bg-black text-lime-500 hover:bg-lime-500/10"
                                            >
                                                <Shield className="h-4 w-4" />
                                                Admin
                                            </Button>
                                        </a>
                                    )}

                                    {isAuthenticated ? (
                                        <button
                                            onClick={() => {
                                                setMobileMenuOpen(false);
                                                handleSignOut();
                                            }}
                                            className="w-full py-2 text-center font-medium text-foreground/80 hover:text-foreground"
                                        >
                                            Sign Out
                                        </button>
                                    ) : (
                                        <Link
                                            href="/signin"
                                            onClick={() => {
                                                setMobileMenuOpen(false);
                                                scrollToTop();
                                            }}
                                            className="block w-full py-2 text-center font-medium text-foreground/80 hover:text-foreground"
                                        >
                                            Sign In
                                        </Link>
                                    )}
                                </nav>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </header>
        </>
    );
};

export default Header;
