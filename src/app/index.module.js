(function() {
  'use strict';

  /**
   * Main module of the uiPartsApp
   */
  angular.module('uiPartsApp', [
    'environments.config',
    'messages',
    'app.toast',
    'LocalStorageModule',
    'ng-token-auth',
    'angular-clockpicker',
    'app.core',
    'app.api',
    'app.navigation',
    'app.toolbar',
    'validation.match',
    'app.login',
    'app.home',
    'app.reports',
    'app.hour_assignments',
    'app.employees',
    'app.customers',
    'app.works',
    'app.settings',
    'app.logout'
  ])
    .filter('slice', function() {
      return function(arr, start, end) {
        return (arr || []).slice(start, end);
      };
    })
    .filter('capitalize', function() {
      return function(input, all) {
        var reg = (all) ? /([^\W_]+[^\s-]*) */g : /([^\W_]+[^\s-]*)/;
        return (!!input) ? input.replace(reg, function(txt) {
          return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
        }) : '';
      }
    });
})();
