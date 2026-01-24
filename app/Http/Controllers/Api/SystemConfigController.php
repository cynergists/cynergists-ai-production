<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Str;

class SystemConfigController extends Controller
{
    public function show(string $key): JsonResponse
    {
        if (! Schema::hasTable('system_config')) {
            return response()->json(['key' => $key, 'value' => null]);
        }

        $record = DB::table('system_config')->where('key', $key)->first();

        return response()->json([
            'key' => $key,
            'value' => $record->value ?? null,
        ]);
    }

    public function index(): JsonResponse
    {
        if (! Schema::hasTable('system_config')) {
            return response()->json([]);
        }

        return response()->json(DB::table('system_config')->get());
    }

    public function update(Request $request, string $key): JsonResponse
    {
        if (! Schema::hasTable('system_config')) {
            return response()->json(['success' => true]);
        }

        $value = $request->input('value');
        $payload = [
            'value' => is_string($value) ? $value : json_encode($value),
            'updated_at' => now(),
        ];

        $existing = DB::table('system_config')->where('key', $key)->first();

        if (! $existing) {
            DB::table('system_config')->insert([
                'id' => (string) Str::uuid(),
                'key' => $key,
                'value' => $payload['value'],
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        } else {
            DB::table('system_config')->where('key', $key)->update($payload);
        }

        return response()->json(['success' => true]);
    }

    public function notificationCounts(): JsonResponse
    {
        if (! Schema::hasTable('notifications')) {
            return response()->json(['count' => 0, 'criticalCount' => 0]);
        }

        $count = DB::table('notifications')
            ->whereNull('resolved_at')
            ->count();

        $criticalCount = DB::table('notifications')
            ->whereNull('resolved_at')
            ->where('severity', 'critical')
            ->count();

        return response()->json([
            'count' => $count,
            'criticalCount' => $criticalCount,
        ]);
    }
}
