<?php

namespace App\Http\Requests\Portal;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Validator;

class CheckSubdomainRequest extends FormRequest
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
            'subdomain' => ['required', 'string', 'min:3', 'max:30', 'regex:/^[a-z0-9-]+$/'],
        ];
    }

    public function withValidator(Validator $validator): void
    {
        $validator->after(function (Validator $validator): void {
            $subdomain = (string) $this->input('subdomain');
            if (in_array($subdomain, $this->reservedSubdomains(), true)) {
                $validator->errors()->add('subdomain', 'This subdomain is reserved.');
            }
        });
    }

    /**
     * @return list<string>
     */
    private function reservedSubdomains(): array
    {
        return ['app', 'api', 'admin', 'mail', 'ftp', 'portal'];
    }
}
