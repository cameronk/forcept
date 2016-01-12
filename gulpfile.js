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
    gulp.src('./forcept/resources/assets/react/**/*.jsx')
        .pipe(react())
        .pipe(gulp.dest('./forcept/public/assets/js'));

    gulp.src('./forcept/resources/assets/sass/**/*.scss')
        .pipe(sass().on('error', sass.logError))
        .pipe(gulp.dest('./forcept/public/assets/css'));

});
