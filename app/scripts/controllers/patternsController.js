angular.module('styleguide.controllers')
  .controller('patternsController', ['$scope', '$rootScope', '$location', 'patternRequestFilesService',

    function ($scope, $rootScope, $location, patternRequestFilesService) {
      'use strict';
      var
        patternFiles = {};

      patternRequestFilesService.get().$promise.then(function (requestedPatternFiles) {
        patternFiles = requestedPatternFiles;
        updatePatternValues();
      });

      function parsePatternValuesByPath() {

        var
          patternPathValues = [],
          pathParameter = $location.$$path;

        Object.keys(patternFiles).map(function (key) {
          if (key.indexOf(pathParameter) !== -1 &&
            angular.isArray(patternFiles[key])) {
            patternFiles[key].map(function(file){
              patternPathValues.push(file);
            })
          }
          $scope.patternPathValues = patternPathValues;
        });
      }
      function updatePatternValues() {
        parsePatternValuesByPath();
        $scope.isIndex = !$location.$$path;
      }

      $rootScope.$on('$locationChangeSuccess', function () {
        updatePatternValues();
      });

      $scope.isIndex = true;
    }
  ]);
