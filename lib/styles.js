'use strict';

var
  gulp = require('gulp'),
  stylus = require('gulp-stylus'),
  del = require('del'),
  nib = require('nib'),
  autoPreFixer = require('gulp-autoprefixer'),
  concat = require('gulp-concat'),
  tap = require('gulp-tap'),
  Promise = require('promise'),


  patternsOptions,
  viewerOptions,

  processOverrideStyles = function () {

    return new Promise(function (resolve) {

      gulp.src([patternsOptions.views + '/**/*.overrides.styl'])
        .pipe(stylus({use: [nib()]}))
        .pipe(autoPreFixer({browsers: ['> 5%', 'last 1 versions'], cascade: false}))
        .pipe(concat('overrides.css'))
        .pipe(tap(function (file) {
          resolve(file.contents.toString());
        }))
        .pipe(gulp.dest(viewerOptions.dest + '/css'));
    });
  },

  init = function (patterns, viewer) {
    patternsOptions = patterns;
    viewerOptions = viewer;

    processOverrideStyles();
  };

module.exports.init = init;
module.exports.processOverrideStyles = processOverrideStyles;