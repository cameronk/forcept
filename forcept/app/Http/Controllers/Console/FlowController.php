<?php

namespace App\Http\Controllers\Console;

use Illuminate\Http\Request;
use App\Stage;
use App\StageModification;

use App\Http\Requests;
use App\Http\Requests\CreateStageRequest;
use App\Http\Requests\UpdateStageRequest;
use App\Http\Controllers\Controller;

use Illuminate\Database\Schema\Blueprint;
use Schema;
use Auth;
use DB;

class FlowController extends Controller
{

    /**
     * Get the MySQL data type based on Forcept field type.
     *
     * @return string
     */
    protected function determineDataType($type) {
        switch($type) {
            case "integer":
                return "INT";
                break;
            default:
                return "VARCHAR(255)";
                break;
        }
    }

    /**
     * Display a listing of the resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function index()
    {
        //
        return view('console/flow/index');
    }

    /**
     * Show the form for creating a new resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function create()
    {
        //
        return view('console/flow/create');
    }

    /**
     * Store a newly created resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     */
    public function store(CreateStageRequest $request)
    {
        //
        $stage = new Stage;
            $stage->name = $request->name;
            $stage->type = $request->type;
            $stage->fields = [];

            // Save stage model
            if($stage->save()) {

                // Create schema
                Schema::create($stage->tableName, function(Blueprint $table) {
                    $table->increments('id');
                });

                return redirect()->route('console::flow::index')->with('alert', [ 'type' => 'success', 'message' => 'Stage created. Choose "Edit" below to get started.' ]);
                
            } else return redirect()->route('console::flow::index')->with('alert', [ 'type' => 'failure', 'message' => 'An error occurred, and the stage model could not be created.' ]);
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
        return view('console/flow/edit', ['stage' => Stage::where('id', $id)->first()]);
    }

