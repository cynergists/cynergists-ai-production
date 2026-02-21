import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Lightbulb, Loader2 } from 'lucide-react';
import { useState } from 'react';

export function SuggestAgentDialog() {
    const [open, setOpen] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        agentName: '',
        description: '',
        useCase: '',
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);

        try {
            const response = await fetch('/api/public/suggest-agent', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN':
                        document
                            .querySelector('meta[name="csrf-token"]')
                            ?.getAttribute('content') || '',
                },
                body: JSON.stringify(formData),
            });

            if (!response.ok) {
                throw new Error('Failed to submit suggestion');
            }

            setSubmitted(true);
            setTimeout(() => {
                setOpen(false);
                setSubmitted(false);
                setFormData({
                    name: '',
                    email: '',
                    agentName: '',
                    description: '',
                    useCase: '',
                });
            }, 2000);
        } catch (error) {
            console.error('Error submitting agent suggestion:', error);
            alert('Failed to submit suggestion. Please try again.');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button
                    size="lg"
                    className="orbiting-button w-full bg-primary font-semibold text-primary-foreground hover:bg-primary/90"
                >
                    <Lightbulb className="mr-2 h-5 w-5" />
                    Suggest an Agent
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
                <DialogHeader>
                    <DialogTitle className="text-2xl">
                        Suggest an Agent
                    </DialogTitle>
                    <DialogDescription>
                        Have an idea for an AI agent that would help your
                        business? Tell us about it and we'll consider building
                        it.
                    </DialogDescription>
                </DialogHeader>

                {submitted ? (
                    <div className="py-8 text-center">
                        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-lime-500/20">
                            <Lightbulb className="h-8 w-8 text-lime-500" />
                        </div>
                        <h3 className="mb-2 text-xl font-semibold">
                            Thank You!
                        </h3>
                        <p className="text-muted-foreground">
                            We've received your agent suggestion and will review
                            it shortly.
                        </p>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid gap-6 md:grid-cols-2">
                            <div className="space-y-2">
                                <Label htmlFor="name">
                                    Your Name <span className="text-destructive">*</span>
                                </Label>
                                <Input
                                    id="name"
                                    required
                                    value={formData.name}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            name: e.target.value,
                                        })
                                    }
                                    placeholder="John Doe"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="email">
                                    Your Email <span className="text-destructive">*</span>
                                </Label>
                                <Input
                                    id="email"
                                    type="email"
                                    required
                                    value={formData.email}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            email: e.target.value,
                                        })
                                    }
                                    placeholder="john@example.com"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="agentName">
                                Agent Name <span className="text-destructive">*</span>
                            </Label>
                            <Input
                                id="agentName"
                                required
                                value={formData.agentName}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        agentName: e.target.value,
                                    })
                                }
                                placeholder="e.g., Social Media Manager, Customer Support Agent"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="description">
                                What should this agent do? <span className="text-destructive">*</span>
                            </Label>
                            <Textarea
                                id="description"
                                required
                                value={formData.description}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        description: e.target.value,
                                    })
                                }
                                placeholder="Describe the main tasks and capabilities this agent should have..."
                                rows={4}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="useCase">
                                How would you use this agent?
                            </Label>
                            <Textarea
                                id="useCase"
                                value={formData.useCase}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        useCase: e.target.value,
                                    })
                                }
                                placeholder="Tell us about your specific use case or business need..."
                                rows={3}
                            />
                        </div>

                        <div className="flex justify-end gap-3">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setOpen(false)}
                                disabled={submitting}
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                disabled={submitting}
                                className="bg-lime-500 text-black hover:bg-lime-600"
                            >
                                {submitting ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Submitting...
                                    </>
                                ) : (
                                    'Submit Suggestion'
                                )}
                            </Button>
                        </div>
                    </form>
                )}
            </DialogContent>
        </Dialog>
    );
}
