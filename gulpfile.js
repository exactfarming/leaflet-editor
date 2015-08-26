var gulp = require('gulp');
var browserSync = require('browser-sync');
var del = require('del');
var vinylPaths = require('vinyl-paths');
var babelify = require('babelify');
var browserify = require('browserify');
var source = require('vinyl-source-stream');
var uglify = require('gulp-uglify');
var streamify = require('gulp-streamify');

gulp.task('build', function () {
  browserify({
    entries: './src/js/index.js',
    debug: true
  })
    .transform(babelify)
    .bundle()
    .pipe(source('index.js'))
    .pipe(gulp.dest('./dist/js/'))
    .pipe(browserSync.reload({stream: true}));
});

gulp.task('buildMin', function () {
  browserify({
    entries: './src/js/index.js',
    debug: true
  })
    .transform(babelify)
    .bundle()
    .pipe(source('index.min.js'))
    .pipe(streamify(uglify()))
    .pipe(gulp.dest('./dist/js/'));
});

gulp.task('copy', function () {
  gulp.src('src/css/index.css')
    .pipe(gulp.dest('./dist/css'));
});

gulp.task('browserSync', function () {
  browserSync({
    server: {
      baseDir: './'
    },
    startPath: '/examples/'
  });
});

gulp.task('watchFiles', function () {
  gulp.watch('src/css/index.css', ['copy']);
  gulp.watch('dist/index.html').on('change', browserSync.reload);
  gulp.watch(['dist/**/*.js', 'src/**/*.js', 'src/**/*.css', '!dist/js/index.js', '!dist/js/index.min.js'], ['copy', 'build', 'buildMin']);
});

gulp.task('clean', function () {
  gulp.src('./dist/*', {read: false})
    .pipe(vinylPaths(del));
});


gulp.task('default', ['clean', 'copy', 'build', 'buildMin', 'browserSync', 'watchFiles']);