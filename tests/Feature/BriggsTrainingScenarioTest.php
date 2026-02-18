<?php

use App\Models\BriggsTrainingScenario;
use App\Services\EventEmailService;
use Database\Seeders\BriggsTrainingScenarioSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

beforeEach(function () {
    $this->mock(EventEmailService::class)->shouldIgnoreMissing();
});

it('can list active training scenarios', function () {
    BriggsTrainingScenario::factory()->count(3)->create(['is_active' => true]);
    BriggsTrainingScenario::factory()->create(['is_active' => false]);

    $active = BriggsTrainingScenario::query()->where('is_active', true)->get();

    expect($active)->toHaveCount(3);
});

it('can filter scenarios by category', function () {
    BriggsTrainingScenario::factory()->objectionHandling()->count(2)->create();
    BriggsTrainingScenario::factory()->coldCall()->create();

    $objections = BriggsTrainingScenario::query()
        ->where('category', 'objection_handling')
        ->get();

    expect($objections)->toHaveCount(2);
});

it('can filter scenarios by difficulty', function () {
    BriggsTrainingScenario::factory()->beginner()->count(2)->create();
    BriggsTrainingScenario::factory()->advanced()->create();

    $beginnerScenarios = BriggsTrainingScenario::query()
        ->where('difficulty', 'beginner')
        ->get();

    expect($beginnerScenarios)->toHaveCount(2);
});

it('seeder creates expected number of scenarios', function () {
    $seeder = new BriggsTrainingScenarioSeeder;
    $seeder->run();

    $count = BriggsTrainingScenario::query()->count();

    expect($count)->toBe(10);
});

it('seeder scenarios have required fields', function () {
    $seeder = new BriggsTrainingScenarioSeeder;
    $seeder->run();

    $scenarios = BriggsTrainingScenario::all();

    foreach ($scenarios as $scenario) {
        expect($scenario->title)->not->toBeEmpty()
            ->and($scenario->slug)->not->toBeEmpty()
            ->and($scenario->description)->not->toBeEmpty()
            ->and($scenario->category)->not->toBeEmpty()
            ->and($scenario->difficulty)->not->toBeEmpty()
            ->and($scenario->buyer_name)->not->toBeEmpty()
            ->and($scenario->buyer_title)->not->toBeEmpty()
            ->and($scenario->buyer_company)->not->toBeEmpty()
            ->and($scenario->buyer_persona)->not->toBeEmpty()
            ->and($scenario->scenario_context)->not->toBeEmpty()
            ->and($scenario->objectives)->toBeArray()
            ->and($scenario->scoring_criteria)->toBeArray();
    }
});

it('seeder is idempotent', function () {
    $seeder = new BriggsTrainingScenarioSeeder;
    $seeder->run();
    $seeder->run(); // Run twice

    $count = BriggsTrainingScenario::query()->count();

    expect($count)->toBe(10);
});
