'use strict';

var
  recursiveJsonLoader = require('./recursiveJsonLoader'),
  patternCollector = require('./patternCollector'),
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
      templatePath = path.relative(config.views, templateAbsPath),
      dataPath = sgUtil.replaceFileExtension(templatePath, config.dataExt);

    return recursiveJsonLoader(dataPath, config.views);
  },

  getLocals = function (mockFunctionsFile) {

    var locale = require(mockFunctionsFile) || {};

    locale.patternIncludePath = function patternIncludePath(templateName) {
      var
        includeMap = patternCollector.generatePatternIncludeMap();

      if ('undefined' !== typeof includeMap[templateName]) {
        return includeMap[templateName];
      }
      else {
        throw 'No template found for key: "' + templateName + '"';
      }
    };

    return locale;
  },

  renderTemplate = function (templatePath) {
    return renderEngine.renderTemplate(templatePath);
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

  getRenderEngine = function()  {
    return 'string' === typeof config.engine ? config.engine : config.engine.name;
  },

  init = function (_config) {
    config = _config;
    renderEngine = require('./renderEngines/' + getRenderEngine()).init(config, getTemplateData, getLocals);
  };

'use strict';

module.exports.init = init;
module.exports.render = render;
module.exports.getConfig = getConfig;