<?php

namespace App\Http\Controllers\Console;

use App\User;

use Illuminate\Http\Request;

use App\Http\Requests;
use App\Http\Requests\CreateUserRequest;
use App\Http\Controllers\Controller;

class UsersController extends Controller
{
    /**
     * Display a listing of the resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function index()
    {
        //
        return view('console/users/index');
    }

    /**
     * Show the form for creating a new resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function create()
    {
        //
        return view('console/users/create');
    }

    /**
     * Store a newly created resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     */
    public function store(CreateUserRequest $request)
    {
        //
        $user = new User;
            $user->username = $request->username;
            $user->password = $request->password;
            $user->admin = $request->has('is_admin') ? $request->is_admin : 0;

            if($user->save()) {
                return redirect()->route('console::users::index')->with('alert', [ 'type' => 'success', 'message' => 'User added.' ]);
            } else return redirect()->route('console::users::create')->with('alert', [ 'type' => 'failure', 'message' => 'An error occurred, and the user could not be added.' ]);
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
        $user = User::where('id', $id);

        // If the user exists
        if($user->count() > 0) {
            // IF this user isn't the root user
            if($user->first()->id !== 0) {
                // If the delete succeeds
                if($user->delete()) {
                    return redirect()->route('console::users::index')->with('alert', [ 'type' => 'success', 'message' => 'User deleted.' ]);
                } else return redirect()->route('console::users::index')->with('alert', [ 'type' => 'failure', 'message' => 'This is the root user, and cannot be deleted.' ]);
            } else return redirect()->route('console::users::index')->with('alert', [ 'type' => 'failure', 'message' => 'User with ID ' . $id . 'does not exist.' ]);     
        } else return redirect()->route('console::users::index')->with('alert', [ 'type' => 'failure', 'message' => 'User with ID ' . $id . 'does not exist.' ]);
    }
}
