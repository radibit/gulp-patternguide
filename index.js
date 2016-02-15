'use strict';

var
  server = require('./lib/server'),
  templating = require('./lib/templating'),
  patternCollector = require('./lib/patternCollector'),
  styles = require('./lib/styles'),
  viewerApp = require('./lib/viewerApp'),
  path = require('path'),
  extend = require('node.extend'),
  browserSync = require('browser-sync');

var
  config,
  defaultConfig = {
    rootPath: process.cwd(),

    patterns: {
      sourcePath: 'templates',
      sourceExt: 'twig',
      targetExt: 'html',
      dataExt: 'json',
      functionsFile: ''
    },

    viewerApp: {
      dest: 'dist/styleguide',
      cssFiles: []
    },

    server: {
      name: process.env.npm_package_name,
      port: 9000,
      baseDir: [],
      https: {
        key: __dirname + "/ssl/localhost.key",
        cert: __dirname + "/ssl/localhost.cert"
      }
    }
  },

  extendConfig = function (_config) {

    config = extend(true, defaultConfig, _config);

    config.patterns.views = path.join(config.rootPath, config.patterns.sourcePath);

    config.server.baseDir.push(path.resolve(config.viewerApp.dest, '..'));
  },

  init = function (_config, bs, cb) {

    extendConfig(_config);

    templating.init(config.patterns);
    patternCollector.init(config.patterns);
    styles.init(config.patterns, config.viewerApp);
    viewerApp.init(config);

    if (!!bs) {
      server.init(config.server, bs, cb || function(){});
    }
    else if (typeof cb === 'function') {
      cb();
    }
  };

module.exports = init;