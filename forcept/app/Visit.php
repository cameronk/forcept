<?php

namespace App;

use Illuminate\Database\Eloquent\Model;
use App\Patient;

class Visit extends Model
{

	protected $appends = ['patient_models'];


    public function stage()
    {
        return $this->hasOne('App\Stage', 'id', 'stage');
    }

    //
	public function getPatientsAttribute($value) {
    	return json_decode($value, true);
    }
    public function setPatientsAttribute($value) 
    {
    	$this->attributes['patients'] = json_encode($value);
    }

    public function getPatientModelsAttribute() {

    	$patients = [];
    	foreach($this->patients as $id) {
    		$patient = Patient::where('id', '=', $id);
    		if($patient->count() > 0) {
    			$patients[$id] = $patient->first()->toArray();
    		}
    	}
    	
        return $patients;
    }
}
