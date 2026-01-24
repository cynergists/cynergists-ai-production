import { Helmet } from "react-helmet";
import Layout from "@/components/layout/Layout";
import { Calendar, CheckCircle, Video, FileText, Clock, MessageSquare, Target } from "lucide-react";

const ScheduleThankYou = () => {
  return (
    <Layout>
      <Helmet>
        <title>Mission Scheduled | Cynergists</title>
        <meta name="description" content="Your strategy call with Cynergists is confirmed. We look forward to the conversation." />
        <link rel="canonical" href="https://cynergists.com/schedule/thank-you" />
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>

      {/* Hero */}
      <section className="py-24 gradient-hero relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-1/3 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 right-0 w-80 h-80 bg-secondary/10 rounded-full blur-3xl" />
        </div>
        
        <div className="container mx-auto px-4 relative z-10 text-center">
          <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/30 rounded-full px-4 py-2 mb-6">
            <CheckCircle className="h-4 w-4 text-primary" />
            <span className="text-sm text-primary font-medium">Mission Scheduled</span>
          </div>
          <h1 className="font-display text-4xl md:text-5xl font-bold text-foreground mb-6">
            Your strategy call is <span className="text-gradient">confirmed.</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            You are officially on the calendar, and your briefing is locked in. You will receive a confirmation email shortly with the details for your call.
          </p>
        </div>
      </section>

      {/* What Happens Next */}
      <section className="py-24 bg-card/30">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <h2 className="font-display text-3xl font-bold text-foreground mb-4 text-center">
              What Happens <span className="text-gradient">Next</span>
            </h2>
            
            <div className="card-glass p-8 mb-12">
              <p className="text-lg text-foreground font-medium mb-2">This is not a sales call.</p>
              <p className="text-lg text-foreground font-medium mb-6">This is a focused working session.</p>
              <p className="text-muted-foreground">
                We will review how your operation is currently structured, where execution is slowing you down, and whether Cynergists is the right support team behind your mission.
              </p>
            </div>

            <div className="mb-12">
              <h3 className="font-display text-xl font-bold text-foreground mb-6">
                Come prepared to talk through:
              </h3>
              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Clock className="h-5 w-5 text-primary" />
                  </div>
                  <p className="text-muted-foreground text-lg">What is currently consuming your time</p>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Target className="h-5 w-5 text-primary" />
                  </div>
                  <p className="text-muted-foreground text-lg">Where things feel heavier than they should</p>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <MessageSquare className="h-5 w-5 text-primary" />
                  </div>
                  <p className="text-muted-foreground text-lg">What you want your role to look like moving forward</p>
                </div>
              </div>
              <p className="text-muted-foreground mt-6">
                We will come prepared to ask the right questions and provide clear perspective.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Before the Call */}
      <section className="py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <h2 className="font-display text-3xl font-bold text-foreground mb-8 text-center">
              Before the <span className="text-gradient">Call</span>
            </h2>
            
            <div className="grid md:grid-cols-3 gap-6">
              <div className="card-glass p-6 text-center">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <Calendar className="h-6 w-6 text-primary" />
                </div>
                <p className="text-foreground font-medium">Check your calendar for the invite</p>
              </div>
              <div className="card-glass p-6 text-center">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <Video className="h-6 w-6 text-primary" />
                </div>
                <p className="text-foreground font-medium">Join by video or phone, your choice</p>
              </div>
              <div className="card-glass p-6 text-center">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <FileText className="h-6 w-6 text-primary" />
                </div>
                <p className="text-foreground font-medium">Show up as you are, no prep deck required</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Until Then */}
      <section className="py-24 bg-card/30">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-2xl mx-auto">
            <h2 className="font-display text-3xl font-bold text-foreground mb-6">
              Until <span className="text-gradient">Then</span>
            </h2>
            <p className="text-xl text-muted-foreground mb-4">
              Step out of the noise.
            </p>
            <p className="text-xl text-foreground font-medium mb-8">
              Mission Control is ready when you are.
            </p>
            <p className="text-muted-foreground">
              We look forward to the conversation.
            </p>
          </div>
        </div>
      </section>

      {/* Footer line */}
      <section className="py-12 border-t border-border/50">
        <div className="container mx-auto px-4 text-center">
          <p className="text-lg font-display font-bold text-foreground">Cynergists</p>
          <p className="text-sm text-muted-foreground">Your operations team, standing behind the scenes</p>
        </div>
      </section>
    </Layout>
  );
};

export default ScheduleThankYou;
