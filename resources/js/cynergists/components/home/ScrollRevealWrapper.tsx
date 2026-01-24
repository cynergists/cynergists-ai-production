import React from "react";
import { useScrollReveal } from "@/hooks/useScrollReveal";
import { useTheme } from "@/contexts/ThemeContext";

type RevealType = "fade" | "parallax";
type ColorScheme = "dark" | "teal" | "lime" | "slate";

interface ScrollRevealWrapperProps {
  children: React.ReactNode;
  type: RevealType;
  colorScheme: ColorScheme;
  className?: string;
}

const colorSchemes = {
  dark: {
    bg: "hsl(220 45% 8%)",
    gradient: "linear-gradient(135deg, hsl(220 45% 8%) 0%, hsl(220 40% 12%) 50%, hsl(180 40% 15%) 100%)",
  },
  teal: {
    bg: "hsl(180 60% 15%)",
    gradient: "linear-gradient(135deg, hsl(180 50% 12%) 0%, hsl(180 60% 18%) 50%, hsl(160 50% 20%) 100%)",
  },
  lime: {
    bg: "hsl(84 60% 20%)",
    gradient: "linear-gradient(135deg, hsl(84 50% 15%) 0%, hsl(84 60% 22%) 50%, hsl(100 50% 18%) 100%)",
  },
  slate: {
    bg: "hsl(220 20% 15%)",
    gradient: "linear-gradient(135deg, hsl(220 25% 12%) 0%, hsl(220 20% 18%) 50%, hsl(200 25% 15%) 100%)",
  },
};

export const ScrollRevealWrapper: React.FC<ScrollRevealWrapperProps> = ({
  children,
  type,
  colorScheme,
  className = "",
}) => {
  const { ref, isRevealed, scrollProgress } = useScrollReveal({ type });
  const { theme } = useTheme();
  
  // Only apply scroll effects in light mode
  const isLightMode = theme === "light";
  
  if (!isLightMode) {
    // In dark mode, render children normally without wrapper effects
    return <>{children}</>;
  }

  const scheme = colorSchemes[colorScheme];

  // Calculate styles based on reveal state and type
  const getStyles = (): React.CSSProperties => {
    if (type === "fade") {
      return {
        background: isRevealed ? scheme.gradient : "white",
        transition: "background 0.8s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.6s ease-out, transform 0.6s ease-out",
        opacity: isRevealed ? 1 : 0.95,
        transform: isRevealed ? "translateY(0)" : "translateY(20px)",
      };
    }
    
    if (type === "parallax") {
      // Interpolate from white to colored based on scroll progress
      const opacity = Math.min(1, scrollProgress * 1.5);
      return {
        background: `linear-gradient(to bottom, 
          rgba(255,255,255,${1 - opacity}) 0%, 
          rgba(255,255,255,${Math.max(0, 0.5 - opacity)}) 30%,
          transparent 60%
        ), ${scheme.gradient}`,
        transition: "transform 0.1s ease-out",
        transform: `translateY(${(1 - scrollProgress) * 10}px)`,
      };
    }

    return {};
  };

  return (
    <div
      ref={ref as React.RefObject<HTMLDivElement>}
      className={`scroll-reveal-section ${className}`}
      style={getStyles()}
    >
      {children}
    </div>
  );
};
