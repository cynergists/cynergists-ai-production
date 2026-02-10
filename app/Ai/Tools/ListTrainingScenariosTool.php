<?php

namespace App\Ai\Tools;

use App\Models\BriggsTrainingScenario;
use App\Models\User;
use Illuminate\Contracts\JsonSchema\JsonSchema;
use Laravel\Ai\Contracts\Tool;
use Laravel\Ai\Tools\Request;

class ListTrainingScenariosTool implements Tool
{
    public function __construct(
        public User $user
    ) {}

    /**
     * Get the description of the tool's purpose.
     */
    public function description(): string
    {
        return 'List available sales training scenarios. Optionally filter by category or difficulty level. Use this when the user wants to browse training options.';
    }

    /**
     * Execute the tool.
     */
    public function handle(Request $request): string
    {
        $query = BriggsTrainingScenario::query()
            ->where('is_active', true)
            ->orderBy('sort_order');

        $categoryFilter = $request['category_filter'] ?? null;
        $difficultyFilter = $request['difficulty_filter'] ?? null;

        if ($categoryFilter) {
            $query->where('category', $categoryFilter);
        }

        if ($difficultyFilter) {
            $query->where('difficulty', $difficultyFilter);
        }

        $scenarios = $query->get();

        if ($scenarios->isEmpty()) {
            $filters = array_filter([$categoryFilter, $difficultyFilter]);

            return $filters
                ? 'No scenarios found matching those filters.'
                : 'No training scenarios are currently available.';
        }

        $result = "Found {$scenarios->count()} training scenario(s):\n";

        foreach ($scenarios as $scenario) {
            $difficulty = ucfirst($scenario->difficulty);
            $category = str_replace('_', ' ', ucfirst($scenario->category));
            $result .= "\n[{$scenario->slug}] {$scenario->title}";
            $result .= "\n  Category: {$category} | Difficulty: {$difficulty}";
            $result .= "\n  Buyer: {$scenario->buyer_name}, {$scenario->buyer_title} at {$scenario->buyer_company}";
            $result .= "\n  {$scenario->description}";
            $result .= "\n";
        }

        return $result;
    }

    /**
     * Get the tool's schema definition.
     */
    public function schema(JsonSchema $schema): array
    {
        return [
            'category_filter' => $schema
                ->string()
                ->description('Optional filter by category: objection_handling, cold_call, discovery_call, pitch, closing, follow_up, or negotiation.'),
            'difficulty_filter' => $schema
                ->string()
                ->description('Optional filter by difficulty: beginner, intermediate, or advanced.'),
        ];
    }
}
