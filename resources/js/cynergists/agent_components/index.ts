import React from 'react';
import { AetherChat } from './aether/AetherChat';
import { AetherConfig } from './aether/AetherConfig';
import AetherSidebar from './aether/AetherSidebar';
import { ApexChat } from './apex/ApexChat';
import { ApexConfig } from './apex/ApexConfig';
import ApexSidebar from './apex/ApexSidebar';
import ApexViewRouter from './apex/views/ApexViewRouter';
import { BriggsChat } from './briggs/BriggsChat';
import { BriggsConfig } from './briggs/BriggsConfig';
import BriggsSidebar from './briggs/BriggsSidebar';
import BriggsViewRouter from './briggs/views/BriggsViewRouter';
import { CarbonChat } from './carbon/CarbonChat';
import { CarbonConfig } from './carbon/CarbonConfig';
import CarbonSidebar from './carbon/CarbonSidebar';
import { CynessaChat } from './cynessa/CynessaChat';
import { CynessaConfig } from './cynessa/CynessaConfig';
import CynessaSidebar from './cynessa/CynessaSidebar';
import { KinetixChat } from './kinetix/KinetixChat';
import { KinetixConfig } from './kinetix/KinetixConfig';
import KinetixSidebar from './kinetix/KinetixSidebar';
import { LunaChat } from './luna/LunaChat';
import { LunaConfig } from './luna/LunaConfig';
import LunaSidebar from './luna/LunaSidebar';
import { OptixChat } from './optix/OptixChat';
import { OptixConfig } from './optix/OptixConfig';
import OptixSidebar from './optix/OptixSidebar';
import { VectorChat } from './vector/VectorChat';
import { VectorConfig } from './vector/VectorConfig';
import VectorSidebar from './vector/VectorSidebar';

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
    briggs: {
        ChatComponent: BriggsChat,
        ConfigComponent: BriggsConfig,
        SidebarComponent: BriggsSidebar,
        ViewComponent: BriggsViewRouter,
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
    aether: {
        ChatComponent: AetherChat,
        ConfigComponent: AetherConfig,
        SidebarComponent: AetherSidebar,
    },
    kinetix: {
        ChatComponent: KinetixChat,
        ConfigComponent: KinetixConfig,
        SidebarComponent: KinetixSidebar,
    },
    optix: {
        ChatComponent: OptixChat,
        ConfigComponent: OptixConfig,
        SidebarComponent: OptixSidebar,
    },
    vector: {
        ChatComponent: VectorChat,
        ConfigComponent: VectorConfig,
        SidebarComponent: VectorSidebar,
    },
};

export function getAgentComponents(agentName: string): AgentComponents | null {
    const key = agentName.toLowerCase();
    return agentComponentsMap[key] || null;
}

export {
    AetherChat,
    AetherConfig,
    AetherSidebar,
    ApexChat,
    ApexConfig,
    ApexSidebar,
    BriggsChat,
    BriggsConfig,
    BriggsSidebar,
    CarbonChat,
    CarbonConfig,
    CarbonSidebar,
    CynessaChat,
    CynessaConfig,
    CynessaSidebar,
    KinetixChat,
    KinetixConfig,
    KinetixSidebar,
    LunaChat,
    LunaConfig,
    LunaSidebar,
    OptixChat,
    OptixConfig,
    OptixSidebar,
    VectorChat,
    VectorConfig,
    VectorSidebar,
};
