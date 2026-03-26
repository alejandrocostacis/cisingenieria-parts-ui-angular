(function () {
  'use strict';

  angular.module('app.hour_assignments', []).config(config);

  /** @ngInject */
  function config($stateProvider, msNavigationServiceProvider) {
    // State
    $stateProvider
      .state('app.hour_assignments', {
        abstract: true,
        url: '/hour_assignments'
      })
      .state('app.hour_assignments.hour_assignments', {
        url: '',
        views: {
          'content@app': {
            templateUrl: 'app/main/hour_assignments/hour-assignments.html',
            controller: 'HourAssignmentsController as vm'
          }
        },
        bodyClass: 'hour_assignments'
      });

    // Navigation
    msNavigationServiceProvider.saveItem('hour_assignments', {
      title: 'Imputacion de horas',
      icon: 'icon-calendar-clock',
      state: 'app.hour_assignments.hour_assignments'
    });

  }
})();
