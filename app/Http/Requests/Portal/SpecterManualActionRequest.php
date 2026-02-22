<?php

namespace App\Http\Requests\Portal;

use Illuminate\Foundation\Http\FormRequest;

class SpecterManualActionRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user() !== null;
    }

    public function rules(): array
    {
        return [
            'session_id' => ['required', 'string'],
            'identity' => ['sometimes', 'array'],
            'identity.email' => ['nullable', 'string', 'max:255'],
            'identity.phone' => ['nullable', 'string', 'max:50'],
            'identity.name' => ['nullable', 'string', 'max:255'],
            'reason_code' => ['sometimes', 'string', 'max:100'],
            'reason' => ['sometimes', 'string', 'max:1000'],
            'details' => ['sometimes', 'array'],
        ];
    }
}
