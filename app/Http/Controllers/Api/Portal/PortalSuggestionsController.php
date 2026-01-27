<?php

namespace App\Http\Controllers\Api\Portal;

use App\Http\Controllers\Controller;
use App\Http\Requests\Portal\StoreSuggestionRequest;
use App\Models\AgentSuggestion;
use App\Models\PortalTenant;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Str;

class PortalSuggestionsController extends Controller
{
    public function store(StoreSuggestionRequest $request): JsonResponse
    {
        $user = $request->user();
        if (! $user) {
            return response()->json(['success' => false], 401);
        }

        $tenant = PortalTenant::forUser($user);

        $suggestion = AgentSuggestion::query()->create([
            'id' => (string) Str::uuid(),
            'user_id' => $user->id,
            'customer_id' => $tenant?->id,
            'agent_name' => $request->validated('agent_name'),
            'category' => $request->validated('category'),
            'description' => $request->validated('description'),
            'use_case' => $request->validated('use_case'),
            'status' => 'pending',
        ]);

        return response()->json([
            'success' => true,
            'id' => $suggestion->id,
        ]);
    }
}
