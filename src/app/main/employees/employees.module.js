(function () {
  'use strict';

  angular.module('app.employees', []).config(config);

  /** @ngInject */
  function config($stateProvider, msNavigationServiceProvider) {
    // State
    $stateProvider
      .state('app.employees', {
        abstract: true,
        url: '/employees'
      })
      .state('app.employees.employees', {
        url: '/employees',
        views: {
          'content@app': {
            templateUrl: 'app/main/employees/employees/employees.html',
            controller: 'EmployeesController as vm'
          }
        },
        bodyClass: 'employees'
      })
      .state('app.employees.employees.employee', {
        url: '/:id',
        bodyClass: 'employees'
      })
      .state('app.employees.costs', {
        url: '/employee_costs',
        views: {
          'content@app': {
            templateUrl: 'app/main/employees/employee_costs/employee-costs.html',
            controller: 'EmployeeCostsController as vm'
          }
        },
        bodyClass: 'employee-costs'
      });

    // Navigation
    msNavigationServiceProvider.saveItem('employees', {
      title: 'Empleados',
      icon: 'icon-people'
    });

    msNavigationServiceProvider.saveItem('employees.employees', {
      title: 'Empleados',
      icon: 'icon-people',
      state: 'app.employees.employees'
    });

    msNavigationServiceProvider.saveItem('employees.costs', {
      title: 'Costos',
      icon: 'icon-cash-usd',
      state: 'app.employees.costs'
    });
  }
})();
