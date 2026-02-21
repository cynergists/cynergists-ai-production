import cynergistsLogo from '@/assets/Ryan_s_Assets.webp';
import { Link } from '@inertiajs/react';
import {
    Facebook,
    Instagram,
    Linkedin,
    Mail,
    MapPin,
    Phone,
    Youtube,
} from 'lucide-react';

// Custom TikTok icon since Lucide doesn't have one
const TikTokIcon = ({ className }: { className?: string }) => (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
        <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" />
    </svg>
);

const Footer = () => {
    const quickLinks = [
        { label: 'Careers', href: '/careers' },
        { label: 'Partners', href: '/signup/partner' },
        { label: 'About', href: '/about' },
        { label: 'Contact', href: '/contact' },
    ];

    const resources = [
        { label: 'Blog', href: '/blog' },
        { label: 'Podcasts', href: '/podcasts' },
        { label: 'Case Studies', href: '/case-studies' },
    ];

    const socialLinks = [
        {
            icon: Linkedin,
            href: 'https://www.linkedin.com/company/cynergists/',
            label: 'LinkedIn',
        },
        {
            icon: Facebook,
            href: 'https://www.facebook.com/cynergists',
            label: 'Facebook',
        },
        {
            icon: Instagram,
            href: 'https://www.instagram.com/cynergists/',
            label: 'Instagram',
        },
        {
            icon: Youtube,
            href: 'https://www.youtube.com/@Cynergists',
            label: 'YouTube',
        },
        {
            icon: TikTokIcon,
            href: 'https://www.tiktok.com/@_cynergists',
            label: 'TikTok',
        },
    ];

    return (
        <footer className="border-t border-border bg-card/50">
            <div className="container mx-auto px-4 py-16">
                <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
                    {/* Brand */}
                    <div className="lg:col-span-2">
                        <Link href="/" className="mb-6 flex items-center">
                            <img
                                src={cynergistsLogo}
                                alt="Cynergists"
                                className="logo-glow h-44 w-auto"
                            />
                        </Link>
                        <div className="flex gap-4">
                            {socialLinks.map((social) => (
                                <a
                                    key={social.label}
                                    href={social.href}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex h-10 w-10 items-center justify-center rounded-full bg-muted text-muted-foreground transition-all duration-300 hover:bg-primary hover:text-primary-foreground"
                                    aria-label={social.label}
                                >
                                    <social.icon className="h-5 w-5" />
                                </a>
                            ))}
                        </div>
                    </div>

                    {/* Media */}
                    <div>
                        <h4 className="font-display mb-4 font-semibold text-foreground">
                            Media
                        </h4>
                        <ul className="space-y-3">
                            {resources.map((link) => (
                                <li key={link.href}>
                                    <Link
                                        href={link.href}
                                        className="text-muted-foreground transition-colors hover:text-primary"
                                    >
                                        {link.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h4 className="font-display mb-4 font-semibold text-foreground">
                            Quick Links
                        </h4>
                        <ul className="space-y-3">
                            {quickLinks.map((link) => (
                                <li key={link.href}>
                                    <Link
                                        href={link.href}
                                        className="text-muted-foreground transition-colors hover:text-primary"
                                    >
                                        {link.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>

                {/* Contact Info */}
                <div className="mt-12 border-t border-border pt-8">
                    <div className="flex flex-col items-center gap-4 text-center">
                        <div className="flex flex-wrap justify-center gap-6 text-muted-foreground">
                            <a
                                href="mailto:hello@cynergists.com"
                                className="flex items-center gap-2 transition-colors hover:text-primary"
                            >
                                <Mail className="h-4 w-4" />
                                hello@cynergists.com
                            </a>
                            <a
                                href="tel:+18888062088"
                                className="flex items-center gap-2 transition-colors hover:text-primary"
                            >
                                <Phone className="h-4 w-4" />
                                (888) 806-2088
                            </a>
                            <span className="flex items-center gap-2">
                                <MapPin className="h-4 w-4" />
                                Remote-First Company
                            </span>
                        </div>
                        <p className="flex flex-wrap justify-center gap-1 text-sm text-muted-foreground">
                            <span>
                                © {new Date().getFullYear()} Cynergists. All
                                rights reserved.
                            </span>
                            <span>|</span>
                            <Link
                                href="/terms"
                                className="transition-colors hover:text-primary"
                            >
                                Terms & Conditions
                            </Link>
                            <span>|</span>
                            <Link
                                href="/privacy"
                                className="transition-colors hover:text-primary"
                            >
                                Privacy Policy
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
