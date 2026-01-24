import { useEffect } from 'react';
import { router } from '@inertiajs/react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Helmet } from 'react-helmet';
import calendarBackground from '@/assets/calendar-background.webp';

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


  const { data: calendar, isLoading, error } = useQuery({
    queryKey: ['public-calendar', slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('calendars')
        .select(`
          id,
          calendar_name,
          slug,
          status,
          ghl_embed_code,
          headline,
          paragraph
        `)
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
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
      </div>
    );
  }

  useEffect(() => {
    if (error || !calendar) {
      router.visit("/contact");
    }
  }, [error, calendar]);

  if (error || !calendar) {
    return null;
  }

  const headline = calendar.headline || 'Lead Like a Hero, Leave the Heavy Lifting to Us';
  const paragraph = calendar.paragraph || 'Growth should not depend on heroics. Cynergists helps your team move faster, stay aligned, and get more done without the constant friction. No pitch. Just a quick chat to see if you are a fit.';

  // Render headline with gradient spans preserved from HTML
  const renderHeadline = () => {
    // If headline contains HTML span tags, render with dangerouslySetInnerHTML
    if (headline.includes('<span')) {
      return (
        <h1 
          className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-6 text-white"
          dangerouslySetInnerHTML={{ __html: headline }}
        />
      );
    }
    
    // Fallback: split by comma for legacy headlines
    const headlineParts = headline.split(',');
    const firstPart = headlineParts[0];
    const restPart = headlineParts.slice(1).join(',').trim();
    
    return (
      <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-6">
        {firstPart && (
          <span className="text-gradient block">{firstPart}{headlineParts.length > 1 ? ',' : ''}</span>
        )}
        {restPart && (
          <span className="text-white font-bold block">{restPart}</span>
        )}
      </h1>
    );
  };

  return (
    <>
      <Helmet>
        <title>{calendar.calendar_name} | Schedule</title>
        <meta name="description" content={paragraph || `Book a meeting - ${calendar.calendar_name}`} />
      </Helmet>

      {/* Fixed Background */}
      <div 
        className="fixed inset-0 bg-cover bg-top bg-no-repeat"
        style={{ backgroundImage: `url(${calendarBackground})` }}
      />
      
      {/* Dark Overlay */}
      <div className="fixed inset-0 bg-black/70" />

      {/* Content */}
      <div className="relative z-10 h-screen flex flex-col lg:flex-row overflow-hidden px-4 lg:px-[200px]">
        {/* Left Side - Hero Content */}
        <div className="w-full lg:w-1/2 h-auto lg:h-screen flex items-center py-12 lg:py-0 overflow-y-auto">
          <div className="max-w-xl">
            {renderHeadline()}

            {paragraph && (
              <p className="text-lg md:text-xl text-white/80 leading-relaxed">
                {paragraph}
              </p>
            )}
          </div>
        </div>

        {/* Right Side - Calendar Embed */}
        <div className="w-full lg:w-1/2 h-[70vh] lg:h-screen flex items-start justify-center py-12 overflow-y-auto">
          {calendar.ghl_embed_code ? (
            <div
              className="w-full max-w-lg mx-auto bg-white rounded-lg shadow-2xl h-[700px] lg:h-[90vh] overflow-y-scroll [&>iframe]:!h-[1200px] [&>iframe]:lg:!h-[150vh] [&>iframe]:!min-h-[1000px] [&>iframe]:!overflow-y-scroll"
              dangerouslySetInnerHTML={{ __html: calendar.ghl_embed_code }}
            />
          ) : (
            <div className="w-full max-w-lg mx-auto bg-white rounded-lg shadow-2xl h-[600px] lg:h-[85vh] flex items-center justify-center text-muted-foreground">
              <p>Calendar coming soon</p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
