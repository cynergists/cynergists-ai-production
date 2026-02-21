<?php

namespace App\Ai\Tools;

use App\Models\PortalAvailableAgent;
use Illuminate\Contracts\JsonSchema\JsonSchema;
use Laravel\Ai\Contracts\Tool;
use Laravel\Ai\Tools\Request;

class GetAgentInformationTool implements Tool
{
    /**
     * Get the tool's description for the AI.
     */
    public function description(): string
    {
        return 'Get detailed information about a specific Cynergists AI agent by name, or list all available agents. Use this when users ask about specific agents, their features, pricing, or capabilities. Leave agent_name empty to see all agents.';
    }

    /**
     * Execute the tool.
     */
    public function handle(Request $request): string
    {
        $agentName = $request['agent_name'] ?? null;

        // If no agent name provided, return list of all agents
        if (empty($agentName)) {
            return $this->getAllAgents();
        }

        // Get specific agent info
        return $this->getAgentDetails($agentName);
    }

    /**
     * Get the tool's schema definition.
     */
    public function schema(JsonSchema $schema): array
    {
        return [
            'agent_name' => $schema
                ->string()
                ->description('The name of the agent (e.g., "Luna", "Carbon", "Apex"). Leave empty to get a list of all available agents.')
                ->nullable(),
        ];
    }

    /**
     * Get a list of all available agents.
     */
    private function getAllAgents(): string
    {
        $agents = PortalAvailableAgent::where('is_active', true)
            ->orderBy('name')
            ->get(['name', 'job_title', 'price', 'category']);

        if ($agents->isEmpty()) {
            return 'No agents currently available.';
        }

        $output = "**Available Cynergists AI Agents:**\n\n";

        foreach ($agents as $agent) {
            $price = number_format($agent->price, 2);
            $output .= "• **{$agent->name}** ({$agent->job_title}) - \${$price}/mo - Category: {$agent->category}\n";
        }

        $output .= "\nUse get_agent_information with a specific agent name to get detailed information.";

        return $output;
    }

    /**
     * Get detailed information about a specific agent.
     */
    private function getAgentDetails(string $agentName): string
    {
        $agent = PortalAvailableAgent::where('name', 'LIKE', "%{$agentName}%")
            ->where('is_active', true)
            ->first();

        if (! $agent) {
            return "Agent '{$agentName}' not found. Use get_agent_information without parameters to see all available agents.";
        }

        $price = number_format($agent->price, 2);
        $features = is_array($agent->features) ? $agent->features : json_decode($agent->features ?? '[]', true);
        $integrations = is_array($agent->integrations) ? $agent->integrations : json_decode($agent->integrations ?? '[]', true);
        $perfectFor = is_array($agent->perfect_for) ? $agent->perfect_for : json_decode($agent->perfect_for ?? '[]', true);

        $output = "**{$agent->name}**\n";
        $output .= "Job Title: {$agent->job_title}\n";
        $output .= "Price: \${$price}/month\n";
        $output .= "Category: {$agent->category}\n\n";

        if ($agent->description) {
            $output .= "**Description:**\n{$agent->description}\n\n";
        }

        if (! empty($features)) {
            $output .= "**Key Features:**\n";
            foreach ($features as $feature) {
                $output .= "• {$feature}\n";
            }
            $output .= "\n";
        }

        if (! empty($perfectFor)) {
            $output .= "**Perfect For:**\n";
            foreach ($perfectFor as $useCase) {
                $output .= "• {$useCase}\n";
            }
            $output .= "\n";
        }

        if (! empty($integrations)) {
            $output .= "**Integrations:**\n";
            $output .= implode(', ', $integrations)."\n\n";
        }

        if ($agent->long_description) {
            $output .= "**Additional Details:**\n{$agent->long_description}\n\n";
        }

        $output .= "View more at: /".strtolower($agent->slug ?? $agent->name);

        return $output;
    }
}
