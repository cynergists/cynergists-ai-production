<?php

namespace App\Http\Controllers\Api\Portal;

use App\Http\Controllers\Controller;
use App\Models\SupportRequest;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\Rule;

class PortalSupportController extends Controller
{
    public function store(Request $request)
    {
        $validated = $request->validate([
            'category' => ['required', 'string', Rule::in(['general', 'technical', 'billing', 'feature_request', 'other'])],
            'subject' => ['required', 'string', 'max:200'],
            'message' => ['required', 'string', 'max:5000'],
        ]);

        $user = $request->user();

        // Create the support request in the database
        $supportRequest = SupportRequest::create([
            'user_id' => $user->id,
            'category' => $validated['category'],
            'subject' => $validated['subject'],
            'message' => $validated['message'],
            'status' => 'open',
        ]);

        // Log the support request
        Log::info('Portal support request submitted', [
            'support_request_id' => $supportRequest->id,
            'user_id' => $user->id,
            'user_email' => $user->email,
            'user_name' => $user->name,
            'category' => $validated['category'],
            'subject' => $validated['subject'],
        ]);

        // TODO: Send email notification to support team
        // You can implement email sending here using Mail::send() or create a notification

        return response()->json([
            'success' => true,
            'message' => 'Your support request has been submitted. We\'ll get back to you shortly.',
        ]);
    }
}
