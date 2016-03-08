'use strict';


var
  path = require("path"),
  sgUtil = require('../util'),
  spawn = require('child_process').spawn,
  syncRequest = require('sync-request'),
  fs = require('fs'),

  engine,
  config,
  getTemplateData,
  getLocals,

  initJinja2 = function (options) {

    var
      defaults = {
        python: 'python',
        finish: true, // should we finish the python, or leave it open for more rendering.
        baseUrl: 'http://localhost:5067/render_template'
      };

    engine = {};

    if (options === undefined) {
      options = {};
    }

    engine.finish = options.finish === undefined ? defaults.finish : options.finish;
    engine.baseUrl = options.baseUrl;

    if (engine.baseUrl === undefined) {
      engine.baseUrl = defaults.baseUrl;
    }

    var python = options.python;
    var args = options.args;

    if (python === undefined) {
      python = defaults.python;
    }

    // check if python bin exists, if not fallback to 'python'
    if (python !== 'python' && !fs.existsSync(python)) {
      sgUtil.log('Given python path does not exist, using "python" default', 'warn');
      python = 'python';
    }

    if (args === undefined) {
      args = defaults.args;
    }

    engine.py = spawn(python, args, {stdio: 'pipe', detached: false});

    if (config.engine.debug === true || config.engine.debug === 'stdout' || config.engine.debug === 'stderr') {
      engine.py.stderr.on('data', function (data) {

        if (String(data).match(/HTTP\/1\.1\"/) !== null) {
          return;
        }

        sgUtil.log(config.engine.pathToPyScript, 'error');
        sgUtil.log(data, 'error');
      });
    }

    if (config.engine.debug === true || config.engine.debug === 'stdout') {
      engine.py.on('data', function (data) {

        sgUtil.log(config.engine.pathToPyScript, 'info');
        sgUtil.log(data, 'info');
      });
    }

    engine.render = function (template, json) {

      var res, html = '', theJson, curlCmd;
      theJson = {"template": template};
      if (json !== undefined) {
        theJson.json = json;
      }

      if (config.engine.debug === true || config.engine.debug === 'http') {
        curlCmd = 'curl -H "Content-Type: application/json" -X POST -d ';
        curlCmd += "'" + JSON.stringify(theJson) + "' " + engine.baseUrl;
        sgUtil.log('curl Jinja2:', 'info');
        sgUtil.log(curlCmd, 'info');
      }

      if (config.engine.debug === true || config.engine.debug === 'json') {
        sgUtil.log('curl JSON:', 'info');
        sgUtil.log(JSON.stringify(theJson, null, 2), 'info');
      }

      res = syncRequest('POST', engine.baseUrl, {
        json: theJson
      });

      if (engine.finish) {
        engine.done()
      }


      return {
        html: String(res.body),
        json: JSON.stringify(json, null, 2)
      }
    };

    engine.done = function () {
      engine.py.kill();
    };

    return engine;
  },

  renderTemplate = function (templatePath) {

    if (sgUtil.readFileContents(templatePath).trim() === '') {
      sgUtil.log('Template file empty [' + templatePath + ']', 'warn');
    }
    return engine.render(templatePath, getTemplateData(templatePath));
  },

  init = function (_config, _getTemplateData, _getLocals, debug) {

    var args;

    config = _config;
    getTemplateData = _getTemplateData;
    getLocals = _getLocals;
    args = [config.engine.pathToPyScript];

    if (debug) args.push('--debug');

    initJinja2({finish: false, python: "./anenv/bin/python", args: args});


    return {
      renderTemplate: renderTemplate,
      done: done
    }
  },

  done = function () {
    engine.done();
  };

module.exports.init = init;
