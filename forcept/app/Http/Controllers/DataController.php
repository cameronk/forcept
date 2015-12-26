<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

use App\Http\Requests;
use App\Http\Requests\GetVisitsDataRequest;
use App\Http\Controllers\Controller;

use App\Visit;
use App\Stage;
use App\Patient;
use DB;

use Carbon\Carbon;

class DataController extends Controller
{

    /**
     * Return a JSON list of visits
     *
     * @return \Illuminate\Http\Response
     */
    public function visits(Request $request, $method)
    {
        
        $dates = $this->getCarbonDates($request);

        switch(strtolower($method)) {
            case "count":
                //
                $data = [];

                $visits = Visit::where('created_at', '>', $dates['from'])
                                ->where('created_at', '<', $dates['to'])
                                ->get(['patients', 'stage'])
                                ->groupBy('stage');
                $stages = Stage::where('root', '!=', true)
                                ->orderBy('order', 'asc')
                                ->get(['id', 'name'])
                                ->groupBy('id');

                $stages = $stages->keys()->push("__checkout__")->map(function($stageID) use($stages, $visits) {

                    $data = [
                        "name" => $stageID == "__checkout__" ? "Checked out" : $stages[$stageID][0]['name']
                    ];

                    if($visits->has($stageID)) {
                        $data["visits"] = $visits->get($stageID)->count();
                        $data["patients"] = $visits->get($stageID)->map(function($visit) {
                            return count($visit->patients);
                        })->sum();
                    } else {
                        $data["visits"] = 0;
                        $data["patients"] = 0;
                    }

                    return $data;

                });

                return response()->json([
                    "stages" => $stages
                ]);
                break;
        }
    }

    /**
     * Return a JSON list of patient data
     *
     * @return \Illuminate\Http\Response
     */
    public function patients(Request $request, $method)
    {

        $dates = $this->getCarbonDates($request);

        switch($method) {
            case "count":
                $stages = Stage::get(['id', 'name', 'fields', 'root'])
                                ->keyBy('id');

                $stages = $stages->keys()->map(function($stageID) use ($stages) {
                    $stage = $stages[$stageID];
                    $fields = collect($stage->fields);

                    $columnsToQuery = $fields;
                    $patientStageData = DB::table($stage->tableName);

                    if($stage->root) {
                        $columnsToQuery->forget('first_name');
                        $columnsToQuery->forget('last_name');
                        $columnsToQuery->forget('priority');
                        $patientStageData = $patientStageData->where('concrete', true);
                    }

                    $data = collect(
                        (array) $patientStageData->get(
                            $columnsToQuery->keys()->toArray()
                        )
                    );

                    $stage->data = $fields->keys()->map(function($fieldID) use($data, $fields) {

                        \Log::debug("Handling data for field {$fieldID}");
                        \Log::debug($fields->get($fieldID));
                        $pluck = $data->pluck($fieldID);

                        switch($fields->get($fieldID)['type']) {
                            case "multiselect":
                                // we plucked a JSON string
                                $arrayOfMultiSelectOptions = $pluck->map(function($thisValue) {
                                    \Log::debug("Pluck->map: ");
                                    \Log::debug($thisValue);
                                    \Log::debug(gettype($thisValue));

                                    // JSON strlen must be at least 2
                                    if(strlen($thisValue) >= 2) {
                                        \Log::debug("strlen: ". strlen($thisValue));
                                        $data = json_decode($thisValue);
                                        if($data !== null) {
                                            return $data;
                                        }
                                    }

                                    return array("");

                                });
                                \Log::debug("After pluck map");
                                \Log::debug($arrayOfMultiSelectOptions);

                                return collect([
                                    $fieldID => array_count_values($arrayOfMultiSelectOptions->collapse()->toArray())
                                ]);
                                break;
                            default:
                                return collect([
                                    $fieldID => array_count_values($pluck->toArray())
                                ]);
                                break;
                        }
                    })->collapse();

                    return $stage; 
                });

                // \Log::debug($data);


                // Loop through all stages stored in database
                /*$stages = $stages->keys()->map(function($stageID) use($stages) {

                    // $stageID's ROW in stages table
                    $stage = $stages[$stageID][0];
                    $fields = collect($stage->fields);

                    // Grab all patient data from $stageID's unique table
                    $patientStageData = DB::table($stage->tableName);
                    if($stage->root) {
                        $patientStageData = $patientStageData->where('concrete', true);
                    }
                    $patientStageData = $patientStageData->get(); // array of StdClass objects with patient data

                    return $patientStageData;

                    // Collect patient data
                    $patients = collect($patientStageData);

                    // Loop throgh each patient row
                    $test = $patients->keys()->map(function($patientKey) use ($patients, $fields) {

                        // \Log::debug(collect($stage->fields));

                        // Loop through valid fields, find patient data for these fields if it exists
                        $data = $fields->keys()->map(function($fieldID) use ($patients, $patientKey) {

                            $patient = $patients->get($patientKey);
                            // If the patient has this type of data stored
                            if( property_exists($patient, $fieldID) ) {
                                $r = array();
                                $r[$fieldID] = $patient->$fieldID;
                                return $r;
                            }

                        })->collapse();

                        $data = $data->keys()->map(function($fieldID) use($data) {
                        //     // return $data->get($fieldID);
                            $r = array();
                            $r[$fieldID] = $data->keyBy($fieldID)->count();
                            return $r;
                        });

                        return $data;

                        // $patients->get($patientKey)->;
                    });

                    \Log::debug("Debug for {$stageID}");
                    \Log::debug($test);

                    return $test;

                });*/

                // \Log::debug($stages);

                return response()->json([
                    "stages" => $stages
                ]);

                break;
        }
    }


    /**
     * Return a JSON list of patient data
     *
     * @return Array
     */
    public function getCarbonDates($request) {
        $startDate;
        $endDate;

        if($request->has('from')) {
            $startDate = (new Carbon($request->from))->toDateTimeString();
        } else {
            $startDate = Carbon::createFromTimestamp(0)->toDateTimeString();
        }

        if($request->has('to')) {
            $endDate = (new Carbon($request->to))->toDateTimeString();
        } else {
            $endDate = (new Carbon())->toDateTimeString();
        }

        return ['from' => $startDate, 'to' => $endDate];
    }
}
