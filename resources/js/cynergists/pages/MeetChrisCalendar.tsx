import { Helmet } from "react-helmet";
import Layout from "@/components/layout/Layout";

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

      <section className="py-16 md:py-24 bg-background min-h-[80vh]">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center space-y-8">
            <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground">
              Initial Calendar
            </h1>
            
            <p className="text-lg text-muted-foreground">
              Schedule your initial session below.
            </p>
            
            <div className="w-full h-[700px] overflow-y-auto rounded-lg border border-border bg-card scroll-smooth">
              <iframe 
                src="https://link.cynergists.com/widget/booking/HUtyePseLWGRwfdQKEFU" 
                style={{ width: '100%', height: '710px', border: 'none' }}
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
