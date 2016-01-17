<?php

namespace App;

use Illuminate\Database\Eloquent\Model;

class FieldData extends Model
{
    //
    protected $table = "FieldData";


    public function getDataAttribute($value) {
        return json_decode($value, true);
    }
}
