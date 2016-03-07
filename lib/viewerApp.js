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
  templateRender = require('./templateRender'),
  sgUtil = require('./util'),


  config,


  clean = function () {

    del.sync([config.dest + '/*']);
    sgUtil.log('Styleguide viewer: [✓] dest dir "' + config.dest + '" cleaned up.');
  },

  renderViewerPartials = function () {

    gulp.src([__dirname + '/../app/views/**/*.jade', '!' + __dirname + '/../app/views/**/_*.jade'])
      .pipe(jade({pretty: true}))
      .pipe(gulp.dest(config.dest + '/templates'))
      .on('end', function () {
        sgUtil.log('Styleguide viewer: [✓] templates generated');
      });
  },

  renderViewerIndexes = function () {

    gulp.src([__dirname + '/../app/*.jade', '!' + __dirname + '/../app/_*.jade'])
      .pipe(jade({
        pretty: true,
        locals: {
          projectTitle: process.env.npm_package_description || 'styleguide',
          cssFiles: config.cssFiles,
          jsFiles: config.jsFiles
        }
      }))
      .pipe(gulp.dest(config.dest))
      .on('end', function () {
        sgUtil.log('Styleguide viewer: [✓] index files generated');
      });
  },

  processStyles = function () {

    gulp.src([__dirname + '/../app/stylus/**/*.styl', '!' + __dirname + '/../app/stylus/**/_*.styl'])
      .pipe(stylus({use: [nib()]}))
      .pipe(autoPreFixer({
        browsers: ['> 5%', 'last 1 versions'],
        cascade: false
      }))
      .pipe(gulp.dest(config.dest + '/css'))
      .on('end', function () {
        sgUtil.log('Styleguide viewer: [✓] css generated');
      });
  },

  copyAssets = function () {

    gulp.src([__dirname + '/../app/assets/**/*', '!' + __dirname + '/../app/assets/**/_*'])
      .pipe(flatten())
      .pipe(gulp.dest(config.dest + '/assets'))
      .on('end', function () {
        sgUtil.log('Styleguide viewer: [✓] assets copied');
      });
  },

  copyLibs = function () {
    gulp.src([__dirname + '/../app/libs/**/*.js'])
      .pipe(flatten())
      .pipe(gulp.dest(config.dest + '/scripts/libs'))
      .on('end', function () {
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
      .pipe(gulp.dest(config.dest + '/scripts'))
      .on('end', function () {
        sgUtil.log('Styleguide viewer: [✓] script bundle generated');
      });
  },

  renderPatterns = function (viewPath, sourceExt, targetExt) {

    var
      dest = config.dest + '/patterns';


    gulp.src([viewPath + '/**/*.' + sourceExt, '!' + viewPath + '/**/_*.' + sourceExt])
      .pipe(tap(function (file) {

        var targetPath, output;

        targetPath = path.relative(viewPath, file.path);
        targetPath = path.join(process.cwd(), dest, targetPath);

        output = templateRender.render(file.path);

        sgUtil.writeFile(targetPath, String(file.contents));

        if ('string' === typeof output.json) {
          sgUtil.writeFile(sgUtil.replaceFileExtension(targetPath, 'json'), output.json);
        }

        if ('string' === typeof output.html) {
          file.contents = new Buffer(output.html, "utf-8");
        }

      }))
      .pipe(rename({extname: '.' + targetExt}))
      .pipe(gulp.dest(dest))
      .on('end', function () {
        sgUtil.log('Styleguide viewer: [✓] patterns rendered');
      });
  },

  savePatternStructure = function () {
    sgUtil.writeJsonFile(path.join(config.dest, 'json/structure.json'), patternCollector.readPatternStructure());
    sgUtil.log('Styleguide viewer: [✓] pattern structure.json generated');
  },

  saveCollectedPatternFiles = function () {
    sgUtil.writeJsonFile(path.join(config.dest, 'json/files.json'), patternCollector.collectPatternFiles());
    sgUtil.log('Styleguide viewer: [✓] pattern files.json generated');
  },

  savePatternIncludeMap = function (dest) {
    sgUtil.writeJsonFile(path.join(dest, 'patternIncludeMap.json'), patternCollector.generatePatternIncludeMap());
    sgUtil.log('Templating: [✓] patternIncludeMap.json generated');
  },

  init = function (_config, mode) {

    config = _config.viewerApp;

    clean();
    renderViewerPartials();
    renderViewerIndexes();
    processStyles();
    copyAssets();
    copyLibs();
    browserifyScripts();

    if (mode === 'build') {
      renderPatterns(_config.patterns.views, _config.patterns.sourceExt, _config.patterns.targetExt);
      savePatternStructure();
      saveCollectedPatternFiles();
      savePatternIncludeMap(_config.patterns.views);
    }
  };

module.exports.init = init;