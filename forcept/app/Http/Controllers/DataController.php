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
use Storage;

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

                // Loop through all stages, map to stageID
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
                            case "file":
                                return collect([]); // Cannot aggregate this file tpe
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
    public function flow(Request $request, $method)
    {
        switch($method) {
            case "download":
                if($request->has('stage') && $request->has('fields')) {
                    $decode = base64_decode($request->fields);
                    $path = 'flow_config/' . $request->stage . '-' . date("mdy") . '.json';
                    if($decode !== false) {
                        Storage::put($path,$decode);
                        return response()->download(storage_path("app/" . $path));
                    } else {
                        return "Could not decode file";
                    }
                }
                break;
            default:
                return "Unknown method";
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
