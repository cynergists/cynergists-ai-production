import calendarBackground from '@cy/assets/calendar-background.webp';
import { supabase } from '@cy/integrations/supabase/client';
import { router } from '@inertiajs/react';
import { useQuery } from '@tanstack/react-query';
import { useEffect } from 'react';
import { Helmet } from 'react-helmet';

interface CalendarData {
    id: string;
    calendar_name: string;
    slug: string;
    status: string;
    ghl_embed_code: string | null;
    headline: string | null;
    paragraph: string | null;
}

export default function CalendarPage({ slug }: { slug: string }) {
    const {
        data: calendar,
        isLoading,
        error,
    } = useQuery({
        queryKey: ['public-calendar', slug],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('calendars')
                .select(
                    `
          id,
          calendar_name,
          slug,
          status,
          ghl_embed_code,
          headline,
          paragraph
        `,
                )
                .eq('slug', slug)
                .eq('status', 'active')
                .maybeSingle();

            if (error) throw error;
            return data as CalendarData | null;
        },
        enabled: !!slug,
        staleTime: 0,
        gcTime: 0,
        refetchOnMount: 'always',
    });

    if (isLoading) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-background">
                <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-primary" />
            </div>
        );
    }

    useEffect(() => {
        if (error || !calendar) {
            router.visit('/contact');
        }
    }, [error, calendar]);

    if (error || !calendar) {
        return null;
    }

    const headline =
        calendar.headline || 'Lead Like a Hero, Leave the Heavy Lifting to Us';
    const paragraph =
        calendar.paragraph ||
        'Growth should not depend on heroics. Cynergists helps your team move faster, stay aligned, and get more done without the constant friction. No pitch. Just a quick chat to see if you are a fit.';

    // Render headline with gradient spans preserved from HTML
    const renderHeadline = () => {
        // If headline contains HTML span tags, render with dangerouslySetInnerHTML
        if (headline.includes('<span')) {
            return (
                <h1
                    className="mb-6 text-4xl leading-tight font-bold text-white md:text-5xl lg:text-6xl"
                    dangerouslySetInnerHTML={{ __html: headline }}
                />
            );
        }

        // Fallback: split by comma for legacy headlines
        const headlineParts = headline.split(',');
        const firstPart = headlineParts[0];
        const restPart = headlineParts.slice(1).join(',').trim();

        return (
            <h1 className="mb-6 text-4xl leading-tight font-bold md:text-5xl lg:text-6xl">
                {firstPart && (
                    <span className="text-gradient block">
                        {firstPart}
                        {headlineParts.length > 1 ? ',' : ''}
                    </span>
                )}
                {restPart && (
                    <span className="block font-bold text-white">
                        {restPart}
                    </span>
                )}
            </h1>
        );
    };

    return (
        <>
            <Helmet>
                <title>{calendar.calendar_name} | Schedule</title>
                <meta
                    name="description"
                    content={
                        paragraph ||
                        `Book a meeting - ${calendar.calendar_name}`
                    }
                />
            </Helmet>

            {/* Fixed Background */}
            <div
                className="fixed inset-0 bg-cover bg-top bg-no-repeat"
                style={{ backgroundImage: `url(${calendarBackground})` }}
            />

            {/* Dark Overlay */}
            <div className="fixed inset-0 bg-black/70" />

            {/* Content */}
            <div className="relative z-10 flex h-screen flex-col overflow-hidden px-4 lg:flex-row lg:px-[200px]">
                {/* Left Side - Hero Content */}
                <div className="flex h-auto w-full items-center overflow-y-auto py-12 lg:h-screen lg:w-1/2 lg:py-0">
                    <div className="max-w-xl">
                        {renderHeadline()}

                        {paragraph && (
                            <p className="text-lg leading-relaxed text-white/80 md:text-xl">
                                {paragraph}
                            </p>
                        )}
                    </div>
                </div>

                {/* Right Side - Calendar Embed */}
                <div className="flex h-[70vh] w-full items-start justify-center overflow-y-auto py-12 lg:h-screen lg:w-1/2">
                    {calendar.ghl_embed_code ? (
                        <div
                            className="mx-auto h-[700px] w-full max-w-lg overflow-y-scroll rounded-lg bg-white shadow-2xl lg:h-[90vh] [&>iframe]:!h-[1200px] [&>iframe]:!min-h-[1000px] [&>iframe]:!overflow-y-scroll [&>iframe]:lg:!h-[150vh]"
                            dangerouslySetInnerHTML={{
                                __html: calendar.ghl_embed_code,
                            }}
                        />
                    ) : (
                        <div className="mx-auto flex h-[600px] w-full max-w-lg items-center justify-center rounded-lg bg-white text-muted-foreground shadow-2xl lg:h-[85vh]">
                            <p>Calendar coming soon</p>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}
