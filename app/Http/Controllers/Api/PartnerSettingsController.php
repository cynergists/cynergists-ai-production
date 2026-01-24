<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Partner;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Password;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\Storage;

class PartnerSettingsController extends Controller
{
    public function uploadW9(Request $request, string $partnerId): JsonResponse
    {
        $request->validate([
            'w9' => ['required', 'file', 'mimes:pdf,png,jpg,jpeg', 'max:10240'],
        ]);

        $file = $request->file('w9');
        $path = $file->store('partner-documents', 'public');
        $url = Storage::disk('public')->url($path);

        if (Schema::hasTable('partners')) {
            Partner::query()
                ->where('id', $partnerId)
                ->update([
                    'w9_file_url' => $url,
                    'tax_status' => 'submitted',
                ]);
        }

        return response()->json(['url' => $url]);
    }

    public function sendMagicLink(Request $request): JsonResponse
    {
        $data = $request->validate([
            'email' => ['required', 'email'],
        ]);

        Password::sendResetLink(['email' => $data['email']]);

        return response()->json(['success' => true]);
    }
}
