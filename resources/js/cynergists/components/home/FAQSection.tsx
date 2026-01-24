import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqs = [
  {
    question: "Do I need superpowers to use AI Agents?",
    answer: "No. You need clear goals and a real workflow. We handle design, deployment, and ongoing tuning. Your team stays in control with defined approvals and guardrails."
  },
  {
    question: "Are these agents pre built or custom?",
    answer: "They are built around your workflows and your tools. Some parts may be reusable patterns, but the deployment is tailored to how your business operates."
  },
  {
    question: "What tools can you connect to?",
    answer: "We connect to the systems you already use, then design the agent role around what is possible and safe inside those systems."
  },
  {
    question: "How do you prevent mistakes or risky actions?",
    answer: "We define permissions, approvals, and escalation rules up front, then monitor performance and refine edge cases over time."
  },
  {
    question: "Who owns the process after launch?",
    answer: "You do. We provide ongoing management and human oversight so the agents remain reliable as your business changes."
  }
];

const FAQSection = () => {
  return (
    <section className="py-24 bg-secondary/10 dark:bg-secondary/20 relative overflow-hidden">
      {/* Decorative lines */}
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-secondary/50 to-transparent" />
      <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-secondary/50 to-transparent" />
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 bg-secondary/20 dark:bg-secondary/30 border border-secondary/40 rounded-full px-4 py-2 mb-6">
              <span className="text-sm text-secondary font-medium">Clearance Level: Public</span>
            </div>
            <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground">
              Frequently Asked <span className="text-gradient">Questions</span>
            </h2>
          </div>
          
          <Accordion type="single" collapsible className="space-y-4">
            {faqs.map((faq, index) => (
              <AccordionItem 
                key={index} 
                value={`item-${index}`}
                className="bg-card dark:bg-card/50 border border-border/50 rounded-xl px-6 shadow-sm"
              >
                <AccordionTrigger className="text-left text-lg font-semibold hover:no-underline data-[state=open]:text-primary">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-foreground/80 text-base">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </section>
  );
};

export default FAQSection;
