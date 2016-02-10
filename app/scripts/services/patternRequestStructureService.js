angular.module('styleguide.services')
  .factory('patternRequestStructureService', ['$resource', function ($resource) {
    'use strict';
    return $resource('./json/structure.json');
  }]);


