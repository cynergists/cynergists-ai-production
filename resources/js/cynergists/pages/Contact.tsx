import { useState } from "react";
import { Helmet } from "react-helmet";
import Layout from "@/components/layout/Layout";
import { OrbitingButton } from "@/components/ui/orbiting-button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Mail, Phone, MapPin, Zap, Loader2, CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const contactInfo = [
  {
    icon: Phone,
    label: "The Bat Phone",
    value: "(888) 806-2088",
    href: "tel:+18888062088",
  },
  {
    icon: Mail,
    label: "Secure Uplink",
    value: "hello@cynergists.com",
    href: "mailto:hello@cynergists.com",
  },
  {
    icon: MapPin,
    label: "Base of Operations",
    value: "Remote-First Company",
    href: null,
  },
];

const faqItems = [
  {
    question: "How fast can you deploy?",
    answer: "Unlike a government agency, we move fast. We can typically have candidates ready for your review within days.",
  },
  {
    question: "What is the best way to get started?",
    answer: "Schedule a strategy call with us. We will review your current operations, identify where execution is breaking down, and determine whether Cynergists is the right fit for your team.",
  },
  {
    question: "How do I know which plan is right for me?",
    answer: "Start with our hours calculator on the pricing page, or book a call and we will help you assess your needs. Most clients start with the Emerge plan and scale up as their operations grow.",
  },
  {
    question: "Can I change my plan later?",
    answer: "Absolutely. Our plans are designed to flex with your business. You can upgrade, downgrade, or adjust your hours as your needs evolve.",
  },
  {
    question: "What if I only need help with one specific project?",
    answer: "We offer hourly specialist support for focused projects. If you need ongoing operational support, our monthly plans provide better value and consistency.",
  },
  {
    question: "Do you work with businesses outside the US?",
    answer: "Yes. We are a remote-first company and work with clients across multiple time zones. Our team is structured to provide responsive support regardless of location.",
  },
];

