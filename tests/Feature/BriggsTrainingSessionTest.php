<?php

use App\Models\BriggsTrainingScenario;
use App\Models\BriggsTrainingSession;
use App\Models\BriggsUserSettings;
use App\Models\User;
use App\Services\EventEmailService;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

beforeEach(function () {
    $this->user = User::factory()->create();
    $this->mock(EventEmailService::class)->shouldIgnoreMissing();
});

it('can create a training session for a user and scenario', function () {
    $scenario = BriggsTrainingScenario::factory()->create();

    $session = BriggsTrainingSession::create([
        'user_id' => $this->user->id,
        'scenario_id' => $scenario->id,
        'title' => $scenario->title,
        'category' => $scenario->category,
        'difficulty' => $scenario->difficulty,
        'status' => 'in_progress',
        'started_at' => now(),
    ]);

    expect($session)->not->toBeNull()
        ->and($session->status)->toBe('in_progress')
        ->and($session->scenario_id)->toBe($scenario->id)
        ->and($session->user_id)->toBe($this->user->id);
});

it('can complete a training session with score and feedback', function () {
    $session = BriggsTrainingSession::factory()->create([
        'user_id' => $this->user->id,
    ]);

    $session->update([
        'status' => 'completed',
        'score' => 82.5,
        'score_breakdown' => [
            ['criterion' => 'Active Listening', 'score' => 18, 'max_score' => 20, 'feedback' => 'Great engagement.'],
        ],
        'strengths' => ['Strong opening', 'Good rapport building'],
        'improvements' => ['Work on closing techniques'],
        'ai_feedback' => 'Overall solid performance.',
        'duration_seconds' => 450,
        'completed_at' => now(),
    ]);

    $session->refresh();

    expect($session->status)->toBe('completed')
        ->and($session->score)->toBe('82.50')
        ->and($session->strengths)->toBeArray()
        ->and($session->improvements)->toBeArray()
        ->and($session->score_breakdown)->toBeArray()
        ->and($session->ai_feedback)->toBe('Overall solid performance.')
        ->and($session->duration_seconds)->toBe(450);
});

it('increments total_sessions_completed on BriggsUserSettings when recalculated', function () {
    $settings = BriggsUserSettings::forUser($this->user);
    expect($settings->total_sessions_completed)->toBe(0);

    BriggsTrainingSession::factory()->completed()->create([
        'user_id' => $this->user->id,
    ]);

    $newTotal = BriggsTrainingSession::query()
        ->where('user_id', $this->user->id)
        ->where('status', 'completed')
        ->count();

    $settings->update(['total_sessions_completed' => $newTotal]);
    $settings->refresh();

    expect($settings->total_sessions_completed)->toBe(1);
});

it('calculates average score across completed sessions', function () {
    BriggsTrainingSession::factory()->completed()->create([
        'user_id' => $this->user->id,
        'score' => 80.00,
    ]);

    BriggsTrainingSession::factory()->completed()->create([
        'user_id' => $this->user->id,
        'score' => 60.00,
    ]);

    $avgScore = BriggsTrainingSession::query()
        ->where('user_id', $this->user->id)
        ->where('status', 'completed')
        ->avg('score');

    expect(round($avgScore, 2))->toBe(70.00);
});

it('can retrieve session history for a user', function () {
    BriggsTrainingSession::factory()->completed()->count(3)->create([
        'user_id' => $this->user->id,
    ]);

    BriggsTrainingSession::factory()->create([
        'user_id' => $this->user->id,
        'status' => 'in_progress',
    ]);

    $completedSessions = BriggsTrainingSession::query()
        ->where('user_id', $this->user->id)
        ->where('status', 'completed')
        ->get();

    expect($completedSessions)->toHaveCount(3);
});

it('returns the formatted duration attribute', function () {
    $session = BriggsTrainingSession::factory()->completed()->create([
        'user_id' => $this->user->id,
        'duration_seconds' => 330,
    ]);

    expect($session->formatted_duration)->toBe('5m 30s');
});

it('returns null formatted duration when duration_seconds is null', function () {
    $session = BriggsTrainingSession::factory()->create([
        'user_id' => $this->user->id,
        'duration_seconds' => null,
    ]);

    expect($session->formatted_duration)->toBeNull();
});
