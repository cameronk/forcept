var gulp = require('gulp');
var sass = require('gulp-sass');
var react = require('gulp-react');
var uglify = require('gulp-uglify');
var rename = require('gulp-rename');
var concat = require('gulp-concat');
var addsrc = require('gulp-add-src');

gulp.task('default', function () {

    /**
     * Build SASS resources
     */
    var SassSheets = gulp.src([
        './resources/assets/sass/template.scss',
        './resources/assets/sass/template-basic.scss'
    ]);

    // Uncompressed development version
    SassSheets
        .pipe(rename(function(path) {
            path.extname = ".css";
        }))
        .pipe(sass().on('error', sass.logError))
        .pipe(gulp.dest('./public/assets/css'));

    // Compressed production version
    SassSheets
        .pipe(rename(function(path) {
            path.extname = ".min.css";
        }))
        .pipe(sass({
            outputStyle: 'compressed'
        }))
        .pipe(gulp.dest('./public/assets/css'));



    /**
     * Build REACT assets
     */
    var ReactScripts = gulp.src([
        // data-displays
        './resources/assets/react/data-displays/DataDisplays.jsx',
        './resources/assets/react/data-displays/*.jsx',

        // fields
        './resources/assets/react/fields/Fields.jsx',
        './resources/assets/react/fields/*.jsx',

        // flow-editor
        './resources/assets/react/flow-editor/FlowEditor.jsx',
        './resources/assets/react/flow-editor/*.jsx',

        // patients
        './resources/assets/react/patients/Table.jsx',
        './resources/assets/react/patients/*.jsx',

        // stage-visits
        './resources/assets/react/stage-visits/StageVisits.jsx',
        './resources/assets/react/stage-visits/*.jsx',

        // utilities
        './resources/assets/react/utilities/Utilities.jsx',
        './resources/assets/react/utilities/*.jsx',

        // visit
        './resources/assets/react/visit/Visit.jsx',
        './resources/assets/react/visit/*.jsx',
    ]);


    // Build compiled development version
    ReactScripts
        .pipe(concat('compiled.js'))
        .pipe(react())
        .pipe(gulp.dest('./public/assets/js'));


    // Build compiled production version
    ReactScripts
        .pipe(concat('compiled.min.js'))
        .pipe(react())
        .pipe(uglify({
            mangle: true,
            compress: {
                drop_console: true,
            }
        }))
        .pipe(gulp.dest('./public/assets/js'));


});

gulp.task("vendor", function() {
    var VendorScripts = gulp.src([
        './public/assets/bootstrap/dist/js/bootstrap.js',
        './public/assets/tether-1.1.1/dist/js/tether.js',
        './public/assets/react/react.js',
        './public/assets/react/react-dom.js',
    ]);

    // Non-minified vendor scripts for testing
    VendorScripts
        .pipe(concat('vendor.js'))
        .pipe(gulp.dest('./public/assets/js'));

    // Minified vendor scripts
    VendorScripts
        .pipe(concat('vendor.min.js'))
        .pipe(uglify({
            mangle: false
        }))
        .pipe(gulp.dest('./public/assets/js'));

});
