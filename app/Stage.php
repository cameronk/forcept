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
    
    public function getBasicFieldsAttribute() {
        $newFields = array();
        if($this->root == true) {
            $newFields = array('id' => null, 'first_name' => null, 'last_name' => null);
        } else {
            $newFields = $this->nonFileFields;
        }
        return $newFields;
    }

    public function getNonFileFieldsAttribute() {
        $newFields = array();
        foreach($this->inputFields as $fieldID => $fieldData) {
            if($fieldData['type'] !== "file") {
                $newFields[$fieldID] = $fieldData;
            }
        }
        return $newFields;
    }

    public function getInputFieldsAttribute() {
        $fields = [];

        foreach($this->fields as $fieldKey => $fieldData) {
            if( !in_array($this->fields[$fieldKey]['type'], config('app.nonInputFieldTypes', [])) ) {
                $fields[$fieldKey] = $fieldData;
            }
        }

        return $fields;
    }

    public function getRawFieldsAttribute() {
    	return json_encode($this->fields);
    }

    public function setFieldsAttribute($value) {
    	$this->attributes['fields'] = json_encode($value);
    }
}
