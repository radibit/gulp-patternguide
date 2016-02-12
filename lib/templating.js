'use strict';

var
  sgUtil = require('./util'),
  path = require('path'),
  fs = require('fs'),
  swig = require("swig"),


  config,

  getConfig = function(key) {
    return config[key] || undefined;
  },

  getTemplateData = function (templatePath) {

    var
      dataAbsPath = sgUtil.replaceFileExtension(templatePath, config.dataExt);

    return JSON.parse(sgUtil.readFileContents(dataAbsPath));
  },

  renderTemplate = function (templatePath) {

    var templateData, template;

    if (sgUtil.readFileContents(templatePath).trim() === '') {
      sgUtil.log('Template file empty ['+templatePath+']', 'warn');
      return '';
    }

    templateData = getTemplateData(templatePath);
    template = swig.compileFile(templatePath);

    return template(templateData);
  },

  render = function (templatePath) {

    if (!fs.existsSync(templatePath)) {
      templatePath = path.join(config.views, templatePath);
    }
    if (fs.existsSync(templatePath)) {
      return renderTemplate(templatePath);
    }
    sgUtil.log('Template file missing ['+templatePath+']', 'warn');
    return '';
  },

  init = function (_config) {
    config = _config;
    swig.setDefaults({cache: false});

  };

module.exports.init = init;
module.exports.render = render;
module.exports.getConfig = getConfig;