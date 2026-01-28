import InputError from '@/components/input-error';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import AuthLayout from '@/layouts/auth-layout';
import { login } from '@/routes';
import { store } from '@/routes/register';
import { Form, Head } from '@inertiajs/react';

export default function Register() {
    return (
        <AuthLayout
            title="Create an account"
            description="Enter your details below to create your account"
        >
            <Head title="Register" />
            <Form
                {...store.form()}
                resetOnSuccess={['password', 'password_confirmation']}
                disableWhileProcessing
                className="flex flex-col gap-6"
            >
                {({ processing, errors }) => (
                    <>
                        <div className="grid gap-6">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="first_name">
                                        First Name
                                    </Label>
                                    <Input
                                        id="first_name"
                                        type="text"
                                        required
                                        autoFocus
                                        tabIndex={1}
                                        autoComplete="given-name"
                                        name="first_name"
                                        placeholder="First name"
                                    />
                                    <InputError
                                        message={errors.first_name}
                                        className="mt-2"
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="last_name">Last Name</Label>
                                    <Input
                                        id="last_name"
                                        type="text"
                                        required
                                        tabIndex={2}
                                        autoComplete="family-name"
                                        name="last_name"
                                        placeholder="Last name"
                                    />
                                    <InputError
                                        message={errors.last_name}
                                        className="mt-2"
                                    />
                                </div>
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="email">Email address</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    required
                                    tabIndex={3}
                                    autoComplete="email"
                                    name="email"
                                    placeholder="email@example.com"
                                />
                                <InputError message={errors.email} />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="company_name">
                                    Company Name
                                </Label>
                                <Input
                                    id="company_name"
                                    type="text"
                                    required
                                    tabIndex={4}
                                    autoComplete="organization"
                                    name="company_name"
                                    placeholder="Company name"
                                />
                                <InputError message={errors.company_name} />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="phone">Phone (optional)</Label>
                                <Input
                                    id="phone"
                                    type="tel"
                                    tabIndex={5}
                                    autoComplete="tel"
                                    name="phone"
                                    placeholder="Phone number"
                                />
                                <InputError message={errors.phone} />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="password">Password</Label>
                                <Input
                                    id="password"
                                    type="password"
                                    required
                                    tabIndex={6}
                                    autoComplete="new-password"
                                    name="password"
                                    placeholder="Password"
                                />
                                <InputError message={errors.password} />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="password_confirmation">
                                    Confirm password
                                </Label>
                                <Input
                                    id="password_confirmation"
                                    type="password"
                                    required
                                    tabIndex={7}
                                    autoComplete="new-password"
                                    name="password_confirmation"
                                    placeholder="Confirm password"
                                />
                                <InputError
                                    message={errors.password_confirmation}
                                />
                            </div>

                            <div className="flex items-start space-x-2">
                                <Checkbox
                                    id="accept_terms"
                                    name="accept_terms"
                                    tabIndex={8}
                                    value="1"
                                />
                                <Label
                                    htmlFor="accept_terms"
                                    className="text-sm leading-tight cursor-pointer text-muted-foreground"
                                >
                                    I accept the{' '}
                                    <TextLink href="/terms" tabIndex={-1}>
                                        Terms of Service
                                    </TextLink>{' '}
                                    and{' '}
                                    <TextLink href="/privacy" tabIndex={-1}>
                                        Privacy Policy
                                    </TextLink>
                                </Label>
                            </div>
                            <InputError message={errors.accept_terms} />

                            <input
                                type="hidden"
                                name="user_type"
                                value="client"
                            />

                            <Button
                                type="submit"
                                className="mt-2 w-full"
                                tabIndex={9}
                                data-test="register-user-button"
                            >
                                {processing && <Spinner />}
                                Create account
                            </Button>
                        </div>

                        <div className="text-center text-sm text-muted-foreground">
                            Already have an account?{' '}
                            <TextLink href={login()} tabIndex={10}>
                                Log in
                            </TextLink>
                        </div>
                    </>
                )}
            </Form>
        </AuthLayout>
    );
}
