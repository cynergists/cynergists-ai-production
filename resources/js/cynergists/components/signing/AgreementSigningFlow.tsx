/**
 * AgreementSigningFlow Component
 *
 * A unified, state-driven signing workflow component used by both:
 * - Checkout flow (AgreementReviewStep)
 * - Standalone signing page (SignAgreement)
 *
 * This component handles:
 * - Dynamic section extraction from template content
 * - Deterministic initial tracking
 * - Automatic transition to signature when initials complete
 * - eSign acceptance gate
 */

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import {
    getNextIncompleteSection,
    getSectionKeysFromTemplate,
    getSigningProgress,
} from '@/utils/agreementParser';
import DOMPurify from 'dompurify';
import { AlertCircle, Check, CheckCircle, PenLine } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';

const CURSIVE_FONTS = [
    { name: 'Dancing Script', className: 'font-dancing' },
    { name: 'Great Vibes', className: 'font-great-vibes' },
    { name: 'Pacifico', className: 'font-pacifico' },
    { name: 'Satisfy', className: 'font-satisfy' },
];

export interface SigningFlowProps {
    /** The processed agreement content (with merge fields replaced, but {{CLIENT_INITIALS}} intact) */
    agreementContent: string;
    /** Default initials suggestion (e.g., "JD" for John Doe) */
    defaultInitials: string;
    /** Default name for signature */
    defaultSignatureName: string;
    /** Callback when signing is complete */
    onComplete: (data: SigningResult) => void;
    /** Optional callback for back button */
    onBack?: () => void;
    /** Whether to show the back button */
    showBackButton?: boolean;
    /** Pre-populated section initials (for resuming) */
    initialSectionInitials?: Record<string, string>;
    /** Pre-populated signature */
    initialSignature?: string;
}

export interface SigningResult {
    sectionInitials: Record<string, string>;
    signature: string;
    signedAt: Date;
}

