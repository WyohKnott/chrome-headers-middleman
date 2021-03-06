var gulp = require('gulp')
var browserify = require('browserify')
var babelify = require('babelify')
var through = require('through2')
var mv = require('gulp-rename')
var zip = require('gulp-zip')

var jsFiles = 'src/**/*.js'
var staticFiles = [
  'manifest.json',
  'background.js',
  'options.html',
  'styles.css',
  'images/**/*'
]

var reactFiles = [
  'bower_components/react/react.min.js'
]

gulp.task('default', [ 'static', 'scripts' ])

gulp.task('scripts', scriptsBuilder(true))
gulp.task('productionScripts', scriptsBuilder(false))

gulp.task('static', function() {
  gulp.src(reactFiles, { base: './bower_components/react' })
    .pipe(gulp.dest('dist'))
  return gulp.src(staticFiles, { base: './' })
    .pipe(gulp.dest('dist'))
})

gulp.task('watch', [ 'default' ], function() {
  gulp.watch(jsFiles, [ 'scripts' ])
  gulp.watch(staticFiles, [ 'static' ])
})

gulp.task('publish', [ 'static', 'productionScripts' ], function() {
    var manifest = require('./manifest'),
        distFileName = manifest.name + ' v' + manifest.version;
    gulp.src(['dist/**'])
      .pipe(zip(distFileName + '.xpi'))
      .pipe(gulp.dest('build'))
    return gulp.src(['dist/**'])
      .pipe(zip(distFileName + '.zip'))
      .pipe(gulp.dest('build'));
})

function scriptsBuilder(debug) {
  return function() {
    return gulp.src('src/index.js')
      .pipe(through.obj(function (file, enc, next) {
        browserify(file.path, { debug: debug })
          .transform(babelify)
          .bundle(function (err, res) {
            if (err) return next(err)
            file.contents = res
            next(null, file)
          })
      }))
      .on('error', function (error) {
        console.log(error.stack)
        this.emit('end')
      })
      .pipe(mv('app.js'))
      .pipe(gulp.dest('dist'))
  }
}
