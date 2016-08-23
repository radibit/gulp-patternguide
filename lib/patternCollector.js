'use strict';

var
  sgUtil = require('./util'),
  path = require('path'),
  fs = require('fs'),
  glob = require('glob'),
  minimatch = require("minimatch"),

  config,
  collectedPatterns,

  generateTitle = function (name) {
    return name.replace(/(^\d+-)|\.\w+$/g, '').replace(/([A-Z])/g, ' $1');
  },

  generateIdentifier = function (title) {
    return title.replace(/ /g, '-').toLowerCase();
  },

  getItemData = function (filePath, isDir) {

    var currentPath, currentLevel, name, title, identifier, sourcePath = null;

    currentPath = filePath.replace(config.views, '');

    if (!isDir && sgUtil.getFileExtension(currentPath) === config.sourceExt) {
      sourcePath = currentPath;
      currentPath = sgUtil.replaceFileExtension(currentPath, config.targetExt);
    }

    currentLevel = currentPath.split(path.sep).length - 2;
    name = path.basename(currentPath);
    title = generateTitle(name);
    identifier = generateIdentifier(title);

    return {
      level: currentLevel,
      path: currentPath,
      source: sourcePath,
      identifier: identifier,
      name: name,
      title: sgUtil.capitalizeString(title),
      isDir: isDir
    };
  },

  readPatternStructureRecursively = function (filePath) {

    var
      currentItemData = getItemData(filePath, fs.lstatSync(filePath).isDirectory()),
      children = [],
      all = {};

    if (!currentItemData.isDir) {
      return;
    }

    if (currentItemData.name.toLowerCase().indexOf('mixin') !== -1 ) {
      return;
    }

    if (glob.sync(filePath+'/*{/,.'+config.sourceExt+'}',config.sourceOptions).length === 0) {
      return;
    }

    fs.readdirSync(filePath).map(function (childDirectoryName) {
      var
        childObject = readPatternStructureRecursively(filePath + '/' + childDirectoryName);
      if (childObject) {
        children.push(childObject);
      }
    });

    if ((children.length === 0)) {
      currentItemData.children = false;
    }
    else {

      all = {
        level: currentItemData.level,
        path: currentItemData.path,
        name: 'all-' + currentItemData.name,
        identifier: '-all' + currentItemData.identifier,
        title: 'all',
        isDir: currentItemData.isDir,
        children: false
      };

      children.push(all);
      currentItemData.children = (children.length === 0) ? false : children;
    }

    return currentItemData;
  },

  matchIgnored = function(source, ignorePattern) {
    if (minimatch(source, ignorePattern)) console.log(source, ' --- ', ignorePattern)
    return minimatch(source, ignorePattern);
  },

  validatePattern = function(currentItemData) {


    if (currentItemData.name.toLowerCase().indexOf('mixin') !== -1) {
      return;
    }

    if (sgUtil.getFileExtension(currentItemData.name) !== config.targetExt) {
      return;
    }

    if (typeof config.sourceOptions.ignore !== 'undefined') {

      if (typeof config.sourceOptions.ignore === 'string' &&
          matchIgnored(currentItemData.source, config.sourceOptions.ignore)) {
        return;
      }

      for (var i=0; i < config.sourceOptions.ignore.length; i++) {
        if (typeof config.sourceOptions.ignore[i] === 'string' &&
            matchIgnored(currentItemData.source, config.sourceOptions.ignore[i])) {
          return;
        }
      }
    }
    return true;
  },

  collectPatternsRecursively = function (filePath) {

    var
      parentDir,
      currentItemData = getItemData(filePath, fs.lstatSync(filePath).isDirectory());

    if (currentItemData.isDir) {
      fs.readdirSync(filePath).map(function (childDirectoryName) {
        return collectPatternsRecursively(filePath + '/' + childDirectoryName);
      });
    }
    else if(validatePattern(currentItemData)){

      parentDir = path.dirname(currentItemData.path);
      currentItemData.parent = parentDir;

      if (typeof collectedPatterns[parentDir] === 'undefined') {
        collectedPatterns[parentDir] = [];
      }

      collectedPatterns[parentDir].push(currentItemData);
    }
  },

  generatePatternIncludeMap = function () {

    var
      includeMap = {};

    glob.sync(config.views + '/**/*.' + config.sourceExt, config.sourceOptions)
      .map(function (file) {
        var
          relativePath = path.relative(process.cwd(), file),
          key = relativePath.replace(/^[^\d{2,}]*\d{2,}-([^\/]+)\/.*\/([^\.]+)\..*$/, '$1-$2');

        if ('undefined' === typeof includeMap[key]) {
          includeMap[key] = relativePath;
        }
        else {
          throw 'Name collision for key: ' + key + ' for file: ' + relativePath +
          'Key has been defined already for pattern [' + includeMap[key] + ']';
        }
      });

    return includeMap;
  },

  readPatternStructure = function () {
    return readPatternStructureRecursively(config.views);
  },

  collectPatternFiles = function () {
    collectedPatterns = {};
    collectPatternsRecursively(config.views);
    return collectedPatterns;
  },

  init = function (_config) {
    config = _config;
  };

module.exports.init = init;
module.exports.collectPatternFiles = collectPatternFiles;
module.exports.readPatternStructure = readPatternStructure;
module.exports.generatePatternIncludeMap = generatePatternIncludeMap;