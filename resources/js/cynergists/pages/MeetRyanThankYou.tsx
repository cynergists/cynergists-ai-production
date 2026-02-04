import Layout from '@/components/layout/Layout';
import { CheckCircle } from 'lucide-react';
import { Helmet } from 'react-helmet';

const MeetRyanThankYou = () => {
    return (
        <Layout>
            <Helmet>
                <title>Call Confirmed | Cynergists</title>
                <meta
                    name="description"
                    content="Your call with Cynergists is confirmed. Check your inbox for calendar details."
                />
            </Helmet>

            <section className="flex min-h-[70vh] items-center bg-background py-24 md:py-32">
                <div className="container mx-auto px-4">
                    <div className="mx-auto max-w-2xl space-y-8 text-center">
                        <div className="flex justify-center">
                            <CheckCircle className="h-20 w-20 text-primary" />
                        </div>

                        <h1 className="font-display text-4xl font-bold text-foreground md:text-5xl">
                            Your call is confirmed.
                        </h1>

                        <p className="text-xl text-muted-foreground">
                            You will find the calendar details in your inbox.
                        </p>

                        <div className="space-y-6 rounded-xl border border-border bg-card p-8 pt-8 text-left">
                            <p className="text-lg text-foreground">
                                This is not a generic discovery call. It is a
                                focused working session designed around your
                                goals, constraints, and priorities.
                            </p>

                            <p className="text-lg text-foreground">
                                Come prepared to discuss your biggest
                                operational challenges. We will come prepared
                                with clear recommendations and next steps you
                                can act on immediately.
                            </p>

                            <p className="text-lg font-semibold text-foreground">
                                Looking forward to the conversation.
                            </p>
                        </div>
                    </div>
                </div>
            </section>
        </Layout>
    );
};

export default MeetRyanThankYou;
