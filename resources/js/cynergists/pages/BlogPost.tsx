import { Link } from "@inertiajs/react";
import { useEffect, useState } from "react";
import { Helmet } from "react-helmet";
import Layout from "@/components/layout/Layout";
import { supabase } from "@/integrations/supabase/client";
import { ArrowLeft, Calendar, Clock, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { OrbitingButton } from "@/components/ui/orbiting-button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
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
  const [email, setEmail] = useState("");
  const [isSubscribing, setIsSubscribing] = useState(false);

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      toast.error("Please enter your email address");
      return;
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast.error("Please enter a valid email address");
      return;
    }

    setIsSubscribing(true);
    // Simulate subscription - replace with actual API call when ready
    await new Promise(resolve => setTimeout(resolve, 500));
    toast.success("Thanks for subscribing!");
    setEmail("");
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
        .select('id, slug, title, excerpt, content, author_name, published_at, read_time, featured_image_url')
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
        <div className="min-h-screen flex items-center justify-center">
          <p className="text-muted-foreground">Loading article...</p>
        </div>
      </Layout>
    );
  }

  if (notFound || !post) {
    return (
      <Layout>
        <div className="min-h-screen flex flex-col items-center justify-center gap-4">
          <h1 className="text-2xl font-bold text-foreground">Article Not Found</h1>
          <p className="text-muted-foreground">The article you're looking for doesn't exist or has been removed.</p>
          <Link href="/blog">
            <Button variant="outline">
              <ArrowLeft className="h-4 w-4 mr-2" />
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
        year: 'numeric' 
      })
    : "";

  // Simple markdown-like rendering for content
  const renderContent = (content: string) => {
    return content.split('\n\n').map((block, index) => {
      // Headers
      if (block.startsWith('## ')) {
        return <h2 key={index} className="text-2xl font-bold text-foreground mt-10 mb-4">{block.replace('## ', '')}</h2>;
      }
      if (block.startsWith('### ')) {
        return <h3 key={index} className="text-xl font-bold text-foreground mt-8 mb-3">{block.replace('### ', '')}</h3>;
      }
      
      // Blockquotes
      if (block.startsWith('> ')) {
        return (
          <blockquote key={index} className="border-l-4 border-primary pl-4 my-6 italic text-foreground/80">
            {block.replace('> ', '')}
          </blockquote>
        );
      }

      // Lists
      if (block.includes('\n- ')) {
        const items = block.split('\n').filter(line => line.startsWith('- '));
        return (
          <ul key={index} className="list-disc list-inside space-y-2 my-4 text-foreground/80">
            {items.map((item, i) => (
              <li key={i}>{renderInlineStyles(item.replace('- ', ''))}</li>
            ))}
          </ul>
        );
      }

      // Regular paragraphs
      return <p key={index} className="text-foreground/80 leading-relaxed my-4">{renderInlineStyles(block)}</p>;
    });
  };

  // Handle inline styles like **bold** and [links](url)
  const renderInlineStyles = (text: string) => {
    // Handle bold
    let parts = text.split(/\*\*(.*?)\*\*/g);
    return parts.map((part, i) => {
      if (i % 2 === 1) {
        return <strong key={i} className="font-semibold text-foreground">{part}</strong>;
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
          <Link key={`link-${i}-${match.index}`} href={match[2]} className="text-primary hover:underline">
            {match[1]}
          </Link>
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
        <link rel="canonical" href={`https://cynergists.ai/blog/${post.slug}`} />
        <meta property="og:title" content={post.title} />
        <meta property="og:description" content={post.excerpt || ''} />
        <meta property="og:url" content={`https://cynergists.ai/blog/${post.slug}`} />
        <meta property="og:type" content="article" />
        {post.featured_image_url && <meta property="og:image" content={post.featured_image_url} />}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={post.title} />
        <meta name="twitter:description" content={post.excerpt || ''} />
      </Helmet>

      {/* Hero */}
      <section className="py-16 lg:py-24 gradient-hero relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-1/3 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 right-0 w-80 h-80 bg-secondary/10 rounded-full blur-3xl" />
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-3xl mx-auto">
            <Link href="/blog" className="inline-flex items-center text-primary hover:underline mb-6">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Blog
            </Link>

            <h1 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-6 leading-tight">
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
        <div className="container mx-auto px-4 -mt-8 relative z-10">
          <div className="max-w-4xl mx-auto">
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
          <div className="max-w-3xl mx-auto prose-lg">
            {post.content && renderContent(post.content)}
          </div>
        </div>
      </article>

      {/* Newsletter Section */}
      <section className="py-16 bg-card/30">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="font-display text-2xl font-bold text-foreground mb-4">
              Stay Powered Up
            </h2>
            <p className="text-muted-foreground mb-6">
              Subscribe to our newsletter for the latest insights, tips, and exclusive content delivered straight to your inbox.
            </p>
            <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
              <Input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="flex-1"
              />
              <OrbitingButton type="submit" className="btn-primary" disabled={isSubscribing}>
                {isSubscribing ? "Subscribing..." : "Subscribe"}
              </OrbitingButton>
            </form>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default BlogPost;
