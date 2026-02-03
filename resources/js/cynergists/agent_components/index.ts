import { CynessaChat } from "./cynessa/CynessaChat";
import { CynessaConfig } from "./cynessa/CynessaConfig";
import CynessaSidebar from "./cynessa/CynessaSidebar";
import { ApexChat } from "./apex/ApexChat";
import { ApexConfig } from "./apex/ApexConfig";
import ApexSidebar from "./apex/ApexSidebar";
import React from "react";

interface AgentComponents {
  ChatComponent: React.ComponentType<any>;
  ConfigComponent: React.ComponentType<any>;
  SidebarComponent: React.ComponentType<any>;
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
  },
};

export function getAgentComponents(agentName: string): AgentComponents | null {
  const key = agentName.toLowerCase();
  return agentComponentsMap[key] || null;
}

export { CynessaChat, CynessaConfig, CynessaSidebar, ApexChat, ApexConfig, ApexSidebar };
