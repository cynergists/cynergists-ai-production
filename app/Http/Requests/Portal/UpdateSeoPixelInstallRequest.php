<?php

namespace App\Http\Requests\Portal;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateSeoPixelInstallRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return $this->user() !== null;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'method' => [
                'required',
                'string',
                Rule::in([
                    'manual',
                    'wordpress',
                    'webflow',
                    'shopify',
                    'wix',
                    'squarespace',
                ]),
            ],
            'status' => [
                'nullable',
                'string',
                Rule::in(['not_installed', 'pending', 'installed', 'failed']),
            ],
        ];
    }
}
