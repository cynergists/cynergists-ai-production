import { Card } from '@/components/ui/card';

interface MosaicSettingsPanelProps {
    answers?: Record<string, string>;
}

const fieldLabels: Array<{ key: string; label: string }> = [
    { key: 'business_name', label: 'Business Name' },
    { key: 'business_description', label: 'Description' },
    { key: 'primary_goal', label: 'Primary Goal' },
    { key: 'target_audience', label: 'Target Audience' },
    { key: 'offerings', label: 'Offerings' },
    { key: 'brand_tone', label: 'Brand Tone' },
    { key: 'sitemap', label: 'Pages' },
    { key: 'primary_cta', label: 'Primary CTA' },
    { key: 'domain', label: 'Domain' },
    { key: 'form_destination', label: 'Form Destination' },
    { key: 'ai_visuals', label: 'AI Visuals' },
];

export function MosaicSettingsPanel({ answers }: MosaicSettingsPanelProps) {
    return (
        <Card className="rounded-2xl border border-primary/10 bg-card p-6">
            <h3 className="text-sm font-semibold text-foreground">
                Onboarding Inputs
            </h3>
            <div className="mt-4 grid gap-3 text-sm text-muted-foreground">
                {fieldLabels.map((field) => (
                    <div key={field.key} className="grid gap-1">
                        <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                            {field.label}
                        </span>
                        <span className="text-sm text-foreground">
                            {answers?.[field.key] ?? 'Not provided yet'}
                        </span>
                    </div>
                ))}
            </div>
        </Card>
    );
}
