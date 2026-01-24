import { useState, useMemo, useRef, useEffect } from "react";
import { Sliders } from "lucide-react";
import RoleSlider from "./RoleSlider";
import PlanCalculatorSummary from "./PlanCalculatorSummary";
import { roles, getRecommendedPlan } from "./roleData";

const HoursCalculator = () => {
  const [roleHours, setRoleHours] = useState<Record<string, number>>(
    Object.fromEntries(roles.map(role => [role.id, 0]))
  );
  const [isSticky, setIsSticky] = useState(false);
  
  const sectionRef = useRef<HTMLElement>(null);
  const summaryRef = useRef<HTMLDivElement>(null);
  const slidersRef = useRef<HTMLDivElement>(null);
  const summaryPlaceholderRef = useRef<HTMLDivElement>(null);

  const totalHours = useMemo(() => {
    return Object.values(roleHours).reduce((sum, hours) => sum + hours, 0);
  }, [roleHours]);

  const recommendedPlan = useMemo(() => {
    return getRecommendedPlan(totalHours);
  }, [totalHours]);

  const selections = useMemo(() => {
    return roles.map(role => ({
      roleId: role.id,
      roleName: role.name,
      hours: roleHours[role.id] || 0,
    }));
  }, [roleHours]);

  const handleRoleChange = (roleId: string, hours: number) => {
    setRoleHours(prev => ({ ...prev, [roleId]: hours }));
  };

  const handleReset = () => {
    setRoleHours(Object.fromEntries(roles.map(role => [role.id, 0])));
  };

  // Header height is h-20 = 80px
  const HEADER_HEIGHT = 80;

  useEffect(() => {
    const handleScroll = () => {
      if (!summaryPlaceholderRef.current || !slidersRef.current || !summaryRef.current) return;
      
      const placeholderRect = summaryPlaceholderRef.current.getBoundingClientRect();
      const slidersRect = slidersRef.current.getBoundingClientRect();
      const summaryHeight = summaryRef.current.offsetHeight;
      
      // Start sticking when placeholder top goes above the header bottom
      const shouldStick = placeholderRect.top < HEADER_HEIGHT;
      // Stop sticking when sliders bottom is about to leave viewport (accounting for summary height + header + padding)
      const shouldUnstick = slidersRect.bottom < summaryHeight + HEADER_HEIGHT + 20;
      
      setIsSticky(shouldStick && !shouldUnstick);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll(); // Initial check
    
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <section ref={sectionRef} className="py-16 bg-card/30" aria-labelledby="calculator-heading">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/30 rounded-full px-4 py-2 mb-6">
            <Sliders className="h-4 w-4 text-primary" />
            <span className="text-sm text-primary font-medium">Plan Calculator</span>
          </div>
          <h2 id="calculator-heading" className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">
            Find Out Which Plan is Right For <span className="text-gradient">Your Needs</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Select the hours you need for each role to see which plan best fits your business requirements.
          </p>
        </div>

        {/* Summary Panel Placeholder - maintains layout when summary is sticky */}
        <div 
          ref={summaryPlaceholderRef} 
          className="max-w-4xl mx-auto mb-10 md:mb-10"
          style={{ minHeight: isSticky ? summaryRef.current?.offsetHeight : 'auto' }}
        >
          <div
            ref={summaryRef}
            className={`transition-all duration-300 ${
              isSticky 
                ? 'fixed top-20 left-0 right-0 z-40 py-3 md:py-4 bg-background/95 backdrop-blur-md border-b border-border/50 shadow-lg' 
                : ''
            }`}
          >
            <div className="max-w-4xl mx-auto px-4">
              <PlanCalculatorSummary
                totalHours={totalHours}
                recommendedPlan={recommendedPlan}
                selections={selections}
                onReset={handleReset}
              />
            </div>
          </div>
        </div>

        {/* Role Sliders - 2 Column Grid */}
        <div ref={slidersRef} className="grid md:grid-cols-2 gap-x-6 gap-y-3">
          {roles.map(role => (
            <RoleSlider
              key={role.id}
              role={role}
              hours={roleHours[role.id]}
              onChange={(hours) => handleRoleChange(role.id, hours)}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default HoursCalculator;
