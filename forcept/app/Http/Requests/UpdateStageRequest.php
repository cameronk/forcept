<?php

namespace App\Http\Requests;

use App\Http\Requests\Request;
use Auth;

class UpdateStageRequest extends Request
{
    /**
     * Determine if the user is authorized to make this request.
     *
     * @return bool
     */
    public function authorize()
    {
        return Auth::check() && Auth::user()->admin == true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array
     */
    public function rules()
    {
        return [
            'name' => 'required|max:30',
            'fields' => 'required'
        ];
    }

    /**
     * Return custom messages
     * 
     * @return array
     */
    public function messages()
    {
        return [
            'fields.required' => 'A stage must have at least one field.',
        ];
    }
}
