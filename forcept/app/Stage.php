<?php

namespace App;

use Illuminate\Database\Eloquent\Model;

class Stage extends Model
{
    //
    public $timestamps = false;

    public function getSafeNameAttribute()
    {
    	return str_slug($this->name);
    }

    public function getTableNameAttribute()
    {
    	return 'stage_' . $this->id;
    }
}
