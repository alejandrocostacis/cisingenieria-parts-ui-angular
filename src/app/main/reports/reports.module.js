(function () {
  'use strict';

  angular.module('app.reports', []).config(config);

  /** @ngInject */
  function config($stateProvider, msNavigationServiceProvider) {
    // State
    $stateProvider
      .state('app.reports', {
        abstract: true,
        url: '/reports'
      })
      .state('app.reports.acum', {
        url: '/acum',
        views: {
          'content@app': {
            templateUrl: 'app/main/reports/acum/acum.html',
            controller: 'AcumController as vm'
          }
        },
        bodyClass: 'acum'
      })
      .state('app.reports.employee_hours', {
        url: '/employee_hours',
        views: {
          'content@app': {
            templateUrl: 'app/main/reports/employee_hours/employee_hours.html',
            controller: 'EmployeeHoursController as vm'
          }
        },
        bodyClass: 'employee_hours'
      })
      .state('app.reports.period_per_employee', {
        url: '/period_per_employee',
        views: {
          'content@app': {
            templateUrl: 'app/main/reports/period_per_employee/period_per_employee.html',
            controller: 'PeriodPerEmployeeController as vm'
          }
        },
        bodyClass: 'period_per_employee'
      })
      .state('app.reports.daily_reports_per_work', {
        url: '/daily_reports_per_work',
        views: {
          'content@app': {
            templateUrl: 'app/main/reports/daily_reports_per_work/daily_reports_per_work.html',
            controller: 'DailyReportsPerWorkController as vm'
          }
        },
        bodyClass: 'daily-reports-per-work'
      });

    // Navigation
    msNavigationServiceProvider.saveItem('reports', {
      title: 'Reportes',
      icon: 'icon-clipboard-text'
    });

    msNavigationServiceProvider.saveItem('reports.acum', {
      title: 'Acumulado',
      icon: 'icon-file-document',
      state: 'app.reports.acum'
    });

    msNavigationServiceProvider.saveItem('reports.employee_hours', {
      title: 'Horas',
      icon: 'icon-file-document',
      state: 'app.reports.employee_hours'
    });

    msNavigationServiceProvider.saveItem('reports.period_per_employee', {
      title: 'Periodo x Recurso',
      icon: 'icon-file-document',
      state: 'app.reports.period_per_employee'
    });

    msNavigationServiceProvider.saveItem('reports.daily_reports_per_work', {
      title: 'Obras x Recurso',
      icon: 'icon-file-document',
      state: 'app.reports.daily_reports_per_work'
    });
  }
})();
