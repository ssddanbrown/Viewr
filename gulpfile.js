var gulp = require('gulp');
var babel = require("gulp-babel");
var browserSync = require('browser-sync').create();

// CSS and javascript
var sass = require('gulp-sass'),
	minifyCss = require('gulp-minify-css'),
	autoprefixer = require('gulp-autoprefixer'),
	uglify = require('gulp-uglify'),
	sourcemaps = require('gulp-sourcemaps');

gulp.task('browser-sync', function() {
    browserSync.init({
        server: {
            baseDir: "./"
        },
        files: ["*.html"]
    });
});

// CSS dev Task, Adds sourcemaps and does not minify.
gulp.task('css-dev', function() {
	return gulp.src('sass/*.scss')
		.pipe(sourcemaps.init())
		.pipe(sass().on('error', sass.logError))
		.pipe(autoprefixer('last 2 version', 'ie 8', 'ios 5', 'android 3'))
		.pipe(sourcemaps.write())
		.pipe(gulp.dest('dist/css'))
		.pipe(browserSync.stream());
});

// CSS Task, Compile sass, prefix and minify
gulp.task('css', function() {
	return gulp.src('sass/*.scss')
		.pipe(sass().on('error', sass.logError))
		.pipe(autoprefixer('last 2 version', 'ie 8', 'ios 5', 'android 3'))
		.pipe(minifyCss())
		.pipe(gulp.dest('dist/css'));
});

// Scripts task, Minify
gulp.task('scripts', function() {
	return gulp.src('scripts/*.js')
    	.pipe(babel())
		.pipe(uglify())
		.pipe(gulp.dest('dist/scripts'));
});

gulp.task('scripts-dev', function() {
	return gulp.src('scripts/*.js')
	    .pipe(sourcemaps.init())
    	.pipe(babel())
    	.pipe(sourcemaps.write("."))
		.pipe(gulp.dest('dist/scripts'))
		.pipe(browserSync.stream());
});

gulp.task('watch', ['css-dev', 'scripts-dev', 'browser-sync'], function() {
	gulp.watch(['template/**', 'scripts/**', 'stylesheet/**', '*.html']);
	gulp.watch('sass/*.scss', ['css-dev']);
	gulp.watch('scripts/*.js', ['scripts-dev']);
});

// Dev environment task
gulp.task('default', ['css-dev', 'scripts-dev']);
// Production environment
gulp.task('production', ['css', 'scripts']);