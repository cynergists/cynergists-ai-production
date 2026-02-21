<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\AgentCategory;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

/**
 * Agent Category Management (Admin Only)
 *
 * Per Google Doc Spec:
 * - Category MUST be dropdown (no typing)
 * - Admin-only management
 * - Can archive, not delete
 * - Each agent has exactly one category
 */
class AgentCategoryController extends Controller
{
    /**
     * Get all categories (including archived for admin).
     */
    public function index(Request $request): JsonResponse
    {
        $includeArchived = $request->boolean('include_archived', false);

        $categories = AgentCategory::query()
            ->when(!$includeArchived, fn ($q) => $q->where('is_archived', false))
            ->ordered()
            ->withCount('agents')
            ->get();

        return response()->json([
            'categories' => $categories->map(fn ($cat) => [
                'id' => $cat->id,
                'name' => $cat->name,
                'slug' => $cat->slug,
                'description' => $cat->description,
                'sort_order' => $cat->sort_order,
                'is_active' => $cat->is_active,
                'is_archived' => $cat->is_archived,
                'agents_count' => $cat->agents_count,
            ]),
        ]);
    }

    /**
     * Get active categories only (for dropdowns).
     */
    public function active(): JsonResponse
    {
        $categories = AgentCategory::active()
            ->ordered()
            ->get(['id', 'name', 'slug', 'description']);

        return response()->json([
            'categories' => $categories,
        ]);
    }

    /**
     * Create a new category.
     */
    public function store(Request $request): JsonResponse
    {
        $admin = $request->user();

        if (!$admin || !$admin->hasRole('admin')) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $validated = $request->validate([
            'name' => 'required|string|max:255|unique:agent_categories,name',
            'description' => 'nullable|string',
            'sort_order' => 'nullable|integer',
        ]);

        $category = AgentCategory::create([
            'name' => $validated['name'],
            'slug' => Str::slug($validated['name']),
            'description' => $validated['description'] ?? null,
            'sort_order' => $validated['sort_order'] ?? 999,
            'is_active' => true,
            'is_archived' => false,
        ]);

        return response()->json([
            'success' => true,
            'category' => $category,
        ]);
    }

    /**
     * Update a category.
     */
    public function update(Request $request, AgentCategory $category): JsonResponse
    {
        $admin = $request->user();

        if (!$admin || !$admin->hasRole('admin')) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $validated = $request->validate([
            'name' => 'sometimes|string|max:255|unique:agent_categories,name,' . $category->id,
            'description' => 'nullable|string',
            'sort_order' => 'nullable|integer',
            'is_active' => 'nullable|boolean',
        ]);

        if (isset($validated['name'])) {
            $validated['slug'] = Str::slug($validated['name']);
        }

        $category->update($validated);

        return response()->json([
            'success' => true,
            'category' => $category->fresh(),
        ]);
    }

    /**
     * Archive a category (cannot delete, per spec).
     */
    public function archive(Request $request, AgentCategory $category): JsonResponse
    {
        $admin = $request->user();

        if (!$admin || !$admin->hasRole('admin')) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $category->archive();

        return response()->json([
            'success' => true,
            'message' => 'Category archived. It cannot be assigned to new agents.',
        ]);
    }

    /**
     * Unarchive a category.
     */
    public function unarchive(Request $request, AgentCategory $category): JsonResponse
    {
        $admin = $request->user();

        if (!$admin || !$admin->hasRole('admin')) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $category->unarchive();

        return response()->json([
            'success' => true,
            'message' => 'Category unarchived and available for use.',
        ]);
    }

    /**
     * Reorder categories.
     */
    public function reorder(Request $request): JsonResponse
    {
        $admin = $request->user();

        if (!$admin || !$admin->hasRole('admin')) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $validated = $request->validate([
            'categories' => 'required|array',
            'categories.*.id' => 'required|exists:agent_categories,id',
            'categories.*.sort_order' => 'required|integer',
        ]);

        foreach ($validated['categories'] as $item) {
            AgentCategory::where('id', $item['id'])
                ->update(['sort_order' => $item['sort_order']]);
        }

        return response()->json([
            'success' => true,
            'message' => 'Categories reordered successfully.',
        ]);
    }
}
