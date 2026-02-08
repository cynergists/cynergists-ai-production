<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class ProcessPaymentRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    /**
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'source_id' => ['required', 'string'],
            'amount' => ['required', 'integer', 'min:1'],
            'currency' => ['required', 'string', 'size:3'],
            'customer_email' => ['required', 'email'],
            'customer_name' => ['required', 'string'],
            'idempotency_key' => ['required', 'string'],
            'order_description' => ['nullable', 'string'],
            'cart_items' => ['required', 'array', 'min:1'],
            'cart_items.*.name' => ['required', 'string'],
            'cart_items.*.price' => ['required', 'integer'],
            'cart_items.*.quantity' => ['required', 'integer', 'min:1'],
            'cart_items.*.billing_type' => ['required', 'string', 'in:monthly,one_time'],
        ];
    }
}
