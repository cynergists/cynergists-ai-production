<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class BriggsTrainingScenario extends Model
{
    /** @use HasFactory<\Database\Factories\BriggsTrainingScenarioFactory> */
    use HasFactory;

    use HasUuids;

    protected $table = 'briggs_training_scenarios';

    /**
     * @var list<string>
     */
    protected $fillable = [
        'title',
        'slug',
        'description',
        'category',
        'difficulty',
        'industry',
        'buyer_persona',
        'buyer_name',
        'buyer_title',
        'buyer_company',
        'scenario_context',
        'objectives',
        'scoring_criteria',
        'common_objections',
        'ideal_responses',
        'is_active',
        'sort_order',
    ];

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'objectives' => 'array',
            'scoring_criteria' => 'array',
            'common_objections' => 'array',
            'ideal_responses' => 'array',
            'is_active' => 'boolean',
            'sort_order' => 'integer',
        ];
    }

    /**
     * @return HasMany<BriggsTrainingSession, $this>
     */
    public function sessions(): HasMany
    {
        return $this->hasMany(BriggsTrainingSession::class, 'scenario_id');
    }

    /**
     * Scope to get active scenarios.
     *
     * @param  Builder<BriggsTrainingScenario>  $query
     * @return Builder<BriggsTrainingScenario>
     */
    public function scopeActive(Builder $query): Builder
    {
        return $query->where('is_active', true);
    }

    /**
     * Scope to filter by category.
     *
     * @param  Builder<BriggsTrainingScenario>  $query
     * @return Builder<BriggsTrainingScenario>
     */
    public function scopeCategory(Builder $query, string $category): Builder
    {
        return $query->where('category', $category);
    }

    /**
     * Scope to filter by difficulty.
     *
     * @param  Builder<BriggsTrainingScenario>  $query
     * @return Builder<BriggsTrainingScenario>
     */
    public function scopeDifficulty(Builder $query, string $difficulty): Builder
    {
        return $query->where('difficulty', $difficulty);
    }
}
