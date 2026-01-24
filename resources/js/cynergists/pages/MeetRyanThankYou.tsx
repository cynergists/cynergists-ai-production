import { Helmet } from "react-helmet";
import { CheckCircle } from "lucide-react";
import Layout from "@/components/layout/Layout";

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

      <section className="py-24 md:py-32 bg-background min-h-[70vh] flex items-center">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto text-center space-y-8">
            <div className="flex justify-center">
              <CheckCircle className="w-20 h-20 text-primary" />
            </div>
            
            <h1 className="font-display text-4xl md:text-5xl font-bold text-foreground">
              Your call is confirmed.
            </h1>
            
            <p className="text-xl text-muted-foreground">
              You will find the calendar details in your inbox.
            </p>
            
            <div className="pt-8 space-y-6 text-left bg-card border border-border rounded-xl p-8">
              <p className="text-lg text-foreground">
                This is not a generic discovery call. It is a focused working session designed around your goals, constraints, and priorities.
              </p>
              
              <p className="text-lg text-foreground">
                Come prepared to discuss your biggest operational challenges. We will come prepared with clear recommendations and next steps you can act on immediately.
              </p>
              
              <p className="text-lg text-foreground font-semibold">
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
