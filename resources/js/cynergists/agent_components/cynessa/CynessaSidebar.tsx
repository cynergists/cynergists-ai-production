import React from "react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  FileText, 
  Image, 
  Video, 
  FileSpreadsheet, 
  File,
  Download,
  Eye,
  Building2,
  User,
  Palette,
  Target
} from "lucide-react";
import { cn } from "@/lib/utils";

interface CynessaSidebarProps {
  agentDetails: any;
  setupProgress: {
    completed: number;
    total: number;
    steps: Array<{
      id: string;
      label: string;
      completed: boolean;
    }>;
  };
}

const getFileIcon = (filename: string) => {
  const ext = filename.split('.').pop()?.toLowerCase();
  
  if (['jpg', 'jpeg', 'png', 'gif', 'svg', 'webp'].includes(ext || '')) return Image;
  if (['mp4', 'mov', 'avi', 'webm'].includes(ext || '')) return Video;
  if (['xls', 'xlsx', 'csv'].includes(ext || '')) return FileSpreadsheet;
  if (['pdf', 'doc', 'docx', 'txt'].includes(ext || '')) return FileText;
  return File;
};

export default function CynessaSidebar({ agentDetails, setupProgress }: CynessaSidebarProps) {
  // Extract tenant data from agentDetails
  const tenantData = agentDetails?.tenant_data;
  const settings = tenantData?.settings || {};
  
  const onboardingData = {
    companyName: tenantData?.company_name || "Not provided",
    industry: settings?.industry || "Not provided",
    services: settings?.services_needed || "Not provided",
    brandTone: settings?.brand_tone || "Not provided",
  };

  const providedFiles = settings?.brand_assets || [];

  return (
    <div className="hidden lg:flex w-[300px] shrink-0 flex-col gap-6 min-h-0 transition-all duration-300">
      {/* Onboarding Information */}
      <div className="bg-card border border-primary/20 rounded-2xl p-5 flex flex-col">
        <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
          <Building2 className="w-5 h-5 text-primary" />
          Onboarding Info
        </h2>
        
        <div className="space-y-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Building2 className="w-4 h-4 text-muted-foreground" />
              <span className="text-xs font-medium text-muted-foreground uppercase">Company</span>
            </div>
            <p className="text-sm text-foreground font-medium">{onboardingData.companyName}</p>
          </div>

          <div>
            <div className="flex items-center gap-2 mb-1">
              <Target className="w-4 h-4 text-muted-foreground" />
              <span className="text-xs font-medium text-muted-foreground uppercase">Industry</span>
            </div>
            <p className="text-sm text-foreground">{onboardingData.industry}</p>
          </div>

          <div>
            <div className="flex items-center gap-2 mb-1">
              <User className="w-4 h-4 text-muted-foreground" />
              <span className="text-xs font-medium text-muted-foreground uppercase">Services</span>
            </div>
            <p className="text-sm text-foreground">{onboardingData.services}</p>
          </div>

          <div>
            <div className="flex items-center gap-2 mb-1">
              <Palette className="w-4 h-4 text-muted-foreground" />
              <span className="text-xs font-medium text-muted-foreground uppercase">Brand Tone</span>
            </div>
            <p className="text-sm text-foreground">{onboardingData.brandTone}</p>
          </div>
        </div>

        <div className="mt-4 pt-4 border-t border-primary/20">
          <div className="text-xs text-muted-foreground mb-2">
            Setup Progress: {setupProgress.completed}/{setupProgress.total}
          </div>
          <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
            <div
              className="h-full bg-primary transition-all duration-300"
              style={{ width: `${(setupProgress.completed / setupProgress.total) * 100}%` }}
            />
          </div>
        </div>
      </div>

      {/* Files Provided */}
      <div className="bg-card border border-primary/20 rounded-2xl p-5 flex flex-col overflow-hidden max-h-[400px]">
        <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
          <FileText className="w-5 h-5 text-primary" />
          Files Provided
        </h2>
        
        <ScrollArea className="flex-1 max-h-[320px]">
          {providedFiles.length === 0 ? (
            <div className="text-sm text-muted-foreground text-center py-8">
              No files uploaded yet
            </div>
          ) : (
            <div className="space-y-2">
              {providedFiles.map((file: any, index: number) => {
                const IconComponent = getFileIcon(file.filename);
                
                return (
                  <div
                    key={index}
                    className="flex items-center gap-3 p-3 rounded-lg border border-primary/10 bg-muted/30 hover:bg-muted/50 transition-colors"
                  >
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                      <IconComponent className="w-5 h-5 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">
                        {file.filename}
                      </p>
                      <p className="text-xs text-muted-foreground capitalize">
                        {file.type || 'Unknown'}
                      </p>
                    </div>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 shrink-0"
                        title="View file"
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 shrink-0"
                        title="Download file"
                      >
                        <Download className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </ScrollArea>
      </div>
    </div>
  );
}
