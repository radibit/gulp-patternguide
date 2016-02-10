'use strict';

var
  sgUtil = require('./util'),
  path = require('path'),
  fs = require('fs'),
  swig = require("swig"),


  patternsOptions,

  getTemplateData = function (templatePath) {

    var
      dataAbsPath = sgUtil.replaceFileExtension(templatePath, patternsOptions.dataExt);

    return JSON.parse(sgUtil.readFileContents(dataAbsPath));
  },

  renderTemplate = function (templatePath) {

    var
      templateData = getTemplateData(templatePath),
      template = swig.compileFile(templatePath);

    return template(templateData);
  },

  render = function (templatePath) {

    if (fs.existsSync(templatePath)) {
        return renderTemplate(templatePath);
    }
  },

  init = function (options) {
    patternsOptions = options;
    swig.setDefaults({cache: false});


  };

module.exports.init = init;
module.exports.render = render;