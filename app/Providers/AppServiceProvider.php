<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;

use App\Patient;
use App\Resource;
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
        // Add app config values
        config([
            'app.nonInputFieldTypes' => [
                'header'
            ],
            'app.version' => "v1.0.0-beta"
        ]);

        Patient::saving(function($patient) {
            if(Auth::check()) {
                $patient->last_modified_by = Auth::user()->id;
            }
        });

        Resource::creating(function($resource) {
            if(Auth::check()) {
                $resource->uploaded_by = Auth::user()->id;
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
