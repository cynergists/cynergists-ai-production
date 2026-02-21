import Footer from '@/components/layout/Footer';
import { Briefcase } from 'lucide-react';
import { Helmet } from 'react-helmet';

const Careers = () => {
    return (
        <div className="flex min-h-screen flex-col bg-background">
            <Helmet>
                <title>Careers | Cynergists</title>
                <meta
                    name="description"
                    content="Explore career opportunities at Cynergists. Join our team and help businesses leverage AI agents for growth."
                />
            </Helmet>
            <main className="container mx-auto flex-1 px-4 py-16 md:py-24">
                <div className="mx-auto max-w-2xl text-center">
                    <div className="mb-8 flex justify-center">
                        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-muted">
                            <Briefcase className="h-10 w-10 text-muted-foreground" />
                        </div>
                    </div>

                    <h1 className="mb-6 text-4xl font-bold md:text-5xl">
                        <span className="text-gradient">Careers</span>
                    </h1>

                    <p className="mb-8 text-xl text-muted-foreground">
                        We're not currently hiring, but we're always looking for
                        talented people.
                    </p>

                    <div className="rounded-lg border border-border bg-card p-8">
                        <h2 className="mb-4 text-xl font-semibold">
                            No Open Positions
                        </h2>
                        <p className="text-muted-foreground">
                            We don't have any openings at the moment, but check
                            back soon! In the meantime, feel free to reach out
                            to us at{' '}
                            <a
                                href="mailto:hello@cynergists.com"
                                className="text-primary hover:underline"
                            >
                                hello@cynergists.com
                            </a>{' '}
                            to introduce yourself.
                        </p>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
};

export default Careers;
