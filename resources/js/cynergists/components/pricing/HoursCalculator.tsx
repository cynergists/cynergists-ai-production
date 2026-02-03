import { Sliders } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import PlanCalculatorSummary from './PlanCalculatorSummary';
import { getRecommendedPlan, roles } from './roleData';
import RoleSlider from './RoleSlider';

const HoursCalculator = () => {
    const [roleHours, setRoleHours] = useState<Record<string, number>>(
        Object.fromEntries(roles.map((role) => [role.id, 0])),
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
        return roles.map((role) => ({
            roleId: role.id,
            roleName: role.name,
            hours: roleHours[role.id] || 0,
        }));
    }, [roleHours]);

    const handleRoleChange = (roleId: string, hours: number) => {
        setRoleHours((prev) => ({ ...prev, [roleId]: hours }));
    };

    const handleReset = () => {
        setRoleHours(Object.fromEntries(roles.map((role) => [role.id, 0])));
    };

    // Header height is h-20 = 80px
    const HEADER_HEIGHT = 80;

    useEffect(() => {
        const handleScroll = () => {
            if (
                !summaryPlaceholderRef.current ||
                !slidersRef.current ||
                !summaryRef.current
            )
                return;

            const placeholderRect =
                summaryPlaceholderRef.current.getBoundingClientRect();
            const slidersRect = slidersRef.current.getBoundingClientRect();
            const summaryHeight = summaryRef.current.offsetHeight;

            // Start sticking when placeholder top goes above the header bottom
            const shouldStick = placeholderRect.top < HEADER_HEIGHT;
            // Stop sticking when sliders bottom is about to leave viewport (accounting for summary height + header + padding)
            const shouldUnstick =
                slidersRect.bottom < summaryHeight + HEADER_HEIGHT + 20;

            setIsSticky(shouldStick && !shouldUnstick);
        };

        window.addEventListener('scroll', handleScroll, { passive: true });
        handleScroll(); // Initial check

        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <section
            ref={sectionRef}
            className="bg-card/30 py-16"
            aria-labelledby="calculator-heading"
        >
            <div className="container mx-auto px-4">
                <div className="mb-12 text-center">
                    <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-2">
                        <Sliders className="h-4 w-4 text-primary" />
                        <span className="text-sm font-medium text-primary">
                            Plan Calculator
                        </span>
                    </div>
                    <h2
                        id="calculator-heading"
                        className="font-display mb-4 text-3xl font-bold text-foreground md:text-4xl"
                    >
                        Find Out Which Plan is Right For{' '}
                        <span className="text-gradient">Your Needs</span>
                    </h2>
                    <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
                        Select the hours you need for each role to see which
                        plan best fits your business requirements.
                    </p>
                </div>

                {/* Summary Panel Placeholder - maintains layout when summary is sticky */}
                <div
                    ref={summaryPlaceholderRef}
                    className="mx-auto mb-10 max-w-4xl md:mb-10"
                    style={{
                        minHeight: isSticky
                            ? summaryRef.current?.offsetHeight
                            : 'auto',
                    }}
                >
                    <div
                        ref={summaryRef}
                        className={`transition-all duration-300 ${
                            isSticky
                                ? 'fixed top-20 right-0 left-0 z-40 border-b border-border/50 bg-background/95 py-3 shadow-lg backdrop-blur-md md:py-4'
                                : ''
                        }`}
                    >
                        <div className="mx-auto max-w-4xl px-4">
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
                <div
                    ref={slidersRef}
                    className="grid gap-x-6 gap-y-3 md:grid-cols-2"
                >
                    {roles.map((role) => (
                        <RoleSlider
                            key={role.id}
                            role={role}
                            hours={roleHours[role.id]}
                            onChange={(hours) =>
                                handleRoleChange(role.id, hours)
                            }
                        />
                    ))}
                </div>
            </div>
        </section>
    );
};

export default HoursCalculator;
