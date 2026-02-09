import React from 'react';
import { ApexChat } from './apex/ApexChat';
import { ApexConfig } from './apex/ApexConfig';
import ApexSidebar from './apex/ApexSidebar';
import ApexViewRouter from './apex/views/ApexViewRouter';
import { CarbonChat } from './carbon/CarbonChat';
import { CarbonConfig } from './carbon/CarbonConfig';
import CarbonSidebar from './carbon/CarbonSidebar';
import { CynessaChat } from './cynessa/CynessaChat';
import { CynessaConfig } from './cynessa/CynessaConfig';
import CynessaSidebar from './cynessa/CynessaSidebar';
import { LunaChat } from './luna/LunaChat';
import { LunaConfig } from './luna/LunaConfig';
import LunaSidebar from './luna/LunaSidebar';

interface AgentComponents {
    ChatComponent: React.ComponentType<any>;
    ConfigComponent: React.ComponentType<any>;
    SidebarComponent: React.ComponentType<any>;
    ViewComponent?: React.ComponentType<any>;
}

const agentComponentsMap: Record<string, AgentComponents> = {
    cynessa: {
        ChatComponent: CynessaChat,
        ConfigComponent: CynessaConfig,
        SidebarComponent: CynessaSidebar,
    },
    apex: {
        ChatComponent: ApexChat,
        ConfigComponent: ApexConfig,
        SidebarComponent: ApexSidebar,
        ViewComponent: ApexViewRouter,
    },
    carbon: {
        ChatComponent: CarbonChat,
        ConfigComponent: CarbonConfig,
        SidebarComponent: CarbonSidebar,
    },
    luna: {
        ChatComponent: LunaChat,
        ConfigComponent: LunaConfig,
        SidebarComponent: LunaSidebar,
    },
};

export function getAgentComponents(agentName: string): AgentComponents | null {
    const key = agentName.toLowerCase();
    return agentComponentsMap[key] || null;
}

export {
    ApexChat,
    ApexConfig,
    ApexSidebar,
    CarbonChat,
    CarbonConfig,
    CarbonSidebar,
    CynessaChat,
    CynessaConfig,
    CynessaSidebar,
    LunaChat,
    LunaConfig,
    LunaSidebar,
};
