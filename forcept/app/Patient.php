<?php

namespace App;

use Illuminate\Database\Eloquent\Model;

class Patient extends Model
{
    //
    protected $appends = array('full_name');
    protected $guarded = ['id'];
    protected $hidden = ['createdBy', 'inVisitStage', 'updated_at', 'created_at'];

    public function getFullNameAttribute() 
    {
    	$name = $this->first_name . " " . $this->last_name;
    	if(strlen(trim($name)) == 0) {
    		return null;
    	} else return $name;
    }
}
