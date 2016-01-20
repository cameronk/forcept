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
        $patientFields = Stage::where('root', '=', true)->first()->rawFields;
        return view('visit/create', [
            'stage' => 1,
            'visit' => null, // Creating a visit so no visit ID
            'patients' => null, // No patients are in the visit yet
            'stages' => Stage::where('root', '!=', true)->orderBy('order', 'asc')->get(['id', 'order', 'name'])->toJson(),

            'patientFields' => $patientFields,
            'mutableFields' => $patientFields
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

        \Log::debug("Visit handle for visit [{$visit->id}], stage [{$stage->id}]");

        // Make sure this visit is currently at this stage.
        if($visit->stage == $stage->id) {

            // Get fields for the root stage
            $rootFields = array();
            $rootInputFields = array();

            // Generate object full of all the fields up to this stage.
            $allFields = [];
            $stagesUpToCurrent = Stage::where('order', '<', $stage->order)
                                        ->orderBy('order', 'asc');

            foreach($stagesUpToCurrent->get(['root', 'fields']) as $thisStage) {

                \Log::debug("-> Looping through stage:");
                \Log::debug($thisStage);

                // If this is root stage, pass props to rootFields
                if($thisStage->root == true) {
                    \Log::debug("Root stage, non-file fields:");
                    \Log::debug($thisStage->inputFields);
                    $rootFields      = $thisStage->fields;
                    $rootInputFields = $thisStage->inputFields;
                }

                // Loop through fields and bubble each up to the top-level allFields array
                foreach($thisStage->fields as $key => $fieldInfo) {
                    $allFields[$key] = $fieldInfo;
                }

            }

            // Get patient data from PATIENT table
            $patients = [];
            //$rootFieldsWithoutFiles = array();

            // Push all non-file root fields to array
            // foreach($rootFields as $fieldKey => $fieldData) {
            //     if($fieldData['type'] !== "file"){
            //         $rootFieldsWithoutFiles[] = $fieldKey;
            //     }
            // }

            // Get and apply patient data for all non-file fields
            foreach($visit->patients as $id) {
                $patient = Patient::where('id', '=', $id);
                if($patient->count() > 0) {
                    \Log::debug("Getting patient {$id}:");
                    \Log::debug($rootInputFields);
                    $patients[$id] = $patient->first(array_keys($rootInputFields))->toArray();
                }
            }

            // Summary fields are from non-root stages beneath the current stage
            $summaryFields = array();
            $stages = Stage::where('root', '!=', true)
                            ->where('order', '<', $stage->order)
                            ->orderBy('order', 'asc')
                            ->get();

            // Add new fields for these patients for all stages up to current stage
            foreach($stages->keyBy("id") as $stageID => $stageData) {

                \Log::debug("Querying stage [{$stageID}] [table: {$stageData->tableName}]");

                $fieldsToObtain = array();
                $fieldsToObtain[] = "patient_id"; // Make sure to retrieve the patient ID!

                foreach($stageData->inputFields as $fieldKey => $fieldData) {
                    // Push this field to the summary array
                    $summaryFields[$fieldKey] = $fieldData;

                    // Add to field data to obtain for this stage
                    $fieldsToObtain[] = $fieldKey;
                }

                $visitPatientsDataInThisStage = DB::table($stageData->tableName)
                    ->where('visit_id', $visit->id)
                    ->get($fieldsToObtain);

                \Log::debug($visitPatientsDataInThisStage);

                foreach($visitPatientsDataInThisStage as $patient) {
                    \Log::debug("Patient:");
                    \Log::debug($patient->patient_id);
                    foreach($patient as $patientField => $patientFieldValue) {
                        \Log::debug("Patient values:");
                        \Log::debug($patientField);
                        \Log::debug($patientFieldValue);
                        $patients[$patient->patient_id][$patientField] = $patientFieldValue;
                    }
                }

            }

            $stages = $stages->toArray();

            return view('visit/handle', [
                // This stage info
                'stage'         => $stage,

                // This visit info
                'visit'         => $visit,

                // Patient table information for these patients
                'patients'      => json_encode($patients),
                'stages'        => Stage::where('root', '!=', true)
                                    ->where('order', '>', $stage->order)
                                    ->orderBy('order', 'asc')
                                    ->get(['id', 'order', 'name'])
                                    ->toJson(),

                // Fields that should be mutable in patientsContainer
                'mutableFields' => $stage->rawFields,

                // Fields that should be displayed in the overview sidebar
                'patientFields' => json_encode($rootFields),

                // Fields that should be immutable but shown in patientsContainer
                'summaryFields' => json_encode($summaryFields)

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

            // Setup data array
            $data = array();

            // Make sure all the values in the patientData array are valid stage columns
            foreach($patientData as $key => $value) {
                if(array_key_exists($key, $stage->fields)) {

                    // Check if we should mutate the data (i.e. multiselect)
                    switch($stage->fields[$key]["type"]) {
                        case "file":
                        case "multiselect":
                            // Value is an array, convert to string
                            $data[$key] = json_encode($value);
                            break;
                        default:
                            $data[$key] = $value;
                            break;
                    }

                } else {
                    \Log::debug(
                        sprintf('Attemped to update stage [%s], column [%s], but this column is not valid', $stage->id, $key)
                    );
                }
            }


            // Make sure this patient record exists
            $patient = Patient::where('id', '=', $patientID);

            // If the patient exists...
            if($patient->count() > 0) {

                // Grab patient record
                $patient = $patient->first();

                // Update patient record as necessary
                if($stage->root) {

                    // All data is relative to Patient record
                    $data['concrete'] = true;
                    $data['current_visit'] = $visit->id;

                    // Add this visit ID to patient all-time visits array
                    // (we're at the root stage so this hasnt been done yet)
                    $thisPatientVisits = $patient->visits;
                        $thisPatientVisits[] = $visit->id;
                    $data['visits'] = $thisPatientVisits;

                    \Log::debug("Updating patient record at root stage with data:");
                    \Log::debug($data);

                    // Update patient record.
                    $patient->update($data);

                } else {
                    // Set visit_id and patient_id for reference in this stage
                    $data["visit_id"] = $visit->id;
                    $data["patient_id"] = $patientID;

                    // Insert data into this stage's table
                    DB::table($stage->tableName)->insert($data);
                }

                // If the destination is checkout, remove "current visit" from patient
                if($request->destination == "__checkout__") {
                    \Log::debug("Destination for patient " . $patient->id . " in visit " . $visit->id . " is " . $request->destination);
                    $patient->current_visit = null;
                    $patient->save();
                }

            } else {
                $error = sprintf("Could not locate patient record [id: %s]", $patientID);
                $errors[] = $error;
                \Log::debug($error);
            }

        }

        // Patient data has been stored, update Visit record
        $visit->stage = $request->destination;
        if($visit->save()) {
            return response()->json([
                'status' => 'success',
                'message' => 'Visit moved successfully.',
                'toStage' => $request->destination,
                'visitID' => $visit->id,
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
     */
    public function fetch(Stage $stage)
    {
        $response;
        $visits = Visit::where('stage', '=', $stage->id)->get()->keyBy('id')->toArray();

        $rootStageFields = Stage::where('root', true)->first()->inputFields;

        foreach($visits as $visitID => $visitData) {
            $models = array();
            foreach($visitData['patients'] as $patientID) {
                $patient = Patient::where('id', $patientID);
                if($patient->count() > 0) {
                    $models[$patientID] = $patient->first()->toArray();
                }
            }
            $visits[$visitID]['patient_models'] = $models;
        }

        if(count($visits) > 0) {
            $response = [
                "status" => "success",
                "message" => "Visits found.",
                "visits" => $visits
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
