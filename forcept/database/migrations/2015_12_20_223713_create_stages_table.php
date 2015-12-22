<?php

use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class CreateStagesTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        //
        Schema::create('stages', function (Blueprint $table) {
            $table->increments('id');
            $table->integer('order');
            $table->string('name');
            $table->enum('type', ['basic', 'pharmacy']);
            $table->boolean('root')->default(false);
            $table->json('fields');
            $table->softDeletes();
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
        Schema::drop('stages');
    }
}
