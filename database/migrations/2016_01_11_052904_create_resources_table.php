<?php

use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class CreateResourcesTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        //
        Schema::create('resources', function(Blueprint $table) {
            $table->increments('id');
            $table->integer('uploaded_by');
            $table->string('type');
            $table->boolean('referenced')->default(true);
            $table->longText('base64');
            $table->timestamps();
        });

        // Set-up default auto increment value
        DB::statement("ALTER TABLE `resources` AUTO_INCREMENT = 100000");
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        //
        Schema::dropIfExists('resources');
    }
}
