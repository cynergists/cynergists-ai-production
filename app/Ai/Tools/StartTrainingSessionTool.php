<?php

namespace App\Ai\Tools;

use App\Models\BriggsTrainingScenario;
use App\Models\BriggsTrainingSession;
use App\Models\User;
use Illuminate\Contracts\JsonSchema\JsonSchema;
use Laravel\Ai\Contracts\Tool;
use Laravel\Ai\Tools\Request;

class StartTrainingSessionTool implements Tool
{
    public function __construct(
        public User $user
    ) {}

    /**
     * Get the description of the tool's purpose.
     */
    public function description(): string
    {
        return 'Start a new sales training role-play session with a chosen scenario. This creates a training session record and returns the scenario details so you can adopt the buyer persona.';
    }

    /**
     * Execute the tool.
     */
    public function handle(Request $request): string
    {
        $scenarioSlug = $request['scenario_slug'] ?? null;

        if (! $scenarioSlug) {
            return 'Error: scenario_slug is required. Use list_training_scenarios to find available scenario slugs.';
        }

        $scenario = BriggsTrainingScenario::query()
            ->where('slug', $scenarioSlug)
            ->where('is_active', true)
            ->first();

        if (! $scenario) {
            return "Error: Scenario \"{$scenarioSlug}\" not found or is inactive. Use list_training_scenarios to see available scenarios.";
        }

        // Abandon any existing in-progress sessions
        BriggsTrainingSession::query()
            ->where('user_id', $this->user->id)
            ->where('status', 'in_progress')
            ->update(['status' => 'abandoned']);

        // Create the new training session
        $session = BriggsTrainingSession::create([
            'user_id' => $this->user->id,
            'scenario_id' => $scenario->id,
            'title' => $scenario->title,
            'category' => $scenario->category,
            'difficulty' => $scenario->difficulty,
            'status' => 'in_progress',
            'started_at' => now(),
        ]);

        $objectives = is_array($scenario->objectives) ? implode("\n  - ", $scenario->objectives) : 'None';
        $objections = is_array($scenario->common_objections) ? implode("\n  - ", $scenario->common_objections) : 'None';

        return <<<RESULT
Training session started successfully!

Session ID: {$session->id}
Scenario: {$scenario->title}
Category: {$scenario->category}
Difficulty: {$scenario->difficulty}

YOU ARE NOW PLAYING:
Name: {$scenario->buyer_name}
Title: {$scenario->buyer_title}
Company: {$scenario->buyer_company}
Persona: {$scenario->buyer_persona}

SCENARIO CONTEXT:
{$scenario->scenario_context}

TRAINEE OBJECTIVES:
  - {$objectives}

OBJECTIONS YOU MAY RAISE:
  - {$objections}

INSTRUCTIONS: Immediately adopt the buyer persona. Respond as {$scenario->buyer_name} would. Stay in character until the user says "end session", "stop training", or "pause".
RESULT;
    }

    /**
     * Get the tool's schema definition.
     */
    public function schema(JsonSchema $schema): array
    {
        return [
            'scenario_slug' => $schema
                ->string()
                ->description('The slug of the scenario to start (e.g., "the-price-objection"). Required.'),
        ];
    }
}
