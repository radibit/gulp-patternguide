'use strict';

var

  templateRender = require("./templateRender"),
  patternCollector = require('./patternCollector'),
  styles = require('./styles'),
  sgUtil = require('./util'),
  path = require('path'),

  config,

  getMiddlewares = function () {

    var
      middlewares = config.middlewares || [];
    middlewares.push(enableNoCache);
    middlewares.push(allowCrossOriginAccess);
    middlewares.push(applyRoutes);

    return middlewares;
  },

  enableNoCache = function (req, res, next) {
    res.setHeader('Cache-Control', 'private, no-cache, no-store, must-revalidate');
    res.setHeader('Expires', '-1');
    res.setHeader('Pragma', 'no-cache');
    next()
  },

  allowCrossOriginAccess = function (req, res, next) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    next();
  },

  handleTemplateRequest = function (req, res, next) {

    var
      requestExtention = req.params[2],
      templateFile = sgUtil.replaceFileExtension(req.params[1], templateRender.getConfig('sourceExt')),
      output = templateRender.render(templateFile);

    if (requestExtention === templateRender.getConfig('targetExt')) {
      res.end(output.html);
    } else {
      next();
    }
  },

  handlePatternFilesRequest = function (req, res) {
    res.end(JSON.stringify(patternCollector.collectPatternFiles()));
  },

  handlePatternStructureRequest = function (req, res) {
    res.end(JSON.stringify(patternCollector.readPatternStructure()));
  },

  handleOverrideCssRequest = function (req, res) {
    styles.processOverrideStyles()
      .then(function (data) {
        res.setHeader('Content-Type', 'text/css');
        res.end(data);
      });
  },

  handleRootRedirect = function (req, res) {

    res.writeHead(301, {
        Location: (req.socket.encrypted ? 'https://' : 'http://') +
        req.headers.host + '/styleguide'
      }
    );
    res.end();
  },

  rewriteUrls = function(url) {
    var rule, regex;
    if (typeof config.urlRewriteRules !== 'undefined') {
      for (rule in config.urlRewriteRules) {
        regex = new RegExp(rule, 'i');
        url = url.replace(regex, config.urlRewriteRules[rule]);
      }
    }
    return url;
  },

  applyRoutes = function (req, res, next) {

    switch (req.url) {

      case '/':
        handleRootRedirect(req, res);
        break;

      case '/styleguide/css/overrides.css':
        handleOverrideCssRequest(req, res);
        break;

      case '/styleguide/json/files.json':
        handlePatternFilesRequest(req, res);
        break;

      case '/styleguide/json/structure.json':
        handlePatternStructureRequest(req, res);
        break;

      default:
        req.params = req.url.match(/^\/styleguide\/patterns\/(.+\.(\w+))/);
        if (req.params !== null) {
          handleTemplateRequest(req, res, next);
        }
        else {
          req.url = rewriteUrls(req.url);
          next();
        }
    }
  },

  init = function (_config, bs, cb) {

    config = _config;

    bs.init({
      server: {
        baseDir: config.baseDir
      },
      port: config.port || 3000,
      reloadOnRestart: config.reloadOnRestart || true,
      notify: config.notify || false,
      https: config.https || false,
      open: typeof config.open !== 'undefined' ? config.open : true,
      startPath: config.startPath || null,
      reloadDelay: config.reloadDelay || 0,
      reloadDebounce: config.reloadDebounce || 0,
      middleware: getMiddlewares(),
      logLevel: config.logLevel || 'info',
      logPrefix: config.logPrefix || 'BS',
      logConnections: config.logConnections || false,
      logFileChanges: config.logFileChanges || true,
      logSnippet: config.logSnippet || true

    }, cb || function () {
      });
  };

module.exports.init = init;