export function AgreementSigningFlow({
    agreementContent,
    defaultInitials,
    defaultSignatureName,
    onComplete,
    onBack,
    showBackButton = true,
    initialSectionInitials = {},
    initialSignature = '',
}: SigningFlowProps) {
    // Derive section keys from template content
    const sectionKeys = getSectionKeysFromTemplate(agreementContent);

    // Signing state
    const [sectionInitials, setSectionInitials] = useState<
        Record<string, string>
    >(initialSectionInitials);
    const [activeSection, setActiveSection] = useState<string | null>(null);
    const [tempInitials, setTempInitials] = useState(defaultInitials);
    const [selectedFont, setSelectedFont] = useState(CURSIVE_FONTS[0]);
    const [fontLocked, setFontLocked] = useState(false);
    const [showSignatureSection, setShowSignatureSection] = useState(false);
    const [signatureName, setSignatureName] = useState(defaultSignatureName);
    const [hasAgreed, setHasAgreed] = useState(false);

    // Refs for scrolling
    const sectionRefs = useRef<Record<string, HTMLDivElement | null>>({});
    const signatureRef = useRef<HTMLDivElement>(null);

    // Calculate progress
    const progress = getSigningProgress(
        sectionKeys,
        sectionInitials,
        !!initialSignature,
    );

    // Auto-show signature section when all initials complete
    useEffect(() => {
        if (progress.allInitialsComplete && !showSignatureSection) {
            setShowSignatureSection(true);
            toast.success('All sections initialed! Please sign below.');

            setTimeout(() => {
                signatureRef.current?.scrollIntoView({
                    behavior: 'smooth',
                    block: 'center',
                });
            }, 200);
        }
    }, [progress.allInitialsComplete, showSignatureSection]);

    const handleStartSigning = useCallback(() => {
        const firstIncomplete = getNextIncompleteSection(
            sectionKeys,
            sectionInitials,
        );

        if (firstIncomplete) {
            setActiveSection(firstIncomplete);
            setTempInitials(defaultInitials);
            setTimeout(() => {
                sectionRefs.current[firstIncomplete]?.scrollIntoView({
                    behavior: 'smooth',
                    block: 'center',
                });
            }, 100);
        } else {
            // All initials complete, go to signature
            setShowSignatureSection(true);
            setTimeout(() => {
                signatureRef.current?.scrollIntoView({
                    behavior: 'smooth',
                    block: 'center',
                });
            }, 100);
        }
    }, [sectionKeys, sectionInitials, defaultInitials]);

    const handleInitialClick = useCallback(
        (sectionKey: string) => {
            if (!sectionInitials[sectionKey]) {
                setActiveSection(sectionKey);
                setTempInitials(defaultInitials);
            }
        },
        [sectionInitials, defaultInitials],
    );

    const handleConfirmInitials = useCallback(() => {
        if (!activeSection || !tempInitials.trim()) return;

        const initialsValue = `${tempInitials}|${selectedFont.className}`;

        // Create updated state BEFORE setting (fixes stale state issue)
        const updatedInitials = {
            ...sectionInitials,
            [activeSection]: initialsValue,
        };

        setSectionInitials(updatedInitials);

        if (!fontLocked) {
            setFontLocked(true);
        }

        // Find next incomplete section using UPDATED state
        const nextSection = getNextIncompleteSection(
            sectionKeys,
            updatedInitials,
            activeSection,
        );

        if (nextSection) {
            // Move to next section
            setActiveSection(nextSection);
            toast.info(
                `Section initialed. ${sectionKeys.length - Object.keys(updatedInitials).length} remaining.`,
            );
            setTimeout(() => {
                sectionRefs.current[nextSection]?.scrollIntoView({
                    behavior: 'smooth',
                    block: 'center',
                });
            }, 150);
        } else {
            // All sections complete, transition to signature
            setActiveSection(null);
            setShowSignatureSection(true);
            toast.success('All sections initialed! Please sign below.');
            setTimeout(() => {
                signatureRef.current?.scrollIntoView({
                    behavior: 'smooth',
                    block: 'center',
                });
            }, 150);
        }
    }, [
        activeSection,
        tempInitials,
        selectedFont.className,
        fontLocked,
        sectionKeys,
        sectionInitials,
    ]);

    const handleSignAgreement = useCallback(() => {
        if (!hasAgreed) {
            toast.error('Please agree to the electronic signature terms');
            return;
        }

        if (!signatureName.trim() || signatureName.trim().length < 2) {
            toast.error('Please enter your full legal name');
            return;
        }

        const signature = `${signatureName}|${selectedFont.className}`;

        onComplete({
            sectionInitials,
            signature,
            signedAt: new Date(),
        });
    }, [
        hasAgreed,
        signatureName,
        selectedFont.className,
        sectionInitials,
        onComplete,
    ]);

    // Render inline initials box for a section
    const renderInitialsBox = (sectionKey: string, index: number) => {
        const initials = sectionInitials[sectionKey];
        const isActive = activeSection === sectionKey;
        const [initialsText, fontClass] = initials
            ? initials.split('|')
            : ['', ''];

        return (
            <div
                key={sectionKey}
                ref={(el) => {
                    sectionRefs.current[sectionKey] = el;
                }}
                className="my-4 rounded-lg border border-primary/30 bg-primary/10 p-3"
            >
                <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground">
                            Section {index + 1} - Client Initials Required:
                        </span>
                    </div>

                    {initials ? (
                        <div
                            className={`flex h-12 w-20 items-center justify-center rounded border-2 border-primary bg-primary/20 text-lg text-primary ${fontClass}`}
                        >
                            {initialsText}
                            <Check className="ml-1 h-3 w-3 text-green-500" />
                        </div>
                    ) : isActive ? (
                        <div className="min-w-[200px] rounded border-2 border-primary bg-background p-3">
                            <Input
                                value={tempInitials}
                                onChange={(e) =>
                                    setTempInitials(
                                        e.target.value.toUpperCase(),
                                    )
                                }
                                className="mb-2 text-center text-lg"
                                placeholder="Initials"
                                autoFocus
                                maxLength={4}
                            />
                            {!fontLocked && (
                                <div className="mb-2 grid grid-cols-2 gap-1">
                                    {CURSIVE_FONTS.map((font) => (
                                        <button
                                            key={font.name}
                                            onClick={() =>
                                                setSelectedFont(font)
                                            }
                                            className={`rounded border p-2 text-sm ${font.className} ${
                                                selectedFont.name === font.name
                                                    ? 'border-primary bg-primary/10'
                                                    : 'border-border hover:border-primary/50'
                                            }`}
                                        >
                                            {tempInitials || 'AB'}
                                        </button>
                                    ))}
                                </div>
                            )}
                            {fontLocked && (
                                <div
                                    className={`mb-2 text-center text-2xl ${selectedFont.className}`}
                                >
                                    {tempInitials || 'AB'}
                                </div>
                            )}
                            <Button
                                size="sm"
                                onClick={handleConfirmInitials}
                                className="w-full"
                                disabled={!tempInitials.trim()}
                            >
                                <Check className="mr-1 h-4 w-4" /> Confirm
                                Initials
                            </Button>
                        </div>
                    ) : (
                        <button
                            onClick={() => handleInitialClick(sectionKey)}
                            className="flex h-12 w-20 cursor-pointer items-center justify-center rounded border-2 border-dashed border-primary/50 text-xs text-primary/70 transition-colors hover:border-primary hover:bg-primary/5"
                        >
                            <PenLine className="mr-1 h-4 w-4" />
                            Initial
                        </button>
                    )}
                </div>
            </div>
        );
    };

    // Render the agreement content with initials boxes injected
    const renderAgreementContent = () => {
        const INITIALS_MARKER = /\{\{CLIENT_INITIALS\}\}/gi;
        const parts = agreementContent.split(INITIALS_MARKER);
        const initialsCount = parts.length - 1;

        return (
            <div className="agreement-content prose max-w-none [&_br]:block [&_h1]:mt-6 [&_h1]:mb-3 [&_h1]:text-2xl [&_h1]:font-bold [&_h2]:mt-5 [&_h2]:mb-2 [&_h2]:text-lg [&_h2]:font-semibold [&_h3]:mt-4 [&_h3]:mb-2 [&_hr]:my-6 [&_hr]:border-border [&_p]:my-2 [&_p:empty]:min-h-[1.6em] [&_strong]:font-semibold">
                {parts.map((part, index) => (
                    <div key={index}>
                        <div
                            dangerouslySetInnerHTML={{
                                __html: DOMPurify.sanitize(part),
                            }}
                            className="prose-content"
                        />
                        {index < initialsCount &&
                            renderInitialsBox(sectionKeys[index], index)}
                    </div>
                ))}
            </div>
        );
    };

    // Calculate if signature button should be enabled
    const canSign =
        progress.allInitialsComplete &&
        hasAgreed &&
        signatureName.trim().length >= 2;

    return (
        <div className="space-y-6">
            {/* Progress Indicator */}
            <div className="flex items-center justify-between rounded-lg bg-muted/50 p-4">
                <div className="flex items-center gap-3">
                    {progress.allInitialsComplete ? (
                        <CheckCircle className="h-5 w-5 text-green-500" />
                    ) : (
                        <AlertCircle className="h-5 w-5 text-primary" />
                    )}
                    <span className="text-sm font-medium">
                        {progress.progressText}
                    </span>
                </div>

                {!activeSection &&
                    !showSignatureSection &&
                    sectionKeys.length > 0 && (
                        <Button onClick={handleStartSigning} size="sm">
                            <PenLine className="mr-2 h-4 w-4" />
                            Start Signing
                        </Button>
                    )}
            </div>

            {/* Agreement Content */}
            <div className="max-h-[600px] overflow-y-auto rounded-lg border border-border bg-background/50 p-6 text-sm leading-relaxed">
                {renderAgreementContent()}

                {/* Signature Section */}
                <div
                    ref={signatureRef}
                    className={`mt-8 border-t-2 border-primary pt-8 transition-opacity duration-300 ${
                        showSignatureSection || progress.allInitialsComplete
                            ? 'opacity-100'
                            : 'opacity-50'
                    }`}
                >
                    <h2 className="font-display mb-6 text-center text-lg font-bold text-foreground">
                        ELECTRONIC SIGNATURE
                    </h2>

                    {progress.allInitialsComplete ? (
                        <div className="mx-auto max-w-md space-y-6">
                            {/* eSign Acceptance Checkbox */}
                            <div className="flex items-start space-x-3 rounded-lg bg-muted/50 p-4">
                                <Checkbox
                                    id="esign-agreement"
                                    checked={hasAgreed}
                                    onCheckedChange={(checked) =>
                                        setHasAgreed(checked === true)
                                    }
                                    className="mt-0.5"
                                />
                                <label
                                    htmlFor="esign-agreement"
                                    className="cursor-pointer text-sm leading-relaxed"
                                >
                                    I agree that my electronic signature is the
                                    legal equivalent of my manual signature on
                                    this agreement. By checking this box and
                                    typing my name below, I am signing this
                                    Master Services Agreement.
                                </label>
                            </div>

                            {/* Signature Name Input */}
                            <div className="space-y-2">
                                <label className="text-sm font-medium">
                                    Type your full legal name to sign:
                                </label>
                                <Input
                                    value={signatureName}
                                    onChange={(e) =>
                                        setSignatureName(e.target.value)
                                    }
                                    placeholder="Full Legal Name"
                                    className="text-center text-lg"
                                />

                                {/* Signature Preview */}
                                {signatureName && (
                                    <div className="border-b-2 border-foreground/30 py-4 text-center">
                                        <span
                                            className={`text-3xl ${selectedFont.className}`}
                                        >
                                            {signatureName}
                                        </span>
                                    </div>
                                )}
                            </div>

                            {/* Sign Button */}
                            <Button
                                onClick={handleSignAgreement}
                                disabled={!canSign}
                                className="w-full"
                                size="lg"
                            >
                                <PenLine className="mr-2 h-5 w-5" />
                                Sign Agreement
                            </Button>
                        </div>
                    ) : (
                        <div className="py-8 text-center text-muted-foreground">
                            <AlertCircle className="mx-auto mb-3 h-8 w-8 text-muted-foreground/50" />
                            <p>
                                Please complete all required initials above to
                                unlock the signature section.
                            </p>
                            <p className="mt-2 text-sm">
                                {progress.completedInitials} of{' '}
                                {progress.requiredInitials} sections complete
                            </p>
                        </div>
                    )}
                </div>
            </div>

            {/* Navigation Buttons */}
            {showBackButton && onBack && (
                <div className="flex justify-start">
                    <Button variant="outline" onClick={onBack}>
                        Back
                    </Button>
                </div>
            )}
        </div>
    );
}

export default AgreementSigningFlow;
