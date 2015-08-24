var gulp = require('gulp');
var browserSync = require('browser-sync');
var del = require('del');
var vinylPaths = require('vinyl-paths');
var babelify = require('babelify');
var browserify = require('browserify');
var source = require('vinyl-source-stream');

gulp.task('buildExample', function () {
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

//gulp.task('copy', function () {
//  gulp.src('examples/index.html')
//    .pipe(gulp.dest('./dist'))
//    .pipe(browserSync.reload({stream: true}));
//});

gulp.task('browserSync', function () {
  browserSync({
    server: {
      baseDir: './'
    },
    startPath: '/examples/'
  });
});

gulp.task('watchFiles', function () {
  gulp.watch('src/index.html', ['copy']);
  gulp.watch('dist/index.html').on('change', browserSync.reload);
  gulp.watch(['dist/**/*.js', 'src/**/*.js', '!dist/js/index.js'], ['buildExample']);
});

gulp.task('clean', function () {
  gulp.src('./dist', {read: false})
    .pipe(vinylPaths(del));
});


gulp.task('default', ['clean', 'buildExample', 'browserSync', 'watchFiles']);