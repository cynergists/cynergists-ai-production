import { useEffect, useRef, useState } from "react";

type RevealType = "fade" | "parallax";

interface UseScrollRevealOptions {
  type: RevealType;
  threshold?: number;
  rootMargin?: string;
}

export const useScrollReveal = ({ 
  type, 
  threshold = 0.15, 
  rootMargin = "0px" 
}: UseScrollRevealOptions) => {
  const ref = useRef<HTMLElement>(null);
  const [isRevealed, setIsRevealed] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    // Intersection Observer for reveal trigger
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsRevealed(true);
          }
        });
      },
      { threshold, rootMargin }
    );

    observer.observe(element);

    // Scroll handler for parallax effect
    const handleScroll = () => {
      if (type === "parallax" && element) {
        const rect = element.getBoundingClientRect();
        const windowHeight = window.innerHeight;
        
        // Calculate progress: 0 when element enters viewport, 1 when it leaves top
        const progress = Math.max(0, Math.min(1, 1 - (rect.top / windowHeight)));
        setScrollProgress(progress);
      }
    };

    if (type === "parallax") {
      window.addEventListener("scroll", handleScroll, { passive: true });
      handleScroll(); // Initial check
    }

    return () => {
      observer.disconnect();
      if (type === "parallax") {
        window.removeEventListener("scroll", handleScroll);
      }
    };
  }, [type, threshold, rootMargin]);

  return { ref, isRevealed, scrollProgress };
};
