<?php

use App\Http\Controllers\Api\AdminDataController;
use App\Http\Controllers\Api\AiAgentMediaController;
use App\Http\Controllers\Api\Carbon\CarbonController;
use App\Http\Controllers\Api\Carbon\CarbonPixelController;
use App\Http\Controllers\Api\Carbon\CarbonReportController;
use App\Http\Controllers\Api\PartnerDashboardController;
use App\Http\Controllers\Api\PartnerSettingsController;
use App\Http\Controllers\Api\PaymentSettingsController;
use App\Http\Controllers\Api\Portal\PortalAccountController;
use App\Http\Controllers\Api\Portal\PortalActivityController;
use App\Http\Controllers\Api\Portal\PortalAgentsController;
use App\Http\Controllers\Api\Portal\PortalBillingController;
use App\Http\Controllers\Api\Portal\PortalBrowseController;
use App\Http\Controllers\Api\Portal\PortalChatController;
use App\Http\Controllers\Api\Portal\PortalProfileController;
use App\Http\Controllers\Api\Portal\PortalStatsController;
use App\Http\Controllers\Api\Portal\PortalSubdomainController;
use App\Http\Controllers\Api\Portal\PortalSuggestionsController;
use App\Http\Controllers\Api\Portal\PortalSupportController;
use App\Http\Controllers\Api\Portal\PortalTenantController;
use App\Http\Controllers\Api\PublicDataController;
use App\Http\Controllers\Api\SystemConfigController;
use App\Http\Controllers\Api\UserPasswordController;
use App\Http\Controllers\Api\ViewPreferencesController;
use App\Http\Controllers\Auth\SessionController;
use App\Http\Controllers\CynergistsPageController;
use App\Http\Middleware\EnsureAdminUser;
use Illuminate\Support\Facades\Route;

Route::get('/', [CynergistsPageController::class, 'page'])
    ->defaults('component', 'Index')
    ->name('home');

Route::get('/marketplace', [CynergistsPageController::class, 'page'])->defaults('component', 'Marketplace');
Route::get('/marketplace/{slug}', [CynergistsPageController::class, 'page'])->defaults('component', 'AgentDetail');
Route::get('/partner/linkedin-outreach/checkout', [CynergistsPageController::class, 'page'])->defaults('component', 'PartnerLinkedInCheckout');
Route::get('/quick-checkout', [CynergistsPageController::class, 'page'])->defaults('component', 'QuickCheckout');
Route::get('/checkout', [CynergistsPageController::class, 'page'])->defaults('component', 'Checkout');
Route::get('/cart', [CynergistsPageController::class, 'page'])->defaults('component', 'Cart');
Route::get('/sign-agreement', [CynergistsPageController::class, 'page'])->defaults('component', 'SignAgreement');
Route::get('/terms', [CynergistsPageController::class, 'page'])->defaults('component', 'Terms');
Route::get('/privacy', [CynergistsPageController::class, 'page'])->defaults('component', 'Privacy');
Route::get('/signin', [CynergistsPageController::class, 'page'])->defaults('component', 'auth/SignIn');
Route::get('/welcome', function (Illuminate\Http\Request $request) {
    return Inertia\Inertia::render('auth/reset-password', [
        'email' => $request->email,
        'token' => $request->token,
        'isNewUser' => true,
    ]);
})->name('welcome');
Route::get('/change-password', [CynergistsPageController::class, 'page'])->defaults('component', 'auth/ChangePassword')->middleware('auth');
Route::get('/signup/client', [CynergistsPageController::class, 'page'])->defaults('component', 'auth/SignUpClient');
Route::get('/signup/partner', [CynergistsPageController::class, 'page'])->defaults('component', 'auth/SignUpPartner');
Route::get('/partner-signup', [CynergistsPageController::class, 'page'])->defaults('component', 'auth/SignUpPartner');
Route::get('/signup/partner/apply', [CynergistsPageController::class, 'page'])->defaults('component', 'auth/PartnerApplication');
Route::get('/signup/partner/thank-you', [CynergistsPageController::class, 'page'])->defaults('component', 'auth/PartnerApplicationThankYou');
Route::redirect('/dashboard', '/portal');
Route::post('/signin', [SessionController::class, 'store'])->name('signin');
Route::post('/logout', [SessionController::class, 'destroy'])->middleware('auth')->name('logout');

