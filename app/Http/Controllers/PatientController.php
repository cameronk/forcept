<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

use App\Http\Requests;
use App\Http\Controllers\Controller;

use App\Http\Requests\SearchPatientsRequest;
use App\Patient;
use App\Visit;
use App\Stage;
use App\FieldData;
use Auth;

use DB;

class PatientController extends Controller
{
    /**
     * Display a listing of the resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function index()
    {
        //
        return view('patients/index');
    }


    public function patient(Patient $patient)
    {
        $stagesByVisit = array();
        $stages = Stage::all();

        // Loop through all of this patient's visits
        foreach($patient->visits as $visitID) {
            // Loop through each stage with this visit and see if a record exists
            $stagesByVisit[$visitID] = array();
            foreach($stages->keyBy('id') as $stageID => $stageData) {
                // Bypass if the stage is root (we already have the root data in Patient!)

                $stagesByVisit[$visitID][$stageData->id] = array(
                    "fields" => $stageData->fields,
                    "data" => array()
                );

                if(!$stageData->root) {
                    $record = DB::table($stageData->tableName)
                                ->where('patient_id', $patient->id)
                                ->where('visit_id', $visitID);

                    // See if the record exists.
                    if($record->count() > 0) {
                        $stagesByVisit[$visitID][$stageData->id]["data"] = (array) $record->first();
                    }
                }
            }
        }

        //
        return view('patients/view', [
            'patient' => $patient,
            'patientFields' => $stages->get(0)->fields,
            'stages' => $stagesByVisit
        ]);
    }

    /**
     * Create a new patient record.
     *
     * @return JSON
     */
    public function create(Request $request)
    {
        //
        $patient = new Patient;
            $patient->created_by = Auth::user()->id;
            $patient->concrete = false;


        $fieldNumber = null;

        // Check if we have imported field data in this request.
        if($request->has('importedFieldData') && $request->importedFieldData !== null && is_array($request->importedFieldData)) {

            // Grab data that was imported
            $data = $request->importedFieldData;

            if(isset($data['field_number']) && $data['field_number'] !== null) {
                // Cache the field number before we remove it
                $fieldNumber = $data['field_number'];

                // Remove "field_number" and "used" columns.
                unset($data['field_number']);
                unset($data['used']);

                // Loop through valid fields and add to patient record
                foreach($data as $fieldKey => $value) {
                    $patient->{$fieldKey} = $value;
                }
            }
        }


        // Save the patient
        if($patient->save()) {

            // If a field number was cached, update FieldData record.
            if($fieldNumber !== null) {
                // Set this field data record as 'used'
                $fieldData = FieldData::where('field_number', '=', $fieldNumber)->first();
                    $fieldData->used = $patient->id;
                    $fieldData->save();
            }

            return response()->json([
                "status" => "success",
                "patient" => $patient->toArray()
            ]);

        } else {
            return response()->json([
                "status" => "failure",
                "message" => "Couldn't save new patient record."
            ], 422);
        }
    }


    /**
     * Search existing patient records.
     *
     * @return JSON
     */
    public function search(SearchPatientsRequest $request)
    {
        switch($request->by) {
            case "name":
                return response()->json([
                    "status"    => "success",
                    "patients"  =>  parent::runPatientConversions(
                                        Patient::where('first_name', 'LIKE', '%' . $request->for . '%')
                                            ->orWhere('last_name', 'LIKE', '%' . $request->for . '%')
                                            ->orderBy('id', 'desc')
                                            ->get()->toArray()
                                    )
                ]);

                break;

            case "forceptID":
                return response()->json([
                    "status"    => "success",
                    "patients"  =>  parent::runPatientConversions(
                                        Patient::where('id', '=', $request->for)
                                            ->where('concrete', '=', 1)
                                            ->orderBy('id', 'desc')
                                            ->get()->toArray()
                                    )
                ]);
                break;

            case "fieldNumber":
                $data = FieldData::where('field_number', '=', $request->for)
                                ->orderBy('id', 'desc')
                                ->get()
                                ->toArray();

                $resp = array();
                foreach($data as $key => $fieldData) {
                    $collapse = array(
                        'field_number'  => $fieldData['field_number'],
                        'used'          => $fieldData['used']
                    );
                    foreach($fieldData['data'] as $fieldKey => $value) {
                        $collapse[$fieldKey] = $value;
                    }
                    $resp[] = $collapse;
                }

                return response()->json([
                    "status"    => "success",
                    "patients"  =>  parent::runPatientConversions(
                                        $resp
                                    )
                ]);
                break;
            default:
                return response()->json([
                    "status" => "failure",
                    "message" => sprintf("Searching by %s is not supported.", $request->by),
                    "patients" => []
                ], 422);
                break;
        }
    }

    /**
     * Get all patient records [within a range].
     *
     * @return JSON
     */
    public function fetch(Request $request) {
        return response()->json([
            "status" => "success",
            "patients" => Patient::with('visit')->concrete()->limit(50)->orderBy('id', 'desc')->get()->toArray()
        ]);
    }


    /**
     * Store a newly created resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     */
    public function store(Request $request)
    {
        //
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
