<?php

use App\Http\Controllers\Api\Apex\ActivityLogController;
use App\Http\Controllers\Api\Apex\CampaignController;
use App\Http\Controllers\Api\Apex\LinkedInController;
use App\Http\Controllers\Api\Apex\PendingActionController;
use App\Http\Controllers\Api\Apex\ProspectController;
use App\Http\Controllers\Api\CheckoutController;
use App\Http\Controllers\Api\PartnerDataController;
use App\Http\Controllers\Api\PaymentController;
use App\Http\Controllers\Api\PublicChatController;
use App\Http\Controllers\Api\SpecterController;
use App\Http\Controllers\Api\SquareWebhookController;
use App\Http\Controllers\Api\UserCynergistStatusController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');

Route::get('/user-cynergist-status', UserCynergistStatusController::class);

/*
|--------------------------------------------------------------------------
| Public Chat API Routes
|--------------------------------------------------------------------------
*/
Route::post('/chat', [PublicChatController::class, 'chat']);
Route::post('/specter/ingest', [SpecterController::class, 'ingest']);

/*
|--------------------------------------------------------------------------
| Checkout API Routes
|--------------------------------------------------------------------------
*/
Route::prefix('checkout')->group(function () {
    Route::post('/check-email', [CheckoutController::class, 'checkEmail']);
    Route::post('/register', [CheckoutController::class, 'register']);
});

/*
|--------------------------------------------------------------------------
| Payment API Routes
|--------------------------------------------------------------------------
*/
Route::prefix('payment')->group(function () {
    Route::get('/config', [PaymentController::class, 'getConfig']);
    Route::post('/process', [PaymentController::class, 'processPayment']);
});

/*
|--------------------------------------------------------------------------
| Square Webhook Routes
|--------------------------------------------------------------------------
*/
Route::post('/webhooks/square', [SquareWebhookController::class, 'handle']);

/*
|--------------------------------------------------------------------------
| Apex API Routes
|--------------------------------------------------------------------------
*/
Route::prefix('apex')->middleware('auth:sanctum')->group(function () {
    // LinkedIn Account Management
    Route::get('/linkedin', [LinkedInController::class, 'index']);
    Route::post('/linkedin/connect', [LinkedInController::class, 'connect']);
    Route::post('/linkedin/connect-credentials', [LinkedInController::class, 'connectWithCredentials']);
    Route::post('/linkedin/callback', [LinkedInController::class, 'callback']);
    Route::get('/linkedin/{account}/status', [LinkedInController::class, 'status']);
    Route::post('/linkedin/{account}/checkpoint', [LinkedInController::class, 'solveCheckpoint']);
    Route::delete('/linkedin/{account}', [LinkedInController::class, 'disconnect']);

    // LinkedIn Chats & Messages
    Route::get('/linkedin/chats', [LinkedInController::class, 'chats']);
    Route::get('/linkedin/chats/{chat}/messages', [LinkedInController::class, 'chatMessages']);
    Route::post('/linkedin/chats/{chat}/messages', [LinkedInController::class, 'sendChatMessage']);

    // Campaigns
    Route::apiResource('campaigns', CampaignController::class);
    Route::post('/campaigns/{campaign}/start', [CampaignController::class, 'start']);
    Route::post('/campaigns/{campaign}/pause', [CampaignController::class, 'pause']);
    Route::post('/campaigns/{campaign}/complete', [CampaignController::class, 'complete']);
    Route::post('/campaigns/{campaign}/restart', [CampaignController::class, 'restart']);
    Route::get('/campaigns/{campaign}/stats', [CampaignController::class, 'stats']);
    Route::post('/sync', [CampaignController::class, 'sync']);

    // Prospects
    Route::apiResource('prospects', ProspectController::class);
    Route::post('/prospects/bulk', [ProspectController::class, 'bulkStore']);
    Route::post('/prospects/{prospect}/add-to-campaign', [ProspectController::class, 'addToCampaign']);
    Route::post('/prospects/{prospect}/remove-from-campaign', [ProspectController::class, 'removeFromCampaign']);

    // Pending Actions
    Route::get('/pending-actions', [PendingActionController::class, 'index']);
    Route::get('/pending-actions/{action}', [PendingActionController::class, 'show']);
    Route::post('/pending-actions/{action}/approve', [PendingActionController::class, 'approve']);
    Route::post('/pending-actions/{action}/deny', [PendingActionController::class, 'deny']);
    Route::post('/pending-actions/approve-multiple', [PendingActionController::class, 'approveMultiple']);
    Route::post('/pending-actions/deny-multiple', [PendingActionController::class, 'denyMultiple']);
    Route::post('/pending-actions/approve-all', [PendingActionController::class, 'approveAll']);
    Route::post('/pending-actions/deny-all', [PendingActionController::class, 'denyAll']);

    // Activity Logs
    Route::get('/activity-logs', [ActivityLogController::class, 'index']);
});

