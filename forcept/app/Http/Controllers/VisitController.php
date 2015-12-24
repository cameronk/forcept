<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

use App\Http\Requests;
use App\Http\Requests\HandleVisitRequest;
use App\Http\Controllers\Controller;

use App\Visit;
use App\Stage;
use App\Patient;

use DB;

class VisitController extends Controller
{
    /**
     * Display a listing of the resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function index()
    {
        return view('visit/index');
    }

    /**
     * Show the form for creating a new resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function create()
    {
        $allFields = Stage::where('root', '=', true)->first()->rawFields;
        return view('visit/create', [
            'stage' => 1,
            'visit' => null, // Creating a visit so no visit ID
            'patients' => null, // No patients are in the visit yet
            'stages' => Stage::where('root', '!=', true)->orderBy('order', 'asc')->get(['id', 'order', 'name'])->toJson(),
            'allFields' => $allFields,
            'mutableFields' => $allFields
        ]);
    }

    /**
     * Show all visits associated with this stage ID.
     *
     * @return \Illuminate\Http\Response
     */
    public function stage(Stage $stage)
    {
        return view('visit/stage', [
            'stage' => $stage
        ]);
    }

    /*
     * Show the field editor for a visit at a particular stage
     */
    public function handle(Stage $stage, Visit $visit)
    {

        // Make sure this visit is currently at this stage.
        if($visit->stage == $stage->id) {
            // Generate object full of all the fields up to this stage.
            $allFields = [];
            $stagesUpToCurrent = Stage::where('order', '<', $stage->order)->orderBy('order', 'asc')->get(['fields']);
            foreach($stagesUpToCurrent as $thisStage) {

                // Loop through fields and bubble each up to the top-level allFields array
                foreach($thisStage->fields as $key => $fieldInfo) {
                    $allFields[$key] = $fieldInfo;
                }

            }

            // Get patient data from PATIENT table
            $patients = $visit->patient_models;

            // Loop through patients and add data for all stages up to current (skip root stage because that was queried in patient_models)
            $stagesUpToCurrent = Stage::where('order', '<', $stage->order)->where('root', '!=', true)->orderBy('order', 'asc')->get(['id']);
            foreach($stagesUpToCurrent as $thisStage) {

                // Query this stage's data table and get all data rows for this visit
               $allPatientsDataForThisStage = DB::table($thisStage->tableName)
                    ->where('visit_id', $visit->id)
                    ->get();

                // Loop through all patients data and distribute each patient's data to the $patients array
                \Log::debug($allPatientsDataForThisStage);
            }

            return view('visit/handle', [
                'stage'         => $stage,
                'visit'         => $visit,
                'patients'      => json_encode($patients),
                'stages'        => Stage::where('root', '!=', true)->where('order', '>', $stage->order)->orderBy('order', 'asc')->get(['id', 'order', 'name'])->toJson(),
                'mutableFields' => $stage->rawFields,
                'allFields'     => json_encode($allFields)
            ]);
        } else return abort(403, "Unauthorized action.");
    }


    /**
     * Store a newly created resource in storage.
     *
     * @return \Illuminate\Http\Response
     */
    public function store(HandleVisitRequest $request)
    {
        // Make sure this is a valid stage
        $stage = Stage::where('id', '=', $request->stage);
        if($stage->count() > 0) {
            $stage = $stage->first();
        } else {
            return response()->json([
                'status' => 'failure',
                'message' => sprintf('Stage with ID %s does not exist', $request->stage)
            ], 422);
        }

        // Make sure the destination is valid.
        if($request->destination !== "__checkout__") {
            $destination = Stage::where('id', '=', $request->destination);
            if($destination->count() == 0) {
                return response()->json([
                    'status' => 'failure',
                    'message' => sprintf('Destination stage [ID: %s] does not exist', $request->destination)
                ]);
            }
        }

        // Check if the visit has been created yet
        $visit;
        if(is_null($request->visit) || strlen($request->visit) == 0) {

            // Create a new visit
            $visit = new Visit;
                $visit->patients = array_keys($request->patients);
                $visit->stage = $request->stage;

            $saved = $visit->save();
            if(!$saved) {
                return response()->json([
                    'status' => 'failure',
                    'message' => 'Failed to save new visit record.'
                ], 422);
            }

        } else {
            // Check if the visit exists
            $visit = Visit::where('id', '=', $request->visit);
            if($visit->count() > 0) {
                $visit = $visit->first();
            } else {
                return response()->json([
                    'status' => 'failure',
                    'message' => sprintf('Visit with ID %s does not exist.', $request->visit)
                ]);
            }
        }

        $errors = [];

        // Loop through patients, add a new row to the respective Stage for each patient
        foreach($request->patients as $patientID => $patientData) {

            $data = array();

            // Make sure all the values in the patientData array are valid stage columns
            foreach($patientData as $key => $value) {
                if(array_key_exists($key, $stage->fields)) {
                    $data[$key] = $value;
                } else {
                    \Log::debug(
                        sprintf('Attemped to update stage [%s], column [%s], with value [%s], but this column does not exist', $stage->id, $key, $value)
                    );
                }
            }

            // If this is the root stage (Check-in), we want to update
            // patient data instead of creating a new record. Also, do not
            // set visit_id or patient_id parameters, as these are respective
            // to non-root stages.
            if($stage->root) {
                $patient = Patient::where('id', '=', $patientID);

                // Check if this patient record exists
                if($patient->count() > 0) {
                    $patient = $patient->first();

                    // Set patient concrete = true now that we've update their data
                    $data['concrete'] = true;

                    // Update patient record.
                    $patient->update($data);

                } else {
                    $error = sprintf("Could not locate patient record [id: %s]", $patientID);
                    $errors[] = $error;
                    \Log::debug($error);
                }

            } else {
                // Set visit_id and patient_id for reference in this sage
                $data["visit_id"] = $visit->id;
                $data["patient_id"] = $patientID;

                // Insert data into this stage's table
                DB::table($stage->tableName)->insert($data);
            }
        }

        // Patient data has been stored, update Visit record
        $visit->stage = $request->destination;
        if($visit->save()) {
            return response()->json([
                'status' => 'success',
                'message' => 'Visit moved successfully.',
                'errors' => $errors
            ]);
        } else {
            return response()->json([
                'status' => 'failure',
                'message' => 'Failed to save visit record.',
                'errors' => $errors
            ]);
        }
    }


    /**
     * Fetch visits for specified stage ID
     *
     */
    public function fetch(Stage $stage) 
    {
        $response;
        $visits = Visit::where('stage', '=', $stage->id);
        if($visits->count() > 0) {
            $response = [
                "status" => "success",
                "message" => "Visits found.",
                "visits" => $visits->get()->toArray()
            ];
        } else {
            $response = [
                "status" => "success",
                "message" => "No visits are currently at stage " . $stage->name . "."
            ];
        }
        return response()->json($response);
    }


    /**
     * Display the specified resource.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function show($id)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function edit($id)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function update(Request $request, $id)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function destroy($id)
    {
        //
    }
}
