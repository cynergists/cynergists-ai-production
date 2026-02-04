import Layout from '@/components/layout/Layout';
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import { OrbitingButton } from '@/components/ui/orbiting-button';
import { supabase } from '@/integrations/supabase/client';
import { Link } from '@inertiajs/react';
import {
    BookOpen,
    Bot,
    Calendar,
    Clock,
    Megaphone,
    Settings,
    Target,
    User,
} from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Helmet } from 'react-helmet';

interface BlogTag {
    id: string;
    name: string;
    slug: string;
}

interface BlogPost {
    id: string;
    slug: string;
    title: string;
    excerpt: string | null;
    author_name: string;
    published_at: string | null;
    read_time: string | null;
    featured_image_url: string | null;
    categories: string[];
}

const briefingTopics = [
    {
        icon: Target,
        title: 'AEO & GEO Protocols',
        description:
            'How to engineer your brand so the AI robots recommend you first.',
    },
    {
        icon: Settings,
        title: 'Operational Blueprints',
        description:
            'The exact systems we use to replace chaos with clockwork.',
    },
    {
        icon: Megaphone,
        title: 'Marketing Intelligence',
        description:
            'Data-driven strategies to amplify your brand and capture market share.',
    },
    {
        icon: Bot,
        title: 'Automation Schematics',
        description:
            'How to use AI Agents to clone your best output without cloning your stress.',
    },
];

const faqs = [
    {
        question: 'What topics does the Cynergists blog cover?',
        answer: 'The Cynergists blog provides expert analysis on AI Agents, Workflow Automation, Digital Marketing, and Business Strategy. It focuses on actionable advice for scaling businesses, optimizing workflows, and leveraging Answer Engine Optimization (AEO).',
    },
    {
        question: 'Who is this content written for?',
        answer: 'This content is engineered for CEOs, Founders, and Business Owners who are scaling national brands or transitioning from "solopreneur" to an executive leadership role. It addresses high-level strategic challenges rather than basic entry-level tips.',
    },
    {
        question: 'How often is new intelligence released?',
        answer: 'We update our Tactical Briefings regularly to reflect the fast-changing landscape of AI search algorithms (Google Gemini, ChatGPT) and operational best practices.',
    },
    {
        question: 'Can I implement these strategies myself?',
        answer: 'Yes. Our articles provide "White Box" transparency, meaning we show you exactly how the strategy works. However, many leaders choose to have Cynergists implement these systems to ensure speed and precision.',
    },
];

const POSTS_PER_PAGE = 6;

