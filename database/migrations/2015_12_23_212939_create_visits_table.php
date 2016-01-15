<?php

use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class CreateVisitsTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        //
        Schema::create('visits', function (Blueprint $table) {

            $table->increments('id');
            $table->json('patients');
            $table->string('stage');
            $table->timestamps();

        });

        // Set-up default auto increment value
        DB::statement(sprintf("ALTER TABLE `visits` AUTO_INCREMENT = %s", env('SETUP_VISIT_STARTING_INDEX', 100)));
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        //
        Schema::dropIfExists('visits');
    }
}
