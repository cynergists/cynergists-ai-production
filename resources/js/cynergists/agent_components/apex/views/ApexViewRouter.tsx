import ApexActivityView from './ApexActivityView';
import ApexCampaignsView from './ApexCampaignsView';
import ApexConnectionsView from './ApexConnectionsView';
import ApexDashboardView from './ApexDashboardView';
import ApexMessagesView from './ApexMessagesView';

interface ApexViewRouterProps {
    activeView: string;
    setActiveView: (view: string) => void;
    agentDetails: any;
}

export default function ApexViewRouter({
    activeView,
    setActiveView,
    agentDetails,
}: ApexViewRouterProps) {
    switch (activeView) {
        case 'dashboard':
            return (
                <ApexDashboardView
                    agentDetails={agentDetails}
                    setActiveView={setActiveView}
                />
            );
        case 'campaigns':
            return <ApexCampaignsView setActiveView={setActiveView} />;
        case 'connections':
            return <ApexConnectionsView />;
        case 'messages':
            return (
                <ApexMessagesView agentDetails={agentDetails} />
            );
        case 'activity':
            return <ApexActivityView />;
        default:
            return null;
    }
}
