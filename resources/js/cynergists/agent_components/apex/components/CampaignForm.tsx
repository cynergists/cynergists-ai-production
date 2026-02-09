import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { ScrollArea } from '@/cynergists/components/ui/scroll-area';
import { Textarea } from '@/cynergists/components/ui/textarea';
import {
    useCreateCampaign,
    useDeleteCampaign,
    useUpdateCampaign,
    type ApexCampaign,
} from '@/hooks/useApexApi';
import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowLeft, Loader2, Trash2 } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import TagInput from './TagInput';

const campaignFormSchema = z.object({
    name: z.string().min(1, 'Campaign name is required').max(255),
    campaign_type: z.enum(['connection', 'message', 'follow_up'], {
        required_error: 'Campaign type is required',
    }),
    job_titles: z.array(z.string()).default([]),
    locations: z.array(z.string()).default([]),
    keywords: z.array(z.string()).default([]),
    industries: z.array(z.string()).default([]),
    connection_message: z.string().max(2000).default(''),
    follow_up_message_1: z.string().max(2000).default(''),
    follow_up_message_2: z.string().max(2000).default(''),
    follow_up_message_3: z.string().max(2000).default(''),
    follow_up_delay_days_1: z.coerce
        .number()
        .int()
        .min(1)
        .max(30)
        .nullable()
        .optional(),
    follow_up_delay_days_2: z.coerce
        .number()
        .int()
        .min(1)
        .max(30)
        .nullable()
        .optional(),
    follow_up_delay_days_3: z.coerce
        .number()
        .int()
        .min(1)
        .max(30)
        .nullable()
        .optional(),
    booking_method: z.string().default(''),
    calendar_link: z.string().max(500).default(''),
    phone_number: z.string().max(50).default(''),
    daily_connection_limit: z.coerce
        .number()
        .int()
        .min(1)
        .max(100)
        .nullable()
        .optional(),
    daily_message_limit: z.coerce
        .number()
        .int()
        .min(1)
        .max(200)
        .nullable()
        .optional(),
});

type CampaignFormValues = z.infer<typeof campaignFormSchema>;

interface CampaignFormProps {
    campaign?: ApexCampaign | null;
    onBack: () => void;
}

