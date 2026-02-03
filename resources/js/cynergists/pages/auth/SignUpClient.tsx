import cynergistsLogo from '@/assets/cynergists-logo-new.png';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { PasswordInput } from '@/components/ui/password-input';
import { PhoneInput } from '@/components/ui/phone-input';
import { useToast } from '@/hooks/use-toast';
import { Link, router } from '@inertiajs/react';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { useState } from 'react';
import { Helmet } from 'react-helmet';
import { z } from 'zod';

const signupSchema = z.object({
    firstName: z.string().min(1, 'First name is required').max(50),
    lastName: z.string().min(1, 'Last name is required').max(50),
    email: z.string().email('Invalid email address'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    companyName: z.string().min(1, 'Company name is required').max(100),
    phone: z.string().optional(),
    acceptTerms: z.literal(true, {
        errorMap: () => ({ message: 'You must accept the terms' }),
    }),
});

export default function SignUpClient() {
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        companyName: '',
        phone: '',
        acceptTerms: false,
    });
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [loading, setLoading] = useState(false);
    const { toast } = useToast();

    const handleChange = (field: string, value: string | boolean) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
        if (errors[field]) {
            setErrors((prev) => ({ ...prev, [field]: '' }));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setErrors({});

        try {
            const validated = signupSchema.parse(formData);

            const checkoutRedirect =
                sessionStorage.getItem('checkout_redirect');

            router.post(
                '/register',
                {
                    first_name: validated.firstName,
                    last_name: validated.lastName,
                    email: validated.email,
                    password: validated.password,
                    password_confirmation: validated.password,
                    company_name: validated.companyName,
                    phone: validated.phone || null,
                    accept_terms: validated.acceptTerms,
                    user_type: 'client',
                },
                {
                    onSuccess: () => {
                        const contactData = {
                            firstName: validated.firstName,
                            lastName: validated.lastName,
                            email: validated.email,
                            phone: validated.phone || '',
                        };
                        const companyData = {
                            jobTitle: '',
                            companyName: validated.companyName,
                            streetAddress: '',
                            city: '',
                            state: '',
                            zip: '',
                        };
                        localStorage.setItem(
                            'cynergists_checkout_contact',
                            JSON.stringify(contactData),
                        );
                        localStorage.setItem(
                            'cynergists_checkout_company',
                            JSON.stringify(companyData),
                        );

                        sessionStorage.setItem('isNewSignup', 'true');

                        if (checkoutRedirect) {
                            sessionStorage.removeItem('checkout_redirect');
                        }

                        toast({
                            title: 'Account created',
                            description:
                                'Welcome to Cynergists! Your portal is ready.',
                        });
                    },
                    onError: (serverErrors) => {
                        const mappedErrors: Record<string, string> = {};
                        Object.entries(serverErrors).forEach(([key, value]) => {
                            const message = Array.isArray(value)
                                ? value[0]
                                : value;
                            const field = key
                                .replace('first_name', 'firstName')
                                .replace('last_name', 'lastName')
                                .replace('company_name', 'companyName')
                                .replace('accept_terms', 'acceptTerms');
                            mappedErrors[field] = message;
                        });
                        setErrors(mappedErrors);
                        const firstError = Object.values(mappedErrors)[0];
                        if (firstError) {
                            toast({
                                title: 'Sign up failed',
                                description: firstError,
                                variant: 'destructive',
                            });
                        }
                    },
                    onFinish: () => setLoading(false),
                },
            );
            return;
        } catch (error: unknown) {
            if (error instanceof z.ZodError) {
                const fieldErrors: Record<string, string> = {};
                error.errors.forEach((err) => {
                    if (err.path[0]) {
                        fieldErrors[err.path[0] as string] = err.message;
                    }
                });
                setErrors(fieldErrors);
                setLoading(false);
            } else {
                toast({
                    title: 'Sign up failed',
                    description: 'Something went wrong. Please try again.',
                    variant: 'destructive',
                });
                setLoading(false);
            }
        }
    };

    return (
        <>
            <Helmet>
                <title>Get Started | Cynergists</title>
                <meta
                    name="description"
                    content="Create your Cynergists account and start accessing powerful business tools and services."
                />
            </Helmet>

            <div className="flex min-h-screen items-center justify-center bg-background p-4">
                <div className="w-full max-w-md rounded-2xl border border-border bg-card p-8 shadow-xl">
                    {/* Back link */}
                    <Link
                        href="/signin"
                        className="mb-6 inline-flex items-center text-sm text-muted-foreground hover:text-foreground"
                    >
                        <ArrowLeft className="mr-1 h-4 w-4" />
                        Back to sign in
                    </Link>

                    {/* Logo */}
                    <div className="mb-6 flex justify-center">
                        <img
                            src={cynergistsLogo}
                            alt="Cynergists"
                            className="h-10 w-auto"
                        />
                    </div>

                    {/* Header */}
                    <div className="mb-6 text-center">
                        <h1 className="mb-2 text-2xl font-bold text-foreground">
                            Get Started
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            Create your account to access Cynergists services.
                        </p>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="firstName">First Name</Label>
                                <Input
                                    id="firstName"
                                    value={formData.firstName}
                                    onChange={(e) =>
                                        handleChange(
                                            'firstName',
                                            e.target.value,
                                        )
                                    }
                                    placeholder="John"
                                    className="border-border bg-input"
                                />
                                {errors.firstName && (
                                    <p className="text-xs text-destructive">
                                        {errors.firstName}
                                    </p>
                                )}
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="lastName">Last Name</Label>
                                <Input
                                    id="lastName"
                                    value={formData.lastName}
                                    onChange={(e) =>
                                        handleChange('lastName', e.target.value)
                                    }
                                    placeholder="Doe"
                                    className="border-border bg-input"
                                />
                                {errors.lastName && (
                                    <p className="text-xs text-destructive">
                                        {errors.lastName}
                                    </p>
                                )}
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                type="email"
                                value={formData.email}
                                onChange={(e) =>
                                    handleChange('email', e.target.value)
                                }
                                placeholder="you@company.com"
                                className="border-border bg-input"
                            />
                            {errors.email && (
                                <p className="text-xs text-destructive">
                                    {errors.email}
                                </p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="password">Password</Label>
                            <PasswordInput
                                id="password"
                                value={formData.password}
                                onChange={(e) =>
                                    handleChange('password', e.target.value)
                                }
                                placeholder="••••••••"
                                className="border-border bg-input"
                            />
                            {errors.password && (
                                <p className="text-xs text-destructive">
                                    {errors.password}
                                </p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="companyName">Company Name</Label>
                            <Input
                                id="companyName"
                                value={formData.companyName}
                                onChange={(e) =>
                                    handleChange('companyName', e.target.value)
                                }
                                placeholder="Acme Inc."
                                className="border-border bg-input"
                            />
                            {errors.companyName && (
                                <p className="text-xs text-destructive">
                                    {errors.companyName}
                                </p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="phone">Phone (optional)</Label>
                            <PhoneInput
                                id="phone"
                                value={formData.phone}
                                onChange={(value) =>
                                    handleChange('phone', value)
                                }
                            />
                        </div>

                        <div className="flex items-start space-x-2 pt-2">
                            <Checkbox
                                id="terms"
                                checked={formData.acceptTerms}
                                onCheckedChange={(checked) =>
                                    handleChange(
                                        'acceptTerms',
                                        checked as boolean,
                                    )
                                }
                            />
                            <Label
                                htmlFor="terms"
                                className="cursor-pointer text-sm leading-tight text-muted-foreground"
                            >
                                I accept the{' '}
                                <Link
                                    href="/terms"
                                    className="text-primary hover:underline"
                                >
                                    Terms of Service
                                </Link>{' '}
                                and{' '}
                                <Link
                                    href="/privacy"
                                    className="text-primary hover:underline"
                                >
                                    Privacy Policy
                                </Link>
                            </Label>
                        </div>
                        {errors.acceptTerms && (
                            <p className="text-xs text-destructive">
                                {errors.acceptTerms}
                            </p>
                        )}

                        <Button
                            type="submit"
                            disabled={loading}
                            className="mt-2 w-full bg-primary py-3 font-semibold text-primary-foreground hover:bg-primary/90"
                        >
                            {loading ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                                'Create Account'
                            )}
                        </Button>
                    </form>

                    <p className="mt-6 text-center text-sm text-muted-foreground">
                        Already have an account?{' '}
                        <Link
                            href="/signin"
                            className="font-medium text-primary hover:text-primary/80"
                        >
                            Sign in
                        </Link>
                    </p>
                </div>
            </div>
        </>
    );
}
