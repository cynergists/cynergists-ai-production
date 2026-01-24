<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Str;

class PublicDataController extends Controller
{
    public function activePlans(): JsonResponse
    {
        if (! Schema::hasTable('plans')) {
            return response()->json([]);
        }

        $plans = DB::table('plans')
            ->where('status', 'active')
            ->orderBy('display_order')
            ->get();

        return response()->json($plans);
    }

    public function planBySlug(string $slug): JsonResponse
    {
        if (! Schema::hasTable('plans')) {
            return response()->json(null);
        }

        $plan = DB::table('plans')
            ->where('slug', $slug)
            ->where('status', '!=', 'draft')
            ->first();

        return response()->json($plan);
    }

    public function activeProducts(): JsonResponse
    {
        if (! Schema::hasTable('products')) {
            return response()->json([]);
        }

        $products = DB::table('products')
            ->where('product_status', 'active')
            ->orderByDesc('created_at')
            ->get();

        return response()->json($products);
    }

    public function productBySlug(string $slug): JsonResponse
    {
        if (! Schema::hasTable('products')) {
            return response()->json(null);
        }

        $product = DB::table('products')
            ->where('slug', $slug)
            ->where('product_status', '!=', 'draft')
            ->first();

        return response()->json($product);
    }

    public function productBySku(string $sku): JsonResponse
    {
        if (! Schema::hasTable('products')) {
            return response()->json(null);
        }

        $product = DB::table('products')
            ->where('product_sku', $sku)
            ->where('product_status', '!=', 'draft')
            ->first();

        return response()->json($product);
    }

    public function productById(string $id): JsonResponse
    {
        if (! Schema::hasTable('products')) {
            return response()->json(null);
        }

        $product = DB::table('products')
            ->where('id', $id)
            ->where('product_status', '!=', 'draft')
            ->first();

        return response()->json($product);
    }

    public function productsByCategory(string $name): JsonResponse
    {
        if (! Schema::hasTable('products') || ! Schema::hasTable('categories')) {
            return response()->json([]);
        }

        $category = DB::table('categories')->where('name', $name)->first();
        if (! $category) {
            return response()->json([]);
        }

        $products = DB::table('products')
            ->where('category_id', $category->id)
            ->where('product_status', 'active')
            ->orderBy('product_name')
            ->get();

        return response()->json($products);
    }

    public function productsByCategories(Request $request): JsonResponse
    {
        $names = $request->input('names', []);

        if (! is_array($names) || $names === []) {
            return response()->json([]);
        }

        if (! Schema::hasTable('products') || ! Schema::hasTable('categories')) {
            return response()->json([]);
        }

        $categoryIds = DB::table('categories')
            ->whereIn('name', $names)
            ->pluck('id')
            ->all();

        if ($categoryIds === []) {
            return response()->json([]);
        }

        $products = DB::table('products')
            ->whereIn('category_id', $categoryIds)
            ->where('product_status', 'active')
            ->orderBy('product_name')
            ->get();

        return response()->json($products);
    }

    public function activeAgents(): JsonResponse
    {
        if (! Schema::hasTable('portal_available_agents')) {
            return response()->json([]);
        }

        $agents = DB::table('portal_available_agents')
            ->where('is_active', true)
            ->orderBy('sort_order')
            ->get()
            ->map(fn (object $agent): array => $this->mapAgentRecord($agent))
            ->values();

        return response()->json($agents);
    }

    public function agentBySlug(string $slug): JsonResponse
    {
        if (! Schema::hasTable('portal_available_agents')) {
            return response()->json(null);
        }

        $agent = null;

        if (Schema::hasColumn('portal_available_agents', 'slug')) {
            $agent = DB::table('portal_available_agents')
                ->where('slug', $slug)
                ->first();
        }

        if (! $agent) {
            $agent = DB::table('portal_available_agents')
                ->get()
                ->first(fn (object $row): bool => Str::slug((string) $row->name) === $slug);
        }

        if (! $agent) {
            return response()->json(null);
        }

        return response()->json($this->mapAgentRecord($agent));
    }

    /**
     * @return array<string, mixed>
     */
    private function mapAgentRecord(object $agent): array
    {
        $data = (array) $agent;

        foreach (['features', 'perfect_for', 'integrations', 'card_media', 'product_media', 'tiers', 'website_category'] as $field) {
            $value = $data[$field] ?? null;
            if (is_string($value)) {
                $decoded = json_decode($value, true);
                $data[$field] = is_array($decoded) ? $decoded : [];
            } elseif (is_array($value)) {
                $data[$field] = $value;
            } else {
                $data[$field] = [];
            }
        }

        $data['category'] = $data['category'] ?? 'General';
        $data['slug'] = $data['slug'] ?? null;
        $data['slug'] = $data['slug'] ?: Str::slug((string) ($data['name'] ?? 'agent'));

        return $data;
    }
}
