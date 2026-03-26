(function () {
  'use strict';
  angular.module('app.api').service('EmployeeCostsService', EmployeeCostsService);

  /** @ngInject */
  function EmployeeCostsService(Restangular) {
    this.createOrUpdateMany = createOrUpdateMany;
    this.index = index;
    this.exportToXLS = exportToXLS;

    var RESOURCE = 'employee_costs';

    function index(params) {
      return Restangular.one(RESOURCE).get(params);
    }
    function createOrUpdateMany(objects) {
      return Restangular.all('save_many_employee_costs').customPOST(objects);
    }
    function exportToXLS(params) {
      return Restangular.one(RESOURCE, 'export_to_xls').customPOST(params);
    }
  }
})();
