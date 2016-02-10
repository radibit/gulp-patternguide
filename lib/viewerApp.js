'use strict';

var
  gulp = require('gulp'),
  jade = require('gulp-jade'),
  stylus = require('gulp-stylus'),
  del = require('del'),
  nib = require('nib'),
  autoPreFixer = require('gulp-autoprefixer'),
  flatten = require('gulp-flatten'),
  rename = require('gulp-rename'),
  browserify = require('browserify'),
  transform = require('vinyl-transform'),
  tap = require('gulp-tap'),
  path = require('path'),
  patternCollector = require('./patternCollector'),
  templating = require('./templating'),
  sgUtil = require('./util'),


  viewerOptions,
  patternsOptions,

  clean = function() {
    del.sync([viewerOptions.static+'/*'])

    sgUtil.log('Styleguide viewer: [✓] static dir "'+viewerOptions.static+'" cleaned up.');
  },

  renderJadePartials = function () {

    gulp.src([__dirname + '/../app/views/**/*.jade', '!' + __dirname + '/../app/views/**/_*.jade'])
      .pipe(jade({pretty: true}))
      .pipe(gulp.dest(viewerOptions.static + '/templates'))
      .on('end', function() {
        sgUtil.log('Styleguide viewer: [✓] templates generated');
      });
  },

  renderJadeIndexes = function () {

    gulp.src([__dirname + '/../app/*.jade', '!' + __dirname + '/../app/_*.jade'])
      .pipe(jade({
        pretty: true,
        locals: {
          projectTitle:  process.env.npm_package_description || 'styleguide',
          livereload: viewerOptions.livereload.enable,
          livereloadPort : viewerOptions.livereload.port,
          overrideCssFile: viewerOptions.overrideCssFile
        }
      }))
      .pipe(gulp.dest(viewerOptions.static))
      .on('end', function() {
        sgUtil.log('Styleguide viewer: [✓] index files generated');
      });
  },

  processStyles = function () {

    gulp.src([__dirname + '/../app/stylus/**/*.styl', '!' + __dirname + '/../app/stylus/**/_*.styl'])
      .pipe(stylus({use: [nib()]}))
      .pipe(autoPreFixer({browsers: ['> 5%', 'last 1 versions'], cascade: false}))
      .pipe(gulp.dest(viewerOptions.static + '/css'))
      .on('end', function() {
        sgUtil.log('Styleguide viewer: [✓] css generated');
      });
  },

  copyAssets = function () {

    gulp.src([__dirname + '/../app/assets/**/*', '!' + __dirname + '/../app/assets/**/_*'])
      .pipe(flatten())
      .pipe(gulp.dest(viewerOptions.static + '/assets'))
      .on('end', function() {
        sgUtil.log('Styleguide viewer: [✓] assets copied');
      });
  },

  copyLibs = function () {
    gulp.src([__dirname + '/../app/libs/**/*.js'])
      .pipe(flatten())
      .pipe(gulp.dest(viewerOptions.static + '/scripts/libs'))
      .on('end', function() {
        sgUtil.log('Styleguide viewer: [✓] libs copied');
      });
  },

  browserifyScripts = function () {

    gulp.src([__dirname + '/../app/scripts/*.js', '!' + __dirname + '/../app/scripts/_*.js'])
      .pipe(transform(function (fileName) {
        return browserify({
          entries: [fileName],
          debug: true,
          cache: {}, packageCache: {}, fullPaths: true
        }).bundle();
      }))
      .pipe(gulp.dest(viewerOptions.static + '/scripts'))
      .on('end', function() {
        sgUtil.log('Styleguide viewer: [✓] script bundle generated');
      });
  },

  renderPatterns = function () {

    gulp.src([patternsOptions.views + '/**/*.'+patternsOptions.sourceExt, '!' + patternsOptions.views + '/**/_*.'+patternsOptions.sourceExt])
      .pipe(tap(function (file) {
        file.contents = new Buffer(templating.render(file.path), "utf-8");
      }))
      .pipe(rename({extname: '.'+patternsOptions.targetExt}))
      .pipe(gulp.dest(viewerOptions.static + '/patterns'))
      .on('end', function() {
        sgUtil.log('Styleguide viewer: [✓] patterns rendered');
      });
  },

  savePatternStructure = function () {
    sgUtil.writeJsonFile(path.join(viewerOptions.static, 'json/structure.json'), patternCollector.readPatternStructure());
    sgUtil.log('Styleguide viewer: [✓] pattern structure json generated');
  },

  saveCollectedPatternFiles = function () {
    sgUtil.writeJsonFile(path.join(viewerOptions.static, 'json/files.json'), patternCollector.collectPatternFiles());
    sgUtil.log('Styleguide viewer: [✓] pattern files json generated');
  },

  init = function (options) {
    viewerOptions = options.viewerApp;
    viewerOptions.livereload = options.livereload;
    patternsOptions = options.patterns;

    clean();
    renderJadePartials();
    renderJadeIndexes();
    processStyles();
    copyAssets();
    copyLibs();
    browserifyScripts();
    renderPatterns();
    savePatternStructure();
    saveCollectedPatternFiles();
  };

module.exports.init = init;