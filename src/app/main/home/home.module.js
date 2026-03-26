(function () {
  'use strict';

  angular.module('app.home', []).config(config);

  /** @ngInject */
  function config($stateProvider, msNavigationServiceProvider) {
    // State
    $stateProvider
      .state('app.home', {
        abstract: true,
        url: '/home'
      })
      .state('app.home.home', {
        url: '',
        views: {
          'content@app': {
            templateUrl: 'app/main/home/home.html',
            controller: 'HomeController as vm'
          }
        },
        bodyClass: 'home'
      });

    // Navigation
    msNavigationServiceProvider.saveItem('home', {
      title: 'Inicio',
      icon: 'icon-home',
      state: 'app.home.home'
    });

  }
})();
