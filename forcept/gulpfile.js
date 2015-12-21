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

gulp.task('sass', function () {
  gulp.src('./resources/assets/sass/**/*.scss')
    .pipe(sass({ outputStyle: 'compressed' }).on('error', sass.logError))
    .pipe(gulp.dest('./public/assets/css'));
});
 
gulp.task('react', function () {
	return gulp.src('./resources/assets/react/**/*.jsx')
		.pipe(react())
		.pipe(gulp.dest('./public/assets/js'));
});

gulp.task('default', function () {
  gulp.watch('./resources/assets/sass/**/*.scss', ['sass']);
  gulp.watch('./resources/assets/react/**/*.jsx', ['react']);
});