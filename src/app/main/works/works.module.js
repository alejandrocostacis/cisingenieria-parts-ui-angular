(function () {
  'use strict';

  angular.module('app.works', []).config(config);

  /** @ngInject */
  function config($stateProvider, msNavigationServiceProvider) {
    // State
    $stateProvider
      .state('app.works', {
        abstract: true,
        url: '/works'
      })
      .state('app.works.works', {
        url: '',
        views: {
          'content@app': {
            templateUrl: 'app/main/works/works.html',
            controller: 'WorksController as vm'
          }
        },
        bodyClass: 'works'
      })
      .state('app.works.works.work', {
        url: '/:id',
        bodyClass: 'works'
      });

    // Navigation
    msNavigationServiceProvider.saveItem('works', {
      title: 'Obras',
      icon: 'icon-folder-multiple',
      state: 'app.works.works'
    });
  }
})();
