(function () {
  'use strict';
  angular.module('app.api').service('EmployeesService', EmployeesService);

  /** @ngInject */
  function EmployeesService(Restangular) {
    this.show = show;
    this.index = index;
    this.worksResponsibles = worksResponsibles;
    this.works = works;
    this.indexWithCosts = indexWithCosts;

    var RESOURCE = 'employees';

    function show(id, params) {
      return Restangular.one(RESOURCE, id).get(params);
    }

    function index(params) {
      return Restangular.one(RESOURCE).get(params);
    }

    function worksResponsibles(params) {
      return Restangular.one('employees_works_responsibles').get(params);
    }

    function works(id, params) {
      return Restangular.one(RESOURCE, id).one('works').get(params);
    }

    function indexWithCosts(begin, end) {
      return Restangular.one('employees_with_costs').get({
        'begin[period_year]': begin.period_year,
        'begin[period_month]': begin.period_month,
        'end[period_year]': end.period_year,
        'end[period_month]': end.period_month
      });
    }
  }
})();
