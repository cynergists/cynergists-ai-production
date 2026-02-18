import Layout from '@/components/layout/Layout';
import { MarketplaceAgentCard } from '@/components/marketplace/MarketplaceAgentCard';
import { type AIAgent } from '@/components/ui/AIAgentCard';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { apiClient } from '@/lib/api-client';
import { useQuery } from '@tanstack/react-query';
import { Search, Sparkles } from 'lucide-react';
import { useMemo, useState } from 'react';

export default function Marketplace() {
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<string>('all');
    const [sortBy, setSortBy] = useState<string>('name-asc');

    const { data: agents, isLoading } = useQuery({
        queryKey: ['marketplace-agents'],
        queryFn: async () => {
            return apiClient.get<AIAgent[]>('/api/public/agents');
        },
    });

    // Extract unique categories from agents
    const categories = useMemo(() => {
        if (!agents) return [];
        const uniqueCategories = [
            ...new Set(agents.map((agent) => agent.category).filter(Boolean)),
        ];
        return uniqueCategories.sort();
    }, [agents]);

    // Filter and sort agents
    const filteredAndSortedAgents = useMemo(() => {
        if (!agents) return [];

        let filtered = agents.filter((agent) => {
            const matchesSearch =
                agent.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                agent.job_title
                    ?.toLowerCase()
                    .includes(searchQuery.toLowerCase()) ||
                (agent.description
                    ?.toLowerCase()
                    .includes(searchQuery.toLowerCase()) ??
                    false);

            const matchesCategory =
                selectedCategory === 'all' ||
                agent.category === selectedCategory;

            return matchesSearch && matchesCategory;
        });

        // Sort agents
        filtered = [...filtered].sort((a, b) => {
            switch (sortBy) {
                case 'name-asc':
                    return a.name.localeCompare(b.name);
                case 'name-desc':
                    return b.name.localeCompare(a.name);
                case 'price-asc':
                    return a.price - b.price;
                case 'price-desc':
                    return b.price - a.price;
                default:
                    return 0;
            }
        });

        return filtered;
    }, [agents, searchQuery, selectedCategory, sortBy]);

    // Group agents by category
    const agentsByCategory = useMemo(() => {
        const grouped: Record<string, AIAgent[]> = {};

        filteredAndSortedAgents.forEach((agent) => {
            const category = agent.category || 'General';
            if (!grouped[category]) {
                grouped[category] = [];
            }
            grouped[category].push(agent);
        });

        return grouped;
    }, [filteredAndSortedAgents]);

    // Define category order and descriptions
    const categoryConfig: Record<
        string,
        { order: number; description: string }
    > = {
        Growth: {
            order: 1,
            description: 'Scale your business and expand your reach.',
        },
        Content: {
            order: 2,
            description: 'Create engaging content that converts.',
        },
        General: {
            order: 3,
            description: 'Essential tools for everyday operations.',
        },
        Communication: {
            order: 4,
            description: 'Connect and engage with your audience.',
        },
        Operations: {
            order: 5,
            description: 'Streamline your workflows and processes.',
        },
        Sales: { order: 6, description: 'Close more deals, faster.' },
        Marketing: {
            order: 7,
            description: 'Attract and convert more customers.',
        },
        'Data and Analytics': {
            order: 8,
            description: 'Make data-driven decisions.',
        },
        'Team Support': {
            order: 9,
            description: 'Empower your team to do their best work.',
        },
        Finance: {
            order: 10,
            description: 'Manage your money with confidence.',
        },
    };

    // Sort categories by config order
    const sortedCategories = Object.keys(agentsByCategory).sort((a, b) => {
        const orderA = categoryConfig[a]?.order ?? 999;
        const orderB = categoryConfig[b]?.order ?? 999;
        return orderA - orderB;
    });

    return (
        <Layout>
            <div className="min-h-screen">
                {/* Hero Section */}
                <div className="relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-b from-lime-500/15 via-lime-500/5 to-transparent dark:from-lime-500/10 dark:via-lime-500/5 dark:to-transparent" />
                    <div className="container relative mx-auto px-4 pt-12 pb-4 md:px-[60px] md:pt-16 md:pb-6">
                        <div className="mx-auto max-w-3xl text-center">
                            <Badge className="mb-3 border-lime-500/20 bg-lime-500/10 text-accent dark:text-lime-400 hover:bg-primary/80">
                                <Sparkles className="mr-1 h-3 w-3" />
                                AI Agent Marketplace
                            </Badge>
                            <h1 className="mb-3 text-4xl font-bold md:text-5xl">
                                Assemble Your AI{' '}
                                <span className="text-gradient">Agent Team</span>
                            </h1>
                            <p className="mb-4 text-lg text-muted-foreground">
                                Browse AI agents designed for real business work.
                                Lead gen, follow-ups, workflows, reporting,
                                customer support, and content. Build your squad and
                                scale without hiring.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Search and Filter Controls */}
                <div className="container mx-auto px-4 pt-2 pb-4 md:px-[60px] md:py-6">
                    <div className="mb-8 flex flex-col gap-4 sm:flex-row">
                        {/* Search Input */}
                        <div className="relative flex-1">
                            <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                                placeholder="Search agents by name, title, or description..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-10"
                            />
                        </div>

                        {/* Category Filter */}
                        <Select
                            value={selectedCategory}
                            onValueChange={setSelectedCategory}
                        >
                            <SelectTrigger className="w-full sm:w-[180px]">
                                <SelectValue placeholder="All Categories" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">
                                    All Categories
                                </SelectItem>
                                {categories.map((category) => (
                                    <SelectItem key={category} value={category}>
                                        {category}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>

                        {/* Sort By */}
                        <Select value={sortBy} onValueChange={setSortBy}>
                            <SelectTrigger className="w-full sm:w-[200px]">
                                <SelectValue placeholder="Name (A-Z)" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="name-asc">
                                    Name (A-Z)
                                </SelectItem>
                                <SelectItem value="name-desc">
                                    Name (Z-A)
                                </SelectItem>
                                <SelectItem value="price-asc">
                                    Price (Low to High)
                                </SelectItem>
                                <SelectItem value="price-desc">
                                    Price (High to Low)
                                </SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Agent Sections by Category */}
                    {isLoading ? (
                        <div className="text-center text-muted-foreground">
                            Loading agents...
                        </div>
                    ) : sortedCategories.length > 0 ? (
                        <div className="space-y-12">
                            {sortedCategories.map((category) => {
                                const categoryAgents = agentsByCategory[category];
                                const config = categoryConfig[category];

                                return (
                                    <section
                                        key={category}
                                        className="space-y-6 pt-8 first:pt-0"
                                    >
                                        <div>
                                            <h2 className="text-2xl md:text-4xl">
                                                <span className="font-bold text-foreground">
                                                    {category}.
                                                </span>{' '}
                                                <span className="font-normal text-muted-foreground">
                                                    {config?.description ||
                                                        `${category} agents for your business.`}
                                                </span>
                                            </h2>
                                        </div>
                                        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                                            {categoryAgents.map((agent) => (
                                                <MarketplaceAgentCard
                                                    key={agent.id}
                                                    agent={agent}
                                                />
                                            ))}
                                        </div>
                                    </section>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="py-12 text-center">
                            <p className="text-lg text-muted-foreground">
                                No agents found matching your search criteria.
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </Layout>
    );
}
