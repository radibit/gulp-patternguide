'use strict';

var
  server = require('./lib/server'),
  templateRender = require('./lib/templateRender'),
  patternCollector = require('./lib/patternCollector'),
  styles = require('./lib/styles'),
  viewerApp = require('./lib/viewerApp'),
  path = require('path'),
  extend = require('node.extend');

var
  config,
  defaultConfig = {
    rootPath: process.cwd(),

    patterns: {
      sourcePath: 'templates',
      sourceExt: 'twig',
      targetExt: 'html',
      dataExt: 'json',
      mockFunctionsFile: '',
      engine: {
        name: 'swig'
      }
    },

    viewerApp: {
      dest: 'dist/styleguide',
      cssFiles: [],
      jsFiles: []
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
    var renderEngine = templateRender.init(config.patterns);
    patternCollector.init(config.patterns);
    styles.init(config.patterns, config.viewerApp);
    viewerApp.init(config);
    patternCollector.generatePatternIncludeMap();

    if (!!bs) {
      server.init(config.server, bs, cb || function(){});
    }
    else {
      if ('function' === typeof renderEngine.done) {
        renderEngine.done();
      }
      if ('function' === typeof cb) {
        cb();
      }
    }
  };

module.exports = init;