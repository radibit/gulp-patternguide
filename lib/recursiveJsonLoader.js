'use strict';

var
  sgUtil = require('./util'),
  patternCollector = require('./patternCollector'),
  path = require('path'),
  fs = require('fs'),

  includeMap,

  resolvePatternIncludePath = function (jsonPath) {

    if ('string' === typeof includeMap[jsonPath]) {
      jsonPath = sgUtil.replaceFileExtension(includeMap[jsonPath],'json');
      jsonPath = path.join(process.cwd(), jsonPath);
    }
    return jsonPath;
  },

  loadJson = function (jsonPath) {

    var absPath = resolvePatternIncludePath(jsonPath);

    if (fs.existsSync(absPath)) {
      try {
        return parseJson(JSON.parse(sgUtil.readFileContents(absPath)));
      }
      catch (e) {
        sgUtil.log('Unable to parse json recursively! Error in file ' + absPath, 'error');
        sgUtil.log(e, 'error');
      }
    }
  },

  parseJson = function (obj) {

    var
      matches,
      includeData,
      regeEx = /\{%\s*include\s*['|"]+([^'|"]+)['|"]+(\.\S*)?\s*%\}/;

    if ("string" === typeof obj) {
      matches = regeEx.exec(obj);

      if (matches !== null) {
        includeData = loadJson(matches[1]);
        if (matches[2]) {
          eval('obj = includeData'+matches[2]);
        }
        else {
          obj = includeData;
        }
      }
    }
    else if (obj instanceof Array) {
      for (var i = 0, len = obj.length; i < len; i++) {
        obj[i] = parseJson(obj[i]);
      }
    }
    else if (obj instanceof Object) {
      for (var attr in obj) {
        if (obj.hasOwnProperty(attr)) obj[attr] = parseJson(obj[attr]);
      }
    }
    return obj;
  },

  recursiveJsonLoader = function (jsonPath) {

    includeMap = patternCollector.generatePatternIncludeMap();

    return loadJson(jsonPath);
  };

module.exports = recursiveJsonLoader;