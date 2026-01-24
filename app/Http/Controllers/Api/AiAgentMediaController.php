<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class AiAgentMediaController extends Controller
{
    public function store(Request $request): JsonResponse
    {
        $request->validate([
            'file' => ['required', 'file', 'max:51200', 'mimes:jpg,jpeg,png,webp,mp4,mov,webm'],
        ]);

        $file = $request->file('file');
        $path = $file->store('agent-media', 'public');

        $relativeUrl = Storage::disk('public')->url($path);
        $baseUrl = rtrim((string) config('app.url'), '/');
        $absoluteUrl = str_starts_with($relativeUrl, 'http')
            ? $relativeUrl
            : ($baseUrl !== '' ? $baseUrl.$relativeUrl : $request->getSchemeAndHttpHost().$relativeUrl);

        return response()->json([
            'url' => $absoluteUrl,
        ]);
    }
}
