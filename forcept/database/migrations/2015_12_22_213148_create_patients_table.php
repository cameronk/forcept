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
        Schema::create('patients', function (Blueprint $table) {
            $table->increments('id');
            $table->string('first_name')->nullable();
            $table->string('last_name')->nullable();
            $table->integer('createdBy');
            $table->boolean('inVisitStage')->default(false)->comment("Patient created but data not yet gathered from NewVisit");
            $table->timestamps();
            $table->softDeletes();
        });

        // Set-up default auto increment value
        DB::statement("ALTER TABLE `patients` AUTO_INCREMENT = 100000");
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        //
        Schema::dropIfExists('patients');
    }
}
