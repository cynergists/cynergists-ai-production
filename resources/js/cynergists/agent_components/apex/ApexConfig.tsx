import { Linkedin } from 'lucide-react';

interface ApexConfigProps {
    agentDetails: any;
}

export function ApexConfig({ agentDetails }: ApexConfigProps) {
    const apexData = agentDetails?.apex_data ?? null;
    const linkedin = apexData?.linkedin;
    const isConnected = linkedin?.connected === true;

    if (!isConnected) {
        return null;
    }

    return (
        <div className="space-y-4">
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
        </div>
    );
}
