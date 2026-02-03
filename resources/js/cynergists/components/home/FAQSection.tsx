import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from '@/components/ui/accordion';

const faqs = [
    {
        question: 'Do I need superpowers to use AI Agents?',
        answer: 'No. You need clear goals and a real workflow. We handle design, deployment, and ongoing tuning. Your team stays in control with defined approvals and guardrails.',
    },
    {
        question: 'Are these agents pre built or custom?',
        answer: 'They are built around your workflows and your tools. Some parts may be reusable patterns, but the deployment is tailored to how your business operates.',
    },
    {
        question: 'What tools can you connect to?',
        answer: 'We connect to the systems you already use, then design the agent role around what is possible and safe inside those systems.',
    },
    {
        question: 'How do you prevent mistakes or risky actions?',
        answer: 'We define permissions, approvals, and escalation rules up front, then monitor performance and refine edge cases over time.',
    },
    {
        question: 'Who owns the process after launch?',
        answer: 'You do. We provide ongoing management and human oversight so the agents remain reliable as your business changes.',
    },
];

const FAQSection = () => {
    return (
        <section className="relative overflow-hidden bg-secondary/10 py-24 dark:bg-secondary/20">
            {/* Decorative lines */}
            <div className="absolute top-0 left-0 h-1 w-full bg-gradient-to-r from-transparent via-secondary/50 to-transparent" />
            <div className="absolute bottom-0 left-0 h-1 w-full bg-gradient-to-r from-transparent via-secondary/50 to-transparent" />

            <div className="relative z-10 container mx-auto px-4">
                <div className="mx-auto max-w-3xl">
                    <div className="mb-12 text-center">
                        <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-secondary/40 bg-secondary/20 px-4 py-2 dark:bg-secondary/30">
                            <span className="text-sm font-medium text-secondary">
                                Clearance Level: Public
                            </span>
                        </div>
                        <h2 className="font-display text-3xl font-bold text-foreground md:text-4xl">
                            Frequently Asked{' '}
                            <span className="text-gradient">Questions</span>
                        </h2>
                    </div>

                    <Accordion type="single" collapsible className="space-y-4">
                        {faqs.map((faq, index) => (
                            <AccordionItem
                                key={index}
                                value={`item-${index}`}
                                className="rounded-xl border border-border/50 bg-card px-6 shadow-sm dark:bg-card/50"
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
    );
};

export default FAQSection;
