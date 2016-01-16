<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

use App\Http\Requests;
use App\Http\Controllers\Controller;

use App\Http\Requests\SearchPatientsRequest;
use App\Patient;
use App\Visit;
use App\Stage;
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
    public function create()
    {
        //
        $patient = new Patient;
            $patient->created_by = Auth::user()->id;
            $patient->concrete = false;

        if($patient->save()) {

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
                    "status" => "success",
                    "patients" => Patient::where('first_name', 'LIKE', '%' . $request->for . '%')
                                ->orWhere('last_name', 'LIKE', '%' . $request->for . '%')
                                ->orderBy('id', 'desc')
                                ->get()->toArray()
                ]);

                break;

            case "forceptID":
                return response()->json([
                    "status" => "success",
                    "patients" =>  Patient::where('id', '=', $request->for)
                                ->where('concrete', '=', 1)
                                ->orderBy('id', 'desc')
                                ->get()->toArray()
                ]);
                break;

            case "fieldNumber":
                // return response()->json( Patient::where('') )
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