export default function CampaignForm({ campaign, onBack }: CampaignFormProps) {
    const isEditing = !!campaign;
    const createCampaign = useCreateCampaign();
    const updateCampaign = useUpdateCampaign();
    const deleteCampaign = useDeleteCampaign();

    const form = useForm<CampaignFormValues>({
        resolver: zodResolver(campaignFormSchema),
        defaultValues: {
            name: campaign?.name ?? '',
            campaign_type:
                (campaign?.campaign_type as CampaignFormValues['campaign_type']) ??
                'connection',
            job_titles: campaign?.job_titles ?? [],
            locations: campaign?.locations ?? [],
            keywords: campaign?.keywords ?? [],
            industries: campaign?.industries ?? [],
            connection_message: campaign?.connection_message ?? '',
            follow_up_message_1: campaign?.follow_up_message_1 ?? '',
            follow_up_message_2: campaign?.follow_up_message_2 ?? '',
            follow_up_message_3: campaign?.follow_up_message_3 ?? '',
            follow_up_delay_days_1: campaign?.follow_up_delay_days_1 ?? null,
            follow_up_delay_days_2: campaign?.follow_up_delay_days_2 ?? null,
            follow_up_delay_days_3: campaign?.follow_up_delay_days_3 ?? null,
            booking_method: campaign?.booking_method ?? '',
            calendar_link: campaign?.calendar_link ?? '',
            phone_number: campaign?.phone_number ?? '',
            daily_connection_limit: campaign?.daily_connection_limit ?? null,
            daily_message_limit: campaign?.daily_message_limit ?? null,
        },
    });

    const bookingMethod = form.watch('booking_method');
    const isSaving = createCampaign.isPending || updateCampaign.isPending;

    const onSubmit = (values: CampaignFormValues) => {
        if (isEditing) {
            updateCampaign.mutate(
                { campaignId: campaign.id, data: values },
                { onSuccess: () => onBack() },
            );
        } else {
            createCampaign.mutate(values, { onSuccess: () => onBack() });
        }
    };

    const handleDelete = () => {
        if (!campaign) return;
        deleteCampaign.mutate(campaign.id, { onSuccess: () => onBack() });
    };

    return (
        <div className="flex min-h-0 flex-1 flex-col">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-primary/10 px-4 py-2">
                <div className="flex items-center gap-3">
                    <button
                        onClick={onBack}
                        className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted/50 hover:text-foreground"
                    >
                        <ArrowLeft className="h-4 w-4" />
                    </button>
                    <p className="text-sm font-medium text-foreground">
                        {isEditing ? 'Edit Campaign' : 'New Campaign'}
                    </p>
                </div>
                {isEditing && (
                    <AlertDialog>
                        <AlertDialogTrigger asChild>
                            <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 gap-1.5 text-xs text-destructive hover:text-destructive"
                                disabled={deleteCampaign.isPending}
                            >
                                {deleteCampaign.isPending ? (
                                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                ) : (
                                    <Trash2 className="h-3.5 w-3.5" />
                                )}
                                Delete
                            </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                                <AlertDialogTitle>
                                    Delete Campaign
                                </AlertDialogTitle>
                                <AlertDialogDescription>
                                    Are you sure you want to delete &quot;
                                    {campaign?.name}&quot;? This action cannot
                                    be undone.
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                    onClick={handleDelete}
                                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                >
                                    Delete
                                </AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                )}
            </div>

            <Form {...form}>
                <form
                    onSubmit={form.handleSubmit(onSubmit)}
                    className="flex min-h-0 flex-1 flex-col"
                >
                    <ScrollArea className="min-h-0 flex-1">
                        <div className="space-y-6 p-4">
                            {/* Basics */}
                            <section className="space-y-3">
                                <h4 className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                                    Basics
                                </h4>
                                <FormField
                                    control={form.control}
                                    name="name"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Campaign Name</FormLabel>
                                            <FormControl>
                                                <Input
                                                    placeholder="e.g., Denver Tech CEOs"
                                                    className="h-9 border-primary/15 bg-background text-sm"
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="campaign_type"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Campaign Type</FormLabel>
                                            <Select
                                                onValueChange={field.onChange}
                                                defaultValue={field.value}
                                            >
                                                <FormControl>
                                                    <SelectTrigger className="h-9 border-primary/15 bg-background text-sm">
                                                        <SelectValue placeholder="Select type" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    <SelectItem value="connection">
                                                        Connection
                                                    </SelectItem>
                                                    <SelectItem value="message">
                                                        Message
                                                    </SelectItem>
                                                    <SelectItem value="follow_up">
                                                        Follow-up
                                                    </SelectItem>
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </section>

                            {/* Targeting */}
                            <section className="space-y-3">
                                <h4 className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                                    Targeting
                                </h4>
                                <FormField
                                    control={form.control}
                                    name="job_titles"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Job Titles</FormLabel>
                                            <FormControl>
                                                <TagInput
                                                    value={field.value}
                                                    onChange={field.onChange}
                                                    placeholder="e.g., CEO, VP Sales"
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="locations"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Locations</FormLabel>
                                            <FormControl>
                                                <TagInput
                                                    value={field.value}
                                                    onChange={field.onChange}
                                                    placeholder="e.g., Denver, CO"
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="keywords"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Keywords</FormLabel>
                                            <FormControl>
                                                <TagInput
                                                    value={field.value}
                                                    onChange={field.onChange}
                                                    placeholder="e.g., SaaS, B2B"
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="industries"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Industries</FormLabel>
                                            <FormControl>
                                                <TagInput
                                                    value={field.value}
                                                    onChange={field.onChange}
                                                    placeholder="e.g., Technology, Finance"
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </section>

                            {/* Messaging */}
                            <section className="space-y-3">
                                <h4 className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                                    Messaging
                                </h4>
                                <FormField
                                    control={form.control}
                                    name="connection_message"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>
                                                Connection Message
                                            </FormLabel>
                                            <FormControl>
                                                <Textarea
                                                    placeholder="Your initial connection message..."
                                                    className="min-h-[80px] border-primary/15 bg-background text-sm"
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                {[1, 2, 3].map((n) => (
                                    <div key={n} className="space-y-2">
                                        <FormField
                                            control={form.control}
                                            name={
                                                `follow_up_message_${n}` as keyof CampaignFormValues
                                            }
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>
                                                        Follow-up {n}
                                                    </FormLabel>
                                                    <FormControl>
                                                        <Textarea
                                                            placeholder={`Follow-up message ${n}...`}
                                                            className="min-h-[60px] border-primary/15 bg-background text-sm"
                                                            value={
                                                                (field.value as string) ??
                                                                ''
                                                            }
                                                            onChange={
                                                                field.onChange
                                                            }
                                                        />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name={
                                                `follow_up_delay_days_${n}` as keyof CampaignFormValues
                                            }
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className="text-xs text-muted-foreground">
                                                        Delay (days)
                                                    </FormLabel>
                                                    <FormControl>
                                                        <Input
                                                            type="number"
                                                            min={1}
                                                            max={30}
                                                            placeholder="e.g., 3"
                                                            className="h-8 w-24 border-primary/15 bg-background text-sm"
                                                            value={
                                                                field.value !=
                                                                null
                                                                    ? String(
                                                                          field.value,
                                                                      )
                                                                    : ''
                                                            }
                                                            onChange={(e) =>
                                                                field.onChange(
                                                                    e.target
                                                                        .value ===
                                                                        ''
                                                                        ? null
                                                                        : Number(
                                                                              e
                                                                                  .target
                                                                                  .value,
                                                                          ),
                                                                )
                                                            }
                                                        />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>
                                ))}
                            </section>

                            {/* Booking */}
                            <section className="space-y-3">
                                <h4 className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                                    Booking
                                </h4>
                                <FormField
                                    control={form.control}
                                    name="booking_method"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>
                                                Booking Method
                                            </FormLabel>
                                            <Select
                                                onValueChange={field.onChange}
                                                defaultValue={field.value}
                                            >
                                                <FormControl>
                                                    <SelectTrigger className="h-9 border-primary/15 bg-background text-sm">
                                                        <SelectValue placeholder="Select method" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    <SelectItem value="calendar">
                                                        Calendar Link
                                                    </SelectItem>
                                                    <SelectItem value="phone">
                                                        Phone
                                                    </SelectItem>
                                                    <SelectItem value="manual">
                                                        Manual
                                                    </SelectItem>
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                {bookingMethod === 'calendar' && (
                                    <FormField
                                        control={form.control}
                                        name="calendar_link"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>
                                                    Calendar Link
                                                </FormLabel>
                                                <FormControl>
                                                    <Input
                                                        placeholder="https://calendly.com/..."
                                                        className="h-9 border-primary/15 bg-background text-sm"
                                                        {...field}
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                )}
                                {bookingMethod === 'phone' && (
                                    <FormField
                                        control={form.control}
                                        name="phone_number"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>
                                                    Phone Number
                                                </FormLabel>
                                                <FormControl>
                                                    <Input
                                                        placeholder="(555) 123-4567"
                                                        className="h-9 border-primary/15 bg-background text-sm"
                                                        {...field}
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                )}
                            </section>

                            {/* Limits */}
                            <section className="space-y-3">
                                <h4 className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                                    Daily Limits
                                </h4>
                                <div className="grid grid-cols-2 gap-3">
                                    <FormField
                                        control={form.control}
                                        name="daily_connection_limit"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>
                                                    Connections
                                                </FormLabel>
                                                <FormControl>
                                                    <Input
                                                        type="number"
                                                        min={1}
                                                        max={100}
                                                        placeholder="25"
                                                        className="h-9 border-primary/15 bg-background text-sm"
                                                        value={
                                                            field.value != null
                                                                ? String(
                                                                      field.value,
                                                                  )
                                                                : ''
                                                        }
                                                        onChange={(e) =>
                                                            field.onChange(
                                                                e.target
                                                                    .value ===
                                                                    ''
                                                                    ? null
                                                                    : Number(
                                                                          e
                                                                              .target
                                                                              .value,
                                                                      ),
                                                            )
                                                        }
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="daily_message_limit"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Messages</FormLabel>
                                                <FormControl>
                                                    <Input
                                                        type="number"
                                                        min={1}
                                                        max={200}
                                                        placeholder="50"
                                                        className="h-9 border-primary/15 bg-background text-sm"
                                                        value={
                                                            field.value != null
                                                                ? String(
                                                                      field.value,
                                                                  )
                                                                : ''
                                                        }
                                                        onChange={(e) =>
                                                            field.onChange(
                                                                e.target
                                                                    .value ===
                                                                    ''
                                                                    ? null
                                                                    : Number(
                                                                          e
                                                                              .target
                                                                              .value,
                                                                      ),
                                                            )
                                                        }
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>
                            </section>
                        </div>
                    </ScrollArea>

                    {/* Footer */}
                    <div className="border-t border-primary/10 px-4 py-3">
                        <Button
                            type="submit"
                            disabled={isSaving}
                            className="w-full"
                        >
                            {isSaving && (
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            )}
                            {isEditing ? 'Save Changes' : 'Create Campaign'}
                        </Button>
                    </div>
                </form>
            </Form>
        </div>
    );
}
