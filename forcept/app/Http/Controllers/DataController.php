<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

use App\Http\Requests;
use App\Http\Requests\GetVisitsDataRequest;
use App\Http\Controllers\Controller;

use App\Visit;
use App\Stage;
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

        switch(strtolower($method)) {
            case "count":
                //
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

                $data = [];

                $visits = Visit::where('created_at', '>', $startDate)
                                ->where('created_at', '<', $endDate)
                                ->get(['patients', 'stage'])
                                ->groupBy('stage');
                $stages = Stage::where('root', '!=', true)
                                ->orderBy('order', 'asc')
                                ->get(['id', 'name'])
                                ->groupBy('id');

                $stages = $stages->keys()->push("__checkout__")->map(function($stageID) use($stages, $visits) {
                    return [
                        "name" => $stageID == "__checkout__" ? "Checked out" : $stages[$stageID][0]['name'], 
                        "visits" => $visits->get($stageID)->count(),
                        "patients" => $visits->get($stageID)->map(function($visit) {
                            return count($visit->patients);
                        })->sum()
                    ];
                });
                
                return response()->json([
                    "stages" => $stages
                ]);
                break;
        }
    }

    /**
     * Show the form for creating a new resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function create()
    {
        //
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
