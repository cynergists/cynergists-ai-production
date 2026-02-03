import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { supabase } from '@/integrations/supabase/client';
import { getAttribution, hasAttribution } from '@/utils/partnerAttribution';
import { zodResolver } from '@hookform/resolvers/zod';
import { CheckCircle, Loader2, Send } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';

const leadFormSchema = z.object({
    first_name: z.string().min(1, 'First name is required').max(100),
    last_name: z.string().min(1, 'Last name is required').max(100),
    email: z.string().email('Please enter a valid email address').max(255),
    phone: z.string().max(20).optional(),
    company_name: z.string().max(200).optional(),
    notes: z.string().max(1000).optional(),
    website: z.string().optional(), // Honeypot field
});

type LeadFormData = z.infer<typeof leadFormSchema>;

interface LeadCaptureFormProps {
    partnerId: string;
    partnerSlug: string;
    partnerName?: string;
}

export function LeadCaptureForm({
    partnerId,
    partnerSlug,
    partnerName,
}: LeadCaptureFormProps) {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);

    const form = useForm<LeadFormData>({
        resolver: zodResolver(leadFormSchema),
        defaultValues: {
            first_name: '',
            last_name: '',
            email: '',
            phone: '',
            company_name: '',
            notes: '',
            website: '', // Honeypot
        },
    });

    const onSubmit = async (data: LeadFormData) => {
        setIsSubmitting(true);

        try {
            const attribution = getAttribution();
            const attributionStatus = hasAttribution();

            const payload = {
                first_name: data.first_name,
                last_name: data.last_name,
                email: data.email,
                phone: data.phone || undefined,
                company_name: data.company_name || undefined,
                notes: data.notes || undefined,
                website: data.website, // Honeypot
                partner_id: partnerId,
                partner_slug: partnerSlug,
                utm_source: attribution?.utm_source,
                utm_medium: attribution?.utm_medium,
                utm_campaign: attribution?.utm_campaign,
                utm_content: attribution?.utm_content,
                utm_term: attribution?.utm_term,
                landing_page_url:
                    attribution?.landing_page_url || window.location.href,
                referrer_url: attribution?.referrer_url || document.referrer,
                cookie_present: attributionStatus.cookie,
                local_storage_present: attributionStatus.localStorage,
            };

            const { data: result, error } = await supabase.functions.invoke(
                'submit-partner-referral',
                {
                    body: payload,
                },
            );

            if (error) {
                console.error('Submission error:', error);
                toast.error('Failed to submit form. Please try again.');
                return;
            }

            if (result?.error) {
                toast.error(result.error);
                return;
            }

            setIsSuccess(true);
            toast.success("Thank you! We'll be in touch soon.");
            form.reset();
        } catch (error) {
            console.error('Submission error:', error);
            toast.error('Something went wrong. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isSuccess) {
        return (
            <Card className="border-primary/20 bg-primary/5">
                <CardContent className="pt-8 pb-8 text-center">
                    <CheckCircle className="mx-auto mb-4 h-16 w-16 text-primary" />
                    <h3 className="mb-2 text-2xl font-bold">Thank You!</h3>
                    <p className="text-muted-foreground">
                        Your information has been submitted successfully.
                        {partnerName &&
                            ` ${partnerName} has been credited for referring you.`}{' '}
                        We'll reach out to you shortly.
                    </p>
                    <Button
                        variant="outline"
                        className="mt-6"
                        onClick={() => setIsSuccess(false)}
                    >
                        Submit Another Request
                    </Button>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Get Started Today</CardTitle>
                <CardDescription>
                    Fill out the form below and we'll connect with you to
                    discuss how we can help your business.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <Form {...form}>
                    <form
                        onSubmit={form.handleSubmit(onSubmit)}
                        className="space-y-4"
                    >
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                            <FormField
                                control={form.control}
                                name="first_name"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>First Name *</FormLabel>
                                        <FormControl>
                                            <Input
                                                placeholder="John"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="last_name"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Last Name *</FormLabel>
                                        <FormControl>
                                            <Input
                                                placeholder="Doe"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <FormField
                            control={form.control}
                            name="email"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Email *</FormLabel>
                                    <FormControl>
                                        <Input
                                            type="email"
                                            placeholder="john@company.com"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="phone"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Phone</FormLabel>
                                    <FormControl>
                                        <Input
                                            type="tel"
                                            placeholder="(555) 123-4567"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="company_name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Company Name</FormLabel>
                                    <FormControl>
                                        <Input
                                            placeholder="Acme Inc."
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="notes"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>How can we help?</FormLabel>
                                    <FormControl>
                                        <Textarea
                                            placeholder="Tell us about your needs..."
                                            className="resize-none"
                                            rows={3}
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* Honeypot field - hidden from users */}
                        <div className="hidden" aria-hidden="true">
                            <FormField
                                control={form.control}
                                name="website"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Website</FormLabel>
                                        <FormControl>
                                            <Input
                                                type="text"
                                                tabIndex={-1}
                                                autoComplete="off"
                                                {...field}
                                            />
                                        </FormControl>
                                    </FormItem>
                                )}
                            />
                        </div>

                        <Button
                            type="submit"
                            className="w-full"
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Submitting...
                                </>
                            ) : (
                                <>
                                    <Send className="mr-2 h-4 w-4" />
                                    Submit Request
                                </>
                            )}
                        </Button>
                    </form>
                </Form>
            </CardContent>
        </Card>
    );
}
