import { supabase } from '@/integrations/supabase/client';
import { router } from '@inertiajs/react';
import type { Session } from '@supabase/supabase-js';
import { Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function AdminIndex() {
    const [session, setSession] = useState<Session | null>(null);

    useEffect(() => {
        // Set up auth state listener
        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange((event, session) => {
            setSession(session);

            if (!session) {
                router.visit('/signin');
            } else {
                // Redirect authenticated users to dashboard
                router.visit('/admin/dashboard');
            }
        });

        // Check for existing session
        supabase.auth.getSession().then(({ data: { session } }) => {
            setSession(session);

            if (!session) {
                router.visit('/signin');
            } else {
                // Redirect authenticated users to dashboard
                router.visit('/admin/dashboard');
            }
        });

        return () => subscription.unsubscribe();
    }, []);

    return (
        <div className="flex min-h-screen items-center justify-center bg-background">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
    );
}
