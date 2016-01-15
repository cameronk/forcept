<?php

use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class CreatePatientsTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        //
        Schema::create('stage_1', function (Blueprint $table) {
            $table->increments('id');

            // Immutable base properties
            $table->string('first_name')->nullable();
            $table->string('last_name')->nullable();
            $table->string("birthday")->nullable();
            $table->json('photo')->nullable();
            //$table->string('full_name')->nullable(); // Not shown as a property in the admin panel, used for searching
            // $table->string('priority')->nullable();

            // Visit data
            $table->integer('current_visit')->nullable();
            $table->json('visits')->nullable();

            // Metadata
            $table->integer('created_by');
            $table->integer('last_modified_by')->default(0);
            $table->boolean('concrete')->default(false)->comment("Patient created but data not yet gathered from NewVisit");

            // Timestamps
            $table->timestamps();
            $table->softDeletes();
        });

        // Set-up default auto increment value
        DB::statement(sprintf("ALTER TABLE `stage_1` AUTO_INCREMENT = %s", env('APP_PATIENT_STARTING_INDEX', 100000)));
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        //
        Schema::dropIfExists('stage_1');
    }
}
