import { forwardRef } from "react";
import { essentialsAgents, getEssentialsTierIndex } from "@/data/essentialsAgents";
import { AgentTierCard } from "./AgentTierCard";
import { EssentialsPlanSummary } from "./EssentialsPlanSummary";

interface EssentialsPlanBuilderProps {
  selections: Record<string, number>;
  onSelectionChange: (agentName: string, tierIndex: number) => void;
  onReset: () => void;
}

export const EssentialsPlanBuilder = forwardRef<HTMLDivElement, EssentialsPlanBuilderProps>(
  ({ selections, onSelectionChange, onReset }, ref) => {
    return (
      <section ref={ref} className="py-12 md:py-16 scroll-mt-20" id="essentials-builder">
        <div className="container mx-auto px-4">
          {/* Summary at Top */}
          <EssentialsPlanSummary
            selections={selections}
            onReset={onReset}
          />

          {/* Agent Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {essentialsAgents.map((agent) => {
              const essentialsIndex = getEssentialsTierIndex(agent);
              const currentIndex = selections[agent.name] ?? essentialsIndex;
              
              return (
                <AgentTierCard
                  key={agent.name}
                  agent={agent}
                  selectedTierIndex={currentIndex}
                  onTierChange={(index) => onSelectionChange(agent.name, index)}
                />
              );
            })}
          </div>
        </div>
      </section>
    );
  }
);

EssentialsPlanBuilder.displayName = "EssentialsPlanBuilder";