<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Str;

class ViewPreferencesController extends Controller
{
    /**
     * @return array<int, string>
     */
    private function allowedTables(): array
    {
        return [
            'client_view_preferences',
            'prospect_view_preferences',
            'partner_view_preferences',
            'staff_view_preferences',
            'sales_rep_view_preferences',
            'calendar_view_preferences',
        ];
    }

    private function assertAllowedTable(string $table): void
    {
        if (! in_array($table, $this->allowedTables(), true)) {
            abort(404);
        }

        if (! Schema::hasTable($table)) {
            abort(404);
        }
    }

    public function show(Request $request, string $table): JsonResponse
    {
        $this->assertAllowedTable($table);

        $record = DB::table($table)
            ->where('user_id', $request->user()->id)
            ->first();

        return response()->json($this->decodeRecord($record));
    }

    public function store(Request $request, string $table): JsonResponse
    {
        $this->assertAllowedTable($table);

        $payload = $request->only([
            'column_order',
            'hidden_columns',
            'column_widths',
            'sort_column',
            'sort_direction',
            'active_filters',
            'rows_per_page',
            'saved_views',
            'active_view_name',
            'default_view_name',
        ]);

        $userId = $request->user()->id;
        $existing = DB::table($table)->where('user_id', $userId)->first();

        $data = [
            'column_order' => $this->encodeJson($payload['column_order'] ?? null),
            'hidden_columns' => $this->encodeJson($payload['hidden_columns'] ?? null),
            'column_widths' => $this->encodeJson($payload['column_widths'] ?? null),
            'sort_column' => $payload['sort_column'] ?? null,
            'sort_direction' => $payload['sort_direction'] ?? null,
            'active_filters' => $this->encodeJson($payload['active_filters'] ?? null),
            'rows_per_page' => $payload['rows_per_page'] ?? 50,
            'saved_views' => $this->encodeJson($payload['saved_views'] ?? null),
            'active_view_name' => $payload['active_view_name'] ?? null,
            'default_view_name' => $payload['default_view_name'] ?? null,
            'updated_at' => now(),
        ];

        if (! $existing) {
            $data['id'] = (string) Str::uuid();
            $data['user_id'] = $userId;
            $data['created_at'] = now();

            DB::table($table)->insert([$data]);
        } else {
            DB::table($table)->where('user_id', $userId)->update($data);
        }

        $record = DB::table($table)->where('user_id', $userId)->first();

        return response()->json($this->decodeRecord($record));
    }

    private function encodeJson(mixed $value): ?string
    {
        if ($value === null) {
            return null;
        }

        return json_encode($value);
    }

    /**
     * @return array<string, mixed>|null
     */
    private function decodeRecord(?object $record): ?array
    {
        if (! $record) {
            return null;
        }

        $data = (array) $record;

        foreach (['column_order', 'hidden_columns', 'column_widths', 'active_filters', 'saved_views'] as $field) {
            $value = $data[$field] ?? null;
            $data[$field] = $value ? json_decode((string) $value, true) : null;
        }

        return $data;
    }
}
