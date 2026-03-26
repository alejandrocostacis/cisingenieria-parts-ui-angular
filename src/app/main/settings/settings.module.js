(function () {
  'use strict';

  angular
    .module('app.settings', [])
    .config(config);

  /** @ngInject */
  function config($stateProvider, msNavigationServiceProvider) {
    // State
    $stateProvider
      .state('app.settings', {
        abstract: true,
        url: '/settings'
      })
      .state('app.settings.general', {
        url: '/general',
        views: {
          'content@app': {
            templateUrl: 'app/main/settings/general/general.html',
            controller: 'GeneralController as vm'
          }
        },
        bodyClass: 'general'
      })
      .state('app.settings.general.item', {
        url: '/:id',
        bodyClass: 'general'
      });

    ////// Navigation
    msNavigationServiceProvider.saveItem('settings', {
      title: 'Configuracion',
      icon: 'icon-cog'
    });

    msNavigationServiceProvider.saveItem('settings.general', {
      title: 'General',
      state: 'app.settings.general',
      icon: 'icon-cog'
    });
  }
})();
