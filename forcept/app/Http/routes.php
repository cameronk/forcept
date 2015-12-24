<?php

/*
|--------------------------------------------------------------------------
| Application Routes
|--------------------------------------------------------------------------
|
| Here is where you can register all of the routes for an application.
| It's a breeze. Simply tell Laravel the URIs it should respond to
| and give it the controller to call when that URI is requested.
|
*/

Route::group(['middleware' => 'auth'], function () {

	/*
	 * Display the forcept index page
	 * @returns View
	 *
	 * => index
	 */
	Route::get('/', [
		'as' => 'index',
		function() {
			return view('index');
		}
	]);

	/**
	 * Visits
	 *
	 * => visits::
	 */
	Route::group([
		'prefix' => 'visits',
		'as' => 'visits::',
	], function() {

		/**
		 * Display the visit index page
		 * @returns View
		 *
		 * => visits::index
		 */
		Route::get('/', [
			'as' => 'index',
			'uses' => 'VisitController@index'
		]);

		/**
		 * Display the visit creation page
		 * @returns View
		 * 
		 * => visits::create
		 */
		Route::get('new', [
			'as' => 'create',
			'uses' => 'VisitController@create'
		]);

		/**
		 * Handle visit creation/updating as necessary
		 * @returns JSON 
		 *
		 * => visits::handle
		 */
		Route::post('store', [
			'as' => 'store',
			'uses' => 'VisitController@store'
		]);

		/**
		 * Get visits for a specified stage ID
		 * @returns JSON
		 *
		 * => visits::get
		 */
		Route::get('fetch/{stage}', [
			'as' => 'fetch',
			'uses' => 'VisitController@fetch'
		]);

		/**
		 * Stage
		 *
		 * => visits::stage::
		 */
		Route::group([
			'prefix' => 'stage',
			'as' => 'stage::'
		], function() {

			/**
			 * Display all visits under this stage.
			 */
			Route::get('{stage}', [
				'uses' => 'VisitController@stage'
			]);

			/**
			 * Displays visit editor with stage fields.
			 */
			Route::get('{stage}/handle/{visit}', [
				'uses' => 'VisitController@handle'
			]);
			
		});

	});

	/**
	 * Patients
	 *
	 * => patients::
	 */
	Route::group([
		'prefix' => 'patients',
		'as' => 'patients::'
	], function() {

		/**
		 * Make a new patient record 
		 * @returns JSON
		 *
		 * => patients::create
		 */
		Route::post('create', [
			'as' => 'create',
			'uses' => 'PatientController@create'
		]);


	});


	/** 
	 * Console
	 */
	Route::group([
		'prefix'=> 'console', 
		'as' => 'console::', 
		'namespace' => 'Console'
	], function() {

		// Console index
		Route::get('/', [
			'as' => 'index',
			'uses' => 'ConsoleController@getIndex'
		]);


		/**
		 * User controller resource
		 */
		Route::group([
			'prefix' => 'users',
			'as' => 'users::',
		], function() {

			// Users index
			Route::get('/', [
				'as' => 'index',
				'uses' => 'UsersController@index'
			]);

			// Create user
			Route::get('create', [
				'as' => 'create',
				'uses' => 'UsersController@create'
			]);

			// Store user
			Route::post('create', [
				'as' => 'store',
				'uses' => 'UsersController@store'
			]);

			// Delete user
			Route::delete('delete/{id}', [
				'uses' => 'UsersController@destroy'
			]);

		});

		/**
		 * Flow controller resource
		 */
		Route::group([
			'prefix' => 'flow',
			'as' => 'flow::', 
		], function() {

			// Flow index
			Route::get('/', [
				'as' => 'index',
				'uses' => 'FlowController@index'
			]);

			// Create stage
			Route::get('create', [
				'as' => 'create',
				'uses' => 'FlowController@create'
			]);

			// Store stage
			Route::post('create', [
				'as' => 'store',
				'uses' => 'FlowController@store'
			]);

			// Edit stage
			Route::get('edit/{id}', [
				'uses' => 'FlowController@edit'
			]);

			// Update stage
			Route::post('edit/{id}', [
				'uses' => 'FlowController@update'
			]);

			// Delete stage
			Route::delete('delete/{id}', [
				'uses' => 'FlowController@destroy'
			]);

		});
	});

});


/**
 * Auth
 */
Route::get('auth/login', [
	'as' => 'auth::login', 
	'uses' => 'Auth\AuthController@getLogin'
]);
Route::get('auth/logout', [
	'as' => 'auth::logout',
	'uses' => 'Auth\AuthController@getLogout'
]);
Route::post('auth/login', 'Auth\AuthController@postLogin');