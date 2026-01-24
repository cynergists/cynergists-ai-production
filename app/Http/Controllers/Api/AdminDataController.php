<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Partner;
use App\Models\PortalAvailableAgent;
use App\Models\User;
use App\Models\UserRole;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Str;

class AdminDataController extends Controller
{
    public function __invoke(Request $request): JsonResponse
    {
        $action = (string) $request->query('action', '');

        return match ($action) {
            'get_admin_users' => $this->getAdminUsers($request),
            'create_admin_user' => $this->createAdminUser($request),
            'update_admin_user' => $this->updateAdminUser($request),
            'delete_admin_user' => $this->deleteAdminUser($request),
            'get_companies' => response()->json([]),
            'get_user_login_history' => response()->json([]),
            'get_partners' => $this->getPartners($request),
            'create_partner' => $this->createPartner($request),
            'update_partner' => $this->updatePartner($request),
            'delete_partner' => $this->deletePartner($request),
            'get_calendars' => $this->getCalendars($request),
            'get_calendar' => $this->getCalendar($request),
            'create_calendar' => $this->createCalendar($request),
            'update_calendar' => $this->updateCalendar($request),
            'delete_calendar' => $this->deleteCalendar($request),
            'check_calendar_slug' => $this->checkCalendarSlug($request),
            'get_plans' => response()->json([]),
            'create_plan' => response()->json(['success' => true]),
            'update_plan' => response()->json(['success' => true]),
            'delete_plan' => response()->json(['success' => true]),
            'get_notes' => response()->json([]),
            'create_note' => response()->json(['success' => true]),
            'update_note' => response()->json(['success' => true]),
            'delete_note' => response()->json(['success' => true]),
            'get_agreements' => response()->json([]),
            'get_agent_categories' => $this->getAgentCategories(),
            'create_agent_category' => $this->createAgentCategory($request),
            'delete_agent_category' => $this->deleteAgentCategory($request),
            'get_ai_agents' => $this->getAiAgents(),
            'get_ai_agent' => $this->getAiAgent($request),
            'create_ai_agent' => $this->createAiAgent($request),
            'update_ai_agent' => $this->updateAiAgent($request),
            'delete_ai_agent' => $this->deleteAiAgent($request),
            'get_sessions' => response()->json([]),
            'get_page_views' => response()->json([]),
            'get_plan_interactions' => response()->json([]),
            'get_email_history' => response()->json([]),
            'get_active_template' => response()->json(null),
            'update_document_template' => response()->json(['success' => true]),
            'create_document_template' => response()->json(['success' => true]),
            'get_clients' => response()->json([
                'clients' => [],
                'total' => 0,
                'totalPages' => 0,
                'summary' => null,
            ]),
            'get_products' => response()->json([]),
            'create_product' => response()->json(['success' => true]),
            'update_product' => response()->json(['success' => true]),
            'delete_product' => response()->json(['success' => true]),
            'get_sales_reps' => response()->json([
                'salesReps' => [],
                'total' => 0,
                'totalPages' => 0,
                'summary' => [
                    'total' => 0,
                    'active' => 0,
                    'totalClients' => 0,
                    'totalRevenue' => 0,
                ],
            ]),
            'create_sales_rep' => response()->json(['success' => true]),
            'update_sales_rep' => response()->json(['success' => true]),
            'delete_sales_rep' => response()->json(['success' => true]),
            'get_prospects' => response()->json([
                'prospects' => [],
                'total' => 0,
                'totalPages' => 0,
                'summary' => null,
            ]),
            'get_admin_settings' => response()->json([
                'theme' => 'system',
                'notification_email' => $request->user()->email,
                'email_on_agreement_signed' => true,
                'email_on_plan_click' => false,
                'email_on_new_session' => false,
            ]),
            'save_admin_settings' => response()->json($request->all()),
            default => response()->json(['message' => 'Unknown action.'], 400),
        };
    }

