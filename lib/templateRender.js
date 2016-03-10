'use strict';

var
  recursiveJsonLoader = require('./recursiveJsonLoader'),
  sgUtil = require('./util'),
  path = require('path'),
  fs = require('fs'),


  config,
  renderEngine,

  getConfig = function (key) {
    return config[key] || undefined;
  },

  getTemplateData = function (templateAbsPath) {

    var
      dataPath = sgUtil.replaceFileExtension(templateAbsPath, config.dataExt),
      templateData = recursiveJsonLoader(dataPath) || {};

    templateData['styleguide'] = true;

    return templateData;
  },

  getLocals = function (mockFunctionsFile) {
    return require(mockFunctionsFile) || {};
  },

  renderTemplate = function (templatePath) {
    return renderEngine.renderTemplate(templatePath);
  },

  kill = function () {
    if (typeof renderEngine.done === 'function') {
      renderEngine.done();
    }
  },

  render = function (templatePath) {

    if (!fs.existsSync(templatePath)) {
      templatePath = path.join(config.views, templatePath);
    }
    if (fs.existsSync(templatePath)) {
      return renderTemplate(templatePath);
    }
    sgUtil.log('Template file missing [' + templatePath + ']', 'warn');
    return '';
  },

  getRenderEngine = function () {
    return 'string' === typeof config.engine ? config.engine : config.engine.name;
  },

  init = function (_config, debug) {
    config = _config;
    renderEngine = require('./renderEngines/' + getRenderEngine()).init(config, getTemplateData, getLocals, debug);
    return renderEngine;
  };


module.exports.init = init;
module.exports.render = render;
module.exports.getConfig = getConfig;
module.exports.kill = kill;