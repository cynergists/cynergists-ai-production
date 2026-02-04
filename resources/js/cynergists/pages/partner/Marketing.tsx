import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { usePartnerContext } from '@/contexts/PartnerContext';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Check, Copy, FileText, Image, Megaphone } from 'lucide-react';
import { useEffect, useState } from 'react';

interface Asset {
    id: string;
    category: string;
    title: string;
    description: string | null;
    content: string | null;
    file_url: string | null;
    auto_append_partner_url: boolean;
}

export default function PartnerMarketing() {
    const { partner } = usePartnerContext();
    const [assets, setAssets] = useState<Asset[]>([]);
    const [copiedId, setCopiedId] = useState<string | null>(null);
    const { toast } = useToast();
    const partnerUrl = partner?.slug
        ? `${window.location.origin}/p/${partner.slug}`
        : '';

    useEffect(() => {
        fetchAssets();
    }, []);

    const fetchAssets = async () => {
        const { data } = await supabase
            .from('partner_assets')
            .select('*')
            .eq('is_active', true)
            .order('display_order');
        setAssets(data || []);
    };

    const copyContent = (asset: Asset) => {
        let content = asset.content || '';
        if (asset.auto_append_partner_url && partnerUrl) {
            content += `\n\n${partnerUrl}`;
        }
        navigator.clipboard.writeText(content);
        setCopiedId(asset.id);
        setTimeout(() => setCopiedId(null), 2000);
        toast({
            title: 'Copied!',
            description: 'Content copied to clipboard.',
        });
    };

    const copyAssets = assets.filter((a) => a.category === 'copy');
    const creativeAssets = assets.filter((a) => a.category === 'creative');
    const templateAssets = assets.filter((a) => a.category === 'template');

    return (
        <div className="space-y-6 p-6">
            <div>
                <h1 className="text-3xl font-bold text-foreground">
                    Marketing Center
                </h1>
                <p className="mt-1 text-muted-foreground">
                    Access copy, creatives, and templates to promote Cynergists.
                </p>
            </div>

            <Tabs defaultValue="copy">
                <TabsList>
                    <TabsTrigger value="copy">
                        <FileText className="mr-2 h-4 w-4" />
                        Copy
                    </TabsTrigger>
                    <TabsTrigger value="creatives">
                        <Image className="mr-2 h-4 w-4" />
                        Creatives
                    </TabsTrigger>
                    <TabsTrigger value="templates">
                        <Megaphone className="mr-2 h-4 w-4" />
                        Templates
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="copy" className="mt-4 space-y-4">
                    {copyAssets.length === 0 ? (
                        <Card>
                            <CardContent className="py-12 text-center text-muted-foreground">
                                No copy blocks available yet.
                            </CardContent>
                        </Card>
                    ) : (
                        copyAssets.map((asset) => (
                            <Card key={asset.id}>
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-lg">
                                        {asset.title}
                                    </CardTitle>
                                    {asset.description && (
                                        <CardDescription>
                                            {asset.description}
                                        </CardDescription>
                                    )}
                                </CardHeader>
                                <CardContent>
                                    <div className="mb-3 rounded-lg bg-muted p-4 text-sm whitespace-pre-wrap">
                                        {asset.content}
                                        {asset.auto_append_partner_url &&
                                            partnerUrl && (
                                                <span className="mt-2 block text-primary">
                                                    {partnerUrl}
                                                </span>
                                            )}
                                    </div>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => copyContent(asset)}
                                    >
                                        {copiedId === asset.id ? (
                                            <Check className="mr-2 h-4 w-4" />
                                        ) : (
                                            <Copy className="mr-2 h-4 w-4" />
                                        )}
                                        {copiedId === asset.id
                                            ? 'Copied!'
                                            : 'Copy'}
                                    </Button>
                                </CardContent>
                            </Card>
                        ))
                    )}
                </TabsContent>

                <TabsContent value="creatives" className="mt-4">
                    {creativeAssets.length === 0 ? (
                        <Card>
                            <CardContent className="py-12 text-center text-muted-foreground">
                                No creatives available yet.
                            </CardContent>
                        </Card>
                    ) : (
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                            {creativeAssets.map((asset) => (
                                <Card key={asset.id}>
                                    {asset.file_url && (
                                        <img
                                            src={asset.file_url}
                                            alt={asset.title}
                                            className="h-48 w-full rounded-t-lg object-cover"
                                        />
                                    )}
                                    <CardHeader>
                                        <CardTitle className="text-lg">
                                            {asset.title}
                                        </CardTitle>
                                    </CardHeader>
                                    {asset.file_url && (
                                        <CardContent>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                asChild
                                            >
                                                <a
                                                    href={asset.file_url}
                                                    download
                                                >
                                                    Download
                                                </a>
                                            </Button>
                                        </CardContent>
                                    )}
                                </Card>
                            ))}
                        </div>
                    )}
                </TabsContent>

                <TabsContent value="templates" className="mt-4 space-y-4">
                    {templateAssets.length === 0 ? (
                        <Card>
                            <CardContent className="py-12 text-center text-muted-foreground">
                                No templates available yet.
                            </CardContent>
                        </Card>
                    ) : (
                        templateAssets.map((asset) => (
                            <Card key={asset.id}>
                                <CardHeader>
                                    <CardTitle className="text-lg">
                                        {asset.title}
                                    </CardTitle>
                                    {asset.description && (
                                        <CardDescription>
                                            {asset.description}
                                        </CardDescription>
                                    )}
                                </CardHeader>
                                <CardContent>
                                    <div className="mb-3 rounded-lg bg-muted p-4 text-sm whitespace-pre-wrap">
                                        {asset.content}
                                        {asset.auto_append_partner_url &&
                                            partnerUrl && (
                                                <span className="mt-2 block text-primary">
                                                    {partnerUrl}
                                                </span>
                                            )}
                                    </div>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => copyContent(asset)}
                                    >
                                        {copiedId === asset.id ? (
                                            <Check className="mr-2 h-4 w-4" />
                                        ) : (
                                            <Copy className="mr-2 h-4 w-4" />
                                        )}
                                        {copiedId === asset.id
                                            ? 'Copied!'
                                            : 'Copy'}
                                    </Button>
                                </CardContent>
                            </Card>
                        ))
                    )}
                </TabsContent>
            </Tabs>
        </div>
    );
}
