# Forcept v1.0.0-beta
Field-Oriented Clinic Elastic Patient Tracker

# Installation
Forcept is built on PHP, and can be run on any system with a webserver environment configured to serve PHP pages.
1. Grab the latest Forcept release from [the releases page](https://github.com/CameronK/forcept/releases)
2. Download and install [Composer](https://getcomposer.org/download/)
3. Unpack the Forcept zip file, navigate to its directory and run `composer install`
4. Follow the instructions below for configuration.

## Setup
### MySQL
Forcept requires a database connection to store data. We recommend using MySQL.
The necessary steps for setting up MySQL vary by machine:
- For Windows / Mac OSX machines, visit the [MySQL Installer](http://dev.mysql.com/downloads/mysql/) page, download the version that corresponds with your operating system, and run the installer.
- For Linux-based machines, see [this tutorial](http://dev.mysql.com/doc/refman/5.7/en/linux-installation.html)

Once MySQL is configured, create a user and corresponding database for Forcept. By default, the application assumes that the MySQL server is running locally (`localhost`), using the `root` user with password `f0rc3pt` to connect to a database named `forcept`. If you'd like to change these values, keep reading.

## Configuration
### Database connection
To configure the database connection for Forcept, open the `.env` file in the root directory and change values as necessary.
- `DB_HOST`: database host address (Default: `localhost`)
- `DB_DATABASE`: name of the database to store Forcept tables within (Default: `forcept`)
- `DB_USERNAME`: MySQL user used to connect to the above database (Default: `root`)
- `DB_PASSWORD`: password associated with the above user (Default: `f0rc3pt`)

### Setting up the application security key
Forcept encrypts session data using a key stored in the `.env` file. A default value has been set; however, for security purposes, it can be changed to any random 32-character string.

To generate one, run `php artisan key:generate`, copy the key that is shown in brackets, and overwrite the old one within `.env`.

### Other available configuration values
- `APP_ENV`: Application environment. Setting this to "production" will inform Forcept to load minified versions of Javascript assets to reduce page load and execution time. (Default: `local`)
- `APP_DEBUG`: Display detailed error messages. Setting this to false will display a generic error message. It is recommended that this be set to `false` when working in a production environment, as error messages can potentially contain sensitive information about the environment. (Default: `true`)
- `APP_TIMEZONE`: Set the timezone that will be used when saving/rendering time-sensitive data. A list of values can be found on [php.net](http://php.net/manual/en/timezones.php)

### Migrating default database tables
In order to build a scaffold for storing your application's data, Forcept needs to migrate several basic tables into your database. This can be done automatically by running `php artisan migrate --seed` within the root directory of your installation.

__IMPORTANT__: Make sure you include the `--seed` parameter - this tells Forcept to load default data, such as the default admin user, into the database. If you forget to include this parameter, you can manually call it by running `php artisan db:seed`.

__Note__: You must have a correctly setup and configured database connection in order to run the database migration! See above for instructions.

## Try it out!
Navigate to your webserver - you should see the Forcept login panel. Congratulations! The hard part is over.
The default login information for Forcept is as follows:
- Username: `admin`
- PIN: `1234`

__Note__: If this information doesn't work, try running `php artisan db:seed`.

## Customization
Forcept provides an intuitive administrator panel that allows an administrator to make quick, painless changes to the data being recorded throughout the visit flow process.

__Note__: Before you begin, take a look at the __Terminology__ section of this README.

### Accessing the admin panel
To navigate to the administrator panel, click the drop-down menu in the top right corner and select `Manage Forcept`.

__Note__: By default, the `admin` user is marked as an administrator in the system and therefore can access this panel. When creating other users, they too must be marked as "administrator" before they will be granted access to the panel. See "Creating new users" below.

### Working with users
By default, Forcept ships with only the `admin` user. To add, modify, or remove users, choose the `User Management` option in the navigation panel.

#### Add:
1. Click the `Create a new user` button at the top of the page.
2. Enter a username and PIN for the new account.
3. If the new account should have administrator privileges, check the box marked `Yes, this user is an administrator`.
4. Click `Create`

#### Modify
_Coming soon_

#### Delete
1. Navigate to the `User Management` panel
2. Locate the user you'd like to remove in the list
3. Click `Delete user`

__Note__: The default user, `admin`, cannot be deleted.

### Patient flow
To modify the way patients move about your clinic, or what options are recorded, navigate to the Patient Flow panel by clicking `Patient flow` in the sidebar.

#### Add a stage
1. Click `Create a new stage`
2. Choose a stage type (`basic` or `pharmacy`)
3. Enter a name for the stage
4. Click `Create stage`

__Note__: Only one pharmacy stage can exist at a time.

#### Edit stage configuration
Once you've created a stage (or if you want to modify an already-existing stage), return to the `Patient flow` tab within the administrator panel, locate the stage you wish to modify, and choose `Edit stage config`.

On the stage configuration page, you can add, modify, and remove the fields that will appear as data entry points for this particular stage within patient flow.

__Note__: The `Check-in` stage has several fields that cannot be removed. These are `first_name`, `last_name`, `birthday`, `photo`, and `priority`. These fields must be present in order for basic Forcept features, such as the patient flow system and patient searches, to operate smoothly. Hence, the `Remove` option is disabled and an appropriate notice is displayed.

#### `Basic` stage configuration
##### Adding a new field
1. At the bottom of the page, click the blue button labeled `Add a new field`.
- A new field with a unique identifier will be appended to the list.
2. Choose a name for the field by typing in the `Field name` box
3. Choose a type for the field from the dropdown menu labeled `Type`
4. Add a description of the field in the `Description` box (optional)

##### Types of fields
Forcept ships with a variety of fields types to allow fast, efficient, intuitive data collection.

__Inputs__
- `Text input`: a basic text input. Type in any character. (_no configuration required_)
- `Textarea input`: multi-line text input. Type in any character. (_no configuration required_)
- `Number input`: similar to text input. Configured such that most modern browsers will limit input to numbers only. Use keyboard up/down arrows to increment or decrement value. (_no configuration required_)
- `Date input`: use a Date selector provided by the browser to choose a date. (_no configuration required_)

__Multiple-option fields__
- `Select input with options`: shows a drop-down box with specified options. (_customizable!_)
- `Multi-select input with options`: similar to above, except multiple options are selectable. (_customizable!_)
- `File input`: allow uploading of files. __Work in progress__ (_customizable!_)
- `Yes or no buttons`: show two buttons labeled "Yes" and "No". Selecting one deselects the other. Useful for simple yes/no questions. (_no configuration required_)

__Other__
- `Group fields with a header`: Creates a labeled divider between two sets of fields. Great for organizing stages with a lot of fields. (_no configuration required_)
- `Pharmacy - show available medication`: Builds a list of medication directly from the pharmacy stock. __You must create a Pharmacy stage for this field to work.__ (_no configuration required_)

##### Customizing a field
Some field types allow for various customizations.

##### > Select/Multiselect
In the customization panel, you can add an add options to the input by clicking the button labeled `Add another option`. Once options are created, their values can be changed, reordered, and removed as necessary.

The `Select input with options` field also allows for the user to enter custom data. To enable this, check the box marked "Allow users to enter custom data for this field".

##### > File
In the customization panel, you can choose which file types are capable of being uploaded to the server. Files are encoded and stored in database table for on-demand fetching. Image file types will be rendered as an image whenever they are loaded. Other file types will display some basic file information and a link to the actual file data.

__Available file types__:
- image/* (any image type)
- _more coming soon_

##### Changing the order of fields
_Currently, the order of fields cannot be changed. Coming soon!_

#### `Pharmacy` stage configuration
`Pharmacy` stages work very similarly to `basic` stages. Rather than adding fields, a Pharmacy stage allows you to add "categories" of medicine. Within each category, you can add as many medicines as you wish. Each medicine has two properties: `count` and `available`.

As of ___v1.0.0-beta___, the `count` property does nothing other than display the `count` specified within the medication list - it doesn't update when a medicine is given out. (_this is coming soon_).
The `available` property specified whether a drug is currently available for providers to prescribe, or for the pharmacist to give. When marked `No`, the option to choose this drug within the `Pharmacy` stage will be disabled. In addition, any `Pharmacy - show available medication` fields will also hide the corresponding option.

### Uploading pre-made configuration files
Forcept ships with four configuration file, each corresponding to a unique stage. These config files are the values used by the __Saint Matthew Church Haiti Medical Mission__, which organized the creation of this application.

To utilize these presets, do the following:
- Open the administrator panel, click the `Patient flow` tab, and edit the first stage (labeled by default as `Check-in`)
- To the right of the header marked `Field configuration`, click the `Upload config` button.
- Navigate to the Forcept directory on your machine, find the folder named `flow-configs` and upload the corresponding `Check-in.json` file.
- At the bottom of the page, click `Submit changes`
- Once changes have submitted, click `Back to patient flow home`
- Repeat these steps for the following two stages, `Triage` and `Medical`, in that order.
- Repeat once again for the final stage, `Pharmacy`, __but make sure to choose the `Pharmacy` stage type before creating.__

# Design and structure information
## Cross-device compatibility
Forcept is designed to work in any browser, on any modern device. This means that you can access the Forcept panel, add patients, and modify settings on any device - laptop, tablet, or phone!

To accommodate various screen sizes, some elements within Forcept may be repositioned in order to provide the most coherent viewing experience. Columns will stack from left to right. For example, viewing the "New visit" screen on a small devices such as a phone will render the patient overview sidebar above the data entry block, rather than to the left.

In some cases, non-essetial elements may be hidden when viewing on smaller screens (primarily portrait-oriented phones).

## Conventions
Throughout the Forcept application, various numbers, colors, and icons refer to different pieces of information. To stay consistent and eliminate potential confusion, these references are kept as consistent as possible.

### Tags
A tag is a small label attached to a record which resides within the database. Patients, visits, and fields all have tags. The numbers displayed within a tag provide a reference to its location within the database, as well as its position in the viewport.

![tag-1](https://raw.githubusercontent.com/CameronK/forcept/develop/public/assets/img/screenshots/tag-1.png)

This is an example of a tag which refers to a field in the administrator panel. The blue section marks the "index" of the field, or its position in the entire list of fields. For example, since this field was the first out of 10 other fields, its index is `1`. The grey portion displays the ID of the record. This particular field has a randomly generated number as its ID. Other fields will use a unique (but much smaller) number for referencing a record. This color pattern is consistent throughout the program.

### Terminology
__TODO__: Finish this section

# Contributing
## Using the Vagrant box
By default, Forcept ships with pre-configured [Vagrant](http://vagrantup.com) box. To utilize this, simply [download and install Vagrant](https://www.vagrantup.com/downloads.html) (you will also need to install [VirtualBox](https://www.virtualbox.org/wiki/Downloads)), navigate to your Forcept directory in a terminal, and run `vagrant up`. This will install the necessary software and run the configuration scripts on the VM to setup  
