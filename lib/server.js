'use strict';

var

  templating = require("./templating"),
  patternCollector = require('./patternCollector'),
  styles = require('./styles'),
  sgUtil = require('./util'),
  path = require('path'),
  express = require('express'),
  https = require('https'),
  http = require('http'),
  app = express(),
  router = express.Router(),


  serverOptions,

  enableNoCache = function (req, res, next) {
    res.header('Cache-Control', 'private, no-cache, no-store, must-revalidate');
    res.header('Expires', '-1');
    res.header('Pragma', 'no-cache');
    next()
  },

  allowCrossOriginAccess = function (req, res, next) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    next();
  },

  handleTemplateRequest = function (req, res) {
    var
      templateFile = req.params[0],
      requestExtention = req.params[1];

    if (serverOptions.templatingExts.indexOf(requestExtention) !== -1) {
      res.send(templating.render(templateFile));
    }
  },

  handlePatternFilesRequest = function (req, res) {
    res.send(patternCollector.collectPatternFiles());
  },

  handlePatternStructureRequest = function (req, res) {
    res.send(patternCollector.readPatternStructure());
  },

  handleOverrideCssRequest = function (req, res) {
    styles.processOverrideStyles()
      .then(function (data) {
        res.set('Content-Type', 'text/css');
        res.send(data);
      });
  },

  handleRootRedirect = function (req, res) {
    res.redirect(301, '/styleguide');
  },

  startUnsecureServer = function () {
    http.createServer(app).listen(serverOptions.port);
    sgUtil.log('Server started at http://localhost:' + serverOptions.port, 'info');
  },

  startSecureServer = function () {

    var
      port = serverOptions.https.port || 9090,

      keyFile = serverOptions.https.key
        ? path.join(process.cwd(), serverOptions.https.key)
        : path.join(__dirname, '../ssl/localhost.key'),

      certFile = serverOptions.https.cert
        ? path.join(process.cwd(), serverOptions.https.cert)
        : path.join(__dirname, '../ssl/localhost.cert'),

      credentials = {
        key: sgUtil.readFileContents(keyFile),
        cert: sgUtil.readFileContents(certFile)
      };

    https.createServer(credentials, app).listen(port);

    sgUtil.log('Secure server started at https://localhost:' + port, 'info');
  },

  init = function (options) {

    serverOptions = options;

    for (var key in serverOptions.static) {
      if (serverOptions.static.hasOwnProperty(key)) {
        router.use(key, express.static(serverOptions.static[key]));
      }
    }

    router.get('/styleguide/css/override.css', handleOverrideCssRequest);
    router.get('/styleguide/json/files.json', handlePatternFilesRequest);
    router.get('/styleguide/json/structure.json', handlePatternStructureRequest);
    router.get(/^\/styleguide\/patterns\/(.+\.(\w+))/, handleTemplateRequest);
    router.get('/', handleRootRedirect);

    app.use(enableNoCache);
    app.use(allowCrossOriginAccess);
    app.use('/', router);

    if (typeof serverOptions.https === 'undefined') {
      startUnsecureServer();
    } else {
      startSecureServer();
    }
  };

module.exports.init = init;