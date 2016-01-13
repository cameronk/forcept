// var elixir = require('laravel-elixir');

/*
 |--------------------------------------------------------------------------
 | Elixir Asset Management
 |--------------------------------------------------------------------------
 |
 | Elixir provides a clean, fluent API for defining some basic Gulp tasks
 | for your Laravel application. By default, we are compiling the Sass
 | file for our application, as well as publishing vendor resources.
 |
 */

// elixir(function(mix) {
//     mix.sass([
//     	'template.scss'
//     ], 'public/assets/css');
// });


var gulp = require('gulp');
var sass = require('gulp-sass');
var react = require('gulp-react');
var uglify = require('gulp-uglify');
var rename = require('gulp-rename');

// gulp.task('sass', function () {
//
//     // { outputStyle: 'compressed' }
// });
//
// gulp.task('react', function () {
// 	return
// });

gulp.task('default', function () {
  // gulp.watch('./forcept/resources/assets/sass/**/*.scss', ['sass']);
  // gulp.watch('./forcept/resources/assets/react/**/*.jsx', ['react']);


    // Development scripts
    gulp.src('./resources/assets/react/**/*.jsx')
        .pipe(react())
        .pipe(gulp.dest('./public/assets/js'));

    gulp.src('./resources/assets/sass/**/*.scss')
        .pipe(sass().on('error', sass.logError))
        .pipe(gulp.dest('./public/assets/css'));


    // Minified versions
    gulp.src('./resources/assets/react/**/*.jsx')
        .pipe(rename(function(path) {
            path.extname = ".min.js";
        }))
        .pipe(react())
        .pipe(uglify({
            mangle: true,
            compress: {
                drop_console: true,
            }
        }))
        .pipe(gulp.dest('./public/assets/js'));

    gulp.src('./resources/assets/sass/**/*.scss')
        .pipe(rename(function(path) {
            path.extname = ".min.css";
        }))
        .pipe(sass().on('error', sass.logError))
        .pipe(gulp.dest('./public/assets/css'));
});
