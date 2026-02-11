import BriggsPastSessionsView from './BriggsPastSessionsView';
import BriggsSessionDetailView from './BriggsSessionDetailView';
import BriggsTrainingLibraryView from './BriggsTrainingLibraryView';

interface BriggsViewRouterProps {
    activeView: string;
    setActiveView: (view: string) => void;
    agentDetails: any;
}

export default function BriggsViewRouter({
    activeView,
    setActiveView,
    agentDetails,
}: BriggsViewRouterProps) {
    switch (activeView) {
        case 'training-library':
            return (
                <BriggsTrainingLibraryView
                    agentDetails={agentDetails}
                    setActiveView={setActiveView}
                />
            );
        case 'past-sessions':
            return (
                <BriggsPastSessionsView
                    agentDetails={agentDetails}
                    setActiveView={setActiveView}
                />
            );
        case 'session-detail':
            return (
                <BriggsSessionDetailView
                    agentDetails={agentDetails}
                    setActiveView={setActiveView}
                />
            );
        default:
            return null;
    }
}
