import Layout from '@/components/layout/Layout';
import {
    Calendar,
    CheckCircle,
    Clock,
    FileText,
    MessageSquare,
    Target,
    Video,
} from 'lucide-react';
import { Helmet } from 'react-helmet';

const ScheduleThankYou = () => {
    return (
        <Layout>
            <Helmet>
                <title>Mission Scheduled | Cynergists</title>
                <meta
                    name="description"
                    content="Your strategy call with Cynergists is confirmed. We look forward to the conversation."
                />
                <link
                    rel="canonical"
                    href="https://cynergists.ai/schedule/thank-you"
                />
                <meta name="robots" content="noindex, nofollow" />
            </Helmet>

            {/* Hero */}
            <section className="gradient-hero relative overflow-hidden py-24">
                <div className="absolute inset-0">
                    <div className="absolute top-1/3 left-1/4 h-96 w-96 rounded-full bg-primary/10 blur-3xl" />
                    <div className="absolute right-0 bottom-1/4 h-80 w-80 rounded-full bg-secondary/10 blur-3xl" />
                </div>

                <div className="relative z-10 container mx-auto px-4 text-center">
                    <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-2">
                        <CheckCircle className="h-4 w-4 text-primary" />
                        <span className="text-sm font-medium text-primary">
                            Mission Scheduled
                        </span>
                    </div>
                    <h1 className="font-display mb-6 text-4xl font-bold text-foreground md:text-5xl">
                        Your strategy call is{' '}
                        <span className="text-gradient">confirmed.</span>
                    </h1>
                    <p className="mx-auto max-w-2xl text-xl text-muted-foreground">
                        You are officially on the calendar, and your briefing is
                        locked in. You will receive a confirmation email shortly
                        with the details for your call.
                    </p>
                </div>
            </section>

            {/* What Happens Next */}
            <section className="bg-card/30 py-24">
                <div className="container mx-auto px-4">
                    <div className="mx-auto max-w-3xl">
                        <h2 className="font-display mb-4 text-center text-3xl font-bold text-foreground">
                            What Happens{' '}
                            <span className="text-gradient">Next</span>
                        </h2>

                        <div className="card-glass mb-12 p-8">
                            <p className="mb-2 text-lg font-medium text-foreground">
                                This is not a sales call.
                            </p>
                            <p className="mb-6 text-lg font-medium text-foreground">
                                This is a focused working session.
                            </p>
                            <p className="text-muted-foreground">
                                We will review how your operation is currently
                                structured, where execution is slowing you down,
                                and whether Cynergists is the right support team
                                behind your mission.
                            </p>
                        </div>

                        <div className="mb-12">
                            <h3 className="font-display mb-6 text-xl font-bold text-foreground">
                                Come prepared to talk through:
                            </h3>
                            <div className="space-y-4">
                                <div className="flex items-start gap-4">
                                    <div className="mt-0.5 flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-primary/10">
                                        <Clock className="h-5 w-5 text-primary" />
                                    </div>
                                    <p className="text-lg text-muted-foreground">
                                        What is currently consuming your time
                                    </p>
                                </div>
                                <div className="flex items-start gap-4">
                                    <div className="mt-0.5 flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-primary/10">
                                        <Target className="h-5 w-5 text-primary" />
                                    </div>
                                    <p className="text-lg text-muted-foreground">
                                        Where things feel heavier than they
                                        should
                                    </p>
                                </div>
                                <div className="flex items-start gap-4">
                                    <div className="mt-0.5 flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-primary/10">
                                        <MessageSquare className="h-5 w-5 text-primary" />
                                    </div>
                                    <p className="text-lg text-muted-foreground">
                                        What you want your role to look like
                                        moving forward
                                    </p>
                                </div>
                            </div>
                            <p className="mt-6 text-muted-foreground">
                                We will come prepared to ask the right questions
                                and provide clear perspective.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Before the Call */}
            <section className="py-24">
                <div className="container mx-auto px-4">
                    <div className="mx-auto max-w-3xl">
                        <h2 className="font-display mb-8 text-center text-3xl font-bold text-foreground">
                            Before the{' '}
                            <span className="text-gradient">Call</span>
                        </h2>

                        <div className="grid gap-6 md:grid-cols-3">
                            <div className="card-glass p-6 text-center">
                                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                                    <Calendar className="h-6 w-6 text-primary" />
                                </div>
                                <p className="font-medium text-foreground">
                                    Check your calendar for the invite
                                </p>
                            </div>
                            <div className="card-glass p-6 text-center">
                                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                                    <Video className="h-6 w-6 text-primary" />
                                </div>
                                <p className="font-medium text-foreground">
                                    Join by video or phone, your choice
                                </p>
                            </div>
                            <div className="card-glass p-6 text-center">
                                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                                    <FileText className="h-6 w-6 text-primary" />
                                </div>
                                <p className="font-medium text-foreground">
                                    Show up as you are, no prep deck required
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Until Then */}
            <section className="bg-card/30 py-24">
                <div className="container mx-auto px-4 text-center">
                    <div className="mx-auto max-w-2xl">
                        <h2 className="font-display mb-6 text-3xl font-bold text-foreground">
                            Until <span className="text-gradient">Then</span>
                        </h2>
                        <p className="mb-4 text-xl text-muted-foreground">
                            Step out of the noise.
                        </p>
                        <p className="mb-8 text-xl font-medium text-foreground">
                            Mission Control is ready when you are.
                        </p>
                        <p className="text-muted-foreground">
                            We look forward to the conversation.
                        </p>
                    </div>
                </div>
            </section>

            {/* Footer line */}
            <section className="border-t border-border/50 py-12">
                <div className="container mx-auto px-4 text-center">
                    <p className="font-display text-lg font-bold text-foreground">
                        Cynergists
                    </p>
                    <p className="text-sm text-muted-foreground">
                        Your operations team, standing behind the scenes
                    </p>
                </div>
            </section>
        </Layout>
    );
};

export default ScheduleThankYou;
