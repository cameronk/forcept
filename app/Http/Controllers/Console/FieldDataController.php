<?php

namespace App\Http\Controllers\Console;

use Illuminate\Http\Request;

use App\Http\Requests;
use App\Http\Requests\ImportFieldDataRequest;
use App\Http\Requests\MapFieldDataRequest;
use App\Http\Controllers\Controller;

use Carbon\Carbon;
use Excel;
use App\Stage;
use App\FieldData;

class FieldDataController extends Controller
{
    /**
     * Display a listing of the resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function index()
    {
        //
        return view('console/field-data/index', [
            'fields'    => Stage::root()->first()->fields,
            'fielddata' => FieldData::paginate(50)
        ]);
    }

    /**
     * Show the form for creating a new resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function create()
    {
        //
        return view('console/field-data/import');
    }

    /**
     * Store a newly created resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     */
    public function store(ImportFieldDataRequest $request)
    {

        // If the upload is found in the request data
        if($request->hasFile('upload')) {
            // If the uploaded file is valid
            if($request->file('upload')->isValid()) {

                // Grabname, move to storage
                $name = "field-data-" . date('mdY-His') . ".csv";
                $request->file('upload')->move(storage_path('imports'), $name);

                $sheet = Excel::load(storage_path('imports') . "/" . $name, function($reader) {

                });

                return view('console/field-data/map', [
                    'name'      => $name,
                    'mode'      => $request->mode,
                    'sheet'     => $sheet,
                    'countRows' => $sheet->all()->count(),
                    'headings'  => $sheet->first()->keys()->toArray(),
                    'fields'    => Stage::where('root', true)->first(['fields'])->fields
                ]);

            } else return redirect()->route('console::field-data::import')->with('alert', array('type' => 'failure', 'message' => 'File not found'));
        } else return redirect()->route('console::field-data::import')->with('alert', array('type' => 'failure', 'message' => 'File not found'));
    }

    /**
     * Map CSV columns to a patient column.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     */
    public function map(MapFieldDataRequest $request) {

        // Load the sheet from imports
        $sheet = Excel::load(storage_path('imports') . "/" . $request->filename, function($reader) {})->all();

        // Grab the headings for this sheet
        $fieldNumberHeading = null;
        $errors = [];
        $headings = $sheet->get(0)->keys()->toArray();
        $map = array();

        // Loop through headings and check if we have one at this index
        foreach($headings as $index => $heading) {
            // Make sure the heading matches the heading we just grabbed
            if($request->has('heading-' . $index) && $request->input('heading-' . $index) === $heading) {
                // Make sure we have a map value for this heading.
                if($request->has('map-' . $index)) {

                    // Grab the destination column
                    $destination = $request->input('map-' . $index);

                    \Log::debug(sprintf("Heading: %s, destination: %s", $heading, $destination));

                    // As long as the destination doesn't equal nullify
                    if($destination !== "__nullify__") {

                        // At some point, a field_number is required
                        if($destination === "field_number") {

                            // Have we already set a field number heading?
                            if($fieldNumberHeading !== null) {
                                // We've already set a field number heading...
                                $errors[] = sprintf("Tried to set '%s' as the field number heading, but it's already been set to '%s'.", $heading, $fieldNumberHeading);
                            } else {
                                $fieldNumberHeading = $heading;
                            }

                        } else {

                            // Check if this destination has already been used
                            $values = array_values($map);
                            if(in_array($destination, $values)) {
                                $errors[] = sprintf("Tried to map '%s' to '%s', but it's already mapped to '%s'.", $heading, $destination, $map[$heading]);
                            } else {
                                // Push heading to map
                                $map[$heading] = $destination;
                            }

                        }

                    }
                }
            }
        }

        // Field number heading should definitely be mapped by now...
        if($fieldNumberHeading === null) {
            $errors[] = "No column was mapped to the Forcept field number option.";
        }

        // Check if we had any errors during the process.
        if(count($errors) > 0) {
            return redirect()->route("console::field-data::index")->with('alert', [ 'type' => 'failure', 'message' => $errors ]);
        } else {
            \Log::debug("Preparing to run insert loop with the following settings:");
            \Log::debug("Field number heading: " . $fieldNumberHeading);
            \Log::debug("Map array: ");
            \Log::debug($map);

            $now = Carbon::now()->toDateTimeString();
            $insert = array();

            // Loop through every row in the sheet
            foreach($sheet as $row) {
                // Loop through the map and push values from
                // this row to a new insert array value
                $data = array();
                foreach($map as $heading => $destination) {
                    $data[$destination] = $row[$heading];
                }

                $insert[] = array(
                    "field_number"  => $row[$fieldNumberHeading],
                    "data"          => json_encode($data),
                    "created_at"    => $now,
                    "updated_at"    => $now
                );
            }

            $insertFailures = 0;
            $chunk = 10;

            foreach(collect($insert)->chunk($chunk)->toArray() as $rows) {
                $status = FieldData::insert($rows);
                if(!$status) {
                    $insertFailures += $chunk;
                }
            }

            // $doInsert = FieldData::insert($insert);
            if($insertFailures === 0) {
                return redirect()->route("console::field-data::index")->with('alert', ['type' => 'success', 'message' => "Inserted " . count($insert) . " new FieldData values."]);
            } else {
                return redirect()->route("console::field-data::index")->with('alert', ['type' => 'failure', 'message' => "Failed to insert " . $insertFailures . "/" . count($insert) . " new FieldData values."]);
            }

        }
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
