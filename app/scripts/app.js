/*global window */

(function initApp() {
  'use strict';

  require('./_system.js');

  angular.element(document).ready(function () {
    if (window.location.hash === '#_=_') {
      window.location.hash = '#!';
    }
    angular.bootstrap(document, ['styleguide']);
  });

  var modules = [
    'ngResource',
    'styleguide.system',
    'styleguide.services',
    'styleguide.controllers',
    'styleguide.directives'
  ];

  try {
    angular.module('frontend');
    modules.push('frontend');
  }
  catch(e) {
    console.info('no frontend module')
    console.info(e)
  }

  angular.module('styleguide', modules);

})();
