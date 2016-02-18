'use strict';


var
  path = require("path"),
  sgUtil = require('../util'),
  spawn = require('child_process').spawn,
  syncRequest = require('sync-request'),

  engine,
  config,
  getTemplateData,
  getLocals,


  Jinja2 = function (options) {

    var
      _this = {},

      defaults = {
        python: 'python',
        args: ['app.py'],
        finish: true, // should we finish the python, or leave it open for more rendering.
        baseUrl: 'http://localhost:5067/render_template'
      };

    if (options === undefined) {
      options = {};
    }

    _this.finish = options.finish === undefined ? defaults.finish : options.finish;
    _this.baseUrl = options.baseUrl;

    if (_this.baseUrl === undefined) {
      _this.baseUrl = defaults.baseUrl;
    }

    var python = options.python;
    var args = options.args;

    if (python === undefined) {
      python = defaults.python;
    }

    if (args === undefined) {
      args = defaults.args;
    }

    _this.py = spawn(python, args);


    _this.py.stderr.on('data', function(data) {
      console.log('stdout: ' + data);
    });



    _this.render = function (template, json) {

      var res, body = '';

        try {

        res = syncRequest('POST', _this.baseUrl, {
          json: {"template": template, "json": json}
        });
        body = res.getBody('utf8');

        if (_this.finish) {
          _this.done()
        }
        return body;
      }
      catch (e) {
        return e.body.toString();
      }
    };

    _this.done = function () {
      _this.py.kill();
    };

    return _this;
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

    engine = Jinja2({finish: false, python: "./anenv/bin/python", args: [config.engine.pathToPyScript]});

    //swig.setDefaults({locals: getLocals(path.join(config.views, config.mockFunctionsFile))});

    return {
      renderTemplate: renderTemplate
    }
  };


module.exports.init = init;