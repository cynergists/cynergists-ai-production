import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import {
    CheckCircle2,
    Clock,
    HelpCircle,
    MessageSquare,
    Plus,
} from 'lucide-react';
import { useState } from 'react';
import { Helmet } from 'react-helmet';

interface Ticket {
    id: string;
    subject: string;
    status: 'open' | 'pending' | 'resolved';
    createdAt: string;
    lastReply: string;
}

// Placeholder data
const mockTickets: Ticket[] = [];

export default function PartnerTickets() {
    const [showNewTicket, setShowNewTicket] = useState(false);

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'open':
                return (
                    <Badge className="bg-blue-500">
                        <MessageSquare className="mr-1 h-3 w-3" /> Open
                    </Badge>
                );
            case 'pending':
                return (
                    <Badge className="bg-yellow-500">
                        <Clock className="mr-1 h-3 w-3" /> Pending
                    </Badge>
                );
            case 'resolved':
                return (
                    <Badge variant="outline">
                        <CheckCircle2 className="mr-1 h-3 w-3" /> Resolved
                    </Badge>
                );
            default:
                return null;
        }
    };

    return (
        <>
            <Helmet>
                <title>Support Tickets | Partner Portal | Cynergists</title>
            </Helmet>

            <div className="space-y-6 p-6">
                <div className="flex items-center justify-between">
                    <div className="flex items-start gap-4">
                        <div className="rounded-lg bg-primary/10 p-3">
                            <HelpCircle className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold">
                                Support Tickets
                            </h1>
                            <p className="text-muted-foreground">
                                Get help from our partner success team
                            </p>
                        </div>
                    </div>
                    <Button onClick={() => setShowNewTicket(!showNewTicket)}>
                        <Plus className="mr-2 h-4 w-4" />
                        New Ticket
                    </Button>
                </div>

                {showNewTicket && (
                    <Card>
                        <CardHeader>
                            <CardTitle>Create New Ticket</CardTitle>
                            <CardDescription>
                                Describe your issue and we'll get back to you as
                                soon as possible
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="category">Category</Label>
                                <Select>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select a category" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="account">
                                            Account Issues
                                        </SelectItem>
                                        <SelectItem value="payouts">
                                            Payouts & Commissions
                                        </SelectItem>
                                        <SelectItem value="referrals">
                                            Referrals & Deals
                                        </SelectItem>
                                        <SelectItem value="technical">
                                            Technical Support
                                        </SelectItem>
                                        <SelectItem value="other">
                                            Other
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="subject">Subject</Label>
                                <Input
                                    id="subject"
                                    placeholder="Brief description of your issue"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="message">Message</Label>
                                <Textarea
                                    id="message"
                                    placeholder="Please provide as much detail as possible..."
                                    rows={5}
                                />
                            </div>
                            <div className="flex gap-2">
                                <Button>Submit Ticket</Button>
                                <Button
                                    variant="outline"
                                    onClick={() => setShowNewTicket(false)}
                                >
                                    Cancel
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                )}

                <Tabs defaultValue="all">
                    <TabsList>
                        <TabsTrigger value="all">All Tickets</TabsTrigger>
                        <TabsTrigger value="open">Open</TabsTrigger>
                        <TabsTrigger value="resolved">Resolved</TabsTrigger>
                    </TabsList>

                    <TabsContent value="all" className="mt-6">
                        {mockTickets.length === 0 ? (
                            <Card>
                                <CardContent className="py-12 text-center">
                                    <HelpCircle className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
                                    <h3 className="mb-2 text-lg font-medium">
                                        No tickets yet
                                    </h3>
                                    <p className="mb-4 text-muted-foreground">
                                        Create a ticket if you need assistance
                                        from our team
                                    </p>
                                    <Button
                                        onClick={() => setShowNewTicket(true)}
                                    >
                                        <Plus className="mr-2 h-4 w-4" />
                                        Create Your First Ticket
                                    </Button>
                                </CardContent>
                            </Card>
                        ) : (
                            <div className="space-y-4">
                                {mockTickets.map((ticket) => (
                                    <Card
                                        key={ticket.id}
                                        className="cursor-pointer transition-shadow hover:shadow-md"
                                    >
                                        <CardContent className="p-4">
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <p className="font-medium">
                                                        {ticket.subject}
                                                    </p>
                                                    <p className="text-sm text-muted-foreground">
                                                        Created{' '}
                                                        {ticket.createdAt} •
                                                        Last reply{' '}
                                                        {ticket.lastReply}
                                                    </p>
                                                </div>
                                                {getStatusBadge(ticket.status)}
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        )}
                    </TabsContent>

                    <TabsContent value="open" className="mt-6">
                        <Card>
                            <CardContent className="py-12 text-center">
                                <p className="text-muted-foreground">
                                    No open tickets
                                </p>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="resolved" className="mt-6">
                        <Card>
                            <CardContent className="py-12 text-center">
                                <p className="text-muted-foreground">
                                    No resolved tickets
                                </p>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>
        </>
    );
}
