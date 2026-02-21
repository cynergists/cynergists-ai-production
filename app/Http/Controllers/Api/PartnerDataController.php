<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Partner;
use App\Models\PartnerCommission;
use App\Models\PartnerDeal;
use App\Models\PartnerPayout;
use App\Models\PartnerReferral;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class PartnerDataController extends Controller
{
    /**
     * Get partner commissions
     */
    public function commissions(Request $request): JsonResponse
    {
        $partner = $this->getPartner($request);

        if (! $partner) {
            return response()->json(['error' => 'Partner not found'], 404);
        }

        $commissions = PartnerCommission::where('partner_id', $partner->id)
            ->with(['deal'])
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json($commissions);
    }

    /**
     * Get partner payouts
     */
    public function payouts(Request $request): JsonResponse
    {
        $partner = $this->getPartner($request);

        if (! $partner) {
            return response()->json(['error' => 'Partner not found'], 404);
        }

        $payouts = PartnerPayout::where('partner_id', $partner->id)
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json($payouts);
    }

    /**
     * Get partner referrals
     */
    public function referrals(Request $request): JsonResponse
    {
        $partner = $this->getPartner($request);

        if (! $partner) {
            return response()->json(['error' => 'Partner not found'], 404);
        }

        $referrals = PartnerReferral::where('partner_id', $partner->id)
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json($referrals);
    }

    /**
     * Create new referral
     */
    public function createReferral(Request $request): JsonResponse
    {
        $partner = $this->getPartner($request);

        if (! $partner) {
            return response()->json(['error' => 'Partner not found'], 404);
        }

        $validated = $request->validate([
            'email' => 'required|email',
            'company_name' => 'nullable|string',
            'first_name' => 'nullable|string',
            'last_name' => 'nullable|string',
            'phone' => 'nullable|string',
            'notes' => 'nullable|string',
        ]);

        $referral = PartnerReferral::create([
            'partner_id' => $partner->id,
            'email' => $validated['email'],
            'company_name' => $validated['company_name'] ?? null,
            'first_name' => $validated['first_name'] ?? null,
            'last_name' => $validated['last_name'] ?? null,
            'phone' => $validated['phone'] ?? null,
            'notes' => $validated['notes'] ?? null,
            'status' => 'pending',
        ]);

        return response()->json($referral, 201);
    }

    /**
     * Get partner deals
     */
    public function deals(Request $request): JsonResponse
    {
        $partner = $this->getPartner($request);

        if (! $partner) {
            return response()->json(['error' => 'Partner not found'], 404);
        }

        $deals = PartnerDeal::where('partner_id', $partner->id)
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json($deals);
    }

    /**
     * Get partner marketing assets
     */
    public function marketingAssets(Request $request): JsonResponse
    {
        $partner = $this->getPartner($request);

        if (! $partner) {
            return response()->json(['error' => 'Partner not found'], 404);
        }

        // Get marketing assets from partner settings or default assets
        $assets = [
            'referral_link' => route('partner.landing', ['code' => $partner->referral_code]),
            'assets' => $partner->settings['marketing_assets'] ?? [],
        ];

        return response()->json($assets);
    }

    /**
     * Get partner scheduled reports
     */
    public function scheduledReports(Request $request): JsonResponse
    {
        $partner = $this->getPartner($request);

        if (! $partner) {
            return response()->json(['error' => 'Partner not found'], 404);
        }

        // This would come from a PartnerScheduledReport model if it exists
        // For now, return empty array
        $reports = [];

        return response()->json($reports);
    }

    /**
     * Get partner from authenticated user
     */
    private function getPartner(Request $request): ?Partner
    {
        $user = $request->user();

        if (! $user) {
            return null;
        }

        return Partner::where('user_id', $user->id)->first();
    }
}
