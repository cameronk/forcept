<?php

namespace App;

use Illuminate\Database\Eloquent\Model;

class Patient extends Model
{
    //

    protected $appends = array('full_name');

    public function getFullNameAttribute() 
    {
    	$name = $this->first_name . " " . $this->last_name;
    	if(strlen(trim($name)) == 0) {
    		return null;
    	} else return $name;
    }
}