const Contact = () => {
  const { toast } = useToast();
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    company: "",
    message: "",
    missionAI: false,
    missionOps: false,
    missionInquiry: false,
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: value }));
  };

  const handleCheckboxChange = (field: string, checked: boolean) => {
    setFormData(prev => ({ ...prev, [field]: checked }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim() || !formData.email.trim()) {
      toast({
        title: "Required Fields",
        description: "Please enter your name and email.",
        variant: "destructive",
      });
      return;
    }

    setSubmitting(true);

    try {
      // Build services string from checkboxes
      const services = [
        formData.missionAI && "AI Agents",
        formData.missionOps && "Operations Automation",
        formData.missionInquiry && "General Inquiry",
      ].filter(Boolean).join(", ");

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/submit-contact-form`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "apikey": import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
          },
          body: JSON.stringify({
            name: formData.name.trim(),
            email: formData.email.trim(),
            company: formData.company.trim() || null,
            message: formData.message.trim() || null,
            services: services || null,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to submit form");
      }

      setSubmitted(true);
      toast({
        title: "Message Sent!",
        description: "We'll be in touch soon.",
      });

      // Reset form
      setFormData({
        name: "",
        email: "",
        company: "",
        message: "",
        missionAI: false,
        missionOps: false,
        missionInquiry: false,
      });
    } catch (error) {
      console.error("Form submission error:", error);
      toast({
        title: "Submission Failed",
        description: "Please try again or contact us directly.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Layout>
      <Helmet>
        <title>Contact Cynergists | Ready to Light the Signal?</title>
        <meta name="description" content="Contact Cynergists Command to deploy your AI agent team. Get AI automation, workflow support, or strategic intel. Your cavalry is standing by." />
        <link rel="canonical" href="https://cynergists.com/contact" />
        <meta property="og:title" content="Contact Cynergists | Ready to Light the Signal?" />
        <meta property="og:description" content="Contact Cynergists Command to deploy your AI agent team. Get AI automation, workflow support, or strategic intel. Your cavalry is standing by." />
        <meta property="og:url" content="https://cynergists.com/contact" />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Contact Cynergists | Ready to Light the Signal?" />
        <meta name="twitter:description" content="Contact Cynergists Command to deploy your AI agent team. Get AI automation, workflow support, or strategic intel." />
      </Helmet>

      {/* Hero Section */}
      <section className="py-20 lg:py-32 gradient-hero relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 left-0 w-80 h-80 bg-secondary/10 rounded-full blur-3xl" />
        </div>
        
        <div className="container mx-auto px-4 relative z-10 text-center">
          <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/30 rounded-full px-4 py-2 mb-6">
            <Zap className="h-4 w-4 text-primary" />
            <span className="text-sm text-primary font-medium">Contact Headquarters</span>
          </div>
          <h1 className="font-display text-4xl md:text-5xl font-bold text-foreground mb-6">
            Ready to <span className="text-gradient">Light the Signal</span>?
          </h1>
          <h2 className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto mb-6">
            Your Team of <span className="text-gradient">Heroes</span> is Standing By.
          </h2>
          <p className="max-w-2xl mx-auto text-muted-foreground">
            You've fought the good fight alone for long enough. The villains of chaos, burnout, and inefficiency have had their day. Now it's time to call in the cavalry.
          </p>
        </div>
      </section>

      {/* Contact Form & Info Section */}
      <section className="py-24">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-start">
            {/* Left Column - Direct Lines + Form */}
            <div className="contents lg:block lg:space-y-8">
              {/* Direct Lines Section */}
              <div className="card-glass order-1">
                <h2 className="font-display text-2xl font-bold text-foreground mb-2">
                  Direct Lines <span className="text-gradient">to HQ</span>
                </h2>
                <p className="text-muted-foreground mb-6">
                  Don't want to wait for a digital transmission? Use our direct lines.
                </p>
                
                <div className="space-y-4">
                  {contactInfo.map((info) => (
                    <div key={info.label} className="flex items-center gap-4 p-4 rounded-lg bg-muted/30 border border-border/50">
                      <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <info.icon className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <div className="text-sm text-muted-foreground">{info.label}</div>
                        {info.href ? (
                          <a
                            href={info.href}
                            className="text-foreground hover:text-primary transition-colors font-medium"
                          >
                            {info.value}
                          </a>
                        ) : (
                          <div className="text-foreground font-medium">{info.value}</div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Mission Briefing Form */}
              <div className="order-3 lg:order-none card-glass">
                <h2 className="font-display text-2xl font-bold text-foreground mb-2">
                  Send Us Your <span className="text-gradient">Mission Briefing</span>
                </h2>
                <p className="text-muted-foreground mb-6">
                  Tell us where you need reinforcements, and we will deploy the right solution.
                </p>
                
                {submitted ? (
                  <div className="text-center py-12">
                    <CheckCircle className="h-16 w-16 text-primary mx-auto mb-4" />
                    <h3 className="font-display text-2xl font-bold text-foreground mb-2">
                      Mission Received!
                    </h3>
                    <p className="text-muted-foreground mb-6">
                      Our team is reviewing your briefing. We'll be in touch soon.
                    </p>
                    <button
                      type="button"
                      onClick={() => setSubmitted(false)}
                      className="text-primary hover:underline"
                    >
                      Send another message
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-2">
                      <Label htmlFor="name">Name (Code Name) *</Label>
                      <Input
                        id="name"
                        placeholder="Your name"
                        className="bg-muted/50 border-border"
                        value={formData.name}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="email">Email (Secure Comms Channel) *</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="you@company.com"
                        className="bg-muted/50 border-border"
                        value={formData.email}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="company">Company (Your Alliance)</Label>
                      <Input
                        id="company"
                        placeholder="Your company name"
                        className="bg-muted/50 border-border"
                        value={formData.company}
                        onChange={handleInputChange}
                      />
                    </div>
                    
                    <div className="space-y-3">
                      <Label>What is Your Current Mission? (How can we help?)</Label>
                      <div className="space-y-3">
                        <div className="flex items-center space-x-3">
                          <Checkbox 
                            id="mission-ai" 
                            checked={formData.missionAI}
                            onCheckedChange={(checked) => handleCheckboxChange("missionAI", !!checked)}
                          />
                          <label htmlFor="mission-ai" className="text-sm text-foreground cursor-pointer">
                            I need AI Agents for my business
                          </label>
                        </div>
                        <div className="flex items-center space-x-3">
                          <Checkbox 
                            id="mission-ops" 
                            checked={formData.missionOps}
                            onCheckedChange={(checked) => handleCheckboxChange("missionOps", !!checked)}
                          />
                          <label htmlFor="mission-ops" className="text-sm text-foreground cursor-pointer">
                            I need workflow automation
                          </label>
                        </div>
                        <div className="flex items-center space-x-3">
                          <Checkbox 
                            id="mission-inquiry" 
                            checked={formData.missionInquiry}
                            onCheckedChange={(checked) => handleCheckboxChange("missionInquiry", !!checked)}
                          />
                          <label htmlFor="mission-inquiry" className="text-sm text-foreground cursor-pointer">
                            I have a general inquiry (Intel Gathering)
                          </label>
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="message">The Briefing (Message)</Label>
                      <p className="text-sm text-muted-foreground">
                        Tell us about the bottlenecks, the villains you're facing, or the goals you want to crush.
                      </p>
                      <Textarea
                        id="message"
                        placeholder="Describe your mission..."
                        rows={5}
                        className="bg-muted/50 border-border resize-none"
                        value={formData.message}
                        onChange={handleInputChange}
                      />
                    </div>
                    
                    <OrbitingButton 
                      type="submit" 
                      className="btn-primary w-full"
                      disabled={submitting}
                    >
                      {submitting ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Transmitting...
                        </>
                      ) : (
                        "ACTIVATE THE TEAM"
                      )}
                    </OrbitingButton>
                  </form>
                )}
              </div>
            </div>

            {/* Right Column - Calendar Only */}
            <div className="order-2">
              <div className="card-glass overflow-hidden">
                <h2 className="font-display text-2xl font-bold text-foreground mb-4 p-6 pb-0">
                  Schedule a Strategy Meeting With <span className="text-gradient">Cynergists</span>
                </h2>
                <iframe 
                  src="https://link.cynergists.com/widget/booking/Y9N1l1ah5h94oDzIrfTQ" 
                  style={{ width: '100%', border: 'none', minHeight: '900px' }}
                  id="contact-calendar-embed"
                  title="Schedule a Call with Cynergists"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section - AEO Optimized */}
      <section className="py-24 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-12">
              <span className="text-sm font-medium text-primary uppercase tracking-wider">Public Briefing</span>
              <h2 className="font-display text-3xl font-bold text-foreground mt-2">
                Frequently Asked <span className="text-gradient">Questions</span>
              </h2>
            </div>
            
            <Accordion type="single" collapsible className="space-y-4">
              {faqItems.map((item, index) => (
                <AccordionItem
                  key={index}
                  value={`item-${index}`}
                  className="card-glass px-6"
                >
                  <AccordionTrigger className="text-left text-lg font-semibold hover:no-underline data-[state=open]:text-primary">
                    {item.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-foreground/80 text-base">
                    {item.answer}
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

export default Contact;
