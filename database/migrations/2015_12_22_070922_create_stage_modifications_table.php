<?php

use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class CreateStageModificationsTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        //
        Schema::create('stage_modifications', function (Blueprint $table) {
            $table->increments('id');
            $table->integer('stage_id');
            $table->integer('by');
            $table->enum('type', ['addition', 'deletion']);
            $table->string('column_key');
            $table->string('column_deletion_destination')->nullable();
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
        Schema::dropIfExists('stage_modifications');
    }
}
