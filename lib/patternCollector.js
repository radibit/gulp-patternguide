'use strict';

var
  sgUtil = require('./util'),
  path = require('path'),
  fs = require('fs'),
  glob = require('glob'),


  config,
  collectedPatterns,

  generateTitle = function (name) {
    return name.replace(/\d+-|\.\w+$/g, '').replace(/([A-Z])/g, ' $1');
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

    if (currentItemData.name.toLowerCase().indexOf('mixin') !== -1) {
      return;
    }
    else if (currentItemData.isDir) {
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
    }
  },

  collectPatternsRecursively = function (filePath) {

    var
      parentDir,
      currentItemData = getItemData(filePath, fs.lstatSync(filePath).isDirectory());

    if (currentItemData.name.toLowerCase().indexOf('mixin') !== -1) {
      return;
    }
    else if (currentItemData.isDir) {
      fs.readdirSync(filePath).map(function (childDirectoryName) {
        return collectPatternsRecursively(filePath + '/' + childDirectoryName, false);
      });
    }
    else {

      parentDir = path.dirname(currentItemData.path);
      currentItemData.parent = parentDir;

      if (sgUtil.getFileExtension(currentItemData.name) !== config.targetExt) {
        return;
      }

      if (typeof collectedPatterns[parentDir] === 'undefined') {
        collectedPatterns[parentDir] = [];
      }

      collectedPatterns[parentDir].push(currentItemData);
    }
  },

  generatePatternIncludeMap = function () {

    var
      includeMap = {};

    glob.sync(config.views + '/**/*.' + config.sourceExt, {})
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