(function () {
  'use strict';

  angular.module('app.login', []).config(config);

  /** @ngInject */
  function config($stateProvider) {
    $stateProvider.state('app.login', {
      url: '/login',
      views: {
        'main@': {
          templateUrl: 'app/core/layouts/content-only.html',
          controller: 'MainController as vm'
        },
        'content@app.login': {
          templateUrl: 'app/main/login/login.html',
          controller: 'LoginController as vm'
        }
      },
      bodyClass: 'login'
    });
  }
})();
