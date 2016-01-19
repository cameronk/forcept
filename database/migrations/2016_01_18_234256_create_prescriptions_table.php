<?php

use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class CreatePrescriptionsTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        //
        Schema::create('prescription_sets', function (Blueprint $table) {
            $table->increments('id');
            $table->integer('visit_id');
            $table->integer('patient_id');
            $table->integer('created_by');
            $table->json('prescriptions')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        //
        Schema::dropIfExists('prescription_sets');
    }
}
