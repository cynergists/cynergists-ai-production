<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

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
}
