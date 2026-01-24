import { useState } from "react";
import { Button } from "@/components/ui/button";
import { OrbitingButton } from "@/components/ui/orbiting-button";
import { Input } from "@/components/ui/input";
import { PhoneInput } from "@/components/ui/phone-input";
import { Label } from "@/components/ui/label";
import { ArrowRight, User, Mail, Phone } from "lucide-react";
import type { ContactInfo } from "@/pages/Checkout";

interface ContactInfoStepProps {
  data: ContactInfo;
  onUpdate: (data: Partial<ContactInfo>) => void;
  onNext: () => void;
}

const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const isValidPhone = (phone: string): boolean => {
  // Valid if has country code and at least 7 digits
  const digits = phone.replace(/\D/g, "");
  return digits.length >= 7;
};

const ContactInfoStep = ({ data, onUpdate, onNext }: ContactInfoStepProps) => {
  const [errors, setErrors] = useState<Partial<Record<keyof ContactInfo, string>>>({});
  const [touched, setTouched] = useState<Partial<Record<keyof ContactInfo, boolean>>>({}); 

  const validateField = (field: keyof ContactInfo, value: string): string | null => {
    switch (field) {
      case "firstName":
        return value.trim() ? null : "First name is required";
      case "lastName":
        return value.trim() ? null : "Last name is required";
      case "email":
        if (!value.trim()) return "Email is required";
        if (!isValidEmail(value)) return "Please enter a valid email address";
        return null;
      case "phone":
        if (!value.trim()) return "Phone number is required";
        if (!isValidPhone(value)) return "Please enter a valid phone number";
        return null;
      default:
        return null;
    }
  };

  const handleBlur = (field: keyof ContactInfo) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    const error = validateField(field, data[field]);
    setErrors((prev) => ({ ...prev, [field]: error || undefined }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const newErrors: Partial<Record<keyof ContactInfo, string>> = {};
    let hasErrors = false;

    (Object.keys(data) as (keyof ContactInfo)[]).forEach((field) => {
      const error = validateField(field, data[field]);
      if (error) {
        newErrors[field] = error;
        hasErrors = true;
      }
    });

    setErrors(newErrors);
    setTouched({ firstName: true, lastName: true, email: true, phone: true });

    if (!hasErrors) {
      onNext();
    }
  };

  return (
    <div className="card-glass p-8">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-primary/10 rounded-lg">
          <User className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h2 className="font-display text-xl font-bold text-foreground">
            Contact Information
          </h2>
          <p className="text-sm text-muted-foreground">
            Tell us how to reach you
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="firstName">First Name *</Label>
            <Input
              id="firstName"
              name="given-name"
              type="text"
              autoComplete="given-name"
              value={data.firstName}
              onChange={(e) => onUpdate({ firstName: e.target.value })}
              onBlur={() => handleBlur("firstName")}
              placeholder="John"
              className={errors.firstName && touched.firstName ? "border-destructive" : ""}
            />
            {errors.firstName && touched.firstName && (
              <p className="text-sm text-destructive">{errors.firstName}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="lastName">Last Name *</Label>
            <Input
              id="lastName"
              name="family-name"
              type="text"
              autoComplete="family-name"
              value={data.lastName}
              onChange={(e) => onUpdate({ lastName: e.target.value })}
              onBlur={() => handleBlur("lastName")}
              placeholder="Smith"
              className={errors.lastName && touched.lastName ? "border-destructive" : ""}
            />
            {errors.lastName && touched.lastName && (
              <p className="text-sm text-destructive">{errors.lastName}</p>
            )}
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="email" className="flex items-center gap-2">
            <Mail className="h-4 w-4 text-muted-foreground" />
            Email Address *
          </Label>
          <Input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            value={data.email}
            onChange={(e) => onUpdate({ email: e.target.value })}
            onBlur={() => handleBlur("email")}
            placeholder="john@company.com"
            className={errors.email && touched.email ? "border-destructive" : ""}
          />
          {errors.email && touched.email && (
            <p className="text-sm text-destructive">{errors.email}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="phone" className="flex items-center gap-2">
            <Phone className="h-4 w-4 text-muted-foreground" />
            Phone Number *
          </Label>
          <PhoneInput
            id="phone"
            value={data.phone}
            onChange={(value) => onUpdate({ phone: value })}
            onBlur={() => handleBlur("phone")}
            className={errors.phone && touched.phone ? "[&_input]:border-destructive" : ""}
          />
          {errors.phone && touched.phone && (
            <p className="text-sm text-destructive">{errors.phone}</p>
          )}
        </div>

        <div className="pt-4">
          <OrbitingButton type="submit" className="btn-primary w-full md:w-auto">
            Continue
            <ArrowRight className="ml-2 h-4 w-4" />
          </OrbitingButton>
        </div>
      </form>
    </div>
  );
};

export default ContactInfoStep;