Route::get('/partner', [CynergistsPageController::class, 'page'])->defaults('component', 'partner/Dashboard');
Route::get('/partner/referrals', [CynergistsPageController::class, 'page'])->defaults('component', 'partner/Referrals');
Route::get('/partner/deals', [CynergistsPageController::class, 'page'])->defaults('component', 'partner/Deals');
Route::get('/partner/commissions', [CynergistsPageController::class, 'page'])->defaults('component', 'partner/Commissions');
Route::get('/partner/payouts', [CynergistsPageController::class, 'page'])->defaults('component', 'partner/Payouts');
Route::get('/partner/marketing', [CynergistsPageController::class, 'page'])->defaults('component', 'partner/Marketing');
Route::get('/partner/reports', [CynergistsPageController::class, 'page'])->defaults('component', 'partner/Reports');
Route::get('/partner/tickets', [CynergistsPageController::class, 'page'])->defaults('component', 'partner/Tickets');
Route::get('/partner/settings', [CynergistsPageController::class, 'page'])->defaults('component', 'partner/Settings');
Route::get('/partner/beta', [CynergistsPageController::class, 'page'])->defaults('component', 'partner/Beta');
Route::get('/partner/verify-email', [CynergistsPageController::class, 'page'])->defaults('component', 'partner/VerifyEmail');
Route::get('/partner/marketplace', [CynergistsPageController::class, 'page'])->defaults('component', 'partner/Marketplace');

Route::get('/portal/onboarding', [CynergistsPageController::class, 'page'])->defaults('component', 'portal/Workspace');
Route::get('/portal', [CynergistsPageController::class, 'page'])->defaults('component', 'portal/Workspace');
Route::get('/portal/agents', [CynergistsPageController::class, 'page'])->defaults('component', 'portal/Workspace');
Route::get('/portal/agents/{agentId}/chat', [CynergistsPageController::class, 'page'])->defaults('component', 'portal/Workspace');
Route::get('/portal/browse', [CynergistsPageController::class, 'page'])->defaults('component', 'portal/Workspace');
Route::get('/portal/roadmap', [CynergistsPageController::class, 'page'])->defaults('component', 'portal/Workspace');
Route::get('/portal/suggest', [CynergistsPageController::class, 'page'])->defaults('component', 'portal/Workspace');
Route::get('/portal/settings', [CynergistsPageController::class, 'page'])->defaults('component', 'portal/Workspace');
Route::get('/portal/support', [CynergistsPageController::class, 'page'])->defaults('component', 'portal/Workspace');
Route::get('/portal/billing', [CynergistsPageController::class, 'page'])->defaults('component', 'portal/Workspace');
Route::get('/portal/activity', [CynergistsPageController::class, 'page'])->defaults('component', 'portal/Workspace');
Route::get('/portal/integrations', [CynergistsPageController::class, 'page'])->defaults('component', 'portal/Workspace');
Route::get('/portal/account', [CynergistsPageController::class, 'page'])->defaults('component', 'portal/Account');
Route::get('/portal/seo-engine', [CynergistsPageController::class, 'page'])->defaults('component', 'portal/SeoEngine');
Route::redirect('/portal/admin', '/filament');

Route::get('/sales-rep', [CynergistsPageController::class, 'page'])->defaults('component', 'dashboard/SalesRepPortal');
Route::get('/employee', [CynergistsPageController::class, 'page'])->defaults('component', 'dashboard/EmployeePortal');

Route::redirect('/admin', '/filament');
Route::redirect('/admin/dashboard', '/filament');

Route::middleware(['auth', EnsureAdminUser::class])->group(function () {
    Route::get('/reports/seo/{report}', [CarbonReportController::class, 'show'])->name('reports.seo.show');
    Route::get('/reports/seo/{report}/download', [CarbonReportController::class, 'download'])->name('reports.seo.download');
});

Route::get('/api/portal/tenant/by-subdomain', [PortalTenantController::class, 'showBySubdomain']);
Route::get('/seo/pixel/{trackingId}.js', [CarbonPixelController::class, 'script'])->name('seo.pixel.script');

Route::prefix('api')->group(function () {
    Route::match(['post', 'options'], '/seo/pixel/{trackingId}/collect', [CarbonPixelController::class, 'collect']);
    Route::get('/public/plans', [PublicDataController::class, 'activePlans']);
    Route::get('/public/plans/{slug}', [PublicDataController::class, 'planBySlug']);
    Route::get('/public/products', [PublicDataController::class, 'activeProducts']);
    Route::get('/public/products/slug/{slug}', [PublicDataController::class, 'productBySlug']);
    Route::get('/public/products/sku/{sku}', [PublicDataController::class, 'productBySku']);
    Route::get('/public/products/id/{id}', [PublicDataController::class, 'productById']);
    Route::get('/public/products/category/{name}', [PublicDataController::class, 'productsByCategory']);
    Route::post('/public/products/categories', [PublicDataController::class, 'productsByCategories']);
    Route::get('/public/agents', [PublicDataController::class, 'activeAgents']);
    Route::get('/public/agents/{slug}', [PublicDataController::class, 'agentBySlug']);
});

