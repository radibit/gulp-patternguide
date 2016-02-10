angular.module('styleguide.directives')

  .directive('iframeContent', ['$rootScope', '$location',

    function ($rootScope, $location) {
      'use strict';

      var
        iframeElement,
        iframeSource;

      function setIframeSource() {
        iframeElement.attr('src', iframeSource + '#' + $location.$$path);
      }

      function link(scope, element) {

        iframeElement = element;
        iframeSource = scope.iframeSource;

        $rootScope.$on('$locationChangeSuccess', function () {
          setIframeSource();
        });

        setIframeSource();
      }

      return {
        restrict: 'E',
        replace: true,
        scope: {
          iframeSource: '@'
        },
        templateUrl: './templates/directives/iframeContentDirective.html',
        link: link
      };
    }
  ]);
