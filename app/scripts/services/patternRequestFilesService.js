angular.module('styleguide.services')
  .factory('patternRequestFilesService', ['$resource', function ($resource) {
    'use strict';
    return $resource('./json/files.json');
  }]);


