import { useState, useEffect } from "react";
import { usePartnerContext } from "@/contexts/PartnerContext";
import { Copy, Check, Megaphone, Image, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

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
  const partnerUrl = partner?.slug ? `${window.location.origin}/p/${partner.slug}` : '';

  useEffect(() => {
    fetchAssets();
  }, []);

  const fetchAssets = async () => {
    const { data } = await supabase.from('partner_assets').select('*').eq('is_active', true).order('display_order');
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
    toast({ title: "Copied!", description: "Content copied to clipboard." });
  };

  const copyAssets = assets.filter(a => a.category === 'copy');
  const creativeAssets = assets.filter(a => a.category === 'creative');
  const templateAssets = assets.filter(a => a.category === 'template');

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Marketing Center</h1>
        <p className="text-muted-foreground mt-1">Access copy, creatives, and templates to promote Cynergists.</p>
      </div>

      <Tabs defaultValue="copy">
        <TabsList>
          <TabsTrigger value="copy"><FileText className="h-4 w-4 mr-2" />Copy</TabsTrigger>
          <TabsTrigger value="creatives"><Image className="h-4 w-4 mr-2" />Creatives</TabsTrigger>
          <TabsTrigger value="templates"><Megaphone className="h-4 w-4 mr-2" />Templates</TabsTrigger>
        </TabsList>

        <TabsContent value="copy" className="space-y-4 mt-4">
          {copyAssets.length === 0 ? (
            <Card><CardContent className="py-12 text-center text-muted-foreground">No copy blocks available yet.</CardContent></Card>
          ) : copyAssets.map(asset => (
            <Card key={asset.id}>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">{asset.title}</CardTitle>
                {asset.description && <CardDescription>{asset.description}</CardDescription>}
              </CardHeader>
              <CardContent>
                <div className="bg-muted p-4 rounded-lg mb-3 whitespace-pre-wrap text-sm">{asset.content}{asset.auto_append_partner_url && partnerUrl && <span className="text-primary block mt-2">{partnerUrl}</span>}</div>
                <Button variant="outline" size="sm" onClick={() => copyContent(asset)}>
                  {copiedId === asset.id ? <Check className="h-4 w-4 mr-2" /> : <Copy className="h-4 w-4 mr-2" />}
                  {copiedId === asset.id ? 'Copied!' : 'Copy'}
                </Button>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="creatives" className="mt-4">
          {creativeAssets.length === 0 ? (
            <Card><CardContent className="py-12 text-center text-muted-foreground">No creatives available yet.</CardContent></Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {creativeAssets.map(asset => (
                <Card key={asset.id}>
                  {asset.file_url && <img src={asset.file_url} alt={asset.title} className="w-full h-48 object-cover rounded-t-lg" />}
                  <CardHeader><CardTitle className="text-lg">{asset.title}</CardTitle></CardHeader>
                  {asset.file_url && <CardContent><Button variant="outline" size="sm" asChild><a href={asset.file_url} download>Download</a></Button></CardContent>}
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="templates" className="space-y-4 mt-4">
          {templateAssets.length === 0 ? (
            <Card><CardContent className="py-12 text-center text-muted-foreground">No templates available yet.</CardContent></Card>
          ) : templateAssets.map(asset => (
            <Card key={asset.id}>
              <CardHeader><CardTitle className="text-lg">{asset.title}</CardTitle>{asset.description && <CardDescription>{asset.description}</CardDescription>}</CardHeader>
              <CardContent>
                <div className="bg-muted p-4 rounded-lg mb-3 whitespace-pre-wrap text-sm">{asset.content}{asset.auto_append_partner_url && partnerUrl && <span className="text-primary block mt-2">{partnerUrl}</span>}</div>
                <Button variant="outline" size="sm" onClick={() => copyContent(asset)}>{copiedId === asset.id ? <Check className="h-4 w-4 mr-2" /> : <Copy className="h-4 w-4 mr-2" />}{copiedId === asset.id ? 'Copied!' : 'Copy'}</Button>
              </CardContent>
            </Card>
          ))}
        </TabsContent>
      </Tabs>
    </div>
  );
}
