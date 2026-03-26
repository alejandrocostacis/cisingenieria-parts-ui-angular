(function () {
  'use strict';

  angular.module('app.customers', []).config(config);

  /** @ngInject */
  function config($stateProvider, msNavigationServiceProvider) {
    // State
    $stateProvider
      .state('app.customers', {
        abstract: true,
        url: '/customers'
      })
      .state('app.customers.customers', {
        url: '',
        views: {
          'content@app': {
            templateUrl: 'app/main/customers/customers.html',
            controller: 'CustomersController as vm'
          }
        },
        bodyClass: 'customers'
      })
      .state('app.customers.customers.customer', {
        url: '/:id',
        bodyClass: 'customers'
      });

    // Navigation
    msNavigationServiceProvider.saveItem('customers', {
      title: 'Clientes',
      icon: 'icon-people',
      state: 'app.customers.customers'
    });

  }
})();
