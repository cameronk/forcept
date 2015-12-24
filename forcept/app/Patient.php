<?php

namespace App;

use Illuminate\Database\Eloquent\Model;

class Patient extends Model
{
    
    protected $table = "stage_1";                                                   // Table name
    protected $appends = array('full_name');                                        // Appended to JSON/array
    protected $guarded = ['id'];                                                    // Not mass assignable
    protected $hidden = ['createdBy', 'inVisitStage', 'updated_at', 'created_at'];  // Hidden from JSON/array

    public function getFullNameAttribute() 
    {
    	$name = $this->first_name . " " . $this->last_name;
    	if(strlen(trim($name)) == 0) {
    		return null;
    	} else return $name;
    }
}