/*
|--------------------------------------------------------------------------
| Briggs API Routes
|--------------------------------------------------------------------------
*/
Route::prefix('briggs')->middleware('auth:sanctum')->group(function () {
    Route::get('/scenarios', [\App\Http\Controllers\Api\Briggs\BriggsController::class, 'scenarios']);
    Route::get('/sessions', [\App\Http\Controllers\Api\Briggs\BriggsController::class, 'sessions']);
    Route::get('/sessions/{session}', [\App\Http\Controllers\Api\Briggs\BriggsController::class, 'sessionDetail']);
});

/*
|--------------------------------------------------------------------------
| Portal API Routes (Voice & Chat)
|--------------------------------------------------------------------------
*/
Route::middleware('auth:sanctum')->prefix('portal')->group(function () {
    // Voice routes
    Route::post('/voice/{agentId}', [\App\Http\Controllers\Api\Portal\VoiceController::class, 'processVoiceMessage']);
    Route::get('/voice/tts/{jobId}', [\App\Http\Controllers\Api\Portal\VoiceController::class, 'checkTtsStatus']);

    // Chat routes
    Route::get('/agents/{agent}/conversation', [\App\Http\Controllers\Api\Portal\PortalChatController::class, 'conversation']);
    Route::post('/agents/{agent}/message', [\App\Http\Controllers\Api\Portal\PortalChatController::class, 'sendMessage']);
    Route::post('/agents/{agent}/files', [\App\Http\Controllers\Api\Portal\PortalChatController::class, 'uploadFile']);
    Route::delete('/agents/{agent}/conversation', [\App\Http\Controllers\Api\Portal\PortalChatController::class, 'clearConversation']);
    Route::get('/luna/images/{imageId}/status', [\App\Http\Controllers\Api\Portal\PortalChatController::class, 'lunaImageStatus']);

    // Specter operations
    Route::prefix('specter')->group(function () {
        Route::post('/score', [\App\Http\Controllers\Api\Portal\SpecterOpsController::class, 'score']);
        Route::post('/resolve', [\App\Http\Controllers\Api\Portal\SpecterOpsController::class, 'resolveIdentity']);
        Route::post('/sync', [\App\Http\Controllers\Api\Portal\SpecterOpsController::class, 'sync']);
        Route::post('/escalate', [\App\Http\Controllers\Api\Portal\SpecterOpsController::class, 'escalate']);
        Route::post('/trigger', [\App\Http\Controllers\Api\Portal\SpecterOpsController::class, 'trigger']);
        Route::get('/rules', [\App\Http\Controllers\Api\Portal\SpecterOpsController::class, 'rules']);
        Route::put('/rules', [\App\Http\Controllers\Api\Portal\SpecterOpsController::class, 'upsertRules']);
    });
});

/*
|--------------------------------------------------------------------------
| Partner Portal API Routes
|--------------------------------------------------------------------------
*/
Route::middleware('auth:sanctum')->prefix('partner')->group(function () {
    Route::get('/commissions', [PartnerDataController::class, 'commissions']);
    Route::get('/payouts', [PartnerDataController::class, 'payouts']);
    Route::get('/referrals', [PartnerDataController::class, 'referrals']);
    Route::post('/referrals', [PartnerDataController::class, 'createReferral']);
    Route::get('/deals', [PartnerDataController::class, 'deals']);
    Route::get('/marketing-assets', [PartnerDataController::class, 'marketingAssets']);
    Route::get('/scheduled-reports', [PartnerDataController::class, 'scheduledReports']);
});
