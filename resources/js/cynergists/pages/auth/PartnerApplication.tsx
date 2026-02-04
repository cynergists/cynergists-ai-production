import Layout from '@/components/layout/Layout';
import {
    AgreementSigningFlow,
    SigningResult,
} from '@/components/signing/AgreementSigningFlow';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { PasswordInput } from '@/components/ui/password-input';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useStickyForm } from '@/hooks/useStickyForm';
import { supabase } from '@/integrations/supabase/client';
import { getErrorMessage } from '@/lib/logger';
import { isUserExistsError } from '@/utils/errorMessages';
import { router } from '@inertiajs/react';
import { format } from 'date-fns';
import {
    ArrowRight,
    Building2,
    CheckCircle,
    FileText,
    Loader2,
    User,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet';
import { toast } from 'sonner';
import { z } from 'zod';

type Step = 1 | 2 | 3;

const partnerSignupSchema = z.object({
    firstName: z.string().min(1, 'First name is required').max(50),
    lastName: z.string().min(1, 'Last name is required').max(50),
    email: z.string().email('Invalid email address'),
    phone: z.string().min(1, 'Phone number is required'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    company: z.string().optional(),
    registrationType: z.enum(['sole_proprietor', 'company'], {
        errorMap: () => ({ message: 'Please select a registration type' }),
    }),
});

const INITIAL_FORM_DATA = {
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    company: '',
    registrationType: '',
};

export default function PartnerApplication() {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isLoadingAgreement, setIsLoadingAgreement] = useState(false);
    const [currentStep, setCurrentStep] = useState<Step>(1);
    const [agreementContent, setAgreementContent] = useState<string>('');
    const [formData, setFormData, clearFormData] = useStickyForm(
        'partner-application-form',
        INITIAL_FORM_DATA,
    );

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleRegistrationTypeChange = (value: string) => {
        setFormData((prev) => ({ ...prev, registrationType: value }));
    };

    const isStep1Valid = () => {
        return (
            formData.firstName.trim() !== '' &&
            formData.lastName.trim() !== '' &&
            formData.email.trim() !== '' &&
            formData.phone.trim() !== '' &&
            formData.password.length >= 8
        );
    };

    const isStep2Valid = () => {
        return formData.registrationType !== '' && isStep1Valid();
    };

    const handleNextStep = () => {
        if (currentStep === 1 && isStep1Valid()) {
            setCurrentStep(2);
        }
    };

    const handlePrevStep = () => {
        if (currentStep === 2) {
            setCurrentStep(1);
        } else if (currentStep === 3) {
            setCurrentStep(2);
        }
    };

    // Process merge fields in the agreement content
    const processMergeFields = (content: string): string => {
        const companyName =
            formData.registrationType === 'company' && formData.company
                ? formData.company
                : `${formData.firstName} ${formData.lastName}`;

        const todayFormatted = format(new Date(), 'MMMM d, yyyy');

        return content
            .replace(/\{\{COMPANY_NAME\}\}/gi, companyName)
            .replace(/\{\{CLIENT_COMPANY\}\}/gi, companyName)
            .replace(
                /\{\{CLIENT_NAME\}\}/gi,
                `${formData.firstName} ${formData.lastName}`,
            )
            .replace(/\{\{CLIENT_FIRST_NAME\}\}/gi, formData.firstName)
            .replace(/\{\{CLIENT_LAST_NAME\}\}/gi, formData.lastName)
            .replace(/\{\{CLIENT_EMAIL\}\}/gi, formData.email)
            .replace(/\{\{CLIENT_PHONE\}\}/gi, formData.phone)
            .replace(/\{\{TODAYS_DATE\}\}/gi, todayFormatted)
            .replace(/\{\{LONG_DATE\}\}/gi, todayFormatted)
            .replace(/\{\{SHORT_DATE\}\}/gi, format(new Date(), 'MM/dd/yyyy'));
    };

    // Fetch the partner agreement template
    const fetchPartnerAgreement = async () => {
        setIsLoadingAgreement(true);
        try {
            const { data, error } = await supabase
                .from('document_templates')
                .select('content')
                .eq('document_type', 'partner')
                .eq('is_active', true)
                .single();

            if (error) throw error;

            if (data?.content) {
                const processedContent = processMergeFields(data.content);
                setAgreementContent(processedContent);
            } else {
                throw new Error('No partner agreement template found');
            }
        } catch (error) {
            console.error('Error fetching partner agreement:', error);
            toast.error('Failed to load partner agreement. Please try again.');
            setCurrentStep(2);
        } finally {
            setIsLoadingAgreement(false);
        }
    };

    // When moving to step 3, fetch the agreement
    useEffect(() => {
        if (currentStep === 3 && !agreementContent) {
            fetchPartnerAgreement();
        }
    }, [currentStep]);

    const handleGoToStep3 = () => {
        if (isStep2Valid()) {
            setCurrentStep(3);
        }
    };

    const handleSigningComplete = async (signingData: SigningResult) => {
        setIsSubmitting(true);

        try {
            const validated = partnerSignupSchema.parse(formData);

            // Create user account with partner user_type and agreement data
            const { data: authData, error: authError } =
                await supabase.auth.signUp({
                    email: validated.email,
                    password: validated.password,
                    options: {
                        emailRedirectTo: `${window.location.origin}/partner`,
                        data: {
                            first_name: validated.firstName,
                            last_name: validated.lastName,
                            company_name: validated.company || null,
                            phone: validated.phone,
                            user_type: 'partner',
                            partner_type: validated.registrationType,
                            agreement_signed: true,
                        },
                    },
                });

            if (authError) throw authError;

            if (authData.user) {
                // Store the signed agreement via edge function
                try {
                    await supabase.functions.invoke(
                        'create-partner-agreement',
                        {
                            body: {
                                userId: authData.user.id,
                                email: validated.email,
                                firstName: validated.firstName,
                                lastName: validated.lastName,
                                company: validated.company || null,
                                partnerType: validated.registrationType,
                                agreementContent: agreementContent,
                                signature: signingData.signature,
                                sectionInitials: signingData.sectionInitials,
                                signedAt: signingData.signedAt.toISOString(),
                            },
                        },
                    );
                } catch (agreementError) {
                    console.error('Error storing agreement:', agreementError);
                    // Non-blocking - agreement storage failed but account was created
                }

                toast.success('Welcome to the Cynergists Partner Program!');
                clearFormData();
                router.visit('/signup/partner/thank-you');
            }
        } catch (error: unknown) {
            if (error instanceof z.ZodError) {
                const firstError = error.errors[0];
                toast.error(firstError.message);
            } else if (isUserExistsError(getErrorMessage(error))) {
                toast.error(
                    'An account with this email already exists. Please sign in instead.',
                );
            } else {
                toast.error(
                    getErrorMessage(error) ||
                        'Failed to create account. Please try again.',
                );
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    // Generate default initials from name
    const getDefaultInitials = () => {
        const first = formData.firstName.charAt(0).toUpperCase();
        const last = formData.lastName.charAt(0).toUpperCase();
        return first + last;
    };

    return (
        <Layout>
            <Helmet>
                <title>Join the Cynergists Partner Program | Application</title>
                <meta
                    name="description"
                    content="Apply to become a Cynergists partner. Earn 20% recurring commissions for every client you refer."
                />
                <link
                    rel="canonical"
                    href="https://cynergists.ai/signup/partner/apply"
                />
            </Helmet>

            <div className="bg-background py-16 lg:py-24">
                <div className="container mx-auto px-4">
                    <div className="mx-auto max-w-3xl">
                        {/* Header */}
                        <div className="mb-12 text-center">
                            <h1 className="mb-4 text-3xl font-bold text-foreground md:text-4xl lg:text-5xl">
                                Join the Cynergists{' '}
                                <span className="text-gradient">
                                    Partner Program
                                </span>
                            </h1>
                            <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
                                {currentStep < 3
                                    ? "Complete the form below to get started. You'll be able to start referring clients immediately."
                                    : 'Review and sign the partner agreement to complete your registration.'}
                            </p>
                        </div>

                        {/* Benefits Reminder */}
                        <div className="mb-10 rounded-xl border border-border bg-card p-6">
                            <div className="grid gap-4 text-center sm:grid-cols-3">
                                <div className="flex items-center justify-center gap-2">
                                    <CheckCircle className="h-5 w-5 text-primary" />
                                    <span className="text-sm font-medium text-foreground">
                                        20% Recurring Commission
                                    </span>
                                </div>
                                <div className="flex items-center justify-center gap-2">
                                    <CheckCircle className="h-5 w-5 text-primary" />
                                    <span className="text-sm font-medium text-foreground">
                                        Lifetime of Client
                                    </span>
                                </div>
                                <div className="flex items-center justify-center gap-2">
                                    <CheckCircle className="h-5 w-5 text-primary" />
                                    <span className="text-sm font-medium text-foreground">
                                        Zero Fulfillment
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Progress Indicator */}
                        <div className="mb-8">
                            <div className="flex items-center justify-center gap-4">
                                <div
                                    className={`flex items-center gap-2 ${currentStep >= 1 ? 'text-primary' : 'text-muted-foreground'}`}
                                >
                                    <div
                                        className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold ${
                                            currentStep >= 1
                                                ? 'bg-primary text-primary-foreground'
                                                : 'bg-muted text-muted-foreground'
                                        }`}
                                    >
                                        1
                                    </div>
                                    <span className="hidden text-sm font-medium sm:inline">
                                        Contact Info
                                    </span>
                                </div>
                                <div
                                    className={`h-0.5 w-12 ${currentStep >= 2 ? 'bg-primary' : 'bg-muted'}`}
                                />
                                <div
                                    className={`flex items-center gap-2 ${currentStep >= 2 ? 'text-primary' : 'text-muted-foreground'}`}
                                >
                                    <div
                                        className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold ${
                                            currentStep >= 2
                                                ? 'bg-primary text-primary-foreground'
                                                : 'bg-muted text-muted-foreground'
                                        }`}
                                    >
                                        2
                                    </div>
                                    <span className="hidden text-sm font-medium sm:inline">
                                        Registration
                                    </span>
                                </div>
                                <div
                                    className={`h-0.5 w-12 ${currentStep >= 3 ? 'bg-primary' : 'bg-muted'}`}
                                />
                                <div
                                    className={`flex items-center gap-2 ${currentStep >= 3 ? 'text-primary' : 'text-muted-foreground'}`}
                                >
                                    <div
                                        className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold ${
                                            currentStep >= 3
                                                ? 'bg-primary text-primary-foreground'
                                                : 'bg-muted text-muted-foreground'
                                        }`}
                                    >
                                        3
                                    </div>
                                    <span className="hidden text-sm font-medium sm:inline">
                                        Sign Agreement
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Application Form */}
                        <div className="space-y-8">
                            {/* Step 1: Contact Information */}
                            {currentStep === 1 && (
                                <div className="space-y-6">
                                    <h2 className="border-b border-border pb-2 text-xl font-semibold text-foreground">
                                        Step 1: Contact Information
                                    </h2>
                                    <div className="grid gap-4 sm:grid-cols-2">
                                        <div className="space-y-2">
                                            <Label htmlFor="firstName">
                                                First Name *
                                            </Label>
                                            <Input
                                                id="firstName"
                                                name="firstName"
                                                value={formData.firstName}
                                                onChange={handleInputChange}
                                                required
                                                placeholder="John"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="lastName">
                                                Last Name *
                                            </Label>
                                            <Input
                                                id="lastName"
                                                name="lastName"
                                                value={formData.lastName}
                                                onChange={handleInputChange}
                                                required
                                                placeholder="Smith"
                                            />
                                        </div>
                                    </div>
                                    <div className="grid gap-4 sm:grid-cols-2">
                                        <div className="space-y-2">
                                            <Label htmlFor="email">
                                                Email Address *
                                            </Label>
                                            <Input
                                                id="email"
                                                name="email"
                                                type="email"
                                                value={formData.email}
                                                onChange={handleInputChange}
                                                required
                                                placeholder="john@company.com"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="phone">
                                                Phone Number *
                                            </Label>
                                            <Input
                                                id="phone"
                                                name="phone"
                                                type="tel"
                                                value={formData.phone}
                                                onChange={handleInputChange}
                                                required
                                                placeholder="(555) 123-4567"
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="password">
                                            Password *
                                        </Label>
                                        <PasswordInput
                                            id="password"
                                            name="password"
                                            value={formData.password}
                                            onChange={handleInputChange}
                                            required
                                            placeholder="Min. 8 characters"
                                        />
                                        <p className="text-xs text-muted-foreground">
                                            Must be at least 8 characters
                                        </p>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="company">
                                            Company Name
                                        </Label>
                                        <Input
                                            id="company"
                                            name="company"
                                            value={formData.company}
                                            onChange={handleInputChange}
                                            placeholder="Your Company LLC"
                                        />
                                    </div>

                                    {/* Next Button */}
                                    <div className="pt-4">
                                        <Button
                                            type="button"
                                            onClick={handleNextStep}
                                            disabled={!isStep1Valid()}
                                            className="px-10"
                                        >
                                            Continue to Step 2
                                            <ArrowRight className="ml-2 h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                            )}

                            {/* Step 2: Registration Type */}
                            {currentStep === 2 && (
                                <div className="space-y-6">
                                    <h2 className="border-b border-border pb-2 text-xl font-semibold text-foreground">
                                        Step 2: Registration Type
                                    </h2>

                                    <div className="space-y-4">
                                        <Label className="text-base">
                                            How Will You Be Registered? *
                                        </Label>
                                        <RadioGroup
                                            value={formData.registrationType}
                                            onValueChange={
                                                handleRegistrationTypeChange
                                            }
                                            className="grid gap-4 sm:grid-cols-2"
                                        >
                                            <Label
                                                htmlFor="sole_proprietor"
                                                className={`flex cursor-pointer items-center gap-4 rounded-xl border-2 p-6 transition-all ${
                                                    formData.registrationType ===
                                                    'sole_proprietor'
                                                        ? 'border-primary bg-primary/5'
                                                        : 'border-border hover:border-primary/50'
                                                }`}
                                            >
                                                <RadioGroupItem
                                                    value="sole_proprietor"
                                                    id="sole_proprietor"
                                                />
                                                <div className="flex items-center gap-3">
                                                    <User className="h-8 w-8 text-primary" />
                                                    <div>
                                                        <div className="font-semibold text-foreground">
                                                            Sole Proprietor
                                                        </div>
                                                        <div className="text-sm text-muted-foreground">
                                                            Individual partner
                                                        </div>
                                                    </div>
                                                </div>
                                            </Label>
                                            <Label
                                                htmlFor="company"
                                                className={`flex cursor-pointer items-center gap-4 rounded-xl border-2 p-6 transition-all ${
                                                    formData.registrationType ===
                                                    'company'
                                                        ? 'border-primary bg-primary/5'
                                                        : 'border-border hover:border-primary/50'
                                                }`}
                                            >
                                                <RadioGroupItem
                                                    value="company"
                                                    id="company"
                                                />
                                                <div className="flex items-center gap-3">
                                                    <Building2 className="h-8 w-8 text-primary" />
                                                    <div>
                                                        <div className="font-semibold text-foreground">
                                                            Company
                                                        </div>
                                                        <div className="text-sm text-muted-foreground">
                                                            Business entity
                                                        </div>
                                                    </div>
                                                </div>
                                            </Label>
                                        </RadioGroup>
                                    </div>

                                    {/* Navigation Buttons */}
                                    <div className="flex gap-4 pt-4">
                                        <Button
                                            type="button"
                                            variant="outline"
                                            onClick={handlePrevStep}
                                            className="px-10"
                                        >
                                            Back
                                        </Button>
                                        <Button
                                            type="button"
                                            onClick={handleGoToStep3}
                                            disabled={!isStep2Valid()}
                                            className="px-10"
                                        >
                                            Continue to Agreement
                                            <FileText className="ml-2 h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                            )}

                            {/* Step 3: Sign Agreement */}
                            {currentStep === 3 && (
                                <div className="space-y-6">
                                    <h2 className="border-b border-border pb-2 text-xl font-semibold text-foreground">
                                        Step 3: Partner Agreement
                                    </h2>

                                    {isLoadingAgreement ? (
                                        <div className="flex items-center justify-center py-16">
                                            <Loader2 className="h-8 w-8 animate-spin text-primary" />
                                            <span className="ml-3 text-muted-foreground">
                                                Loading agreement...
                                            </span>
                                        </div>
                                    ) : agreementContent ? (
                                        <>
                                            {isSubmitting && (
                                                <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
                                                    <div className="rounded-xl border border-border bg-card p-8 text-center">
                                                        <Loader2 className="mx-auto mb-4 h-12 w-12 animate-spin text-primary" />
                                                        <p className="text-lg font-medium text-foreground">
                                                            Creating your
                                                            partner account...
                                                        </p>
                                                        <p className="mt-2 text-sm text-muted-foreground">
                                                            This will only take
                                                            a moment.
                                                        </p>
                                                    </div>
                                                </div>
                                            )}
                                            <AgreementSigningFlow
                                                agreementContent={
                                                    agreementContent
                                                }
                                                defaultInitials={getDefaultInitials()}
                                                defaultSignatureName={`${formData.firstName} ${formData.lastName}`}
                                                onComplete={
                                                    handleSigningComplete
                                                }
                                                onBack={handlePrevStep}
                                                showBackButton={true}
                                            />
                                        </>
                                    ) : (
                                        <div className="py-16 text-center">
                                            <p className="text-muted-foreground">
                                                Failed to load agreement. Please
                                                go back and try again.
                                            </p>
                                            <Button
                                                onClick={handlePrevStep}
                                                variant="outline"
                                                className="mt-4"
                                            >
                                                Go Back
                                            </Button>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </Layout>
    );
}
