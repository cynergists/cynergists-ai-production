import { useState, useEffect } from "react";
import { Helmet } from "react-helmet";
import Layout from "@/components/layout/Layout";
import { Loader2 } from "lucide-react";
import DOMPurify from "dompurify";

interface DocumentTemplate {
  id: string;
  title: string;
  content: string;
  version: number;
  document_type: string;
  updated_at: string;
  created_at?: string;
}

// Format version as X.Y (e.g., 1 -> 1.0, 10 -> 1.9, 11 -> 2.0)
function formatVersion(version: number): string {
  if (version <= 0) return "1.0";
  const major = Math.floor((version - 1) / 10) + 1;
  const minor = (version - 1) % 10;
  return `${major}.${minor}`;
}

const Privacy = () => {
  const [template, setTemplate] = useState<DocumentTemplate | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPrivacy = async () => {
      try {
        const response = await fetch(
          `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/get-public-document?type=privacy`,
          {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              'apikey': import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
            },
          }
        );

        if (!response.ok) {
          throw new Error('Failed to fetch privacy policy');
        }

        const templateData = await response.json();
        setTemplate(templateData);
      } catch (err) {
        console.error('Error fetching privacy policy:', err);
        setError('Failed to load privacy policy');
      } finally {
        setLoading(false);
      }
    };

    fetchPrivacy();
  }, []);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center bg-background">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </Layout>
    );
  }

  if (error || !template) {
    return (
      <Layout>
        <Helmet>
          <title>Privacy Policy | Cynergists</title>
        </Helmet>
        <div className="min-h-screen flex items-center justify-center bg-background">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-foreground mb-2">Unable to load Privacy Policy</h1>
            <p className="text-muted-foreground">Please try again later.</p>
          </div>
        </div>
      </Layout>
    );
  }

  // Strip leading H1 from content
  const cleanContent = (html: string) => {
    // Remove leading H1 tag and any immediately following paragraph/date info that duplicates header
    return html
      .replace(/^<h1[^>]*>.*?<\/h1>\s*/i, '')
      .replace(/^<p[^>]*>\s*Effective Date:.*?<\/p>\s*/i, '');
  };

  return (
    <Layout>
      <Helmet>
        <title>{template.title} | Cynergists</title>
        <meta name="description" content="Cynergists Privacy Policy and Data Processing Addendum. Learn how we collect, use, process, and protect your personal and business information." />
        <link rel="canonical" href="https://www.cynergists.com/privacy" />
      </Helmet>

      {/* Hero Section */}
      <section className="pt-32 pb-8 bg-background">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">{template.title}</h1>
          </div>
        </div>
      </section>

      {/* Content Section */}
      <section className="pb-16 bg-background">
        <div className="container mx-auto px-4">
          <div 
            className="max-w-4xl mx-auto prose prose-invert prose-sm prose-h2:text-base prose-h2:font-semibold prose-h2:mt-6 prose-h2:mb-1 prose-h3:text-base prose-h3:font-medium prose-p:font-normal prose-p:my-1 prose-headings:text-foreground prose-p:text-foreground/80 prose-li:text-foreground/80 prose-li:font-normal prose-a:text-primary prose-strong:font-normal [&_p:empty]:min-h-[1.6em]"
            dangerouslySetInnerHTML={{
              __html: DOMPurify.sanitize(cleanContent(template.content), {
                ALLOWED_TAGS: ['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'ul', 'ol', 'li', 'a', 'strong', 'em', 'br', 'div', 'span', 'hr'],
                ALLOWED_ATTR: ['href', 'target', 'rel', 'class', 'style'],
              })
            }} 
          />
        </div>
      </section>

      {/* Version Info */}
      <section className="pb-16 bg-background">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center text-muted-foreground space-y-1">
            <p>Version: {formatVersion(template.version)}</p>
            <p>Update: {formatDate(template.updated_at)}</p>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Privacy;
