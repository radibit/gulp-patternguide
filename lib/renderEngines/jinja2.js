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
        args: ['app.py'],
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
      console.warn('Given python path does not exist, using "python" default');
      python = 'python';
    }

    if (args === undefined) {
      args = defaults.args;
    }

    engine.py = spawn(python, args);

    engine.render = function (template, json) {

      var res, body = '', theJson, curlCmd;
      theJson = {"template": template};
      if (json !== undefined) {
        theJson.json = json;
      }


      // to aid debugging.
      curlCmd = 'curl -H "Content-Type: application/json" -X POST -d ';
      curlCmd += "'" + JSON.stringify(theJson) + "' " + engine.baseUrl;

      //if (1) {
      //  console.log(theJson);
      //  console.log(curlCmd);
      //}

      try {

        res = syncRequest('POST', engine.baseUrl, {
          json: theJson
        });
        body = res.getBody('utf8');

        if (engine.finish) {
          engine.done()
        }
        return body;
      }
      catch (e) {
        // return "error";
        if (engine.finish) {
          engine.done()
        }

        if (e.body !== undefined) {
          return e.body.toString();
        } else {
          return '';
        }
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
      return '';
    }
    return engine.render(templatePath, getTemplateData(templatePath));
  },

  init = function (_config, _getTemplateData, _getLocals) {

    config = _config;
    getTemplateData = _getTemplateData;
    getLocals = _getLocals;

    initJinja2({finish: false, python: "./anenv/bin/python", args: [config.engine.pathToPyScript]});

    return {
      renderTemplate: renderTemplate,
      done: done
    }
  },

  done = function () {
    engine.done();
  };

module.exports.init = init;
