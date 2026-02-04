import { supabase } from '@/integrations/supabase/client';
import { formatDate } from '@/lib/utils';
import { router } from '@inertiajs/react';
import {
    Archive,
    CheckCircle,
    Clock,
    Eye,
    FileText,
    Handshake,
    Loader2,
    ScrollText,
    Shield,
    UserCheck,
    Users,
    XCircle,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';

import AgreementArchive, {
    ArchivedAgreement,
} from '@/components/admin/agreements/AgreementArchive';
import MSAWorkflow from '@/components/contracts/MSAWorkflow';
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

interface Agreement {
    id: string;
    client_name: string;
    client_email: string;
    client_company: string | null;
    plan_name: string;
    plan_price: number;
    status: string;
    created_at: string;
    signed_at: string | null;
    expires_at: string | null;
}

type DocumentType =
    | 'msa'
    | 'sales_reps'
    | 'partner'
    | 'terms'
    | 'privacy'
    | null;
type AgreementTab = 'agreement' | 'signed';

const documentTypes = [
    {
        key: 'msa' as const,
        title: 'Master Services Agreements',
        icon: ScrollText,
        color: 'text-blue-500',
        bgColor: 'bg-blue-500/10',
        signedTitle: 'Signed Agreements',
        signedDescription: 'All signed Master Services Agreements',
        emptyIcon: FileText,
        emptyText: 'No signed agreements yet',
        entityLabel: 'Client',
        showPlanColumn: true,
    },
    {
        key: 'terms' as const,
        title: 'Terms & Conditions',
        icon: FileText,
        color: 'text-orange-500',
        bgColor: 'bg-orange-500/10',
        signedTitle: 'Signed Terms & Conditions',
        signedDescription: 'All signed Terms & Conditions agreements',
        emptyIcon: FileText,
        emptyText: 'No signed terms & conditions yet',
        entityLabel: 'User',
        showPlanColumn: false,
    },
    {
        key: 'privacy' as const,
        title: 'Privacy Policy',
        icon: Shield,
        color: 'text-green-500',
        bgColor: 'bg-green-500/10',
        signedTitle: 'Signed Privacy Policies',
        signedDescription: 'All signed Privacy Policy agreements',
        emptyIcon: Shield,
        emptyText: 'No signed privacy policies yet',
        entityLabel: 'User',
        showPlanColumn: false,
    },
    {
        key: 'sales_reps' as const,
        title: 'Sales Agreements',
        icon: UserCheck,
        color: 'text-cyan-500',
        bgColor: 'bg-cyan-500/10',
        signedTitle: 'Signed Sales Agreements',
        signedDescription: 'All signed Sales Representative Agreements',
        emptyIcon: UserCheck,
        emptyText: 'No signed sales agreements yet',
        entityLabel: 'Sales Rep',
        showPlanColumn: false,
    },
    {
        key: 'partner' as const,
        title: 'Partner Agreements',
        icon: Handshake,
        color: 'text-purple-500',
        bgColor: 'bg-purple-500/10',
        signedTitle: 'Signed Partner Agreements',
        signedDescription: 'All signed Partner Agreements',
        emptyIcon: Handshake,
        emptyText: 'No signed partner agreements yet',
        entityLabel: 'Partner',
        showPlanColumn: false,
    },
];

const getStatusBadge = (status: string) => {
    switch (status) {
        case 'signed':
            return (
                <Badge className="border-green-500/20 bg-green-500/10 text-green-600">
                    <CheckCircle className="mr-1 h-3 w-3" />
                    Signed
                </Badge>
            );
        case 'viewed':
            return (
                <Badge className="border-blue-500/20 bg-blue-500/10 text-blue-600">
                    <Eye className="mr-1 h-3 w-3" />
                    Viewed
                </Badge>
            );
        case 'sent':
            return (
                <Badge className="border-yellow-500/20 bg-yellow-500/10 text-yellow-600">
                    <Clock className="mr-1 h-3 w-3" />
                    Sent
                </Badge>
            );
        case 'expired':
            return (
                <Badge className="border-red-500/20 bg-red-500/10 text-red-600">
                    <XCircle className="mr-1 h-3 w-3" />
                    Expired
                </Badge>
            );
        case 'cancelled':
            return (
                <Badge className="bg-muted text-muted-foreground">
                    <XCircle className="mr-1 h-3 w-3" />
                    Cancelled
                </Badge>
            );
        default:
            return <Badge variant="outline">{status}</Badge>;
    }
};

export default function AdminAgreements() {
    const { toast } = useToast();
    const { callApi, loading: apiLoading } = useAdminApi();

    const [user, setUser] = useState<User | null>(null);
    const [session, setSession] = useState<Session | null>(null);
    const [checkingAuth, setCheckingAuth] = useState(true);

    // Active document state - MSA is default
    const [activeDocument, setActiveDocument] = useState<DocumentType>('msa');
    const [activeTemplate, setActiveTemplate] =
        useState<DocumentTemplate | null>(null);
    const [loadingTemplate, setLoadingTemplate] = useState(false);

    // Template cache for instant switching
    const [templatesCache, setTemplatesCache] = useState<
        Record<string, DocumentTemplate>
    >({});

    // Unified tab state for ALL document types
    const [activeTab, setActiveTab] = useState<AgreementTab>('agreement');
    const [signedAgreements, setSignedAgreements] = useState<Agreement[]>([]);
    const [loadingAgreements, setLoadingAgreements] = useState(false);

    // Archive state
    const [showArchive, setShowArchive] = useState(false);
    const [archivedAgreements, setArchivedAgreements] = useState<
        ArchivedAgreement[]
    >([]);
    const [loadingArchive, setLoadingArchive] = useState(false);

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

    // Load MSA template on mount
    useEffect(() => {
        if (session && activeDocument === 'msa' && !activeTemplate) {
            loadTemplate('msa');
        }
    }, [session]);

    // Reset tab to "agreement" when document type changes
    useEffect(() => {
        setActiveTab('agreement');
        setShowArchive(false);
        setSignedAgreements([]);
    }, [activeDocument]);

    const loadTemplate = async (
        docType: DocumentType,
        isBackgroundRefresh = false,
    ) => {
        if (!docType) {
            setLoadingTemplate(false);
            return;
        }

        const docConfig = documentTypes.find((d) => d.key === docType);
        const createPlaceholder = () => ({
            id: '',
            title: docConfig?.title || 'Document',
            content: `<h1>${docConfig?.title || 'Document'}</h1><p>Your ${docConfig?.title?.toLowerCase() || 'document'} content here...</p>`,
            version: 1,
            document_type: docType,
        });

        // If no session yet, use placeholder
        if (!session) {
            setActiveTemplate(createPlaceholder());
            setLoadingTemplate(false);
            return;
        }

        try {
            const template = await callApi<DocumentTemplate>(
                'get_active_document_template',
                { type: docType },
            );
            // If API returns null or undefined, use placeholder
            if (template) {
                // Update cache with fresh data
                setTemplatesCache((prev) => ({ ...prev, [docType]: template }));
                // Only update activeTemplate if this is still the active document
                if (!isBackgroundRefresh || activeDocument === docType) {
                    setActiveTemplate(template);
                }
            } else {
                const placeholder = createPlaceholder();
                setActiveTemplate(placeholder);
            }
        } catch (error) {
            console.error('Error loading template:', error);
            // If no template exists or error, create a placeholder for the editor
            setActiveTemplate(createPlaceholder());
        } finally {
            if (!isBackgroundRefresh) {
                setLoadingTemplate(false);
            }
        }
    };

    // Unified function to load signed agreements for any document type
    const loadAgreementsForType = async (docType: DocumentType) => {
        if (!session || !docType) return;
        setLoadingAgreements(true);
        try {
            const {
                data: { session: currentSession },
            } = await supabase.auth.getSession();
            if (!currentSession) return;

            // Build query params - msa doesn't need type param (default), others do
            const typeParam = docType === 'msa' ? '' : `?type=${docType}`;

            const response = await fetch(
                `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/list-agreements${typeParam}`,
                {
                    headers: {
                        Authorization: `Bearer ${currentSession.access_token}`,
                        'Content-Type': 'application/json',
                    },
                },
            );

            if (response.ok) {
                const data = await response.json();
                setSignedAgreements(data.agreements || []);
            }
        } catch (error) {
            console.error('Error loading agreements:', error);
        } finally {
            setLoadingAgreements(false);
        }
    };

    const loadArchivedAgreements = async () => {
        if (!session || !activeDocument) return;
        setLoadingArchive(true);
        try {
            const {
                data: { session: currentSession },
            } = await supabase.auth.getSession();
            if (!currentSession) return;

            // Include type param for archived agreements
            const typeParam =
                activeDocument === 'msa' ? '' : `&type=${activeDocument}`;

            const response = await fetch(
                `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/list-agreements?archived=true${typeParam}`,
                {
                    headers: {
                        Authorization: `Bearer ${currentSession.access_token}`,
                        'Content-Type': 'application/json',
                    },
                },
            );

            if (response.ok) {
                const data = await response.json();
                setArchivedAgreements(data.agreements || []);
            }
        } catch (error) {
            console.error('Error loading archived agreements:', error);
        } finally {
            setLoadingArchive(false);
        }
    };

    const handleToggleArchive = () => {
        if (!showArchive) {
            loadArchivedAgreements();
        }
        setShowArchive(!showArchive);
    };

    const handleDocumentClick = (docType: DocumentType) => {
        if (activeDocument === docType) {
            // Don't close if clicking the same one
            return;
        }

        setActiveDocument(docType);

        // Check cache first for instant switching
        if (docType && templatesCache[docType]) {
            setActiveTemplate(templatesCache[docType]);
            setLoadingTemplate(false);
            // Background refresh for freshness
            loadTemplate(docType, true);
        } else {
            // No cache, show loading and fetch
            setLoadingTemplate(true);
            setActiveTemplate(null);
            loadTemplate(docType, false);
        }
    };

    const handleSaveContent = async (content: string) => {
        if (!activeTemplate || !activeDocument) return;

        if (!activeTemplate.id) {
            // Create new template if it doesn't exist
            try {
                await callApi(
                    'create_document_template',
                    {},
                    {
                        title: activeTemplate.title,
                        content,
                        document_type: activeDocument,
                    },
                );
                await loadTemplate(activeDocument);
                toast({
                    title: 'Success',
                    description: `${activeTemplate.title} created`,
                });
            } catch (error) {
                toast({
                    title: 'Error',
                    description: `Failed to create ${activeTemplate.title}`,
                    variant: 'destructive',
                });
            }
            return;
        }

        await callApi(
            'update_document_template',
            { id: activeTemplate.id },
            { content },
        );

        // Update cache with new content
        const updatedTemplate = { ...activeTemplate, content };
        setTemplatesCache((prev) => ({
            ...prev,
            [activeDocument]: updatedTemplate,
        }));
    };

    const handleUpdateVersion = async () => {
        if (!activeTemplate?.id) return;
        await callApi(
            'update_document_template',
            { id: activeTemplate.id },
            {
                version: activeTemplate.version + 1,
            },
        );
        await loadTemplate(activeDocument);
    };

    const handleTabChange = (tab: AgreementTab) => {
        setActiveTab(tab);
        if (tab === 'signed' && activeDocument) {
            loadAgreementsForType(activeDocument);
        }
    };

    // Get config for active document type
    const activeDocConfig = documentTypes.find((d) => d.key === activeDocument);

    if (checkingAuth) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-background">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    // Main view with inline document editor
    return (
        <>
            <Helmet>
                <title>Contracts | Admin</title>
            </Helmet>
            <div className="flex h-full flex-col overflow-hidden">
                <div className="shrink-0 p-6 pb-4">
                    <div className="mb-6">
                        <h1 className="text-3xl font-bold text-foreground">
                            Contracts
                        </h1>
                        <p className="mt-1 text-muted-foreground">
                            Manage your legal documents and agreements
                        </p>
                    </div>

                    {/* Document type selector cards */}
                    <div className="mb-6 grid grid-cols-2 gap-2 sm:gap-4 lg:grid-cols-5">
                        {documentTypes.map((doc) => {
                            const Icon = doc.icon;
                            const isActive = activeDocument === doc.key;
                            return (
                                <Card
                                    key={doc.key}
                                    className={`group cursor-pointer transition-all hover:border-primary/50 ${
                                        isActive
                                            ? 'border-primary shadow-md'
                                            : 'hover:shadow-lg'
                                    }`}
                                    onClick={() => handleDocumentClick(doc.key)}
                                >
                                    <CardHeader className="p-3 sm:p-6 sm:pb-4">
                                        <div className="flex items-center gap-2 sm:gap-3">
                                            <div
                                                className={`h-8 w-8 shrink-0 rounded-lg sm:h-10 sm:w-10 ${doc.bgColor} flex items-center justify-center`}
                                            >
                                                <Icon
                                                    className={`h-4 w-4 sm:h-5 sm:w-5 ${doc.color}`}
                                                />
                                            </div>
                                            <CardTitle className="line-clamp-2 text-[10px] leading-tight sm:text-xs lg:text-sm">
                                                {doc.title}
                                            </CardTitle>
                                        </div>
                                    </CardHeader>
                                </Card>
                            );
                        })}
                    </div>

                    {/* Unified tab bar for ALL document types */}
                    {activeDocument && activeDocConfig && (
                        <div className="flex items-center gap-2">
                            <Button
                                variant={
                                    activeTab === 'agreement'
                                        ? 'default'
                                        : 'outline'
                                }
                                size="sm"
                                onClick={() => handleTabChange('agreement')}
                            >
                                <activeDocConfig.icon className="mr-2 h-4 w-4" />
                                Agreement
                            </Button>
                            <Button
                                variant={
                                    activeTab === 'signed' && !showArchive
                                        ? 'default'
                                        : 'outline'
                                }
                                size="sm"
                                onClick={() => {
                                    setShowArchive(false);
                                    handleTabChange('signed');
                                }}
                            >
                                <Users className="mr-2 h-4 w-4" />
                                Signed Agreements
                            </Button>
                            <Button
                                variant={showArchive ? 'default' : 'outline'}
                                size="sm"
                                onClick={() => {
                                    if (!showArchive) {
                                        loadArchivedAgreements();
                                    }
                                    setShowArchive(true);
                                    setActiveTab('signed');
                                }}
                            >
                                <Archive className="mr-2 h-4 w-4" />
                                Agreement Archives
                            </Button>
                        </div>
                    )}
                </div>

                {/* Document editor area */}
                {activeDocument && activeDocConfig && (
                    <div className="min-h-0 flex-1 overflow-hidden px-6 pb-6">
                        {loadingTemplate ? (
                            <div className="flex h-full items-center justify-center">
                                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                            </div>
                        ) : activeTab === 'signed' ? (
                            /* Unified signed agreements view for ALL document types */
                            <div className="h-full overflow-auto">
                                {showArchive ? (
                                    /* Archive View */
                                    <Card>
                                        <CardHeader>
                                            <CardTitle className="flex items-center gap-2">
                                                <Archive className="h-5 w-5" />
                                                Agreement Archives
                                            </CardTitle>
                                            <CardDescription>
                                                Archived, superseded, and
                                                expired{' '}
                                                {activeDocConfig.title.toLowerCase()}{' '}
                                                agreements
                                            </CardDescription>
                                        </CardHeader>
                                        <CardContent>
                                            <AgreementArchive
                                                agreements={archivedAgreements}
                                                loading={loadingArchive}
                                                onClose={() =>
                                                    setShowArchive(false)
                                                }
                                            />
                                        </CardContent>
                                    </Card>
                                ) : (
                                    /* Signed Agreements View */
                                    <Card>
                                        <CardHeader>
                                            <CardTitle className="flex items-center gap-2">
                                                <activeDocConfig.icon className="h-5 w-5" />
                                                {activeDocConfig.signedTitle}
                                            </CardTitle>
                                            <CardDescription>
                                                {
                                                    activeDocConfig.signedDescription
                                                }
                                            </CardDescription>
                                        </CardHeader>
                                        <CardContent>
                                            {loadingAgreements ? (
                                                <div className="flex items-center justify-center py-12">
                                                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                                                </div>
                                            ) : signedAgreements.length ===
                                              0 ? (
                                                <div className="py-12 text-center text-muted-foreground">
                                                    <activeDocConfig.emptyIcon className="mx-auto mb-4 h-12 w-12 opacity-50" />
                                                    <p className="font-medium">
                                                        {
                                                            activeDocConfig.emptyText
                                                        }
                                                    </p>
                                                    <p className="mt-1 text-sm">
                                                        Signed agreements will
                                                        appear here
                                                    </p>
                                                </div>
                                            ) : (
                                                <Table>
                                                    <TableHeader>
                                                        <TableRow>
                                                            <TableHead>
                                                                {
                                                                    activeDocConfig.entityLabel
                                                                }
                                                            </TableHead>
                                                            <TableHead>
                                                                Company
                                                            </TableHead>
                                                            {activeDocConfig.showPlanColumn && (
                                                                <TableHead>
                                                                    Plan
                                                                </TableHead>
                                                            )}
                                                            <TableHead>
                                                                Status
                                                            </TableHead>
                                                            <TableHead>
                                                                Created
                                                            </TableHead>
                                                            <TableHead>
                                                                Signed
                                                            </TableHead>
                                                        </TableRow>
                                                    </TableHeader>
                                                    <TableBody>
                                                        {signedAgreements.map(
                                                            (agreement) => (
                                                                <TableRow
                                                                    key={
                                                                        agreement.id
                                                                    }
                                                                >
                                                                    <TableCell>
                                                                        <div>
                                                                            <div className="font-medium">
                                                                                {
                                                                                    agreement.client_name
                                                                                }
                                                                            </div>
                                                                            <div className="text-sm text-muted-foreground">
                                                                                {
                                                                                    agreement.client_email
                                                                                }
                                                                            </div>
                                                                        </div>
                                                                    </TableCell>
                                                                    <TableCell>
                                                                        {agreement.client_company ||
                                                                            '—'}
                                                                    </TableCell>
                                                                    {activeDocConfig.showPlanColumn && (
                                                                        <TableCell>
                                                                            <div>
                                                                                <div>
                                                                                    {
                                                                                        agreement.plan_name
                                                                                    }
                                                                                </div>
                                                                                <div className="text-sm text-muted-foreground">
                                                                                    $
                                                                                    {agreement.plan_price.toLocaleString()}
                                                                                    /mo
                                                                                </div>
                                                                            </div>
                                                                        </TableCell>
                                                                    )}
                                                                    <TableCell>
                                                                        {getStatusBadge(
                                                                            agreement.status,
                                                                        )}
                                                                    </TableCell>
                                                                    <TableCell className="text-muted-foreground">
                                                                        {formatDate(
                                                                            agreement.created_at,
                                                                        )}
                                                                    </TableCell>
                                                                    <TableCell className="text-muted-foreground">
                                                                        {agreement.signed_at
                                                                            ? formatDate(
                                                                                  agreement.signed_at,
                                                                              )
                                                                            : '—'}
                                                                    </TableCell>
                                                                </TableRow>
                                                            ),
                                                        )}
                                                    </TableBody>
                                                </Table>
                                            )}
                                        </CardContent>
                                    </Card>
                                )}
                            </div>
                        ) : (
                            <MSAWorkflow
                                key={activeDocument}
                                template={activeTemplate}
                                onSaveContent={handleSaveContent}
                                onUpdateVersion={handleUpdateVersion}
                                isLoading={apiLoading}
                            />
                        )}
                    </div>
                )}
            </div>
        </>
    );
}
