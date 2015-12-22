<?php

namespace App\Http\Requests;

use App\Http\Requests\Request;
use Auth;

class CreateStageRequest extends Request
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
            'type' => 'required|alpha_num',
            'name' => 'required|unique:stages'
        ];
    }
}
