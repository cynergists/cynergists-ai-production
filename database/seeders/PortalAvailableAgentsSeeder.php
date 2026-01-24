<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Str;

class PortalAvailableAgentsSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        if (! Schema::hasTable('portal_available_agents')) {
            return;
        }

        $exportPath = $this->resolveExportPath();
        if (! $exportPath || ! is_readable($exportPath)) {
            return;
        }

        $handle = fopen($exportPath, 'r');
        if (! $handle) {
            return;
        }

        $headers = fgetcsv($handle, 0, ';');
        if ($headers === false) {
            fclose($handle);

            return;
        }

        $headers = array_map('trim', $headers);
        $tableColumns = Schema::getColumnListing('portal_available_agents');

        while (($row = fgetcsv($handle, 0, ';')) !== false) {
            if (count($row) === 0) {
                continue;
            }

            $row = array_pad($row, count($headers), null);
            $data = array_combine($headers, $row);

            if (! is_array($data)) {
                continue;
            }

            $normalized = $this->normalizeRow($data);
            $filtered = array_intersect_key($normalized, array_flip($tableColumns));

            if (! isset($filtered['id'])) {
                $filtered['id'] = (string) Str::uuid();
            }

            DB::table('portal_available_agents')->updateOrInsert(
                ['id' => $filtered['id']],
                $filtered,
            );
        }

        fclose($handle);
    }

    private function resolveExportPath(): ?string
    {
        $paths = glob(base_path('database/exports/portal_available_agents-export-*.csv'));
        if (! is_array($paths) || $paths === []) {
            return null;
        }

        sort($paths);

        return $paths[count($paths) - 1] ?? null;
    }

    /**
     * @param  array<string, mixed>  $row
     * @return array<string, mixed>
     */
    private function normalizeRow(array $row): array
    {
        $data = array_map(function ($value) {
            if (is_string($value)) {
                $value = trim($value);
                if ($value === '') {
                    return null;
                }
            }

            return $value;
        }, $row);

        foreach (['features', 'perfect_for', 'integrations', 'tiers', 'card_media', 'product_media', 'website_category'] as $field) {
            if (! array_key_exists($field, $data)) {
                continue;
            }

            $data[$field] = $this->normalizeJsonColumn($data[$field]);
        }

        $data['price'] = isset($data['price']) ? (float) $data['price'] : 0;
        $data['sort_order'] = isset($data['sort_order']) ? (int) $data['sort_order'] : 0;
        $data['section_order'] = isset($data['section_order']) ? (int) $data['section_order'] : 0;
        $data['is_popular'] = isset($data['is_popular']) ? $this->toBoolean($data['is_popular']) : false;
        $data['is_active'] = isset($data['is_active']) ? $this->toBoolean($data['is_active']) : true;
        $data['category'] = $data['category'] ?? 'General';

        return $data;
    }

    private function normalizeJsonColumn(mixed $value): ?string
    {
        if ($value === null) {
            return json_encode([]);
        }

        if (is_array($value)) {
            return json_encode($value);
        }

        $decoded = json_decode((string) $value, true);
        if (json_last_error() === JSON_ERROR_NONE && is_array($decoded)) {
            return json_encode($decoded);
        }

        return json_encode([]);
    }

    private function toBoolean(mixed $value): bool
    {
        if (is_bool($value)) {
            return $value;
        }

        if (is_numeric($value)) {
            return (int) $value === 1;
        }

        $normalized = strtolower((string) $value);

        return in_array($normalized, ['1', 'true', 'yes'], true);
    }
}
