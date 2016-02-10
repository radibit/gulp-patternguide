angular.module('styleguide.system', []);
angular.module('styleguide.services', []);
angular.module('styleguide.controllers', []);
angular.module('styleguide.directives', []);

require('./controllers/navBarController');
require('./controllers/patternsController');
require('./directives/iframeContentDirective');
require('./services/patternRequestFilesService');
require('./services/patternRequestStructureService');
