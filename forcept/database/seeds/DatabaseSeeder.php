<?php

use Illuminate\Database\Seeder;
use Illuminate\Database\Eloquent\Model;

class DatabaseSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        Model::unguard();

        // $this->call(UserTableSeeder::run);

        DB::table('users')->insert([
            'username'=> 'admin',
            'password' => bcrypt('1234'),
            'admin' => true
        ]);

        DB::table('stages')->insert([
            'type' => 'basic',
            'name' => 'Check-in',
            'root' => true
        ]);

        Model::reguard();
    }
}
