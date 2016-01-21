<?php

namespace App\Http\Controllers;

use Illuminate\Foundation\Bus\DispatchesJobs;
use Illuminate\Routing\Controller as BaseController;
use Illuminate\Foundation\Validation\ValidatesRequests;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;

use App\Stage;

abstract class Controller extends BaseController
{
    use AuthorizesRequests, DispatchesJobs, ValidatesRequests;


    /**
     * Convert value based on provided field type
     *
     * @return mixed
     */
    public function convert($type, $value)
    {

        /*
         * Convert fields to proper type
         */
        switch($type) {

            /*
             * JSON-based inputs
             */
            case "file":
            case "multiselect":
                $decode = json_decode($value);
                if($decode) {
                    return $decode;
                } else {
                    return $value;
                }
                break;

            /*
             * Number-based inputs (integers)
             */
            case "number":

                // Convert value to integer (hopefully)
                $int = intval($value);

                // intval(mixed..) returns 0 if invalid data was passed
                // but also returns 0 if the string passed was "0"
                // so we want to return the "invalid data" string if intval
                // returned 0, but return 0 as an integer if $value was actually
                // equal to "0"
                return $int === 0 ? ($value === "0" ? 0 : $value) : $int;
                break;

            /*
             * Everything else (strings)
             */
            default:
                return $value;
                break;
        }
    }

    /**
     * Run convert() on an array of patient records.
     *
     * @return Array
     */
    public function runPatientConversions($patients)
    {
        /*
         * Grab root stage data to pass to convert()
         */
        $fields = Stage::root()->first()->inputFields;

        /*
         * Create a new array to store new patient fields.
         */
        $build = array();

        /*
         * Loop through each patient and run convert() on all their data
         */
        foreach($patients as $index => $patient) {

            // Add this patient to the build array.
            $build[$index] = array();

            /*
             * Loop through patient fields
             */
            foreach($patient as $column => $value) {

                /*
                 * Make sure this column is a field stored in the Stage record
                 */
                if(array_key_exists($column, $fields)) {

                    /*
                     * Push this column to the build array with converted value.
                     */
                    $build[$index][$column] = $this->convert($fields[$column]['type'], $value);

                } else {

                    /*
                     * Column isn't a stage field, so just spit the value back
                     * (This occurs for metadata fields like patient_id)
                     */
                    $build[$index][$column] = $value;

                }

            }
        }
        // end foreach

        return $build;

    }

}
