(function () {
  'use strict';
  angular.module('app.api').service('WorksService', WorksService);

  /** @ngInject */
  function WorksService(Restangular) {
    this.show = show;
    this.index = index;
    this.create = create;
    this.update = update;
    this.destroy = destroy;
    this.workQuotations = workQuotations;
    this.dailyReports = dailyReports;
    this.exportToXLS = exportToXLS;

    var RESOURCE = 'works';

    function show(id) {
      // var canceler = $q.defer();
      return Restangular.one(RESOURCE, id).get();
    }

    function index(params) {
      return Restangular.one(RESOURCE).get(params);
    }

    function create(object) {
      return Restangular.all(RESOURCE).customPOST(object);
    }

    function update(id, object) {
      return Restangular.one(RESOURCE, id).customPUT(object);
    }

    function destroy(id) {
      return Restangular.one(RESOURCE, id).customDELETE();
    }

    function workQuotations(id, params) {
      return Restangular.one(RESOURCE, id).one('work_quotations').get(params);
    }

    function dailyReports(id, params) {
      return Restangular.one(RESOURCE, id).one('daily_reports').get(params);
    }

    function exportToXLS(params) {
      return Restangular.one(RESOURCE, 'export_to_xls').get(params);
    }
  }

})();
