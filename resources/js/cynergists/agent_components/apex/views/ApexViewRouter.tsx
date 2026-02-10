import { useEffect } from 'react';
import ApexActivityView from './ApexActivityView';
import ApexCampaignsView from './ApexCampaignsView';
import ApexConnectionsView from './ApexConnectionsView';
import ApexDashboardView from './ApexDashboardView';
import ApexMessagesView from './ApexMessagesView';
import ApexPendingActionsView from './ApexPendingActionsView';
import ApexSettingsView from './ApexSettingsView';

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
    const isLinkedInConnected =
        agentDetails?.apex_data?.linkedin?.connected === true;

    // Redirect to chat if LinkedIn isn't connected
    useEffect(() => {
        if (!isLinkedInConnected) {
            setActiveView('chat');
        }
    }, [isLinkedInConnected, setActiveView]);

    if (!isLinkedInConnected) {
        return null;
    }

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
        case 'pending-actions':
            return (
                <ApexPendingActionsView agentDetails={agentDetails} />
            );
        case 'activity':
            return <ApexActivityView />;
        case 'settings':
            return (
                <ApexSettingsView agentDetails={agentDetails} />
            );
        default:
            return null;
    }
}
