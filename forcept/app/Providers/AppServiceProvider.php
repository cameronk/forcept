<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;

use App\Patient;
use Auth;
use View;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Bootstrap any application services.
     *
     * @return void
     */
    public function boot()
    {
        // 

        Patient::saving(function($patient) {
            if(Auth::check()) {
                $patient->last_modified_by = Auth::user()->id;
            }
        });
    }

    /**
     * Register any application services.
     *
     * @return void
     */
    public function register()
    {
        //
    }
}
