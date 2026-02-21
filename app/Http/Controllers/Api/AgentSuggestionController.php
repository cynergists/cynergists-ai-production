<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Validator;

class AgentSuggestionController extends Controller
{
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'email' => 'required|email|max:255',
            'agentName' => 'required|string|max:255',
            'description' => 'required|string',
            'useCase' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'errors' => $validator->errors(),
            ], 422);
        }

        $data = $validator->validated();

        try {
            // Send email to chris@cynergists.com
            Mail::send('emails.agent-suggestion', $data, function ($message) use ($data) {
                $message->to('chris@cynergists.com')
                    ->subject('New Agent Suggestion: ' . $data['agentName'])
                    ->replyTo($data['email'], $data['name']);
            });

            return response()->json([
                'message' => 'Agent suggestion submitted successfully',
            ], 200);
        } catch (\Exception $e) {
            \Log::error('Failed to send agent suggestion email: ' . $e->getMessage());

            return response()->json([
                'message' => 'Failed to submit agent suggestion',
            ], 500);
        }
    }
}