    private function getAdminUsers(Request $request): JsonResponse
    {
        $limit = (int) $request->query('limit', 25);
        $offset = (int) $request->query('offset', 0);
        $search = trim((string) $request->query('search', ''));
        $role = trim((string) $request->query('role', ''));
        $userType = trim((string) $request->query('userType', ''));

        $query = User::query()->with(['userRoles', 'profile']);

        if ($search !== '') {
            $query->where(function ($builder) use ($search): void {
                $builder->where('name', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%");
            });
        }

        if ($role !== '') {
            $query->whereHas('userRoles', fn ($builder) => $builder->where('role', $role));
        }

        if ($userType !== '') {
            $query->whereHas('userRoles', fn ($builder) => $builder->where('role', $userType));
        }

        $total = $query->count();
        $users = $query->skip($offset)->take($limit)->get();

        $adminUsers = $users->map(fn (User $user): array => $this->mapAdminUser($user))->values();

        return response()->json([
            'adminUsers' => $adminUsers,
            'total' => $total,
            'totalPages' => $limit > 0 ? (int) ceil($total / $limit) : 1,
        ]);
    }

    private function createAdminUser(Request $request): JsonResponse
    {
        $data = $request->validate([
            'first_name' => ['required', 'string'],
            'last_name' => ['required', 'string'],
            'email' => ['required', 'email'],
            'phone' => ['nullable', 'string'],
            'user_type' => ['required', 'string'],
            'access_level' => ['nullable', 'string'],
        ]);

        $name = trim("{$data['first_name']} {$data['last_name']}");

        $user = User::query()->firstOrCreate(
            ['email' => $data['email']],
            [
                'name' => $name,
                'password' => bcrypt(Str::password(16)),
            ],
        );

        $this->syncAdminRole($user, $data['user_type']);

        return response()->json($this->mapAdminUser($user->fresh('userRoles', 'profile')));
    }

    private function updateAdminUser(Request $request): JsonResponse
    {
        $id = (int) $request->query('id', 0);
        $user = User::query()->with(['userRoles', 'profile'])->findOrFail($id);

        $data = $request->all();

        if (isset($data['display_name']) && is_string($data['display_name'])) {
            $user->name = $data['display_name'];
        }

        if (! empty($data['first_name']) || ! empty($data['last_name'])) {
            $first = (string) ($data['first_name'] ?? '');
            $last = (string) ($data['last_name'] ?? '');
            $user->name = trim("{$first} {$last}");
        }

        if (isset($data['email']) && is_string($data['email'])) {
            $user->email = $data['email'];
        }

        $user->save();

        if (isset($data['user_type']) && is_string($data['user_type'])) {
            $this->syncAdminRole($user, $data['user_type']);
        }

        return response()->json($this->mapAdminUser($user->fresh('userRoles', 'profile')));
    }

    private function deleteAdminUser(Request $request): JsonResponse
    {
        $id = (int) $request->query('id', 0);
        $user = User::query()->findOrFail($id);
        $user->delete();

        return response()->json(['success' => true]);
    }

    private function getPartners(Request $request): JsonResponse
    {
        if (! Schema::hasTable('partners')) {
            return response()->json([
                'partners' => [],
                'summary' => [
                    'total' => 0,
                    'active' => 0,
                    'inactive' => 0,
                    'totalReferrals' => 0,
                    'totalRevenue' => 0,
                    'totalCommissions' => 0,
                    'outstandingBalance' => 0,
                ],
            ]);
        }

        $partners = Partner::query()->orderBy('created_at', 'desc')->get();

        $summary = [
            'total' => $partners->count(),
            'active' => $partners->where('partner_status', 'active')->count(),
            'inactive' => $partners->where('partner_status', 'inactive')->count(),
            'totalReferrals' => (int) $partners->sum('referrals_given'),
            'totalRevenue' => (float) $partners->sum('revenue_generated'),
            'totalCommissions' => (float) $partners->sum('total_commissions_earned'),
            'outstandingBalance' => (float) $partners->sum('outstanding_commission_balance'),
        ];

        return response()->json([
            'partners' => $partners,
            'summary' => $summary,
        ]);
    }

    private function createPartner(Request $request): JsonResponse
    {
        $data = $request->all();

        if (! Schema::hasTable('partners')) {
            return response()->json($data);
        }

        $partner = Partner::query()->create($data);

        return response()->json($partner);
    }

    private function updatePartner(Request $request): JsonResponse
    {
        $partnerId = (string) $request->query('id', $request->input('partner_id'));

        if (! Schema::hasTable('partners') || $partnerId === '') {
            return response()->json(['success' => true]);
        }

        $partner = Partner::query()->findOrFail($partnerId);
        $partner->fill($request->except(['partner_id']))->save();

        return response()->json($partner);
    }

    private function deletePartner(Request $request): JsonResponse
    {
        $partnerId = (string) $request->query('id', '');

        if (! Schema::hasTable('partners') || $partnerId === '') {
            return response()->json(['success' => true]);
        }

        Partner::query()->where('id', $partnerId)->delete();

        return response()->json(['success' => true]);
    }

    private function getCalendars(Request $request): JsonResponse
    {
        if (! Schema::hasTable('calendars')) {
            return response()->json(['calendars' => [], 'total' => 0]);
        }

        $page = (int) $request->input('page', 1);
        $pageSize = (int) $request->input('pageSize', 50);
        $query = DB::table('calendars');

        $search = (string) $request->input('search', '');
        if ($search !== '') {
            $query->where('calendar_name', 'like', "%{$search}%");
        }

        $sortColumn = (string) $request->input('sortColumn', 'calendar_name');
        $sortDirection = (string) $request->input('sortDirection', 'asc');
        $query->orderBy($sortColumn, $sortDirection);

        $total = $query->count();
        $calendars = $query->forPage($page, $pageSize)->get();

        return response()->json(['calendars' => $calendars, 'total' => $total]);
    }

    private function getCalendar(Request $request): JsonResponse
    {
        $id = (string) $request->query('id', '');

        if (! Schema::hasTable('calendars') || $id === '') {
            return response()->json(null);
        }

        $calendar = DB::table('calendars')->where('id', $id)->first();

        return response()->json($calendar);
    }

    private function createCalendar(Request $request): JsonResponse
    {
        if (! Schema::hasTable('calendars')) {
            return response()->json(['success' => true]);
        }

        $data = $request->all();
        $data['id'] = $data['id'] ?? (string) Str::uuid();
        $data['created_at'] = now();
        $data['updated_at'] = now();

        DB::table('calendars')->insert($data);

        return response()->json($data);
    }

    private function updateCalendar(Request $request): JsonResponse
    {
        $id = (string) $request->query('id', '');

        if (! Schema::hasTable('calendars') || $id === '') {
            return response()->json(['success' => true]);
        }

        $data = $request->all();
        $data['updated_at'] = now();

        DB::table('calendars')->where('id', $id)->update($data);

        return response()->json(['success' => true]);
    }

    private function deleteCalendar(Request $request): JsonResponse
    {
        $id = (string) $request->query('id', '');

        if (! Schema::hasTable('calendars') || $id === '') {
            return response()->json(['success' => true]);
        }

        DB::table('calendars')->where('id', $id)->delete();

        return response()->json(['success' => true]);
    }

    private function checkCalendarSlug(Request $request): JsonResponse
    {
        $slug = (string) $request->input('slug', '');
        $excludeId = (string) $request->input('excludeId', '');

        if (! Schema::hasTable('calendars') || $slug === '') {
            return response()->json(['isUnique' => true]);
        }

        $query = DB::table('calendars')->where('slug', $slug);
        if ($excludeId !== '') {
            $query->where('id', '!=', $excludeId);
        }

        return response()->json(['isUnique' => ! $query->exists()]);
    }

    private function mapAdminUser(User $user): array
    {
        $roles = $user->userRoles->pluck('role')->all();
        $primaryRole = $roles[0] ?? 'client';
        $userType = in_array('admin', $roles, true) ? 'admin' : $primaryRole;

        return [
            'id' => (string) $user->id,
            'user_id' => (string) $user->id,
            'display_name' => $user->name,
            'first_name' => null,
            'last_name' => null,
            'email' => $user->email,
            'phone' => null,
            'company_name' => null,
            'title' => null,
            'status' => $user->profile?->status ?? 'active',
            'timezone' => null,
            'nick_name' => null,
            'roles' => $roles,
            'user_type' => $userType,
            'access_level' => 'standard',
            'primary_company_id' => null,
            'primary_company_name' => '',
            'two_factor_status' => 'disabled',
            'last_login' => optional($user->profile)->last_login?->toDateTimeString(),
            'created_by' => null,
            'created_at' => $user->created_at?->toDateTimeString(),
            'updated_at' => $user->updated_at?->toDateTimeString(),
            'subscription_status' => null,
            'contract_signed' => false,
            'contract_signed_date' => null,
            'commission_rate' => null,
            'agreement_status' => null,
            'total_revenue_influenced' => 0,
            'commission_structure' => null,
            'revenue_attributed' => 0,
            'hire_date' => null,
            'rep_status' => null,
            'start_date' => null,
            'employment_type' => null,
        ];
    }

    private function syncAdminRole(User $user, string $userType): void
    {
        if ($userType === 'admin') {
            UserRole::query()->firstOrCreate([
                'user_id' => $user->id,
                'role' => 'admin',
            ]);

            return;
        }

        UserRole::query()
            ->where('user_id', $user->id)
            ->where('role', 'admin')
            ->delete();
    }

    private function getAgentCategories(): JsonResponse
    {
        if (! Schema::hasTable('agent_categories')) {
            return response()->json([
                ['id' => (string) Str::uuid(), 'name' => 'General', 'display_order' => 0],
            ]);
        }

        $categories = DB::table('agent_categories')->orderBy('display_order')->get();

        return response()->json($categories);
    }

    private function createAgentCategory(Request $request): JsonResponse
    {
        $data = $request->validate([
            'name' => ['required', 'string'],
            'display_order' => ['nullable', 'integer'],
        ]);

        if (! Schema::hasTable('agent_categories')) {
            return response()->json($data);
        }

        $id = (string) Str::uuid();
        DB::table('agent_categories')->insert([
            'id' => $id,
            'name' => $data['name'],
            'display_order' => $data['display_order'] ?? 0,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        return response()->json(['id' => $id] + $data);
    }

    private function deleteAgentCategory(Request $request): JsonResponse
    {
        $id = (string) $request->query('id', '');
        $name = (string) $request->input('name', '');

        if (! Schema::hasTable('agent_categories') || $id === '') {
            return response()->json(['success' => true]);
        }

        if (Schema::hasTable('portal_available_agents') && $name !== '') {
            DB::table('portal_available_agents')
                ->where('category', $name)
                ->update(['category' => 'General']);
        }

        DB::table('agent_categories')->where('id', $id)->delete();

        return response()->json(['success' => true]);
    }

    private function getAiAgents(): JsonResponse
    {
        if (! Schema::hasTable('portal_available_agents')) {
            return response()->json([]);
        }

        $agents = PortalAvailableAgent::query()
            ->orderBy('sort_order')
            ->get()
            ->map(fn (PortalAvailableAgent $agent): array => $this->mapAgent($agent))
            ->values();

        return response()->json($agents);
    }

    private function getAiAgent(Request $request): JsonResponse
    {
        $id = (string) $request->query('id', '');

        if (! Schema::hasTable('portal_available_agents') || $id === '') {
            return response()->json(null);
        }

        $agent = PortalAvailableAgent::query()->find($id);

        return response()->json($agent ? $this->mapAgent($agent) : null);
    }

    private function createAiAgent(Request $request): JsonResponse
    {
        if (! Schema::hasTable('portal_available_agents')) {
            return response()->json(['success' => true]);
        }

        $data = $this->extractAgentData($request);
        $data['id'] = (string) Str::uuid();
        $data['slug'] = $data['slug'] ?: Str::slug($data['name'] ?? '');
        $data['created_at'] = now();
        $data['updated_at'] = now();
        $data = $this->filterTableColumns('portal_available_agents', $data);

        DB::table('portal_available_agents')->insert([$data]);

        $agent = PortalAvailableAgent::query()->find($data['id']);

        return response()->json($agent ? $this->mapAgent($agent) : $data);
    }

    private function updateAiAgent(Request $request): JsonResponse
    {
        $id = (string) $request->query('id', '');

        if (! Schema::hasTable('portal_available_agents') || $id === '') {
            return response()->json(['success' => true]);
        }

        $data = $this->extractAgentData($request);
        $data['updated_at'] = now();
        $data = $this->filterTableColumns('portal_available_agents', $data);

        DB::table('portal_available_agents')->where('id', $id)->update($data);

        $agent = PortalAvailableAgent::query()->find($id);

        return response()->json($agent ? $this->mapAgent($agent) : $data);
    }

    private function deleteAiAgent(Request $request): JsonResponse
    {
        $id = (string) $request->query('id', '');

        if (! Schema::hasTable('portal_available_agents') || $id === '') {
            return response()->json(['success' => true]);
        }

        DB::table('portal_available_agents')->where('id', $id)->delete();

        return response()->json(['success' => true]);
    }

    /**
     * @return array<string, mixed>
     */
    private function extractAgentData(Request $request): array
    {
        return [
            'name' => $request->input('name'),
            'job_title' => $request->input('job_title'),
            'description' => $request->input('description'),
            'price' => $request->input('price', 0),
            'category' => $request->input('category', 'General'),
            'website_category' => $this->encodeJson($request->input('website_category')),
            'section_order' => $request->input('section_order', 0),
            'icon' => $request->input('icon', 'bot'),
            'is_popular' => (bool) $request->input('is_popular', false),
            'is_active' => (bool) $request->input('is_active', true),
            'features' => $this->encodeJson($request->input('features')),
            'perfect_for' => $this->encodeJson($request->input('perfect_for')),
            'integrations' => $this->encodeJson($request->input('integrations')),
            'image_url' => $request->input('image_url'),
            'card_media' => $this->encodeJson($request->input('card_media')),
            'product_media' => $this->encodeJson($request->input('product_media')),
            'tiers' => $this->encodeJson($request->input('tiers')),
            'slug' => $request->input('slug'),
            'sort_order' => $request->input('sort_order', 0),
        ];
    }

    private function encodeJson(mixed $value): ?string
    {
        if ($value === null) {
            return null;
        }

        return json_encode($value);
    }

    /**
     * @return array<string, mixed>
     */
    private function mapAgent(PortalAvailableAgent $agent): array
    {
        return [
            'id' => (string) $agent->id,
            'name' => $agent->name,
            'job_title' => $agent->job_title,
            'description' => $agent->description,
            'price' => (float) $agent->price,
            'category' => $agent->category,
            'website_category' => $agent->website_category,
            'section_order' => $agent->section_order,
            'icon' => $agent->icon,
            'is_popular' => (bool) $agent->is_popular,
            'is_active' => (bool) $agent->is_active,
            'features' => $agent->features ?? [],
            'perfect_for' => $agent->perfect_for ?? [],
            'integrations' => $agent->integrations ?? [],
            'image_url' => $agent->image_url,
            'card_media' => $agent->card_media ?? [],
            'product_media' => $agent->product_media ?? [],
            'tiers' => $agent->tiers ?? [],
            'slug' => $agent->slug,
            'sort_order' => $agent->sort_order,
        ];
    }

    /**
     * @param  array<string, mixed>  $data
     * @return array<string, mixed>
     */
    private function filterTableColumns(string $table, array $data): array
    {
        if (! Schema::hasTable($table)) {
            return $data;
        }

        $columns = Schema::getColumnListing($table);

        return array_intersect_key($data, array_flip($columns));
    }
}
