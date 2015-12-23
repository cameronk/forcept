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

	
	Route::get('/', [
		'as' => 'index',
		function() {
			return view('index');
		}
	]);

	/**
	 * Visit
	 */
	Route::group([
		'prefix' => 'visit',
		'as' => 'visit::',
		'namespace' => 'Visit',
	], function() {

		// Visits index
		Route::get('/', [
			'as' => 'index',
			'uses' => 'VisitController@index'
		]);

		// Create visit
		Route::get('new', [
			'as' => 'create',
			'uses' => 'VisitController@create'
		]);

		// Create patient
		Route::post('create-patient', [
			'as' => 'create-patient',
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