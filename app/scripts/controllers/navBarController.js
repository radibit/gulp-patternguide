angular.module('styleguide.controllers')
  .controller('navBarController', ['$scope', '$location', 'patternRequestStructureService',

    function ($scope, $location, patternRequestStructureService) {
      'use strict';

      var
       activePath = $location.$$path;

      function updatePatterns(item) {

        activePath = (($location.$$path).indexOf('/'+item.path) !== -1) ? $location.$$path : item.path;

        if (item.level === 0) {
          $scope.displayNavigation(true);
        }

        if (item.children === false) {
          $location.path(item.path);
          activePath = item.path;
          hideNavigation();
        }
      }

      function isActive(item) {
        return (('/'+activePath).indexOf('/'+item.path) !== -1);
      }

      function isSelected(item) {
          return $location.$$path === '/'+item.path && item.children === false;
      }

      function hideNavigation(){
        $scope.displayNavigation(false);
      }

      function displayNavigation(display){
        if (angular.isUndefined(display))  {
          display = !$scope.isNavigationDisplayed;
        }
        $scope.isNavigationDisplayed = display;
      }

      $scope.patternStructure = patternRequestStructureService.get();
      $scope.isNavigationDisplayed = false;
      $scope.displayNavigation = displayNavigation;
      $scope.isActive = isActive;
      $scope.isSelected = isSelected;
      $scope.updatePatterns = updatePatterns;
    }
  ]);











