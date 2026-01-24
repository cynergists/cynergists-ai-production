import { Users, Clock, DollarSign, Briefcase } from "lucide-react";

const metrics = [
  {
    icon: Users,
    value: "150+",
    label: "Clients Served",
  },
  {
    icon: Clock,
    value: "50,000+",
    label: "Hours Executed",
  },
  {
    icon: DollarSign,
    value: "$2M+",
    label: "Operations Delivered",
  },
  {
    icon: Briefcase,
    value: "500+",
    label: "Projects Completed",
  },
];

const TrustBar = () => {
  return (
    <section className="py-8 bg-card/50 border-y border-border/50">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
          {metrics.map((metric, index) => (
            <div
              key={index}
              className="flex flex-col items-center text-center gap-2"
            >
              <metric.icon className="h-6 w-6 text-primary mb-1" />
              <span className="text-2xl md:text-3xl font-bold text-foreground font-display">
                {metric.value}
              </span>
              <span className="text-sm text-muted-foreground">
                {metric.label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TrustBar;
