(function () {
  'use strict';

  angular.module('app.logout', []).config(config);

  /** @ngInject */
  function config($stateProvider, msNavigationServiceProvider) {
    $stateProvider
      .state('app.logout', {
        abstract: true,
        url: '/logout'
      })
      .state('app.logout.logout', {
        url: '',
        views: {
          'content@app': {
            templateUrl: 'app/main/logout/logout.html',
            controller: 'LogoutController as vm'
          }
        },
        bodyClass: 'logout'
      });

    // Navigation
    msNavigationServiceProvider.saveItem('logout', {
      title: 'Cerrar sesión',
      icon: 'icon-logout',
      state: 'app.logout.logout'
    });
  }
})();