import Layout from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { OrbitingButton } from '@/components/ui/orbiting-button';
import { apiClient } from '@/lib/api-client';
import { Link } from '@inertiajs/react';
import { ArrowLeft, Calendar, Clock, User } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet';
import { toast } from 'sonner';
interface BlogPost {
    id: string;
    slug: string;
    title: string;
    excerpt: string | null;
    content: string | null;
    author_name: string;
    published_at: string | null;
    read_time: string | null;
    featured_image_url: string | null;
}

const BlogPost = ({ slug }: { slug: string }) => {
    const [post, setPost] = useState<BlogPost | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [notFound, setNotFound] = useState(false);
    const [email, setEmail] = useState('');
    const [isSubscribing, setIsSubscribing] = useState(false);

    const handleSubscribe = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email.trim()) {
            toast.error('Please enter your email address');
            return;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            toast.error('Please enter a valid email address');
            return;
        }

        setIsSubscribing(true);
        // Simulate subscription - replace with actual API call when ready
        await new Promise((resolve) => setTimeout(resolve, 500));
        toast.success('Thanks for subscribing!');
        setEmail('');
        setIsSubscribing(false);
    };

    useEffect(() => {
        const fetchPost = async () => {
            if (!slug) {
                setNotFound(true);
                setIsLoading(false);
                return;
            }

            const { data, error } = await supabase
                .from('blog_posts')
                .select(
                    'id, slug, title, excerpt, content, author_name, published_at, read_time, featured_image_url',
                )
                .eq('slug', slug)
                .eq('status', 'published')
                .maybeSingle();

            if (error || !data) {
                setNotFound(true);
            } else {
                setPost(data);
            }
            setIsLoading(false);
        };

        fetchPost();
    }, [slug]);

    if (isLoading) {
        return (
            <Layout>
                <div className="flex min-h-screen items-center justify-center">
                    <p className="text-muted-foreground">Loading article...</p>
                </div>
            </Layout>
        );
    }

    if (notFound || !post) {
        return (
            <Layout>
                <div className="flex min-h-screen flex-col items-center justify-center gap-4">
                    <h1 className="text-2xl font-bold text-foreground">
                        Article Not Found
                    </h1>
                    <p className="text-muted-foreground">
                        The article you're looking for doesn't exist or has been
                        removed.
                    </p>
                    <Link href="/blog">
                        <Button variant="outline">
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Back to Blog
                        </Button>
                    </Link>
                </div>
            </Layout>
        );
    }

    const formattedDate = post.published_at
        ? new Date(post.published_at).toLocaleDateString('en-US', {
              month: 'long',
              day: 'numeric',
              year: 'numeric',
          })
        : '';

    // Simple markdown-like rendering for content
    const renderContent = (content: string) => {
        return content.split('\n\n').map((block, index) => {
            // Headers
            if (block.startsWith('## ')) {
                return (
                    <h2
                        key={index}
                        className="mt-10 mb-4 text-2xl font-bold text-foreground"
                    >
                        {block.replace('## ', '')}
                    </h2>
                );
            }
            if (block.startsWith('### ')) {
                return (
                    <h3
                        key={index}
                        className="mt-8 mb-3 text-xl font-bold text-foreground"
                    >
                        {block.replace('### ', '')}
                    </h3>
                );
            }

            // Blockquotes
            if (block.startsWith('> ')) {
                return (
                    <blockquote
                        key={index}
                        className="my-6 border-l-4 border-primary pl-4 text-foreground/80 italic"
                    >
                        {block.replace('> ', '')}
                    </blockquote>
                );
            }

            // Lists
            if (block.includes('\n- ')) {
                const items = block
                    .split('\n')
                    .filter((line) => line.startsWith('- '));
                return (
                    <ul
                        key={index}
                        className="my-4 list-inside list-disc space-y-2 text-foreground/80"
                    >
                        {items.map((item, i) => (
                            <li key={i}>
                                {renderInlineStyles(item.replace('- ', ''))}
                            </li>
                        ))}
                    </ul>
                );
            }

            // Regular paragraphs
            return (
                <p
                    key={index}
                    className="my-4 leading-relaxed text-foreground/80"
                >
                    {renderInlineStyles(block)}
                </p>
            );
        });
    };

    // Handle inline styles like **bold** and [links](url)
    const renderInlineStyles = (text: string) => {
        // Handle bold
        let parts = text.split(/\*\*(.*?)\*\*/g);
        return parts.map((part, i) => {
            if (i % 2 === 1) {
                return (
                    <strong key={i} className="font-semibold text-foreground">
                        {part}
                    </strong>
                );
            }
            // Handle links
            const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
            const segments: React.ReactNode[] = [];
            let lastIndex = 0;
            let match;

            while ((match = linkRegex.exec(part)) !== null) {
                if (match.index > lastIndex) {
                    segments.push(part.slice(lastIndex, match.index));
                }
                segments.push(
                    <Link
                        key={`link-${i}-${match.index}`}
                        href={match[2]}
                        className="text-primary hover:underline"
                    >
                        {match[1]}
                    </Link>,
                );
                lastIndex = match.index + match[0].length;
            }

            if (lastIndex < part.length) {
                segments.push(part.slice(lastIndex));
            }

            return segments.length > 0 ? segments : part;
        });
    };

    return (
        <Layout>
            <Helmet>
                <title>{post.title} | Cynergists Blog</title>
                <meta name="description" content={post.excerpt || ''} />
                <link
                    rel="canonical"
                    href={`https://cynergists.ai/blog/${post.slug}`}
                />
                <meta property="og:title" content={post.title} />
                <meta property="og:description" content={post.excerpt || ''} />
                <meta
                    property="og:url"
                    content={`https://cynergists.ai/blog/${post.slug}`}
                />
                <meta property="og:type" content="article" />
                {post.featured_image_url && (
                    <meta
                        property="og:image"
                        content={post.featured_image_url}
                    />
                )}
                <meta name="twitter:card" content="summary_large_image" />
                <meta name="twitter:title" content={post.title} />
                <meta name="twitter:description" content={post.excerpt || ''} />
            </Helmet>

            {/* Hero */}
            <section className="gradient-hero relative overflow-hidden py-16 lg:py-24">
                <div className="absolute inset-0">
                    <div className="absolute top-1/3 left-1/4 h-96 w-96 rounded-full bg-primary/10 blur-3xl" />
                    <div className="absolute right-0 bottom-1/4 h-80 w-80 rounded-full bg-secondary/10 blur-3xl" />
                </div>

                <div className="relative z-10 container mx-auto px-4">
                    <div className="mx-auto max-w-3xl">
                        <Link
                            href="/blog"
                            className="mb-6 inline-flex items-center text-primary hover:underline"
                        >
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Back to Blog
                        </Link>

                        <h1 className="font-display mb-6 text-3xl leading-tight font-bold text-foreground md:text-4xl lg:text-5xl">
                            {post.title}
                        </h1>

                        <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                            <span className="flex items-center gap-2">
                                <User className="h-4 w-4" />
                                {post.author_name}
                            </span>
                            {formattedDate && (
                                <span className="flex items-center gap-2">
                                    <Calendar className="h-4 w-4" />
                                    {formattedDate}
                                </span>
                            )}
                            {post.read_time && (
                                <span className="flex items-center gap-2">
                                    <Clock className="h-4 w-4" />
                                    {post.read_time}
                                </span>
                            )}
                        </div>
                    </div>
                </div>
            </section>

            {/* Featured Image */}
            {post.featured_image_url && (
                <div className="relative z-10 container mx-auto -mt-8 px-4">
                    <div className="mx-auto max-w-4xl">
                        <img
                            src={post.featured_image_url}
                            alt={post.title}
                            className="w-full rounded-xl shadow-lg"
                        />
                    </div>
                </div>
            )}

            {/* Content */}
            <article className="py-16">
                <div className="container mx-auto px-4">
                    <div className="prose-lg mx-auto max-w-3xl">
                        {post.content && renderContent(post.content)}
                    </div>
                </div>
            </article>

            {/* Newsletter Section */}
            <section className="bg-card/30 py-16">
                <div className="container mx-auto px-4">
                    <div className="mx-auto max-w-2xl text-center">
                        <h2 className="font-display mb-4 text-2xl font-bold text-foreground">
                            Stay Powered Up
                        </h2>
                        <p className="mb-6 text-muted-foreground">
                            Subscribe to our newsletter for the latest insights,
                            tips, and exclusive content delivered straight to
                            your inbox.
                        </p>
                        <form
                            onSubmit={handleSubscribe}
                            className="mx-auto flex max-w-md flex-col gap-3 sm:flex-row"
                        >
                            <Input
                                type="email"
                                placeholder="Enter your email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="flex-1"
                            />
                            <OrbitingButton
                                type="submit"
                                className="btn-primary"
                                disabled={isSubscribing}
                            >
                                {isSubscribing ? 'Subscribing...' : 'Subscribe'}
                            </OrbitingButton>
                        </form>
                    </div>
                </div>
            </section>
        </Layout>
    );
};

export default BlogPost;
