import {
    createContext,
    ReactNode,
    useContext,
    useEffect,
} from 'react';

type Theme = 'dark';

interface ThemeContextType {
    theme: Theme;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
    const theme: Theme = 'dark';

    useEffect(() => {
        const root = document.documentElement;

        root.classList.add('dark');
        root.classList.remove('light');

        localStorage.setItem('theme', 'dark');
        document.cookie =
            'appearance=dark;path=/;max-age=31536000;SameSite=Lax';
    }, [theme]);

    return (
        <ThemeContext.Provider value={{ theme }}>
            {children}
        </ThemeContext.Provider>
    );
}

export function useTheme() {
    const context = useContext(ThemeContext);
    if (context === undefined) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
}
