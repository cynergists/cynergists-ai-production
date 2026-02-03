import Layout from '@/components/layout/Layout';
import { Helmet } from 'react-helmet';

const MeetChrisCalendar = () => {
    return (
        <Layout>
            <Helmet>
                <title>Initial Calendar | Cynergists</title>
                <meta
                    name="description"
                    content="View your initial calendar with Chris at Cynergists."
                />
            </Helmet>

            <section className="min-h-[80vh] bg-background py-16 md:py-24">
                <div className="container mx-auto px-4">
                    <div className="mx-auto max-w-4xl space-y-8 text-center">
                        <h1 className="font-display text-3xl font-bold text-foreground md:text-4xl">
                            Initial Calendar
                        </h1>

                        <p className="text-lg text-muted-foreground">
                            Schedule your initial session below.
                        </p>

                        <div className="h-[700px] w-full overflow-y-auto scroll-smooth rounded-lg border border-border bg-card">
                            <iframe
                                src="https://link.cynergists.com/widget/booking/HUtyePseLWGRwfdQKEFU"
                                style={{
                                    width: '100%',
                                    height: '710px',
                                    border: 'none',
                                }}
                                id="meetchris-calendar-initial"
                                title="Initial Calendar with Chris"
                            />
                        </div>
                    </div>
                </div>
            </section>
        </Layout>
    );
};

export default MeetChrisCalendar;
