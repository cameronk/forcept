<?php

namespace App;

use Illuminate\Database\Eloquent\Model;
use Auth;

class Patient extends Model
{

    protected $table = "stage_1";                                                   // Table name
    protected $appends = array('full_name');                                        // Appended to JSON/array
    protected $guarded = ['id', 'updated_at', 'created_at'];  // Not mass assignable
    //protected $hidden = ['createdBy', 'inVisitStage', 'updated_at', 'created_at'];  // Hidden from JSON/array

    public function getFullNameAttribute()
    {
    	$name = $this->first_name . " " . $this->last_name;
    	if(strlen(trim($name)) == 0) {
    		return null;
    	} else return $name;
    }

    public function visit() {
        // if(property_exists($this, "current_visit") && $this->current_visit !== null && strlen($this->current_visit) > 0) {
            return $this->hasOne('App\Visit', 'id', 'current_visit');
        // }
    }

    public function getVisitsAttribute($value)
    {
        return json_decode($value, true);
    }

    public function setVisitsAttribute($value)
    {
        $this->attributes['visits'] = json_encode($value);
    }

    public function scopeConcrete($query) {
        return $query->where('concrete', true);
    }
}
