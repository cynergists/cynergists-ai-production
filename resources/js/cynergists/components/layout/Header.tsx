import { useState, useEffect, useRef } from "react";
import { Link, usePage } from "@inertiajs/react";
import { Menu, X, Moon, Sun, Search, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import cynergistsLogo from "@/assets/Cynergists_Word_Script_4.webp";
import CartButton from "@/components/cart/CartButton";
import { useTheme } from "@/contexts/ThemeContext";
import { motion, AnimatePresence } from "framer-motion";

const scrollToTop = () => {
  window.scrollTo({ top: 0, behavior: "smooth" });
};

interface HeaderProps {
  searchQuery?: string;
  onSearchChange?: (query: string) => void;
  categories?: string[];
  selectedCategories?: string[];
  onCategoryChange?: (categories: string[]) => void;
}

const Header = ({ 
  searchQuery = "", 
  onSearchChange,
  categories = [],
  selectedCategories = [],
  onCategoryChange 
}: HeaderProps) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [showSearchInput, setShowSearchInput] = useState(false);
  const { theme, toggleTheme } = useTheme();
  const { url } = usePage();
  const pathname = url.split("?")[0];
  const searchInputRef = useRef<HTMLInputElement>(null);

  const isMarketplace = pathname === "/marketplace";

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
      if (e.key === "Escape") {
        setSearchOpen(false);
      }
    };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, []);

  const handleSearchChange = (value: string) => {
    if (onSearchChange) {
      onSearchChange(value);
    }
  };

  const toggleCategory = (category: string) => {
    if (!onCategoryChange) return;
    
    if (selectedCategories.includes(category)) {
      onCategoryChange(selectedCategories.filter(c => c !== category));
    } else {
      onCategoryChange([...selectedCategories, category]);
    }
  };

  const clearCategories = () => {
    if (onCategoryChange) {
      onCategoryChange([]);
    }
  };

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 glass">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-20">
            {/* Logo */}
            <Link href="/" className="flex items-center" onClick={scrollToTop}>
              <img src={cynergistsLogo} alt="Cynergists" className="h-16 w-auto" />
            </Link>

            {/* Desktop Navigation - Right aligned */}
            <div className="hidden lg:flex items-center gap-4">
              {/* Agent Marketplace button - only show when NOT on marketplace */}
              {!isMarketplace && (
                <Link href="/marketplace" onClick={scrollToTop}>
                  <Button className="btn-primary">Agent Marketplace</Button>
                </Link>
              )}

              {/* Theme toggle */}
              <button
                onClick={toggleTheme}
                className="p-2 rounded-lg hover:bg-muted transition-colors"
                aria-label="Toggle theme"
              >
                {theme === "dark" ? (
                  <Sun className="h-5 w-5 text-foreground" />
                ) : (
                  <Moon className="h-5 w-5 text-foreground" />
                )}
              </button>

              {/* Search icon - only on marketplace */}
              {isMarketplace && (
                <button
                  onClick={() => setSearchOpen(!searchOpen)}
                  className="p-2 rounded-lg hover:bg-muted transition-colors"
                  aria-label="Search"
                >
                  <Search className="h-5 w-5 text-foreground" />
                </button>
              )}

              {/* Cart - always show on marketplace, conditional elsewhere */}
              <CartButton alwaysShow={isMarketplace} />

              {/* Sign In text link - rightmost */}
              <Link 
                href="/signin" 
                onClick={scrollToTop}
                className="text-foreground/80 hover:text-foreground transition-colors font-medium"
              >
                Sign In
              </Link>
            </div>

            {/* Mobile Menu Toggle & Icons */}
            <div className="lg:hidden flex items-center gap-2">
              <button
                onClick={toggleTheme}
                className="p-2 rounded-lg hover:bg-muted transition-colors"
                aria-label="Toggle theme"
              >
                {theme === "dark" ? (
                  <Sun className="h-5 w-5 text-foreground" />
                ) : (
                  <Moon className="h-5 w-5 text-foreground" />
                )}
              </button>

              {/* Search icon - only on marketplace */}
              {isMarketplace && (
                <button
                  onClick={() => setSearchOpen(!searchOpen)}
                  className="p-2 rounded-lg hover:bg-muted transition-colors"
                  aria-label="Search"
                >
                  <Search className="h-5 w-5 text-foreground" />
                </button>
              )}

              <CartButton alwaysShow={isMarketplace} />
              <button
                className="text-foreground"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>
          </div>

          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <div className="lg:hidden py-4 border-t border-border">
              <nav className="flex flex-col gap-4">
                {!isMarketplace && (
                  <Link href="/marketplace" onClick={() => { setMobileMenuOpen(false); scrollToTop(); }}>
                    <Button className="btn-primary w-full">Agent Marketplace</Button>
                  </Link>
                )}
                <Link 
                  href="/signin" 
                  onClick={() => { setMobileMenuOpen(false); scrollToTop(); }}
                  className="text-center text-foreground/80 hover:text-foreground transition-colors font-medium py-2"
                >
                  Sign In
                </Link>
              </nav>
            </div>
          )}
        </div>

        {/* Search Drawer - Apple Store style */}
        <AnimatePresence>
          {searchOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="border-t border-border overflow-hidden bg-background/95 backdrop-blur-md"
            >
              <div className="container mx-auto px-4 py-6">
                <AnimatePresence>
                  {showSearchInput && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.2, ease: "easeOut" }}
                      className="max-w-2xl mx-auto space-y-4"
                    >
                      <div className="relative">
                        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                        <Input
                          ref={searchInputRef}
                          placeholder="Search agents..."
                          value={searchQuery}
                          onChange={(e) => handleSearchChange(e.target.value)}
                          className="pl-12 h-14 text-lg bg-card border-border"
                        />
                        {searchQuery && (
                          <button
                            onClick={() => handleSearchChange("")}
                            className="absolute right-4 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                          >
                            <X className="h-5 w-5" />
                          </button>
                        )}
                      </div>

                      {/* Category Filter */}
                      {categories.length > 0 && (
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-muted-foreground">Filter by Category</span>
                            {selectedCategories.length > 0 && (
                              <button
                                onClick={clearCategories}
                                className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                              >
                                Clear all
                              </button>
                            )}
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {categories.map((category) => {
                              const isSelected = selectedCategories.includes(category);
                              return (
                                <button
                                  key={category}
                                  onClick={() => toggleCategory(category)}
                                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm transition-all ${
                                    isSelected
                                      ? "bg-lime-500 text-black font-medium"
                                      : "bg-muted hover:bg-muted/80 text-foreground"
                                  }`}
                                >
                                  {isSelected && <Check className="h-3 w-3" />}
                                  {category}
                                </button>
                              );
                            })}
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
            className="fixed inset-0 bg-black/20 z-40"
            onClick={() => setSearchOpen(false)}
          />
        )}
      </AnimatePresence>
    </>
  );
};

export default Header;