const Blog = () => {
    const [tags, setTags] = useState<BlogTag[]>([]);
    const [posts, setPosts] = useState<BlogPost[]>([]);
    const [selectedTag, setSelectedTag] = useState<string>('All');
    const [visibleCount, setVisibleCount] = useState(POSTS_PER_PAGE);
    const [isLoading, setIsLoading] = useState(false);
    const [isLoadingPosts, setIsLoadingPosts] = useState(true);
    const loadMoreRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const fetchData = async () => {
            // Fetch tags
            const { data: tagsData } = await supabase
                .from('blog_tags')
                .select('id, name, slug')
                .order('display_order', { ascending: true });

            if (tagsData) {
                setTags(tagsData);
            }

            // Fetch published posts with their tags
            const { data: postsData } = await supabase
                .from('blog_posts')
                .select(
                    `
          id,
          slug,
          title,
          excerpt,
          author_name,
          published_at,
          read_time,
          featured_image_url,
          blog_post_tags (
            blog_tags (
              name
            )
          )
        `,
                )
                .eq('status', 'published')
                .order('published_at', { ascending: false });

            if (postsData) {
                const formattedPosts: BlogPost[] = postsData.map(
                    (post: any) => ({
                        id: post.id,
                        slug: post.slug,
                        title: post.title,
                        excerpt: post.excerpt,
                        author_name: post.author_name,
                        published_at: post.published_at,
                        read_time: post.read_time,
                        featured_image_url: post.featured_image_url,
                        categories:
                            post.blog_post_tags
                                ?.map((pt: any) => pt.blog_tags?.name)
                                .filter(Boolean) || [],
                    }),
                );
                setPosts(formattedPosts);
            }
            setIsLoadingPosts(false);
        };
        fetchData();
    }, []);

    const categories = ['All', ...tags.map((tag) => tag.name)];

    const filteredPosts =
        selectedTag === 'All'
            ? posts
            : posts.filter((post) => post.categories.includes(selectedTag));

    const visiblePosts = filteredPosts.slice(0, visibleCount);
    const hasMore = visibleCount < filteredPosts.length;

    const loadMore = useCallback(() => {
        if (isLoading || !hasMore) return;
        setIsLoading(true);
        // Simulate loading delay for smoother UX
        setTimeout(() => {
            setVisibleCount((prev) =>
                Math.min(prev + POSTS_PER_PAGE, filteredPosts.length),
            );
            setIsLoading(false);
        }, 300);
    }, [isLoading, hasMore, filteredPosts.length]);

    // Reset visible count when filter changes
    useEffect(() => {
        setVisibleCount(POSTS_PER_PAGE);
    }, [selectedTag]);

    // Intersection Observer for infinite scroll
    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting && hasMore && !isLoading) {
                    loadMore();
                }
            },
            { threshold: 0.1 },
        );

        if (loadMoreRef.current) {
            observer.observe(loadMoreRef.current);
        }

        return () => observer.disconnect();
    }, [hasMore, isLoading, loadMore]);

    return (
        <Layout>
            <Helmet>
                <title>
                    Tactical Briefing Room | Cynergists - Business Intelligence
                    for Scaling Brands
                </title>
                <meta
                    name="description"
                    content="Access classified intel on AI Agents, Workflow Automation, Digital Marketing, and AEO strategies. Battle-tested doctrine for CEOs and Founders scaling national brands."
                />
                <link rel="canonical" href="https://cynergists.ai/blog" />
                <meta
                    property="og:title"
                    content="Tactical Briefing Room | Cynergists - Business Intelligence for Scaling Brands"
                />
                <meta
                    property="og:description"
                    content="Access classified intel on AI Agents, Workflow Automation, Digital Marketing, and AEO strategies. Battle-tested doctrine for scaling national brands."
                />
                <meta property="og:url" content="https://cynergists.ai/blog" />
                <meta property="og:type" content="website" />
                <meta name="twitter:card" content="summary_large_image" />
                <meta
                    name="twitter:title"
                    content="Tactical Briefing Room | Cynergists - Business Intelligence for Scaling Brands"
                />
                <meta
                    name="twitter:description"
                    content="Access classified intel on AI Agents, Workflow Automation, Digital Marketing, and AEO strategies."
                />
            </Helmet>

            {/* Hero Section */}
            <section className="gradient-hero relative overflow-hidden py-20 lg:py-32">
                <div className="absolute inset-0">
                    <div className="absolute top-1/3 left-1/4 h-96 w-96 rounded-full bg-primary/10 blur-3xl" />
                    <div className="absolute right-0 bottom-1/4 h-80 w-80 rounded-full bg-secondary/10 blur-3xl" />
                </div>

                <div className="relative z-10 container mx-auto px-4">
                    <div className="mx-auto max-w-4xl text-center">
                        <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-2">
                            <BookOpen className="h-4 w-4 text-primary" />
                            <span className="text-sm font-medium text-primary">
                                Blog
                            </span>
                        </div>

                        <h1 className="font-display mb-6 text-4xl leading-tight font-bold text-foreground md:text-5xl lg:text-6xl">
                            Stop Following{' '}
                            <span className="text-gradient">Bad Intel</span>
                        </h1>

                        <p className="mx-auto mb-8 max-w-2xl text-xl text-foreground/80 md:text-2xl">
                            Clear, battle-tested strategies for operators who
                            want results, not noise.
                        </p>

                        <p className="mx-auto max-w-3xl text-lg text-muted-foreground">
                            The internet is full of advice that wastes time and
                            kills momentum. This is where Cynergists shares
                            real-world intelligence on operations, marketing,
                            automation, and scale—built for leaders who execute,
                            not chase trends.
                        </p>
                    </div>
                </div>
            </section>

            {/* Categories */}
            <section className="border-b border-border py-8">
                <div className="container mx-auto px-4">
                    <div className="flex flex-wrap justify-center gap-3">
                        {categories.map((category) => (
                            <button
                                key={category}
                                onClick={() => setSelectedTag(category)}
                                className={`rounded-full px-4 py-2 text-sm font-medium transition-all ${
                                    category === selectedTag
                                        ? 'bg-primary text-primary-foreground'
                                        : 'bg-muted text-muted-foreground hover:bg-muted/80'
                                }`}
                            >
                                {category}
                            </button>
                        ))}
                    </div>
                </div>
            </section>

            {/* Blog Grid */}
            <section className="py-24">
                <div className="container mx-auto px-4">
                    {isLoadingPosts ? (
                        <div className="col-span-full py-12 text-center">
                            <p className="text-muted-foreground">
                                Loading articles...
                            </p>
                        </div>
                    ) : visiblePosts.length === 0 ? (
                        <div className="col-span-full py-12 text-center">
                            <p className="text-muted-foreground">
                                No articles found.
                            </p>
                        </div>
                    ) : (
                        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                            {visiblePosts.map((post, index) => {
                                const primaryCategory =
                                    post.categories[0] || 'Uncategorized';
                                const formattedDate = post.published_at
                                    ? new Date(
                                          post.published_at,
                                      ).toLocaleDateString('en-US', {
                                          month: 'short',
                                          day: 'numeric',
                                          year: 'numeric',
                                      })
                                    : '';

                                return (
                                    <Link
                                        href={`/blog/${post.slug}`}
                                        key={post.id}
                                    >
                                        <article
                                            className="card-glass group h-full cursor-pointer"
                                            style={{
                                                animationDelay: `${index * 0.1}s`,
                                            }}
                                        >
                                            {/* Image */}
                                            {post.featured_image_url ? (
                                                <div className="mb-6 aspect-video overflow-hidden rounded-lg">
                                                    <img
                                                        src={
                                                            post.featured_image_url
                                                        }
                                                        alt={post.title}
                                                        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                                                    />
                                                </div>
                                            ) : (
                                                <div className="mb-6 flex aspect-video items-center justify-center rounded-lg bg-gradient-to-br from-primary/10 to-secondary/10 transition-all group-hover:from-primary/20 group-hover:to-secondary/20">
                                                    <span className="font-display text-sm text-muted-foreground">
                                                        {primaryCategory}
                                                    </span>
                                                </div>
                                            )}

                                            {/* Category */}
                                            <span className="mb-3 inline-block rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                                                {primaryCategory}
                                            </span>

                                            {/* Title */}
                                            <h3 className="font-display mb-3 text-lg font-bold text-foreground transition-colors group-hover:text-primary">
                                                {post.title}
                                            </h3>

                                            {/* Excerpt */}
                                            <p className="mb-4 line-clamp-2 text-sm text-muted-foreground">
                                                {post.excerpt}
                                            </p>

                                            {/* Meta */}
                                            <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                                <span className="flex items-center gap-1">
                                                    <User className="h-3 w-3" />
                                                    {post.author_name}
                                                </span>
                                                {formattedDate && (
                                                    <span className="flex items-center gap-1">
                                                        <Calendar className="h-3 w-3" />
                                                        {formattedDate}
                                                    </span>
                                                )}
                                                {post.read_time && (
                                                    <span className="flex items-center gap-1">
                                                        <Clock className="h-3 w-3" />
                                                        {post.read_time}
                                                    </span>
                                                )}
                                            </div>
                                        </article>
                                    </Link>
                                );
                            })}
                        </div>
                    )}

                    {/* Load More */}
                    {hasMore && (
                        <div ref={loadMoreRef} className="mt-12 text-center">
                            <Button
                                variant="outline"
                                className="btn-outline"
                                onClick={loadMore}
                                disabled={isLoading}
                            >
                                {isLoading
                                    ? 'Loading...'
                                    : 'Load More Articles'}
                            </Button>
                        </div>
                    )}
                </div>
            </section>

            {/* Newsletter CTA */}
            <section className="py-24">
                <div className="container mx-auto px-4">
                    <div className="mx-auto max-w-2xl text-center">
                        <h2 className="font-display mb-4 text-3xl font-bold text-foreground">
                            Stay{' '}
                            <span className="text-gradient">Powered Up</span>
                        </h2>
                        <p className="mb-8 text-muted-foreground">
                            Subscribe to our newsletter for the latest insights,
                            tips, and exclusive content delivered straight to
                            your inbox.
                        </p>
                        <div className="mx-auto flex max-w-md flex-col justify-center gap-4 sm:flex-row">
                            <input
                                type="email"
                                placeholder="Enter your email"
                                className="flex-1 rounded-lg border border-border bg-muted/50 px-4 py-3 text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-primary focus:outline-none"
                            />
                            <OrbitingButton className="btn-primary">
                                Subscribe
                            </OrbitingButton>
                        </div>
                    </div>
                </div>
            </section>

            {/* FAQ Section - AEO Optimized */}
            <section className="bg-card/30 py-24">
                <div className="container mx-auto px-4">
                    <div className="mx-auto max-w-3xl">
                        <div className="mb-12 text-center">
                            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-2">
                                <span className="text-sm font-medium text-primary">
                                    Public Briefing
                                </span>
                            </div>
                            <h2 className="text-3xl font-bold md:text-4xl">
                                Frequently Asked{' '}
                                <span className="text-gradient">Questions</span>
                            </h2>
                        </div>
                        <Accordion
                            type="single"
                            collapsible
                            className="space-y-4"
                        >
                            {faqs.map((faq, index) => (
                                <AccordionItem
                                    key={index}
                                    value={`item-${index}`}
                                    className="card-glass px-6"
                                >
                                    <AccordionTrigger className="text-left text-lg font-semibold hover:no-underline data-[state=open]:text-primary">
                                        {faq.question}
                                    </AccordionTrigger>
                                    <AccordionContent className="text-base text-foreground/80">
                                        {faq.answer}
                                    </AccordionContent>
                                </AccordionItem>
                            ))}
                        </Accordion>
                    </div>
                </div>
            </section>
        </Layout>
    );
};

export default Blog;