    /**
     * Update the specified resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function update(UpdateStageRequest $request, $id)
    {
        $stage = Stage::where('id', $id);

        // Check if this stage exists
        if($stage->count() > 0) {

            // Get stage.
            $stage = $stage->first();

            // Cache previous stage information for comparisons and table building.
            $cachedFields = $stage->toArray()["fields"];

            \Log::debug("Cached fields: " . json_encode($cachedFields));
            \Log::debug("Typeof cached fields: " . gettype($cachedFields));
            // $cachedFields = $cachedFields["fields"];

            // Check if we're changing the stage's name...
            if($stage->name !== $request->name) {

                // Check if this new name is unique.
                if(Stage::where('name', '=', $request->name)->count() > 0) {

                    // Already exists!
                    return response()->json([
                        "status" => "failure",
                        "message" => "This name is already taken by another stage. Please choose a different name."
                    ], 422);

                } else {
                    $stage->name = $request->name;
                }

            }

            // Continue with updating other fields
            $stage->fields = $request->fields;

            // Attempt to save stage record
            if($stage->save()) {

                $newFields = $stage->toArray()["fields"];

                // Update table schema.
                // Compare old to new and look for additions/deletions

                \Log::debug("New fields: " . json_encode($newFields));
                \Log::debug("Typeof new fields: " . gettype($newFields));

                // Name changes:
                $nameChanges = [];
                foreach($newFields as $key => $data) {
                    // Check if cachedfields has this field key
                    if(array_key_exists($key, $cachedFields)) {
                        // If NEW name is different than OLD name
                        if($data['name'] !== $cachedFields[$key]['name']) {

                            $nameChanges[$key] = [
                                "old" => $cachedFields[$key]['name'], 
                                "new" => $data['name'] 
                            ];
                            \Log::debug("Adding " + $key + " as a name change");
                        }
                    }
                }

                // Additions:
                $additions = [];
                foreach($newFields as $key => $data) {
                    // If key did NOT exist in cached fields
                    if(!array_key_exists($key, $cachedFields)) {
                        $additions[$key] = $data;
                        \Log::debug("Adding " + $key + " as an addition");
                    }
                }

                // Deletions:
                $deletions = [];
                foreach($cachedFields as $key => $data) {
                    // If key NO LONGER exists in fields
                    if(!array_key_exists($key, $newFields)) {
                        \Log::debug("DELETION: gettype data = " . gettype($data) );
                        $deletions[$key] = $data;
                        $deletions[$key]["_destination"] = $key . "_" . str_slug($data['name']) . "_" . time() . "_backup";
                        // $deletions[$key]["_datatype"] = $this->determineDataType($data['type']);

                        \Log::debug("Adding " + $key + " as a deletion with destination " + $deletions[$key]["_destination"]);
                    }
                }


                // Handle schema modifications for additions:
                Schema::table($stage->tableName, function(Blueprint $table) use ($stage, $nameChanges, $additions, $deletions) {

                    \Log::debug("Running Schema::table -  name changes count = " . count($nameChanges) . ", additions count = " . count($additions) . ", deletions count = " . count($deletions));
                    \Log::debug("Name changes: " . json_encode($nameChanges));
                    \Log::debug("Additions: " . json_encode($additions));
                    \Log::debug("Deletions: " . json_encode($deletions));
                    \Log::debug("===");

                    // Run name changes
                    foreach($nameChanges as $columnName => $data) {
                        \Log::debug("-> renaming " . $columnName);
                        $table
                            ->renameColumn(sprintf("`%s`", $columnName), sprintf("`%s`", $columnName))
                            ->comment( sprintf("Renamed column %s to %s at %s", $data['old'], $data['new'], date('r')) );
                    }

                    // Run deletions
                    foreach($deletions as $columnName => $data) {
                        \Log::debug("-> deleting " . $columnName);
                        // slight hack: had to add back-ticks because apparently this lib didnt do that
                        $table
                            ->renameColumn("`" . $columnName . "`", "`" . $data["_destination"] . "`")
                            ->comment( sprintf("Backing up column %s @ %s", $columnName, $data["_destination"]) );
                    }

                    // Run additions
                    foreach($additions as $columnName => $data) {
                        \Log::debug("-> adding " . $columnName . ": " . json_encode(($data)));

                        // Create column w/ type string (all columns are stored as VARCHAR(255))
                        $table
                            ->string($columnName)
                            ->comment('Column created ' . date('r') . ' w/ name ' . $data['name']);

                        // switch($data['type']) {
                        //     case "integer":
                        //         $table->integer($columnName)->default($data['settings']["default"]);
                        //         break;
                        //     default:
                        //         break;
                        // }
                    }

                });

                \Log::debug("Outside of Schema::Table now");

                // Check if the columns have been modified correctly
                $allGood = true;
                $failedSaves   = [];
                $failedColumns = [];
                $errors = [];

                // Check deletions
                foreach($deletions as $columnName => $data) {
                    if(!Schema::hasColumn($stage->tableName, $data['_destination'])) {
                        $allGood = false;
                        $failedColumns[] = $columnName;
                        $errors[] = $data['name'] . " (" . $columnName . ") was unable to be moved to backup location ". $data['destination'];
                    
                        \Log::debug("Deletion of " . $columnName . " seems to have failed");
                    } else {
                        // Succeeded, put a record in the StageModifications table
                        $mod = new StageModification;
                            $mod->stage_id = $stage->id;
                            $mod->by = Auth::user()->id;
                            $mod->type = "deletion";
                            $mod->column_key = $columnName;
                            $mod->column_deletion_destination = $data['_destination'];

                            if($mod->save()) {
                                // Sweet, it saved
                                \Log::debug("Deletion of " . $columnName . " suceeded and saved to StageModifications");
                            } else {
                                $failedSaves[] = $columnName;
                                \Log::debug("Deletion of " . $columnName . " succeeded but did not save to StageModifications");
                            }
                    }
                }

                // Check additions
                foreach($additions as $columnName => $data) {
                    if(!Schema::hasColumn($stage->tableName, $columnName)) {
                        $allGood = false;
                        $failedColumns[] = $columnName;
                        $errors[] = "Unable to create column " . $data['name'].  " (" . $columnName . ")";

                        \Log::debug("Addition of " . $columnName . " seems to have failed");
                    } else {
                        // Succeeded, put a record in the StageModifications table
                        $mod = new StageModification;
                            $mod->stage_id = $stage->id;
                            $mod->by = Auth::user()->id;
                            $mod->type = "addition";
                            $mod->column_key = $columnName;

                            if($mod->save()) {
                                // Sweet, it saved
                                \Log::debug("Addition of " . $columnName . " suceeded and saved to StageModifications");
                            } else {
                                $failedSaves[] = $columnName;                                
                                \Log::debug("Addition of " . $columnName . " succeeded but did not save to StageModifications");
                            }
                    }
                }

                $message = "";

                // Generate message for column failures.
                if(count($failedColumns) > 0) {
                    $message .= "Creation/deletion of ". count($failedColumns) ."/" . (count($additions) + count($deletions)) . " columns has failed. ";
                } else {
                    $message .= (count($additions) + count($deletions)) . " columns modified successfully. ";
                }

                // Generate message for save failures.
                if(count($failedSaves) > 0) {
                    $message .= count($failedSaves) ."/" . (count($additions) + count($deletions)) . " columns returned errors during a Forcept recording process. ";
                } else {
                    $message .= (count($additions) + count($deletions)) . " columns saved successfully. ";
                }

                \Log::debug("Generated message: " . $message);

                if(count($failedColumns) == 0 && count($failedSaves) == 0) {

                    \Log::debug("returning success");

                    // I guess it worked kappa
                    return response()->json([
                        "status" => "success",
                        "message" => "Changes saved."
                    ]);
                } else {
                    \Log::debug("returning failure");

                    // Sounds like it failed :/
                    return response()->json([
                        "status" => "failure",
                        "message" => $message,

                        "failedColumns" => $failedColumns,
                        "failedSaves" => $failedSaves
                    ]);
                }



            } else {
                return response()->json([
                    "status" => "failure",
                    "message" => "Failed to save stage."
                ], 422);
            } 


        } else {
            return response()->json([
                "status" => "failure",
                "message" => "Stage with ID " . $id . " does not exist in the database."
            ], 422);
        }

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
        $stage = Stage::where('id', $id);

        // If the stage exists
        if($stage->count() > 0) {
            // IF this stage isn't the root stage
            $stage = $stage->first();
            if($stage->root !== true) {

                Schema::dropIfExists($stage->tableName);

                // If the delete succeeds
                if($stage->delete()) {
                    return redirect()->route('console::flow::index')->with('alert', [ 'type' => 'success', 'message' => 'Stage deleted.' ]);
                } else return redirect()->route('console::flow::index')->with('alert', [ 'type' => 'failure', 'message' => 'An error occurred during deletion.'  ]);
            } else return redirect()->route('console::flow::index')->with('alert', [ 'type' => 'failure', 'message' => 'This is the root stage, and cannot be deleted.' ]);     
        } else return redirect()->route('console::flow::index')->with('alert', [ 'type' => 'failure', 'message' => 'Stage with ID ' . $id . 'does not exist.' ]);
    
    }
}
