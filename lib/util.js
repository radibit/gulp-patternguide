'use strict';

var
  fs = require('fs'),
  path = require('path'),
  mkpath = require('mkpath'),
  util = require('gulp-util'),


  getFileExtension = function (filePath) {
    var i = filePath.lastIndexOf('.');
    return (i < 0) ? '' : filePath.substr(i + 1);
  },

  removeFileExtension = function (filePath) {
    var i = filePath.lastIndexOf('.');
    return (i < 0) ? '' : filePath.substr(0, i);
  },

  replaceFileExtension = function (filePath, extension) {
    return removeFileExtension(filePath) + '.' + extension;
  },

  readFileContents = function (absPath) {
    return fs.existsSync(absPath) ? fs.readFileSync(absPath, 'utf8').toString() : '';
  },

  writeFile = function (absPath, content) {

    mkpath(path.dirname(absPath), function (err) {
      if (err) throw err;
      fs.writeFile(absPath, content);
    });
  },

  writeJsonFile = function (absPath, content) {
    writeFile(absPath, JSON.stringify(content));
  },

  log = function (message, type) {
    switch (type) {
      case 'info':
        util.log(util.colors.green(message));
        break;
      case 'warn':
        util.log(util.colors.yellow(message));
        break;
      case 'error':
        util.log(util.colors.red(message));
        break;
      default:
        util.log(util.colors.white(message));
    }
  }
  ;

module.exports.getFileExtension = getFileExtension;
module.exports.removeFileExtension = removeFileExtension;
module.exports.replaceFileExtension = replaceFileExtension;
module.exports.readFileContents = readFileContents;
module.exports.writeFile = writeFile;
module.exports.writeJsonFile = writeJsonFile;
module.exports.log = log;