<?php

namespace App\Http\Controllers\Api\Portal;

use App\Http\Controllers\Controller;
use App\Http\Requests\Portal\StoreSupportRequest;
use App\Models\PortalAvailableAgent;
use App\Models\SupportRequest;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Log;

class PortalSupportController extends Controller
{
    public function store(StoreSupportRequest $request): JsonResponse
    {
        $validated = $request->validated();
        $user = $request->user();

        $supportRequest = SupportRequest::create([
            'user_id' => $user->id,
            'category' => $validated['category'],
            'agent_name' => $validated['agent_name'] ?? null,
            'subject' => $validated['subject'],
            'message' => $validated['message'],
            'status' => 'open',
        ]);

        Log::info('Portal support request submitted', [
            'support_request_id' => $supportRequest->id,
            'user_id' => $user->id,
            'user_email' => $user->email,
            'user_name' => $user->name,
            'category' => $validated['category'],
            'agent_name' => $validated['agent_name'] ?? null,
            'subject' => $validated['subject'],
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Your support request has been submitted. We\'ll get back to you shortly.',
        ]);
    }

    public function agentNames(): JsonResponse
    {
        $agents = PortalAvailableAgent::query()
            ->where('is_active', true)
            ->orderBy('name')
            ->pluck('name');

        return response()->json([
            'agents' => $agents,
        ]);
    }
}
