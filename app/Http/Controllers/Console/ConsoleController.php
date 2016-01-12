<?php

namespace App\Http\Controllers\Console;


use App\Http\Controllers\Controller;

class ConsoleController extends Controller
{

	/**
	 * Constructor
	 *
	 * @return void
	 */
	public function __construct()
	{
		$this->middleware('admin');
	}


	/**
	 * Display the index page.
	 *
	 * @return Reponse
	 */
	public function getIndex()
	{
		return view('console/index');
	}

}

