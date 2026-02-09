import { Linkedin } from 'lucide-react';
import { useState } from 'react';
import { LinkedInConnectModal } from './LinkedInConnectModal';

interface LinkedInStatus {
    connected: boolean;
    status: string | null;
    display_name: string | null;
    avatar_url: string | null;
    requires_checkpoint: boolean;
    account_id: string | null;
}

interface ApexData {
    linkedin: LinkedInStatus;
    available_agent_id: string | null;
}

interface ApexConfigProps {
    agentDetails: any;
}

export function ApexConfig({ agentDetails }: ApexConfigProps) {
    const [connectModalOpen, setConnectModalOpen] = useState(false);

    const apexData: ApexData | null = agentDetails?.apex_data ?? null;
    const linkedin = apexData?.linkedin;
    const availableAgentId = apexData?.available_agent_id;
    const isConnected = linkedin?.connected === true;

    return (
        <div className="space-y-4">
            {/* LinkedIn Connection Status */}
            {!isConnected && linkedin?.status !== 'pending' && availableAgentId && (
                <div className="rounded-xl border border-[#0A66C2]/20 bg-[#0A66C2]/5 p-4">
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#0A66C2]/10">
                            <Linkedin className="h-5 w-5 text-[#0A66C2]" />
                        </div>
                        <div className="min-w-0 flex-1">
                            <h3 className="text-sm font-semibold text-foreground">
                                Connect LinkedIn
                            </h3>
                            <p className="text-xs text-muted-foreground">
                                Link your LinkedIn account to start outreach
                                campaigns
                            </p>
                        </div>
                        <button
                            onClick={() => setConnectModalOpen(true)}
                            className="shrink-0 rounded-lg bg-[#0A66C2] px-4 py-2 text-xs font-medium text-white transition-colors hover:bg-[#004182]"
                        >
                            Connect
                        </button>
                    </div>
                </div>
            )}

            {isConnected && linkedin && (
                <div className="rounded-xl border border-green-500/20 bg-green-500/5 p-4">
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-green-500/10">
                            <Linkedin className="h-5 w-5 text-green-600" />
                        </div>
                        <div className="min-w-0 flex-1">
                            <h3 className="text-sm font-semibold text-foreground">
                                LinkedIn Connected
                            </h3>
                            <p className="text-xs text-muted-foreground">
                                {linkedin.display_name ?? 'Account active'}
                            </p>
                        </div>
                        <div className="flex items-center gap-1.5 rounded-full border border-green-500/30 bg-green-500/10 px-2 py-1 text-xs font-medium text-green-600">
                            Active
                        </div>
                    </div>
                </div>
            )}

            {linkedin?.status === 'pending' && (
                <div className="rounded-xl border border-yellow-500/20 bg-yellow-500/5 p-4">
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-yellow-500/10">
                            <Linkedin className="h-5 w-5 text-yellow-600" />
                        </div>
                        <div className="min-w-0 flex-1">
                            <h3 className="text-sm font-semibold text-foreground">
                                LinkedIn Pending
                            </h3>
                            <p className="text-xs text-muted-foreground">
                                {linkedin.requires_checkpoint
                                    ? 'Verification required — check your LinkedIn app'
                                    : 'Connection in progress...'}
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* LinkedIn Connect Modal */}
            {availableAgentId && agentDetails?.id && (
                <LinkedInConnectModal
                    open={connectModalOpen}
                    onOpenChange={setConnectModalOpen}
                    availableAgentId={availableAgentId}
                    selectedAgentId={agentDetails.id}
                />
            )}
        </div>
    );
}
