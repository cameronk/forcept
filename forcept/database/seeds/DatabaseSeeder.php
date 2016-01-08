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

        DB::table('users')->insert([
            'username'=> 'admin',
            'password' => bcrypt('1234'),
            'admin' => true
        ]);


        DB::table('stages')->insert([
            'type' => 'basic',
            'name' => 'Check-in',
            'root' => true,
            'fields' => json_encode([

                /** Immutables **/
                "first_name" => [
                    "type" => "text",
                    "name" => "First name",
                    "mutable" => false,
                    "settings" => null,
                ],
                "last_name" => [
                    "type" => "text",
                    "name" => "Last name",
                    "mutable" => false,
                    "settings" => null,
                ],
                "birthday" => [
                    "type" => "date",
                    "name" => "Birthday",
                    "mutable" => false,
                    "settings" => null
                ],
                "photo" => [
                    "type" => "file",
                    "name" => "Photo",
                    "mutable" => false,
                    "settings" => [
                        "accept" => [
                            "image/*"
                        ]
                    ]
                ],

                /** Haiti Mission defaults **/
                "gender" => [
                    "type" => "select",
                    "name" => "Gender",
                    "mutable" => true,
                    "settings" => [
                        "options" => [
                            "Male",
                            "Female"
                        ]
                    ]
                ],
                "chapel" => [
                    "type" => "select",
                    "name" => "Chapel",
                    "mutable" => true,
                    "settings" => [
                        "options" => [
                            "Bassin",
                            "Beaudin",
                            "C Roger",
                            "Champagne",
                            "Claire",
                            "Clerisso",
                            "Dallas",
                            "Dulmene",
                            "Faucodiere",
                            "Fillette",
                            "G Place",
                            "La Trouble",
                            "La Violette",
                            "Le Traitre",
                            "Libon",
                            "Lume",
                            "Margot",
                            "Mayette",
                            "Our Lady of Miracles",
                            "Pigeote",
                            "Pilot",
                            "Poudre Encens",
                            "Proprietaire",
                            "Rosalie",
                            "St. Augustin",
                            "St. Joseph",
                            "St. Therese",
                            "Tantey",
                            "Vastey",
                            "Vastey I",
                            "Vastey II",
                            "Other"
                        ],
                        "allowCustomData" => true
                    ],
                ],
                "married" => [
                    "type" => "yesno",
                    "name" => "Married",
                    "description" => "Are you married?",
                    "mutable" => true,
                    "settings" => null
                ],
                "number_in_house" => [
                    "type" => "number",
                    "name" => "Number in house",
                    "description" => "How many people live at home?",
                    "mutable" => true,
                    "settings" => null
                ],
                "clean_water_access" => [
                    "type" => "yesno",
                    "name" => "Clean water access",
                    "description" => "Do you have access to clean water?",
                    "mutable" => true,
                    "settings" => null
                ],
                "water_access_location" => [
                    "type" => "select",
                    "name" => "Water access location",
                    "description" => "Where do you get your water?",
                    "mutable" => true,
                    "settings" => [
                        "options" => [
                            "Spring water / local pipes",
                            "Chemical treatment",
                            "Reverse osmosis",
                            "Well at rectory",
                            "BioSand filter",
                            "River",
                            "Boiled"
                        ],
                        "allowCustomData" => false
                    ]
                ],
                "allergies" => [
                    "type" => "yesno",
                    "name" => "Allergies",
                    "description" => "Are you allergic to any medicine?",
                    "mutable" => true,
                    "settings" => null
                ],
                "allergies_details" => [
                    "type" => "textarea",
                    "name" => "Drug allergy details",
                    "mutable" => true,
                    "settings" => null
                ],
                "phone" => [
                    "type" => "yesno",
                    "name" => "Phone",
                    "description" => "Do you own a cell phone?",
                    "mutable" => true,
                    "settings" => null
                ]
            ])
        ]);

        DB::table('stages')->insert([
            'type' => 'basic',
            'name' => 'Triage',
            'root' => false,
            "fields" => json_encode([
                "priority" => [
                    "type" => "select",
                    "name" => "Priority",
                    "mutable" => false,
                    "settings" => [
                        "options" => [
                            "Normal",
                            "High",
                            "Urgent"
                        ],
                        "allowCustomData" => false
                    ]
                ],
            ])
        ]);

        DB::table('stages')->insert([
            'type' => 'basic',
            'name' => 'Medical',
            'root' => false,
            "fields" => json_encode([
                "priority" => [
                    "type" => "select",
                    "name" => "Priority",
                    "mutable" => false,
                    "settings" => [
                        "options" => [
                            "Normal",
                            "High",
                            "Urgent"
                        ],
                        "allowCustomData" => false
                    ]
                ]
            ])
        ]);


        Model::reguard();
    }
}
