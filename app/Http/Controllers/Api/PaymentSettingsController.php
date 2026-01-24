<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Str;

class PaymentSettingsController extends Controller
{
    public function show(): JsonResponse
    {
        if (! Schema::hasTable('payment_settings')) {
            return response()->json([
                'paymentMode' => 'sandbox',
                'creditCardFeeRate' => 0.033,
            ]);
        }

        $record = DB::table('payment_settings')->orderByDesc('updated_at')->first();

        return response()->json([
            'paymentMode' => $record->payment_mode ?? 'sandbox',
            'creditCardFeeRate' => (float) ($record->credit_card_fee_rate ?? 0.033),
        ]);
    }

    public function adminShow(): JsonResponse
    {
        if (! Schema::hasTable('payment_settings')) {
            return response()->json([
                'id' => null,
                'paymentMode' => 'sandbox',
                'creditCardFeeRate' => 0.033,
                'updatedAt' => null,
            ]);
        }

        $record = DB::table('payment_settings')->orderByDesc('updated_at')->first();

        return response()->json([
            'id' => $record->id ?? null,
            'paymentMode' => $record->payment_mode ?? 'sandbox',
            'creditCardFeeRate' => (float) ($record->credit_card_fee_rate ?? 0.033),
            'updatedAt' => $record->updated_at ?? null,
        ]);
    }

    public function update(Request $request): JsonResponse
    {
        if (! Schema::hasTable('payment_settings')) {
            return response()->json(['success' => true]);
        }

        $data = $request->validate([
            'paymentMode' => ['nullable', 'string'],
            'creditCardFeeRate' => ['nullable', 'numeric'],
        ]);

        $payload = [
            'payment_mode' => $data['paymentMode'] ?? 'sandbox',
            'credit_card_fee_rate' => $data['creditCardFeeRate'] ?? 0.033,
            'updated_at' => now(),
        ];

        $existing = DB::table('payment_settings')->orderByDesc('updated_at')->first();

        if ($existing) {
            DB::table('payment_settings')->where('id', $existing->id)->update($payload);
        } else {
            DB::table('payment_settings')->insert(array_merge($payload, [
                'id' => (string) Str::uuid(),
                'created_at' => now(),
            ]));
        }

        return response()->json(['success' => true]);
    }
}
