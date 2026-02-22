<?php

namespace App\Http\Requests\Specter;

use Illuminate\Foundation\Http\FormRequest;

class IngestSpecterEventsRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'tenant_id' => ['required', 'string'],
            'site_key' => ['required', 'string', 'max:255'],
            'visitor_id' => ['required', 'string', 'max:255'],
            'session_id' => ['required', 'string', 'max:255'],
            'cookie_ids' => ['sometimes', 'array'],
            'cookie_ids.*' => ['string', 'max:255'],
            'consent_state' => ['required', 'string', 'max:50'],
            'consent_version' => ['nullable', 'string', 'max:50'],
            'dnt' => ['sometimes', 'boolean'],
            'process_immediately' => ['sometimes', 'boolean'],
            'events' => ['required', 'array', 'min:1', 'max:500'],
            'events.*.event_id' => ['nullable', 'string', 'max:255'],
            'events.*.type' => ['required', 'string', 'max:100'],
            'events.*.page_url' => ['nullable', 'string', 'max:2000'],
            'events.*.timestamp' => ['nullable', 'date'],
            'events.*.user_agent' => ['nullable', 'string', 'max:1000'],
            'events.*.metadata' => ['nullable', 'array'],
        ];
    }
}
