import type { ComponentType } from 'react';
import { AetherChat } from './aether/AetherChat';
import { AetherConfig } from './aether/AetherConfig';
import AetherSidebar from './aether/AetherSidebar';
import { BeaconChat } from './beacon/BeaconChat';
import { BeaconConfig } from './beacon/BeaconConfig';
import BeaconSidebar from './beacon/BeaconSidebar';
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
import { ImpulseChat } from './impulse/ImpulseChat';
import { ImpulseConfig } from './impulse/ImpulseConfig';
import ImpulseSidebar from './impulse/ImpulseSidebar';
import { KinetixChat } from './kinetix/KinetixChat';
import { KinetixConfig } from './kinetix/KinetixConfig';
import KinetixSidebar from './kinetix/KinetixSidebar';
import { LunaChat } from './luna/LunaChat';
import { LunaConfig } from './luna/LunaConfig';
import LunaSidebar from './luna/LunaSidebar';
import { MosaicChat } from './mosaic/MosaicChat';
import { MosaicConfig } from './mosaic/MosaicConfig';
import MosaicSidebar from './mosaic/MosaicSidebar';
import { OptixChat } from './optix/OptixChat';
import { OptixConfig } from './optix/OptixConfig';
import OptixSidebar from './optix/OptixSidebar';
import { VectorChat } from './vector/VectorChat';
import { VectorConfig } from './vector/VectorConfig';
import VectorSidebar from './vector/VectorSidebar';
import { ArsenalChat } from './arsenal/ArsenalChat';
import { ArsenalConfig } from './arsenal/ArsenalConfig';
import ArsenalSidebar from './arsenal/ArsenalSidebar';

export interface SettingsLink {
    label: string;
    view: string;
}

interface AgentComponents {
    ChatComponent: ComponentType;
    ConfigComponent: ComponentType;
    SidebarComponent: ComponentType;
    ViewComponent?: ComponentType;
    settingsLinks?: SettingsLink[];
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
        settingsLinks: [
            { label: 'Campaign Manager', view: 'campaigns' },
            { label: 'Pending Actions', view: 'pending-actions' },
        ],
    },
    briggs: {
        ChatComponent: BriggsChat,
        ConfigComponent: BriggsConfig,
        SidebarComponent: BriggsSidebar,
        ViewComponent: BriggsViewRouter,
        settingsLinks: [
            { label: 'Past Sessions', view: 'past-sessions' },
            { label: 'Training Library', view: 'training-library' },
        ],
    },
    carbon: {
        ChatComponent: CarbonChat,
        ConfigComponent: CarbonConfig,
        SidebarComponent: CarbonSidebar,
        settingsLinks: [
            { label: 'SEO Overview', view: 'seo-overview' },
        ],
    },
    luna: {
        ChatComponent: LunaChat,
        ConfigComponent: LunaConfig,
        SidebarComponent: LunaSidebar,
    },
    mosaic: {
        ChatComponent: MosaicChat,
        ConfigComponent: MosaicConfig,
        SidebarComponent: MosaicSidebar,
        settingsLinks: [
            { label: 'Preview', view: 'preview' },
            { label: 'Blueprint', view: 'blueprint' },
        ],
    },
    aether: {
        ChatComponent: AetherChat,
        ConfigComponent: AetherConfig,
        SidebarComponent: AetherSidebar,
        settingsLinks: [
            { label: 'Content Pipeline', view: 'content-pipeline' },
            { label: 'Published Posts', view: 'published' },
        ],
    },
    kinetix: {
        ChatComponent: KinetixChat,
        ConfigComponent: KinetixConfig,
        SidebarComponent: KinetixSidebar,
        settingsLinks: [
            { label: 'Video Library', view: 'video-library' },
        ],
    },
    optix: {
        ChatComponent: OptixChat,
        ConfigComponent: OptixConfig,
        SidebarComponent: OptixSidebar,
        settingsLinks: [
            { label: 'Channel Bible', view: 'channel-bible' },
        ],
    },
    vector: {
        ChatComponent: VectorChat,
        ConfigComponent: VectorConfig,
        SidebarComponent: VectorSidebar,
        settingsLinks: [
            { label: 'Campaigns', view: 'campaigns' },
            { label: 'Analytics', view: 'analytics' },
        ],
    },
    beacon: {
        ChatComponent: BeaconChat,
        ConfigComponent: BeaconConfig,
        SidebarComponent: BeaconSidebar,
    },
    arsenal: {
        ChatComponent: ArsenalChat,
        ConfigComponent: ArsenalConfig,
        SidebarComponent: ArsenalSidebar,
        settingsLinks: [
            { label: 'Product Catalog', view: 'catalog' },
        ],
    },
    impulse: {
        ChatComponent: ImpulseChat,
        ConfigComponent: ImpulseConfig,
        SidebarComponent: ImpulseSidebar,
        settingsLinks: [
            { label: 'Video Queue', view: 'video-queue' },
        ],
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
    BeaconChat,
    BeaconConfig,
    BeaconSidebar,
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
    MosaicChat,
    MosaicConfig,
    MosaicSidebar,
    OptixChat,
    OptixConfig,
    OptixSidebar,
    VectorChat,
    VectorConfig,
    VectorSidebar,
    ArsenalChat,
    ArsenalConfig,
    ArsenalSidebar,
    ImpulseChat,
    ImpulseConfig,
    ImpulseSidebar,
};
