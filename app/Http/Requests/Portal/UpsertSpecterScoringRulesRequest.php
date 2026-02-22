<?php

namespace App\Http\Requests\Portal;

use Illuminate\Foundation\Http\FormRequest;

class UpsertSpecterScoringRulesRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user() !== null;
    }

    public function rules(): array
    {
        return [
            'rules' => ['required', 'array', 'min:1', 'max:50'],
            'rules.*.signal_key' => ['required', 'string', 'max:100'],
            'rules.*.weight' => ['required', 'numeric', 'min:0', 'max:100'],
            'rules.*.config' => ['nullable', 'array'],
            'rules.*.is_active' => ['sometimes', 'boolean'],
            'rules.*.sort_order' => ['sometimes', 'integer', 'min:0'],
        ];
    }
}
