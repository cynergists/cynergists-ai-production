import { Helmet } from "react-helmet";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Briefcase } from "lucide-react";

const Careers = () => {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Helmet>
        <title>Careers | Cynergists</title>
        <meta name="description" content="Explore career opportunities at Cynergists. Join our team and help businesses leverage AI agents for growth." />
      </Helmet>
      
      <Header />
      
      <main className="flex-1 container mx-auto px-4 py-16 md:py-24">
        <div className="max-w-2xl mx-auto text-center">
          <div className="mb-8 flex justify-center">
            <div className="h-20 w-20 rounded-full bg-muted flex items-center justify-center">
              <Briefcase className="h-10 w-10 text-muted-foreground" />
            </div>
          </div>
          
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            <span className="text-gradient">Careers</span>
          </h1>
          
          <p className="text-xl text-muted-foreground mb-8">
            We're not currently hiring, but we're always looking for talented people.
          </p>
          
          <div className="bg-card border border-border rounded-lg p-8">
            <h2 className="text-xl font-semibold mb-4">No Open Positions</h2>
            <p className="text-muted-foreground">
              We don't have any openings at the moment, but check back soon! 
              In the meantime, feel free to reach out to us at{" "}
              <a 
                href="mailto:hello@cynergists.com" 
                className="text-primary hover:underline"
              >
                hello@cynergists.com
              </a>{" "}
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
