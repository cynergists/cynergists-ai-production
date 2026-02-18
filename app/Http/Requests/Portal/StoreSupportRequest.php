<?php

namespace App\Http\Requests\Portal;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreSupportRequest extends FormRequest
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
            'category' => ['required', 'string', Rule::in([
                'agent_issue', 'billing', 'feature_request', 'general', 'portal_issue', 'other',
            ])],
            'agent_name' => [
                'nullable',
                'required_if:category,agent_issue',
                'string',
                'max:100',
                Rule::exists('portal_available_agents', 'name'),
            ],
            'subject' => ['required', 'string', 'max:200'],
            'message' => ['required', 'string', 'max:5000'],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'agent_name.required_if' => 'Please select an AI Agent when reporting an agent issue.',
            'agent_name.exists' => 'The selected agent is not valid.',
        ];
    }
}
