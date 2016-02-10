'use strict';

var
  server = require('./lib/server'),
  templating = require('./lib/templating'),
  patternCollector = require('./lib/patternCollector'),
  styles = require('./lib/styles'),
  viewerApp = require('./lib/viewerApp'),
  path = require('path'),
  extend = require('node.extend');


var
  options,
  defaultOptions = {
    rootPath: process.cwd(),

    patterns: {
      sourcePath: 'templates',
      sourceExt: 'twig',
      targetExt: 'html',
      dataExt: 'json'
    },

    viewerApp: {
      static: 'dist/styleguide',
      overrideCssFile: 'css/override.css'
    },
    livereload: {
      port: 35729,
      enable: true
    },
    server: {
      port: 9000,
      static: {},
      https: {
        port: 9090,
        key: 'ssl/localhost.key',
        cert: 'ssl/localhost.pem'
      }
    }
  },

  mergeOptions = function(specificOptions) {

    options = extend(true, defaultOptions, specificOptions);

    options.patterns.views = path.join(options.rootPath, options.patterns.sourcePath);

    options.server.static['/styleguide'] = options.viewerApp.static;
    options.server.templatingExts = [
      options.patterns.sourceExt,
      options.patterns.targetExt
    ];


  },

  styleguide = function(specificOptions) {

    mergeOptions(specificOptions);

    templating.init(options.patterns);
    patternCollector.init(options.patterns);
    styles.init(options.patterns, options.viewerApp);
    viewerApp.init(options);
    server.init(options.server);
};


module.exports = styleguide;