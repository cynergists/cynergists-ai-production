import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { supabase } from '@/integrations/supabase/client';
import { Link } from '@inertiajs/react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Eye, Percent, Users } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

export default function PartnerPortalManagement() {
    const queryClient = useQueryClient();
    const [discountPercent, setDiscountPercent] = useState(20);

    const { data: settings, isLoading } = useQuery({
        queryKey: ['partner-settings'],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('partner_settings')
                .select('*')
                .limit(1)
                .single();
            if (error) throw error;
            return data;
        },
    });

    useEffect(() => {
        if (settings) {
            setDiscountPercent(settings.global_discount_percent);
        }
    }, [settings]);

    const updateDiscountMutation = useMutation({
        mutationFn: async (newDiscount: number) => {
            const { error } = await supabase
                .from('partner_settings')
                .update({ global_discount_percent: newDiscount })
                .eq('id', settings?.id);
            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['partner-settings'] });
            toast.success('Partner discount updated successfully');
        },
        onError: (error) => {
            toast.error('Failed to update discount: ' + error.message);
        },
    });

    const handleSaveDiscount = () => {
        updateDiscountMutation.mutate(discountPercent);
    };

    const managementCards = [
        {
            title: 'View All Partners',
            description: 'Manage partner accounts and statuses',
            icon: Users,
            href: '/admin/partners',
            color: 'text-blue-500',
        },
        {
            title: 'Partner Portal Preview',
            description: 'See how partners view the portal',
            icon: Eye,
            href: '/partner',
            color: 'text-cyan-500',
            external: true,
        },
    ];

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-foreground">
                    Partner Portal
                </h1>
                <p className="text-muted-foreground">
                    Configure settings that apply to all partner portal
                    instances
                </p>
            </div>

            {/* Global Discount Settings */}
            <Card className="border-lime-500/20 bg-lime-500/5">
                <CardHeader>
                    <div className="flex items-center gap-3">
                        <div className="rounded-lg bg-lime-500/10 p-2">
                            <Percent className="h-6 w-6 text-lime-500" />
                        </div>
                        <div>
                            <CardTitle className="text-lg">
                                Global Partner Discount
                            </CardTitle>
                            <CardDescription>
                                Set the discount percentage partners receive on
                                all AI Agents
                            </CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="flex items-center gap-8">
                        <div className="flex-1 space-y-4">
                            <div className="flex items-center justify-between">
                                <Label>Discount Percentage</Label>
                                <span className="text-2xl font-bold text-lime-400">
                                    {discountPercent}%
                                </span>
                            </div>
                            <Slider
                                value={[discountPercent]}
                                onValueChange={(values) =>
                                    setDiscountPercent(values[0])
                                }
                                max={100}
                                min={0}
                                step={5}
                                className="w-full"
                            />
                            <p className="text-sm text-muted-foreground">
                                Partners will see {discountPercent}% off on all
                                agent prices in their marketplace view
                            </p>
                        </div>
                        <div className="shrink-0">
                            <Button
                                onClick={handleSaveDiscount}
                                disabled={
                                    updateDiscountMutation.isPending ||
                                    isLoading
                                }
                                className="bg-lime-500 text-black hover:bg-lime-600"
                            >
                                Save Changes
                            </Button>
                        </div>
                    </div>

                    {/* Example pricing */}
                    <div className="rounded-lg bg-muted/50 p-4">
                        <p className="mb-2 text-sm font-medium">
                            Example Pricing Preview
                        </p>
                        <div className="flex items-center gap-4 text-sm">
                            <div>
                                <span className="text-muted-foreground">
                                    Original:{' '}
                                </span>
                                <span className="line-through">$299/mo</span>
                            </div>
                            <div>
                                <span className="text-muted-foreground">
                                    Partner Price:{' '}
                                </span>
                                <span className="font-bold text-lime-400">
                                    $
                                    {(
                                        299 *
                                        (1 - discountPercent / 100)
                                    ).toFixed(2)}
                                    /mo
                                </span>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Quick Links */}
            <div className="grid gap-4 md:grid-cols-2">
                {managementCards.map((card) => (
                    <Link
                        key={card.title}
                        href={card.href}
                        target={card.external ? '_blank' : undefined}
                        rel={card.external ? 'noopener noreferrer' : undefined}
                    >
                        <Card className="h-full cursor-pointer transition-colors hover:bg-accent/50">
                            <CardHeader className="flex flex-row items-center gap-4">
                                <div
                                    className={`rounded-lg bg-muted p-2 ${card.color}`}
                                >
                                    <card.icon className="h-6 w-6" />
                                </div>
                                <div>
                                    <CardTitle className="text-lg">
                                        {card.title}
                                    </CardTitle>
                                    <CardDescription>
                                        {card.description}
                                    </CardDescription>
                                </div>
                            </CardHeader>
                        </Card>
                    </Link>
                ))}
            </div>
        </div>
    );
}
