<?php

namespace App;

use Illuminate\Database\Eloquent\Model;

class Stage extends Model
{
    //
    // public $timestamps = false;


    /*
     * Smart table name getters
     */
    public function getSafeNameAttribute()
    {
    	return str_slug($this->name);
    }

    public function getTableNameAttribute()
    {
    	return 'stage_' . $this->id;
    }

    /*
     * Fields getters/setters
     */
    public function getFieldsAttribute($value) {
    	return json_decode($value, true);
    }

    public function getRawFieldsAttribute() {
    	return json_encode($this->fields);
    }

    public function setFieldsAttribute($value) {
    	$this->attributes['fields'] = json_encode($value);
    }
}