Route::middleware('auth')->prefix('api')->group(function () {
    Route::get('/view-preferences/{table}', [ViewPreferencesController::class, 'show']);
    Route::post('/view-preferences/{table}', [ViewPreferencesController::class, 'store']);
    Route::get('/system-config/{key}', [SystemConfigController::class, 'show']);
    Route::get('/system-config', [SystemConfigController::class, 'index']);
    Route::put('/system-config/{key}', [SystemConfigController::class, 'update']);
    Route::get('/notifications/counts', [SystemConfigController::class, 'notificationCounts']);
    Route::get('/payment-settings', [PaymentSettingsController::class, 'show']);
    Route::get('/admin/payment-settings', [PaymentSettingsController::class, 'adminShow']);
    Route::put('/admin/payment-settings', [PaymentSettingsController::class, 'update']);
    Route::post('/partners/{partner}/w9', [PartnerSettingsController::class, 'uploadW9']);
    Route::post('/partner/magic-link', [PartnerSettingsController::class, 'sendMagicLink']);
    Route::patch('/user/password', [UserPasswordController::class, 'update'])
        ->middleware('throttle:5,1'); // 5 attempts per minute
    Route::get('/partner-dashboard/{partner}', [PartnerDashboardController::class, 'show']);

    Route::prefix('portal')->group(function () {
        Route::get('/stats', [PortalStatsController::class, 'show']);
        Route::get('/agents', [PortalAgentsController::class, 'index']);
        Route::get('/agents/{agent}', [PortalAgentsController::class, 'show']);
        Route::put('/agents/{agent}/configuration', [PortalAgentsController::class, 'updateConfiguration']);
        Route::get('/agents/{agent}/conversation', [PortalChatController::class, 'conversation']);
        Route::post('/agents/{agent}/message', [PortalChatController::class, 'sendMessage']);
        Route::post('/agents/{agent}/files', [PortalChatController::class, 'uploadFile']);
        Route::delete('/agents/{agent}/conversation', [PortalChatController::class, 'clearConversation']);
        Route::get('/luna/images/{imageId}/status', [PortalChatController::class, 'lunaImageStatus']);
        Route::get('/browse', [PortalBrowseController::class, 'index']);
        Route::get('/seo/overview', [CarbonController::class, 'overview']);
        Route::post('/seo/sites', [CarbonController::class, 'storeSite']);
        Route::post('/seo/sites/{site}/pixel-install', [CarbonController::class, 'updatePixelInstall']);
        Route::post('/seo/recommendations/{recommendation}/decision', [CarbonController::class, 'decideRecommendation']);
        Route::post('/seo/reports/generate', [CarbonController::class, 'generateReport']);
        Route::get('/seo/reports/{report}/download', [CarbonController::class, 'downloadReport']);
        Route::get('/billing', [PortalBillingController::class, 'index']);
        Route::get('/activity', [PortalActivityController::class, 'index']);
        Route::get('/tenant', [PortalTenantController::class, 'show']);
        Route::post('/tenant/check-subdomain', [PortalSubdomainController::class, 'check']);
        Route::post('/tenant/claim-subdomain', [PortalSubdomainController::class, 'claim']);
        Route::get('/profile', [PortalProfileController::class, 'show']);
        Route::put('/profile', [PortalProfileController::class, 'update']);
        Route::post('/suggestions', [PortalSuggestionsController::class, 'store']);
        Route::get('/support/agent-names', [PortalSupportController::class, 'agentNames']);
        Route::post('/support', [PortalSupportController::class, 'store']);
        Route::get('/account', [PortalAccountController::class, 'index']);
        Route::post('/account/unsubscribe/{agent}', [PortalAccountController::class, 'unsubscribe']);
    });
});

Route::middleware(['auth', EnsureAdminUser::class])->prefix('api')->group(function () {
    Route::match(['get', 'post', 'delete'], '/admin-data', AdminDataController::class);
    Route::post('/admin/ai-agents/media', [AiAgentMediaController::class, 'store']);
});

require __DIR__.'/settings.php';
Route::fallback([CynergistsPageController::class, 'page'])->defaults('component', 'NotFound');
