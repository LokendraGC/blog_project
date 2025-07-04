<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class RegisterRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            "name" => "required|string|min:4|max:50",
            "email" => "required|email|unique:users,email|max:255",
            "username" => "nullable|string|min:4|max:50",
            "password" => "required|string|min:4|max:255|confirmed",
            "avatar" => "nullable|image|mimes:jpeg,png,jpg,gif,svg|max:2048",
        ];
    }
}
