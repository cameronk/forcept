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
        DB::statement("ALTER TABLE `visits` AUTO_INCREMENT = 100");
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
