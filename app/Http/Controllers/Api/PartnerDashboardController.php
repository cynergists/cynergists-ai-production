<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class PartnerDashboardController extends Controller
{
    public function show(Request $request, string $partnerId): JsonResponse
    {
        return response()->json([
            'total_referrals' => 0,
            'qualified_referrals' => 0,
            'pending_referrals' => 0,
            'total_deals' => 0,
            'open_deals' => 0,
            'closed_won_deals' => 0,
            'total_deal_value' => 0,
            'pending_commissions' => 0,
            'earned_commissions' => 0,
            'payable_commissions' => 0,
            'paid_commissions' => 0,
            'next_payout_date' => null,
            'next_payout_amount' => 0,
            'deals_new' => 0,
            'deals_in_progress' => 0,
            'deals_closed_won' => 0,
            'deals_closed_lost' => 0,
            'referrals_last_30_days' => 0,
            'earned_this_month' => 0,
            'paid_ytd' => 0,
        ]);
    }
}
