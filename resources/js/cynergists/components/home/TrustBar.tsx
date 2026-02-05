import { Briefcase, Clock, DollarSign, Users } from 'lucide-react';

const metrics = [
    {
        icon: Users,
        value: '150+',
        label: 'Clients Served',
    },
    {
        icon: Clock,
        value: '50,000+',
        label: 'Hours Executed',
    },
    {
        icon: DollarSign,
        value: '$2M+',
        label: 'Operations Delivered',
    },
    {
        icon: Briefcase,
        value: '500+',
        label: 'Projects Completed',
    },
];

const TrustBar = () => {
    return (
        <section className="border-y border-border/50 bg-card/50 py-8">
            <div className="container mx-auto px-4">
                <div className="grid grid-cols-2 gap-6 md:grid-cols-4 md:gap-8">
                    {metrics.map((metric, index) => (
                        <div
                            key={index}
                            className="flex flex-col items-center gap-2 text-center"
                        >
                            <metric.icon className="mb-1 h-6 w-6 text-primary" />
                            <span className="font-display text-2xl font-bold text-foreground md:text-3xl">
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
