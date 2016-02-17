<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

use App\Http\Requests;
use App\Http\Requests\GetVisitsDataRequest;
use App\Http\Controllers\Controller;

use App\Visit;
use App\Stage;
use App\Patient;
use App\Resource;
use App\PrescriptionSet;
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
                    $fields = collect($stage->inputFields);

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

                            case "header":
                            case "pharmacy":
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
     * Return a JSON list of pharmacy data
     *
     * @return \Illuminate\Http\Response
     */
    public function pharmacy(Request $request, $method)
    {
        switch($method) {
            case "drugs":
                $pharmacy = Stage::where('type', 'pharmacy');
                if($pharmacy->count() > 0) {
                    return response()->json([
                        "status" => "success",
                        "data" => $pharmacy->first()->fields
                    ]);
                } else return response()->json([
                    "status" => "failure",
                    "message" => "Pharmacy stage has not been configured."
                ], 501);
                break;
            default:
                return response()->json([
                    "status" => "failure",
                    "message" => "Unknown method"
                ], 404);
                break;
        }
    }

    /**
     * Handles interaction with file resources
     *
     * @return \Illuminate\Http\Response
     */
    public function resources(Request $request, $method)
    {
        switch ($method) {
            case 'upload':

                $i = 0;
                $files = array();
                $message = array();

                while($request->has('file-' . $i)) {
                    $key = time() . "-" . mt_rand();
                    $inputName = 'file-' . $i;
                    $files[$key] = $request->input($inputName);
                    $i++;
                }

                foreach($files as $fileKey => $fileData) {

                    $splitTypeAndBase64 = explode(";", $fileData);
                    \Log::debug($splitTypeAndBase64);
                    $dataType = explode(":", $splitTypeAndBase64[0]);
                    $splitType = explode("/", $dataType[1]);
                    $base64 = explode(",", $splitTypeAndBase64[1]);
                    $base64 = $base64[1];

                    $resource = new Resource;
                        $resource->type = $dataType[1];
                        $resource->data = $base64;
                        $resource->save();

                        $message[$resource->id] = array(
                            "type" => $resource->type,
                            "data" => $splitType[0] == "image" ? $this->constructBase64File($resource) : null
                        );
                }

                return response()->json(["status" => "success", "message" => $message]);
                break;
            case "fetch":
                if($request->has('id')) {
                    $resource = Resource::where('id', $request->id);
                    if($resource->count() > 0) {
                        $resource = $resource->first(["id", "type", "data"]);
                        return response()->json([
                            "status" => "success",
                            "type" => $resource->type,
                            "data" => $this->constructBase64File($resource)
                        ]);
                    }
                } else return response()->json(["status" => "failure", "message" => "Missing ID parameter."]);
                break;
            default:
                return response()->json(["status" => "failure", "message" => "Unknown method"]);
                break;
        }
    }

    /**
     *
     */
    public function prescriptionSets(Request $request, $method) {
        switch($method) {
            case "manage":
                if($request->has('patientID') && $request->has('visitID')) {
                    $check = PrescriptionSet::where('visit_id', $request->visitID)->where('patient_id', $request->patientID);
                    if($check->count() > 0) {
                        $set = $check->first();
                        return response()->json([
                            "status" => "success",
                            "id" => $set->id,
                            "prescriptions" => json_decode($set->prescriptions)
                        ]);
                    } else {
                        $set = new PrescriptionSet;
                            $set->patient_id = $request->patientID;
                            $set->visit_id = $request->visitID;
                            if($set->save()) {
                                return response()->json([
                                    "status" => "success",
                                    "id" => $set->id
                                ]);
                            } else {
                                return response()->json([
                                    "status" => "failure",
                                    "message" => "Failed to save Set record"
                                ], 500);
                            }
                    }
                } else {
                    return response()->json([
                        "status" => "failure",
                        "message" => "Missing patientID or visitID"
                    ], 400);
                }
                break;
            case "save":
                if($request->has('id') && $request->has('prescriptions')) {
                    $set = PrescriptionSet::where('id', $request->id);
                    if($set->count() > 0) {
                        $set = $set->first();

                        /// TODO: Compare to old and anything new that is done should affect drug counts

                        $set->prescriptions = json_encode($request->prescriptions);
                        if($set->save()) {
                            return response()->json(["status" => "success", "message" => "Set saved successfully.", "id" => $set->id]);
                        } else {
                            return response()->json(["status" => "failure", "message" => "Failed to save Set record"]);
                        }
                    } else {
                        return response()->json(["status" => "failure", "message" => "PrescriptionSet not found."]);
                    }
                } else {
                    return response()->json(["status" => "failure", "message" => "Missing Set ID or prescriptions"]);
                }
                break;
            default:
                return response()->json([
                    "status" => "failure",
                    "message" => "Unknown method"
                ], 422);
                break;
        }
    }

    /**
     * Return array with Carbon dates
     *
     * @return String
     */
    public function constructBase64File($resource) {
        return "data:" . $resource->type . ";base64," . $resource->data;
    }

    /**
     * Return array with Carbon dates
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
