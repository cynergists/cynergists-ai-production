<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Coupon;
use App\Models\CouponAuditLog;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CouponController extends Controller
{
    public function index(): JsonResponse
    {
        $coupons = Coupon::withCount('redemptions')->orderBy('created_at', 'desc')->get();
        return response()->json(['coupons' => $coupons]);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'code' => 'required|string|max:50|unique:coupons,code',
            'description' => 'nullable|string',
            'discount_type' => 'required|in:free_trial,percentage',
            'discount_value' => 'required|integer|min:1',
            'duration_days' => 'nullable|integer',
            'valid_from' => 'required|date',
            'valid_until' => 'required|date|after:valid_from',
            'max_redemptions_per_customer' => 'required|integer|min:1',
            'max_redemptions_global' => 'nullable|integer',
            'customer_eligibility' => 'required|in:new_only,existing_only,both',
            'applicable_agent_ids' => 'nullable|array',
        ]);

        $validated['created_by'] = $request->user()->id;
        $coupon = Coupon::create($validated);
        CouponAuditLog::logEvent('created', $coupon->id, $request->user()->id);

        return response()->json(['success' => true, 'coupon' => $coupon]);
    }

    public function update(Request $request, Coupon $coupon): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'sometimes|string|max:255',
            'description' => 'nullable|string',
            'is_active' => 'sometimes|boolean',
        ]);

        $coupon->update($validated);
        CouponAuditLog::logEvent('updated', $coupon->id, $request->user()->id);

        return response()->json(['success' => true, 'coupon' => $coupon]);
    }

    public function destroy(Request $request, Coupon $coupon): JsonResponse
    {
        $coupon->delete();
        CouponAuditLog::logEvent('deleted', $coupon->id, $request->user()->id);
        return response()->json(['success' => true]);
    }

    public function validate(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'code' => 'required|string',
            'user_id' => 'required|string',
            'agent_id' => 'nullable|string',
        ]);

        $coupon = Coupon::where('code', strtoupper($validated['code']))->first();
        if (!$coupon) {
            return response()->json(['valid' => false, 'error' => 'Invalid coupon code.'], 404);
        }

        return response()->json($coupon->validate($validated['user_id'], $validated['agent_id'] ?? null));
    }

    public function redeem(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'code' => 'required|string',
            'user_id' => 'required|string',
            'agent_id' => 'nullable|string',
        ]);

        $coupon = Coupon::where('code', strtoupper($validated['code']))->first();
        if (!$coupon) {
            return response()->json(['success' => false, 'error' => 'Invalid coupon code.'], 404);
        }

        $result = $coupon->validate($validated['user_id'], $validated['agent_id'] ?? null);
        if (!$result['valid']) {
            return response()->json(['success' => false, 'error' => $result['error']], 400);
        }

        $redemption = $coupon->redemptions()->create([
            'user_id' => $validated['user_id'],
            'agent_id' => $validated['agent_id'] ?? null,
            'redeemed_at' => now(),
            'trial_days' => $coupon->discount_type === 'free_trial' ? $coupon->discount_value : null,
            'trial_ends_at' => $coupon->discount_type === 'free_trial' ? now()->addDays($coupon->discount_value) : null,
            'status' => 'active',
        ]);

        $coupon->incrementRedemptions();
        CouponAuditLog::logEvent('redeemed', $coupon->id, null, $validated['user_id']);

        return response()->json(['success' => true, 'redemption' => $redemption]);
    }
}
