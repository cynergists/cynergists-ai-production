import { Button } from '@/components/ui/button';
import { OrbitingButton } from '@/components/ui/orbiting-button';
import { useAddToCartWithToast } from '@/hooks/useAddToCartWithToast';
import { Link } from '@inertiajs/react';
import { ArrowRight, Check, ShoppingCart } from 'lucide-react';
import type { ReactNode } from 'react';

interface ProductDetailLayoutProps {
    // Product Info
    id: string;
    name: string;
    category?: string;
    categoryIcon?: ReactNode;
    shortDescription: string;
    price: number;
    billingPeriod?: 'monthly' | 'annual' | 'one_time';
    imageUrl?: string;

    // Content sections
    features?: string[];
    whosItFor?: string;
    integrations?: string[];

    // CTAs
    primaryCtaText?: string;
    secondaryCtaText?: string;
    secondaryCtaLink?: string;

    // Custom content sections rendered after main layout
    children?: ReactNode;
}

const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(price);
};

export const ProductDetailLayout = ({
    id,
    name,
    category,
    categoryIcon,
    shortDescription,
    price,
    billingPeriod = 'monthly',
    imageUrl,
    features = [],
    whosItFor,
    integrations = [],
    primaryCtaText = 'Add to Cart',
    secondaryCtaText = 'Schedule a Call',
    secondaryCtaLink = '/schedule',
    children,
}: ProductDetailLayoutProps) => {
    const { addToCart } = useAddToCartWithToast();

    const handleAddToCart = () => {
        addToCart({
            id,
            type: 'plan',
            name,
            description: shortDescription,
            price,
            billingPeriod:
                billingPeriod === 'one_time' ? undefined : billingPeriod,
        });
    };

    return (
        <>
            {/* Hero Section - Image Left, Details Right */}
            <section className="gradient-hero py-20 lg:py-32">
                <div className="container mx-auto px-4">
                    <div className="mx-auto grid max-w-6xl items-center gap-12 lg:grid-cols-2">
                        {/* Left - Image/Visual */}
                        <div className="order-2 lg:order-1">
                            {imageUrl ? (
                                <div className="relative aspect-video overflow-hidden rounded-2xl border border-border/50 shadow-2xl">
                                    <img
                                        src={imageUrl}
                                        alt={name}
                                        className="h-full w-full object-cover"
                                    />
                                </div>
                            ) : (
                                <div className="relative flex aspect-video items-center justify-center overflow-hidden rounded-2xl border border-border/50 bg-card/50 shadow-2xl">
                                    <div className="p-8 text-center">
                                        {categoryIcon && (
                                            <div className="mx-auto mb-4 inline-block rounded-2xl border border-primary/30 bg-primary/10 p-6">
                                                {categoryIcon}
                                            </div>
                                        )}
                                        <h3 className="text-2xl font-bold text-foreground">
                                            {name}
                                        </h3>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Right - Details */}
                        <div className="order-1 lg:order-2">
                            {/* Category Badge */}
                            {category && (
                                <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-2">
                                    {categoryIcon}
                                    <span className="text-sm font-medium text-primary">
                                        {category}
                                    </span>
                                </div>
                            )}

                            {/* Title */}
                            <h1 className="font-display mb-6 text-3xl leading-tight font-bold text-foreground md:text-4xl lg:text-5xl">
                                {name}
                            </h1>

                            {/* Description */}
                            <p className="mb-8 text-lg text-foreground/80 md:text-xl">
                                {shortDescription}
                            </p>

                            {/* Price */}
                            <div className="mb-8">
                                <span className="text-4xl font-bold text-primary">
                                    {price > 0 ? formatPrice(price) : 'Free'}
                                </span>
                                {billingPeriod !== 'one_time' && price > 0 && (
                                    <span className="text-lg text-muted-foreground">
                                        /
                                        {billingPeriod === 'monthly'
                                            ? 'month'
                                            : 'year'}
                                    </span>
                                )}
                            </div>

                            {/* CTAs */}
                            <div className="flex flex-col gap-4 sm:flex-row">
                                <OrbitingButton
                                    className="btn-primary"
                                    onClick={handleAddToCart}
                                >
                                    <ShoppingCart className="mr-2 h-4 w-4" />
                                    {primaryCtaText}
                                </OrbitingButton>
                                <Button asChild variant="outline">
                                    <Link href={secondaryCtaLink}>
                                        {secondaryCtaText}
                                        <ArrowRight className="ml-2 h-4 w-4" />
                                    </Link>
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            {features.length > 0 && (
                <section className="bg-card/30 py-20">
                    <div className="container mx-auto px-4">
                        <div className="mx-auto max-w-4xl">
                            <h2 className="mb-12 text-center text-2xl font-bold md:text-3xl">
                                What's{' '}
                                <span className="text-gradient">Included</span>
                            </h2>
                            <div className="grid gap-4 md:grid-cols-2">
                                {features.map((feature, idx) => (
                                    <div
                                        key={idx}
                                        className="flex items-start gap-3 rounded-xl border border-border/50 bg-background/50 p-4"
                                    >
                                        <Check className="mt-0.5 h-5 w-5 flex-shrink-0 text-primary" />
                                        <span className="text-foreground/80">
                                            {feature}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </section>
            )}

            {/* Who's It For & Integrations Section */}
            {(whosItFor || integrations.length > 0) && (
                <section className="py-20">
                    <div className="container mx-auto px-4">
                        <div className="mx-auto grid max-w-4xl gap-8 md:grid-cols-2">
                            {whosItFor && (
                                <div className="card-glass border-primary">
                                    <h3 className="mb-4 text-xl font-bold text-foreground">
                                        Perfect For
                                    </h3>
                                    <div className="space-y-3">
                                        {whosItFor
                                            .split('\n')
                                            .map((item, idx) => (
                                                <div
                                                    key={idx}
                                                    className="flex items-start gap-3"
                                                >
                                                    <Check className="mt-0.5 h-5 w-5 flex-shrink-0 text-primary" />
                                                    <span className="text-foreground/80">
                                                        {item.replace(
                                                            /^[-•]\s*/,
                                                            '',
                                                        )}
                                                    </span>
                                                </div>
                                            ))}
                                    </div>
                                </div>
                            )}
                            {integrations.length > 0 && (
                                <div className="card-glass">
                                    <h3 className="mb-4 text-xl font-bold text-foreground">
                                        Integrations
                                    </h3>
                                    <div className="space-y-3">
                                        {integrations.map((item, idx) => (
                                            <div
                                                key={idx}
                                                className="flex items-start gap-3"
                                            >
                                                <Check className="mt-0.5 h-5 w-5 flex-shrink-0 text-primary" />
                                                <span className="text-foreground/80">
                                                    {item}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </section>
            )}

            {/* Custom Content */}
            {children}

            {/* Bottom CTA */}
            <section className="bg-card/30 py-20">
                <div className="container mx-auto px-4 text-center">
                    <h2 className="mb-4 text-2xl font-bold text-foreground">
                        Ready to Get Started?
                    </h2>
                    <p className="mx-auto mb-6 max-w-2xl text-muted-foreground">
                        {shortDescription}
                    </p>
                    <div className="flex flex-col justify-center gap-4 sm:flex-row">
                        <OrbitingButton
                            className="btn-primary"
                            onClick={handleAddToCart}
                        >
                            <ShoppingCart className="mr-2 h-4 w-4" />
                            {primaryCtaText}
                        </OrbitingButton>
                        <Button asChild variant="outline">
                            <Link href={secondaryCtaLink}>
                                {secondaryCtaText}
                                <ArrowRight className="ml-2 h-4 w-4" />
                            </Link>
                        </Button>
                    </div>
                </div>
            </section>
        </>
    );
};

export default ProductDetailLayout;
