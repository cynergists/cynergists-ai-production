import { supabase } from '@/integrations/supabase/client';
import { router } from '@inertiajs/react';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet';

import MSAWorkflow from '@/components/contracts/MSAWorkflow';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useAdminApi } from '@/hooks/useAdminApi';
import type { Session, User } from '@supabase/supabase-js';

interface DocumentTemplate {
    id: string;
    title: string;
    content: string;
    version: number;
    document_type: string;
    updated_at?: string;
}

interface AgreementConfig {
    documentType: string;
    title: string;
    pageTitle: string;
    defaultContent: string;
}

const AGREEMENT_CONFIGS: Record<string, AgreementConfig> = {
    msa: {
        documentType: 'msa',
        title: 'Master Services Agreements',
        pageTitle: 'Plans MSA | Admin',
        defaultContent:
            '<h1>Master Services Agreements</h1><p>Your master services agreements content here...</p>',
    },
    terms: {
        documentType: 'terms',
        title: 'Terms & Conditions',
        pageTitle: 'Terms & Conditions | Admin',
        defaultContent:
            '<h1>Terms & Conditions</h1><p>Your terms and conditions content here...</p>',
    },
    privacy: {
        documentType: 'privacy',
        title: 'Privacy Policy',
        pageTitle: 'Privacy Policy | Admin',
        defaultContent:
            '<h1>Privacy Policy</h1><p>Your privacy policy content here...</p>',
    },
    partner: {
        documentType: 'partner',
        title: 'Partner Agreements',
        pageTitle: 'Partner Agreements | Admin',
        defaultContent:
            '<h1>Partner Agreements</h1><p>Your partner agreements content here...</p>',
    },
    'sales-reps': {
        documentType: 'sales_reps',
        title: 'Sales Agreements',
        pageTitle: 'Sales Agreements | Admin',
        defaultContent:
            '<h1>Sales Agreements</h1><p>Your sales agreements content here...</p>',
    },
};

export default function AgreementEditor({
    agreementType,
}: {
    agreementType: string;
}) {
    const { toast } = useToast();
    const [user, setUser] = useState<User | null>(null);
    const [session, setSession] = useState<Session | null>(null);
    const [checkingAuth, setCheckingAuth] = useState(true);

    const [template, setTemplate] = useState<DocumentTemplate | null>(null);
    const [loadingTemplate, setLoadingTemplate] = useState(true);

    const { callApi, loading: apiLoading } = useAdminApi();

    const config = agreementType ? AGREEMENT_CONFIGS[agreementType] : null;

    useEffect(() => {
        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange((event, session) => {
            setSession(session);
            setUser(session?.user ?? null);
            if (!session) router.visit('/signin');
            else setCheckingAuth(false);
        });

        supabase.auth.getSession().then(({ data: { session } }) => {
            setSession(session);
            setUser(session?.user ?? null);
            if (!session) router.visit('/signin');
            else setCheckingAuth(false);
        });

        return () => subscription.unsubscribe();
    }, [navigate]);

    useEffect(() => {
        if (session && config) loadTemplate();
    }, [session, config]);

    const loadTemplate = async () => {
        if (!config) return;

        setLoadingTemplate(true);
        try {
            const result = await callApi<DocumentTemplate>(
                'get_active_document_template',
                { type: config.documentType },
            );
            setTemplate(result);
        } catch (error) {
            console.error(`Error loading ${config.title} template:`, error);
            // If no template exists yet, create a placeholder
            setTemplate({
                id: '',
                title: config.title,
                content: config.defaultContent,
                version: 1,
                document_type: config.documentType,
            });
        } finally {
            setLoadingTemplate(false);
        }
    };

    const handleSaveContent = async (content: string) => {
        if (!config) return;

        if (!template?.id) {
            // Create new template if it doesn't exist
            try {
                await callApi(
                    'create_document_template',
                    {},
                    {
                        title: config.title,
                        content,
                        document_type: config.documentType,
                    },
                );
                await loadTemplate();
                toast({
                    title: 'Success',
                    description: `${config.title} created`,
                });
            } catch (error) {
                toast({
                    title: 'Error',
                    description: `Failed to create ${config.title}`,
                    variant: 'destructive',
                });
            }
            return;
        }
        await callApi(
            'update_document_template',
            { id: template.id },
            { content },
        );
    };

    const handleUpdateVersion = async () => {
        if (!template?.id) return;
        await callApi(
            'update_document_template',
            { id: template.id },
            {
                version: template.version + 1,
            },
        );
        await loadTemplate();
    };

    // Handle invalid agreement type
    if (!config) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-background">
                <div className="text-center">
                    <h1 className="mb-2 text-2xl font-bold text-foreground">
                        Invalid Agreement Type
                    </h1>
                    <p className="mb-4 text-muted-foreground">
                        The agreement type "{agreementType}" is not recognized.
                    </p>
                    <Button onClick={() => router.visit('/admin/agreements')}>
                        Back to Contracts
                    </Button>
                </div>
            </div>
        );
    }

    if (checkingAuth || loadingTemplate) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-background">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <>
            <Helmet>
                <title>{config.pageTitle}</title>
            </Helmet>
            <div className="flex h-screen flex-col overflow-hidden">
                <div className="shrink-0 p-6 pb-2">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => router.visit('/admin/agreements')}
                        className="mb-2"
                    >
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back to Contracts
                    </Button>
                </div>
                <div className="min-h-0 flex-1 overflow-hidden px-6 pb-6">
                    <MSAWorkflow
                        template={template}
                        onSaveContent={handleSaveContent}
                        onUpdateVersion={handleUpdateVersion}
                        isLoading={apiLoading}
                    />
                </div>
            </div>
        </>
    );
}
