'use strict';

var
  swig = require("swig"),
  path = require("path"),
  sgUtil = require('../util'),

  config,
  getTemplateData,
  getLocals,

  renderTemplate = function (templatePath) {

    var templateData, template;

    if (sgUtil.readFileContents(templatePath).trim() === '') {
      sgUtil.log('Template file empty [' + templatePath + ']', 'warn');
      return '';
    }

    templateData = getTemplateData(templatePath);
    template = swig.compileFile(templatePath);

    return {
      html: template(templateData),
      json: JSON.stringify(templateData, null, 2)
    }
  },

  init = function (_config, _getTemplateData, _getLocals) {

    config = _config;
    getTemplateData = _getTemplateData;
    getLocals = _getLocals;

    swig.setDefaults({cache: false});
    swig.setDefaults({loader: swig.loaders.fs(process.cwd())});
    swig.setDefaults({locals: getLocals(path.join(config.views, config.mockFunctionsFile))});

    return {
      renderTemplate: renderTemplate
    }
  };


module.exports.init = init;