import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { OrbitingButton } from '@/components/ui/orbiting-button';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import type { CompanyInfo } from '@/pages/Checkout';
import { ArrowLeft, ArrowRight, Building2, MapPin } from 'lucide-react';
import { useState } from 'react';

interface CompanyInfoStepProps {
    data: CompanyInfo;
    onUpdate: (data: Partial<CompanyInfo>) => void;
    onNext: () => void;
    onBack: () => void;
}

const US_STATES = [
    { value: 'AL', label: 'Alabama' },
    { value: 'AK', label: 'Alaska' },
    { value: 'AZ', label: 'Arizona' },
    { value: 'AR', label: 'Arkansas' },
    { value: 'CA', label: 'California' },
    { value: 'CO', label: 'Colorado' },
    { value: 'CT', label: 'Connecticut' },
    { value: 'DE', label: 'Delaware' },
    { value: 'FL', label: 'Florida' },
    { value: 'GA', label: 'Georgia' },
    { value: 'HI', label: 'Hawaii' },
    { value: 'ID', label: 'Idaho' },
    { value: 'IL', label: 'Illinois' },
    { value: 'IN', label: 'Indiana' },
    { value: 'IA', label: 'Iowa' },
    { value: 'KS', label: 'Kansas' },
    { value: 'KY', label: 'Kentucky' },
    { value: 'LA', label: 'Louisiana' },
    { value: 'ME', label: 'Maine' },
    { value: 'MD', label: 'Maryland' },
    { value: 'MA', label: 'Massachusetts' },
    { value: 'MI', label: 'Michigan' },
    { value: 'MN', label: 'Minnesota' },
    { value: 'MS', label: 'Mississippi' },
    { value: 'MO', label: 'Missouri' },
    { value: 'MT', label: 'Montana' },
    { value: 'NE', label: 'Nebraska' },
    { value: 'NV', label: 'Nevada' },
    { value: 'NH', label: 'New Hampshire' },
    { value: 'NJ', label: 'New Jersey' },
    { value: 'NM', label: 'New Mexico' },
    { value: 'NY', label: 'New York' },
    { value: 'NC', label: 'North Carolina' },
    { value: 'ND', label: 'North Dakota' },
    { value: 'OH', label: 'Ohio' },
    { value: 'OK', label: 'Oklahoma' },
    { value: 'OR', label: 'Oregon' },
    { value: 'PA', label: 'Pennsylvania' },
    { value: 'RI', label: 'Rhode Island' },
    { value: 'SC', label: 'South Carolina' },
    { value: 'SD', label: 'South Dakota' },
    { value: 'TN', label: 'Tennessee' },
    { value: 'TX', label: 'Texas' },
    { value: 'UT', label: 'Utah' },
    { value: 'VT', label: 'Vermont' },
    { value: 'VA', label: 'Virginia' },
    { value: 'WA', label: 'Washington' },
    { value: 'WV', label: 'West Virginia' },
    { value: 'WI', label: 'Wisconsin' },
    { value: 'WY', label: 'Wyoming' },
    { value: 'DC', label: 'District of Columbia' },
];

