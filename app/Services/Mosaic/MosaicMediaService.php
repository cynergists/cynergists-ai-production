<?php

namespace App\Services\Mosaic;

use App\Models\PortalTenant;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class MosaicMediaService
{
    private const MAX_IMAGE_KB = 350;

    private const MAX_VIDEO_MB = 50;

    /**
     * @return array{url: string, path: string, warnings: array<string>}
     */
    public function processImage(UploadedFile $file, PortalTenant $tenant): array
    {
        $warnings = [];
        $originalSize = $file->getSize() / 1024;

        if ($originalSize > self::MAX_IMAGE_KB) {
            $warnings[] = "Image size ({$originalSize}KB) exceeds recommended limit (".self::MAX_IMAGE_KB.'KB). Consider optimizing.';
        }

        $filename = Str::uuid().'.webp';
        $path = "tenants/{$tenant->id}/mosaic_assets/{$filename}";

        if (function_exists('imagecreatefromstring') && function_exists('imagewebp')) {
            $image = imagecreatefromstring($file->get());
            if ($image !== false) {
                $tempPath = storage_path("app/{$path}");
                $directory = dirname($tempPath);
                if (! is_dir($directory)) {
                    mkdir($directory, 0755, true);
                }

                imagewebp($image, $tempPath, 85);
                imagedestroy($image);

                $convertedSize = filesize($tempPath) / 1024;
                if ($convertedSize > self::MAX_IMAGE_KB) {
                    $warnings[] = "Converted image ({$convertedSize}KB) still exceeds limit. Manual optimization recommended.";
                }
            } else {
                Storage::put($path, $file->get());
            }
        } else {
            Storage::put($path, $file->get());
            $warnings[] = 'WebP conversion unavailable. Image stored as-is. Install GD extension for optimization.';
        }

        return [
            'url' => Storage::url($path),
            'path' => $path,
            'warnings' => $warnings,
        ];
    }

    /**
     * @return array{url: string, path: string, warnings: array<string>}
     */
    public function processVideo(UploadedFile $file, PortalTenant $tenant): array
    {
        $warnings = [];
        $originalSize = $file->getSize() / 1024 / 1024;

        if ($originalSize > self::MAX_VIDEO_MB) {
            $warnings[] = "Video size ({$originalSize}MB) exceeds recommended limit (".self::MAX_VIDEO_MB.'MB). Compression strongly recommended.';
        }

        $extension = $file->getClientOriginalExtension();
        $filename = Str::uuid().'.'.$extension;
        $path = "tenants/{$tenant->id}/mosaic_assets/{$filename}";

        Storage::put($path, $file->get());

        return [
            'url' => Storage::url($path),
            'path' => $path,
            'warnings' => $warnings,
        ];
    }

    /**
     * @return array<string>
     */
    public function validatePerformanceThreshold(UploadedFile $file): array
    {
        $warnings = [];
        $sizeKb = $file->getSize() / 1024;
        $mimeType = $file->getMimeType();

        if (str_starts_with($mimeType ?? '', 'image/') && $sizeKb > self::MAX_IMAGE_KB) {
            $warnings[] = "Image exceeds {$sizeKb}KB (max: ".self::MAX_IMAGE_KB.'KB)';
        }

        if (str_starts_with($mimeType ?? '', 'video/') && ($sizeKb / 1024) > self::MAX_VIDEO_MB) {
            $warnings[] = 'Video exceeds '.($sizeKb / 1024).'MB (max: '.self::MAX_VIDEO_MB.'MB)';
        }

        return $warnings;
    }
}
