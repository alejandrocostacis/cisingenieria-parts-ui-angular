(function () {
  'use strict';
  angular.module('app.api').service('ReportsService', ReportsService);

  /** @ngInject */
  function ReportsService(Restangular) {
    this.acum = acum;
    this.employee_hours = employee_hours;
    this.exportEmployeeHoursToXLS = exportEmployeeHoursToXLS;
    this.employee_hours_self = employee_hours_self;
    this.hours_by_speciality = hours_by_speciality;
    this.dailyReportsPerWork = dailyReportsPerWork;
    this.exportAcumToXLS = exportAcumToXLS;

    function acum(params) {
      return Restangular.one('reports').one('acum').get(params);
    }

    function employee_hours(params) {
      return Restangular.one('reports').one('employee_hours').get(params);
    }

    function exportEmployeeHoursToXLS(params) {
      return Restangular.one('reports').one('employee_hours').one('export_to_xls').get(params);
    }

    function employee_hours_self(params) {
      return Restangular.one('reports').one('employee_hours_self').get(params);
    }

    function hours_by_speciality(params) {
      return Restangular.one('reports').one('hours_by_speciality').get(params);
    }

    function dailyReportsPerWork(params) {
      return Restangular.one('reports').one('daily_reports_per_work').get(params);
    }

    function exportAcumToXLS(params) {
      return Restangular.one('reports').one('acum').one('export_to_xls').get(params);
    }
  }
})();