const CompanyInfoStep = ({
    data,
    onUpdate,
    onNext,
    onBack,
}: CompanyInfoStepProps) => {
    const [errors, setErrors] = useState<
        Partial<Record<keyof CompanyInfo, string>>
    >({});
    const [touched, setTouched] = useState<
        Partial<Record<keyof CompanyInfo, boolean>>
    >({});

    const validateField = (
        field: keyof CompanyInfo,
        value: string,
    ): string | null => {
        switch (field) {
            case 'jobTitle':
                return value.trim() ? null : 'Job title is required';
            case 'companyName':
                return value.trim() ? null : 'Company name is required';
            case 'streetAddress':
                return value.trim() ? null : 'Street address is required';
            case 'city':
                return value.trim() ? null : 'City is required';
            case 'state':
                return value ? null : 'State is required';
            case 'zip':
                if (!value.trim()) return 'ZIP code is required';
                if (!/^\d{5}(-\d{4})?$/.test(value.trim()))
                    return 'Please enter a valid ZIP code';
                return null;
            default:
                return null;
        }
    };

    const handleBlur = (field: keyof CompanyInfo) => {
        setTouched((prev) => ({ ...prev, [field]: true }));
        const error = validateField(field, data[field]);
        setErrors((prev) => ({ ...prev, [field]: error || undefined }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        const newErrors: Partial<Record<keyof CompanyInfo, string>> = {};
        let hasErrors = false;

        (Object.keys(data) as (keyof CompanyInfo)[]).forEach((field) => {
            const error = validateField(field, data[field]);
            if (error) {
                newErrors[field] = error;
                hasErrors = true;
            }
        });

        setErrors(newErrors);
        setTouched({
            jobTitle: true,
            companyName: true,
            streetAddress: true,
            city: true,
            state: true,
            zip: true,
        });

        if (!hasErrors) {
            onNext();
        }
    };

    return (
        <div className="card-glass p-8">
            <div className="mb-6 flex items-center gap-3">
                <div className="rounded-lg bg-primary/10 p-2">
                    <Building2 className="h-5 w-5 text-primary" />
                </div>
                <div>
                    <h2 className="font-display text-xl font-bold text-foreground">
                        Company Information
                    </h2>
                    <p className="text-sm text-muted-foreground">
                        Business details for your agreement
                    </p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                        <Label htmlFor="jobTitle">Your Job Title *</Label>
                        <Input
                            id="jobTitle"
                            name="organization-title"
                            type="text"
                            autoComplete="organization-title"
                            value={data.jobTitle}
                            onChange={(e) =>
                                onUpdate({ jobTitle: e.target.value })
                            }
                            onBlur={() => handleBlur('jobTitle')}
                            placeholder="CEO, Founder, Director..."
                            className={
                                errors.jobTitle && touched.jobTitle
                                    ? 'border-destructive'
                                    : ''
                            }
                        />
                        {errors.jobTitle && touched.jobTitle && (
                            <p className="text-sm text-destructive">
                                {errors.jobTitle}
                            </p>
                        )}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="companyName">Company Name *</Label>
                        <Input
                            id="companyName"
                            name="organization"
                            type="text"
                            autoComplete="organization"
                            value={data.companyName}
                            onChange={(e) =>
                                onUpdate({ companyName: e.target.value })
                            }
                            onBlur={() => handleBlur('companyName')}
                            placeholder="Acme Corporation"
                            className={
                                errors.companyName && touched.companyName
                                    ? 'border-destructive'
                                    : ''
                            }
                        />
                        {errors.companyName && touched.companyName && (
                            <p className="text-sm text-destructive">
                                {errors.companyName}
                            </p>
                        )}
                    </div>
                </div>

                <div className="space-y-4">
                    <div className="flex items-center gap-2 text-muted-foreground">
                        <MapPin className="h-4 w-4" />
                        <span className="text-sm font-medium">
                            Company Address
                        </span>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="streetAddress">Street Address *</Label>
                        <Input
                            id="streetAddress"
                            name="street-address"
                            type="text"
                            autoComplete="street-address"
                            value={data.streetAddress}
                            onChange={(e) =>
                                onUpdate({ streetAddress: e.target.value })
                            }
                            onBlur={() => handleBlur('streetAddress')}
                            placeholder="123 Main Street, Suite 100"
                            className={
                                errors.streetAddress && touched.streetAddress
                                    ? 'border-destructive'
                                    : ''
                            }
                        />
                        {errors.streetAddress && touched.streetAddress && (
                            <p className="text-sm text-destructive">
                                {errors.streetAddress}
                            </p>
                        )}
                    </div>

                    <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                        <div className="col-span-2 space-y-2">
                            <Label htmlFor="city">City *</Label>
                            <Input
                                id="city"
                                name="address-level2"
                                type="text"
                                autoComplete="address-level2"
                                value={data.city}
                                onChange={(e) =>
                                    onUpdate({ city: e.target.value })
                                }
                                onBlur={() => handleBlur('city')}
                                placeholder="New York"
                                className={
                                    errors.city && touched.city
                                        ? 'border-destructive'
                                        : ''
                                }
                            />
                            {errors.city && touched.city && (
                                <p className="text-sm text-destructive">
                                    {errors.city}
                                </p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="state">State *</Label>
                            <Select
                                value={data.state}
                                onValueChange={(value) => {
                                    onUpdate({ state: value });
                                    setTouched((prev) => ({
                                        ...prev,
                                        state: true,
                                    }));
                                    setErrors((prev) => ({
                                        ...prev,
                                        state: undefined,
                                    }));
                                }}
                            >
                                <SelectTrigger
                                    id="state"
                                    className={
                                        errors.state && touched.state
                                            ? 'border-destructive'
                                            : ''
                                    }
                                >
                                    <SelectValue placeholder="Select" />
                                </SelectTrigger>
                                <SelectContent>
                                    {US_STATES.map((state) => (
                                        <SelectItem
                                            key={state.value}
                                            value={state.value}
                                        >
                                            {state.value}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {errors.state && touched.state && (
                                <p className="text-sm text-destructive">
                                    {errors.state}
                                </p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="zip">ZIP Code *</Label>
                            <Input
                                id="zip"
                                name="postal-code"
                                type="text"
                                autoComplete="postal-code"
                                inputMode="numeric"
                                value={data.zip}
                                onChange={(e) =>
                                    onUpdate({ zip: e.target.value })
                                }
                                onBlur={() => handleBlur('zip')}
                                placeholder="10001"
                                maxLength={10}
                                className={
                                    errors.zip && touched.zip
                                        ? 'border-destructive'
                                        : ''
                                }
                            />
                            {errors.zip && touched.zip && (
                                <p className="text-sm text-destructive">
                                    {errors.zip}
                                </p>
                            )}
                        </div>
                    </div>
                </div>

                <div className="flex flex-col-reverse gap-3 pt-4 md:flex-row">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={onBack}
                        className="w-full md:w-auto"
                    >
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back
                    </Button>
                    <OrbitingButton
                        type="submit"
                        className="btn-primary w-full md:w-auto"
                    >
                        Continue to Agreement
                        <ArrowRight className="ml-2 h-4 w-4" />
                    </OrbitingButton>
                </div>
            </form>
        </div>
    );
};

export default CompanyInfoStep;
