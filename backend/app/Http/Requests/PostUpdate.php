<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class PostUpdate extends FormRequest
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
        // Default rules (for creating a post)
        $rules = [
            'short_description' => 'nullable|string',
            'content' => 'nullable|string',
            'feature_image' => 'nullable|image|mimes:jpeg,png,webp|max:5120',
            'tags' => 'nullable|array|max:5',
            'tags.*' => 'integer|exists:tags,id',
        ];

        if ($this->isMethod('post')) {
            $rules['title'] = 'required|string|max:255';
        } else {
            $rules['title'] = 'nullable|string|max:255';
        }

        return $rules;
    }
}
